import { motion } from 'framer-motion';
import { ChevronRight, Layers, X } from 'lucide-react';
import { WORLD_PARTS, WORLDS } from '../data/worldsData';
import { WorldId } from '../types/worlds';

interface LabInspectorPanelProps {
  worldId: Exclude<WorldId, 'universe'>;
  selectedPartId: string | null;
  isOpen: boolean;
  onToggleOpen: (open: boolean) => void;
  onSelectPart: (partId: string | null) => void;
}

export function LabInspectorPanel({
  worldId,
  selectedPartId,
  isOpen,
  onToggleOpen,
  onSelectPart,
}: LabInspectorPanelProps) {
  const world = WORLDS.find((w) => w.id === worldId);
  const parts = WORLD_PARTS[worldId] ?? [];
  const selectedPart = parts.find((p) => p.id === selectedPartId) ?? null;

  if (!isOpen) {
    return (
      <div className="fixed right-3 sm:right-4 top-20 z-30">
        <button
          onClick={() => onToggleOpen(true)}
          className="glass-panel flex items-center gap-2 rounded-full px-3.5 py-2 font-display text-[10px] font-semibold tracking-[0.16em] text-cyan-100 transition hover:border-cyan-400/60"
        >
          <Layers className="h-3.5 w-3.5 text-neon-cyan" />
          <span>INSPECT PARTS ({parts.length})</span>
        </button>
      </div>
    );
  }

  return (
    <motion.aside
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed right-3 sm:right-4 top-20 z-30 w-[calc(100vw-1.5rem)] max-w-xs"
    >
      <div className="glass-panel-strong max-h-[62vh] overflow-y-auto rounded-2xl p-4">
        <div className="flex items-start justify-between gap-2 border-b border-cyan-500/20 pb-2.5">
          <div>
            <div className="font-mono text-[9px] tracking-[0.2em] text-neon-cyan">
              {world?.shortLabel}
            </div>
            <h2 className="mt-0.5 font-display text-sm font-bold tracking-[0.16em] text-white">
              {world?.name}
            </h2>
          </div>
          <button
            onClick={() => onToggleOpen(false)}
            aria-label="Collapse Inspector"
            className="rounded-lg p-1 text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Selectable Components */}
        <div className="mt-3">
          <div className="mb-2 flex items-center gap-1.5 font-mono text-[9px] tracking-[0.2em] text-slate-400">
            <Layers className="h-3 w-3 text-neon-cyan" />
            COMPONENTS
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
                      ? 'border-cyan-400 bg-cyan-400/25 text-white shadow-[0_0_12px_rgba(0,240,255,0.22)]'
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
            <div className="mt-0.5 font-display text-xs font-bold tracking-[0.14em] text-white">
              {selectedPart.name.toUpperCase()}
            </div>
            <p className="mt-1.5 text-[11px] leading-relaxed text-slate-300">
              {selectedPart.description}
            </p>
          </div>
        )}
      </div>
    </motion.aside>
  );
}
