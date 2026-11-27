import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Bot,
  Cpu,
  Layers,
  Pause,
  Play,
  Radar,
  RotateCcw,
  Wrench,
  X,
} from 'lucide-react';
import { RobotId, ROBOTS } from '../../data/roboticsData';

export type CameraPreset = 'front' | 'back' | 'side' | 'top';

interface RoboticsLabHUDProps {
  activeRobotId: RobotId;
  selectedPartId: string | null;
  exploded: boolean;
  animationEnabled: boolean;
  onSelectRobot: (id: RobotId) => void;
  onSelectPart: (partId: string | null) => void;
  onSetExploded: (exploded: boolean) => void;
  onToggleAnimation: () => void;
  onSelectCameraPreset: (preset: CameraPreset) => void;
  onResetModel: () => void;
  onReturnToHub: () => void;
}

function getRobotIcon(id: RobotId) {
  switch (id) {
    case 'humanoid':
      return Bot;
    case 'industrial_arm':
      return Wrench;
    case 'exploration':
      return Radar;
    case 'ai_robot':
    default:
      return Cpu;
  }
}

export function RoboticsLabHUD({
  activeRobotId,
  selectedPartId,
  exploded,
  animationEnabled,
  onSelectRobot,
  onSelectPart,
  onSetExploded,
  onToggleAnimation,
  onSelectCameraPreset,
  onResetModel,
  onReturnToHub,
}: RoboticsLabHUDProps) {
  const robot = ROBOTS.find((r) => r.id === activeRobotId) ?? ROBOTS[0];
  const selectedComponent =
    robot.components.find((c) => c.id === selectedPartId) ?? null;

  return (
    <>
      {/* FLOATING HOLOGRAPHIC ROBOT SELECTOR (Bottom Center above footer) */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="fixed bottom-28 sm:bottom-16 left-1/2 z-30 w-[calc(100vw-1.5rem)] max-w-2xl -translate-x-1/2"
      >
        <div className="glass-panel rounded-2xl p-2 sm:p-2.5">
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 sm:gap-2">
            {ROBOTS.map((r) => {
              const Icon = getRobotIcon(r.id);
              const active = r.id === activeRobotId;
              return (
                <button
                  key={r.id}
                  data-spatial-clickable="true"
                  onClick={() => onSelectRobot(r.id)}
                  className={`flex items-center gap-2 rounded-xl border px-2.5 py-2 text-left transition-all ${
                    active
                      ? 'border-cyan-400/80 bg-cyan-400/20 shadow-[0_0_18px_rgba(0,240,255,0.25)]'
                      : 'border-white/10 bg-white/[0.03] hover:border-cyan-400/40'
                  }`}
                >
                  <div
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-cyan-400/30 bg-cosmos-950/70"
                    style={{ color: r.accentColor }}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-display text-[9px] sm:text-[10px] font-bold tracking-[0.12em] text-white">
                      {r.name.replace(' ROBOT', '')}
                    </div>
                    <div className="truncate font-mono text-[8px] text-slate-400">
                      {r.type.split(' ')[0]}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* ROBOT INFORMATION & COMPONENT INSPECTION PANEL (Right Side) */}
      <motion.aside
        key={robot.id}
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed right-3 sm:right-5 top-28 sm:top-24 z-30 w-[calc(100vw-1.5rem)] max-w-xs sm:max-w-sm"
      >
        <div className="glass-panel-strong max-h-[60vh] overflow-y-auto rounded-2xl p-4 sm:p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 border-b border-cyan-500/20 pb-3">
            <div>
              <div className="font-mono text-[9px] tracking-[0.22em] text-neon-cyan">
                ROBOTICS LAB // {robot.type}
              </div>
              <h2 className="mt-0.5 font-display text-base sm:text-lg font-bold tracking-[0.15em] text-white">
                {robot.name}
              </h2>
              <p className="mt-1 text-[11px] leading-snug text-slate-300/90">
                {robot.shortDescription}
              </p>
            </div>
          </div>

          {/* Animation & View Controls */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            <button
              onClick={onToggleAnimation}
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-display text-[9px] font-semibold tracking-[0.14em] transition ${
                animationEnabled
                  ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-200'
                  : 'border-white/15 bg-white/5 text-slate-300'
              }`}
            >
              {animationEnabled ? (
                <Pause className="h-3 w-3" />
              ) : (
                <Play className="h-3 w-3" />
              )}
              ANIMATION: {animationEnabled ? 'ON' : 'OFF'}
            </button>

            {robot.supportsExplodedView && (
              <>
                <button
                  onClick={() => onSetExploded(false)}
                  className={`rounded-lg border px-2.5 py-1.5 font-display text-[9px] font-semibold tracking-[0.12em] transition ${
                    !exploded
                      ? 'border-cyan-400/70 bg-cyan-400/20 text-white'
                      : 'border-white/10 bg-white/5 text-slate-300'
                  }`}
                >
                  ASSEMBLED
                </button>
                <button
                  onClick={() => onSetExploded(true)}
                  className={`rounded-lg border px-2.5 py-1.5 font-display text-[9px] font-semibold tracking-[0.12em] transition ${
                    exploded
                      ? 'border-amber-400/70 bg-amber-400/20 text-white'
                      : 'border-white/10 bg-white/5 text-slate-300'
                  }`}
                >
                  EXPLODED VIEW
                </button>
              </>
            )}

            <button
              onClick={onResetModel}
              className="flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 font-mono text-[9px] text-slate-300 transition hover:border-cyan-400/40 hover:text-white"
            >
              <RotateCcw className="h-3 w-3" />
              RESET
            </button>
          </div>

          {/* 3D Viewer Camera Angle Presets */}
          <div className="mt-2.5 grid grid-cols-4 gap-1">
            {(['front', 'back', 'side', 'top'] as CameraPreset[]).map((preset) => (
              <button
                key={preset}
                onClick={() => onSelectCameraPreset(preset)}
                className="rounded-md border border-cyan-500/20 bg-cosmos-950/60 py-1 font-mono text-[9px] uppercase tracking-wider text-slate-300 transition hover:border-cyan-400/60 hover:text-neon-cyan"
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Selectable Components */}
          <div className="mt-4">
            <div className="mb-2 flex items-center gap-1.5 font-mono text-[9px] tracking-[0.2em] text-slate-400">
              <Layers className="h-3 w-3 text-neon-cyan" />
              SELECTABLE COMPONENTS ({robot.components.length})
            </div>
            <div className="flex flex-wrap gap-1.5">
              {robot.components.map((comp) => {
                const active = comp.id === selectedPartId;
                return (
                  <button
                    key={comp.id}
                    onClick={() => onSelectPart(active ? null : comp.id)}
                    className={`rounded-full border px-2.5 py-1 font-mono text-[10px] transition ${
                      active
                        ? 'border-cyan-400 bg-cyan-400/25 text-white shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                        : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-cyan-400/40 hover:text-white'
                    }`}
                  >
                    {comp.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Component Detail OR Educational Overview */}
          {selectedComponent ? (
            <div className="relative mt-3 rounded-xl border border-cyan-400/40 bg-cosmos-950/75 p-3">
              <button
                onClick={() => onSelectPart(null)}
                aria-label="Close component detail"
                className="absolute right-2.5 top-2.5 rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <div className="font-mono text-[9px] tracking-[0.18em] text-neon-cyan">
                {selectedComponent.category}
              </div>
              <div className="mt-0.5 font-display text-sm font-bold tracking-[0.14em] text-white">
                {selectedComponent.name.toUpperCase()}
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
                {selectedComponent.description}
              </p>
              {(selectedComponent.material || selectedComponent.jointType || selectedComponent.movement) && (
                <div className="mt-2.5 space-y-1 border-t border-cyan-500/20 pt-2 font-mono text-[10px]">
                  {selectedComponent.material && (
                    <div>
                      <span className="text-slate-400">MATERIAL: </span>
                      <span className="text-cyan-200">{selectedComponent.material}</span>
                    </div>
                  )}
                  {selectedComponent.jointType && (
                    <div>
                      <span className="text-slate-400">JOINT: </span>
                      <span className="text-violet-200">{selectedComponent.jointType}</span>
                    </div>
                  )}
                  {selectedComponent.movement && (
                    <div>
                      <span className="text-slate-400">RANGE: </span>
                      <span className="text-emerald-300">{selectedComponent.movement}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="mt-3 rounded-xl border border-white/10 bg-cosmos-950/55 p-3">
              <div className="font-mono text-[9px] tracking-[0.18em] text-violet-300">
                EDUCATIONAL BRIEFING
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-300/90">
                {robot.educationalInfo}
              </p>
            </div>
          )}

          {/* Return to World Selector */}
          <button
            onClick={onReturnToHub}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-400/40 bg-cyan-500/15 py-2 font-display text-[10px] font-semibold tracking-[0.18em] text-white transition hover:bg-cyan-400/25"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-neon-cyan" />
            RETURN TO WORLD SELECTOR
          </button>
        </div>
      </motion.aside>
    </>
  );
}
