import { useEffect, useRef } from 'react';
import { Camera, CameraOff, Eye, EyeOff, Shield } from 'lucide-react';
import { CameraStatus, HandLandmark } from '../types/gestures';

interface CameraPreviewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  stream: MediaStream | null;
  cameraStatus: CameraStatus;
  errorMessage: string | null;
  isModelLoading: boolean;
  modelError: string | null;
  landmarksRef: React.MutableRefObject<HandLandmark[][]>;
  handDetected: boolean;
  isVisible: boolean;
  onToggleVisible: () => void;
  onStartCamera: () => void;
  onStopCamera: () => void;
}

const HAND_CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17],
];

export function CameraPreview({
  videoRef,
  stream,
  cameraStatus,
  errorMessage,
  isModelLoading,
  modelError,
  landmarksRef,
  handDetected,
  isVisible,
  onToggleVisible,
  onStartCamera,
  onStopCamera,
}: CameraPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Ensure MediaStream is attached even if CameraPreview mounts after startCamera()
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (stream && video.srcObject !== stream) {
      video.srcObject = stream;
      void video.play().catch(() => undefined);
    } else if (!stream && video.srcObject) {
      video.srcObject = null;
    }
  }, [stream, videoRef]);

  // Draw real-time hand skeleton directly from landmarksRef (zero React re-renders!)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!isVisible || cameraStatus !== 'active') {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    let rafId = 0;
    let prevLandmarks: HandLandmark[][] | null = null;

    const draw = () => {
      rafId = requestAnimationFrame(draw);
      const landmarks = landmarksRef.current;
      // Skip redraw if landmarks reference hasn't changed since last painted frame
      if (landmarks === prevLandmarks) return;
      prevLandmarks = landmarks;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (!landmarks || landmarks.length === 0) return;

      const w = canvas.width;
      const h = canvas.height;

      for (let hIdx = 0; hIdx < landmarks.length; hIdx++) {
        const hand = landmarks[hIdx];
        ctx.strokeStyle = hIdx === 0 ? '#00f0ff' : '#a855f7';
        ctx.lineWidth = 1.6;

        // Batch all skeleton connections into a single stroke call
        ctx.beginPath();
        for (let i = 0; i < HAND_CONNECTIONS.length; i++) {
          const [a, b] = HAND_CONNECTIONS[i];
          const p1 = hand[a];
          const p2 = hand[b];
          if (!p1 || !p2) continue;
          ctx.moveTo((1 - p1.x) * w, p1.y * h);
          ctx.lineTo((1 - p2.x) * w, p2.y * h);
        }
        ctx.stroke();

        // Batch regular joints into one fill call, then thumb/index tips into one fill call
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        for (let idx = 0; idx < hand.length; idx++) {
          if (idx === 4 || idx === 8) continue;
          const lm = hand[idx];
          const cx = (1 - lm.x) * w;
          const cy = lm.y * h;
          ctx.moveTo(cx + 2.1, cy);
          ctx.arc(cx, cy, 2.1, 0, Math.PI * 2);
        }
        ctx.fill();

        ctx.fillStyle = '#f472b6';
        ctx.beginPath();
        for (const idx of [4, 8]) {
          const lm = hand[idx];
          if (!lm) continue;
          const r = idx === 8 ? 3.2 : 2.1;
          const cx = (1 - lm.x) * w;
          const cy = lm.y * h;
          ctx.moveTo(cx + r, cy);
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
        }
        ctx.fill();
      }
    };

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, [landmarksRef, isVisible, cameraStatus]);

  return (
    <div className="fixed bottom-28 sm:bottom-14 right-3 sm:right-4 z-30 flex flex-col items-end gap-2">
      {/* Always keep video element mounted so stream stays attached even when preview is hidden */}
      <div
        className={`glass-panel overflow-hidden rounded-xl transition-all duration-300 ${
          handDetected && isVisible
            ? 'ring-2 ring-neon-cyan/70 shadow-[0_0_20px_rgba(0,240,255,0.28)]'
            : ''
        } ${
          isVisible
            ? 'w-40 sm:w-48 opacity-100 scale-100'
            : 'pointer-events-none h-0 w-0 opacity-0 scale-95 border-0'
        }`}
      >
        <div className="relative aspect-[4/3] w-full bg-cosmos-950/90">
          <video
            ref={videoRef}
            playsInline
            muted
            className="h-full w-full -scale-x-100 object-cover opacity-80"
          />
          <canvas
            ref={canvasRef}
            width={224}
            height={168}
            className="pointer-events-none absolute inset-0 h-full w-full"
          />

          {cameraStatus !== 'active' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center">
              <CameraOff className="mb-1.5 h-5 w-5 text-slate-400" />
              <span className="font-mono text-[10px] tracking-wider text-slate-300">
                {cameraStatus === 'requesting'
                  ? 'REQUESTING ACCESS...'
                  : cameraStatus === 'denied'
                  ? 'PERMISSION DENIED'
                  : cameraStatus === 'unavailable'
                  ? 'NO CAMERA FOUND'
                  : 'CAMERA OFFLINE'}
              </span>
            </div>
          )}

          {isModelLoading && cameraStatus === 'active' && (
            <div className="absolute inset-x-0 bottom-0 bg-cosmos-950/80 px-2 py-1 text-center font-mono text-[9px] tracking-widest text-neon-cyan">
              LOADING VISION MODEL...
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-cyan-500/15 px-2.5 py-1.5 text-[10px]">
          <span className="flex items-center gap-1 font-mono text-slate-400">
            <Shield className="h-3 w-3 text-emerald-400" />
            LOCAL ONLY
          </span>
          {cameraStatus === 'active' ? (
            <button
              onClick={onStopCamera}
              className="rounded border border-rose-500/40 bg-rose-500/15 px-2 py-0.5 font-mono text-[9px] tracking-wider text-rose-300 transition hover:bg-rose-500/30"
            >
              STOP CAMERA
            </button>
          ) : (
            <button
              onClick={onStartCamera}
              className="rounded border border-cyan-400/40 bg-cyan-500/15 px-2 py-0.5 font-mono text-[9px] tracking-wider text-cyan-200 transition hover:bg-cyan-500/30"
            >
              ENABLE
            </button>
          )}
        </div>
      </div>

      {/* Error / status pill if needed */}
      {(errorMessage || modelError) && (
        <div className="glass-panel max-w-[230px] rounded-lg border-amber-400/30 px-3 py-1.5 text-[10px] text-amber-200">
          {errorMessage ?? modelError}
        </div>
      )}

      {/* Compact preview & camera toggle controls */}
      <div className="flex items-center gap-2">
        {cameraStatus === 'active' ? (
          <button
            onClick={onStopCamera}
            title="Stop Camera"
            className="glass-panel flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-[10px] tracking-wider text-rose-300 transition hover:border-rose-400/50 hover:text-rose-200"
          >
            <CameraOff className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">STOP CAM</span>
          </button>
        ) : (
          <button
            onClick={onStartCamera}
            title="Start Camera"
            className="glass-panel flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-[10px] tracking-wider text-cyan-200 transition hover:border-cyan-400/60"
          >
            <Camera className="h-3.5 w-3.5 text-neon-cyan" />
            <span className="hidden sm:inline">START CAM</span>
          </button>
        )}

        <button
          onClick={onToggleVisible}
          title={isVisible ? 'Hide Webcam Preview' : 'Show Webcam Preview'}
          className="glass-panel flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-[10px] tracking-wider text-slate-200 transition hover:border-cyan-400/50 hover:text-cyan-200"
        >
          {isVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          <span className="hidden sm:inline">{isVisible ? 'HIDE' : 'PREVIEW'}</span>
        </button>
      </div>
    </div>
  );
}
