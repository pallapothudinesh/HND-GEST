import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftRight,
  ArrowUpDown,
  Expand,
  Grab,
  Hand,
  MousePointerClick,
  Minimize2,
  X,
} from 'lucide-react';
import { GestureType } from '../types/gestures';
import { GESTURE_GUIDE_ITEMS } from '../utils/constants';

interface GestureGuideProps {
  visible: boolean;
  currentGesture: GestureType;
  onClose: () => void;
}

function getGestureIcon(key: string) {
  switch (key) {
    case 'OPEN_PALM':
      return Expand;
    case 'CLOSED_FIST':
      return Minimize2;
    case 'PINCH':
      return Grab;
    case 'MOVE_X':
      return ArrowLeftRight;
    case 'MOVE_Y':
      return ArrowUpDown;
    case 'TWO_HANDS':
      return Hand;
    case 'POINTING':
    default:
      return MousePointerClick;
  }
}

export function GestureGuide({
  visible,
  currentGesture,
  onClose,
}: GestureGuideProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.28 }}
          className="fixed left-3 sm:left-5 top-28 sm:top-24 z-30 w-[calc(100vw-1.5rem)] max-w-xs sm:max-w-[290px]"
        >
          <div className="glass-panel-strong rounded-2xl p-4">
            <div className="mb-3 flex items-center justify-between border-b border-cyan-500/20 pb-2.5">
              <div>
                <h2 className="font-display text-xs font-bold tracking-[0.2em] text-neon-cyan">
                  GESTURE MATRIX
                </h2>
                <p className="font-mono text-[10px] text-slate-400">
                  REAL-TIME SPATIAL COMMANDS
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close Gesture Guide"
                className="rounded-lg p-1 text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[48vh] space-y-2 overflow-y-auto pr-1">
              {GESTURE_GUIDE_ITEMS.map((item) => {
                const Icon = getGestureIcon(item.gesture);
                const isActive = currentGesture === item.gesture;
                return (
                  <div
                    key={item.gesture}
                    className={`flex items-start gap-2.5 rounded-xl border px-2.5 py-2 transition-all ${
                      isActive
                        ? 'border-cyan-400/70 bg-cyan-400/15 shadow-[0_0_16px_rgba(0,240,255,0.2)]'
                        : 'border-white/5 bg-white/[0.02]'
                    }`}
                  >
                    <div
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${
                        isActive
                          ? 'border-cyan-400/60 bg-cyan-400/20 text-neon-cyan'
                          : 'border-cyan-500/20 bg-cosmos-900/70 text-cyan-300'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-display text-[10px] font-semibold tracking-[0.12em] text-white">
                          {item.title}
                        </span>
                        <span className="font-mono text-[9px] tracking-wider text-neon-cyan">
                          {item.action}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] leading-snug text-slate-300/80">
                        {item.detail}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
