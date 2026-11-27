import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PlanetData, UniverseInteractionRef } from '../types/scene';
import { PLANETS } from '../utils/constants';
import { damp } from '../utils/smoothing';

interface PlanetItemProps {
  planet: PlanetData;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  interactionRef: React.MutableRefObject<UniverseInteractionRef>;
}

function PlanetItem({
  planet,
  isSelected,
  isHovered,
  onSelect,
  onHover,
  interactionRef,
}: PlanetItemProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const scaleRef = useRef(1);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const inter = interactionRef.current;

    if (groupRef.current) {
      const floatY = Math.sin(t * 0.8 + planet.basePosition[0]) * 0.24;
      const targetX = isSelected ? planet.basePosition[0] * 0.58 : planet.basePosition[0];
      const targetY = isSelected
        ? planet.basePosition[1] * 0.58 + floatY * 0.5
        : planet.basePosition[1] + floatY + inter.verticalOffset * 0.35;
      const targetZ = isSelected ? 2.4 : planet.basePosition[2];

      groupRef.current.position.x = damp(groupRef.current.position.x, targetX, 4.5, dt);
      groupRef.current.position.y = damp(groupRef.current.position.y, targetY, 4.5, dt);
      groupRef.current.position.z = damp(groupRef.current.position.z, targetZ, 4.5, dt);

      const targetScale = isSelected ? 1.42 : isHovered ? 1.18 : 1.0;
      scaleRef.current = damp(scaleRef.current, targetScale, 6, dt);
      groupRef.current.scale.setScalar(scaleRef.current);
    }

    if (meshRef.current) {
      meshRef.current.rotation.y += dt * planet.orbitSpeed;
      meshRef.current.rotation.x += dt * 0.08;
    }

    if (ringRef.current) {
      ringRef.current.rotation.z += dt * 0.32;
    }
  });

  return (
    <group
      ref={groupRef}
      position={planet.basePosition}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(planet.id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
        onHover(planet.id);
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
        onHover(null);
      }}
    >
      {/* Core Planet Body */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[planet.radius, 32, 32]} />
        <meshStandardMaterial
          color={planet.color}
          emissive={planet.emissiveColor}
          emissiveIntensity={isSelected ? 1.5 : isHovered ? 1.1 : 0.75}
          roughness={0.28}
          metalness={0.4}
        />
      </mesh>

      {/* Holographic Wireframe Shell */}
      {planet.wireframeOverlay && (
        <mesh>
          <icosahedronGeometry args={[planet.radius * 1.16, 1]} />
          <meshBasicMaterial
            color={planet.color}
            wireframe
            transparent
            opacity={isSelected ? 0.65 : 0.35}
          />
        </mesh>
      )}

      {/* Atmospheric Glow Halo */}
      <mesh>
        <sphereGeometry args={[planet.radius * 1.12, 24, 24]} />
        <meshBasicMaterial
          color={planet.color}
          transparent
          opacity={isSelected ? 0.25 : 0.12}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Planetary Ring */}
      {planet.hasRings && (
        <mesh ref={ringRef} rotation={[Math.PI * 0.38, 0.2, 0]}>
          <torusGeometry args={[planet.radius * 1.62, 0.018, 12, 64]} />
          <meshBasicMaterial
            color={planet.ringColor ?? planet.color}
            transparent
            opacity={isSelected ? 0.9 : 0.6}
          />
        </mesh>
      )}

      {/* Selection Reticle Ring */}
      {(isSelected || isHovered) && (
        <mesh rotation={[Math.PI * 0.5, 0, 0]}>
          <ringGeometry args={[planet.radius * 1.95, planet.radius * 2.08, 48]} />
          <meshBasicMaterial
            color="#00f0ff"
            transparent
            opacity={isSelected ? 0.9 : 0.55}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}

interface PlanetSystemProps {
  selectedPlanetId: string | null;
  hoveredPlanetId: string | null;
  onSelectPlanet: (id: string) => void;
  onHoverPlanet: (id: string | null) => void;
  interactionRef: React.MutableRefObject<UniverseInteractionRef>;
}

export function PlanetSystem({
  selectedPlanetId,
  hoveredPlanetId,
  onSelectPlanet,
  onHoverPlanet,
  interactionRef,
}: PlanetSystemProps) {
  return (
    <group>
      {PLANETS.map((planet) => (
        <PlanetItem
          key={planet.id}
          planet={planet}
          isSelected={selectedPlanetId === planet.id}
          isHovered={hoveredPlanetId === planet.id}
          onSelect={onSelectPlanet}
          onHover={onHoverPlanet}
          interactionRef={interactionRef}
        />
      ))}
    </group>
  );
}
