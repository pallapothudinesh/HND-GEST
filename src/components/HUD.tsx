import {
  Activity,
  Camera,
  Eye,
  EyeOff,
  Hand,
  HelpCircle,
  Maximize2,
  Minimize2,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { CameraStatus, HandTrackingState } from '../types/gestures';
import { MenuSection, ParticleMode } from '../types/scene';
import { HndGestLogo } from './HndGestLogo';

interface HUDProps {
  activeSection: MenuSection;
  activeWorldName: string | null;
  particleMode: ParticleMode;
  selectedPlanetName: string | null;
  cameraStatus: CameraStatus;
  handState: HandTrackingState;
  fps: number;
  hudVisible: boolean;
  guideVisible: boolean;
  audioEnabled: boolean;
  isFullscreen: boolean;
  onToggleHud: () => void;
  onToggleGuide: () => void;
  onToggleAudio: () => void;
  onToggleFullscreen: () => void;
  onResetExperience: () => void;
}

export function HUD({
  activeSection,
  activeWorldName,
  particleMode,
  selectedPlanetName,
  cameraStatus,
  handState,
  fps,
  hudVisible,
  guideVisible,
  audioEnabled,
  isFullscreen,
  onToggleHud,
  onToggleGuide,
  onToggleAudio,
  onToggleFullscreen,
  onResetExperience,
}: HUDProps) {
  return (
    <>
      {/* Top Bar */}
      <header className="pointer-events-none fixed inset-x-0 top-0 z-30 flex items-start justify-between p-3 sm:p-5">
        {/* TOP LEFT: Logo & Status */}
        <div
          className={`pointer-events-auto transition-all duration-300 ${
            hudVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
          }`}
        >
          <div className="glass-panel rounded-xl px-3.5 py-2.5 sm:px-4 sm:py-3">
            <div className="flex items-center gap-2.5">
              <HndGestLogo size="sm" />
              <div>
                <span className="font-display text-sm sm:text-base font-bold tracking-[0.22em] text-white neon-text-cyan">
                  HND GEST
                </span>
                <div className="font-mono text-[8px] tracking-[0.2em] text-cyan-300/80">
                  CONTROL WITH YOUR HANDS
                </div>
              </div>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] tracking-wider text-slate-300">
              <span className="text-cyan-300">
                STATUS: <strong className="font-semibold text-emerald-300">ONLINE</strong>
              </span>
              <span className="hidden sm:inline text-slate-500">|</span>
              <span>
                MODE:{' '}
                <strong className="font-semibold text-violet-300 uppercase">
                  {activeWorldName
                    ? activeWorldName
                    : selectedPlanetName
                    ? `PLANET:${selectedPlanetName}`
                    : activeSection}
                </strong>
              </span>
              <span className="hidden md:inline text-slate-500">|</span>
              <span className="hidden md:inline">
                FIELD: <strong className="text-cyan-200">{particleMode}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* TOP RIGHT: Telemetry & Quick Controls */}
        <div className="pointer-events-auto flex flex-col items-end gap-2">
          {hudVisible && (
            <div className="glass-panel flex items-center gap-3 rounded-xl px-3 py-2 font-mono text-[10px] tracking-wider">
              <div className="flex items-center gap-1.5">
                <Camera
                  className={`h-3.5 w-3.5 ${
                    cameraStatus === 'active' ? 'text-emerald-400' : 'text-slate-400'
                  }`}
                />
                <span className="hidden sm:inline text-slate-300">
                  {cameraStatus === 'active' ? 'CAM LIVE' : 'CAM OFF'}
                </span>
              </div>

              <span className="text-slate-600">|</span>

              <div className="flex items-center gap-1.5">
                <Hand
                  className={`h-3.5 w-3.5 ${
                    handState.detectedHands > 0 ? 'text-neon-cyan' : 'text-slate-400'
                  }`}
                />
                <span className="text-slate-200">
                  {handState.detectedHands > 0
                    ? `${handState.detectedHands} HAND${handState.detectedHands > 1 ? 'S' : ''}`
                    : 'NO HAND'}
                </span>
              </div>

              <span className="hidden sm:inline text-slate-600">|</span>

              <div className="hidden sm:flex items-center gap-1 text-cyan-300">
                <Activity className="h-3.5 w-3.5" />
                <span>{fps} FPS</span>
              </div>
            </div>
          )}

          {/* Action Icon Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onToggleGuide}
              title="Toggle Gesture Guide"
              className={`glass-panel rounded-lg p-2 transition hover:border-cyan-400/60 ${
                guideVisible ? 'border-cyan-400/60 text-neon-cyan' : 'text-slate-300'
              }`}
            >
              <HelpCircle className="h-4 w-4" />
            </button>

            <button
              onClick={onToggleAudio}
              title={audioEnabled ? 'Mute Audio' : 'Enable Subtle Audio'}
              className={`glass-panel rounded-lg p-2 transition hover:border-cyan-400/60 ${
                audioEnabled ? 'border-cyan-400/60 text-neon-cyan' : 'text-slate-300'
              }`}
            >
              {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>

            <button
              onClick={onResetExperience}
              title="Reset Experience"
              className="glass-panel rounded-lg p-2 text-slate-300 transition hover:border-cyan-400/60 hover:text-neon-cyan"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            <button
              onClick={onToggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              className="glass-panel rounded-lg p-2 text-slate-300 transition hover:border-cyan-400/60 hover:text-neon-cyan"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>

            <button
              onClick={onToggleHud}
              title={hudVisible ? 'Hide HUD' : 'Show HUD'}
              className="glass-panel rounded-lg p-2 text-slate-300 transition hover:border-cyan-400/60 hover:text-neon-cyan"
            >
              {hudVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Active Gesture Status Pill (Bottom Left) */}
      {hudVisible && (
        <div className="pointer-events-none fixed bottom-14 left-3 sm:left-5 z-30">
          <div className="glass-panel flex items-center gap-3 rounded-xl px-3.5 py-2">
            <div
              className={`h-2.5 w-2.5 rounded-full transition-colors ${
                handState.gesture !== 'NONE'
                  ? 'animate-ping bg-neon-cyan'
                  : 'bg-slate-500'
              }`}
            />
            <div>
              <div className="font-mono text-[9px] tracking-[0.2em] text-slate-400">
                DETECTED GESTURE
              </div>
              <div className="font-display text-xs sm:text-sm font-semibold tracking-[0.16em] text-cyan-100">
                {handState.gestureLabel}
              </div>
              {(handState.gesture === 'TWO_HANDS' || handState.explosionProgress > 0.02) && (
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-1 w-20 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full bg-neon-cyan transition-all duration-75"
                      style={{ width: `${Math.round(handState.explosionProgress * 100)}%` }}
                    />
                  </div>
                  <span className="font-mono text-[9px] text-neon-cyan">
                    {Math.round(handState.explosionProgress * 100)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
