import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AboutPanel } from './components/AboutPanel';
import { CameraPreview } from './components/CameraPreview';
import { CreatorFooter } from './components/CreatorFooter';
import { GestureGuide } from './components/GestureGuide';
import { HUD } from './components/HUD';
import { LabInspectorPanel } from './components/LabInspectorPanel';
import { LandingScreen } from './components/LandingScreen';
import { LoadingScreen } from './components/LoadingScreen';
import { ParticlePanel } from './components/ParticlePanel';
import { PlanetInfoPanel } from './components/PlanetInfoPanel';
import { SpatialCursor } from './components/SpatialCursor';
import { StudioDock } from './components/StudioDock';
import { UniverseScene } from './components/UniverseScene';
import { WorldHubOverlay } from './components/WorldHubOverlay';
import { WORLDS } from './data/worldsData';
import { useCamera } from './hooks/useCamera';
import { useGestureRecognition } from './hooks/useGestureRecognition';
import { useHandTracking } from './hooks/useHandTracking';
import { MenuSection, ParticleMode, UniverseInteractionRef } from './types/scene';
import { WorldId } from './types/worlds';
import { PLANETS } from './utils/constants';
import { neuralAudio } from './utils/sound';

const INITIAL_INTERACTION: UniverseInteractionRef = {
  sphereScale: 1.0,
  particleExpansion: 1.0,
  rotationYaw: 0,
  verticalOffset: 0,
  pinchOffset: { x: 0, y: 0, z: 0 },
  wavePulse: 0,
  explosionProgress: 0,
  handExplosionActive: false,
  activeGesture: 'NONE',
};

export default function App() {
  const [hasStarted, setHasStarted] = useState(false);
  const [activeWorld, setActiveWorld] = useState<WorldId>('automotive');
  const [worldHubOpen, setWorldHubOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<MenuSection>('universe');
  const [particleMode, setParticleMode] = useState<ParticleMode>('COSMIC');
  const [selectedPlanetId, setSelectedPlanetId] = useState<string | null>(null);
  const [hoveredPlanetId, setHoveredPlanetId] = useState<string | null>(null);

  // Lab-specific inspection states (inspector starts collapsed to maximize 3D viewport)
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [exploded, setExploded] = useState(false);
  const [sliderExplosion, setSliderExplosion] = useState(0);
  const [interiorView, setInteriorView] = useState(false);
  const [cameraPresetNonce] = useState<{
    preset: 'front' | 'back' | 'side' | 'top';
    nonce: number;
  } | null>(null);
  const [resetNonce, setResetNonce] = useState(0);

  const [hudVisible, setHudVisible] = useState(true);
  const [guideVisible, setGuideVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const interactionRef = useRef<UniverseInteractionRef>({ ...INITIAL_INTERACTION });
  const fpsRef = useRef(60);

  const handleResetExperience = useCallback(() => {
    neuralAudio.playTransition();
    interactionRef.current = { ...INITIAL_INTERACTION };
    setSelectedPlanetId(null);
    setSelectedPartId(null);
    setExploded(false);
    setSliderExplosion(0);
    setInteriorView(false);
    setParticleMode('COSMIC');
    setResetNonce((n) => n + 1);
    if (activeWorld === 'universe') {
      setActiveSection('universe');
    }
  }, [activeWorld]);

  const { videoRef, stream, status: cameraStatus, errorMessage, startCamera, stopCamera } = useCamera();
  const { handState, processLandmarks, resetGestures } = useGestureRecognition(
    interactionRef,
    handleResetExperience
  );
  const { isModelLoading, modelError, landmarksRef } = useHandTracking(
    videoRef,
    cameraStatus,
    hasStarted && cameraStatus === 'active',
    processLandmarks
  );

  // Detect mobile viewport for particle/starfield optimization & compact HUD
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Track fullscreen changes
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const selectedPlanet = useMemo(
    () => PLANETS.find((p) => p.id === selectedPlanetId) ?? null,
    [selectedPlanetId]
  );

  const activeWorldName = useMemo(
    () => WORLDS.find((w) => w.id === activeWorld)?.name ?? null,
    [activeWorld]
  );

  const handleStartExperience = useCallback(async () => {
    neuralAudio.playTransition();
    setHasStarted(true);
    await startCamera();
  }, [startCamera]);

  const handleStartMouseOnly = useCallback(() => {
    neuralAudio.playTransition();
    setHasStarted(true);
    setPreviewVisible(false);
  }, []);

  const handleSelectWorld = useCallback((worldId: WorldId) => {
    neuralAudio.playTransition();
    setActiveWorld(worldId);
    setWorldHubOpen(false);
    setSelectedPartId(null);
    setInspectorOpen(false);
    setExploded(false);
    setSliderExplosion(0);
    setInteriorView(false);
    setSelectedPlanetId(null);
    setResetNonce((n) => n + 1);
    if (worldId === 'universe') {
      setActiveSection('universe');
    }
  }, []);

  const handleSelectSection = useCallback((section: MenuSection) => {
    neuralAudio.playClick();
    if (section === 'about') {
      setActiveSection('about');
      return;
    }
    setActiveWorld('universe');
    setActiveSection(section);
    if (section === 'controls') {
      setGuideVisible(true);
    } else if (section === 'universe') {
      setSelectedPlanetId(null);
    }
  }, []);

  const handleSelectPlanet = useCallback((id: string | null) => {
    if (id) {
      neuralAudio.playSelect();
      setActiveSection('planets');
    } else {
      neuralAudio.playClick();
    }
    setSelectedPlanetId(id);
  }, []);

  const handleReturnToUniverse = useCallback(() => {
    neuralAudio.playClick();
    setSelectedPlanetId(null);
    setActiveSection('universe');
  }, []);

  const handleResetExperienceWithGestures = useCallback(() => {
    resetGestures();
    handleResetExperience();
  }, [resetGestures, handleResetExperience]);

  const handleSetExploded = useCallback((val: boolean) => {
    neuralAudio.playClick();
    interactionRef.current.handExplosionActive = false;
    interactionRef.current.explosionProgress = val ? 1 : 0;
    setExploded(val);
    setSliderExplosion(val ? 1 : 0);
  }, []);

  const handleExplosionSliderChange = useCallback((val: number) => {
    interactionRef.current.handExplosionActive = false;
    interactionRef.current.explosionProgress = val;
    setSliderExplosion(val);
    setExploded(val >= 0.5);
  }, []);

  const handleSelectPart = useCallback((id: string | null) => {
    if (id) {
      neuralAudio.playSelect();
      setInspectorOpen(true);
    }
    setSelectedPartId(id);
  }, []);

  const handleToggleHud = useCallback(() => {
    neuralAudio.playClick();
    setHudVisible((v) => !v);
  }, []);

  const handleToggleGuide = useCallback(() => {
    neuralAudio.playClick();
    setGuideVisible((v) => !v);
  }, []);

  const handleToggleAudio = useCallback(() => {
    setAudioEnabled((prev) => {
      const next = !prev;
      neuralAudio.setEnabled(next);
      if (next) neuralAudio.playClick();
      return next;
    });
  }, []);

  const handleToggleFullscreen = useCallback(async () => {
    neuralAudio.playClick();
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Ignore fullscreen rejection in restricted iframes
    }
  }, []);

  const handleExpandPulse = useCallback(() => {
    neuralAudio.playGesture('expand');
    interactionRef.current.sphereScale = 1.38;
    interactionRef.current.particleExpansion = 1.55;
    interactionRef.current.wavePulse = performance.now();
    window.setTimeout(() => {
      interactionRef.current.sphereScale = 1.0;
      interactionRef.current.particleExpansion = 1.0;
    }, 1100);
  }, []);

  const handleFpsUpdate = useCallback((nextFps: number) => {
    fpsRef.current = nextFps;
  }, []);

  // Global Studio Keyboard Shortcuts (Space = Explode, R = Reset, C = Cockpit, H = Hide UI, G = Guide)
  useEffect(() => {
    if (!hasStarted) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleSetExploded(!exploded);
      } else if (e.key === 'r' || e.key === 'R') {
        handleResetExperienceWithGestures();
      } else if ((e.key === 'c' || e.key === 'C') && activeWorld === 'automotive') {
        neuralAudio.playTransition();
        setInteriorView((v) => !v);
      } else if (e.key === 'h' || e.key === 'H') {
        handleToggleHud();
      } else if (e.key === 'g' || e.key === 'G') {
        handleToggleGuide();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    hasStarted,
    exploded,
    activeWorld,
    handleSetExploded,
    handleResetExperienceWithGestures,
    handleToggleHud,
    handleToggleGuide,
  ]);

  const currentExplosionProgress =
    handState.detectedHands >= 2 ? handState.explosionProgress : sliderExplosion;

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-cosmos-950">
      {/* Full-Screen 3D Studio & Exploration Labs */}
      <UniverseScene
        interactionRef={interactionRef}
        activeWorld={activeWorld}
        particleMode={particleMode}
        selectedPlanetId={selectedPlanetId}
        hoveredPlanetId={hoveredPlanetId}
        selectedPartId={selectedPartId}
        exploded={exploded}
        interiorView={interiorView}
        cameraPresetNonce={cameraPresetNonce}
        resetNonce={resetNonce}
        onSelectPlanet={handleSelectPlanet}
        onHoverPlanet={setHoveredPlanetId}
        onSelectPart={handleSelectPart}
        onFpsUpdate={handleFpsUpdate}
        isLanding={!hasStarted}
        isMobile={isMobile}
      />

      {/* Initial Landing Screen */}
      <AnimatePresence>
        {!hasStarted && (
          <LandingScreen
            onStartExperience={handleStartExperience}
            onStartMouseOnly={handleStartMouseOnly}
          />
        )}
      </AnimatePresence>

      {/* Main Studio Interface */}
      {hasStarted && (
        <>
          <HUD
            activeSection={activeSection}
            activeWorldName={activeWorldName}
            isWorldLabActive={activeWorld !== 'universe'}
            selectedPlanetName={selectedPlanet?.name ?? null}
            cameraStatus={cameraStatus}
            handState={handState}
            fpsRef={fpsRef}
            hudVisible={hudVisible}
            guideVisible={guideVisible}
            audioEnabled={audioEnabled}
            isFullscreen={isFullscreen}
            onSelectSection={handleSelectSection}
            onOpenWorldHub={() => {
              neuralAudio.playClick();
              setWorldHubOpen(true);
            }}
            onToggleHud={handleToggleHud}
            onToggleGuide={handleToggleGuide}
            onToggleAudio={handleToggleAudio}
            onToggleFullscreen={handleToggleFullscreen}
          />

          {hudVisible && (
            <StudioDock
              activeWorld={activeWorld}
              handState={handState}
              exploded={exploded}
              explosionProgress={currentExplosionProgress}
              interiorView={interiorView}
              onSetExploded={handleSetExploded}
              onExplosionSliderChange={handleExplosionSliderChange}
              onToggleInterior={() => {
                neuralAudio.playTransition();
                setInteriorView((v) => !v);
              }}
              onReset={handleResetExperienceWithGestures}
            />
          )}

          <GestureGuide
            visible={guideVisible}
            currentGesture={handState.gesture}
            onClose={() => setGuideVisible(false)}
          />

          {/* Cosmic Universe Panels */}
          {activeWorld === 'universe' && (
            <>
              <PlanetInfoPanel
                selectedPlanet={selectedPlanet}
                showDirectory={activeSection === 'planets'}
                onSelectPlanet={handleSelectPlanet}
                onReturnToUniverse={handleReturnToUniverse}
              />

              <AnimatePresence>
                {activeSection === 'particles' && !selectedPlanet && (
                  <ParticlePanel
                    particleMode={particleMode}
                    onSelectMode={(m) => {
                      neuralAudio.playSelect();
                      setParticleMode(m);
                    }}
                    onExpandPulse={handleExpandPulse}
                    onResetField={handleResetExperienceWithGestures}
                  />
                )}
              </AnimatePresence>
            </>
          )}

          {/* Collapsible Multi-World Lab Inspector */}
          {activeWorld !== 'universe' && hudVisible && (
            <LabInspectorPanel
              worldId={activeWorld}
              selectedPartId={selectedPartId}
              isOpen={inspectorOpen}
              onToggleOpen={setInspectorOpen}
              onSelectPart={handleSelectPart}
            />
          )}

          <WorldHubOverlay
            visible={worldHubOpen}
            activeWorld={activeWorld}
            onSelectWorld={handleSelectWorld}
            onClose={() => setWorldHubOpen(false)}
          />

          <AnimatePresence>
            {activeSection === 'about' && (
              <AboutPanel onClose={() => setActiveSection('universe')} />
            )}
          </AnimatePresence>

          <CameraPreview
            videoRef={videoRef}
            stream={stream}
            cameraStatus={cameraStatus}
            errorMessage={errorMessage}
            isModelLoading={isModelLoading}
            modelError={modelError}
            landmarksRef={landmarksRef}
            handDetected={handState.detectedHands > 0}
            isVisible={previewVisible}
            onToggleVisible={() => {
              neuralAudio.playClick();
              setPreviewVisible((v) => !v);
            }}
            onStartCamera={startCamera}
            onStopCamera={() => {
              neuralAudio.playClick();
              stopCamera();
              resetGestures();
            }}
          />

          <SpatialCursor
            active={handState.gesture === 'POINTING'}
            position={handState.pointerPosition}
          />

          <LoadingScreen visible={isModelLoading} />
        </>
      )}

      {/* Persistent Creator Signature */}
      <CreatorFooter />
    </main>
  );
}
