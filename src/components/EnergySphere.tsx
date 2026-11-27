import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { UniverseInteractionRef } from '../types/scene';
import { damp } from '../utils/smoothing';

interface EnergySphereProps {
  interactionRef: React.MutableRefObject<UniverseInteractionRef>;
  isLanding?: boolean;
}

export function EnergySphere({ interactionRef, isLanding = false }: EnergySphereProps) {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const innerWireRef = useRef<THREE.Mesh>(null);
  const outerWireRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);
  const waveRingRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Points>(null);

  const currentScale = useRef(1);
  const lastWaveTime = useRef(0);
  const waveProgress = useRef(1);

  // Particle halo around the central sphere
  const haloPositions = useMemo(() => {
    const count = 420;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.68 + (Math.random() - 0.5) * 0.42;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    return positions;
  }, []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const inter = interactionRef.current;

    const targetScale = isLanding ? 1.05 : inter.sphereScale;
    currentScale.current = damp(currentScale.current, targetScale, 5.5, dt);

    if (groupRef.current) {
      groupRef.current.scale.setScalar(currentScale.current);
      groupRef.current.position.x = damp(groupRef.current.position.x, inter.pinchOffset.x, 6, dt);
      groupRef.current.position.y = damp(
        groupRef.current.position.y,
        inter.pinchOffset.y + Math.sin(t * 0.9) * 0.08,
        6,
        dt
      );
      groupRef.current.position.z = damp(groupRef.current.position.z, inter.pinchOffset.z, 6, dt);
    }

    // Pulsating inner core
    if (coreRef.current) {
      const pulseSpeed = inter.activeGesture === 'OPEN_PALM' ? 4.2 : 2.2;
      const pulse = 1 + Math.sin(t * pulseSpeed) * 0.06;
      coreRef.current.scale.setScalar(pulse);
      coreRef.current.rotation.y += dt * 0.35;
      coreRef.current.rotation.x += dt * 0.15;
    }

    if (innerWireRef.current) {
      innerWireRef.current.rotation.y -= dt * 0.28;
      innerWireRef.current.rotation.z += dt * 0.14;
    }

    if (outerWireRef.current) {
      outerWireRef.current.rotation.y += dt * 0.18;
      outerWireRef.current.rotation.x -= dt * 0.12;
    }

    // Rotating orbital rings
    const ringBoost = inter.activeGesture === 'OPEN_PALM' ? 1.9 : inter.activeGesture === 'CLOSED_FIST' ? 0.5 : 1.0;
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += dt * 0.45 * ringBoost;
      ring1Ref.current.rotation.x = Math.PI * 0.36 + Math.sin(t * 0.4) * 0.08;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z -= dt * 0.35 * ringBoost;
      ring2Ref.current.rotation.y = Math.PI * 0.28 + Math.cos(t * 0.35) * 0.08;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.z += dt * 0.25 * ringBoost;
    }

    if (haloRef.current) {
      haloRef.current.rotation.y += dt * 0.14;
      haloRef.current.rotation.x = Math.sin(t * 0.25) * 0.12;
    }

    // Shockwave animation on OPEN_PALM trigger
    if (inter.wavePulse !== lastWaveTime.current) {
      lastWaveTime.current = inter.wavePulse;
      waveProgress.current = 0;
    }

    if (waveRingRef.current) {
      if (waveProgress.current < 1) {
        waveProgress.current = Math.min(waveProgress.current + dt * 1.4, 1);
        const s = 1.2 + waveProgress.current * 2.8;
        waveRingRef.current.scale.setScalar(s);
        const mat = waveRingRef.current.material as THREE.MeshBasicMaterial;
        mat.opacity = (1 - waveProgress.current) * 0.65;
        waveRingRef.current.visible = true;
      } else {
        waveRingRef.current.visible = false;
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* Inner glowing plasma core */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.78, 4]} />
        <meshStandardMaterial
          color="#00f0ff"
          emissive="#00b4ff"
          emissiveIntensity={2.2}
          roughness={0.18}
          metalness={0.35}
        />
      </mesh>

      {/* Mid translucent violet-blue energy shell */}
      <mesh ref={innerWireRef}>
        <icosahedronGeometry args={[1.08, 2]} />
        <meshBasicMaterial
          color="#8b5cf6"
          wireframe
          transparent
          opacity={0.42}
        />
      </mesh>

      {/* Outer holographic cyan wireframe sphere */}
      <mesh ref={outerWireRef}>
        <icosahedronGeometry args={[1.38, 3]} />
        <meshBasicMaterial
          color="#00f0ff"
          wireframe
          transparent
          opacity={0.28}
        />
      </mesh>

      {/* Orbital Ring 1 */}
      <mesh ref={ring1Ref} rotation={[Math.PI * 0.36, 0.2, 0]}>
        <torusGeometry args={[1.82, 0.014, 16, 120]} />
        <meshBasicMaterial color="#00f0ff" transparent opacity={0.75} />
      </mesh>

      {/* Orbital Ring 2 */}
      <mesh ref={ring2Ref} rotation={[-Math.PI * 0.28, Math.PI * 0.28, 0]}>
        <torusGeometry args={[2.12, 0.011, 16, 120]} />
        <meshBasicMaterial color="#8b5cf6" transparent opacity={0.65} />
      </mesh>

      {/* Orbital Ring 3 */}
      <mesh ref={ring3Ref} rotation={[Math.PI * 0.48, -0.35, 0]}>
        <torusGeometry args={[2.42, 0.008, 16, 120]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.5} />
      </mesh>

      {/* Expansion Shockwave Ring */}
      <mesh ref={waveRingRef} visible={false}>
        <ringGeometry args={[0.96, 1.02, 64]} />
        <meshBasicMaterial
          color="#00f0ff"
          transparent
          opacity={0}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Tight particle halo */}
      <points ref={haloRef} raycast={() => null}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={haloPositions.length / 3}
            array={haloPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#7dd3fc"
          size={0.032}
          transparent
          opacity={0.85}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
