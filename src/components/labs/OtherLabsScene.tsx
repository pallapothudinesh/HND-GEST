import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { UniverseInteractionRef } from '../../types/scene';
import { WorldId } from '../../types/worlds';
import { damp } from '../../utils/smoothing';

interface OtherLabsSceneProps {
  worldId: Extract<WorldId, 'space' | 'science' | 'digital_art' | 'future_tech'>;
  interactionRef: React.MutableRefObject<UniverseInteractionRef>;
  selectedPartId: string | null;
  onSelectPart: (id: string) => void;
}

export function OtherLabsScene({
  worldId,
  interactionRef,
  selectedPartId,
  onSelectPart,
}: OtherLabsSceneProps) {
  const rootRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  const dnaPairs = useMemo(() => {
    return Array.from({ length: 16 }, (_, i) => {
      const y = (i - 7.5) * 0.28;
      const angle = i * 0.48;
      return { y, angle };
    });
  }, []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const inter = interactionRef.current;

    if (rootRef.current) {
      rootRef.current.scale.setScalar(
        damp(rootRef.current.scale.x, Math.min(Math.max(inter.sphereScale, 0.7), 1.5), 5, dt)
      );
      rootRef.current.rotation.y += dt * (worldId === 'digital_art' ? 0.35 : 0.2);
    }

    if (ringRef.current) {
      ringRef.current.rotation.z += dt * 0.6;
      ringRef.current.rotation.x = Math.sin(t * 0.5) * 0.3;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z -= dt * 0.45;
      ring2Ref.current.rotation.y = Math.cos(t * 0.4) * 0.35;
    }
  });

  if (worldId === 'space') {
    return (
      <group ref={rootRef}>
        {/* Central Command Spire */}
        <mesh
          onClick={(e) => {
            e.stopPropagation();
            onSelectPart('command_spire');
          }}
        >
          <cylinderGeometry args={[0.32, 0.45, 3.6, 20]} />
          <meshStandardMaterial
            color={selectedPartId === 'command_spire' ? '#00f0ff' : '#cbd5e1'}
            metalness={0.85}
            roughness={0.2}
          />
        </mesh>
        {/* Rotating Habitat Ring */}
        <mesh
          ref={ringRef}
          rotation={[Math.PI / 2.2, 0, 0]}
          onClick={(e) => {
            e.stopPropagation();
            onSelectPart('habitat_ring');
          }}
        >
          <torusGeometry args={[2.1, 0.18, 16, 64]} />
          <meshStandardMaterial
            color={selectedPartId === 'habitat_ring' ? '#ec4899' : '#3b82f6'}
            emissive="#1d4ed8"
            emissiveIntensity={0.6}
            metalness={0.8}
            roughness={0.22}
          />
        </mesh>
        {/* Photovoltaic Solar Wings */}
        <group
          onClick={(e) => {
            e.stopPropagation();
            onSelectPart('solar_arrays');
          }}
        >
          <mesh position={[-2.6, 0.8, 0]}>
            <boxGeometry args={[2.2, 0.04, 0.9]} />
            <meshStandardMaterial color="#0284c7" emissive="#0369a1" emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[2.6, 0.8, 0]}>
            <boxGeometry args={[2.2, 0.04, 0.9]} />
            <meshStandardMaterial color="#0284c7" emissive="#0369a1" emissiveIntensity={0.5} />
          </mesh>
        </group>
      </group>
    );
  }

  if (worldId === 'science') {
    return (
      <group ref={rootRef}>
        {/* DNA Double Helix */}
        <group
          onClick={(e) => {
            e.stopPropagation();
            onSelectPart('dna_helix');
          }}
        >
          {dnaPairs.map((pair, idx) => {
            const x1 = Math.cos(pair.angle) * 0.85;
            const z1 = Math.sin(pair.angle) * 0.85;
            return (
              <group key={idx} position={[0, pair.y, 0]}>
                <mesh position={[x1, 0, z1]}>
                  <sphereGeometry args={[0.11, 14, 14]} />
                  <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={1.2} />
                </mesh>
                <mesh position={[-x1, 0, -z1]}>
                  <sphereGeometry args={[0.11, 14, 14]} />
                  <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={1.2} />
                </mesh>
                <mesh rotation={[0, -pair.angle, Math.PI / 2]}>
                  <cylinderGeometry args={[0.025, 0.025, 1.7, 8]} />
                  <meshBasicMaterial color="#7dd3fc" transparent opacity={0.6} />
                </mesh>
              </group>
            );
          })}
        </group>

        {/* Quantum Orbital Rings */}
        <group
          onClick={(e) => {
            e.stopPropagation();
            onSelectPart('quantum_atom');
          }}
        >
          <mesh ref={ringRef}>
            <torusGeometry args={[2.35, 0.02, 12, 80]} />
            <meshBasicMaterial color="#10b981" transparent opacity={0.7} />
          </mesh>
          <mesh ref={ring2Ref}>
            <torusGeometry args={[2.35, 0.02, 12, 80]} />
            <meshBasicMaterial color="#00f0ff" transparent opacity={0.7} />
          </mesh>
        </group>
      </group>
    );
  }

  if (worldId === 'digital_art') {
    return (
      <group ref={rootRef}>
        <mesh
          onClick={(e) => {
            e.stopPropagation();
            onSelectPart('torus_sculpture');
          }}
        >
          <torusKnotGeometry args={[1.35, 0.36, 180, 28, 2, 3]} />
          <meshStandardMaterial
            color="#ec4899"
            emissive="#8b5cf6"
            emissiveIntensity={1.3}
            wireframe
          />
        </mesh>
        <mesh
          ref={ringRef}
          onClick={(e) => {
            e.stopPropagation();
            onSelectPart('orbital_halo');
          }}
        >
          <torusGeometry args={[2.6, 0.025, 16, 100]} />
          <meshBasicMaterial color="#00f0ff" transparent opacity={0.8} />
        </mesh>
      </group>
    );
  }

  // FUTURE TECHNOLOGY: Quantum Neural Core
  return (
    <group ref={rootRef}>
      <group
        onClick={(e) => {
          e.stopPropagation();
          onSelectPart('quantum_chip');
        }}
      >
        <mesh>
          <octahedronGeometry args={[0.95, 0]} />
          <meshStandardMaterial
            color="#00f0ff"
            emissive="#0284c7"
            emissiveIntensity={1.5}
            metalness={0.9}
            roughness={0.15}
          />
        </mesh>
        <mesh>
          <boxGeometry args={[1.45, 0.16, 1.45]} />
          <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>
      <group
        onClick={(e) => {
          e.stopPropagation();
          onSelectPart('mag_rings');
        }}
      >
        <mesh ref={ringRef} rotation={[Math.PI / 3, 0, 0]}>
          <torusGeometry args={[2.0, 0.04, 16, 80]} />
          <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={1.4} />
        </mesh>
        <mesh ref={ring2Ref} rotation={[-Math.PI / 3, 0.4, 0]}>
          <torusGeometry args={[2.35, 0.03, 16, 80]} />
          <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={1.4} />
        </mesh>
      </group>
    </group>
  );
}
