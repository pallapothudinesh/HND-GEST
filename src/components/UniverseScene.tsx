import { Component, ComponentRef, ErrorInfo, lazy, memo, ReactNode, Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { WORLDS } from '../data/worldsData';
import { useTheme } from '../context/ThemeContext';
import { ParticleMode, UniverseInteractionRef } from '../types/scene';
import { WorldId } from '../types/worlds';
import { damp } from '../utils/smoothing';
import { EnergySphere } from './EnergySphere';
import { ParticleSystem } from './ParticleSystem';
import { PlanetSystem } from './PlanetSystem';

const AutomotiveLabScene = lazy(() =>
  import('./labs/AutomotiveLabScene').then((m) => ({ default: m.AutomotiveLabScene }))
);
const EngineLabScene = lazy(() =>
  import('./labs/EngineLabScene').then((m) => ({ default: m.EngineLabScene }))
);
const JetEngineLabScene = lazy(() =>
  import('./labs/JetEngineLabScene').then((m) => ({ default: m.JetEngineLabScene }))
);
const LaptopLabScene = lazy(() =>
  import('./labs/LaptopLabScene').then((m) => ({ default: m.LaptopLabScene }))
);
const SatelliteLabScene = lazy(() =>
  import('./labs/SatelliteLabScene').then((m) => ({ default: m.SatelliteLabScene }))
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

function LandingBackdrop({ isLight, isMobile }: { isLight: boolean; isMobile?: boolean }) {
  const ringsRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const sweepLightRef = useRef<THREE.PointLight>(null);

  const particleCount = isMobile ? 160 : 320;
  const particlePositions = useMemo(() => {
    const arr = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const radius = 3.2 + Math.random() * 11.5;
      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.35) * 8.5;
      arr[i * 3] = Math.cos(theta) * radius;
      arr[i * 3 + 1] = y;
      arr[i * 3 + 2] = Math.sin(theta) * radius - 1.5;
    }
    return arr;
  }, [particleCount]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;

    if (ringsRef.current) {
      ringsRef.current.children.forEach((ring, idx) => {
        ring.rotation.z += dt * (0.08 + idx * 0.045) * (idx % 2 === 0 ? 1 : -1);
        ring.rotation.x = Math.PI / 2 + Math.sin(t * 0.35 + idx * 1.1) * 0.14;
        ring.rotation.y = Math.cos(t * 0.25 + idx) * 0.12;
      });
    }

    if (particlesRef.current) {
      particlesRef.current.rotation.y += dt * 0.045;
      particlesRef.current.position.y = Math.sin(t * 0.4) * 0.22;
    }

    if (sweepLightRef.current) {
      const angle = t * 0.55;
      sweepLightRef.current.position.set(
        Math.cos(angle) * 6.5,
        2.1 + Math.sin(t * 0.45) * 0.8,
        Math.sin(angle) * 6.5
      );
      sweepLightRef.current.intensity = isLight ? 1.8 : 3.2 + Math.sin(t * 1.2) * 0.6;
    }
  });

  const ringColorA = isLight ? '#0284c7' : '#00f0ff';
  const ringColorB = isLight ? '#4f46e5' : '#8b5cf6';
  const particleColor = isLight ? '#0ea5e9' : '#38bdf8';

  return (
    <group>
      {/* Dynamic Studio Light Sweep */}
      <pointLight
        ref={sweepLightRef}
        position={[5, 2.2, 4]}
        intensity={isLight ? 1.8 : 3.2}
        color={isLight ? '#38bdf8' : '#00f0ff'}
        distance={22}
      />

      {/* Animated Orbital Telemetry Rings */}
      <group ref={ringsRef} position={[isMobile ? 0 : 1.55, -0.55, -0.4]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[3.4, 0.014, 12, 96]} />
          <meshBasicMaterial color={ringColorA} transparent opacity={isLight ? 0.28 : 0.42} />
        </mesh>
        <mesh rotation={[Math.PI / 2 + 0.18, 0.12, 0]}>
          <torusGeometry args={[4.35, 0.01, 12, 96]} />
          <meshBasicMaterial color={ringColorB} transparent opacity={isLight ? 0.2 : 0.3} />
        </mesh>
        <mesh rotation={[Math.PI / 2 - 0.15, -0.1, 0]}>
          <torusGeometry args={[5.4, 0.008, 10, 96]} />
          <meshBasicMaterial color={ringColorA} transparent opacity={isLight ? 0.14 : 0.2} />
        </mesh>
      </group>

      {/* Drifting Volumetric Cosmic/Studio Particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particlePositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color={particleColor}
          size={isMobile ? 0.065 : 0.055}
          transparent
          opacity={isLight ? 0.45 : 0.68}
          sizeAttenuation
          depthWrite={false}
          blending={isLight ? THREE.NormalBlending : THREE.AdditiveBlending}
        />
      </points>
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

  // Normalize showcase rotation when leaving landing so hand-gesture damp never unwinds multiple turns
  useEffect(() => {
    if (!isLanding && worldGroupRef.current) {
      const twoPi = Math.PI * 2;
      const wrapped = ((worldGroupRef.current.rotation.y % twoPi) + twoPi) % twoPi;
      worldGroupRef.current.rotation.y = wrapped > Math.PI ? wrapped - twoPi : wrapped;
    }
  }, [isLanding]);

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
      if (isLanding) {
        const t = state.clock.elapsedTime;
        worldGroupRef.current.rotation.y += dt * 0.18;
        worldGroupRef.current.position.y = damp(
          worldGroupRef.current.position.y,
          Math.sin(t * 0.75) * 0.06,
          4.0,
          dt
        );
      } else {
        worldGroupRef.current.rotation.y = damp(
          worldGroupRef.current.rotation.y,
          inter.rotationYaw,
          7.2,
          dt
        );
        worldGroupRef.current.position.y = damp(
          worldGroupRef.current.position.y,
          inter.verticalOffset * 0.7,
          7.2,
          dt
        );
      }
    }

    if (isLanding) {
      const t = state.clock.elapsedTime;
      state.camera.position.x = damp(state.camera.position.x, Math.sin(t * 0.22) * 0.55, 2.8, dt);
      state.camera.position.y = damp(state.camera.position.y, 0.45 + Math.sin(t * 0.34) * 0.16, 2.8, dt);
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
  const showCosmicUniverse = !isLanding && activeWorld === 'universe';
  const sceneBg = isLight ? '#f4f6fa' : showCosmicUniverse ? '#02040a' : '#090b10';

  return (
    <>
      <color attach="background" args={[sceneBg]} />
      <fogExp2 attach="fog" args={[sceneBg, isLight ? 0.018 : showCosmicUniverse ? 0.042 : 0.022]} />

      {/* Studio & Cosmic Lighting */}
      <ambientLight intensity={isLight ? 1.15 : showCosmicUniverse ? 0.55 : 0.85} />
      <hemisphereLight
        args={[
          isLight ? '#ffffff' : '#e2e8f0',
          isLight ? '#cbd5e1' : '#0f172a',
          isLight ? 1.35 : showCosmicUniverse ? 0.6 : 1.15,
        ]}
      />
      <directionalLight position={[6, 10, 8]} intensity={isLight ? 2.1 : 1.9} color="#ffffff" />
      <directionalLight
        position={[-6, 5, -6]}
        intensity={isLight ? 1.1 : 1.0}
        color={isLight ? '#e0f2fe' : '#93c5fd'}
      />
      {showCosmicUniverse && (
        <>
          <pointLight
            position={[0, 2, 3]}
            intensity={isLight ? 1.4 : 2.6}
            color={worldTheme?.accentColor ?? (isLight ? '#087cf0' : '#00f0ff')}
            distance={24}
          />
          <pointLight position={[-8, -5, -4]} intensity={isLight ? 0.5 : 1.3} color="#8b5cf6" />
          <pointLight position={[0, 8, -8]} intensity={isLight ? 0.4 : 1.0} color="#ec4899" />
        </>
      )}

      {/* Deep Space Starfield only in Cosmic Universe */}
      {!isLight && showCosmicUniverse && (
        <Stars
          radius={65}
          depth={45}
          count={isMobile ? 750 : 1400}
          factor={3.6}
          saturation={0.4}
          fade
          speed={0.4}
        />
      )}

      {/* Grounded Studio Contact Shadows in Labs */}
      {!showCosmicUniverse && (
        <ContactShadows
          position={[0, -0.81, 0]}
          opacity={isLight ? 0.42 : 0.62}
          scale={12}
          blur={2.2}
          far={4.5}
          resolution={256}
          frames={1}
        />
      )}

      {/* Subtle Spatial Grid */}
      <gridHelper
        args={[
          60,
          48,
          isLight ? '#cbd5e1' : showCosmicUniverse ? '#0ea5e9' : '#1e293b',
          isLight ? '#e2e8f0' : '#0f172a',
        ]}
        position={[0, showCosmicUniverse ? -5.8 : -0.85, 0]}
      />

      {showCosmicUniverse && <FloatingGeometry />}
      {isLanding && <LandingBackdrop isLight={isLight} isMobile={isMobile} />}

      {/* Main Gesture-Responsive Studio Group */}
      <group ref={worldGroupRef}>
        {showCosmicUniverse && (
          <ParticleSystem
            mode={particleMode}
            interactionRef={interactionRef}
            count={isMobile ? 950 : 2200}
          />
        )}

        {showCosmicUniverse ? (
          <>
            <EnergySphere interactionRef={interactionRef} isLanding={isLanding} />
            {!isLanding && (
              <PlanetSystem
                selectedPlanetId={selectedPlanetId}
                hoveredPlanetId={hoveredPlanetId}
                onSelectPlanet={onSelectPlanet}
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
            {activeWorld === 'automotive' ? (
              <group position={[isLanding && !isMobile ? 1.55 : 0, 0, 0]}>
                <AutomotiveLabScene
                  interactionRef={interactionRef}
                  selectedPartId={selectedPartId}
                  onSelectPart={onSelectPart}
                  interiorView={interiorView}
                  exploded={exploded}
                />
              </group>
            ) : activeWorld === 'engineering' ? (
              <EngineLabScene
                interactionRef={interactionRef}
                selectedPartId={selectedPartId}
                onSelectPart={onSelectPart}
                exploded={exploded}
              />
            ) : activeWorld === 'jet_engine' ? (
              <JetEngineLabScene
                interactionRef={interactionRef}
                selectedPartId={selectedPartId}
                onSelectPart={onSelectPart}
                exploded={exploded}
              />
            ) : activeWorld === 'laptop' ? (
              <LaptopLabScene
                interactionRef={interactionRef}
                selectedPartId={selectedPartId}
                onSelectPart={onSelectPart}
                exploded={exploded}
              />
            ) : activeWorld === 'satellite' ? (
              <SatelliteLabScene
                interactionRef={interactionRef}
                selectedPartId={selectedPartId}
                onSelectPart={onSelectPart}
                exploded={exploded}
              />
            ) : null}
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

export const UniverseScene = memo(function UniverseScene(props: UniverseSceneProps) {
  return (
    <WebGLErrorBoundary>
      <div className="fixed inset-0 z-0">
        <Canvas
          dpr={[1, 1.35]}
          shadows={false}
          camera={{ position: [0, 0.4, 9.2], fov: 50, near: 0.1, far: 150 }}
          gl={{
            antialias: true,
            powerPreference: 'high-performance',
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.08,
          }}
          onPointerMissed={() => {
            if (props.activeWorld === 'universe' && props.selectedPlanetId !== null) {
              props.onSelectPlanet(null);
            }
          }}
        >
          <SceneRig {...props} />
        </Canvas>
      </div>
    </WebGLErrorBoundary>
  );
});
