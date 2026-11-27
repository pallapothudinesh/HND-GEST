import { useCallback, useRef, useState } from 'react';
import { GestureType, HandLandmark, HandTrackingState } from '../types/gestures';
import { UniverseInteractionRef } from '../types/scene';
import { GESTURE_LABELS } from '../utils/constants';
import { classifyHandLandmarks, GestureStabilizer } from '../utils/gestureDetection';
import { clamp, ValueSmoother } from '../utils/smoothing';
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

  const stabilizerRef = useRef(new GestureStabilizer(4));
  const palmXSmoother = useRef(new ValueSmoother(0, 0.22));
  const palmYSmoother = useRef(new ValueSmoother(0, 0.22));
  const pointerXSmoother = useRef(new ValueSmoother(0.5, 0.3));
  const pointerYSmoother = useRef(new ValueSmoother(0.5, 0.3));
  const twoHandSmoother = useRef(new ValueSmoother(0.4, 0.16));
  const lastGestureRef = useRef<GestureType>('NONE');
  const lastUiSyncRef = useRef<number>(0);
  const lastUiHandsRef = useRef<number>(0);
  const lastUiExplosionRef = useRef<number>(0);

  const processLandmarks = useCallback(
    (hands: HandLandmark[][]) => {
      const raw = classifyHandLandmarks(hands);
      const stableGesture = stabilizerRef.current.update(raw.gesture);

      const smoothPalmX = palmXSmoother.current.update(raw.palmPosition.x);
      const smoothPalmY = palmYSmoother.current.update(raw.palmPosition.y);
      const smoothPointerX = pointerXSmoother.current.update(raw.pointerPosition.x);
      const smoothPointerY = pointerYSmoother.current.update(raw.pointerPosition.y);
      const smoothTwoHand = twoHandSmoother.current.update(raw.twoHandDistance);

      // Deadzone around center to eliminate micro-jitter
      const deadzoneX = Math.abs(smoothPalmX) < 0.08 ? 0 : smoothPalmX;
      const deadzoneY = Math.abs(smoothPalmY) < 0.08 ? 0 : smoothPalmY;

      // Update mutable 3D interaction ref at full inference rate (zero React rerenders)
      const target = interactionRef.current;
      target.activeGesture = stableGesture;

      if (hands.length > 0) {
        // Left/Right & Up/Down palm movement
        target.rotationYaw = deadzoneX * 1.45;
        target.verticalOffset = deadzoneY * 1.35;

        if (stableGesture === 'OPEN_PALM') {
          target.sphereScale = 1.42;
          target.particleExpansion = 1.65;
          if (lastGestureRef.current !== 'OPEN_PALM') {
            target.wavePulse = performance.now();
            neuralAudio.playGesture('expand');
          }
        } else if (stableGesture === 'CLOSED_FIST') {
          target.sphereScale = 0.62;
          target.particleExpansion = 0.48;
          if (lastGestureRef.current !== 'CLOSED_FIST') {
            neuralAudio.playGesture('contract');
          }
        } else if (stableGesture === 'TWO_HANDS') {
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
          if (lastGestureRef.current !== 'THUMBS_UP') {
            onThumbsUpResetRef.current?.();
          }
        } else {
          // Return pinch offset gently when not pinching
          target.pinchOffset = { x: 0, y: 0, z: 0 };
          if (stableGesture === 'NONE' || stableGesture === 'POINTING') {
            target.sphereScale = 1.0;
            target.particleExpansion = 1.0;
          }
        }
      } else {
        target.rotationYaw = 0;
        target.verticalOffset = 0;
        target.pinchOffset = { x: 0, y: 0, z: 0 };
        target.sphereScale = 1.0;
        target.particleExpansion = 1.0;
      }

      const gestureChanged = stableGesture !== lastGestureRef.current;
      const handsCountChanged = hands.length !== lastUiHandsRef.current;
      const explosionChanged =
        Math.abs(target.explosionProgress - lastUiExplosionRef.current) >= 0.02;
      const pointerActive = stableGesture === 'POINTING';
      lastGestureRef.current = stableGesture;

      const now = performance.now();
      // Only trigger React HUD state updates when meaningful UI state changes (prevents 12Hz full-app rerenders!)
      if (
        gestureChanged ||
        handsCountChanged ||
        (explosionChanged && now - lastUiSyncRef.current > 85) ||
        (pointerActive && now - lastUiSyncRef.current > 65)
      ) {
        lastUiSyncRef.current = now;
        lastUiHandsRef.current = hands.length;
        lastUiExplosionRef.current = target.explosionProgress;
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
    twoHandSmoother.current.reset(0.4);
    lastGestureRef.current = 'NONE';
    setHandState(INITIAL_HAND_STATE);
  }, []);

  return {
    handState,
    processLandmarks,
    resetGestures,
  };
}
