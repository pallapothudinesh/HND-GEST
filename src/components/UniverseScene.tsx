import { Component, ComponentRef, ErrorInfo, lazy, ReactNode, Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { WORLDS } from '../data/worldsData';
import { RobotId } from '../data/roboticsData';
import { useTheme } from '../context/ThemeContext';
import { ParticleMode, UniverseInteractionRef } from '../types/scene';
import { WorldId } from '../types/worlds';
import { damp } from '../utils/smoothing';
import { EnergySphere } from './EnergySphere';
import { ParticleSystem } from './ParticleSystem';
import { PlanetSystem } from './PlanetSystem';

const ArmorLabScene = lazy(() =>
  import('./labs/ArmorLabScene').then((m) => ({ default: m.ArmorLabScene }))
);
const AutomotiveLabScene = lazy(() =>
  import('./labs/AutomotiveLabScene').then((m) => ({ default: m.AutomotiveLabScene }))
);
const EngineLabScene = lazy(() =>
  import('./labs/EngineLabScene').then((m) => ({ default: m.EngineLabScene }))
);
const RoboticsLabScene = lazy(() =>
  import('./labs/RoboticsLabScene').then((m) => ({ default: m.RoboticsLabScene }))
);
const OtherLabsScene = lazy(() =>
  import('./labs/OtherLabsScene').then((m) => ({ default: m.OtherLabsScene }))
);

interface UniverseSceneProps {
  interactionRef: React.MutableRefObject<UniverseInteractionRef>;
  activeWorld: WorldId;
  particleMode: ParticleMode;
  selectedPlanetId: string | null;
  hoveredPlanetId: string | null;
  selectedPartId: string | null;
  exploded: boolean;
  interiorView: boolean;
  activeRobotId: RobotId;
  robotAnimationEnabled: boolean;
  cameraPresetNonce?: { preset: 'front' | 'back' | 'side' | 'top'; nonce: number } | null;
  resetNonce: number;
  onSelectPlanet: (id: string | null) => void;
  onHoverPlanet: (id: string | null) => void;
  onSelectPart: (id: string | null) => void;
  onFpsUpdate?: (fps: number) => void;
  isLanding?: boolean;
  isMobile?: boolean;
}

function FloatingGeometry() {
  const groupRef = useRef<THREE.Group>(null);
  const shapes = useMemo(
    () => [
      { pos: [-9, 4, -8] as [number, number, number], scale: 0.45, color: '#00f0ff' },
      { pos: [9, -3.5, -7] as [number, number, number], scale: 0.55, color: '#8b5cf6' },
      { pos: [-7.5, -4.5, -6] as [number, number, number], scale: 0.35, color: '#3b82f6' },
      { pos: [8.2, 4.8, -9] as [number, number, number], scale: 0.5, color: '#ec4899' },
    ],
    []
  );

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const dt = Math.min(delta, 0.05);
    groupRef.current.children.forEach((child, idx) => {
      child.rotation.x += dt * (0.2 + idx * 0.05);
      child.rotation.y += dt * (0.25 + idx * 0.04);
      child.position.y += Math.sin(state.clock.elapsedTime * 0.6 + idx) * 0.002;
    });
  });

  return (
    <group ref={groupRef}>
      {shapes.map((s, i) => (
        <mesh key={i} position={s.pos} scale={s.scale}>
          <octahedronGeometry args={[1, 0]} />
          <meshBasicMaterial color={s.color} wireframe transparent opacity={0.35} />
        </mesh>
      ))}
    </group>
  );
}

function SceneRig({
  interactionRef,
  activeWorld,
  particleMode,
  selectedPlanetId,
  hoveredPlanetId,
  selectedPartId,
  exploded,
  interiorView,
  activeRobotId,
  robotAnimationEnabled,
  cameraPresetNonce,
  resetNonce,
  onSelectPlanet,
  onHoverPlanet,
  onSelectPart,
  onFpsUpdate,
  isLanding,
  isMobile,
}: UniverseSceneProps) {
  const worldGroupRef = useRef<THREE.Group>(null);
  const controlsRef = useRef<ComponentRef<typeof OrbitControls>>(null);
  const frameCount = useRef(0);
  const lastFpsTime = useRef(performance.now());
  const camTransitionRef = useRef<{ active: boolean; targetZ: number; targetPos?: [number, number, number] }>({
    active: false,
    targetZ: 9.2,
  });

  // Trigger a one-shot smooth camera transition when world, planet, or reset changes
  useEffect(() => {
    const nextZ = selectedPlanetId
      ? 8.2
      : activeWorld === 'automotive'
      ? isMobile
        ? 9.6
        : 7.8
      : activeWorld !== 'universe'
      ? isMobile
        ? 8.4
        : 6.8
      : isMobile
      ? 11.2
      : 9.2;
    camTransitionRef.current = { active: true, targetZ: nextZ };
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  }, [resetNonce, activeWorld, selectedPlanetId, isMobile]);

  // Apply Front/Back/Side/Top camera presets when triggered
  useEffect(() => {
    if (!cameraPresetNonce || !controlsRef.current) return;
    const dist = isMobile ? 8.2 : 6.4;
    const posMap: Record<'front' | 'back' | 'side' | 'top', [number, number, number]> = {
      front: [0, 0.35, dist],
      back: [0, 0.35, -dist],
      side: [dist, 0.35, 0],
      top: [0, dist, 0.2],
    };
    const p = posMap[cameraPresetNonce.preset];
    controlsRef.current.object.position.set(p[0], p[1], p[2]);
    controlsRef.current.target.set(0, 0, 0);
    controlsRef.current.update();
    camTransitionRef.current.active = false;
  }, [cameraPresetNonce, isMobile]);

  const worldTheme = useMemo(
    () => WORLDS.find((w) => w.id === activeWorld) ?? null,
    [activeWorld]
  );

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const inter = interactionRef.current;

    if (worldGroupRef.current) {
      worldGroupRef.current.rotation.y = damp(
        worldGroupRef.current.rotation.y,
        inter.rotationYaw,
        3.8,
        dt
      );
      worldGroupRef.current.position.y = damp(
        worldGroupRef.current.position.y,
        inter.verticalOffset * 0.7,
        3.8,
        dt
      );
    }

    // One-shot smooth camera Z transition (never fights OrbitControls zoom/orbit!)
    if (
      camTransitionRef.current.active &&
      !(activeWorld === 'automotive' && interiorView)
    ) {
      const targetCamZ = camTransitionRef.current.targetZ;
      state.camera.position.z = damp(state.camera.position.z, targetCamZ, 5.5, dt);
      if (Math.abs(state.camera.position.z - targetCamZ) < 0.04) {
        camTransitionRef.current.active = false;
      }
    }

    // FPS meter update every 500ms
    if (onFpsUpdate) {
      frameCount.current += 1;
      const now = performance.now();
      if (now - lastFpsTime.current >= 500) {
        const fps = Math.round((frameCount.current * 1000) / (now - lastFpsTime.current));
        onFpsUpdate(fps);
        frameCount.current = 0;
        lastFpsTime.current = now;
      }
    }
  });

  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === 'light';
  const showCosmicUniverse = isLanding || activeWorld === 'universe';
  const sceneBg = isLight ? '#f5f7fb' : '#02040a';

  return (
    <>
      <color attach="background" args={[sceneBg]} />
      <fogExp2 attach="fog" args={[sceneBg, isLight ? 0.025 : 0.042]} />

      {/* Cinematic Cosmic & Lab Lighting */}
      <ambientLight intensity={isLight ? 1.1 : activeWorld === 'universe' ? 0.55 : 0.9} />
      <hemisphereLight
        args={[
          isLight ? '#ffffff' : '#bae6fd',
          isLight ? '#cbd5e1' : '#0f172a',
          isLight ? 1.35 : activeWorld === 'universe' ? 0.6 : 1.25,
        ]}
      />
      <directionalLight position={[6, 10, 8]} intensity={isLight ? 2.1 : 1.8} color="#ffffff" />
      <directionalLight
        position={[-6, 4, -6]}
        intensity={isLight ? 1.1 : 1.1}
        color={isLight ? '#bae6fd' : '#38bdf8'}
      />
      <pointLight
        position={[0, 2, 3]}
        intensity={isLight ? 1.4 : 2.6}
        color={worldTheme?.accentColor ?? (isLight ? '#087cf0' : '#00f0ff')}
        distance={24}
      />
      <pointLight
        position={[8, 6, 6]}
        intensity={isLight ? 0.8 : 1.6}
        color={worldTheme?.secondaryColor ?? '#3b82f6'}
      />
      <pointLight position={[-8, -5, -4]} intensity={isLight ? 0.5 : 1.3} color="#8b5cf6" />
      <pointLight position={[0, 8, -8]} intensity={isLight ? 0.4 : 1.0} color="#ec4899" />

      {/* Deep Space Starfield (Dark Mode) */}
      {!isLight && (
        <Stars
          radius={65}
          depth={45}
          count={isMobile ? 1200 : activeWorld === 'universe' ? 2800 : 1100}
          factor={3.6}
          saturation={0.4}
          fade
          speed={0.5}
        />
      )}

      {/* Futuristic Spatial Grid Horizon */}
      <gridHelper
        args={[
          60,
          48,
          isLight ? '#94a3b8' : worldTheme?.gridColor ?? '#0ea5e9',
          isLight ? '#dbeafe' : '#0a1938',
        ]}
        position={[0, -5.8, 0]}
      />

      <FloatingGeometry />

      {/* Main Gesture-Responsive Universe / Lab Group */}
      <group ref={worldGroupRef}>
        {activeWorld !== 'automotive' && (
          <ParticleSystem
            mode={particleMode}
            interactionRef={interactionRef}
            count={isMobile ? 950 : activeWorld === 'universe' ? 2400 : 1000}
          />
        )}

        {showCosmicUniverse ? (
          <>
            <EnergySphere interactionRef={interactionRef} isLanding={isLanding} />
            {!isLanding && (
              <PlanetSystem
                selectedPlanetId={selectedPlanetId}
                hoveredPlanetId={hoveredPlanetId}
                onSelectPlanet={(id) => onSelectPlanet(id)}
                onHoverPlanet={onHoverPlanet}
                interactionRef={interactionRef}
              />
            )}
          </>
        ) : (
          <Suspense
            fallback={
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
                <ringGeometry args={[0.85, 1.0, 48]} />
                <meshBasicMaterial color="#00f0ff" transparent opacity={0.7} side={THREE.DoubleSide} />
              </mesh>
            }
          >
            {activeWorld === 'armor' ? (
              <ArmorLabScene
                interactionRef={interactionRef}
                selectedPartId={selectedPartId}
                onSelectPart={onSelectPart}
                exploded={exploded}
              />
            ) : activeWorld === 'automotive' ? (
              <AutomotiveLabScene
                interactionRef={interactionRef}
                selectedPartId={selectedPartId}
                onSelectPart={onSelectPart}
                interiorView={interiorView}
                exploded={exploded}
              />
            ) : activeWorld === 'engineering' ? (
              <EngineLabScene
                interactionRef={interactionRef}
                selectedPartId={selectedPartId}
                onSelectPart={onSelectPart}
                exploded={exploded}
              />
            ) : activeWorld === 'robotics' ? (
              <RoboticsLabScene
                interactionRef={interactionRef}
                activeRobotId={activeRobotId}
                selectedPartId={selectedPartId}
                onSelectPart={onSelectPart}
                exploded={exploded}
                animationEnabled={robotAnimationEnabled}
              />
            ) : (
              <OtherLabsScene
                worldId={activeWorld}
                interactionRef={interactionRef}
                selectedPartId={selectedPartId}
                onSelectPart={onSelectPart}
              />
            )}
          </Suspense>
        )}
      </group>

      {!isLanding && (
        <OrbitControls
          ref={controlsRef}
          enabled={!(activeWorld === 'automotive' && interiorView)}
          enablePan={false}
          enableDamping
          dampingFactor={0.05}
          minDistance={2.2}
          maxDistance={16}
          rotateSpeed={0.55}
          zoomSpeed={0.7}
          onStart={() => {
            camTransitionRef.current.active = false;
          }}
        />
      )}
    </>
  );
}

class WebGLErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('WebGL rendering error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 flex items-center justify-center bg-[#02040a] p-6 text-center">
          <div className="glass-panel-strong max-w-md rounded-2xl p-8">
            <h2 className="font-display text-xl tracking-widest text-neon-cyan">
              WEBGL CONTEXT UNAVAILABLE
            </h2>
            <p className="mt-3 text-sm text-slate-300">
              Your browser or GPU driver could not initialize the 3D WebGL universe.
              Please enable hardware acceleration or try a modern Chromium/Firefox browser.
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export function UniverseScene(props: UniverseSceneProps) {
  return (
    <WebGLErrorBoundary>
      <div className="fixed inset-0 z-0">
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 0.4, 9.2], fov: 50, near: 0.1, far: 150 }}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
          onPointerMissed={() => props.onSelectPlanet(null)}
        >
          <SceneRig {...props} />
        </Canvas>
      </div>
    </WebGLErrorBoundary>
  );
}
