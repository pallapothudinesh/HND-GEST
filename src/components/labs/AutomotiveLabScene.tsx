import { Component, ErrorInfo, ReactNode, Suspense, useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment, Lightformer, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '../../context/ThemeContext';
import { UniverseInteractionRef } from '../../types/scene';
import { damp, lerp } from '../../utils/smoothing';

interface AutomotiveLabSceneProps {
  interactionRef: React.MutableRefObject<UniverseInteractionRef>;
  selectedPartId: string | null;
  onSelectPart: (id: string | null) => void;
  interiorView: boolean;
  exploded: boolean;
}

const CAR_MODEL_URL = '/models/automotive/car.glb';
const DRACO_DECODER_PATH = '/draco/gltf/';
const _camLocal = new THREE.Vector3();
const _lookLocal = new THREE.Vector3();

function mapNodeNameToPartId(name: string): string {
  const n = name.toLowerCase();
  if (
    n.includes('wheel') ||
    n.includes('tire') ||
    n.includes('rim') ||
    n.includes('brake') ||
    n.includes('nuts') ||
    n.includes('centre')
  ) {
    return 'wheels';
  }
  if (
    n.includes('interior') ||
    n.includes('seat') ||
    n.includes('leather') ||
    n.includes('steering') ||
    n.includes('carpet')
  ) {
    return 'interior';
  }
  if (n.includes('metal') || n.includes('plastic_gray') || n.includes('chrome')) {
    return 'engine';
  }
  if ((n.includes('lights') && !n.includes('red')) || n.includes('leds') || n.includes('grills') || n.includes('wipers')) {
    return 'front';
  }
  if (n.includes('lights_red') || n.includes('carbon')) {
    return 'rear';
  }
  return 'body';
}

/**
 * Wide, layered, reference-style 3D exploded offsets for all 51 meshes in car.glb.
 * Exposes the central cabin & structural core while lifting the outer bodywork,
 * glass, trim, front/rear assemblies, and 4 telescoping wheel units into a wide
 * balanced spatial composition. (In car.glb local space, -Z is front, +Z is rear.)
 */
function getExplodedOffsetForNode(name: string, parentName: string): THREE.Vector3 {
  const n = name.toLowerCase();
  const p = parentName.toLowerCase();

  // 1. Sub-parts inside each wheel assembly telescope laterally along axle
  if (p.startsWith('wheel_')) {
    const isLeft = p.endsWith('_fl') || p.endsWith('_rl');
    const dirX = isLeft ? -1 : 1;
    if (n === 'brake') return new THREE.Vector3(dirX * 0.08, 0, 0);
    if (n === 'wheel') return new THREE.Vector3(dirX * 0.28, 0, 0);
    if (n === 'tire') return new THREE.Vector3(dirX * 0.48, 0.04, 0);
    if (n.startsWith('rim_')) return new THREE.Vector3(dirX * 0.72, 0.06, 0);
    if (n === 'centre') return new THREE.Vector3(dirX * 0.94, 0.08, 0);
    if (n === 'nuts') return new THREE.Vector3(dirX * 1.12, 0.09, 0);
  }

  // 2. Four wheel assemblies separate wide diagonally outward
  if (n === 'wheel_fl') return new THREE.Vector3(-1.45, -0.06, -0.82);
  if (n === 'wheel_fr') return new THREE.Vector3(1.45, -0.06, -0.82);
  if (n === 'wheel_rl') return new THREE.Vector3(-1.45, -0.06, 0.88);
  if (n === 'wheel_rr') return new THREE.Vector3(1.45, -0.06, 0.88);

  // 3. Central exposed cabin & steering wheel
  if (n === 'interior_dark') return new THREE.Vector3(0, 0.04, 0);
  if (n === 'leather') return new THREE.Vector3(0, 0.38, 0.12);
  if (n === 'steering_wheel') return new THREE.Vector3(-0.26, 0.62, -0.58);
  if (n === 'interior_light') return new THREE.Vector3(0.85, 0.78, 0.18);
  if (n === 'carpet') return new THREE.Vector3(0, -0.26, 0);

  // 4. Lower structural frame & underbody layers
  if (n === 'metal') return new THREE.Vector3(0, -0.52, -0.15);
  if (n === 'plastic_gray') return new THREE.Vector3(0, -0.84, 0);

  // 5. Outer painted bodywork & upper glass lifted high to expose central cabin
  if (n === 'body') return new THREE.Vector3(0, 1.98, 0);
  if (n === 'glass') return new THREE.Vector3(0, 2.78, 0.16);
  if (n === 'wipers') return new THREE.Vector3(0, 2.08, -1.28);

  // 6. Lateral exterior trim panels
  if (n === 'trim') return new THREE.Vector3(-1.28, 1.28, 0.22);
  if (n === 'yellow_trim') return new THREE.Vector3(1.28, 1.18, -0.2);
  if (n === 'blue') return new THREE.Vector3(-1.08, 0.92, -0.32);

  // 7. Wide Front Exterior Layer (-Z)
  if (n === 'grills') return new THREE.Vector3(0, 0.14, -1.98);
  if (n === 'lights') return new THREE.Vector3(-0.62, 0.72, -1.78);
  if (n === 'leds') return new THREE.Vector3(0.62, 0.62, -1.78);
  if (n === 'carbon_fibre_trim') return new THREE.Vector3(0, -0.42, -1.58);

  // 8. Wide Rear Exterior Layer (+Z)
  if (n === 'lights_red') return new THREE.Vector3(0, 0.85, 1.98);
  if (n === 'chrome') return new THREE.Vector3(0, 0.35, 1.78);
  if (n === 'carbon fibre') return new THREE.Vector3(0, -0.42, 1.58);
  if (n === 'brakes') return new THREE.Vector3(0, -0.15, 1.12);

  return new THREE.Vector3(0, 0, 0);
}

interface ExplodableNodeEntry {
  obj: THREE.Object3D;
  basePos: THREE.Vector3;
  offset: THREE.Vector3;
  isWheelRoot: boolean;
}

interface MeshMaterialEntry {
  mesh: THREE.Mesh;
  partId: string;
  baseEmissive: THREE.Color;
  baseEmissiveIntensity: number;
}

function CarGLBModel({
  interactionRef,
  selectedPartId,
  onSelectPart,
  interiorView,
  exploded,
}: AutomotiveLabSceneProps) {
  const gltf = useGLTF(CAR_MODEL_URL, DRACO_DECODER_PATH);
  const carRootRef = useRef<THREE.Group>(null);
  const smoothedFactorRef = useRef(0);
  const lastAppliedFactorRef = useRef(-1);

  const { clonedScene, normalizedScale, groundOffsetY, explodableNodes, meshEntries } =
    useMemo(() => {
      const clone = gltf.scene.clone(true);

      const box = new THREE.Box3().setFromObject(clone);
      const size = new THREE.Vector3();
      box.getSize(size);

      const maxDim = Math.max(size.x, size.y, size.z, 0.001);
      const scale = 4.5 / maxDim;
      const minY = -box.min.y * scale - 0.82;

      const nodes: ExplodableNodeEntry[] = [];
      const meshes: MeshMaterialEntry[] = [];

      clone.traverse((child) => {
        if (child === clone) return;

        const n = child.name.toLowerCase();
        const pName = child.parent?.name ?? '';
        const pLower = pName.toLowerCase();

        const isMainContainer = n === 'main';
        const isWheelRoot = n.startsWith('wheel_');
        const isWheelChild = pLower.startsWith('wheel_');
        const isMainChild = pLower === 'main';
        const isSteeringRoot = n === 'steering_wheel';

        if (
          !isMainContainer &&
          (isWheelRoot || isWheelChild || isMainChild || isSteeringRoot)
        ) {
          nodes.push({
            obj: child,
            basePos: child.position.clone(),
            offset: getExplodedOffsetForNode(child.name, pName),
            isWheelRoot,
          });
        }

        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;

          if (mesh.material) {
            const mat = (mesh.material as THREE.Material).clone();
            mesh.material = mat;
            const stdMat = mat as THREE.MeshStandardMaterial;

            if (n.includes('glass')) {
              stdMat.transparent = true;
              stdMat.opacity = 0.34;
              stdMat.roughness = 0.08;
            }

            meshes.push({
              mesh,
              partId: mapNodeNameToPartId(mesh.name || pName),
              baseEmissive: stdMat.emissive ? stdMat.emissive.clone() : new THREE.Color(0x000000),
              baseEmissiveIntensity: stdMat.emissiveIntensity ?? 0,
            });
          }
        }
      });

      return {
        clonedScene: clone,
        normalizedScale: scale,
        groundOffsetY: minY,
        explodableNodes: nodes,
        meshEntries: meshes,
      };
    }, [gltf.scene]);

  // Dispose cloned materials on unmount to prevent GPU/memory leaks across world switches
  useEffect(() => {
    return () => {
      meshEntries.forEach(({ mesh }) => {
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => m.dispose());
        } else if (mesh.material) {
          mesh.material.dispose();
        }
      });
    };
  }, [meshEntries]);

  useEffect(() => {
    meshEntries.forEach(({ mesh, partId, baseEmissive, baseEmissiveIntensity }) => {
      const stdMat = mesh.material as THREE.MeshStandardMaterial;
      if (!stdMat || !stdMat.emissive) return;

      if (selectedPartId && partId === selectedPartId) {
        stdMat.emissive.set('#00b4ff');
        stdMat.emissiveIntensity = 0.55;
      } else {
        stdMat.emissive.copy(baseEmissive);
        stdMat.emissiveIntensity = baseEmissiveIntensity;
      }

      if (mesh.name.toLowerCase().includes('glass')) {
        stdMat.opacity = interiorView ? 0.14 : 0.34;
      }
    });
  }, [meshEntries, selectedPartId, interiorView]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const inter = interactionRef.current;

    const rawFactor = inter.handExplosionActive
      ? inter.explosionProgress
      : exploded
      ? 1
      : inter.explosionProgress;

    // Unified, jitter-free smoothing of the separation factor
    smoothedFactorRef.current = damp(smoothedFactorRef.current, rawFactor, 5.2, dt);
    const factor = smoothedFactorRef.current;

    if (carRootRef.current) {
      const clampedScale =
        inter.activeGesture === 'TWO_HANDS'
          ? 1
          : Math.min(Math.max(inter.sphereScale, 0.72), 1.45);
      // Smoothly frame the wider composition inside the viewport at 100% separation
      const framingFactor = 1 - factor * 0.24;
      carRootRef.current.scale.setScalar(
        damp(carRootRef.current.scale.x, normalizedScale * clampedScale * framingFactor, 5.2, dt)
      );
      carRootRef.current.position.x = damp(
        carRootRef.current.position.x,
        inter.pinchOffset.x * 0.6,
        5,
        dt
      );
      // Slightly lower root as body lifts high so composition stays centered vertically
      carRootRef.current.position.y = damp(
        carRootRef.current.position.y,
        groundOffsetY - factor * 0.28,
        5.2,
        dt
      );
    }

    // Only update all 51 node transforms when separation factor is actively changing
    const factorChanged = Math.abs(factor - lastAppliedFactorRef.current) > 0.0003;
    if (factorChanged) {
      lastAppliedFactorRef.current = factor;
      explodableNodes.forEach(({ obj, basePos, offset }) => {
        obj.position.x = lerp(basePos.x, basePos.x + offset.x, factor);
        obj.position.y = lerp(basePos.y, basePos.y + offset.y, factor);
        obj.position.z = lerp(basePos.z, basePos.z + offset.z, factor);
      });
    }

    if (factor < 0.03) {
      for (let i = 0; i < explodableNodes.length; i++) {
        const entry = explodableNodes[i];
        if (entry.isWheelRoot) {
          entry.obj.rotation.x -= dt * 0.4;
        }
      }
    }

    if (interiorView && carRootRef.current) {
      _camLocal.set(-0.32, 1.05, -0.15);
      _lookLocal.set(-0.12, 0.85, 1.2);
      carRootRef.current.localToWorld(_camLocal);
      carRootRef.current.localToWorld(_lookLocal);
      state.camera.position.lerp(_camLocal, 1 - Math.exp(-4.5 * dt));
      state.camera.lookAt(_lookLocal);
    }
  });

  return (
    <group
      ref={carRootRef}
      position={[0, groundOffsetY, 0]}
      rotation={[0, -0.58, 0]}
      scale={normalizedScale}
      onClick={(e) => {
        e.stopPropagation();
        const hitName = e.object.name || e.object.parent?.name || '';
        const partId = mapNodeNameToPartId(hitName);
        onSelectPart(selectedPartId === partId ? null : partId);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    >
      <primitive object={clonedScene} />
    </group>
  );
}

class CarModelErrorBoundary extends Component<
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
    console.error('Automotive GLB model failed to load:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <mesh position={[0, 0, 0]}>
          <torusKnotGeometry args={[0.9, 0.25, 96, 16]} />
          <meshStandardMaterial color="#f43f5e" wireframe />
        </mesh>
      );
    }
    return this.props.children;
  }
}

export function AutomotiveLabScene(props: AutomotiveLabSceneProps) {
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === 'light';

  return (
    <group>
      {/* Clean Studio Environment Reflections (128px cubemap for fast mount) */}
      <Environment resolution={128} frames={1}>
        <Lightformer
          form="rect"
          intensity={2.8}
          position={[0, 6, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[12, 5, 1]}
          color="#f0f9ff"
        />
        <Lightformer
          form="rect"
          intensity={2.0}
          position={[-6, 2, 4]}
          rotation={[0, Math.PI / 3, 0]}
          scale={[7, 3, 1]}
          color="#38bdf8"
        />
        <Lightformer
          form="rect"
          intensity={1.6}
          position={[6, 2, -4]}
          rotation={[0, -Math.PI / 3, 0]}
          scale={[7, 3, 1]}
          color="#818cf8"
        />
      </Environment>

      {/* Dedicated Showroom Turntable */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.82, 0]}>
        <ringGeometry args={[3.1, 3.24, 72]} />
        <meshBasicMaterial color={isLight ? '#087cf0' : '#38bdf8'} transparent opacity={0.45} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.83, 0]}>
        <ringGeometry args={[3.7, 3.75, 72]} />
        <meshBasicMaterial color={isLight ? '#00b8d9' : '#6366f1'} transparent opacity={0.28} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.84, 0]}>
        <circleGeometry args={[3.1, 72]} />
        <meshStandardMaterial color={isLight ? '#e2e8f0' : '#060c1a'} metalness={isLight ? 0.25 : 0.5} roughness={0.28} />
      </mesh>

      <CarModelErrorBoundary>
        <Suspense
          fallback={
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, 0]}>
              <ringGeometry args={[0.9, 1.05, 48]} />
              <meshBasicMaterial color="#00f0ff" transparent opacity={0.75} side={THREE.DoubleSide} />
            </mesh>
          }
        >
          <CarGLBModel {...props} />
        </Suspense>
      </CarModelErrorBoundary>
    </group>
  );
}

useGLTF.preload(CAR_MODEL_URL, DRACO_DECODER_PATH);
