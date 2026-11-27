import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { UniverseInteractionRef } from '../../types/scene';
import { damp, lerp } from '../../utils/smoothing';

interface ArmorLabSceneProps {
  interactionRef: React.MutableRefObject<UniverseInteractionRef>;
  selectedPartId: string | null;
  onSelectPart: (id: string) => void;
  exploded: boolean;
}

interface PartProps {
  id: string;
  selectedPartId: string | null;
  onSelect: (id: string) => void;
  basePos: [number, number, number];
  explodedPos: [number, number, number];
  exploded: boolean;
  interactionRef: React.MutableRefObject<UniverseInteractionRef>;
  children: React.ReactNode;
}

function ArmorPartGroup({
  id,
  selectedPartId,
  onSelect,
  basePos,
  explodedPos,
  exploded,
  interactionRef,
  children,
}: PartProps) {
  const ref = useRef<THREE.Group>(null);
  const isSelected = selectedPartId === id;

  useFrame((state, delta) => {
    if (!ref.current) return;
    const dt = Math.min(delta, 0.05);
    const inter = interactionRef.current;
    const factor = inter.handExplosionActive
      ? inter.explosionProgress
      : exploded
      ? 1
      : inter.explosionProgress;
    const floatY = isSelected ? Math.sin(state.clock.elapsedTime * 3) * 0.05 : 0;

    ref.current.position.x = damp(
      ref.current.position.x,
      lerp(basePos[0], explodedPos[0], factor),
      6.5,
      dt
    );
    ref.current.position.y = damp(
      ref.current.position.y,
      lerp(basePos[1], explodedPos[1], factor) + floatY,
      6.5,
      dt
    );
    ref.current.position.z = damp(
      ref.current.position.z,
      lerp(basePos[2], explodedPos[2], factor),
      6.5,
      dt
    );
  });

  return (
    <group
      ref={ref}
      position={basePos}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    >
      {children}
    </group>
  );
}

export function ArmorLabScene({
  interactionRef,
  selectedPartId,
  onSelectPart,
  exploded,
}: ArmorLabSceneProps) {
  const rootRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const coreRingRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const inter = interactionRef.current;

    if (rootRef.current) {
      const targetScale =
        inter.activeGesture === 'TWO_HANDS'
          ? 1
          : Math.min(Math.max(inter.sphereScale, 0.72), 1.45);
      rootRef.current.scale.setScalar(damp(rootRef.current.scale.x, targetScale, 5, dt));
      rootRef.current.position.x = damp(rootRef.current.position.x, inter.pinchOffset.x * 0.65, 5, dt);
      rootRef.current.position.y = damp(
        rootRef.current.position.y,
        -0.35 + inter.pinchOffset.y * 0.45 + Math.sin(state.clock.elapsedTime * 0.8) * 0.06,
        4,
        dt
      );
    }

    if (coreRef.current) {
      const pulse =
        1 +
        Math.sin(state.clock.elapsedTime * (inter.activeGesture === 'OPEN_PALM' ? 6 : 3)) *
          0.12;
      coreRef.current.scale.setScalar(pulse * Math.min(Math.max(inter.sphereScale, 0.8), 1.35));
    }
    if (coreRingRef.current) {
      coreRingRef.current.rotation.z += dt * 1.4;
    }
  });

  const armorMat = (partId: string, baseColor = '#475569') => ({
    color: selectedPartId === partId ? '#00f0ff' : baseColor,
    emissive: selectedPartId === partId ? '#00a3ff' : '#1e3a5f',
    emissiveIntensity: selectedPartId === partId ? 1.15 : 0.42,
    metalness: 0.48,
    roughness: 0.32,
  });

  return (
    <group ref={rootRef} position={[0, -0.35, 0]}>
      {/* Pedestal Hologram Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.95, 0]}>
        <ringGeometry args={[1.6, 1.75, 64]} />
        <meshBasicMaterial color="#00f0ff" transparent opacity={0.45} side={THREE.DoubleSide} />
      </mesh>

      {/* HELMET */}
      <ArmorPartGroup
        id="helmet"
        selectedPartId={selectedPartId}
        onSelect={onSelectPart}
        basePos={[0, 1.55, 0]}
        explodedPos={[0, 2.75, 0.35]}
        exploded={exploded}
        interactionRef={interactionRef}
      >
        <mesh>
          <boxGeometry args={[0.52, 0.58, 0.56]} />
          <meshStandardMaterial {...armorMat('helmet', '#1e293b')} />
        </mesh>
        {/* Crest */}
        <mesh position={[0, 0.32, 0]}>
          <boxGeometry args={[0.16, 0.1, 0.48]} />
          <meshStandardMaterial {...armorMat('helmet', '#334155')} />
        </mesh>
        {/* Glowing Visor */}
        <mesh position={[0, 0.04, 0.29]}>
          <boxGeometry args={[0.42, 0.14, 0.04]} />
          <meshStandardMaterial
            color="#00f0ff"
            emissive="#00f0ff"
            emissiveIntensity={2.2}
          />
        </mesh>
      </ArmorPartGroup>

      {/* CHEST ARMOR */}
      <ArmorPartGroup
        id="chest"
        selectedPartId={selectedPartId}
        onSelect={onSelectPart}
        basePos={[0, 0.65, 0]}
        explodedPos={[0, 0.95, -0.85]}
        exploded={exploded}
        interactionRef={interactionRef}
      >
        <mesh>
          <boxGeometry args={[1.05, 1.05, 0.62]} />
          <meshStandardMaterial {...armorMat('chest', '#0f172a')} />
        </mesh>
        {/* Collar & Abdomen plates */}
        <mesh position={[0, -0.7, 0]}>
          <boxGeometry args={[0.78, 0.4, 0.48]} />
          <meshStandardMaterial {...armorMat('chest', '#1e293b')} />
        </mesh>
      </ArmorPartGroup>

      {/* ENERGY CORE */}
      <ArmorPartGroup
        id="energy_core"
        selectedPartId={selectedPartId}
        onSelect={onSelectPart}
        basePos={[0, 0.72, 0.34]}
        explodedPos={[0, 0.95, 1.65]}
        exploded={exploded}
        interactionRef={interactionRef}
      >
        <mesh ref={coreRingRef}>
          <torusGeometry args={[0.24, 0.035, 16, 48]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#0284c7"
            emissiveIntensity={1.2}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
        <mesh ref={coreRef}>
          <sphereGeometry args={[0.16, 24, 24]} />
          <meshStandardMaterial
            color="#00f0ff"
            emissive="#00f0ff"
            emissiveIntensity={2.8}
          />
        </mesh>
      </ArmorPartGroup>

      {/* SHOULDERS (Left & Right) */}
      <ArmorPartGroup
        id="shoulder"
        selectedPartId={selectedPartId}
        onSelect={onSelectPart}
        basePos={[-0.78, 1.02, 0]}
        explodedPos={[-1.85, 1.65, -0.15]}
        exploded={exploded}
        interactionRef={interactionRef}
      >
        <mesh rotation={[0, 0, 0.22]}>
          <boxGeometry args={[0.48, 0.42, 0.54]} />
          <meshStandardMaterial {...armorMat('shoulder', '#334155')} />
        </mesh>
      </ArmorPartGroup>
      <ArmorPartGroup
        id="shoulder"
        selectedPartId={selectedPartId}
        onSelect={onSelectPart}
        basePos={[0.78, 1.02, 0]}
        explodedPos={[1.85, 1.65, -0.15]}
        exploded={exploded}
        interactionRef={interactionRef}
      >
        <mesh rotation={[0, 0, -0.22]}>
          <boxGeometry args={[0.48, 0.42, 0.54]} />
          <meshStandardMaterial {...armorMat('shoulder', '#334155')} />
        </mesh>
      </ArmorPartGroup>

      {/* ARMS (Left & Right) */}
      <ArmorPartGroup
        id="arm"
        selectedPartId={selectedPartId}
        onSelect={onSelectPart}
        basePos={[-0.86, 0.34, 0]}
        explodedPos={[-2.05, 0.38, 0.35]}
        exploded={exploded}
        interactionRef={interactionRef}
      >
        <mesh>
          <cylinderGeometry args={[0.16, 0.14, 0.85, 16]} />
          <meshStandardMaterial {...armorMat('arm', '#1e293b')} />
        </mesh>
      </ArmorPartGroup>
      <ArmorPartGroup
        id="arm"
        selectedPartId={selectedPartId}
        onSelect={onSelectPart}
        basePos={[0.86, 0.34, 0]}
        explodedPos={[2.05, 0.38, 0.35]}
        exploded={exploded}
        interactionRef={interactionRef}
      >
        <mesh>
          <cylinderGeometry args={[0.16, 0.14, 0.85, 16]} />
          <meshStandardMaterial {...armorMat('arm', '#1e293b')} />
        </mesh>
      </ArmorPartGroup>

      {/* HANDS (Left & Right) */}
      <ArmorPartGroup
        id="hand"
        selectedPartId={selectedPartId}
        onSelect={onSelectPart}
        basePos={[-0.88, -0.25, 0.05]}
        explodedPos={[-2.25, -0.55, 0.75]}
        exploded={exploded}
        interactionRef={interactionRef}
      >
        <mesh>
          <boxGeometry args={[0.2, 0.28, 0.24]} />
          <meshStandardMaterial {...armorMat('hand', '#334155')} />
        </mesh>
      </ArmorPartGroup>
      <ArmorPartGroup
        id="hand"
        selectedPartId={selectedPartId}
        onSelect={onSelectPart}
        basePos={[0.88, -0.25, 0.05]}
        explodedPos={[2.25, -0.55, 0.75]}
        exploded={exploded}
        interactionRef={interactionRef}
      >
        <mesh>
          <boxGeometry args={[0.2, 0.28, 0.24]} />
          <meshStandardMaterial {...armorMat('hand', '#334155')} />
        </mesh>
      </ArmorPartGroup>

      {/* LEGS (Left & Right) */}
      <ArmorPartGroup
        id="leg"
        selectedPartId={selectedPartId}
        onSelect={onSelectPart}
        basePos={[-0.3, -0.95, 0]}
        explodedPos={[-0.88, -1.55, 0.25]}
        exploded={exploded}
        interactionRef={interactionRef}
      >
        <mesh>
          <cylinderGeometry args={[0.2, 0.16, 1.35, 16]} />
          <meshStandardMaterial {...armorMat('leg', '#0f172a')} />
        </mesh>
        <mesh position={[0, -0.78, 0.08]}>
          <boxGeometry args={[0.28, 0.22, 0.45]} />
          <meshStandardMaterial {...armorMat('leg', '#334155')} />
        </mesh>
      </ArmorPartGroup>
      <ArmorPartGroup
        id="leg"
        selectedPartId={selectedPartId}
        onSelect={onSelectPart}
        basePos={[0.3, -0.95, 0]}
        explodedPos={[0.88, -1.55, 0.25]}
        exploded={exploded}
        interactionRef={interactionRef}
      >
        <mesh>
          <cylinderGeometry args={[0.2, 0.16, 1.35, 16]} />
          <meshStandardMaterial {...armorMat('leg', '#0f172a')} />
        </mesh>
        <mesh position={[0, -0.78, 0.08]}>
          <boxGeometry args={[0.28, 0.22, 0.45]} />
          <meshStandardMaterial {...armorMat('leg', '#334155')} />
        </mesh>
      </ArmorPartGroup>
    </group>
  );
}
