import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { UniverseInteractionRef } from '../../types/scene';
import { damp, lerp } from '../../utils/smoothing';

function makeMat(
  partId: string,
  selectedPartId: string | null,
  baseColor: string,
  emissiveBase = '#0b1528',
  metalness = 0.82,
  roughness = 0.24
) {
  const isSelected = selectedPartId === partId;
  return {
    color: isSelected ? '#00f0ff' : baseColor,
    emissive: isSelected ? '#00b4ff' : emissiveBase,
    emissiveIntensity: isSelected ? 1.1 : 0.25,
    metalness,
    roughness,
  };
}

function PrototypePart({
  id,
  onSelect,
  basePos,
  explodedPos,
  exploded,
  interactionRef,
  children,
}: {
  id: string;
  onSelect: (id: string) => void;
  basePos: [number, number, number];
  explodedPos: [number, number, number];
  exploded: boolean;
  interactionRef: React.MutableRefObject<UniverseInteractionRef>;
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
    ref.current.position.x = damp(ref.current.position.x, lerp(basePos[0], explodedPos[0], factor), 6, dt);
    ref.current.position.y = damp(ref.current.position.y, lerp(basePos[1], explodedPos[1], factor), 6, dt);
    ref.current.position.z = damp(ref.current.position.z, lerp(basePos[2], explodedPos[2], factor), 6, dt);
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

/**
 * Anatomically proportioned, PBR engineering-prototype humanoid robot with
 * brushed titanium plating, stainless actuators, carbon-fiber spine, dark glass
 * sensor faceplate, exposed cables, rubber joint bellows, and 5-finger hands.
 */
export function HumanoidPrototypeModel({
  selectedPartId,
  onSelectPart,
  exploded,
  animationEnabled,
  interactionRef,
}: {
  selectedPartId: string | null;
  onSelectPart: (id: string) => void;
  exploded: boolean;
  animationEnabled: boolean;
  interactionRef: React.MutableRefObject<UniverseInteractionRef>;
}) {
  const headRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftForearmRef = useRef<THREE.Group>(null);
  const rightForearmRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const targetHeadYaw = animationEnabled ? Math.sin(t * 0.7) * 0.24 : 0;
    const targetHeadPitch = animationEnabled ? Math.sin(t * 0.45) * 0.06 : 0;
    const targetArmSwing = animationEnabled ? Math.sin(t * 0.9) * 0.09 : 0;
    const targetElbowBend = animationEnabled ? -0.18 + Math.sin(t * 0.9) * 0.08 : -0.12;
    const targetBreath = animationEnabled ? Math.sin(t * 1.4) * 0.015 : 0;

    if (headRef.current) {
      headRef.current.rotation.y = damp(headRef.current.rotation.y, targetHeadYaw, 4, dt);
      headRef.current.rotation.x = damp(headRef.current.rotation.x, targetHeadPitch, 4, dt);
    }
    if (leftArmRef.current) {
      leftArmRef.current.rotation.x = damp(leftArmRef.current.rotation.x, targetArmSwing, 4, dt);
    }
    if (rightArmRef.current) {
      rightArmRef.current.rotation.x = damp(rightArmRef.current.rotation.x, -targetArmSwing, 4, dt);
    }
    if (leftForearmRef.current) {
      leftForearmRef.current.rotation.x = damp(leftForearmRef.current.rotation.x, targetElbowBend, 4, dt);
    }
    if (rightForearmRef.current) {
      rightForearmRef.current.rotation.x = damp(rightForearmRef.current.rotation.x, targetElbowBend, 4, dt);
    }
    if (bodyRef.current) {
      bodyRef.current.position.y = damp(bodyRef.current.position.y, targetBreath, 4, dt);
    }
  });

  const titanium = (id: string) => makeMat(id, selectedPartId, '#cbd5e1', '#0b1528', 0.82, 0.24);
  const steel = (id: string) => makeMat(id, selectedPartId, '#94a3b8', '#091120', 0.88, 0.2);
  const carbon = (id: string) => makeMat(id, selectedPartId, '#1e293b', '#050914', 0.42, 0.45);
  const rubber = (id: string) => makeMat(id, selectedPartId, '#0f172a', '#02040a', 0.12, 0.82);

  const fingerOffsets = [-0.055, -0.02, 0.015, 0.05];

  return (
    <group ref={bodyRef} position={[0, -0.1, 0]}>
      {/* HEAD & DARK GLASS FACEPLATE + SENSOR ARRAY */}
      <PrototypePart
        id="head"
        onSelect={onSelectPart}
        basePos={[0, 1.72, 0]}
        explodedPos={[0, 2.65, 0.2]}
        exploded={exploded}
        interactionRef={interactionRef}
      >
        <group ref={headRef}>
          <mesh>
            <capsuleGeometry args={[0.17, 0.14, 12, 24]} />
            <meshStandardMaterial {...titanium('head')} />
          </mesh>
          <mesh position={[-0.18, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.065, 0.065, 0.04, 16]} />
            <meshStandardMaterial {...steel('head')} />
          </mesh>
          <mesh position={[0.18, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.065, 0.065, 0.04, 16]} />
            <meshStandardMaterial {...steel('head')} />
          </mesh>
          <mesh position={[0, 0.01, 0.135]}>
            <sphereGeometry args={[0.145, 24, 24, -Math.PI / 2, Math.PI, 0.3, Math.PI - 0.6]} />
            <meshPhysicalMaterial
              color="#020617"
              metalness={0.2}
              roughness={0.06}
              clearcoat={1}
              clearcoatRoughness={0.05}
              transparent
              opacity={0.88}
            />
          </mesh>
          <group
            onClick={(e) => {
              e.stopPropagation();
              onSelectPart('sensors');
            }}
          >
            <mesh position={[-0.055, 0.04, 0.165]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.022, 0.022, 0.02, 16]} />
              <meshStandardMaterial color="#0ea5e9" emissive="#00f0ff" emissiveIntensity={1.6} />
            </mesh>
            <mesh position={[0.055, 0.04, 0.165]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.022, 0.022, 0.02, 16]} />
              <meshStandardMaterial color="#0ea5e9" emissive="#00f0ff" emissiveIntensity={1.6} />
            </mesh>
            <mesh position={[0, -0.02, 0.168]}>
              <boxGeometry args={[0.08, 0.012, 0.015]} />
              <meshStandardMaterial color="#38bdf8" emissive="#00f0ff" emissiveIntensity={1.2} />
            </mesh>
          </group>
        </group>
      </PrototypePart>

      {/* NECK ACTUATOR & CONDUITS */}
      <PrototypePart
        id="neck"
        onSelect={onSelectPart}
        basePos={[0, 1.4, 0]}
        explodedPos={[0, 2.0, 0]}
        exploded={exploded}
        interactionRef={interactionRef}
      >
        <mesh>
          <cylinderGeometry args={[0.08, 0.1, 0.24, 18]} />
          <meshStandardMaterial {...steel('neck')} />
        </mesh>
        <mesh position={[-0.06, 0, -0.04]}>
          <cylinderGeometry args={[0.018, 0.018, 0.24, 10]} />
          <meshStandardMaterial {...titanium('neck')} />
        </mesh>
        <mesh position={[0.06, 0, -0.04]}>
          <cylinderGeometry args={[0.018, 0.018, 0.24, 10]} />
          <meshStandardMaterial {...titanium('neck')} />
        </mesh>
      </PrototypePart>

      {/* CHEST ASSEMBLY, INTERNAL SKELETON & CABLES */}
      <PrototypePart
        id="torso"
        onSelect={onSelectPart}
        basePos={[0, 0.84, 0]}
        explodedPos={[0, 1.0, -0.35]}
        exploded={exploded}
        interactionRef={interactionRef}
      >
        <mesh position={[0, -0.05, 0]}>
          <boxGeometry args={[0.52, 0.82, 0.3]} />
          <meshStandardMaterial {...carbon('torso')} />
        </mesh>
        <mesh position={[-0.17, 0.18, 0.16]} rotation={[0.08, 0.12, 0]}>
          <boxGeometry args={[0.3, 0.34, 0.08]} />
          <meshStandardMaterial {...titanium('torso')} />
        </mesh>
        <mesh position={[0.17, 0.18, 0.16]} rotation={[0.08, -0.12, 0]}>
          <boxGeometry args={[0.3, 0.34, 0.08]} />
          <meshStandardMaterial {...titanium('torso')} />
        </mesh>
        <mesh position={[0, -0.45, 0]}>
          <cylinderGeometry args={[0.19, 0.22, 0.28, 20]} />
          <meshStandardMaterial {...rubber('torso')} />
        </mesh>
        <mesh position={[-0.14, -0.25, 0.15]} rotation={[0, 0, 0.18]}>
          <cylinderGeometry args={[0.016, 0.016, 0.42, 8]} />
          <meshStandardMaterial color="#b45309" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0.14, -0.25, 0.15]} rotation={[0, 0, -0.18]}>
          <cylinderGeometry args={[0.016, 0.016, 0.42, 8]} />
          <meshStandardMaterial color="#0284c7" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0, -0.66, 0]}>
          <boxGeometry args={[0.56, 0.18, 0.28]} />
          <meshStandardMaterial {...steel('torso')} />
        </mesh>
      </PrototypePart>

      {/* SHOULDER ACTUATOR DRUMS */}
      {[-0.46, 0.46].map((sx, idx) => (
        <PrototypePart
          key={idx}
          id="shoulders"
          onSelect={onSelectPart}
          basePos={[sx, 1.12, 0]}
          explodedPos={[sx * 2.4, 1.5, 0]}
          exploded={exploded}
          interactionRef={interactionRef}
        >
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.13, 0.13, 0.14, 22]} />
            <meshStandardMaterial {...steel('shoulders')} />
          </mesh>
          <mesh position={[sx > 0 ? 0.08 : -0.08, 0.03, 0]} rotation={[0, 0, sx > 0 ? -0.2 : 0.2]}>
            <boxGeometry args={[0.18, 0.16, 0.22]} />
            <meshStandardMaterial {...titanium('shoulders')} />
          </mesh>
        </PrototypePart>
      ))}

      {/* LEFT & RIGHT ARTICULATED ARMS + 5-FINGER HANDS */}
      {[-0.54, 0.54].map((ax, armIdx) => {
        const isLeft = armIdx === 0;
        return (
          <group key={armIdx} ref={isLeft ? leftArmRef : rightArmRef}>
            <PrototypePart
              id="arms"
              onSelect={onSelectPart}
              basePos={[ax, 0.8, 0]}
              explodedPos={[ax * 2.55, 0.85, 0.2]}
              exploded={exploded}
              interactionRef={interactionRef}
            >
              <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[0.075, 0.068, 0.46, 16]} />
                <meshStandardMaterial {...titanium('arms')} />
              </mesh>
              <mesh position={[isLeft ? -0.055 : 0.055, 0, -0.04]}>
                <cylinderGeometry args={[0.022, 0.022, 0.42, 10]} />
                <meshStandardMaterial {...steel('arms')} />
              </mesh>

              <group ref={isLeft ? leftForearmRef : rightForearmRef} position={[0, -0.26, 0]}>
                <mesh
                  rotation={[0, 0, Math.PI / 2]}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectPart('joints');
                  }}
                >
                  <cylinderGeometry args={[0.072, 0.072, 0.13, 18]} />
                  <meshStandardMaterial {...rubber('joints')} />
                </mesh>
                <mesh position={[0, -0.24, 0]}>
                  <cylinderGeometry args={[0.068, 0.052, 0.42, 16]} />
                  <meshStandardMaterial {...carbon('arms')} />
                </mesh>

                <group
                  position={[0, -0.5, 0.02]}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectPart('hands');
                  }}
                >
                  <mesh>
                    <boxGeometry args={[0.09, 0.12, 0.05]} />
                    <meshStandardMaterial {...titanium('hands')} />
                  </mesh>
                  {fingerOffsets.map((fz, fIdx) => (
                    <group key={fIdx} position={[0, -0.08, fz]}>
                      <mesh>
                        <cylinderGeometry args={[0.009, 0.008, 0.06, 8]} />
                        <meshStandardMaterial {...steel('hands')} />
                      </mesh>
                      <mesh position={[isLeft ? 0.012 : -0.012, -0.045, 0]} rotation={[0, 0, isLeft ? 0.3 : -0.3]}>
                        <cylinderGeometry args={[0.0075, 0.0065, 0.05, 8]} />
                        <meshStandardMaterial {...titanium('hands')} />
                      </mesh>
                    </group>
                  ))}
                  <mesh position={[isLeft ? 0.04 : -0.04, -0.02, 0.05]} rotation={[0.5, 0, isLeft ? 0.4 : -0.4]}>
                    <cylinderGeometry args={[0.01, 0.008, 0.065, 8]} />
                    <meshStandardMaterial {...steel('hands')} />
                  </mesh>
                </group>
              </group>
            </PrototypePart>
          </group>
        );
      })}

      {/* HIP, THIGH, KNEE ACTUATORS, SHIN & ANKLE FEET */}
      {[-0.2, 0.2].map((lx, idx) => (
        <group key={idx}>
          <PrototypePart
            id="legs"
            onSelect={onSelectPart}
            basePos={[lx, -0.45, 0]}
            explodedPos={[lx * 2.6, -0.78, 0.18]}
            exploded={exploded}
            interactionRef={interactionRef}
          >
            <mesh position={[0, 0.48, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.11, 0.11, 0.12, 18]} />
              <meshStandardMaterial {...steel('legs')} />
            </mesh>
            <mesh position={[0, 0.2, 0]}>
              <cylinderGeometry args={[0.1, 0.085, 0.5, 16]} />
              <meshStandardMaterial {...titanium('legs')} />
            </mesh>
            <mesh position={[0, 0.2, 0.095]}>
              <cylinderGeometry args={[0.025, 0.025, 0.42, 10]} />
              <meshStandardMaterial {...steel('legs')} />
            </mesh>
            <mesh
              position={[0, -0.08, 0.02]}
              rotation={[0, 0, Math.PI / 2]}
              onClick={(e) => {
                e.stopPropagation();
                onSelectPart('joints');
              }}
            >
              <cylinderGeometry args={[0.09, 0.09, 0.15, 18]} />
              <meshStandardMaterial {...rubber('joints')} />
            </mesh>
            <mesh position={[0, -0.4, 0]}>
              <cylinderGeometry args={[0.082, 0.065, 0.54, 16]} />
              <meshStandardMaterial {...carbon('legs')} />
            </mesh>
            <mesh position={[0, -0.38, -0.075]}>
              <cylinderGeometry args={[0.02, 0.02, 0.46, 10]} />
              <meshStandardMaterial {...steel('legs')} />
            </mesh>
          </PrototypePart>

          <PrototypePart
            id="feet"
            onSelect={onSelectPart}
            basePos={[lx, -1.24, 0.06]}
            explodedPos={[lx * 2.8, -1.78, 0.32]}
            exploded={exploded}
            interactionRef={interactionRef}
          >
            <mesh position={[0, 0.08, -0.04]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.055, 0.055, 0.11, 14]} />
              <meshStandardMaterial {...steel('feet')} />
            </mesh>
            <mesh position={[0, -0.04, 0.04]}>
              <boxGeometry args={[0.17, 0.08, 0.34]} />
              <meshStandardMaterial {...titanium('feet')} />
            </mesh>
            <mesh position={[0, -0.09, 0.04]}>
              <boxGeometry args={[0.18, 0.03, 0.36]} />
              <meshStandardMaterial {...rubber('feet')} />
            </mesh>
          </PrototypePart>
        </group>
      ))}
    </group>
  );
}
