import { motion } from 'framer-motion';
import { ArrowLeft, Car, Layers, RotateCcw, Sparkles, X } from 'lucide-react';
import { WORLD_PARTS, WORLDS } from '../data/worldsData';
import { WorldId } from '../types/worlds';

interface LabInspectorPanelProps {
  worldId: Exclude<WorldId, 'universe'>;
  selectedPartId: string | null;
  exploded: boolean;
  explosionProgress: number;
  interiorView: boolean;
  onSelectPart: (partId: string | null) => void;
  onSetExploded: (exploded: boolean) => void;
  onExplosionSliderChange: (value: number) => void;
  onAnimateAssembly: () => void;
  onToggleInterior: () => void;
  onResetModel: () => void;
  onReturnToHub: () => void;
}

export function LabInspectorPanel({
  worldId,
  selectedPartId,
  exploded,
  explosionProgress,
  interiorView,
  onSelectPart,
  onSetExploded,
  onExplosionSliderChange,
  onAnimateAssembly,
  onToggleInterior,
  onResetModel,
  onReturnToHub,
}: LabInspectorPanelProps) {
  const world = WORLDS.find((w) => w.id === worldId);
  const parts = WORLD_PARTS[worldId] ?? [];
  const selectedPart = parts.find((p) => p.id === selectedPartId) ?? null;

  const supportsExplode =
    worldId === 'armor' || worldId === 'engineering' || worldId === 'automotive';

  return (
    <motion.aside
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed right-3 sm:right-5 top-28 sm:top-24 z-30 w-[calc(100vw-1.5rem)] max-w-xs sm:max-w-sm"
    >
      <div className="glass-panel-strong rounded-2xl p-4 sm:p-5 max-h-[68vh] overflow-y-auto">
        {/* World Header */}
        <div className="flex items-start justify-between gap-2 border-b border-cyan-500/20 pb-3">
          <div>
            <div className="font-mono text-[9px] tracking-[0.22em] text-neon-cyan">
              {world?.shortLabel}
            </div>
            <h2 className="mt-0.5 font-display text-base sm:text-lg font-bold tracking-[0.16em] text-white">
              {world?.name}
            </h2>
            <p className="mt-1 text-[11px] leading-snug text-slate-300/85">
              {world?.description}
            </p>
          </div>
        </div>

        {/* Lab-specific Controls */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {supportsExplode && (
            <>
              <button
                onClick={() => onSetExploded(false)}
                className={`flex-1 rounded-lg border px-2.5 py-1.5 font-display text-[9px] font-semibold tracking-[0.14em] transition ${
                  !exploded
                    ? 'border-cyan-400/70 bg-cyan-400/20 text-white'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:border-cyan-400/40'
                }`}
              >
                ASSEMBLED VIEW
              </button>
              <button
                onClick={() => onSetExploded(true)}
                className={`flex-1 rounded-lg border px-2.5 py-1.5 font-display text-[9px] font-semibold tracking-[0.14em] transition ${
                  exploded
                    ? 'border-amber-400/70 bg-amber-400/20 text-white'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:border-amber-400/40'
                }`}
              >
                EXPLODED VIEW
              </button>
            </>
          )}

          {worldId === 'armor' && (
            <button
              onClick={onAnimateAssembly}
              className="flex items-center gap-1 rounded-lg border border-violet-400/40 bg-violet-500/15 px-2.5 py-1.5 font-display text-[9px] font-semibold tracking-[0.14em] text-violet-200 transition hover:bg-violet-500/25"
            >
              <Sparkles className="h-3 w-3" />
              ANIMATE ASSEMBLY
            </button>
          )}

          {worldId === 'automotive' && (
            <button
              onClick={onToggleInterior}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 font-display text-[9px] font-semibold tracking-[0.14em] transition ${
                interiorView
                  ? 'border-cyan-400/70 bg-cyan-400/20 text-white'
                  : 'border-white/15 bg-white/5 text-slate-200 hover:border-cyan-400/50'
              }`}
            >
              <Car className="h-3.5 w-3.5 text-neon-cyan" />
              {interiorView ? 'EXTERIOR VIEW' : 'INTERIOR COCKPIT'}
            </button>
          )}

          <button
            onClick={onResetModel}
            className="flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 font-mono text-[9px] text-slate-300 transition hover:border-cyan-400/40 hover:text-white"
          >
            <RotateCcw className="h-3 w-3" />
            RESET MODEL
          </button>
        </div>

        {/* Continuous Exploded-View Separation Slider (0% - 100%) */}
        {supportsExplode && (
          <div className="mt-3 rounded-xl border border-cyan-500/20 bg-cosmos-950/60 p-2.5">
            <div className="mb-1.5 flex items-center justify-between font-mono text-[9px] tracking-wider">
              <span className="text-slate-300">EXPLODED SEPARATION</span>
              <span className="text-neon-cyan font-semibold">
                {Math.round(explosionProgress * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(explosionProgress * 100)}
              onChange={(e) => onExplosionSliderChange(Number(e.target.value) / 100)}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-cyan-400"
            />
          </div>
        )}

        {/* Selectable Components */}
        <div className="mt-4">
          <div className="mb-2 flex items-center gap-1.5 font-mono text-[9px] tracking-[0.2em] text-slate-400">
            <Layers className="h-3 w-3 text-neon-cyan" />
            SELECTABLE COMPONENTS
          </div>
          <div className="flex flex-wrap gap-1.5">
            {parts.map((part) => {
              const active = selectedPartId === part.id;
              return (
                <button
                  key={part.id}
                  onClick={() => onSelectPart(active ? null : part.id)}
                  className={`rounded-full border px-2.5 py-1 font-mono text-[10px] transition ${
                    active
                      ? 'border-cyan-400 bg-cyan-400/25 text-white shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                      : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-cyan-400/40 hover:text-white'
                  }`}
                >
                  {part.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Part Telemetry */}
        {selectedPart && (
          <div className="relative mt-3 rounded-xl border border-cyan-400/30 bg-cosmos-950/70 p-3">
            <button
              onClick={() => onSelectPart(null)}
              aria-label="Deselect component"
              className="absolute right-2.5 top-2.5 rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <div className="font-mono text-[9px] tracking-[0.18em] text-neon-cyan">
              {selectedPart.category}
            </div>
            <div className="mt-0.5 font-display text-sm font-bold tracking-[0.14em] text-white">
              {selectedPart.name.toUpperCase()}
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
              {selectedPart.description}
            </p>
          </div>
        )}

        {/* Return to Hub */}
        <button
          onClick={onReturnToHub}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-400/40 bg-cyan-500/15 py-2 font-display text-[10px] font-semibold tracking-[0.18em] text-white transition hover:bg-cyan-400/25"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-neon-cyan" />
          RETURN TO WORLD HUB
        </button>
      </div>
    </motion.aside>
  );
}
