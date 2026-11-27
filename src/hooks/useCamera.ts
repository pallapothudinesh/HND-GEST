import { useCallback, useEffect, useRef, useState } from 'react';
import { CameraStatus } from '../types/gestures';

export interface UseCameraResult {
  videoRef: React.RefObject<HTMLVideoElement>;
  stream: MediaStream | null;
  status: CameraStatus;
  errorMessage: string | null;
  startCamera: () => Promise<boolean>;
  stopCamera: () => void;
}

export function useCamera(): UseCameraResult {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState<CameraStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStream(null);
    setStatus('idle');
    setErrorMessage(null);
  }, []);

  const startCamera = useCallback(async (): Promise<boolean> => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setStatus('unavailable');
      setErrorMessage('WebRTC camera API is not supported in this browser.');
      return false;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    setStatus('requesting');
    setErrorMessage(null);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30, max: 30 },
        },
        audio: false,
      });

      streamRef.current = mediaStream;
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play().catch(() => undefined);
      }

      setStatus('active');
      return true;
    } catch (err) {
      const name = err instanceof Error ? err.name : '';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setStatus('denied');
        setErrorMessage('Camera access was denied. You can still explore using mouse & touch.');
      } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
        setStatus('unavailable');
        setErrorMessage('No webcam detected. Switching to spatial mouse & touch mode.');
      } else {
        setStatus('error');
        setErrorMessage(
          err instanceof Error
            ? `Unable to initialize camera: ${err.message}`
            : 'Unable to initialize camera.'
        );
      }
      return false;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  return {
    videoRef,
    stream,
    status,
    errorMessage,
    startCamera,
    stopCamera,
  };
}
