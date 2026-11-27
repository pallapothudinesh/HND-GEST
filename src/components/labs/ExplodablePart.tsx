import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { UniverseInteractionRef } from '../../types/scene';
import { damp, lerp } from '../../utils/smoothing';

interface ExplodablePartProps {
  id?: string;
  basePos: [number, number, number];
  explodedPos: [number, number, number];
  baseRot?: [number, number, number];
  explodedRot?: [number, number, number];
  interactionRef: React.MutableRefObject<UniverseInteractionRef>;
  manualExploded: boolean;
  onSelect?: (id: string) => void;
  floatPhase?: number;
  children: React.ReactNode;
}

/**
 * Reusable 3D component wrapper supporting continuous real-time hand-controlled
 * separation (0..1) in position + rotation, subtle zero-G floating when separated,
 * and manual Assembled/Exploded button toggles.
 */
export function ExplodablePart({
  id,
  basePos,
  explodedPos,
  baseRot = [0, 0, 0],
  explodedRot,
  interactionRef,
  manualExploded,
  onSelect,
  floatPhase = 0,
  children,
}: ExplodablePartProps) {
  const ref = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!ref.current) return;
    const dt = Math.min(delta, 0.05);
    const inter = interactionRef.current;

    const factor = inter.handExplosionActive
      ? inter.explosionProgress
      : manualExploded
      ? 1
      : inter.explosionProgress;

    const floatY =
      factor > 0.08
        ? Math.sin(state.clock.elapsedTime * 1.4 + floatPhase) * 0.045 * factor
        : 0;

    const tx = lerp(basePos[0], explodedPos[0], factor);
    const ty = lerp(basePos[1], explodedPos[1], factor) + floatY;
    const tz = lerp(basePos[2], explodedPos[2], factor);

    ref.current.position.x = damp(ref.current.position.x, tx, 6.0, dt);
    ref.current.position.y = damp(ref.current.position.y, ty, 6.0, dt);
    ref.current.position.z = damp(ref.current.position.z, tz, 6.0, dt);

    if (explodedRot) {
      ref.current.rotation.x = damp(
        ref.current.rotation.x,
        lerp(baseRot[0], explodedRot[0], factor),
        6.0,
        dt
      );
      ref.current.rotation.y = damp(
        ref.current.rotation.y,
        lerp(baseRot[1], explodedRot[1], factor),
        6.0,
        dt
      );
      ref.current.rotation.z = damp(
        ref.current.rotation.z,
        lerp(baseRot[2], explodedRot[2], factor),
        6.0,
        dt
      );
    }
  });

  return (
    <group
      ref={ref}
      position={basePos}
      rotation={baseRot}
      onClick={
        onSelect && id
          ? (e) => {
              e.stopPropagation();
              onSelect(id);
            }
          : undefined
      }
      onPointerOver={
        onSelect && id
          ? (e) => {
              e.stopPropagation();
              document.body.style.cursor = 'pointer';
            }
          : undefined
      }
      onPointerOut={
        onSelect && id
          ? () => {
              document.body.style.cursor = 'auto';
            }
          : undefined
      }
    >
      {children}
    </group>
  );
}
