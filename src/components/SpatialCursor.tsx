import { useEffect, useRef } from 'react';
import { Point2D } from '../types/gestures';

interface SpatialCursorProps {
  active: boolean;
  position: Point2D;
}

/**
 * Floating holographic reticle displayed when the user uses the POINTING gesture.
 * Can also trigger clicks on elements with [data-spatial-clickable="true"] when held steady.
 */
export function SpatialCursor({ active, position }: SpatialCursorProps) {
  const hoverTimerRef = useRef<number | null>(null);
  const lastTargetRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!active) {
      if (hoverTimerRef.current) {
        window.clearTimeout(hoverTimerRef.current);
        hoverTimerRef.current = null;
      }
      lastTargetRef.current = null;
      return;
    }

    const x = position.x * window.innerWidth;
    const y = position.y * window.innerHeight;
    const el = document.elementFromPoint(x, y)?.closest('[data-spatial-clickable="true"]') ?? null;

    if (el !== lastTargetRef.current) {
      if (hoverTimerRef.current) {
        window.clearTimeout(hoverTimerRef.current);
      }
      lastTargetRef.current = el;
      if (el instanceof HTMLElement) {
        hoverTimerRef.current = window.setTimeout(() => {
          el.click();
        }, 700);
      }
    }
  }, [active, position]);

  if (!active) return null;

  return (
    <div
      className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
      style={{
        left: `${position.x * 100}%`,
        top: `${position.y * 100}%`,
      }}
    >
      <div className="relative flex h-9 w-9 items-center justify-center">
        <div className="absolute inset-0 animate-spin rounded-full border border-dashed border-neon-cyan/80" />
        <div className="h-2.5 w-2.5 rounded-full bg-neon-cyan shadow-[0_0_12px_#00f0ff]" />
      </div>
    </div>
  );
}
