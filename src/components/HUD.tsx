import { memo, useEffect, useState } from 'react';
import {
  Activity,
  Camera,
  ChevronDown,
  Compass,
  Eye,
  EyeOff,
  Globe2,
  Hand,
  HelpCircle,
  Info,
  Maximize2,
  Minimize2,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { CameraStatus, HandTrackingState } from '../types/gestures';
import { MenuSection } from '../types/scene';
import { HndGestLogo } from './HndGestLogo';
import { ThemeSwitcher } from './ThemeSwitcher';

interface HUDProps {
  activeSection: MenuSection;
  activeWorldName: string | null;
  isWorldLabActive: boolean;
  selectedPlanetName: string | null;
  cameraStatus: CameraStatus;
  handState: HandTrackingState;
  fpsRef: React.MutableRefObject<number>;
  hudVisible: boolean;
  guideVisible: boolean;
  audioEnabled: boolean;
  isFullscreen: boolean;
  onSelectSection: (section: MenuSection) => void;
  onOpenWorldHub: () => void;
  onToggleHud: () => void;
  onToggleGuide: () => void;
  onToggleAudio: () => void;
  onToggleFullscreen: () => void;
}

function FpsCounter({ fpsRef }: { fpsRef: React.MutableRefObject<number> }) {
  const [fps, setFps] = useState(60);

  useEffect(() => {
    const id = window.setInterval(() => {
      const next = fpsRef.current;
      setFps((prev) => (prev === next ? prev : next));
    }, 500);
    return () => window.clearInterval(id);
  }, [fpsRef]);

  return <span>{fps} FPS</span>;
}

export const HUD = memo(function HUD({
  activeSection,
  activeWorldName,
  isWorldLabActive,
  selectedPlanetName,
  cameraStatus,
  handState,
  fpsRef,
  hudVisible,
  guideVisible,
  audioEnabled,
  isFullscreen,
  onSelectSection,
  onOpenWorldHub,
  onToggleHud,
  onToggleGuide,
  onToggleAudio,
  onToggleFullscreen,
}: HUDProps) {
  if (!hudVisible) {
    return (
      <div className="pointer-events-auto fixed right-4 top-4 z-30">
        <button
          onClick={onToggleHud}
          title="Show Studio UI (H)"
          className="glass-panel flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-[10px] tracking-wider text-slate-200 transition hover:border-cyan-400/60"
        >
          <Eye className="h-3.5 w-3.5 text-neon-cyan" />
          <span>SHOW UI</span>
        </button>
      </div>
    );
  }

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-30 p-3 sm:p-4">
      <div className="pointer-events-auto mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 glass-panel rounded-2xl px-3 py-2 sm:px-4">
        {/* LEFT: Brand + Current Exhibit Pill */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="flex items-center gap-2">
            <HndGestLogo size="sm" />
            <span className="font-display text-xs sm:text-sm font-bold tracking-[0.2em] text-white neon-text-cyan">
              HND GEST
            </span>
          </div>

          <div className="hidden sm:block h-4 w-px bg-slate-500/30" />

          <button
            data-spatial-clickable="true"
            onClick={onOpenWorldHub}
            className="flex items-center gap-1.5 rounded-full border border-cyan-400/35 bg-cyan-500/10 px-2.5 py-1 font-display text-[10px] font-semibold tracking-[0.12em] text-cyan-100 transition hover:border-cyan-400/70 hover:bg-cyan-400/20"
          >
            <Compass className="h-3 w-3 text-neon-cyan" />
            <span className="max-w-[140px] truncate uppercase">
              {activeWorldName
                ? activeWorldName
                : selectedPlanetName
                ? `PLANET: ${selectedPlanetName}`
                : 'COSMIC UNIVERSE'}
            </span>
            <ChevronDown className="h-3 w-3 opacity-75" />
          </button>
        </div>

        {/* CENTER: Clean Studio Navigation */}
        <nav className="flex items-center gap-1" aria-label="Studio Navigation">
          <button
            data-spatial-clickable="true"
            onClick={onOpenWorldHub}
            className={`rounded-full px-2.5 py-1 font-display text-[10px] tracking-[0.14em] uppercase transition ${
              isWorldLabActive
                ? 'bg-cyan-400/20 text-white border border-cyan-400/45'
                : 'text-slate-300 hover:bg-white/5 hover:text-white border border-transparent'
            }`}
          >
            Labs
          </button>

          {!isWorldLabActive && (
            <>
              <button
                data-spatial-clickable="true"
                onClick={() => onSelectSection('planets')}
                className={`hidden sm:inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-display text-[10px] tracking-[0.14em] uppercase transition ${
                  activeSection === 'planets'
                    ? 'bg-cyan-400/20 text-white border border-cyan-400/45'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white border border-transparent'
                }`}
              >
                <Globe2 className="h-3 w-3" />
                Planets
              </button>
              <button
                data-spatial-clickable="true"
                onClick={() => onSelectSection('particles')}
                className={`hidden sm:inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-display text-[10px] tracking-[0.14em] uppercase transition ${
                  activeSection === 'particles'
                    ? 'bg-cyan-400/20 text-white border border-cyan-400/45'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white border border-transparent'
                }`}
              >
                <Sparkles className="h-3 w-3" />
                Particles
              </button>
            </>
          )}

          <button
            data-spatial-clickable="true"
            onClick={onToggleGuide}
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 font-display text-[10px] tracking-[0.14em] uppercase transition ${
              guideVisible
                ? 'bg-cyan-400/20 text-white border border-cyan-400/45'
                : 'text-slate-300 hover:bg-white/5 hover:text-white border border-transparent'
            }`}
          >
            <HelpCircle className="h-3 w-3" />
            <span className="hidden md:inline">Guide</span>
          </button>

          <button
            data-spatial-clickable="true"
            onClick={() => onSelectSection('about')}
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 font-display text-[10px] tracking-[0.14em] uppercase transition ${
              activeSection === 'about'
                ? 'bg-cyan-400/20 text-white border border-cyan-400/45'
                : 'text-slate-300 hover:bg-white/5 hover:text-white border border-transparent'
            }`}
          >
            <Info className="h-3 w-3" />
            <span className="hidden md:inline">About</span>
          </button>
        </nav>

        {/* RIGHT: Telemetry + Theme Switcher + Quick Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="hidden lg:flex items-center gap-2.5 rounded-full border border-white/10 bg-cosmos-950/40 px-2.5 py-1 font-mono text-[10px] text-slate-300">
            <span className="flex items-center gap-1">
              <Camera
                className={`h-3 w-3 ${
                  cameraStatus === 'active' ? 'text-emerald-400' : 'text-slate-400'
                }`}
              />
              {cameraStatus === 'active' ? 'CAM' : 'OFF'}
            </span>
            <span className="flex items-center gap-1">
              <Hand
                className={`h-3 w-3 ${
                  handState.detectedHands > 0 ? 'text-neon-cyan' : 'text-slate-400'
                }`}
              />
              {handState.detectedHands}
            </span>
            <span className="flex items-center gap-1 text-neon-cyan">
              <Activity className="h-3 w-3" />
              <FpsCounter fpsRef={fpsRef} />
            </span>
          </div>

          <ThemeSwitcher />

          <button
            onClick={onToggleAudio}
            title={audioEnabled ? 'Mute Audio' : 'Enable Subtle Audio'}
            className={`rounded-full p-1.5 transition hover:bg-white/10 ${
              audioEnabled ? 'text-neon-cyan' : 'text-slate-400 hover:text-white'
            }`}
          >
            {audioEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
          </button>

          <button
            onClick={onToggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            className="hidden sm:inline-flex rounded-full p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>

          <button
            onClick={onToggleHud}
            title="Hide Studio UI (H)"
            className="rounded-full p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <EyeOff className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
});
