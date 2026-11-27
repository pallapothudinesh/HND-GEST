import { motion } from 'framer-motion';
import { Camera, Hand, ShieldCheck } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { HndGestLogo } from './HndGestLogo';
import { ThemeSwitcher } from './ThemeSwitcher';

interface LandingScreenProps {
  onStartExperience: () => void;
  onStartMouseOnly: () => void;
}

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
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-30 flex flex-col items-center justify-center px-4 py-12 text-center pointer-events-none"
    >
      {/* Top-right Theme Switcher on Welcome Screen */}
      <div className="pointer-events-auto fixed right-4 top-4 z-40">
        <ThemeSwitcher />
      </div>

      {/* Subtle radial vignette for text legibility over the 3D sphere */}
      <div
        className={`pointer-events-none absolute inset-0 ${
          isLight
            ? 'bg-[radial-gradient(circle_at_center,rgba(245,247,251,0.3)_0%,rgba(245,247,251,0.82)_75%)]'
            : 'bg-[radial-gradient(circle_at_center,rgba(2,4,10,0.22)_0%,rgba(2,4,10,0.78)_75%)]'
        }`}
      />

      <div className="relative z-10 flex max-w-3xl flex-col items-center">
        {/* Top pill badge */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-cyan-400/35 bg-cosmos-900/75 px-4 py-1.5 backdrop-blur-md"
        >
          <HndGestLogo size="sm" />
          <span className="font-mono text-[11px] tracking-[0.22em] text-cyan-200 uppercase">
            HND = HAND · GEST = GESTURE
          </span>
        </motion.div>

        {/* Main Brand Title */}
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-display text-4xl sm:text-6xl md:text-7xl font-black tracking-[0.2em] text-white neon-text-cyan leading-tight"
        >
          HND GEST
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.32 }}
          className="mt-3 max-w-xl font-display text-xs sm:text-base font-semibold tracking-[0.18em] text-cyan-200/95 uppercase"
        >
          CONTROL THE DIGITAL WORLD WITH YOUR HANDS.
        </motion.p>

        {/* Small Description */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.42 }}
          className="mt-2.5 max-w-lg text-xs sm:text-sm text-slate-300/85"
        >
          Real-time webcam hand tracking, spatial 3D robotics, automotive &amp; cosmic exploration powered by AI vision.
        </motion.p>

        {/* Primary CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.52 }}
          className="pointer-events-auto mt-8 flex flex-col items-center gap-3"
        >
          <button
            onClick={onStartExperience}
            className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-cyan-400/70 bg-cyan-500/15 px-8 py-4 font-display text-sm sm:text-base font-bold tracking-[0.22em] text-white shadow-[0_0_32px_rgba(0,240,255,0.3)] transition-all duration-300 hover:scale-105 hover:border-cyan-300 hover:bg-cyan-400/25 hover:shadow-[0_0_48px_rgba(0,240,255,0.5)] active:scale-95"
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-cyan-300/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            <Hand className="h-5 w-5 text-neon-cyan transition-transform duration-300 group-hover:rotate-12" />
            <span>START EXPERIENCE</span>
          </button>

          <button
            onClick={onStartMouseOnly}
            className="font-mono text-[11px] tracking-[0.18em] text-slate-400 underline-offset-4 transition-colors hover:text-cyan-300 hover:underline"
          >
            OR ENTER WITHOUT CAMERA (MOUSE / TOUCH MODE)
          </button>
        </motion.div>

        {/* Camera & Gesture Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.65 }}
          className="mt-8 grid w-full max-w-xl grid-cols-1 gap-3 sm:grid-cols-2 text-left"
        >
          <div className="glass-panel rounded-xl px-4 py-3 flex items-start gap-3">
            <Camera className="mt-0.5 h-4 w-4 shrink-0 text-neon-cyan" />
            <div>
              <div className="font-display text-[11px] tracking-[0.16em] text-cyan-200">
                WEBCAM PERMISSION
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-300/85">
                Camera access is requested only after you click START EXPERIENCE.
              </p>
            </div>
          </div>

          <div className="glass-panel rounded-xl px-4 py-3 flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-violet-400" />
            <div>
              <div className="font-display text-[11px] tracking-[0.16em] text-violet-200">
                LOCAL VISION ENGINE
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-300/85">
                Hand gestures are processed 100% locally in your browser. Zero footage is stored or uploaded.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
