import { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { CameraStatus, HandLandmark } from '../types/gestures';
import { HAND_LANDMARKER_MODEL_URL, MEDIAPIPE_WASM_URL } from '../utils/constants';

export interface UseHandTrackingResult {
  landmarksRef: React.MutableRefObject<HandLandmark[][]>;
  isModelLoading: boolean;
  modelReady: boolean;
  modelError: string | null;
}

const BASE_INFERENCE_INTERVAL_MS = 60; // ~16.6 FPS cap so Three.js keeps 60fps headroom

export function useHandTracking(
  videoRef: React.RefObject<HTMLVideoElement>,
  cameraStatus: CameraStatus,
  enabled: boolean,
  onLandmarks?: (hands: HandLandmark[][]) => void
): UseHandTrackingResult {
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const landmarksRef = useRef<HandLandmark[][]>([]);
  const onLandmarksRef = useRef(onLandmarks);
  onLandmarksRef.current = onLandmarks;

  const [isModelLoading, setIsModelLoading] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);

  // Lazy-load MediaPipe HandLandmarker only when enabled
  useEffect(() => {
    if (!enabled) return;
    if (landmarkerRef.current) return;

    let cancelled = false;
    setIsModelLoading(true);
    setModelError(null);

    (async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_URL);
        let handLandmarker: HandLandmarker;
        try {
          handLandmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: HAND_LANDMARKER_MODEL_URL,
              delegate: 'GPU',
            },
            runningMode: 'VIDEO',
            numHands: 2,
            minHandDetectionConfidence: 0.55,
            minHandPresenceConfidence: 0.55,
            minTrackingConfidence: 0.55,
          });
        } catch {
          // Automatic CPU fallback if GPU WebGL delegate is unavailable
          handLandmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: HAND_LANDMARKER_MODEL_URL,
              delegate: 'CPU',
            },
            runningMode: 'VIDEO',
            numHands: 2,
            minHandDetectionConfidence: 0.55,
            minHandPresenceConfidence: 0.55,
            minTrackingConfidence: 0.55,
          });
        }

        if (cancelled) {
          handLandmarker.close();
          return;
        }

        landmarkerRef.current = handLandmarker;
        setModelReady(true);
      } catch (err) {
        if (!cancelled) {
          setModelError(
            err instanceof Error
              ? `Hand tracking model failed to load: ${err.message}`
              : 'Hand tracking model failed to load.'
          );
        }
      } finally {
        if (!cancelled) {
          setIsModelLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  // Run inference loop when camera is active and model is ready
  useEffect(() => {
    if (!enabled || cameraStatus !== 'active' || !modelReady) {
      landmarksRef.current = [];
      onLandmarksRef.current?.([]);
      return;
    }

    let rafId = 0;
    let lastInferenceTime = 0;
    let lastVideoTime = -1;
    let dynamicInterval = BASE_INFERENCE_INTERVAL_MS;
    let isInferring = false;

    const processFrame = (now: number) => {
      rafId = requestAnimationFrame(processFrame);

      if (isInferring) return;
      const video = videoRef.current;
      const landmarker = landmarkerRef.current;
      if (!video || !landmarker || video.readyState < 2) return;

      if (now - lastInferenceTime < dynamicInterval) return;
      if (video.currentTime === lastVideoTime) return;

      lastInferenceTime = now;
      lastVideoTime = video.currentTime;
      isInferring = true;

      try {
        const t0 = performance.now();
        const results = landmarker.detectForVideo(video, now);
        const elapsed = performance.now() - t0;
        // Adaptive backoff if MediaPipe inference is heavy on this device
        dynamicInterval = elapsed > 26 ? 90 : BASE_INFERENCE_INTERVAL_MS;

        const hands: HandLandmark[][] = (results.landmarks ?? []).map((hand) =>
          hand.map((lm) => ({ x: lm.x, y: lm.y, z: lm.z }))
        );
        landmarksRef.current = hands;
        onLandmarksRef.current?.(hands);
      } catch {
        // Ignore transient frame errors during camera teardown
      } finally {
        isInferring = false;
      }
    };

    rafId = requestAnimationFrame(processFrame);
    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [enabled, cameraStatus, modelReady, videoRef]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (landmarkerRef.current) {
        landmarkerRef.current.close();
        landmarkerRef.current = null;
      }
    };
  }, []);

  return {
    landmarksRef,
    isModelLoading,
    modelReady,
    modelError,
  };
}
