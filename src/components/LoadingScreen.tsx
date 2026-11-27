import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  visible: boolean;
  message?: string;
}

export function LoadingScreen({
  visible,
  message = 'CALIBRATING HND GEST VISION ENGINE...',
}: LoadingScreenProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-cosmos-950/55 backdrop-blur-sm"
        >
          <div className="glass-panel-strong flex flex-col items-center rounded-2xl px-8 py-6 text-center">
            <div className="relative h-12 w-12">
              <div className="absolute inset-0 animate-spin rounded-full border-2 border-cyan-400/20 border-t-neon-cyan" />
              <div className="absolute inset-2 animate-spin rounded-full border-2 border-violet-400/20 border-b-violet-400 [animation-direction:reverse]" />
            </div>
            <p className="mt-4 font-display text-xs tracking-[0.22em] text-cyan-100">
              {message}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
