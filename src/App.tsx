import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AboutPanel } from './components/AboutPanel';
import { CameraPreview } from './components/CameraPreview';
import { CreatorFooter } from './components/CreatorFooter';
import { GestureGuide } from './components/GestureGuide';
import { HolographicMenu } from './components/HolographicMenu';
import { HUD } from './components/HUD';
import { LabInspectorPanel } from './components/LabInspectorPanel';
import { LandingScreen } from './components/LandingScreen';
import { LoadingScreen } from './components/LoadingScreen';
import { ParticlePanel } from './components/ParticlePanel';
import { PlanetInfoPanel } from './components/PlanetInfoPanel';
import { CameraPreset, RoboticsLabHUD } from './components/labs/RoboticsLabHUD';
import { SpatialCursor } from './components/SpatialCursor';
import { UniverseScene } from './components/UniverseScene';
import { WorldHubOverlay } from './components/WorldHubOverlay';
import { RobotId, ROBOTS } from './data/roboticsData';
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
  const [activeWorld, setActiveWorld] = useState<WorldId>('universe');
  const [worldHubOpen, setWorldHubOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<MenuSection>('universe');
  const [particleMode, setParticleMode] = useState<ParticleMode>('COSMIC');
  const [selectedPlanetId, setSelectedPlanetId] = useState<string | null>(null);
  const [hoveredPlanetId, setHoveredPlanetId] = useState<string | null>(null);

  // Lab-specific inspection states
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  const [exploded, setExploded] = useState(false);
  const [sliderExplosion, setSliderExplosion] = useState(0);
  const [interiorView, setInteriorView] = useState(false);
  const [activeRobotId, setActiveRobotId] = useState<RobotId>('humanoid');
  const [robotAnimationEnabled, setRobotAnimationEnabled] = useState(true);
  const [cameraPresetNonce, setCameraPresetNonce] = useState<{
    preset: CameraPreset;
    nonce: number;
  } | null>(null);
  const [resetNonce, setResetNonce] = useState(0);

  const [hudVisible, setHudVisible] = useState(true);
  const [guideVisible, setGuideVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fps, setFps] = useState(60);
  const [isMobile, setIsMobile] = useState(false);

  const interactionRef = useRef<UniverseInteractionRef>({ ...INITIAL_INTERACTION });

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

  const activeWorldName = useMemo(() => {
    const baseName = WORLDS.find((w) => w.id === activeWorld)?.name ?? null;
    if (activeWorld === 'robotics' && baseName) {
      const robotName = ROBOTS.find((r) => r.id === activeRobotId)?.name;
      return robotName ? `${baseName} // ${robotName}` : baseName;
    }
    return baseName;
  }, [activeWorld, activeRobotId]);

  const handleStartExperience = useCallback(async () => {
    neuralAudio.playTransition();
    setHasStarted(true);
    setGuideVisible(window.innerWidth >= 1024);
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

  const handleAnimateAssembly = useCallback(() => {
    neuralAudio.playTransition();
    setExploded(true);
    window.setTimeout(() => {
      setExploded(false);
    }, 950);
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

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-cosmos-950">
      {/* Subtle HUD Scanline Overlay */}
      <div className="hud-scanline pointer-events-none fixed inset-0 z-10 opacity-40" />

      {/* Full-Screen 3D Universe & Exploration Labs */}
      <UniverseScene
        interactionRef={interactionRef}
        activeWorld={activeWorld}
        particleMode={particleMode}
        selectedPlanetId={selectedPlanetId}
        hoveredPlanetId={hoveredPlanetId}
        selectedPartId={selectedPartId}
        exploded={exploded}
        interiorView={interiorView}
        activeRobotId={activeRobotId}
        robotAnimationEnabled={robotAnimationEnabled}
        cameraPresetNonce={cameraPresetNonce}
        resetNonce={resetNonce}
        onSelectPlanet={handleSelectPlanet}
        onHoverPlanet={setHoveredPlanetId}
        onSelectPart={(id) => {
          if (id) neuralAudio.playSelect();
          setSelectedPartId(id);
        }}
        onFpsUpdate={setFps}
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

      {/* Main Experience UI */}
      {hasStarted && (
        <>
          <HUD
            activeSection={activeSection}
            activeWorldName={activeWorldName}
            particleMode={particleMode}
            selectedPlanetName={selectedPlanet?.name ?? null}
            cameraStatus={cameraStatus}
            handState={handState}
            fps={fps}
            hudVisible={hudVisible}
            guideVisible={guideVisible}
            audioEnabled={audioEnabled}
            isFullscreen={isFullscreen}
            onToggleHud={() => {
              neuralAudio.playClick();
              setHudVisible((v) => !v);
            }}
            onToggleGuide={() => {
              neuralAudio.playClick();
              setGuideVisible((v) => !v);
            }}
            onToggleAudio={handleToggleAudio}
            onToggleFullscreen={handleToggleFullscreen}
            onResetExperience={handleResetExperienceWithGestures}
          />

          {hudVisible && (
            <HolographicMenu
              activeSection={activeSection}
              isWorldLabActive={activeWorld !== 'universe'}
              onSelectSection={handleSelectSection}
              onOpenWorldHub={() => {
                neuralAudio.playClick();
                setWorldHubOpen(true);
              }}
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

          {/* Robotics Lab Dedicated HUD & Selector */}
          {activeWorld === 'robotics' && (
            <RoboticsLabHUD
              activeRobotId={activeRobotId}
              selectedPartId={selectedPartId}
              exploded={exploded}
              animationEnabled={robotAnimationEnabled}
              onSelectRobot={(id) => {
                neuralAudio.playSelect();
                setActiveRobotId(id);
                setSelectedPartId(null);
                setExploded(false);
              }}
              onSelectPart={(id) => {
                if (id) neuralAudio.playSelect();
                setSelectedPartId(id);
              }}
              onSetExploded={(val) => {
                neuralAudio.playClick();
                interactionRef.current.handExplosionActive = false;
                interactionRef.current.explosionProgress = val ? 1 : 0;
                setExploded(val);
              }}
              onToggleAnimation={() => {
                neuralAudio.playClick();
                setRobotAnimationEnabled((v) => !v);
              }}
              onSelectCameraPreset={(preset) => {
                neuralAudio.playClick();
                setCameraPresetNonce((prev) => ({
                  preset,
                  nonce: (prev?.nonce ?? 0) + 1,
                }));
              }}
              onResetModel={handleResetExperienceWithGestures}
              onReturnToHub={() => {
                neuralAudio.playClick();
                setWorldHubOpen(true);
              }}
            />
          )}

          {/* Other Multi-World Lab Inspector */}
          {activeWorld !== 'universe' && activeWorld !== 'robotics' && (
            <LabInspectorPanel
              worldId={activeWorld}
              selectedPartId={selectedPartId}
              exploded={exploded}
              explosionProgress={
                handState.detectedHands >= 2
                  ? handState.explosionProgress
                  : sliderExplosion
              }
              interiorView={interiorView}
              onSelectPart={(id) => {
                if (id) neuralAudio.playSelect();
                setSelectedPartId(id);
              }}
              onSetExploded={(val) => {
                neuralAudio.playClick();
                interactionRef.current.handExplosionActive = false;
                interactionRef.current.explosionProgress = val ? 1 : 0;
                setExploded(val);
                setSliderExplosion(val ? 1 : 0);
              }}
              onExplosionSliderChange={(val) => {
                interactionRef.current.handExplosionActive = false;
                interactionRef.current.explosionProgress = val;
                setSliderExplosion(val);
                setExploded(val >= 0.5);
              }}
              onAnimateAssembly={handleAnimateAssembly}
              onToggleInterior={() => {
                neuralAudio.playTransition();
                setInteriorView((v) => !v);
              }}
              onResetModel={handleResetExperienceWithGestures}
              onReturnToHub={() => {
                neuralAudio.playClick();
                setWorldHubOpen(true);
              }}
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
