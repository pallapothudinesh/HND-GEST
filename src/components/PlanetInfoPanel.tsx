import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Globe2, Sparkles } from 'lucide-react';
import { PlanetData } from '../types/scene';
import { PLANETS } from '../utils/constants';

interface PlanetInfoPanelProps {
  selectedPlanet: PlanetData | null;
  showDirectory: boolean;
  onSelectPlanet: (id: string) => void;
  onReturnToUniverse: () => void;
}

export function PlanetInfoPanel({
  selectedPlanet,
  showDirectory,
  onSelectPlanet,
  onReturnToUniverse,
}: PlanetInfoPanelProps) {
  return (
    <AnimatePresence mode="wait">
      {selectedPlanet ? (
        <motion.aside
          key={selectedPlanet.id}
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 28 }}
          transition={{ duration: 0.3 }}
          className="fixed right-3 sm:right-5 top-28 sm:top-24 z-30 w-[calc(100vw-1.5rem)] max-w-xs sm:max-w-sm"
        >
          <div className="glass-panel-strong rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] tracking-[0.22em] text-cyan-300">
                PLANETARY TELEMETRY
              </span>
              <span
                className="h-3 w-3 rounded-full shadow-[0_0_12px_currentColor]"
                style={{ backgroundColor: selectedPlanet.color, color: selectedPlanet.color }}
              />
            </div>

            <h2 className="mt-2 font-display text-2xl font-bold tracking-[0.18em] text-white neon-text-cyan">
              {selectedPlanet.name}
            </h2>
            <p className="font-mono text-[10px] tracking-[0.18em] text-violet-300">
              {selectedPlanet.classification}
            </p>

            <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-300">
              {selectedPlanet.description}
            </p>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {selectedPlanet.stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-cyan-500/15 bg-cosmos-950/60 p-2 text-center"
                >
                  <div className="font-mono text-[8px] tracking-wider text-slate-400">
                    {stat.label}
                  </div>
                  <div className="mt-1 font-display text-[11px] font-semibold text-cyan-200">
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={onReturnToUniverse}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-400/50 bg-cyan-500/15 px-4 py-2.5 font-display text-xs font-semibold tracking-[0.18em] text-white transition hover:bg-cyan-400/25 hover:shadow-[0_0_20px_rgba(0,240,255,0.3)]"
            >
              <ArrowLeft className="h-4 w-4 text-neon-cyan" />
              RETURN TO UNIVERSE
            </button>
          </div>
        </motion.aside>
      ) : showDirectory ? (
        <motion.aside
          key="planet-directory"
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 28 }}
          transition={{ duration: 0.3 }}
          className="fixed right-3 sm:right-5 top-28 sm:top-24 z-30 w-[calc(100vw-1.5rem)] max-w-xs"
        >
          <div className="glass-panel-strong rounded-2xl p-4">
            <div className="mb-3 flex items-center gap-2 border-b border-cyan-500/20 pb-2.5">
              <Globe2 className="h-4 w-4 text-neon-cyan" />
              <div>
                <h2 className="font-display text-xs font-bold tracking-[0.2em] text-white">
                  HOLOGRAPHIC PLANETS
                </h2>
                <p className="font-mono text-[10px] text-slate-400">
                  SELECT AN ORBITAL BODY
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {PLANETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => onSelectPlanet(p.id)}
                  className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-left transition hover:border-cyan-400/50 hover:bg-cyan-400/10"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: p.color, boxShadow: `0 0 10px ${p.color}` }}
                    />
                    <div>
                      <div className="font-display text-xs font-semibold tracking-[0.16em] text-white">
                        {p.name}
                      </div>
                      <div className="font-mono text-[9px] text-slate-400">
                        {p.classification}
                      </div>
                    </div>
                  </div>
                  <Sparkles className="h-3.5 w-3.5 text-cyan-300/70" />
                </button>
              ))}
            </div>
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
