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

type VideoWithRVFC = HTMLVideoElement & {
  requestVideoFrameCallback?: (cb: (now: number) => void) => number;
  cancelVideoFrameCallback?: (handle: number) => void;
};

export function useHandTracking(
  videoRef: React.RefObject<HTMLVideoElement>,
  cameraStatus: CameraStatus,
  enabled: boolean,
  onLandmarks?: (hands: HandLandmark[][]) => void
): UseHandTrackingResult {
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const landmarksRef = useRef<HandLandmark[][]>([]);
  const lastTimestampRef = useRef<number>(0);
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

  // Run zero-latency inference synced to incoming webcam frames via requestVideoFrameCallback (with rAF fallback)
  useEffect(() => {
    if (!enabled || cameraStatus !== 'active' || !modelReady) {
      landmarksRef.current = [];
      onLandmarksRef.current?.([]);
      return;
    }

    const video = videoRef.current as VideoWithRVFC | null;
    if (!video) return;

    let cancelled = false;
    let rafId = 0;
    let rvfcId = 0;
    let lastVideoTime = -1;
    let isInferring = false;

    const runInference = (now: number) => {
      const landmarker = landmarkerRef.current;
      if (!landmarker || video.readyState < 2 || isInferring) return;
      if (video.currentTime === lastVideoTime) return;

      lastVideoTime = video.currentTime;
      isInferring = true;

      try {
        // MediaPipe detectForVideo requires strictly monotonically increasing timestamps
        const ts = now > lastTimestampRef.current ? now : lastTimestampRef.current + 1;
        lastTimestampRef.current = ts;
        const results = landmarker.detectForVideo(video, ts);
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

    if (typeof video.requestVideoFrameCallback === 'function') {
      const onVideoFrame = (now: number) => {
        if (cancelled) return;
        runInference(now);
        if (!cancelled) {
          rvfcId = video.requestVideoFrameCallback!(onVideoFrame);
        }
      };
      rvfcId = video.requestVideoFrameCallback(onVideoFrame);
    } else {
      const loop = (now: number) => {
        if (cancelled) return;
        runInference(now);
        if (!cancelled) {
          rafId = requestAnimationFrame(loop);
        }
      };
      rafId = requestAnimationFrame(loop);
    }

    return () => {
      cancelled = true;
      if (rvfcId && typeof video.cancelVideoFrameCallback === 'function') {
        video.cancelVideoFrameCallback(rvfcId);
        rvfcId = 0;
      }
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
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
