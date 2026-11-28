import { useCallback, useRef, useState } from 'react';
import { GestureType, HandLandmark, HandTrackingState } from '../types/gestures';
import { UniverseInteractionRef } from '../types/scene';
import { GESTURE_LABELS } from '../utils/constants';
import { classifyHandLandmarks, GestureStabilizer } from '../utils/gestureDetection';
import { clamp } from '../utils/smoothing';
import { OneEuroFilter } from '../utils/oneEuroFilter';
import { neuralAudio } from '../utils/sound';

const INITIAL_HAND_STATE: HandTrackingState = {
  isModelLoading: false,
  modelError: null,
  detectedHands: 0,
  gesture: 'NONE',
  gestureLabel: 'STANDBY',
  confidence: 0,
  palmPosition: { x: 0, y: 0 },
  pointerPosition: { x: 0.5, y: 0.5 },
  twoHandDistance: 0.4,
  explosionProgress: 0,
  pinchStrength: 0,
  landmarks: [],
};

const MIN_EXPLOSION_HAND_DIST = 0.18;
const MAX_EXPLOSION_HAND_DIST = 0.62;

export function useGestureRecognition(
  interactionRef: React.MutableRefObject<UniverseInteractionRef>,
  onThumbsUpReset?: () => void
) {
  const [handState, setHandState] = useState<HandTrackingState>(INITIAL_HAND_STATE);
  const onThumbsUpResetRef = useRef(onThumbsUpReset);
  onThumbsUpResetRef.current = onThumbsUpReset;

  const stabilizerRef = useRef(new GestureStabilizer(1, 3));
  const palmXSmoother = useRef(new OneEuroFilter(1.1, 0.028));
  const palmYSmoother = useRef(new OneEuroFilter(1.1, 0.028));
  const pointerXSmoother = useRef(new OneEuroFilter(1.5, 0.04));
  const pointerYSmoother = useRef(new OneEuroFilter(1.5, 0.04));
  const twoHandSmoother = useRef(new OneEuroFilter(1.0, 0.022));
  const lastGestureRef = useRef<GestureType>('NONE');
  const lastUiSyncRef = useRef<number>(0);
  const lastUiHandsRef = useRef<number>(0);
  const lastUiExplosionRef = useRef<number>(0);
  const lastUiPointerRef = useRef<{ x: number; y: number }>({ x: 0.5, y: 0.5 });

  const processLandmarks = useCallback(
    (hands: HandLandmark[][]) => {
      const raw = classifyHandLandmarks(hands);
      const stableGesture = stabilizerRef.current.update(raw.gesture);

      const now = performance.now();
      const smoothPalmX = palmXSmoother.current.filter(raw.palmPosition.x, now);
      const smoothPalmY = palmYSmoother.current.filter(raw.palmPosition.y, now);
      const smoothPointerX = pointerXSmoother.current.filter(raw.pointerPosition.x, now);
      const smoothPointerY = pointerYSmoother.current.filter(raw.pointerPosition.y, now);
      const smoothTwoHand = twoHandSmoother.current.filter(raw.twoHandDistance, now);

      // Tight deadzone around center to eliminate micro-jitter
      const deadzoneX = Math.abs(smoothPalmX) < 0.04 ? 0 : smoothPalmX;
      const deadzoneY = Math.abs(smoothPalmY) < 0.04 ? 0 : smoothPalmY;

      // Update mutable 3D interaction ref at full inference rate (zero React rerenders)
      const target = interactionRef.current;
      target.activeGesture = stableGesture;

      if (hands.length > 0) {
        if (stableGesture === 'CLOSED_FIST') {
          // POSE LOCK: freeze current rotation, elevation & separation so user can rest hand
          target.pinchOffset = { x: 0, y: 0, z: 0 };
        } else if (stableGesture === 'TWO_HANDS') {
          target.pinchOffset = { x: 0, y: 0, z: 0 };
          const mappedScale = clamp(0.6 + (smoothTwoHand - 0.15) * 2.1, 0.55, 2.0);
          target.sphereScale = mappedScale;
          target.particleExpansion = clamp(mappedScale * 1.1, 0.55, 2.1);

          // Continuous real-time component separation [0..1] based on two-hand distance
          const normalizedSep = clamp(
            (smoothTwoHand - MIN_EXPLOSION_HAND_DIST) /
              (MAX_EXPLOSION_HAND_DIST - MIN_EXPLOSION_HAND_DIST),
            0,
            1
          );
          target.explosionProgress = normalizedSep;
          target.handExplosionActive = true;
        } else if (stableGesture === 'PINCH') {
          target.pinchOffset = {
            x: deadzoneX * 2.4,
            y: deadzoneY * 1.8,
            z: 0.45,
          };
          if (lastGestureRef.current !== 'PINCH') {
            neuralAudio.playGesture('interact');
          }
        } else if (stableGesture === 'THUMBS_UP') {
          target.pinchOffset = { x: 0, y: 0, z: 0 };
          if (lastGestureRef.current !== 'THUMBS_UP') {
            onThumbsUpResetRef.current?.();
          }
        } else {
          // OPEN_PALM / POINTING / NONE: smooth 360° orbit & elevation
          target.rotationYaw = deadzoneX * 1.65;
          target.verticalOffset = deadzoneY * 1.25;
          target.pinchOffset = { x: 0, y: 0, z: 0 };
          if (stableGesture === 'OPEN_PALM') {
            target.sphereScale = 1.28;
            target.particleExpansion = 1.45;
            if (lastGestureRef.current !== 'OPEN_PALM') {
              target.wavePulse = now;
              neuralAudio.playGesture('expand');
            }
          } else {
            target.sphereScale = 1.0;
            target.particleExpansion = 1.0;
          }
        }
      } else {
        // Keep current pose when hand leaves frame until user resets or re-engages
        target.pinchOffset = { x: 0, y: 0, z: 0 };
      }

      const gestureChanged = stableGesture !== lastGestureRef.current;
      const handsCountChanged = hands.length !== lastUiHandsRef.current;
      const explosionChanged =
        Math.abs(target.explosionProgress - lastUiExplosionRef.current) >= 0.025;
      const pointerActive = stableGesture === 'POINTING';
      const pointerMoved =
        pointerActive &&
        (Math.abs(smoothPointerX - lastUiPointerRef.current.x) >= 0.008 ||
          Math.abs(smoothPointerY - lastUiPointerRef.current.y) >= 0.008);
      lastGestureRef.current = stableGesture;

      // Throttle React HUD state updates (~16-20Hz or on discrete state changes) while keeping interactionRef at 60fps
      if (
        gestureChanged ||
        handsCountChanged ||
        (explosionChanged && now - lastUiSyncRef.current > 65) ||
        (pointerMoved && now - lastUiSyncRef.current > 50)
      ) {
        lastUiSyncRef.current = now;
        lastUiHandsRef.current = hands.length;
        lastUiExplosionRef.current = target.explosionProgress;
        lastUiPointerRef.current = { x: smoothPointerX, y: smoothPointerY };
        setHandState((prev) => ({
          ...prev,
          detectedHands: hands.length,
          gesture: stableGesture,
          gestureLabel: GESTURE_LABELS[stableGesture] ?? 'STANDBY',
          confidence: raw.confidence,
          palmPosition: { x: smoothPalmX, y: smoothPalmY },
          pointerPosition: { x: smoothPointerX, y: smoothPointerY },
          twoHandDistance: smoothTwoHand,
          explosionProgress: target.explosionProgress,
          pinchStrength: raw.pinchStrength,
          landmarks: [],
        }));
      }
    },
    [interactionRef]
  );

  const resetGestures = useCallback(() => {
    stabilizerRef.current.reset();
    palmXSmoother.current.reset(0);
    palmYSmoother.current.reset(0);
    pointerXSmoother.current.reset(0.5);
    pointerYSmoother.current.reset(0.5);
    twoHandSmoother.current.reset(0.4);
    lastGestureRef.current = 'NONE';
    lastUiSyncRef.current = 0;
    lastUiHandsRef.current = 0;
    lastUiExplosionRef.current = 0;
    lastUiPointerRef.current = { x: 0.5, y: 0.5 };
    setHandState(INITIAL_HAND_STATE);
  }, []);

  return {
    handState,
    processLandmarks,
    resetGestures,
  };
}
