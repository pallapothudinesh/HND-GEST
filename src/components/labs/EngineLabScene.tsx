import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { UniverseInteractionRef } from '../../types/scene';
import { damp, lerp } from '../../utils/smoothing';

interface EngineLabSceneProps {
  interactionRef: React.MutableRefObject<UniverseInteractionRef>;
  selectedPartId: string | null;
  onSelectPart: (id: string) => void;
  exploded: boolean;
}

function ExplodablePart({
  id,
  basePos,
  explodedPos,
  exploded,
  interactionRef,
  onSelect,
  children,
}: {
  id: string;
  basePos: [number, number, number];
  explodedPos: [number, number, number];
  exploded: boolean;
  interactionRef: React.MutableRefObject<UniverseInteractionRef>;
  onSelect: (id: string) => void;
  children: React.ReactNode;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (!ref.current) return;
    const dt = Math.min(delta, 0.05);
    const inter = interactionRef.current;
    const factor = inter.handExplosionActive
      ? inter.explosionProgress
      : exploded
      ? 1
      : inter.explosionProgress;
    ref.current.position.x = damp(ref.current.position.x, lerp(basePos[0], explodedPos[0], factor), 6.5, dt);
    ref.current.position.y = damp(ref.current.position.y, lerp(basePos[1], explodedPos[1], factor), 6.5, dt);
    ref.current.position.z = damp(ref.current.position.z, lerp(basePos[2], explodedPos[2], factor), 6.5, dt);
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

export function EngineLabScene({
  interactionRef,
  selectedPartId,
  onSelectPart,
  exploded,
}: EngineLabSceneProps) {
  const rootRef = useRef<THREE.Group>(null);
  const crankRef = useRef<THREE.Group>(null);
  const pistonRefs = useRef<(THREE.Mesh | null)[]>([]);
  const rodRefs = useRef<(THREE.Mesh | null)[]>([]);
  const valveRefs = useRef<(THREE.Mesh | null)[]>([]);
  const turboWheelRef = useRef<THREE.Mesh>(null);
  const fanRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime * 3.8;
    const inter = interactionRef.current;

    if (rootRef.current) {
      const targetScale =
        inter.activeGesture === 'TWO_HANDS'
          ? 1
          : Math.min(Math.max(inter.sphereScale, 0.72), 1.45);
      rootRef.current.scale.setScalar(damp(rootRef.current.scale.x, targetScale, 5, dt));
      rootRef.current.position.x = damp(rootRef.current.position.x, inter.pinchOffset.x * 0.6, 5, dt);
      rootRef.current.position.y = damp(rootRef.current.position.y, -0.1 + inter.pinchOffset.y * 0.45, 5, dt);
    }

    if (crankRef.current) {
      crankRef.current.rotation.z = -t;
    }

    // 4-cylinder firing offsets: 0, PI, PI, 0
    const phases = [0, Math.PI, Math.PI, 0];
    phases.forEach((phase, idx) => {
      const stroke = Math.sin(t + phase) * 0.24;
      const p = pistonRefs.current[idx];
      if (p) p.position.y = stroke;

      const r = rodRefs.current[idx];
      if (r) {
        r.position.y = stroke - 0.35;
        r.rotation.z = Math.cos(t + phase) * 0.16;
      }

      const v = valveRefs.current[idx];
      if (v) {
        v.position.y = -Math.max(0, Math.sin(t + phase + 1.2)) * 0.09;
      }
    });

    if (turboWheelRef.current) {
      turboWheelRef.current.rotation.z += dt * 12;
    }
    if (fanRef.current) {
      fanRef.current.rotation.z -= dt * 5;
    }
  });

  const mat = (id: string, base: string, metal = 0.48, rough = 0.3) => ({
    color: selectedPartId === id ? '#f59e0b' : base,
    emissive: selectedPartId === id ? '#d97706' : '#1e293b',
    emissiveIntensity: selectedPartId === id ? 1.05 : 0.35,
    metalness: metal,
    roughness: rough,
  });

  const cylOffsets = [-0.9, -0.3, 0.3, 0.9];

  return (
    <group ref={rootRef} position={[0, -0.1, 0]}>
      {/* ENGINE BLOCK (Semi-transparent cutaway so pistons are visible!) */}
      <ExplodablePart
        id="engine_block"
        basePos={[0, 0, 0]}
        explodedPos={[0, 0, -0.7]}
        exploded={exploded}
        interactionRef={interactionRef}
        onSelect={onSelectPart}
      >
        <mesh>
          <boxGeometry args={[2.5, 1.0, 1.05]} />
          <meshStandardMaterial
            {...mat('engine_block', '#475569')}
            transparent
            opacity={0.42}
          />
        </mesh>
      </ExplodablePart>

      {/* CYLINDER HEAD */}
      <ExplodablePart
        id="cylinder_head"
        basePos={[0, 0.78, 0]}
        explodedPos={[0, 1.75, 0]}
        exploded={exploded}
        interactionRef={interactionRef}
        onSelect={onSelectPart}
      >
        <mesh>
          <boxGeometry args={[2.55, 0.45, 1.1]} />
          <meshStandardMaterial {...mat('cylinder_head', '#64748b')} />
        </mesh>
      </ExplodablePart>

      {/* PISTONS */}
      <ExplodablePart
        id="pistons"
        basePos={[0, 0.15, 0]}
        explodedPos={[0, 0.95, 0.4]}
        exploded={exploded}
        interactionRef={interactionRef}
        onSelect={onSelectPart}
      >
        {cylOffsets.map((x, idx) => (
          <mesh
            key={idx}
            position={[x, 0, 0]}
            ref={(el) => {
              pistonRefs.current[idx] = el;
            }}
          >
            <cylinderGeometry args={[0.21, 0.21, 0.36, 20]} />
            <meshStandardMaterial {...mat('pistons', '#cbd5e1', 0.92, 0.18)} />
          </mesh>
        ))}
      </ExplodablePart>

      {/* CONNECTING RODS */}
      <ExplodablePart
        id="connecting_rods"
        basePos={[0, -0.2, 0]}
        explodedPos={[0, -0.1, 0.85]}
        exploded={exploded}
        interactionRef={interactionRef}
        onSelect={onSelectPart}
      >
        {cylOffsets.map((x, idx) => (
          <mesh
            key={idx}
            position={[x, -0.3, 0]}
            ref={(el) => {
              rodRefs.current[idx] = el;
            }}
          >
            <boxGeometry args={[0.08, 0.58, 0.08]} />
            <meshStandardMaterial {...mat('connecting_rods', '#94a3b8')} />
          </mesh>
        ))}
      </ExplodablePart>

      {/* CRANKSHAFT */}
      <ExplodablePart
        id="crankshaft"
        basePos={[0, -0.68, 0]}
        explodedPos={[0, -1.15, 0.6]}
        exploded={exploded}
        interactionRef={interactionRef}
        onSelect={onSelectPart}
      >
        <group ref={crankRef}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.12, 0.12, 2.75, 20]} />
            <meshStandardMaterial {...mat('crankshaft', '#e2e8f0', 0.95, 0.15)} />
          </mesh>
          {cylOffsets.map((x, idx) => (
            <mesh key={idx} position={[x, idx % 2 === 0 ? 0.12 : -0.12, 0]}>
              <boxGeometry args={[0.14, 0.28, 0.16]} />
              <meshStandardMaterial {...mat('crankshaft', '#cbd5e1')} />
            </mesh>
          ))}
        </group>
      </ExplodablePart>

      {/* VALVES */}
      <ExplodablePart
        id="valves"
        basePos={[0, 0.62, 0]}
        explodedPos={[0, 2.35, 0.35]}
        exploded={exploded}
        interactionRef={interactionRef}
        onSelect={onSelectPart}
      >
        {cylOffsets.map((x, idx) => (
          <mesh
            key={idx}
            position={[x, 0, 0.12]}
            ref={(el) => {
              valveRefs.current[idx] = el;
            }}
          >
            <cylinderGeometry args={[0.03, 0.09, 0.28, 12]} />
            <meshStandardMaterial {...mat('valves', '#38bdf8')} />
          </mesh>
        ))}
      </ExplodablePart>

      {/* INTAKE SYSTEM */}
      <ExplodablePart
        id="intake_system"
        basePos={[0, 0.78, 0.85]}
        explodedPos={[0, 1.35, 1.65]}
        exploded={exploded}
        interactionRef={interactionRef}
        onSelect={onSelectPart}
      >
        <mesh>
          <boxGeometry args={[2.1, 0.28, 0.36]} />
          <meshStandardMaterial {...mat('intake_system', '#1e293b')} />
        </mesh>
        {cylOffsets.map((x, idx) => (
          <mesh key={idx} position={[x, -0.05, -0.25]} rotation={[Math.PI / 3, 0, 0]}>
            <cylinderGeometry args={[0.09, 0.09, 0.42, 12]} />
            <meshStandardMaterial {...mat('intake_system', '#334155')} />
          </mesh>
        ))}
      </ExplodablePart>

      {/* TURBOCHARGER */}
      <ExplodablePart
        id="turbocharger"
        basePos={[1.55, 0.35, -0.55]}
        explodedPos={[2.45, 0.75, -0.85]}
        exploded={exploded}
        interactionRef={interactionRef}
        onSelect={onSelectPart}
      >
        <mesh>
          <torusGeometry args={[0.26, 0.12, 16, 32]} />
          <meshStandardMaterial {...mat('turbocharger', '#94a3b8')} />
        </mesh>
        <mesh ref={turboWheelRef} position={[0, 0, 0.08]}>
          <cylinderGeometry args={[0.16, 0.16, 0.06, 8]} />
          <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={1.2} />
        </mesh>
      </ExplodablePart>

      {/* COOLING COMPONENTS (Radiator & Fan) */}
      <ExplodablePart
        id="cooling_components"
        basePos={[-1.75, 0.05, 0]}
        explodedPos={[-2.65, 0.15, 0]}
        exploded={exploded}
        interactionRef={interactionRef}
        onSelect={onSelectPart}
      >
        <mesh>
          <boxGeometry args={[0.18, 1.25, 1.2]} />
          <meshStandardMaterial {...mat('cooling_components', '#0284c7')} />
        </mesh>
        <mesh ref={fanRef} position={[-0.12, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <cylinderGeometry args={[0.45, 0.45, 0.05, 6]} />
          <meshStandardMaterial color="#38bdf8" wireframe />
        </mesh>
      </ExplodablePart>

      {/* OIL SYSTEM (Sump Pan) */}
      <ExplodablePart
        id="oil_system"
        basePos={[0, -1.08, 0]}
        explodedPos={[0, -1.95, 0]}
        exploded={exploded}
        interactionRef={interactionRef}
        onSelect={onSelectPart}
      >
        <mesh>
          <boxGeometry args={[2.35, 0.34, 1.0]} />
          <meshStandardMaterial {...mat('oil_system', '#0f172a')} />
        </mesh>
      </ExplodablePart>
    </group>
  );
}
