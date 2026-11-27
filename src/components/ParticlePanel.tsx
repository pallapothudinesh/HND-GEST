import { motion } from 'framer-motion';
import { RotateCcw, Sparkles } from 'lucide-react';
import { ParticleMode } from '../types/scene';
import { PARTICLE_MODES } from '../utils/constants';

interface ParticlePanelProps {
  particleMode: ParticleMode;
  onSelectMode: (mode: ParticleMode) => void;
  onExpandPulse: () => void;
  onResetField: () => void;
}

export function ParticlePanel({
  particleMode,
  onSelectMode,
  onExpandPulse,
  onResetField,
}: ParticlePanelProps) {
  return (
    <motion.aside
      initial={{ opacity: 0, x: 28 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 28 }}
      transition={{ duration: 0.28 }}
      className="fixed right-3 sm:right-5 top-28 sm:top-24 z-30 w-[calc(100vw-1.5rem)] max-w-xs"
    >
      <div className="glass-panel-strong rounded-2xl p-4">
        <div className="mb-3 flex items-center gap-2 border-b border-cyan-500/20 pb-2.5">
          <Sparkles className="h-4 w-4 text-neon-cyan" />
          <div>
            <h2 className="font-display text-xs font-bold tracking-[0.2em] text-white">
              PARTICLE MATRIX
            </h2>
            <p className="font-mono text-[10px] text-slate-400">
              FORMATION & FIELD TOPOLOGY
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {PARTICLE_MODES.map((m) => {
            const active = particleMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => onSelectMode(m.id)}
                className={`rounded-xl border px-3 py-2.5 text-left transition-all ${
                  active
                    ? 'border-cyan-400/70 bg-cyan-400/18 shadow-[0_0_18px_rgba(0,240,255,0.22)]'
                    : 'border-white/10 bg-white/[0.03] hover:border-cyan-400/40'
                }`}
              >
                <div className="font-display text-xs font-semibold tracking-[0.15em] text-white">
                  {m.label}
                </div>
                <div className="mt-1 text-[10px] leading-snug text-slate-400">
                  {m.description}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex gap-2">
          <button
            onClick={onExpandPulse}
            className="flex-1 rounded-xl border border-cyan-400/40 bg-cyan-500/15 py-2 font-display text-[10px] font-semibold tracking-[0.16em] text-cyan-100 transition hover:bg-cyan-500/25"
          >
            ENERGY PULSE
          </button>
          <button
            onClick={onResetField}
            className="flex items-center justify-center gap-1 rounded-xl border border-white/15 bg-white/5 px-3 py-2 font-mono text-[10px] text-slate-300 transition hover:border-cyan-400/40 hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            RESET
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
