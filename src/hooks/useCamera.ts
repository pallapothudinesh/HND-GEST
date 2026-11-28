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
  const requestIdRef = useRef(0);
  const mountedRef = useRef(true);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState<CameraStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    requestIdRef.current += 1;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
    if (mountedRef.current) {
      setStream(null);
      setStatus('idle');
      setErrorMessage(null);
    }
  }, []);

  const startCamera = useCallback(async (): Promise<boolean> => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setStatus('unavailable');
      setErrorMessage('WebRTC camera API is not supported in this browser.');
      return false;
    }

    const requestId = ++requestIdRef.current;

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
          width: { ideal: 480 },
          height: { ideal: 360 },
          frameRate: { ideal: 60, min: 30 },
        },
        audio: false,
      });

      // Discard stream if stopCamera() was called, a newer request started, or unmounted
      if (requestId !== requestIdRef.current || !mountedRef.current) {
        mediaStream.getTracks().forEach((track) => track.stop());
        return false;
      }

      streamRef.current = mediaStream;
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play().catch(() => undefined);
      }

      if (requestId !== requestIdRef.current || !mountedRef.current) {
        return false;
      }

      setStatus('active');
      return true;
    } catch (err) {
      if (requestId !== requestIdRef.current || !mountedRef.current) {
        return false;
      }
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
    mountedRef.current = true;
    const videoEl = videoRef.current;
    return () => {
      mountedRef.current = false;
      requestIdRef.current += 1;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoEl) {
        videoEl.pause();
        videoEl.srcObject = null;
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
