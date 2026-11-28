import { motion } from 'framer-motion';
import { ArrowRight, Camera, Cpu, Hand, Layers, Lock, MousePointerClick } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { HndGestLogo } from './HndGestLogo';
import { ThemeSwitcher } from './ThemeSwitcher';

interface LandingScreenProps {
  onStartExperience: () => void;
  onStartMouseOnly: () => void;
}

const CAPABILITIES = [
  {
    icon: Hand,
    title: 'Zero-Latency Vision',
    detail: '1-Euro adaptive filtering synced to 60fps camera frames',
  },
  {
    icon: Lock,
    title: 'Closed-Fist Pose Lock',
    detail: 'Freeze any viewing angle or separation state effortlessly',
  },
  {
    icon: Layers,
    title: '51-Part Exploded View',
    detail: 'Spread two hands to separate components continuously',
  },
  {
    icon: Cpu,
    title: 'Multi-Lab Studio',
    detail: 'Realistic PBR Supercar, Jet Engine, Workstation & ISS Spacecraft',
  },
];

export function LandingScreen({
  onStartExperience,
  onStartMouseOnly,
}: LandingScreenProps) {
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === 'light';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-30 flex items-center justify-center md:justify-start px-4 sm:px-10 md:px-16 py-12 pointer-events-none"
    >
      {/* Top-right Theme Switcher */}
      <div className="pointer-events-auto fixed right-4 top-4 z-40">
        <ThemeSwitcher />
      </div>

      {/* Editorial gradient scrim so the 3D Supercar Studio shines on the right */}
      <div
        className={`pointer-events-none absolute inset-0 ${
          isLight
            ? 'bg-gradient-to-r from-[#f4f6fa]/95 via-[#f4f6fa]/70 to-transparent'
            : 'bg-gradient-to-r from-[#090b10]/92 via-[#090b10]/65 to-transparent'
        }`}
      />

      {/* Modern Studio Launch Card */}
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.08 }}
        className="pointer-events-auto relative z-10 w-full max-w-xl glass-panel-strong rounded-3xl p-6 sm:p-8 md:p-9"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-cosmos-950/60 px-3.5 py-1.5">
            <HndGestLogo size="sm" />
            <span className="font-display text-xs font-bold tracking-[0.2em] text-white">
              HND GEST
            </span>
          </div>
          <span className="font-mono text-[10px] tracking-[0.18em] text-neon-cyan uppercase">
            SPATIAL STUDIO
          </span>
        </div>

        <h1 className="mt-6 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-[1.1]">
          Control 3D Worlds{' '}
          <span className="text-neon-cyan">With Your Hands.</span>
        </h1>

        <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-300">
          Inspect realistic PBR vehicles, aerospace propulsion, workstation hardware, and
          orbital spacecraft using local real-time webcam hand tracking—zero uploads, zero clutter.
        </p>

        {/* 2x2 Capability Grid */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {CAPABILITIES.map((cap) => {
            const Icon = cap.icon;
            return (
              <div
                key={cap.title}
                className="rounded-2xl border border-white/10 bg-cosmos-950/55 p-3 transition hover:border-sky-400/35"
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-neon-cyan shrink-0" />
                  <span className="text-xs font-semibold text-white">{cap.title}</span>
                </div>
                <p className="mt-1 text-[11px] leading-snug text-slate-400">
                  {cap.detail}
                </p>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="mt-7 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={onStartExperience}
            className="group inline-flex flex-1 items-center justify-center gap-2.5 rounded-2xl bg-sky-500 px-6 py-3.5 text-sm font-semibold text-slate-950 shadow-[0_8px_28px_rgba(56,189,248,0.32)] transition-all hover:bg-sky-400 hover:scale-[1.01] active:scale-[0.99]"
          >
            <Camera className="h-4 w-4" />
            <span>Launch Camera Studio</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>

          <button
            onClick={onStartMouseOnly}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-5 py-3.5 text-xs font-medium text-slate-200 transition hover:border-sky-400/50 hover:text-white"
          >
            <MousePointerClick className="h-4 w-4 text-neon-cyan" />
            <span>Mouse / Touch</span>
          </button>
        </div>

        <p className="mt-4 font-mono text-[10px] tracking-wider text-slate-400">
          Camera permission is requested only after clicking Launch. 100% local in-browser MediaPipe vision.
        </p>
      </motion.section>
    </motion.div>
  );
}
