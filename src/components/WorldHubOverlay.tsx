import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Atom,
  Bot,
  Car,
  Cpu,
  Orbit,
  Palette,
  Rocket,
  Shield,
  Wrench,
  X,
} from 'lucide-react';
import { WORLDS } from '../data/worldsData';
import { WorldId } from '../types/worlds';

interface WorldHubOverlayProps {
  visible: boolean;
  activeWorld: WorldId;
  onSelectWorld: (worldId: WorldId) => void;
  onClose: () => void;
}

function getWorldIcon(id: WorldId) {
  switch (id) {
    case 'armor':
      return Shield;
    case 'automotive':
      return Car;
    case 'engineering':
      return Wrench;
    case 'robotics':
      return Bot;
    case 'space':
      return Rocket;
    case 'science':
      return Atom;
    case 'digital_art':
      return Palette;
    case 'future_tech':
      return Cpu;
    default:
      return Orbit;
  }
}

export function WorldHubOverlay({
  visible,
  activeWorld,
  onSelectWorld,
  onClose,
}: WorldHubOverlayProps) {
  const [focusedId, setFocusedId] = useState<WorldId>(
    activeWorld === 'universe' ? 'armor' : activeWorld
  );

  const focusedWorld = WORLDS.find((w) => w.id === focusedId) ?? WORLDS[0];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-40 flex items-center justify-center bg-cosmos-950/75 p-4 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-panel-strong relative flex w-full max-w-5xl flex-col overflow-hidden rounded-3xl p-5 sm:p-8"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4">
              <div>
                <div className="font-mono text-[10px] tracking-[0.26em] text-neon-cyan">
                  HND GEST // MULTI-WORLD NAVIGATION HUB
                </div>
                <h2 className="mt-1 font-display text-lg sm:text-2xl font-bold tracking-[0.16em] text-white neon-text-cyan">
                  SELECT EXPLORATION LAB
                </h2>
              </div>
              <button
                onClick={onClose}
                aria-label="Close World Hub"
                className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:border-cyan-400/50 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Orbital Spatial Selector + Live Preview */}
            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12 items-center">
              {/* Left/Center: Orbital Constellation Ring */}
              <div className="lg:col-span-7 flex flex-col items-center justify-center">
                <div className="relative flex h-[310px] w-[310px] sm:h-[360px] sm:w-[360px] items-center justify-center">
                  {/* Concentric Holographic Rings */}
                  <div className="pointer-events-none absolute inset-4 rounded-full border border-cyan-400/20 animate-spin-slow" />
                  <div className="pointer-events-none absolute inset-12 rounded-full border border-dashed border-violet-400/25" />

                  {/* Center Hub Core: Return to Cosmic Universe */}
                  <button
                    onClick={() => onSelectWorld('universe')}
                    className={`group relative z-10 flex h-24 w-24 sm:h-28 sm:w-28 flex-col items-center justify-center rounded-full border transition-all duration-300 ${
                      activeWorld === 'universe'
                        ? 'border-neon-cyan bg-cyan-500/20 shadow-[0_0_32px_rgba(0,240,255,0.4)]'
                        : 'border-cyan-400/40 bg-cosmos-900/80 hover:border-neon-cyan hover:scale-105'
                    }`}
                  >
                    <Orbit className="h-6 w-6 text-neon-cyan transition-transform duration-500 group-hover:rotate-90" />
                    <span className="mt-1.5 font-display text-[9px] font-bold tracking-[0.16em] text-white">
                      COSMIC HUB
                    </span>
                  </button>

                  {/* 8 Orbital World Nodes arranged in a 360° ring */}
                  {WORLDS.map((world, idx) => {
                    const angle = (idx / WORLDS.length) * Math.PI * 2 - Math.PI / 2;
                    const radiusPct = 41;
                    const left = `${50 + Math.cos(angle) * radiusPct}%`;
                    const top = `${50 + Math.sin(angle) * radiusPct}%`;
                    const Icon = getWorldIcon(world.id);
                    const isFocused = focusedId === world.id;
                    const isActive = activeWorld === world.id;

                    return (
                      <button
                        key={world.id}
                        onMouseEnter={() => setFocusedId(world.id)}
                        onClick={() => {
                          setFocusedId(world.id);
                          onSelectWorld(world.id);
                        }}
                        style={{ left, top }}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 flex h-14 w-14 sm:h-16 sm:w-16 flex-col items-center justify-center rounded-2xl border backdrop-blur-md transition-all duration-200 ${
                          isActive || isFocused
                            ? 'scale-110 border-cyan-300 bg-cyan-500/25 shadow-[0_0_24px_rgba(0,240,255,0.35)]'
                            : 'border-white/15 bg-cosmos-900/80 hover:border-cyan-400/60 hover:scale-105'
                        }`}
                      >
                        <Icon
                          className="h-4 w-4 sm:h-5 sm:w-5"
                          style={{ color: world.accentColor }}
                        />
                        <span className="mt-1 font-mono text-[8px] font-semibold tracking-wider text-slate-200">
                          {world.name.split(' ')[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right: Focused World Holographic Briefing */}
              <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl border border-cyan-500/20 bg-cosmos-950/65 p-5">
                <div>
                  <div
                    className="font-mono text-[10px] tracking-[0.22em]"
                    style={{ color: focusedWorld.accentColor }}
                  >
                    {focusedWorld.shortLabel} // {focusedWorld.tagline}
                  </div>
                  <h3 className="mt-2 font-display text-xl sm:text-2xl font-bold tracking-[0.16em] text-white">
                    {focusedWorld.name}
                  </h3>
                  <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-300">
                    {focusedWorld.description}
                  </p>
                </div>

                <div className="mt-6 flex flex-col gap-2.5">
                  <button
                    onClick={() => onSelectWorld(focusedWorld.id)}
                    className="w-full rounded-xl border border-cyan-400/70 bg-cyan-500/20 py-3 font-display text-xs font-bold tracking-[0.2em] text-white shadow-[0_0_24px_rgba(0,240,255,0.25)] transition hover:bg-cyan-400/30"
                  >
                    ENTER {focusedWorld.name}
                  </button>
                  <button
                    onClick={() => onSelectWorld('universe')}
                    className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 font-mono text-[10px] tracking-[0.18em] text-slate-300 transition hover:border-cyan-400/40 hover:text-white"
                  >
                    RETURN TO MAIN UNIVERSE
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
