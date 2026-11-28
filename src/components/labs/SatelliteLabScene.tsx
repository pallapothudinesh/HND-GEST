import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import { UniverseInteractionRef } from '../../types/scene';
import { damp, lerp } from '../../utils/smoothing';

interface SatelliteLabSceneProps {
  interactionRef: React.MutableRefObject<UniverseInteractionRef>;
  selectedPartId: string | null;
  onSelectPart: (id: string | null) => void;
  exploded: boolean;
}

interface SatellitePartProps {
  id: string;
  basePos: [number, number, number];
  explodedPos: [number, number, number];
  baseRot?: [number, number, number];
  explodedRot?: [number, number, number];
  exploded: boolean;
  interactionRef: React.MutableRefObject<UniverseInteractionRef>;
  onSelect: (id: string) => void;
  children: React.ReactNode;
}

interface ExplodedSubPartProps {
  basePos: [number, number, number];
  explodedPos: [number, number, number];
  exploded: boolean;
  interactionRef: React.MutableRefObject<UniverseInteractionRef>;
  children: React.ReactNode;
}

function getExplosionFactor(
  interactionRef: React.MutableRefObject<UniverseInteractionRef>,
  exploded: boolean
): number {
  const inter = interactionRef.current;
  return inter.handExplosionActive
    ? inter.explosionProgress
    : exploded
    ? 1
    : inter.explosionProgress;
}

/**
 * Static-inspection subassembly wrapper with smooth damped separation
 * driven by `exploded` or `interactionRef.current.explosionProgress`.
 */
function SatellitePart({
  id,
  basePos,
  explodedPos,
  baseRot = [0, 0, 0],
  explodedRot,
  exploded,
  interactionRef,
  onSelect,
  children,
}: SatellitePartProps) {
  const ref = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const dt = Math.min(delta, 0.05);
    const factor = getExplosionFactor(interactionRef, exploded);

    ref.current.position.x = damp(ref.current.position.x, lerp(basePos[0], explodedPos[0], factor), 7.5, dt);
    ref.current.position.y = damp(ref.current.position.y, lerp(basePos[1], explodedPos[1], factor), 7.5, dt);
    ref.current.position.z = damp(ref.current.position.z, lerp(basePos[2], explodedPos[2], factor), 7.5, dt);

    if (explodedRot) {
      ref.current.rotation.x = damp(ref.current.rotation.x, lerp(baseRot[0], explodedRot[0], factor), 7.5, dt);
      ref.current.rotation.y = damp(ref.current.rotation.y, lerp(baseRot[1], explodedRot[1], factor), 7.5, dt);
      ref.current.rotation.z = damp(ref.current.rotation.z, lerp(baseRot[2], explodedRot[2], factor), 7.5, dt);
    }
  });

  return (
    <group
      ref={ref}
      position={basePos}
      rotation={baseRot}
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
 * Nested sub-module separation wrapper so individual truss segments, modules,
 * and solar blankets fan out cleanly within their parent assembly.
 */
function ExplodedSubPart({
  basePos,
  explodedPos,
  exploded,
  interactionRef,
  children,
}: ExplodedSubPartProps) {
  const ref = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const dt = Math.min(delta, 0.05);
    const factor = getExplosionFactor(interactionRef, exploded);

    ref.current.position.x = damp(ref.current.position.x, lerp(basePos[0], explodedPos[0], factor), 7.5, dt);
    ref.current.position.y = damp(ref.current.position.y, lerp(basePos[1], explodedPos[1], factor), 7.5, dt);
    ref.current.position.z = damp(ref.current.position.z, lerp(basePos[2], explodedPos[2], factor), 7.5, dt);
  });

  return (
    <group ref={ref} position={basePos}>
      {children}
    </group>
  );
}

/**
 * High-precision aerospace CAD dashed axial guide lines that fade in
 * when `explosion > 0.05`.
 */
function ExplosionGuideLines({
  exploded,
  interactionRef,
}: {
  exploded: boolean;
  interactionRef: React.MutableRefObject<UniverseInteractionRef>;
}) {
  const groupRef = useRef<THREE.Group>(null);

  const { cyanGeo, amberGeo, cyanMat, amberMat } = useMemo(() => {
    const cyanPts = [
      // Main Truss X-axis spine (P6 <-> S6)
      -4.6, 2.13, 0, 4.6, 2.13, 0,
      // Zenith Z1 vertical axis
      0, 2.13, -0.52, 0, 2.9, -0.85,
      // Pressurized USOS + ROS longitudinal Z-axis
      0, -0.87, 3.6, 0, -1.07, -6.2,
      // Harmony lateral axis (Kibo <-> Columbus)
      -2.2, -0.87, 2.3, 1.65, -0.87, 2.3,
      // Unity lateral axis (Tranquility <-> Quest)
      -1.4, -0.87, -0.6, 2.9, -1.9, -1.33,
      // Zvezda vertical axis (Nauka/Prichal <-> MRM-2)
      0, -2.9, -6.0, 0, -0.25, -5.9,
      // Port & Starboard Solar Array vertical axes
      -5.0, 1.2, 0.35, -5.0, 4.4, 0.35,
      5.0, 1.2, 0.35, 5.0, 4.4, 0.35,
    ];

    const amberPts = [
      // Origin to Truss
      0, 0, 0, 0, 1.85, 0,
      // Truss to Port & Starboard Solar Arrays
      -2.2, 1.85, 0, -2.35, 2.55, 0.35,
      2.2, 1.85, 0, 2.35, 2.55, 0.35,
      // Truss to HRS Radiators
      -0.88, 2.13, -0.2, -1.45, 2.39, -2.65,
      0.88, 2.13, -0.2, 1.45, 2.39, -2.65,
      // Origin to USOS & Russian Segment
      0, 0, 0, 0, -0.85, 0.75,
      0, -0.85, -0.6, 0, -1.05, -2.95,
      // Harmony to Forward Docking Adapters
      0, -0.87, 2.3, 0, 0.25, 4.9,
      // Unity to Airlock & Logistics
      0, -0.87, -0.6, 2.05, -2.05, -0.55,
    ];

    const cGeo = new THREE.BufferGeometry();
    cGeo.setAttribute('position', new THREE.Float32BufferAttribute(cyanPts, 3));
    const cLines = new THREE.LineSegments(cGeo);
    cLines.computeLineDistances();

    const aGeo = new THREE.BufferGeometry();
    aGeo.setAttribute('position', new THREE.Float32BufferAttribute(amberPts, 3));
    const aLines = new THREE.LineSegments(aGeo);
    aLines.computeLineDistances();

    const cMat = new THREE.LineDashedMaterial({
      color: '#38bdf8',
      dashSize: 0.16,
      gapSize: 0.09,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });

    const aMat = new THREE.LineDashedMaterial({
      color: '#f59e0b',
      dashSize: 0.12,
      gapSize: 0.1,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });

    return { cyanGeo: cGeo, amberGeo: aGeo, cyanMat: cMat, amberMat: aMat };
  }, []);

  useEffect(() => {
    return () => {
      cyanGeo.dispose();
      amberGeo.dispose();
      cyanMat.dispose();
      amberMat.dispose();
    };
  }, [cyanGeo, amberGeo, cyanMat, amberMat]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const dt = Math.min(delta, 0.05);
    const factor = getExplosionFactor(interactionRef, exploded);
    const target = factor > 0.05 ? Math.min(1, (factor - 0.05) / 0.25) : 0;

    cyanMat.opacity = damp(cyanMat.opacity, target * 0.58, 8, dt);
    amberMat.opacity = damp(amberMat.opacity, target * 0.44, 8, dt);
    groupRef.current.visible = cyanMat.opacity > 0.01;
  });

  return (
    <group ref={groupRef} visible={false}>
      <lineSegments geometry={cyanGeo} material={cyanMat} />
      <lineSegments geometry={amberGeo} material={amberMat} />
    </group>
  );
}

/**
 * Multi-blade aerospace thermal/avionics cooling fan assembly with protective
 * shroud ring, radial struts, central hub, and angled impeller blades.
 */
function MotionFan({
  position,
  rotation = [0, 0, 0],
  scale = 1,
  speed = 4.8,
  accentColor = '#38bdf8',
  bladeCount = 8,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  speed?: number;
  accentColor?: string;
  bladeCount?: number;
}) {
  const rotorRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!rotorRef.current) return;
    rotorRef.current.rotation.z += Math.min(delta, 0.05) * speed;
  });

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Protective Outer Shroud Ring */}
      <mesh>
        <torusGeometry args={[0.08, 0.011, 10, 24]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.22} />
      </mesh>
      {/* Recessed Airflow Housing Duct */}
      <mesh position={[0, 0, -0.008]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.075, 0.075, 0.024, 20]} />
        <meshStandardMaterial color="#0f172a" metalness={0.65} roughness={0.45} />
      </mesh>
      {/* Protective Cross-Grille Struts */}
      {[0, Math.PI / 2].map((ang, idx) => (
        <mesh key={idx} position={[0, 0, 0.013]} rotation={[0, 0, ang]}>
          <boxGeometry args={[0.15, 0.006, 0.005]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.88} roughness={0.25} />
        </mesh>
      ))}
      {/* Shroud Telemetry LED */}
      <mesh position={[0.068, 0.042, 0.01]}>
        <sphereGeometry args={[0.008, 8, 8]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={1.8}
          toneMapped={false}
        />
      </mesh>

      {/* Spinning Multi-Blade Impeller Rotor */}
      <group ref={rotorRef} position={[0, 0, 0.002]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.022, 0.022, 14]} />
          <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0, 0.01]}>
          <sphereGeometry args={[0.016, 12, 8]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.92} roughness={0.18} />
        </mesh>
        {Array.from({ length: bladeCount }, (_, i) => (
          <group key={i} rotation={[0, 0, (i * Math.PI * 2) / bladeCount]}>
            <mesh position={[0.044, 0, 0]} rotation={[0.48, 0, 0]}>
              <boxGeometry args={[0.048, 0.016, 0.003]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.86} roughness={0.24} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

/** Metallic Common Berthing Mechanism / APAS Docking Ring Collar */
function DockingCollar({
  position,
  rotation = [0, 0, 0],
  radius = 0.19,
  materialProps,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  radius?: number;
  materialProps: Record<string, unknown>;
}) {
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <torusGeometry args={[radius, 0.014, 10, 24]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[radius * 0.94, radius * 0.94, 0.026, 20]} />
        <meshStandardMaterial color="#475569" metalness={0.88} roughness={0.28} />
      </mesh>
    </group>
  );
}

/** Gold-anodized EVA Translation Handrail */
function EvaHandrail({
  position,
  rotation = [0, 0, 0],
  length = 0.22,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  length?: number;
}) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.016, 0]}>
        <boxGeometry args={[length, 0.008, 0.008]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.85} roughness={0.25} />
      </mesh>
      {[-length * 0.42, length * 0.42].map((xOff, idx) => (
        <mesh key={idx} position={[xOff, 0.008, 0]}>
          <boxGeometry args={[0.01, 0.016, 0.01]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.85} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

/** 4-Nozzle Reaction Control System (RCS) Thruster Quad */
function RcsThrusterQuad({
  position,
  rotation = [0, 0, 0],
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
}) {
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <boxGeometry args={[0.042, 0.042, 0.042]} />
        <meshStandardMaterial color="#334155" metalness={0.88} roughness={0.28} />
      </mesh>
      {[
        [0.028, 0, 0, [0, 0, -Math.PI / 2]],
        [-0.028, 0, 0, [0, 0, Math.PI / 2]],
        [0, 0.028, 0, [0, 0, 0]],
        [0, -0.028, 0, [Math.PI, 0, 0]],
      ].map(([x, y, z, rot], idx) => (
        <mesh
          key={idx}
          position={[x as number, y as number, z as number]}
          rotation={rot as [number, number, number]}
        >
          <cylinderGeometry args={[0.006, 0.013, 0.026, 8]} />
          <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.22} />
        </mesh>
      ))}
    </group>
  );
}

/** Crisp Emissive Telemetry Status Beacon LED */
function StatusBeacon({
  position,
  color = '#22c55e',
}: {
  position: [number, number, number];
  color?: string;
}) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.011, 8, 8]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={2.0}
        toneMapped={false}
      />
    </mesh>
  );
}

/** Deterministic pseudo-random helper for repeatable procedural textures */
function hash2d(x: number, y: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return n - Math.floor(n);
}

/**
 * Crinkled Gold Kapton MLI (Multi-Layer Insulation) PBR texture set.
 */
function createKaptonMliTextures() {
  const size = 256;
  const height = new Float32Array(size * size);

  const seeds: Array<{ x: number; y: number; vx: number; vy: number }> = [];
  for (let i = 0; i < 64; i++) {
    seeds.push({
      x: hash2d(i, 1.3) * size,
      y: hash2d(i, 7.9) * size,
      vx: (hash2d(i, 3.1) - 0.5) * 2,
      vy: (hash2d(i, 9.7) - 0.5) * 2,
    });
  }

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let bestDist = 1e9;
      let secondDist = 1e9;
      let bestIdx = 0;
      for (let i = 0; i < seeds.length; i++) {
        let dx = Math.abs(x - seeds[i].x);
        let dy = Math.abs(y - seeds[i].y);
        if (dx > size * 0.5) dx = size - dx;
        if (dy > size * 0.5) dy = size - dy;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < bestDist) {
          secondDist = bestDist;
          bestDist = d;
          bestIdx = i;
        } else if (d < secondDist) {
          secondDist = d;
        }
      }
      const edge = Math.min(1, (secondDist - bestDist) / 7.5);
      const tilt =
        ((x - seeds[bestIdx].x) * seeds[bestIdx].vx +
          (y - seeds[bestIdx].y) * seeds[bestIdx].vy) *
        0.025;
      const micro = (hash2d(x * 0.35, y * 0.35) - 0.5) * 0.12;
      height[y * size + x] = edge * 0.65 + tilt + micro;
    }
  }

  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const cCtx = colorCanvas.getContext('2d');

  const normalCanvas = document.createElement('canvas');
  normalCanvas.width = size;
  normalCanvas.height = size;
  const nCtx = normalCanvas.getContext('2d');

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = size;
  roughCanvas.height = size;
  const rCtx = roughCanvas.getContext('2d');

  if (cCtx && nCtx && rCtx) {
    const cImg = cCtx.createImageData(size, size);
    const nImg = nCtx.createImageData(size, size);
    const rImg = rCtx.createImageData(size, size);

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = y * size + x;
        const p = idx * 4;

        const hL = height[y * size + ((x - 1 + size) % size)];
        const hR = height[y * size + ((x + 1) % size)];
        const hU = height[((y - 1 + size) % size) * size + x];
        const hD = height[((y + 1) % size) * size + x];

        const nx = (hL - hR) * 2.8;
        const ny = (hU - hD) * 2.8;
        const nz = 1.0;
        const len = Math.sqrt(nx * nx + ny * ny + nz * nz);

        nImg.data[p] = Math.floor(((nx / len) * 0.5 + 0.5) * 255);
        nImg.data[p + 1] = Math.floor(((ny / len) * 0.5 + 0.5) * 255);
        nImg.data[p + 2] = Math.floor(((nz / len) * 0.5 + 0.5) * 255);
        nImg.data[p + 3] = 255;

        const hVal = Math.max(0, Math.min(1, height[idx] * 0.5 + 0.5));
        cImg.data[p] = Math.floor(195 + hVal * 55);
        cImg.data[p + 1] = Math.floor(125 + hVal * 65);
        cImg.data[p + 2] = Math.floor(18 + hVal * 32);
        cImg.data[p + 3] = 255;

        const rough = Math.floor(55 + (1 - hVal) * 65);
        rImg.data[p] = rough;
        rImg.data[p + 1] = rough;
        rImg.data[p + 2] = rough;
        rImg.data[p + 3] = 255;
      }
    }

    cCtx.putImageData(cImg, 0, 0);
    nCtx.putImageData(nImg, 0, 0);
    rCtx.putImageData(rImg, 0, 0);

    cCtx.strokeStyle = 'rgba(251, 191, 36, 0.35)';
    cCtx.lineWidth = 2;
    cCtx.strokeRect(4, 4, size - 8, size - 8);
  }

  const map = new THREE.CanvasTexture(colorCanvas);
  const normalMap = new THREE.CanvasTexture(normalCanvas);
  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  [map, normalMap, roughnessMap].forEach((t) => {
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(2, 2);
    t.needsUpdate = true;
  });
  return { map, normalMap, roughnessMap };
}

/**
 * ISS Blue-Gold Photovoltaic Solar Array Grid with Copper/Kapton Flex-Circuit & Silver Busbars
 */
function createIssSolarArrayTextures() {
  const size = 512;
  const cCanvas = document.createElement('canvas');
  cCanvas.width = size;
  cCanvas.height = size;
  const cCtx = cCanvas.getContext('2d');

  const rCanvas = document.createElement('canvas');
  rCanvas.width = size;
  rCanvas.height = size;
  const rCtx = rCanvas.getContext('2d');

  if (cCtx && rCtx) {
    cCtx.fillStyle = '#5c3310';
    cCtx.fillRect(0, 0, size, size);
    rCtx.fillStyle = '#707070';
    rCtx.fillRect(0, 0, size, size);

    const cols = 6;
    const rows = 10;
    const cellW = size / cols;
    const cellH = size / rows;
    const pad = 3;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x0 = c * cellW + pad;
        const y0 = r * cellH + pad;
        const w = cellW - pad * 2;
        const h = cellH - pad * 2;

        const grad = cCtx.createLinearGradient(x0, y0, x0 + w, y0 + h);
        grad.addColorStop(0, '#0f2552');
        grad.addColorStop(0.5, '#1b3e88');
        grad.addColorStop(1, '#0c1c3d');
        cCtx.fillStyle = grad;
        cCtx.fillRect(x0, y0, w, h);

        rCtx.fillStyle = '#202020';
        rCtx.fillRect(x0, y0, w, h);

        cCtx.fillStyle = '#d97706';
        cCtx.fillRect(x0 + w * 0.5 - 0.8, y0 - pad, 1.6, pad);

        cCtx.strokeStyle = 'rgba(203, 213, 225, 0.32)';
        cCtx.lineWidth = 1;
        cCtx.beginPath();
        cCtx.moveTo(x0 + 2, y0 + h * 0.33);
        cCtx.lineTo(x0 + w - 2, y0 + h * 0.33);
        cCtx.moveTo(x0 + 2, y0 + h * 0.66);
        cCtx.lineTo(x0 + w - 2, y0 + h * 0.66);
        cCtx.stroke();

        cCtx.fillStyle = '#e2e8f0';
        cCtx.fillRect(x0 + w * 0.25, y0 + 1, 1.6, h - 2);
        cCtx.fillRect(x0 + w * 0.75, y0 + 1, 1.6, h - 2);
      }
    }

    cCtx.strokeStyle = '#f59e0b';
    cCtx.lineWidth = 2;
    for (let y = size / 4; y < size; y += size / 4) {
      cCtx.beginPath();
      cCtx.moveTo(0, y);
      cCtx.lineTo(size, y);
      cCtx.stroke();
    }
  }

  const map = new THREE.CanvasTexture(cCanvas);
  const roughnessMap = new THREE.CanvasTexture(rCanvas);
  [map, roughnessMap].forEach((t) => {
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(1, 3);
    t.needsUpdate = true;
  });
  return { map, roughnessMap };
}

/**
 * Pink/Violet-Tinted iROSA (ISS Roll-Out Solar Array) Blanket Texture
 */
function createIrosaTextures() {
  const size = 256;
  const cCanvas = document.createElement('canvas');
  cCanvas.width = size;
  cCanvas.height = size;
  const cCtx = cCanvas.getContext('2d');

  const rCanvas = document.createElement('canvas');
  rCanvas.width = size;
  rCanvas.height = size;
  const rCtx = rCanvas.getContext('2d');

  if (cCtx && rCtx) {
    cCtx.fillStyle = '#2d1233';
    cCtx.fillRect(0, 0, size, size);
    rCtx.fillStyle = '#262626';
    rCtx.fillRect(0, 0, size, size);

    const cols = 4;
    const rows = 8;
    const cellW = size / cols;
    const cellH = size / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x0 = c * cellW + 2;
        const y0 = r * cellH + 2;
        const w = cellW - 4;
        const h = cellH - 4;

        const grad = cCtx.createLinearGradient(x0, y0, x0 + w, y0 + h);
        grad.addColorStop(0, '#6b21a8');
        grad.addColorStop(0.5, '#a21caf');
        grad.addColorStop(1, '#4c1d95');
        cCtx.fillStyle = grad;
        cCtx.fillRect(x0, y0, w, h);

        cCtx.fillStyle = 'rgba(244, 114, 182, 0.35)';
        cCtx.fillRect(x0 + w * 0.5 - 1, y0, 2, h);
      }
    }
  }

  const map = new THREE.CanvasTexture(cCanvas);
  const roughnessMap = new THREE.CanvasTexture(rCanvas);
  [map, roughnessMap].forEach((t) => {
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(1, 2);
    t.needsUpdate = true;
  });
  return { map, roughnessMap };
}

/**
 * Brushed Aluminum & Titanium Pressure-Hull Paneling with Whipple Micrometeoroid Shield Seams
 */
function createHullPanelTextures() {
  const size = 256;
  const cCanvas = document.createElement('canvas');
  cCanvas.width = size;
  cCanvas.height = size;
  const cCtx = cCanvas.getContext('2d');

  const rCanvas = document.createElement('canvas');
  rCanvas.width = size;
  rCanvas.height = size;
  const rCtx = rCanvas.getContext('2d');

  if (cCtx && rCtx) {
    cCtx.fillStyle = '#cbd5e1';
    cCtx.fillRect(0, 0, size, size);
    rCtx.fillStyle = '#525252';
    rCtx.fillRect(0, 0, size, size);

    for (let y = 0; y < size; y++) {
      const v = 195 + Math.floor(hash2d(y, 4.2) * 26);
      cCtx.fillStyle = `rgb(${v},${v + 3},${v + 7})`;
      cCtx.fillRect(0, y, size, 1);
    }

    cCtx.strokeStyle = 'rgba(51, 65, 85, 0.45)';
    cCtx.lineWidth = 2;
    rCtx.strokeStyle = '#999999';
    rCtx.lineWidth = 2;
    const step = 64;
    for (let i = 0; i <= size; i += step) {
      cCtx.beginPath();
      cCtx.moveTo(i, 0);
      cCtx.lineTo(i, size);
      cCtx.moveTo(0, i);
      cCtx.lineTo(size, i);
      cCtx.stroke();

      rCtx.beginPath();
      rCtx.moveTo(i, 0);
      rCtx.lineTo(i, size);
      rCtx.moveTo(0, i);
      rCtx.lineTo(size, i);
      rCtx.stroke();
    }
  }

  const map = new THREE.CanvasTexture(cCanvas);
  const roughnessMap = new THREE.CanvasTexture(rCanvas);
  [map, roughnessMap].forEach((t) => {
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(2, 2);
    t.needsUpdate = true;
  });
  return { map, roughnessMap };
}

/**
 * White Z-93 Ceramic Corrugated Ammonia HRS Radiator Panel Texture
 */
function createRadiatorTextures() {
  const size = 256;
  const cCanvas = document.createElement('canvas');
  cCanvas.width = size;
  cCanvas.height = size;
  const cCtx = cCanvas.getContext('2d');

  const nCanvas = document.createElement('canvas');
  nCanvas.width = size;
  nCanvas.height = size;
  const nCtx = nCanvas.getContext('2d');

  if (cCtx && nCtx) {
    cCtx.fillStyle = '#f1f5f9';
    cCtx.fillRect(0, 0, size, size);
    nCtx.fillStyle = 'rgb(128,128,255)';
    nCtx.fillRect(0, 0, size, size);

    for (let x = 0; x < size; x += 16) {
      cCtx.fillStyle = '#e2e8f0';
      cCtx.fillRect(x, 0, 5, size);
      cCtx.fillStyle = '#cbd5e1';
      cCtx.fillRect(x + 5, 0, 2, size);

      nCtx.fillStyle = 'rgb(165,128,245)';
      nCtx.fillRect(x, 0, 4, size);
      nCtx.fillStyle = 'rgb(90,128,245)';
      nCtx.fillRect(x + 4, 0, 4, size);
    }

    cCtx.strokeStyle = '#94a3b8';
    cCtx.lineWidth = 2;
    for (let y = 32; y < size; y += 32) {
      cCtx.beginPath();
      cCtx.moveTo(0, y);
      cCtx.lineTo(size, y);
      cCtx.stroke();
    }
  }

  const map = new THREE.CanvasTexture(cCanvas);
  const normalMap = new THREE.CanvasTexture(nCanvas);
  [map, normalMap].forEach((t) => {
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(2, 3);
    t.needsUpdate = true;
  });
  return { map, normalMap };
}

/**
 * Open-lattice cross-braced truss segment helper
 */
function TrussBay({
  position,
  length,
  width = 0.24,
  height = 0.24,
  bays = 4,
  materialProps,
}: {
  position: [number, number, number];
  length: number;
  width?: number;
  height?: number;
  bays?: number;
  materialProps: Record<string, unknown>;
}) {
  const hw = width * 0.5;
  const hh = height * 0.5;
  const bayLen = length / bays;
  const diagLen = Math.sqrt(bayLen * bayLen + height * height);
  const diagAngle = Math.atan2(height, bayLen);

  return (
    <group position={position}>
      {[
        [hh, hw],
        [hh, -hw],
        [-hh, hw],
        [-hh, -hw],
      ].map(([y, z], idx) => (
        <mesh key={idx} position={[0, y, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.014, 0.014, length, 8]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
      ))}

      {Array.from({ length: bays + 1 }, (_, i) => {
        const x = -length * 0.5 + i * bayLen;
        return (
          <group key={i} position={[x, 0, 0]}>
            {[hw, -hw].map((z, zi) => (
              <mesh key={`v-${zi}`} position={[0, 0, z]}>
                <cylinderGeometry args={[0.009, 0.009, height, 6]} />
                <meshStandardMaterial {...materialProps} />
              </mesh>
            ))}
            {[hh, -hh].map((y, yi) => (
              <mesh key={`h-${yi}`} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.009, 0.009, width, 6]} />
                <meshStandardMaterial {...materialProps} />
              </mesh>
            ))}
            {i < bays && (
              <>
                {[hw, -hw].map((z, zi) => (
                  <mesh
                    key={`d-${zi}`}
                    position={[bayLen * 0.5, 0, z]}
                    rotation={[0, 0, i % 2 === 0 ? diagAngle : -diagAngle]}
                  >
                    <cylinderGeometry args={[0.008, 0.008, diagLen, 6]} />
                    <meshStandardMaterial {...materialProps} />
                  </mesh>
                ))}
              </>
            )}
          </group>
        );
      })}
    </group>
  );
}

/**
 * Super-realistic 3D International Space Station (ISS) Assembly.
 * Supports static inspection, click-to-select part telemetry, dramatic
 * multi-tier exploded separation with CAD guide lines, and 4 thermal/avionics motion fans.
 */
export function SatelliteLabScene({
  interactionRef,
  selectedPartId,
  onSelectPart,
  exploded,
}: SatelliteLabSceneProps) {
  const rootRef = useRef<THREE.Group>(null);

  const kapton = useMemo(() => createKaptonMliTextures(), []);
  const solarTex = useMemo(() => createIssSolarArrayTextures(), []);
  const irosaTex = useMemo(() => createIrosaTextures(), []);
  const hullTex = useMemo(() => createHullPanelTextures(), []);
  const radiatorTex = useMemo(() => createRadiatorTextures(), []);

  useEffect(() => {
    return () => {
      kapton.map.dispose();
      kapton.normalMap.dispose();
      kapton.roughnessMap.dispose();
      solarTex.map.dispose();
      solarTex.roughnessMap.dispose();
      irosaTex.map.dispose();
      irosaTex.roughnessMap.dispose();
      hullTex.map.dispose();
      hullTex.roughnessMap.dispose();
      radiatorTex.map.dispose();
      radiatorTex.normalMap.dispose();
    };
  }, [kapton, solarTex, irosaTex, hullTex, radiatorTex]);

  useFrame((_, delta) => {
    if (!rootRef.current) return;
    const dt = Math.min(delta, 0.05);
    const inter = interactionRef.current;

    const clampedScale =
      inter.activeGesture === 'TWO_HANDS'
        ? 1
        : Math.min(Math.max(inter.sphereScale, 0.68), 1.48);
    rootRef.current.scale.setScalar(damp(rootRef.current.scale.x, clampedScale, 8, dt));
    rootRef.current.position.x = damp(rootRef.current.position.x, inter.pinchOffset.x * 0.6, 8, dt);
    rootRef.current.position.y = damp(rootRef.current.position.y, inter.pinchOffset.y * 0.45, 8, dt);
  });

  const pbr = (
    id: string,
    color: string,
    metalness = 0.78,
    roughness = 0.28,
    emissiveBase = '#050814'
  ) => {
    const sel = selectedPartId === id;
    return {
      color: sel ? '#fde68a' : color,
      emissive: sel ? '#d97706' : emissiveBase,
      emissiveIntensity: sel ? 0.7 : 0.06,
      metalness,
      roughness,
    };
  };

  const toggle = (id: string) => {
    onSelectPart(selectedPartId === id ? null : id);
  };

  /** Reusable Dual-Wing Photovoltaic Solar Array + iROSA + Optional Outboard Radiator */
  const renderSolarPair = (
    xBase: number,
    xExploded: number,
    hasOutboardRadiator: boolean,
    isPort: boolean
  ) => {
    const sideSign = isPort ? -1 : 1;
    return (
      <ExplodedSubPart
        key={`saw-${xBase}`}
        basePos={[xBase, 0.28, 0]}
        explodedPos={[xExploded, 0.28, 0]}
        exploded={exploded}
        interactionRef={interactionRef}
      >
        {/* Beta Gimbal Assembly (BGA) Mast */}
        <mesh>
          <cylinderGeometry args={[0.075, 0.075, 0.42, 16]} />
          <meshStandardMaterial map={hullTex.map} {...pbr('solar_arrays', '#cbd5e1', 0.88, 0.24)} />
        </mesh>
        <StatusBeacon position={[0, 0.22, 0.08]} color="#22c55e" />

        {/* Upper (+Y) and Lower (-Y) Solar Wings */}
        {[1, -1].map((yDir) => (
          <ExplodedSubPart
            key={yDir}
            basePos={[0, yDir * 0.24, 0]}
            explodedPos={[0, yDir * 0.56, 0]}
            exploded={exploded}
            interactionRef={interactionRef}
          >
            {/* Blanket Box Container */}
            <mesh position={[0, yDir * 0.06, 0]}>
              <boxGeometry args={[0.42, 0.08, 0.14]} />
              <meshStandardMaterial {...pbr('solar_arrays', '#94a3b8', 0.85, 0.3)} />
            </mesh>
            {/* Central Deployment Mast */}
            <mesh position={[0, yDir * 1.18, 0]}>
              <cylinderGeometry args={[0.016, 0.016, 2.24, 8]} />
              <meshStandardMaterial {...pbr('solar_arrays', '#e2e8f0', 0.9, 0.22)} />
            </mesh>
            {/* Dual Solar Cell Blankets per Wing */}
            {[-0.14, 0.14].map((xBlanket, bIdx) => (
              <mesh key={bIdx} position={[xBlanket, yDir * 1.18, 0]}>
                <boxGeometry args={[0.24, 2.18, 0.012]} />
                <meshStandardMaterial
                  map={solarTex.map}
                  roughnessMap={solarTex.roughnessMap}
                  color={selectedPartId === 'solar_arrays' ? '#93c5fd' : '#ffffff'}
                  emissive={selectedPartId === 'solar_arrays' ? '#1d4ed8' : '#020617'}
                  emissiveIntensity={selectedPartId === 'solar_arrays' ? 0.5 : 0.05}
                  metalness={0.38}
                  roughness={0.18}
                />
              </mesh>
            ))}

            {/* Pink/Violet-Tinted iROSA Roll-Out Solar Array Overlay (on 4 wings) */}
            {((!hasOutboardRadiator && yDir === 1) || (hasOutboardRadiator && yDir === -1)) && (
              <ExplodedSubPart
                basePos={[0, yDir * 0.84, 0.045]}
                explodedPos={[0, yDir * 0.98, 0.32]}
                exploded={exploded}
                interactionRef={interactionRef}
              >
                <group rotation={[0.04 * yDir, 0, 0]}>
                  <mesh>
                    <boxGeometry args={[0.44, 1.38, 0.016]} />
                    <meshStandardMaterial
                      map={irosaTex.map}
                      roughnessMap={irosaTex.roughnessMap}
                      color={selectedPartId === 'solar_arrays' ? '#f0abfc' : '#ffffff'}
                      emissive={selectedPartId === 'solar_arrays' ? '#a21caf' : '#2e1065'}
                      emissiveIntensity={selectedPartId === 'solar_arrays' ? 0.6 : 0.12}
                      metalness={0.35}
                      roughness={0.16}
                    />
                  </mesh>
                  {/* Carbon Tensioner Booms */}
                  {[-0.22, 0.22].map((bx, idx) => (
                    <mesh key={idx} position={[bx, 0, -0.01]}>
                      <cylinderGeometry args={[0.008, 0.008, 1.4, 6]} />
                      <meshStandardMaterial {...pbr('solar_arrays', '#1e293b', 0.5, 0.45)} />
                    </mesh>
                  ))}
                </group>
              </ExplodedSubPart>
            )}
          </ExplodedSubPart>
        ))}

        {/* Outboard P6 / S6 Photovoltaic Thermal Control Radiators (PVR) */}
        {hasOutboardRadiator && (
          <ExplodedSubPart
            basePos={[sideSign * -0.18, 0.12, -0.58]}
            explodedPos={[sideSign * -0.42, 0.12, -1.12]}
            exploded={exploded}
            interactionRef={interactionRef}
          >
            <mesh>
              <boxGeometry args={[0.024, 0.28, 1.05]} />
              <meshStandardMaterial
                map={radiatorTex.map}
                normalMap={radiatorTex.normalMap}
                {...pbr('solar_arrays', '#f8fafc', 0.18, 0.48)}
              />
            </mesh>
          </ExplodedSubPart>
        )}
      </ExplodedSubPart>
    );
  };

  /** Reusable Triple-Panel Ammonia HRS Radiator Wing */
  const renderHrsRadiator = (xBase: number, xExploded: number) => (
    <ExplodedSubPart
      key={`hrs-${xBase}`}
      basePos={[xBase, 0.34, -0.78]}
      explodedPos={[xExploded, 0.34, -0.78]}
      exploded={exploded}
      interactionRef={interactionRef}
    >
      {/* Rotary Thermal Control Hub */}
      <mesh position={[0, 0, 0.65]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.16, 16]} />
        <meshStandardMaterial {...pbr('radiators', '#94a3b8', 0.88, 0.24)} />
      </mesh>
      {/* Triple Corrugated Z-93 White Radiator Panels */}
      {[-0.24, 0, 0.24].map((xOff, pIdx) => (
        <ExplodedSubPart
          key={pIdx}
          basePos={[xOff, 0, 0]}
          explodedPos={[xOff * 1.65, 0, (pIdx - 1) * 0.12]}
          exploded={exploded}
          interactionRef={interactionRef}
        >
          <mesh>
            <boxGeometry args={[0.21, 0.02, 1.24]} />
            <meshStandardMaterial
              map={radiatorTex.map}
              normalMap={radiatorTex.normalMap}
              {...pbr('radiators', '#f8fafc', 0.15, 0.48)}
            />
          </mesh>
          {/* Aluminum Structural Spine */}
          <mesh position={[0, 0.014, 0]}>
            <boxGeometry args={[0.025, 0.015, 1.26]} />
            <meshStandardMaterial {...pbr('radiators', '#94a3b8', 0.85, 0.28)} />
          </mesh>
        </ExplodedSubPart>
      ))}
    </ExplodedSubPart>
  );

  return (
    <>
      {/* Orbital High-Contrast Studio Lighting */}
      <Environment resolution={128} frames={1}>
        <Lightformer
          form="rect"
          intensity={2.9}
          position={[5, 7, 6]}
          rotation={[Math.PI / 3, 0.4, 0]}
          scale={[12, 5, 1]}
          color="#fffbeb"
        />
        <Lightformer
          form="rect"
          intensity={1.6}
          position={[-7, 3, -4]}
          rotation={[0, Math.PI / 2.5, 0]}
          scale={[10, 5, 1]}
          color="#bae6fd"
        />
        <Lightformer
          form="rect"
          intensity={1.1}
          position={[0, -6, 2]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[12, 6, 1]}
          color="#94a3b8"
        />
      </Environment>

      <directionalLight position={[7, 8, 6]} intensity={2.35} color="#fffbeb" />
      <directionalLight position={[-6, -3, -5]} intensity={0.95} color="#7dd3fc" />

      <group ref={rootRef} position={[0, -0.1, 0]} rotation={[0.26, -0.52, 0.03]} scale={0.76}>
        {/* CAD Axial & Vector Explosion Guide Lines */}
        <ExplosionGuideLines exploded={exploded} interactionRef={interactionRef} />

        {/* =====================================================================
            1. INTEGRATED TRUSS STRUCTURE (S6–P6), SARJ, CANADARM2 & AMS-02
           ===================================================================== */}
        <SatellitePart
          id="truss"
          basePos={[0, 0, 0]}
          explodedPos={[0, 1.85, 0]}
          exploded={exploded}
          interactionRef={interactionRef}
          onSelect={toggle}
        >
          {/* Central S0 Truss Spine + Avionics Cooling Fan */}
          <ExplodedSubPart
            basePos={[0, 0.28, 0]}
            explodedPos={[0, 0.28, 0]}
            exploded={exploded}
            interactionRef={interactionRef}
          >
            <TrussBay
              position={[0, 0, 0]}
              length={1.08}
              width={0.3}
              height={0.28}
              bays={5}
              materialProps={pbr('truss', '#cbd5e1', 0.88, 0.26)}
            />
            <MotionFan
              position={[0.18, 0, 0.16]}
              speed={5.2}
              accentColor="#38bdf8"
              bladeCount={8}
            />
            <StatusBeacon position={[-0.42, 0.15, 0.15]} color="#22c55e" />
            <StatusBeacon position={[0.42, 0.15, 0.15]} color="#f59e0b" />
          </ExplodedSubPart>

          {/* Z1 Zenith Truss Tower (above Node 1) */}
          <ExplodedSubPart
            basePos={[0, 0.46, -0.52]}
            explodedPos={[0, 1.05, -0.85]}
            exploded={exploded}
            interactionRef={interactionRef}
          >
            <TrussBay
              position={[0, 0, 0]}
              length={0.34}
              width={0.28}
              height={0.32}
              bays={2}
              materialProps={pbr('truss', '#cbd5e1', 0.86, 0.28)}
            />
            {/* Ku-Band Space-to-Ground Dish on Z1 */}
            <mesh position={[0.14, 0.22, -0.06]} rotation={[0.35, 0, -0.25]}>
              <cylinderGeometry args={[0.14, 0.04, 0.06, 20]} />
              <meshStandardMaterial {...pbr('truss', '#e2e8f0', 0.85, 0.22)} />
            </mesh>
            <StatusBeacon position={[-0.14, 0.18, 0.12]} color="#22c55e" />
          </ExplodedSubPart>

          {/* S1 (Starboard) and P1 (Port) Radiator Trusses + Thermal Control Motion Fans */}
          <ExplodedSubPart
            basePos={[0.88, 0.28, 0]}
            explodedPos={[1.28, 0.28, 0]}
            exploded={exploded}
            interactionRef={interactionRef}
          >
            <TrussBay
              position={[0, 0, 0]}
              length={0.72}
              width={0.26}
              height={0.24}
              bays={3}
              materialProps={pbr('truss', '#cbd5e1', 0.88, 0.26)}
            />
            <MotionFan
              position={[0, 0, -0.14]}
              rotation={[0, Math.PI, 0]}
              speed={-4.6}
              accentColor="#f59e0b"
              bladeCount={9}
            />
          </ExplodedSubPart>

          <ExplodedSubPart
            basePos={[-0.88, 0.28, 0]}
            explodedPos={[-1.28, 0.28, 0]}
            exploded={exploded}
            interactionRef={interactionRef}
          >
            <TrussBay
              position={[0, 0, 0]}
              length={0.72}
              width={0.26}
              height={0.24}
              bays={3}
              materialProps={pbr('truss', '#cbd5e1', 0.88, 0.26)}
            />
            <MotionFan
              position={[0, 0, -0.14]}
              rotation={[0, Math.PI, 0]}
              speed={4.6}
              accentColor="#f59e0b"
              bladeCount={9}
            />
          </ExplodedSubPart>

          {/* Port & Starboard Solar Alpha Rotary Joints (SARJ) */}
          {[-1, 1].map((sign, idx) => (
            <ExplodedSubPart
              key={idx}
              basePos={[sign * 1.34, 0.28, 0]}
              explodedPos={[sign * 1.98, 0.28, 0]}
              exploded={exploded}
              interactionRef={interactionRef}
            >
              <group rotation={[0, 0, Math.PI / 2]}>
                <mesh>
                  <cylinderGeometry args={[0.2, 0.2, 0.18, 12]} />
                  <meshStandardMaterial
                    map={kapton.map}
                    normalMap={kapton.normalMap}
                    roughnessMap={kapton.roughnessMap}
                    {...pbr('truss', '#f59e0b', 0.9, 0.3, '#2a1602')}
                  />
                </mesh>
                <mesh position={[0, 0.09, 0]} rotation={[Math.PI / 2, 0, 0]}>
                  <torusGeometry args={[0.21, 0.02, 8, 24]} />
                  <meshStandardMaterial {...pbr('truss', '#e2e8f0', 0.92, 0.2)} />
                </mesh>
              </group>
            </ExplodedSubPart>
          ))}

          {/* S3/S4 & P3/P4 Outboard Trusses */}
          <ExplodedSubPart
            basePos={[1.82, 0.28, 0]}
            explodedPos={[2.72, 0.28, 0]}
            exploded={exploded}
            interactionRef={interactionRef}
          >
            <TrussBay
              position={[0, 0, 0]}
              length={0.82}
              width={0.24}
              height={0.24}
              bays={4}
              materialProps={pbr('truss', '#cbd5e1', 0.88, 0.26)}
            />
          </ExplodedSubPart>
          <ExplodedSubPart
            basePos={[-1.82, 0.28, 0]}
            explodedPos={[-2.72, 0.28, 0]}
            exploded={exploded}
            interactionRef={interactionRef}
          >
            <TrussBay
              position={[0, 0, 0]}
              length={0.82}
              width={0.24}
              height={0.24}
              bays={4}
              materialProps={pbr('truss', '#cbd5e1', 0.88, 0.26)}
            />
          </ExplodedSubPart>

          {/* S5/S6 & P5/P6 Outer Spacer & Array Trusses */}
          <ExplodedSubPart
            basePos={[2.7, 0.28, 0]}
            explodedPos={[3.98, 0.28, 0]}
            exploded={exploded}
            interactionRef={interactionRef}
          >
            <TrussBay
              position={[0, 0, 0]}
              length={0.94}
              width={0.22}
              height={0.22}
              bays={4}
              materialProps={pbr('truss', '#cbd5e1', 0.88, 0.26)}
            />
          </ExplodedSubPart>
          <ExplodedSubPart
            basePos={[-2.7, 0.28, 0]}
            explodedPos={[-3.98, 0.28, 0]}
            exploded={exploded}
            interactionRef={interactionRef}
          >
            <TrussBay
              position={[0, 0, 0]}
              length={0.94}
              width={0.22}
              height={0.22}
              bays={4}
              materialProps={pbr('truss', '#cbd5e1', 0.88, 0.26)}
            />
          </ExplodedSubPart>

          {/* AMS-02 Alpha Magnetic Spectrometer (Zenith S3) */}
          <ExplodedSubPart
            basePos={[1.56, 0.5, 0.06]}
            explodedPos={[2.68, 0.92, 0.06]}
            exploded={exploded}
            interactionRef={interactionRef}
          >
            <mesh>
              <cylinderGeometry args={[0.14, 0.14, 0.22, 16]} />
              <meshStandardMaterial
                map={kapton.map}
                normalMap={kapton.normalMap}
                {...pbr('truss', '#fbbf24', 0.9, 0.28)}
              />
            </mesh>
            <mesh position={[0, 0.12, 0]}>
              <boxGeometry args={[0.26, 0.04, 0.26]} />
              <meshStandardMaterial {...pbr('truss', '#e2e8f0', 0.9, 0.22)} />
            </mesh>
          </ExplodedSubPart>

          {/* Mobile Servicing System (MBS) & Canadarm2 Articulated Manipulator */}
          <ExplodedSubPart
            basePos={[-0.25, 0.44, 0.14]}
            explodedPos={[-0.25, 0.98, 0.42]}
            exploded={exploded}
            interactionRef={interactionRef}
          >
            <mesh>
              <boxGeometry args={[0.24, 0.09, 0.22]} />
              <meshStandardMaterial {...pbr('truss', '#e2e8f0', 0.88, 0.24)} />
            </mesh>
            <mesh position={[0.18, 0.18, 0.08]} rotation={[0.3, 0, -0.75]}>
              <cylinderGeometry args={[0.022, 0.022, 0.52, 10]} />
              <meshStandardMaterial {...pbr('truss', '#f8fafc', 0.72, 0.28)} />
            </mesh>
            <mesh position={[0.36, 0.34, 0.16]}>
              <sphereGeometry args={[0.036, 12, 12]} />
              <meshStandardMaterial {...pbr('truss', '#94a3b8', 0.9, 0.22)} />
            </mesh>
            <mesh position={[0.56, 0.22, 0.28]} rotation={[0.45, 0, 0.85]}>
              <cylinderGeometry args={[0.02, 0.02, 0.48, 10]} />
              <meshStandardMaterial {...pbr('truss', '#f8fafc', 0.72, 0.28)} />
            </mesh>
          </ExplodedSubPart>
        </SatellitePart>

        {/* =====================================================================
            2. PHOTOVOLTAIC SOLAR ARRAYS (8 WINGS) + 4x iROSA + P6/S6 RADIATORS
           ===================================================================== */}
        <SatellitePart
          id="solar_arrays"
          basePos={[0, 0, 0]}
          explodedPos={[-2.35, 2.55, 0.35]}
          exploded={exploded}
          interactionRef={interactionRef}
          onSelect={toggle}
        >
          {renderSolarPair(-2.05, -2.65, false, true)}
          {renderSolarPair(-3.02, -4.15, true, true)}
        </SatellitePart>

        <SatellitePart
          id="solar_arrays"
          basePos={[0, 0, 0]}
          explodedPos={[2.35, 2.55, 0.35]}
          exploded={exploded}
          interactionRef={interactionRef}
          onSelect={toggle}
        >
          {renderSolarPair(2.05, 2.65, false, false)}
          {renderSolarPair(3.02, 4.15, true, false)}
        </SatellitePart>

        {/* =====================================================================
            3. STARBOARD (S1) & PORT (P1) TRIPLE-PANEL HRS AMMONIA RADIATORS
           ===================================================================== */}
        <SatellitePart
          id="radiators"
          basePos={[0, 0, 0]}
          explodedPos={[0, 2.05, -2.65]}
          exploded={exploded}
          interactionRef={interactionRef}
          onSelect={toggle}
        >
          {renderHrsRadiator(-0.88, -1.45)}
          {renderHrsRadiator(0.88, 1.45)}
        </SatellitePart>

        {/* =====================================================================
            4. USOS PRESSURIZED MODULES: UNITY, DESTINY, HARMONY, TRANQUILITY,
               CUPOLA, ESA COLUMBUS, JAXA KIBO + ELM-PS + EXPOSED FACILITY
           ===================================================================== */}
        <SatellitePart
          id="usos_modules"
          basePos={[0, 0, 0]}
          explodedPos={[0, -0.85, 0.75]}
          exploded={exploded}
          interactionRef={interactionRef}
          onSelect={toggle}
        >
          {/* U.S. Laboratory (Destiny) under S0 Truss */}
          <ExplodedSubPart
            basePos={[0, -0.02, 0.05]}
            explodedPos={[0, -0.02, 0.05]}
            exploded={exploded}
            interactionRef={interactionRef}
          >
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.21, 0.21, 0.95, 24]} />
              <meshStandardMaterial
                map={hullTex.map}
                roughnessMap={hullTex.roughnessMap}
                {...pbr('usos_modules', '#e2e8f0', 0.82, 0.26)}
              />
            </mesh>
            {[0.52, -0.52].map((zOff, idx) => (
              <mesh
                key={idx}
                position={[0, 0, zOff]}
                rotation={[idx === 0 ? Math.PI / 2 : -Math.PI / 2, 0, 0]}
              >
                <cylinderGeometry args={[0.14, 0.21, 0.1, 24]} />
                <meshStandardMaterial {...pbr('usos_modules', '#cbd5e1', 0.85, 0.25)} />
              </mesh>
            ))}
            <DockingCollar
              position={[0, 0, 0.56]}
              radius={0.145}
              materialProps={pbr('usos_modules', '#94a3b8', 0.9, 0.2)}
            />
            <DockingCollar
              position={[0, 0, -0.56]}
              radius={0.145}
              materialProps={pbr('usos_modules', '#94a3b8', 0.9, 0.2)}
            />
            <EvaHandrail position={[0.21, 0, 0]} rotation={[0, Math.PI / 2, -Math.PI / 2]} length={0.44} />
            <EvaHandrail position={[-0.21, 0, 0]} rotation={[0, -Math.PI / 2, Math.PI / 2]} length={0.44} />
          </ExplodedSubPart>

          {/* Node 2 (Harmony) Forward of Destiny */}
          <ExplodedSubPart
            basePos={[0, -0.02, 0.92]}
            explodedPos={[0, -0.02, 1.55]}
            exploded={exploded}
            interactionRef={interactionRef}
          >
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.21, 0.21, 0.68, 24]} />
              <meshStandardMaterial
                map={hullTex.map}
                roughnessMap={hullTex.roughnessMap}
                {...pbr('usos_modules', '#e2e8f0', 0.82, 0.26)}
              />
            </mesh>
            <DockingCollar
              position={[0, 0, 0.35]}
              radius={0.195}
              materialProps={pbr('usos_modules', '#94a3b8', 0.9, 0.2)}
            />
            <StatusBeacon position={[0.18, 0.16, 0.26]} color="#22c55e" />
          </ExplodedSubPart>

          {/* ESA Columbus Lab (Starboard +X of Harmony) */}
          <ExplodedSubPart
            basePos={[0.56, -0.02, 0.92]}
            explodedPos={[1.28, -0.02, 1.55]}
            exploded={exploded}
            interactionRef={interactionRef}
          >
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.2, 0.2, 0.68, 24]} />
              <meshStandardMaterial
                map={hullTex.map}
                roughnessMap={hullTex.roughnessMap}
                {...pbr('usos_modules', '#f1f5f9', 0.8, 0.26)}
              />
            </mesh>
            <mesh position={[0.38, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
              <cylinderGeometry args={[0.12, 0.2, 0.1, 24]} />
              <meshStandardMaterial {...pbr('usos_modules', '#94a3b8', 0.85, 0.24)} />
            </mesh>
            <DockingCollar
              position={[-0.34, 0, 0]}
              rotation={[0, Math.PI / 2, 0]}
              radius={0.19}
              materialProps={pbr('usos_modules', '#94a3b8', 0.9, 0.2)}
            />
            <EvaHandrail position={[0, 0.2, 0]} length={0.34} />
            <StatusBeacon position={[0.22, 0.16, 0.12]} color="#38bdf8" />
          </ExplodedSubPart>

          {/* JAXA JEM (Kibo) + ELM-PS + Exposed Facility (Port -X of Harmony) */}
          <ExplodedSubPart
            basePos={[-0.68, -0.02, 0.92]}
            explodedPos={[-1.45, -0.02, 1.55]}
            exploded={exploded}
            interactionRef={interactionRef}
          >
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.21, 0.21, 0.92, 24]} />
              <meshStandardMaterial
                map={hullTex.map}
                roughnessMap={hullTex.roughnessMap}
                {...pbr('usos_modules', '#f8fafc', 0.8, 0.26)}
              />
            </mesh>
            <DockingCollar
              position={[0.46, 0, 0]}
              rotation={[0, Math.PI / 2, 0]}
              radius={0.195}
              materialProps={pbr('usos_modules', '#94a3b8', 0.9, 0.2)}
            />
            <EvaHandrail position={[0, 0.21, 0]} length={0.42} />

            {/* ELM-PS Logistics Module (Zenith +Y on Kibo) */}
            <ExplodedSubPart
              basePos={[-0.1, 0.34, 0]}
              explodedPos={[-0.1, 0.72, 0]}
              exploded={exploded}
              interactionRef={interactionRef}
            >
              <mesh>
                <cylinderGeometry args={[0.17, 0.17, 0.38, 20]} />
                <meshStandardMaterial
                  map={hullTex.map}
                  {...pbr('usos_modules', '#e2e8f0', 0.82, 0.26)}
                />
              </mesh>
              <StatusBeacon position={[0.14, 0.16, 0.1]} color="#f59e0b" />
            </ExplodedSubPart>

            {/* JEM Exposed Facility (EF) External Porch */}
            <ExplodedSubPart
              basePos={[-0.66, -0.04, 0]}
              explodedPos={[-1.12, -0.04, 0]}
              exploded={exploded}
              interactionRef={interactionRef}
            >
              <mesh>
                <boxGeometry args={[0.42, 0.14, 0.34]} />
                <meshStandardMaterial {...pbr('usos_modules', '#94a3b8', 0.85, 0.3)} />
              </mesh>
              {[-0.1, 0.1].map((px, idx) => (
                <mesh key={idx} position={[px, 0.12, 0]}>
                  <boxGeometry args={[0.12, 0.12, 0.18]} />
                  <meshStandardMaterial
                    map={kapton.map}
                    {...pbr('usos_modules', '#f59e0b', 0.88, 0.3)}
                  />
                </mesh>
              ))}
            </ExplodedSubPart>
          </ExplodedSubPart>

          {/* Node 1 (Unity) Aft of Destiny */}
          <ExplodedSubPart
            basePos={[0, -0.02, -0.78]}
            explodedPos={[0, -0.02, -1.35]}
            exploded={exploded}
            interactionRef={interactionRef}
          >
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.21, 0.21, 0.56, 24]} />
              <meshStandardMaterial
                map={hullTex.map}
                roughnessMap={hullTex.roughnessMap}
                {...pbr('usos_modules', '#e2e8f0', 0.82, 0.26)}
              />
            </mesh>
            <DockingCollar
              position={[0, 0, -0.28]}
              radius={0.195}
              materialProps={pbr('usos_modules', '#94a3b8', 0.9, 0.2)}
            />
          </ExplodedSubPart>

          {/* Node 3 (Tranquility) + 7-Window Cupola (Port -X of Unity) */}
          <ExplodedSubPart
            basePos={[-0.52, -0.02, -0.78]}
            explodedPos={[-1.18, -0.02, -1.35]}
            exploded={exploded}
            interactionRef={interactionRef}
          >
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.2, 0.2, 0.62, 24]} />
              <meshStandardMaterial
                map={hullTex.map}
                roughnessMap={hullTex.roughnessMap}
                {...pbr('usos_modules', '#e2e8f0', 0.82, 0.26)}
              />
            </mesh>
            <DockingCollar
              position={[0.31, 0, 0]}
              rotation={[0, Math.PI / 2, 0]}
              radius={0.19}
              materialProps={pbr('usos_modules', '#94a3b8', 0.9, 0.2)}
            />
            {/* 7-Window Cupola Observatory Dome (Nadir -Y) */}
            <ExplodedSubPart
              basePos={[-0.08, -0.24, 0]}
              explodedPos={[-0.08, -0.56, 0]}
              exploded={exploded}
              interactionRef={interactionRef}
            >
              <mesh>
                <cylinderGeometry args={[0.14, 0.1, 0.12, 7]} />
                <meshStandardMaterial {...pbr('usos_modules', '#64748b', 0.88, 0.25)} />
              </mesh>
              <mesh position={[0, -0.065, 0]}>
                <cylinderGeometry args={[0.08, 0.08, 0.02, 7]} />
                <meshPhysicalMaterial
                  color="#38bdf8"
                  emissive="#0284c7"
                  emissiveIntensity={0.35}
                  metalness={0.2}
                  roughness={0.05}
                  clearcoat={1}
                />
              </mesh>
            </ExplodedSubPart>
          </ExplodedSubPart>
        </SatellitePart>

        {/* =====================================================================
            5. RUSSIAN ORBITAL SEGMENT (ROS): ZARYA, ZVEZDA, NAUKA, PRICHAL, MRM-1/2
           ===================================================================== */}
        <SatellitePart
          id="russian_segment"
          basePos={[0, 0, 0]}
          explodedPos={[0, -1.05, -2.95]}
          exploded={exploded}
          interactionRef={interactionRef}
          onSelect={toggle}
        >
          {/* FGB (Zarya) */}
          <ExplodedSubPart
            basePos={[0, -0.02, -1.68]}
            explodedPos={[0, -0.02, -1.55]}
            exploded={exploded}
            interactionRef={interactionRef}
          >
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.18, 0.19, 0.92, 24]} />
              <meshStandardMaterial
                map={hullTex.map}
                {...pbr('russian_segment', '#cbd5e1', 0.78, 0.3)}
              />
            </mesh>
            <mesh position={[0, 0, 0.26]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.195, 0.195, 0.22, 20]} />
              <meshStandardMaterial
                map={kapton.map}
                normalMap={kapton.normalMap}
                {...pbr('russian_segment', '#f59e0b', 0.88, 0.32)}
              />
            </mesh>
            <DockingCollar
              position={[0, 0, 0.46]}
              radius={0.17}
              materialProps={pbr('russian_segment', '#94a3b8', 0.9, 0.22)}
            />
            <EvaHandrail position={[0, 0.19, -0.1]} length={0.32} />
            {/* Zarya Dual Solar Wings */}
            {[-1, 1].map((side) => (
              <mesh key={side} position={[side * 0.54, 0.04, 0]}>
                <boxGeometry args={[0.68, 0.014, 0.22]} />
                <meshStandardMaterial
                  map={solarTex.map}
                  {...pbr('russian_segment', '#1e3a8a', 0.45, 0.25)}
                />
              </mesh>
            ))}
          </ExplodedSubPart>

          {/* Service Module (Zvezda) + Service Bay Motion Fan + RCS Quads */}
          <ExplodedSubPart
            basePos={[0, -0.02, -2.62]}
            explodedPos={[0, -0.02, -3.15]}
            exploded={exploded}
            interactionRef={interactionRef}
          >
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.17, 0.2, 0.96, 24]} />
              <meshStandardMaterial
                map={hullTex.map}
                {...pbr('russian_segment', '#e2e8f0', 0.8, 0.28)}
              />
            </mesh>
            {/* Aft Propulsion & RCS Thruster Ring */}
            <mesh position={[0, 0, -0.52]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.13, 0.17, 0.16, 20]} />
              <meshStandardMaterial {...pbr('russian_segment', '#475569', 0.9, 0.25)} />
            </mesh>
            <RcsThrusterQuad position={[0, 0.17, -0.46]} />
            <RcsThrusterQuad position={[0, -0.17, -0.46]} />
            <MotionFan
              position={[0.2, 0.04, -0.22]}
              rotation={[0, Math.PI / 2, 0]}
              scale={0.9}
              speed={-5.4}
              accentColor="#22c55e"
              bladeCount={7}
            />
            <StatusBeacon position={[-0.17, 0.12, -0.32]} color="#22c55e" />
            {/* Zvezda Dual Solar Wings */}
            {[-1, 1].map((side) => (
              <mesh key={side} position={[side * 0.72, 0.02, 0.06]}>
                <boxGeometry args={[1.02, 0.015, 0.26]} />
                <meshStandardMaterial
                  map={solarTex.map}
                  {...pbr('russian_segment', '#1e40af', 0.45, 0.25)}
                />
              </mesh>
            ))}
          </ExplodedSubPart>

          {/* MLM (Nauka) + Prichal Spherical Node (Nadir -Y of Zvezda) */}
          <ExplodedSubPart
            basePos={[0, -0.44, -2.52]}
            explodedPos={[0, -1.05, -3.05]}
            exploded={exploded}
            interactionRef={interactionRef}
          >
            <mesh>
              <cylinderGeometry args={[0.18, 0.18, 0.68, 20]} />
              <meshStandardMaterial
                map={hullTex.map}
                {...pbr('russian_segment', '#cbd5e1', 0.8, 0.28)}
              />
            </mesh>
            {/* Prichal Spherical Docking Node */}
            <ExplodedSubPart
              basePos={[0, -0.42, 0]}
              explodedPos={[0, -0.78, 0]}
              exploded={exploded}
              interactionRef={interactionRef}
            >
              <mesh>
                <sphereGeometry args={[0.16, 20, 20]} />
                <meshStandardMaterial {...pbr('russian_segment', '#e2e8f0', 0.85, 0.24)} />
              </mesh>
              <StatusBeacon position={[0.14, 0, 0.1]} color="#f59e0b" />
            </ExplodedSubPart>
          </ExplodedSubPart>

          {/* MRM-1 (Rassvet, Nadir of Zarya) & MRM-2 (Poisk, Zenith of Zvezda) */}
          <ExplodedSubPart
            basePos={[0, -0.34, -1.68]}
            explodedPos={[0, -0.82, -1.55]}
            exploded={exploded}
            interactionRef={interactionRef}
          >
            <mesh>
              <cylinderGeometry args={[0.11, 0.11, 0.42, 16]} />
              <meshStandardMaterial {...pbr('russian_segment', '#cbd5e1', 0.8, 0.28)} />
            </mesh>
          </ExplodedSubPart>

          <ExplodedSubPart
            basePos={[0, 0.32, -2.42]}
            explodedPos={[0, 0.78, -2.95]}
            exploded={exploded}
            interactionRef={interactionRef}
          >
            <mesh>
              <cylinderGeometry args={[0.11, 0.11, 0.38, 16]} />
              <meshStandardMaterial {...pbr('russian_segment', '#e2e8f0', 0.82, 0.26)} />
            </mesh>
          </ExplodedSubPart>
        </SatellitePart>

        {/* =====================================================================
            6. PRESSURIZED MATING ADAPTERS (PMA-1/2/3) & INTERNATIONAL DOCKING ADAPTERS (IDA-2/3)
           ===================================================================== */}
        <SatellitePart
          id="docking_adapters"
          basePos={[0, 0, 0]}
          explodedPos={[0, 0.25, 3.15]}
          exploded={exploded}
          interactionRef={interactionRef}
          onSelect={toggle}
        >
          {/* PMA-1 (Between Node 1 Unity and Zarya) */}
          <ExplodedSubPart
            basePos={[0, -0.02, -1.14]}
            explodedPos={[0, -0.55, -3.85]}
            exploded={exploded}
            interactionRef={interactionRef}
          >
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.14, 0.18, 0.2, 20]} />
              <meshStandardMaterial {...pbr('docking_adapters', '#94a3b8', 0.88, 0.24)} />
            </mesh>
            <DockingCollar
              position={[0, 0, 0.1]}
              radius={0.18}
              materialProps={pbr('docking_adapters', '#cbd5e1', 0.92, 0.18)}
            />
          </ExplodedSubPart>

          {/* PMA-2 + IDA-2 (Forward +Z of Node 2 Harmony) */}
          <ExplodedSubPart
            basePos={[0, -0.02, 1.38]}
            explodedPos={[0, -0.02, 1.75]}
            exploded={exploded}
            interactionRef={interactionRef}
          >
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.13, 0.19, 0.22, 20]} />
              <meshStandardMaterial {...pbr('docking_adapters', '#94a3b8', 0.88, 0.24)} />
            </mesh>
            <mesh position={[0, 0, 0.16]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.13, 0.13, 0.1, 20]} />
              <meshStandardMaterial {...pbr('docking_adapters', '#e2e8f0', 0.92, 0.18)} />
            </mesh>
            <mesh position={[0, 0, 0.22]}>
              <torusGeometry args={[0.11, 0.016, 10, 24]} />
              <meshStandardMaterial {...pbr('docking_adapters', '#cbd5e1', 0.94, 0.16)} />
            </mesh>
            <StatusBeacon position={[0.11, 0.1, 0.2]} color="#22c55e" />
          </ExplodedSubPart>

          {/* PMA-3 + IDA-3 (Zenith +Y of Node 2 Harmony) */}
          <ExplodedSubPart
            basePos={[0, 0.28, 0.92]}
            explodedPos={[0, 0.82, 0.45]}
            exploded={exploded}
            interactionRef={interactionRef}
          >
            <mesh>
              <cylinderGeometry args={[0.13, 0.18, 0.2, 20]} />
              <meshStandardMaterial {...pbr('docking_adapters', '#94a3b8', 0.88, 0.24)} />
            </mesh>
            <mesh position={[0, 0.14, 0]}>
              <cylinderGeometry args={[0.12, 0.12, 0.08, 20]} />
              <meshStandardMaterial {...pbr('docking_adapters', '#e2e8f0', 0.92, 0.18)} />
            </mesh>
            <DockingCollar
              position={[0, 0.18, 0]}
              rotation={[Math.PI / 2, 0, 0]}
              radius={0.11}
              materialProps={pbr('docking_adapters', '#cbd5e1', 0.94, 0.16)}
            />
          </ExplodedSubPart>
        </SatellitePart>

        {/* =====================================================================
            7. QUEST AIRLOCK, BEAM EXPANDABLE MODULE, PMM LEONARDO & ELC CARRIERS
           ===================================================================== */}
        <SatellitePart
          id="airlock_logistics"
          basePos={[0, 0, 0]}
          explodedPos={[2.05, -2.05, -0.55]}
          exploded={exploded}
          interactionRef={interactionRef}
          onSelect={toggle}
        >
          {/* Quest Joint Airlock (Starboard +X of Node 1 Unity) */}
          <ExplodedSubPart
            basePos={[0.42, -0.02, -0.78]}
            explodedPos={[0.88, 0.18, -0.78]}
            exploded={exploded}
            interactionRef={interactionRef}
          >
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.14, 0.17, 0.42, 20]} />
              <meshStandardMaterial
                map={hullTex.map}
                {...pbr('airlock_logistics', '#e2e8f0', 0.82, 0.26)}
              />
            </mesh>
            {[0.17, -0.17].map((yOff, idx) => (
              <mesh key={idx} position={[0.06, yOff, 0]} rotation={[0, 0, Math.PI / 2]}>
                <capsuleGeometry args={[0.045, 0.16, 8, 12]} />
                <meshStandardMaterial {...pbr('airlock_logistics', '#cbd5e1', 0.85, 0.22)} />
              </mesh>
            ))}
            <EvaHandrail position={[0.05, 0.16, 0.12]} length={0.22} />
            <StatusBeacon position={[0.2, 0.08, 0.12]} color="#22c55e" />
          </ExplodedSubPart>

          {/* BEAM (Bigelow Expandable Activity Module, Aft of Tranquility) */}
          <ExplodedSubPart
            basePos={[-0.64, -0.02, -1.08]}
            explodedPos={[-1.25, -0.02, -1.35]}
            exploded={exploded}
            interactionRef={interactionRef}
          >
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <capsuleGeometry args={[0.14, 0.16, 12, 20]} />
              <meshStandardMaterial {...pbr('airlock_logistics', '#cbd5e1', 0.25, 0.65)} />
            </mesh>
          </ExplodedSubPart>

          {/* PMM Leonardo (Nadir -Y of Node 1 Unity) */}
          <ExplodedSubPart
            basePos={[0, -0.44, -0.78]}
            explodedPos={[0, -0.95, -0.78]}
            exploded={exploded}
            interactionRef={interactionRef}
          >
            <mesh>
              <cylinderGeometry args={[0.17, 0.17, 0.48, 20]} />
              <meshStandardMaterial
                map={hullTex.map}
                {...pbr('airlock_logistics', '#f1f5f9', 0.82, 0.26)}
              />
            </mesh>
            <DockingCollar
              position={[0, 0.24, 0]}
              rotation={[Math.PI / 2, 0, 0]}
              radius={0.165}
              materialProps={pbr('airlock_logistics', '#94a3b8', 0.9, 0.22)}
            />
          </ExplodedSubPart>

          {/* ExPRESS Logistics Carriers (ELC 1–4) on S3/P3 Truss */}
          {[-1, 1].map((sign, idx) => (
            <ExplodedSubPart
              key={idx}
              basePos={[sign * 1.56, 0.08, 0.14]}
              explodedPos={[sign * 2.15, 0.48, 0.35]}
              exploded={exploded}
              interactionRef={interactionRef}
            >
              <mesh>
                <boxGeometry args={[0.28, 0.08, 0.24]} />
                <meshStandardMaterial {...pbr('airlock_logistics', '#94a3b8', 0.85, 0.28)} />
              </mesh>
              <mesh position={[0, 0.08, 0]}>
                <boxGeometry args={[0.2, 0.1, 0.16]} />
                <meshStandardMaterial
                  map={kapton.map}
                  {...pbr('airlock_logistics', '#f59e0b', 0.88, 0.3)}
                />
              </mesh>
            </ExplodedSubPart>
          ))}
        </SatellitePart>
      </group>
    </>
  );
}
