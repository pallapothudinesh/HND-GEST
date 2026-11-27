import { motion } from 'framer-motion';
import { Cpu, Hand, Layers, X } from 'lucide-react';

interface AboutPanelProps {
  onClose: () => void;
}

export function AboutPanel({ onClose }: AboutPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-40 flex items-center justify-center bg-cosmos-950/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-panel-strong relative w-full max-w-lg rounded-2xl p-6 sm:p-7"
      >
        <button
          onClick={onClose}
          aria-label="Close About Panel"
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="font-mono text-[10px] tracking-[0.24em] text-neon-cyan">
          HND GEST // HND = HAND · GEST = GESTURE
        </div>
        <h2 className="mt-1.5 font-display text-xl sm:text-2xl font-bold tracking-[0.14em] text-white neon-text-cyan">
          CONTROL THE DIGITAL WORLD WITH YOUR HANDS
        </h2>

        <p className="mt-3 text-sm leading-relaxed text-slate-300">
          HND GEST is an interactive spatial computing workspace exploring real-time
          webcam hand tracking, 3D robotics, automotive engineering, and immersive environments.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-cyan-500/20 bg-cosmos-950/60 p-3">
            <Cpu className="h-4 w-4 text-neon-cyan" />
            <div className="mt-2 font-display text-[11px] font-semibold tracking-wider text-white">
              3D ENGINE
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              React Three Fiber, Three.js & custom particle topologies.
            </p>
          </div>
          <div className="rounded-xl border border-violet-500/20 bg-cosmos-950/60 p-3">
            <Hand className="h-4 w-4 text-violet-400" />
            <div className="mt-2 font-display text-[11px] font-semibold tracking-wider text-white">
              VISION AI
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              MediaPipe Tasks Vision running 100% locally in WebAssembly/GPU.
            </p>
          </div>
          <div className="rounded-xl border border-blue-500/20 bg-cosmos-950/60 p-3">
            <Layers className="h-4 w-4 text-blue-400" />
            <div className="mt-2 font-display text-[11px] font-semibold tracking-wider text-white">
              SPATIAL HUD
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Glassmorphic controls with full mouse & touch fallback.
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-cyan-500/15 pt-4">
          <span className="font-mono text-[11px] tracking-[0.2em] text-cyan-200/90">
            ✦ CREATED BY DINESH ✦
          </span>
          <button
            onClick={onClose}
            className="rounded-full border border-cyan-400/50 bg-cyan-500/15 px-4 py-1.5 font-display text-[10px] font-semibold tracking-[0.18em] text-white transition hover:bg-cyan-500/30"
          >
            CLOSE
          </button>
        </div>
      </div>
    </motion.div>
  );
}
