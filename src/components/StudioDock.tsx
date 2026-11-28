import { motion } from 'framer-motion';
import { Car, RotateCcw } from 'lucide-react';
import { HandTrackingState } from '../types/gestures';
import { WorldId } from '../types/worlds';

interface StudioDockProps {
  activeWorld: WorldId;
  handState: HandTrackingState;
  exploded: boolean;
  explosionProgress: number;
  interiorView: boolean;
  onSetExploded: (val: boolean) => void;
  onExplosionSliderChange: (val: number) => void;
  onToggleInterior: () => void;
  onReset: () => void;
}

export function StudioDock({
  activeWorld,
  handState,
  exploded,
  explosionProgress,
  interiorView,
  onSetExploded,
  onExplosionSliderChange,
  onToggleInterior,
  onReset,
}: StudioDockProps) {
  const supportsExplode =
    activeWorld === 'automotive' ||
    activeWorld === 'jet_engine' ||
    activeWorld === 'laptop' ||
    activeWorld === 'engineering' ||
    activeWorld === 'satellite';

  const isGestureActive = handState.gesture !== 'NONE';
  const pct = Math.round(explosionProgress * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="pointer-events-auto fixed bottom-14 left-1/2 z-30 w-[calc(100vw-1.5rem)] max-w-2xl -translate-x-1/2"
    >
      <div className="glass-panel flex flex-wrap items-center justify-between gap-2 rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5">
        {/* Live Gesture Pill */}
        <div className="flex items-center gap-2 pr-1">
          <span
            className={`h-2 w-2 rounded-full transition-colors ${
              isGestureActive ? 'bg-neon-cyan shadow-[0_0_8px_#00f0ff]' : 'bg-slate-500'
            }`}
          />
          <span className="font-mono text-[10px] font-semibold tracking-[0.14em] text-cyan-100">
            {handState.gestureLabel}
          </span>
        </div>

        {/* Exploded View Toggle + Continuous 0-100% Slider */}
        {supportsExplode && (
          <div className="flex flex-1 items-center justify-center gap-2 min-w-[200px]">
            <div className="inline-flex rounded-full border border-white/10 bg-cosmos-950/60 p-0.5">
              <button
                type="button"
                onClick={() => onSetExploded(false)}
                className={`rounded-full px-2.5 py-1 font-display text-[9px] font-semibold tracking-wider transition ${
                  !exploded && pct < 50
                    ? 'bg-cyan-400/25 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ASSEMBLED
              </button>
              <button
                type="button"
                onClick={() => onSetExploded(true)}
                className={`rounded-full px-2.5 py-1 font-display text-[9px] font-semibold tracking-wider transition ${
                  exploded || pct >= 50
                    ? 'bg-cyan-400/25 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                EXPLODED
              </button>
            </div>

            <div className="flex flex-1 max-w-[140px] items-center gap-2">
              <input
                type="range"
                min={0}
                max={100}
                aria-label="Exploded view separation"
                value={pct}
                onChange={(e) => onExplosionSliderChange(Number(e.target.value) / 100)}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-700/60 accent-cyan-400"
              />
              <span className="w-8 text-right font-mono text-[10px] font-semibold text-neon-cyan">
                {pct}%
              </span>
            </div>
          </div>
        )}

        {/* Contextual Exhibit Actions */}
        <div className="flex items-center gap-1.5">
          {activeWorld === 'automotive' && (
            <button
              type="button"
              onClick={onToggleInterior}
              title="Toggle Interior Cockpit (C)"
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 font-display text-[9px] font-semibold tracking-wider transition ${
                interiorView
                  ? 'border-cyan-400/70 bg-cyan-400/20 text-white'
                  : 'border-white/15 bg-white/5 text-slate-300 hover:border-cyan-400/40 hover:text-white'
              }`}
            >
              <Car className="h-3.5 w-3.5 text-neon-cyan" />
              <span>{interiorView ? 'EXTERIOR' : 'COCKPIT'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onReset}
            title="Reset View & Model (R)"
            className="flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 font-mono text-[9px] text-slate-300 transition hover:border-cyan-400/50 hover:text-white"
          >
            <RotateCcw className="h-3 w-3" />
            <span className="hidden sm:inline">RESET</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
