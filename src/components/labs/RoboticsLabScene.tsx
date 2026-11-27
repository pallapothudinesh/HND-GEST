import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment, Lightformer, MeshReflectorMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '../../context/ThemeContext';
import { RobotId } from '../../data/roboticsData';
import { UniverseInteractionRef } from '../../types/scene';
import { damp, lerp } from '../../utils/smoothing';
import { HumanoidPrototypeModel } from './HumanoidPrototypeModel';

interface RoboticsLabSceneProps {
  interactionRef: React.MutableRefObject<UniverseInteractionRef>;
  activeRobotId: RobotId;
  selectedPartId: string | null;
  onSelectPart: (id: string) => void;
  exploded: boolean;
  animationEnabled: boolean;
}

function makeMat(
  partId: string,
  selectedPartId: string | null,
  baseColor: string,
  emissiveBase = '#172554',
  metalness = 0.46,
  roughness = 0.3
) {
  const isSelected = selectedPartId === partId;
  return {
    color: isSelected ? '#00f0ff' : baseColor,
    emissive: isSelected ? '#00b4ff' : emissiveBase,
    emissiveIntensity: isSelected ? 1.15 : 0.36,
    metalness,
    roughness,
  };
}

function SelectableGroup({
  id,
  onSelect,
  basePos = [0, 0, 0],
  explodedPos,
  exploded = false,
  interactionRef,
  children,
}: {
  id: string;
  onSelect: (id: string) => void;
  basePos?: [number, number, number];
  explodedPos?: [number, number, number];
  exploded?: boolean;
  interactionRef?: React.MutableRefObject<UniverseInteractionRef>;
  children: React.ReactNode;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (!ref.current || !explodedPos) return;
    const dt = Math.min(delta, 0.05);
    const inter = interactionRef?.current;
    const factor = inter?.handExplosionActive
      ? inter.explosionProgress
      : exploded
      ? 1
      : inter?.explosionProgress ?? 0;
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

/* HumanoidPrototypeModel is imported from ./HumanoidPrototypeModel */

/* -------------------------------------------------------------------------- */
/* 2. INDUSTRIAL ROBOT ARM (Base, Platform, Arm Segments, Joints, Gripper)    */
/* -------------------------------------------------------------------------- */
function IndustrialArmModel({
  selectedPartId,
  onSelectPart,
  animationEnabled,
}: {
  selectedPartId: string | null;
  onSelectPart: (id: string) => void;
  animationEnabled: boolean;
}) {
  const platformRef = useRef<THREE.Group>(null);
  const lowerArmRef = useRef<THREE.Group>(null);
  const upperArmRef = useRef<THREE.Group>(null);
  const jawLeftRef = useRef<THREE.Mesh>(null);
  const jawRightRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const yaw = animationEnabled ? Math.sin(t * 0.65) * 0.85 : 0;
    const pitch1 = animationEnabled ? Math.sin(t * 0.9) * 0.28 - 0.15 : -0.15;
    const pitch2 = animationEnabled ? Math.cos(t * 1.1) * 0.35 - 0.55 : -0.55;
    const grip = animationEnabled ? 0.14 + Math.abs(Math.sin(t * 1.4)) * 0.09 : 0.18;

    if (platformRef.current) {
      platformRef.current.rotation.y = damp(platformRef.current.rotation.y, yaw, 4, dt);
    }
    if (lowerArmRef.current) {
      lowerArmRef.current.rotation.z = damp(lowerArmRef.current.rotation.z, pitch1, 4, dt);
    }
    if (upperArmRef.current) {
      upperArmRef.current.rotation.z = damp(upperArmRef.current.rotation.z, pitch2, 4, dt);
    }
    if (jawLeftRef.current) {
      jawLeftRef.current.position.z = damp(jawLeftRef.current.position.z, grip, 6, dt);
    }
    if (jawRightRef.current) {
      jawRightRef.current.position.z = damp(jawRightRef.current.position.z, -grip, 6, dt);
    }
  });

  return (
    <group position={[0, -1.25, 0]}>
      {/* BASE */}
      <SelectableGroup id="base" onSelect={onSelectPart}>
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.82, 0.96, 0.3, 32]} />
          <meshStandardMaterial {...makeMat('base', selectedPartId, '#0f172a')} />
        </mesh>
      </SelectableGroup>

      {/* ROTATING PLATFORM */}
      <group ref={platformRef} position={[0, 0.35, 0]}>
        <SelectableGroup id="platform" onSelect={onSelectPart}>
          <mesh position={[0, 0.14, 0]}>
            <cylinderGeometry args={[0.58, 0.64, 0.28, 28]} />
            <meshStandardMaterial {...makeMat('platform', selectedPartId, '#1e293b')} />
          </mesh>
        </SelectableGroup>

        {/* J2 JOINT */}
        <group ref={lowerArmRef} position={[0, 0.38, 0]}>
          <mesh
            onClick={(e) => {
              e.stopPropagation();
              onSelectPart('joints');
            }}
          >
            <sphereGeometry args={[0.26, 20, 20]} />
            <meshStandardMaterial {...makeMat('joints', selectedPartId, '#0284c7')} />
          </mesh>

          {/* LOWER ARM SEGMENT */}
          <mesh
            position={[0, 0.78, 0]}
            onClick={(e) => {
              e.stopPropagation();
              onSelectPart('arm_segments');
            }}
          >
            <boxGeometry args={[0.28, 1.35, 0.28]} />
            <meshStandardMaterial {...makeMat('arm_segments', selectedPartId, '#38bdf8')} />
          </mesh>

          {/* ELBOW JOINT + UPPER ARM */}
          <group ref={upperArmRef} position={[0, 1.5, 0]}>
            <mesh
              onClick={(e) => {
                e.stopPropagation();
                onSelectPart('joints');
              }}
            >
              <sphereGeometry args={[0.22, 18, 18]} />
              <meshStandardMaterial {...makeMat('joints', selectedPartId, '#0284c7')} />
            </mesh>

            <mesh
              position={[0.68, 0, 0]}
              rotation={[0, 0, Math.PI / 2]}
              onClick={(e) => {
                e.stopPropagation();
                onSelectPart('arm_segments');
              }}
            >
              <boxGeometry args={[0.2, 1.25, 0.2]} />
              <meshStandardMaterial {...makeMat('arm_segments', selectedPartId, '#cbd5e1')} />
            </mesh>

            {/* WRIST & GRIPPER */}
            <group
              position={[1.38, 0, 0]}
              onClick={(e) => {
                e.stopPropagation();
                onSelectPart('gripper');
              }}
            >
              <mesh>
                <cylinderGeometry args={[0.14, 0.14, 0.2, 16]} />
                <meshStandardMaterial {...makeMat('gripper', selectedPartId, '#334155')} />
              </mesh>
              <mesh ref={jawLeftRef} position={[0.22, 0, 0.16]}>
                <boxGeometry args={[0.32, 0.07, 0.06]} />
                <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={1.2} />
              </mesh>
              <mesh ref={jawRightRef} position={[0.22, 0, -0.16]}>
                <boxGeometry args={[0.32, 0.07, 0.06]} />
                <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={1.2} />
              </mesh>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* 3. EXPLORATION ROBOT (Chassis, 6 Wheels, Sensors, Camera Mast, Antenna)    */
/* -------------------------------------------------------------------------- */
function ExplorationRoverModel({
  selectedPartId,
  onSelectPart,
  animationEnabled,
}: {
  selectedPartId: string | null;
  onSelectPart: (id: string) => void;
  animationEnabled: boolean;
}) {
  const roverRef = useRef<THREE.Group>(null);
  const wheelRefs = useRef<(THREE.Mesh | null)[]>([]);
  const camMastRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    if (animationEnabled) {
      wheelRefs.current.forEach((w) => {
        if (w) w.rotation.x += dt * 1.8;
      });
      if (camMastRef.current) {
        camMastRef.current.rotation.y = Math.sin(t * 0.9) * 0.55;
      }
      if (roverRef.current) {
        roverRef.current.position.z = Math.sin(t * 0.7) * 0.35;
      }
    }
  });

  const wheelCoords: [number, number, number][] = [
    [-1.05, -0.45, 1.05],
    [1.05, -0.45, 1.05],
    [-1.05, -0.45, 0],
    [1.05, -0.45, 0],
    [-1.05, -0.45, -1.05],
    [1.05, -0.45, -1.05],
  ];

  return (
    <group ref={roverRef} position={[0, -0.35, 0]}>
      {/* CHASSIS */}
      <SelectableGroup id="chassis" onSelect={onSelectPart}>
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[1.55, 0.52, 2.3]} />
          <meshStandardMaterial {...makeMat('chassis', selectedPartId, '#cbd5e1')} />
        </mesh>
        <mesh position={[0, 0.4, -0.15]}>
          <boxGeometry args={[1.2, 0.12, 1.5]} />
          <meshStandardMaterial {...makeMat('chassis', selectedPartId, '#1e293b')} />
        </mesh>
      </SelectableGroup>

      {/* 6 WHEELS */}
      <SelectableGroup id="wheels" onSelect={onSelectPart}>
        {wheelCoords.map((pos, idx) => (
          <mesh
            key={idx}
            position={pos}
            rotation={[0, 0, Math.PI / 2]}
            ref={(el) => {
              wheelRefs.current[idx] = el;
            }}
          >
            <cylinderGeometry args={[0.34, 0.34, 0.28, 22]} />
            <meshStandardMaterial {...makeMat('wheels', selectedPartId, '#0f172a', '#091529', 0.5, 0.5)} />
          </mesh>
        ))}
      </SelectableGroup>

      {/* FRONT SENSORS */}
      <SelectableGroup id="sensors" onSelect={onSelectPart}>
        <mesh position={[0, 0.12, 1.18]}>
          <boxGeometry args={[1.05, 0.18, 0.1]} />
          <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={1.6} />
        </mesh>
      </SelectableGroup>

      {/* CAMERA MAST */}
      <group ref={camMastRef} position={[0.25, 0.45, 0.55]}>
        <SelectableGroup id="camera" onSelect={onSelectPart}>
          <mesh position={[0, 0.42, 0]}>
            <cylinderGeometry args={[0.07, 0.09, 0.85, 14]} />
            <meshStandardMaterial {...makeMat('camera', selectedPartId, '#64748b')} />
          </mesh>
          <mesh position={[0, 0.92, 0.05]}>
            <boxGeometry args={[0.48, 0.24, 0.28]} />
            <meshStandardMaterial {...makeMat('camera', selectedPartId, '#1e293b')} />
          </mesh>
          <mesh position={[-0.12, 0.92, 0.2]}>
            <sphereGeometry args={[0.06, 12, 12]} />
            <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={2} />
          </mesh>
          <mesh position={[0.12, 0.92, 0.2]}>
            <sphereGeometry args={[0.06, 12, 12]} />
            <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={2} />
          </mesh>
        </SelectableGroup>
      </group>

      {/* ANTENNA */}
      <SelectableGroup id="antenna" onSelect={onSelectPart}>
        <mesh position={[-0.45, 0.95, -0.75]}>
          <cylinderGeometry args={[0.025, 0.04, 1.15, 10]} />
          <meshStandardMaterial {...makeMat('antenna', selectedPartId, '#94a3b8')} />
        </mesh>
        <mesh position={[-0.45, 1.56, -0.75]}>
          <sphereGeometry args={[0.075, 12, 12]} />
          <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={2.5} />
        </mesh>
      </SelectableGroup>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* 4. FUTURISTIC AI ROBOT (Head, Sensors, Body, Arms, Joints)                 */
/* -------------------------------------------------------------------------- */
function FuturisticAIRobotModel({
  selectedPartId,
  onSelectPart,
  animationEnabled,
}: {
  selectedPartId: string | null;
  onSelectPart: (id: string) => void;
  animationEnabled: boolean;
}) {
  const rootRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const sensorRingRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    if (rootRef.current) {
      const hoverY = animationEnabled ? Math.sin(t * 1.8) * 0.16 : 0;
      rootRef.current.position.y = damp(rootRef.current.position.y, hoverY, 5, dt);
    }
    if (headRef.current) {
      const tilt = animationEnabled ? Math.sin(t * 1.2) * 0.14 : 0;
      headRef.current.rotation.z = damp(headRef.current.rotation.z, tilt, 5, dt);
    }
    if (leftArmRef.current && rightArmRef.current) {
      const wave = animationEnabled ? Math.sin(t * 1.5) * 0.22 : 0;
      leftArmRef.current.rotation.x = damp(leftArmRef.current.rotation.x, wave, 5, dt);
      rightArmRef.current.rotation.x = damp(rightArmRef.current.rotation.x, -wave, 5, dt);
    }
    if (sensorRingRef.current && animationEnabled) {
      sensorRingRef.current.rotation.z += dt * 1.5;
    }
  });

  return (
    <group ref={rootRef}>
      {/* HEAD */}
      <group ref={headRef} position={[0, 1.15, 0]}>
        <SelectableGroup id="head" onSelect={onSelectPart}>
          <mesh>
            <sphereGeometry args={[0.46, 28, 28]} />
            <meshStandardMaterial {...makeMat('head', selectedPartId, '#f8fafc')} />
          </mesh>
          <mesh position={[0, 0.02, 0.36]}>
            <boxGeometry args={[0.52, 0.22, 0.18]} />
            <meshStandardMaterial color="#020617" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[-0.12, 0.03, 0.46]}>
            <sphereGeometry args={[0.05, 12, 12]} />
            <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={2.5} />
          </mesh>
          <mesh position={[0.12, 0.03, 0.46]}>
            <sphereGeometry args={[0.05, 12, 12]} />
            <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={2.5} />
          </mesh>
        </SelectableGroup>
      </group>

      {/* SENSORS (Halo Ring) */}
      <SelectableGroup id="sensors" onSelect={onSelectPart}>
        <mesh ref={sensorRingRef} position={[0, 1.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.65, 0.025, 12, 48]} />
          <meshStandardMaterial
            {...makeMat('sensors', selectedPartId, '#a855f7', '#a855f7')}
            emissiveIntensity={1.6}
          />
        </mesh>
      </SelectableGroup>

      {/* BODY */}
      <SelectableGroup id="body" onSelect={onSelectPart}>
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.46, 0.22, 1.35, 28]} />
          <meshStandardMaterial {...makeMat('body', selectedPartId, '#1e293b')} />
        </mesh>
        <mesh position={[0, 0.28, 0.38]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={2.2} />
        </mesh>
      </SelectableGroup>

      {/* JOINTS & ARMS */}
      <group ref={leftArmRef} position={[-0.64, 0.42, 0]}>
        <mesh
          onClick={(e) => {
            e.stopPropagation();
            onSelectPart('joints');
          }}
        >
          <sphereGeometry args={[0.14, 16, 16]} />
          <meshStandardMaterial {...makeMat('joints', selectedPartId, '#38bdf8')} />
        </mesh>
        <mesh
          position={[0, -0.42, 0]}
          onClick={(e) => {
            e.stopPropagation();
            onSelectPart('arms');
          }}
        >
          <capsuleGeometry args={[0.1, 0.55, 8, 16]} />
          <meshStandardMaterial {...makeMat('arms', selectedPartId, '#e2e8f0')} />
        </mesh>
      </group>

      <group ref={rightArmRef} position={[0.64, 0.42, 0]}>
        <mesh
          onClick={(e) => {
            e.stopPropagation();
            onSelectPart('joints');
          }}
        >
          <sphereGeometry args={[0.14, 16, 16]} />
          <meshStandardMaterial {...makeMat('joints', selectedPartId, '#38bdf8')} />
        </mesh>
        <mesh
          position={[0, -0.42, 0]}
          onClick={(e) => {
            e.stopPropagation();
            onSelectPart('arms');
          }}
        >
          <capsuleGeometry args={[0.1, 0.55, 8, 16]} />
          <meshStandardMaterial {...makeMat('arms', selectedPartId, '#e2e8f0')} />
        </mesh>
      </group>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* MAIN ROBOTICS LAB SCENE                                                    */
/* -------------------------------------------------------------------------- */
export function RoboticsLabScene({
  interactionRef,
  activeRobotId,
  selectedPartId,
  onSelectPart,
  exploded,
  animationEnabled,
}: RoboticsLabSceneProps) {
  const rootRef = useRef<THREE.Group>(null);
  const labRingRef = useRef<THREE.Mesh>(null);
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === 'light';

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const inter = interactionRef.current;

    if (rootRef.current) {
      const clampedScale =
        inter.activeGesture === 'TWO_HANDS'
          ? 1
          : Math.min(Math.max(inter.sphereScale, 0.7), 1.5);
      rootRef.current.scale.setScalar(damp(rootRef.current.scale.x, clampedScale, 5, dt));
      rootRef.current.position.x = damp(rootRef.current.position.x, inter.pinchOffset.x * 0.7, 5, dt);
    }

    if (labRingRef.current) {
      labRingRef.current.rotation.z += dt * 0.25;
    }
  });

  return (
    <group ref={rootRef}>
      {/* Studio Environment Reflections for Realistic Titanium/Steel/Glass */}
      <Environment resolution={128} frames={1}>
        <Lightformer
          form="rect"
          intensity={2.6}
          position={[0, 6, 3]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[10, 4, 1]}
          color="#e0f2fe"
        />
        <Lightformer
          form="rect"
          intensity={1.8}
          position={[-5, 2, 2]}
          rotation={[0, Math.PI / 3, 0]}
          scale={[6, 3, 1]}
          color="#38bdf8"
        />
        <Lightformer
          form="rect"
          intensity={1.5}
          position={[5, 2, -2]}
          rotation={[0, -Math.PI / 3, 0]}
          scale={[6, 3, 1]}
          color="#818cf8"
        />
      </Environment>

      {/* Reflective Industrial Research Laboratory Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.54, 0]}>
        <circleGeometry args={[4.2, 64]} />
        <MeshReflectorMaterial
          blur={[240, 60]}
          resolution={256}
          mixBlur={0.9}
          mixStrength={isLight ? 8 : 18}
          roughness={isLight ? 0.25 : 0.35}
          depthScale={1.0}
          color={isLight ? '#e2e8f0' : '#060c18'}
          metalness={isLight ? 0.35 : 0.65}
          mirror={isLight ? 0.25 : 0.35}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.52, 0]}>
        <ringGeometry args={[2.1, 2.22, 64]} />
        <meshBasicMaterial color={isLight ? '#087cf0' : '#00f0ff'} transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={labRingRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.53, 0]}>
        <ringGeometry args={[2.65, 2.72, 6]} />
        <meshBasicMaterial color={isLight ? '#00b8d9' : '#3b82f6'} transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>

      {activeRobotId === 'humanoid' && (
        <HumanoidPrototypeModel
          selectedPartId={selectedPartId}
          onSelectPart={onSelectPart}
          exploded={exploded}
          animationEnabled={animationEnabled}
          interactionRef={interactionRef}
        />
      )}
      {activeRobotId === 'industrial_arm' && (
        <IndustrialArmModel
          selectedPartId={selectedPartId}
          onSelectPart={onSelectPart}
          animationEnabled={animationEnabled}
        />
      )}
      {activeRobotId === 'exploration' && (
        <ExplorationRoverModel
          selectedPartId={selectedPartId}
          onSelectPart={onSelectPart}
          animationEnabled={animationEnabled}
        />
      )}
      {activeRobotId === 'ai_robot' && (
        <FuturisticAIRobotModel
          selectedPartId={selectedPartId}
          onSelectPart={onSelectPart}
          animationEnabled={animationEnabled}
        />
      )}
    </group>
  );
}
