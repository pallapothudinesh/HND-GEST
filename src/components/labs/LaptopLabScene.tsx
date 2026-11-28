import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import { UniverseInteractionRef } from '../../types/scene';
import { damp, lerp } from '../../utils/smoothing';

interface LaptopLabSceneProps {
  interactionRef: React.MutableRefObject<UniverseInteractionRef>;
  selectedPartId: string | null;
  onSelectPart: (id: string | null) => void;
  exploded: boolean;
}

interface KeyDef {
  id: string;
  label: string;
  subLabel?: string;
  x: number;
  z: number;
  w: number;
  d: number;
  u0: number;
  v0: number;
  u1: number;
  v1: number;
}

/** Procedural brushed-aluminum texture for realistic palm rest & CNC lid */
function createBrushedMetalTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#a3aab4';
    ctx.fillRect(0, 0, 512, 512);
    for (let y = 0; y < 512; y++) {
      const shade = 152 + Math.floor(Math.random() * 20);
      ctx.fillStyle = `rgb(${shade},${shade + 3},${shade + 7})`;
      ctx.fillRect(0, y, 512, 1);
    }
    // Subtle micro-grain horizontal streaks
    ctx.fillStyle = 'rgba(255,255,255,0.035)';
    for (let i = 0; i < 600; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const len = 24 + Math.random() * 80;
      ctx.fillRect(x, y, len, 1);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  return tex;
}

/** Procedural speaker micro-grille perforation texture */
function createSpeakerGrilleTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(0, 0, 128, 512);
    ctx.fillStyle = '#09090b';
    const cols = 6;
    const rows = 44;
    for (let r = 0; r < rows; r++) {
      const offset = (r % 2) * 8;
      for (let c = 0; c < cols; c++) {
        const cx = 14 + c * 18 + offset;
        const cy = 12 + r * 11;
        if (cx < 118) {
          ctx.beginPath();
          ctx.arc(cx, cy, 2.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

/** Procedural subtle anti-glare IPS panel texture */
function createIpsPanelTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(256, 230, 30, 256, 256, 360);
    grad.addColorStop(0, '#161b26');
    grad.addColorStop(0.6, '#0d1118');
    grad.addColorStop(1, '#07090d');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Subtle anti-glare micro-sheen lines
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.025)';
    ctx.lineWidth = 1;
    for (let y = 0; y < 512; y += 4) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

/** Procedural high-res PCB motherboard texture with ENIG pads, differential traces & silkscreen */
function createPcbTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Deep solder-mask green base
    ctx.fillStyle = '#134e2a';
    ctx.fillRect(0, 0, 1024, 512);

    // Copper ground-plane pour regions
    ctx.fillStyle = 'rgba(22, 101, 52, 0.65)';
    ctx.fillRect(28, 28, 360, 456);
    ctx.fillRect(420, 40, 260, 432);
    ctx.fillRect(710, 36, 284, 440);

    // Fine copper differential trace pairs with 45-deg mitered bends
    ctx.strokeStyle = 'rgba(74, 222, 128, 0.34)';
    ctx.lineWidth = 1.6;
    for (let i = 0; i < 42; i++) {
      const y = 30 + (i * 452) / 42;
      const bendX = 240 + (i % 6) * 45;
      const dy = i % 2 === 0 ? 18 : -18;
      ctx.beginPath();
      ctx.moveTo(24, y);
      ctx.lineTo(bendX, y);
      ctx.lineTo(bendX + 20, y + dy);
      ctx.lineTo(996, y + dy);
      ctx.stroke();

      // Differential pair companion trace
      ctx.beginPath();
      ctx.moveTo(24, y + 4);
      ctx.lineTo(bendX - 2, y + 4);
      ctx.lineTo(bendX + 18, y + dy + 4);
      ctx.lineTo(996, y + dy + 4);
      ctx.stroke();
    }

    // Gold ENIG pads and micro-vias
    ctx.fillStyle = '#eab308';
    for (let x = 36; x < 992; x += 32) {
      for (let y = 32; y < 484; y += 40) {
        ctx.beginPath();
        ctx.arc(x, y, 2.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#09090b';
        ctx.beginPath();
        ctx.arc(x, y, 1.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#eab308';
      }
    }

    // White silkscreen outlines & component labels
    ctx.strokeStyle = 'rgba(248, 250, 252, 0.72)';
    ctx.lineWidth = 1.8;
    ctx.strokeRect(188, 154, 150, 150); // U1 CPU
    ctx.strokeRect(378, 178, 118, 118); // U2 GPU
    ctx.strokeRect(610, 290, 210, 96); // M2_SSD
    ctx.strokeRect(830, 84, 152, 320); // DIMM_A / DIMM_B

    ctx.fillStyle = 'rgba(248, 250, 252, 0.9)';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('U1 CPU', 194, 146);
    ctx.fillText('U2 GPU', 384, 170);
    ctx.fillText('PWR_VRM', 196, 86);
    ctx.fillText('M2_SSD', 616, 282);
    ctx.fillText('DIMM_A', 836, 76);
    ctx.fillText('DIMM_B', 912, 76);
    ctx.fillText('J_BATT', 536, 468);
    ctx.fillText('J_FAN1', 90, 92);
    ctx.fillText('RTC_BAT', 514, 112);
    ctx.fillText('U_BIOS', 540, 210);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

/** Procedural brushed 2.5" SSD label texture */
function createSsdTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#d1d5db';
    ctx.fillRect(0, 0, 512, 512);
    for (let y = 0; y < 512; y++) {
      const shade = 202 + Math.floor(Math.random() * 14);
      ctx.fillStyle = `rgb(${shade},${shade + 2},${shade + 4})`;
      ctx.fillRect(0, y, 512, 1);
    }

    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 6;
    ctx.strokeRect(22, 22, 468, 468);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(42, 46, 428, 76);
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 42px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PRO SSD 870', 256, 98);

    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 58px sans-serif';
    ctx.fillText('1 TB', 256, 220);

    ctx.fillStyle = '#334155';
    ctx.font = '24px monospace';
    ctx.fillText('2.5" SATA III / NVMe', 256, 278);
    ctx.fillText('SOLID STATE DRIVE', 256, 316);

    // Barcode strip
    ctx.fillStyle = '#0f172a';
    for (let x = 96; x < 416; x += 6) {
      const w = x % 12 === 0 ? 4 : 2;
      ctx.fillRect(x, 368, w, 54);
    }
    ctx.font = '18px monospace';
    ctx.fillText('S/N: NV48-9920-1TB-PRO', 256, 452);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

/** Procedural matte-black Li-Ion battery pack label texture */
function createBatteryTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#141418';
    ctx.fillRect(0, 0, 512, 256);
    ctx.strokeStyle = '#3f3f46';
    ctx.lineWidth = 3;
    ctx.strokeRect(10, 10, 492, 236);

    ctx.fillStyle = '#e4e4e7';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('Li-Ion Polymer Battery Pack', 28, 48);

    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(28, 60, 160, 3);

    ctx.font = 'bold 17px monospace';
    ctx.fillStyle = '#a1a1aa';
    ctx.fillText('Model: 3ICP5/57/80   11.4V === 56Wh', 28, 92);
    ctx.fillText('Rated Capacity: 4900mAh', 28, 120);

    ctx.font = '13px sans-serif';
    ctx.fillStyle = '#71717a';
    ctx.fillText('CAUTION: Do not puncture, crush, or expose above 60C.', 28, 156);
    ctx.fillText('Use only with authorized thermal-regulated charger.', 28, 176);

    // Compliance badges
    ctx.strokeStyle = '#52525b';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(28, 196, 44, 28);
    ctx.strokeRect(82, 196, 44, 28);
    ctx.strokeRect(136, 196, 62, 28);
    ctx.font = 'bold 15px monospace';
    ctx.fillStyle = '#a1a1aa';
    ctx.fillText('CE', 40, 216);
    ctx.fillText('FC', 94, 216);
    ctx.fillText('RoHS', 146, 216);

    // Mini barcode
    ctx.fillStyle = '#d4d4d8';
    for (let x = 290; x < 474; x += 5) {
      ctx.fillRect(x, 194, x % 10 === 0 ? 3 : 1.5, 32);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

/** Build realistic 6-row laptop keycap layout + shared 2048x1024 legend atlas */
function buildKeyboardData(): { keys: KeyDef[]; atlasTex: THREE.CanvasTexture } {
  const rows: { label: string; sub?: string; units: number }[][] = [
    // Row 0: Function row
    [
      { label: 'Esc', units: 1 },
      { label: 'F1', units: 1 },
      { label: 'F2', units: 1 },
      { label: 'F3', units: 1 },
      { label: 'F4', units: 1 },
      { label: 'F5', units: 1 },
      { label: 'F6', units: 1 },
      { label: 'F7', units: 1 },
      { label: 'F8', units: 1 },
      { label: 'F9', units: 1 },
      { label: 'F10', units: 1 },
      { label: 'F11', units: 1 },
      { label: 'F12', units: 1 },
      { label: 'Del', units: 1 },
    ],
    // Row 1: Number row
    [
      { label: '~', sub: '`', units: 1 },
      { label: '1', sub: '!', units: 1 },
      { label: '2', sub: '@', units: 1 },
      { label: '3', sub: '#', units: 1 },
      { label: '4', sub: '$', units: 1 },
      { label: '5', sub: '%', units: 1 },
      { label: '6', sub: '^', units: 1 },
      { label: '7', sub: '&', units: 1 },
      { label: '8', sub: '*', units: 1 },
      { label: '9', sub: '(', units: 1 },
      { label: '0', sub: ')', units: 1 },
      { label: '-', sub: '_', units: 1 },
      { label: '=', sub: '+', units: 1 },
      { label: 'Back', units: 1.5 },
    ],
    // Row 2: QWERTY row
    [
      { label: 'Tab', units: 1.4 },
      { label: 'Q', units: 1 },
      { label: 'W', units: 1 },
      { label: 'E', units: 1 },
      { label: 'R', units: 1 },
      { label: 'T', units: 1 },
      { label: 'Y', units: 1 },
      { label: 'U', units: 1 },
      { label: 'I', units: 1 },
      { label: 'O', units: 1 },
      { label: 'P', units: 1 },
      { label: '[', sub: '{', units: 1 },
      { label: ']', sub: '}', units: 1 },
      { label: '\\', sub: '|', units: 1.1 },
    ],
    // Row 3: Home row
    [
      { label: 'Caps', units: 1.65 },
      { label: 'A', units: 1 },
      { label: 'S', units: 1 },
      { label: 'D', units: 1 },
      { label: 'F', units: 1 },
      { label: 'G', units: 1 },
      { label: 'H', units: 1 },
      { label: 'J', units: 1 },
      { label: 'K', units: 1 },
      { label: 'L', units: 1 },
      { label: ';', sub: ':', units: 1 },
      { label: "'", sub: '"', units: 1 },
      { label: 'Enter', units: 1.85 },
    ],
    // Row 4: Shift row
    [
      { label: 'Shift', units: 2.1 },
      { label: 'Z', units: 1 },
      { label: 'X', units: 1 },
      { label: 'C', units: 1 },
      { label: 'V', units: 1 },
      { label: 'B', units: 1 },
      { label: 'N', units: 1 },
      { label: 'M', units: 1 },
      { label: ',', sub: '<', units: 1 },
      { label: '.', sub: '>', units: 1 },
      { label: '/', sub: '?', units: 1 },
      { label: 'Shift', units: 2.4 },
    ],
    // Row 5: Bottom row + arrow cluster
    [
      { label: 'Ctrl', units: 1.2 },
      { label: 'Fn', units: 1 },
      { label: 'Alt', units: 1.2 },
      { label: '', units: 5.6 }, // Spacebar
      { label: 'Alt', units: 1.1 },
      { label: 'Ctrl', units: 1.1 },
      { label: '◀', units: 0.9 },
      { label: '▲▼', units: 0.9 },
      { label: '▶', units: 0.9 },
    ],
  ];

  const totalWidth = 2.34;
  const totalDepth = 0.84;
  const rowGap = 0.016;
  const keyGap = 0.014;
  const rowHeight = (totalDepth - rowGap * (rows.length - 1)) / rows.length;

  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#16181d';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  const keys: KeyDef[] = [];
  const cols = 15;
  const cellW = canvas.width / cols;
  const cellH = canvas.height / rows.length;
  let cellIndex = 0;

  rows.forEach((row, rIdx) => {
    const totalUnits = row.reduce((acc, k) => acc + k.units, 0);
    const usableW = totalWidth - keyGap * (row.length - 1);
    const unitW = usableW / totalUnits;
    const z = -0.22 - totalDepth / 2 + rowHeight / 2 + rIdx * (rowHeight + rowGap);
    const d = rIdx === 0 ? rowHeight * 0.82 : rowHeight;

    let cursorX = -totalWidth / 2;

    row.forEach((k, cIdx) => {
      const w = k.units * unitW;
      const x = cursorX + w / 2;
      cursorX += w + keyGap;

      const gridCol = cellIndex % cols;
      const gridRow = Math.floor(cellIndex / cols);
      cellIndex++;

      const px = gridCol * cellW;
      const py = gridRow * cellH;

      if (ctx) {
        ctx.fillStyle = '#18181b';
        ctx.fillRect(px + 2, py + 2, cellW - 4, cellH - 4);

        ctx.fillStyle = '#f8fafc';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (k.sub) {
          ctx.font = 'bold 30px sans-serif';
          ctx.fillText(k.sub, px + cellW * 0.34, py + cellH * 0.32);
          ctx.font = 'bold 34px sans-serif';
          ctx.fillText(k.label, px + cellW * 0.62, py + cellH * 0.66);
        } else if (k.label.length > 2) {
          ctx.font = 'bold 28px sans-serif';
          ctx.fillText(k.label, px + cellW / 2, py + cellH / 2);
        } else if (k.label) {
          ctx.font = 'bold 42px sans-serif';
          ctx.fillText(k.label, px + cellW / 2, py + cellH / 2);
        } else {
          // Spacebar subtle center bar
          ctx.fillStyle = 'rgba(248, 250, 252, 0.35)';
          ctx.fillRect(px + cellW * 0.28, py + cellH * 0.48, cellW * 0.44, 6);
        }
      }

      const u0 = (px + 4) / canvas.width;
      const u1 = (px + cellW - 4) / canvas.width;
      const v1 = 1 - (py + 4) / canvas.height;
      const v0 = 1 - (py + cellH - 4) / canvas.height;

      keys.push({
        id: `k-${rIdx}-${cIdx}`,
        label: k.label,
        subLabel: k.sub,
        x,
        z,
        w,
        d,
        u0,
        v0,
        u1,
        v1,
      });
    });
  });

  const atlasTex = new THREE.CanvasTexture(canvas);
  atlasTex.anisotropy = 4;
  atlasTex.needsUpdate = true;
  return { keys, atlasTex };
}

/** Create a PlaneGeometry with custom UV bounds for a single keycap legend */
function createKeyCapFaceGeometry(
  w: number,
  d: number,
  u0: number,
  v0: number,
  u1: number,
  v1: number
): THREE.PlaneGeometry {
  const geo = new THREE.PlaneGeometry(w * 0.86, d * 0.86);
  const uv = geo.attributes.uv;
  uv.setXY(0, u0, v1);
  uv.setXY(1, u1, v1);
  uv.setXY(2, u0, v0);
  uv.setXY(3, u1, v0);
  uv.needsUpdate = true;
  return geo;
}

function LayerGroup({
  id,
  baseY,
  explodedY,
  exploded,
  interactionRef,
  onSelect,
  children,
}: {
  id: string;
  baseY: number;
  explodedY: number;
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

    ref.current.position.y = damp(ref.current.position.y, lerp(baseY, explodedY, factor), 7.2, dt);
  });

  return (
    <group
      ref={ref}
      position={[0, baseY, 0]}
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
 * Ultra-detailed, non-animated Precision Laptop Exploded Architecture:
 * 1. Molded Bottom Chassis (recessed intake vent grille, copper EMI foil patch, screw bosses, rubber feet)
 * 2. 2.5" Brushed SSD (corner screws, SATA connector, spec label) & Multi-cell Li-Ion Battery Pack (cell dividers, BMS cable, spec sticker)
 * 3. Green PCB Motherboard (high-res ENIG/traces/silkscreen, CPU & GPU dies, VRM chokes/MOSFETs, solid-state caps, CMOS coin cell, M.2 NVMe SSD, dual DDR5 SO-DIMMs, USB-C/HDMI/audio shields)
 * 4. Thermal Module (24-fin copper heatsink, dual curved copper heatpipes with CPU/GPU cold-plate clamps, centrifugal blower with 22 curved blades & braided 4-pin PWM cable)
 * 5. Brushed Aluminum Keyboard Deck (sculpted chiclet keycaps with crisp QWERTY legends, diamond-cut glass trackpad, LED power/fingerprint ring, speaker micro-grilles) & CNC Display Lid (beveled outer shell, dark-slate inner bezel, webcam + IR + dual mics + privacy LED, magnetic latch, dual clutch hinges, anti-glare IPS panel)
 */
export function LaptopLabScene({
  interactionRef,
  selectedPartId,
  onSelectPart,
  exploded,
}: LaptopLabSceneProps) {
  const rootRef = useRef<THREE.Group>(null);

  const {
    brushedTex,
    speakerTex,
    ipsTex,
    pcbTex,
    ssdTex,
    batteryTex,
    keyAtlasTex,
    keyItems,
    heatpipeGeoLeft,
    heatpipeGeoRight,
    fanCableGeo,
    bmsCableGeo,
  } = useMemo(() => {
    const brushed = createBrushedMetalTexture();
    const speaker = createSpeakerGrilleTexture();
    const ips = createIpsPanelTexture();
    const pcb = createPcbTexture();
    const ssd = createSsdTexture();
    const battery = createBatteryTexture();
    const { keys, atlasTex } = buildKeyboardData();

    const keyItemsWithGeo = keys.map((k) => ({
      ...k,
      faceGeo: createKeyCapFaceGeometry(k.w, k.d, k.u0, k.v0, k.u1, k.v1),
    }));

    // Dual curved copper heatpipes routing from CPU & GPU cold-plates to copper fin stack
    const curve1 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.72, 0.018, -0.18),
      new THREE.Vector3(-0.22, 0.018, -0.12),
      new THREE.Vector3(0.36, 0.018, -0.05),
      new THREE.Vector3(0.96, 0.018, -0.08),
    ]);
    const curve2 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.72, 0.018, -0.25),
      new THREE.Vector3(-0.22, 0.018, -0.2),
      new THREE.Vector3(0.36, 0.018, -0.17),
      new THREE.Vector3(0.96, 0.018, -0.18),
    ]);

    // Braided 4-pin PWM fan cable
    const pwmCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.88, 0.008, -0.4),
      new THREE.Vector3(-0.98, 0.004, -0.49),
      new THREE.Vector3(-1.08, -0.004, -0.47),
      new THREE.Vector3(-1.12, -0.012, -0.4),
    ]);

    // Multi-wire BMS cable from battery pack to motherboard J_BATT
    const bmsCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.18, 0.012, -0.24),
      new THREE.Vector3(0.12, 0.012, -0.31),
      new THREE.Vector3(0.06, 0.014, -0.35),
    ]);

    return {
      brushedTex: brushed,
      speakerTex: speaker,
      ipsTex: ips,
      pcbTex: pcb,
      ssdTex: ssd,
      batteryTex: battery,
      keyAtlasTex: atlasTex,
      keyItems: keyItemsWithGeo,
      heatpipeGeoLeft: new THREE.TubeGeometry(curve1, 36, 0.022, 12, false),
      heatpipeGeoRight: new THREE.TubeGeometry(curve2, 36, 0.022, 12, false),
      fanCableGeo: new THREE.TubeGeometry(pwmCurve, 20, 0.009, 8, false),
      bmsCableGeo: new THREE.TubeGeometry(bmsCurve, 16, 0.01, 8, false),
    };
  }, []);

  useEffect(() => {
    return () => {
      brushedTex.dispose();
      speakerTex.dispose();
      ipsTex.dispose();
      pcbTex.dispose();
      ssdTex.dispose();
      batteryTex.dispose();
      keyAtlasTex.dispose();
      keyItems.forEach((k) => k.faceGeo.dispose());
      heatpipeGeoLeft.dispose();
      heatpipeGeoRight.dispose();
      fanCableGeo.dispose();
      bmsCableGeo.dispose();
    };
  }, [
    brushedTex,
    speakerTex,
    ipsTex,
    pcbTex,
    ssdTex,
    batteryTex,
    keyAtlasTex,
    keyItems,
    heatpipeGeoLeft,
    heatpipeGeoRight,
    fanCableGeo,
    bmsCableGeo,
  ]);

  const fanBlades = useMemo(() => Array.from({ length: 22 }, (_, i) => (i / 22) * Math.PI * 2), []);
  const heatsinkFins = useMemo(() => Array.from({ length: 24 }, (_, i) => -0.24 + i * 0.021), []);
  const screwBossPositions = useMemo<[number, number][]>(
    () => [
      [-1.38, -0.92],
      [0, -0.92],
      [1.38, -0.92],
      [-1.38, 0],
      [1.38, 0],
      [-1.38, 0.92],
      [0, 0.92],
      [1.38, 0.92],
    ],
    []
  );
  const ventLouvers = useMemo(() => Array.from({ length: 14 }, (_, i) => -0.78 + i * 0.055), []);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const inter = interactionRef.current;

    if (rootRef.current) {
      const clampedScale =
        inter.activeGesture === 'TWO_HANDS'
          ? 1
          : Math.min(Math.max(inter.sphereScale, 0.72), 1.45);
      rootRef.current.scale.setScalar(damp(rootRef.current.scale.x, clampedScale, 7.2, dt));
      rootRef.current.position.x = damp(rootRef.current.position.x, inter.pinchOffset.x * 0.6, 7.2, dt);
      rootRef.current.position.y = damp(rootRef.current.position.y, -0.35 + inter.pinchOffset.y * 0.45, 7.2, dt);
    }
  });

  const pbr = (id: string, color: string, metalness = 0.75, roughness = 0.28) => {
    const sel = selectedPartId === id;
    return {
      color: sel ? '#38bdf8' : color,
      emissive: sel ? '#0284c7' : '#000000',
      emissiveIntensity: sel ? 0.55 : 0,
      metalness,
      roughness,
    };
  };

  const toggle = (id: string) => onSelectPart(selectedPartId === id ? null : id);

  return (
    <>
      <Environment resolution={128} frames={1}>
        <Lightformer
          form="rect"
          intensity={2.4}
          position={[0, 6, 4]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[12, 5, 1]}
          color="#ffffff"
        />
        <Lightformer
          form="rect"
          intensity={1.5}
          position={[-6, 3, 4]}
          rotation={[0, Math.PI / 3, 0]}
          scale={[7, 3, 1]}
          color="#f1f5f9"
        />
        <Lightformer
          form="rect"
          intensity={1.3}
          position={[6, 3, -4]}
          rotation={[0, -Math.PI / 3, 0]}
          scale={[7, 3, 1]}
          color="#e2e8f0"
        />
      </Environment>

      <group ref={rootRef} position={[0, -0.35, 0]} rotation={[0.18, -0.45, 0]}>
        {/* 1. MOLDED BOTTOM CHASSIS WITH INTAKE GRILLE, COPPER EMI PATCH, SCREW BOSSES & RUBBER FEET */}
        <LayerGroup
          id="bottom_chassis"
          baseY={-0.06}
          explodedY={-1.18}
          exploded={exploded}
          interactionRef={interactionRef}
          onSelect={toggle}
        >
          {/* Base Molded Shell */}
          <mesh>
            <boxGeometry args={[2.95, 0.046, 2.02]} />
            <meshStandardMaterial {...pbr('bottom_chassis', '#18181b', 0.16, 0.74)} />
          </mesh>
          {/* Perimeter Lip Walls */}
          <mesh position={[0, 0.04, 0.98]}>
            <boxGeometry args={[2.95, 0.056, 0.055]} />
            <meshStandardMaterial {...pbr('bottom_chassis', '#27272a', 0.18, 0.68)} />
          </mesh>
          <mesh position={[0, 0.04, -0.98]}>
            <boxGeometry args={[2.95, 0.056, 0.055]} />
            <meshStandardMaterial {...pbr('bottom_chassis', '#27272a', 0.18, 0.68)} />
          </mesh>
          <mesh position={[-1.445, 0.04, 0]}>
            <boxGeometry args={[0.055, 0.056, 1.96]} />
            <meshStandardMaterial {...pbr('bottom_chassis', '#27272a', 0.18, 0.68)} />
          </mesh>
          <mesh position={[1.445, 0.04, 0]}>
            <boxGeometry args={[0.055, 0.056, 1.96]} />
            <meshStandardMaterial {...pbr('bottom_chassis', '#27272a', 0.18, 0.68)} />
          </mesh>

          {/* Recessed Intake Vent Grille + Louvers */}
          <mesh position={[-0.42, 0.021, -0.36]}>
            <boxGeometry args={[0.88, 0.01, 0.56]} />
            <meshStandardMaterial color="#09090b" roughness={0.92} metalness={0.05} />
          </mesh>
          {ventLouvers.map((vx, i) => (
            <mesh key={i} position={[vx, 0.027, -0.36]} rotation={[0, 0, 0.25]}>
              <boxGeometry args={[0.018, 0.012, 0.52]} />
              <meshStandardMaterial color="#27272a" roughness={0.6} metalness={0.25} />
            </mesh>
          ))}

          {/* Copper EMI Shielding Foil Patch */}
          <mesh position={[0.45, 0.025, -0.18]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1.05, 0.64]} />
            <meshStandardMaterial color="#b45309" metalness={0.9} roughness={0.24} />
          </mesh>

          {/* Brass Threaded Screw Bosses */}
          {screwBossPositions.map(([bx, bz], i) => (
            <group key={i} position={[bx, 0.032, bz]}>
              <mesh>
                <cylinderGeometry args={[0.026, 0.03, 0.024, 12]} />
                <meshStandardMaterial color="#ca8a04" metalness={0.85} roughness={0.28} />
              </mesh>
              <mesh position={[0, 0.013, 0]}>
                <cylinderGeometry args={[0.011, 0.011, 0.004, 10]} />
                <meshStandardMaterial color="#09090b" roughness={0.9} />
              </mesh>
            </group>
          ))}

          {/* 4 Rubber Anti-Slip Feet (Underside Corners) */}
          {(
            [
              [-1.24, -0.78],
              [1.24, -0.78],
              [-1.24, 0.78],
              [1.24, 0.78],
            ] as [number, number][]
          ).map(([fx, fz], i) => (
            <mesh key={i} position={[fx, -0.028, fz]}>
              <cylinderGeometry args={[0.075, 0.082, 0.014, 18]} />
              <meshStandardMaterial color="#09090b" roughness={0.95} metalness={0.02} />
            </mesh>
          ))}
        </LayerGroup>

        {/* 2. 2.5" BRUSHED SSD (LEFT) & MULTI-CELL LI-ION BATTERY PACK (RIGHT) */}
        <LayerGroup
          id="battery_pack"
          baseY={-0.01}
          explodedY={-0.58}
          exploded={exploded}
          interactionRef={interactionRef}
          onSelect={toggle}
        >
          {/* 2.5" SSD Drive (Left) */}
          <group position={[-0.88, 0, 0.16]}>
            <mesh>
              <boxGeometry args={[0.78, 0.058, 0.92]} />
              <meshStandardMaterial
                map={brushedTex}
                {...pbr('battery_pack', '#64748b', 0.78, 0.3)}
              />
            </mesh>
            {/* Brushed Spec Label */}
            <mesh position={[0, 0.031, 0.02]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.66, 0.76]} />
              <meshStandardMaterial map={ssdTex} metalness={0.42} roughness={0.35} />
            </mesh>
            {/* 4 Corner Mounting Screws */}
            {(
              [
                [-0.35, -0.42],
                [0.35, -0.42],
                [-0.35, 0.42],
                [0.35, 0.42],
              ] as [number, number][]
            ).map(([sx, sz], i) => (
              <mesh key={i} position={[sx, 0.031, sz]}>
                <cylinderGeometry args={[0.018, 0.018, 0.006, 12]} />
                <meshStandardMaterial color="#e2e8f0" metalness={0.92} roughness={0.2} />
              </mesh>
            ))}
            {/* Gold SATA Data + Power L-Connector Fingers */}
            <mesh position={[-0.14, -0.006, -0.47]}>
              <boxGeometry args={[0.24, 0.014, 0.04]} />
              <meshStandardMaterial color="#eab308" metalness={0.95} roughness={0.16} />
            </mesh>
            <mesh position={[0.14, -0.006, -0.47]}>
              <boxGeometry args={[0.16, 0.014, 0.04]} />
              <meshStandardMaterial color="#eab308" metalness={0.95} roughness={0.16} />
            </mesh>
          </group>

          {/* Multi-Cell Li-Ion Battery Pack (Right) */}
          <group position={[0.66, 0, 0.16]}>
            {/* Battery Carrier Frame */}
            <mesh position={[0, -0.004, 0]}>
              <boxGeometry args={[1.42, 0.056, 0.8]} />
              <meshStandardMaterial {...pbr('battery_pack', '#18181b', 0.14, 0.68)} />
            </mesh>
            {/* 3 Distinct Pouch Cell Dividers with Foil Wrap */}
            {[-0.44, 0, 0.44].map((cx, i) => (
              <mesh key={i} position={[cx, 0.006, 0.03]}>
                <boxGeometry args={[0.41, 0.058, 0.68]} />
                <meshStandardMaterial
                  color="#1f2937"
                  metalness={0.28}
                  roughness={0.42}
                />
              </mesh>
            ))}
            {/* BMS PCB Strip along Rear Edge */}
            <mesh position={[0, 0.018, -0.35]}>
              <boxGeometry args={[1.34, 0.016, 0.08]} />
              <meshStandardMaterial color="#14532d" metalness={0.25} roughness={0.45} />
            </mesh>
            {/* Crisp Battery Spec Sticker */}
            <mesh position={[0, 0.037, 0.04]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[1.28, 0.62]} />
              <meshStandardMaterial map={batteryTex} roughness={0.58} metalness={0.1} />
            </mesh>
          </group>
          {/* BMS Connector Cable & JST Header Plug */}
          <mesh geometry={bmsCableGeo}>
            <meshStandardMaterial color="#dc2626" roughness={0.55} metalness={0.1} />
          </mesh>
          <mesh position={[0.05, 0.014, -0.36]}>
            <boxGeometry args={[0.09, 0.024, 0.048]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.45} metalness={0.05} />
          </mesh>
        </LayerGroup>

        {/* 3. GREEN PCB MOTHERBOARD, CPU/GPU DIES, VRM, CAPS, CMOS, M.2 SSD, DUAL DDR5 & I/O SHIELDS */}
        <LayerGroup
          id="logic_board"
          baseY={0.01}
          explodedY={0.05}
          exploded={exploded}
          interactionRef={interactionRef}
          onSelect={toggle}
        >
          {/* Green Fiberglass PCB */}
          <mesh position={[0, 0, -0.15]}>
            <boxGeometry args={[2.72, 0.026, 0.96]} />
            <meshStandardMaterial
              map={pcbTex}
              {...pbr('logic_board', '#15803d', 0.25, 0.42)}
            />
          </mesh>

          {/* U1 CPU Silicon Package & Mirror Die */}
          <group position={[-0.7, 0.02, -0.18]}>
            <mesh>
              <boxGeometry args={[0.36, 0.014, 0.36]} />
              <meshStandardMaterial color="#0f766e" roughness={0.42} metalness={0.25} />
            </mesh>
            <mesh position={[0, 0.011, 0]}>
              <boxGeometry args={[0.17, 0.008, 0.14]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.98} roughness={0.06} />
            </mesh>
          </group>

          {/* U2 Discrete GPU Silicon Package & Mirror Die */}
          <group position={[-0.22, 0.02, -0.14]}>
            <mesh>
              <boxGeometry args={[0.28, 0.014, 0.28]} />
              <meshStandardMaterial color="#1e293b" roughness={0.45} metalness={0.25} />
            </mesh>
            <mesh position={[0, 0.011, 0]}>
              <boxGeometry args={[0.13, 0.008, 0.13]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.98} roughness={0.06} />
            </mesh>
          </group>

          {/* Discrete VRM Ferrite Chokes & QFN MOSFETs */}
          {[-0.84, -0.74, -0.64, -0.54, -0.44].map((vx, i) => (
            <group key={i} position={[vx, 0.024, -0.46]}>
              <mesh>
                <boxGeometry args={[0.072, 0.024, 0.072]} />
                <meshStandardMaterial color="#52525b" roughness={0.62} metalness={0.35} />
              </mesh>
              <mesh position={[0, -0.004, 0.072]}>
                <boxGeometry args={[0.048, 0.012, 0.044]} />
                <meshStandardMaterial color="#09090b" roughness={0.5} metalness={0.18} />
              </mesh>
            </group>
          ))}

          {/* Cylindrical Solid-State Polymer Capacitors */}
          {[-0.3, -0.2, -0.1, 0.02, 0.12].map((cx, i) => (
            <group key={i} position={[cx, 0.026, -0.47]}>
              <mesh>
                <cylinderGeometry args={[0.026, 0.026, 0.028, 16]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.18} />
              </mesh>
              <mesh position={[0, 0.015, -0.008]}>
                <boxGeometry args={[0.032, 0.002, 0.014]} />
                <meshStandardMaterial color="#4f46e5" roughness={0.4} />
              </mesh>
            </group>
          ))}

          {/* CMOS Coin-Cell Battery in Holder */}
          <group position={[0.24, 0.022, -0.36]}>
            <mesh>
              <cylinderGeometry args={[0.088, 0.088, 0.018, 24]} />
              <meshStandardMaterial color="#09090b" roughness={0.75} metalness={0.1} />
            </mesh>
            <mesh position={[0, 0.006, 0]}>
              <cylinderGeometry args={[0.072, 0.072, 0.014, 24]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.14} />
            </mesh>
          </group>

          {/* M.2 2280 NVMe SSD Stick */}
          <group position={[0.42, 0.024, 0.12]}>
            {/* M.2 Socket */}
            <mesh position={[-0.28, 0, 0]}>
              <boxGeometry args={[0.06, 0.022, 0.18]} />
              <meshStandardMaterial color="#18181b" roughness={0.6} metalness={0.2} />
            </mesh>
            {/* NVMe PCB */}
            <mesh position={[0, 0.004, 0]}>
              <boxGeometry args={[0.52, 0.01, 0.16]} />
              <meshStandardMaterial color="#0f172a" roughness={0.45} metalness={0.25} />
            </mesh>
            {/* Gold M-Key Fingers */}
            <mesh position={[-0.245, 0.005, 0]}>
              <boxGeometry args={[0.03, 0.011, 0.14]} />
              <meshStandardMaterial color="#eab308" metalness={0.95} roughness={0.15} />
            </mesh>
            {/* Controller & NAND Flash ICs */}
            <mesh position={[-0.12, 0.012, 0]}>
              <boxGeometry args={[0.08, 0.008, 0.08]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.85} roughness={0.22} />
            </mesh>
            <mesh position={[0.02, 0.012, 0]}>
              <boxGeometry args={[0.1, 0.008, 0.11]} />
              <meshStandardMaterial color="#09090b" roughness={0.5} metalness={0.15} />
            </mesh>
            <mesh position={[0.15, 0.012, 0]}>
              <boxGeometry args={[0.1, 0.008, 0.11]} />
              <meshStandardMaterial color="#09090b" roughness={0.5} metalness={0.15} />
            </mesh>
            {/* Rear Mounting Screw */}
            <mesh position={[0.24, 0.014, 0]}>
              <cylinderGeometry args={[0.016, 0.016, 0.008, 12]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.92} roughness={0.18} />
            </mesh>
          </group>

          {/* Dual SO-DIMM DDR5 RAM Modules with Metal Retention Clips */}
          {[
            { z: -0.28, y: 0.022 },
            { z: 0.02, y: 0.022 },
          ].map((slot, sIdx) => (
            <group key={sIdx} position={[1.04, slot.y, slot.z]}>
              {/* Green/Black DDR5 PCB */}
              <mesh>
                <boxGeometry args={[0.42, 0.012, 0.22]} />
                <meshStandardMaterial color="#065f46" roughness={0.42} metalness={0.25} />
              </mesh>
              {/* Gold Edge Contacts */}
              <mesh position={[-0.2, 0.002, 0]}>
                <boxGeometry args={[0.02, 0.013, 0.2]} />
                <meshStandardMaterial color="#eab308" metalness={0.95} roughness={0.15} />
              </mesh>
              {/* 4 Black DRAM ICs */}
              {[-0.08, -0.02, 0.04, 0.1].map((dx, dIdx) => (
                <mesh key={dIdx} position={[dx, 0.01, 0]}>
                  <boxGeometry args={[0.042, 0.008, 0.14]} />
                  <meshStandardMaterial color="#09090b" roughness={0.48} metalness={0.18} />
                </mesh>
              ))}
              {/* Silver Side Retention Clips */}
              <mesh position={[0.02, 0.004, -0.116]}>
                <boxGeometry args={[0.32, 0.016, 0.012]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.18} />
              </mesh>
              <mesh position={[0.02, 0.004, 0.116]}>
                <boxGeometry args={[0.32, 0.016, 0.012]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.18} />
              </mesh>
            </group>
          ))}

          {/* Detailed USB-C / HDMI / Audio Jack EMI Shields (Left Edge) */}
          {/* 2x USB-C Thunderbolt Ports */}
          {[-0.42, -0.24].map((pz, idx) => (
            <group key={idx} position={[-1.33, 0.026, pz]}>
              <mesh>
                <boxGeometry args={[0.12, 0.032, 0.11]} />
                <meshStandardMaterial color="#d1d5db" metalness={0.92} roughness={0.18} />
              </mesh>
              <mesh position={[-0.062, 0, 0]}>
                <boxGeometry args={[0.004, 0.016, 0.075]} />
                <meshStandardMaterial color="#09090b" roughness={0.8} />
              </mesh>
            </group>
          ))}
          {/* HDMI Port Shield */}
          <group position={[-1.33, 0.028, -0.04]}>
            <mesh>
              <boxGeometry args={[0.13, 0.04, 0.15]} />
              <meshStandardMaterial color="#d1d5db" metalness={0.92} roughness={0.18} />
            </mesh>
            <mesh position={[-0.066, 0, 0]}>
              <boxGeometry args={[0.004, 0.02, 0.11]} />
              <meshStandardMaterial color="#09090b" roughness={0.8} />
            </mesh>
          </group>
          {/* 3.5mm Audio Combo Jack */}
          <group position={[-1.33, 0.026, 0.16]}>
            <mesh>
              <boxGeometry args={[0.11, 0.036, 0.09]} />
              <meshStandardMaterial color="#18181b" roughness={0.55} metalness={0.2} />
            </mesh>
            <mesh position={[-0.058, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.018, 0.018, 0.012, 16]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.92} roughness={0.18} />
            </mesh>
          </group>
        </LayerGroup>

        {/* 4. THERMAL MODULE: BLOWER FAN, DUAL COPPER HEATPIPES, COLD-PLATES & 24-FIN ARRAY */}
        <LayerGroup
          id="cooling_system"
          baseY={0.03}
          explodedY={0.62}
          exploded={exploded}
          interactionRef={interactionRef}
          onSelect={toggle}
        >
          {/* Centrifugal Blower Fan (Left) */}
          <group position={[-0.88, 0.01, -0.12]}>
            {/* Blower Base Housing */}
            <mesh>
              <cylinderGeometry args={[0.33, 0.33, 0.052, 32]} />
              <meshStandardMaterial {...pbr('cooling_system', '#18181b', 0.22, 0.62)} />
            </mesh>
            {/* Top Intake Shroud Ring */}
            <mesh position={[0, 0.028, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.26, 0.035, 10, 32]} />
              <meshStandardMaterial color="#27272a" metalness={0.4} roughness={0.45} />
            </mesh>
            {/* Central Metal Bearing Hub */}
            <mesh position={[0, 0.012, 0]}>
              <cylinderGeometry args={[0.095, 0.095, 0.048, 24]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.88} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0.037, 0]}>
              <cylinderGeometry args={[0.042, 0.042, 0.006, 20]} />
              <meshStandardMaterial color="#d97706" metalness={0.9} roughness={0.22} />
            </mesh>
            {/* 22 Curved Impeller Blades */}
            {fanBlades.map((ang, bIdx) => (
              <group key={bIdx} rotation={[0, ang, 0]}>
                <mesh position={[0.175, 0.01, 0]} rotation={[0.36, 0.24, 0]}>
                  <boxGeometry args={[0.15, 0.032, 0.01]} />
                  <meshStandardMaterial color="#3f3f46" roughness={0.48} metalness={0.28} />
                </mesh>
              </group>
            ))}
          </group>

          {/* Braided 4-Pin PWM Fan Cable & JST Plug */}
          <mesh geometry={fanCableGeo}>
            <meshStandardMaterial color="#18181b" roughness={0.82} metalness={0.08} />
          </mesh>
          <mesh position={[-1.12, -0.014, -0.4]}>
            <boxGeometry args={[0.055, 0.018, 0.032]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.45} />
          </mesh>

          {/* CPU & GPU Copper Cold-Plates + Retention Clamp Brackets */}
          {[
            { x: -0.7, z: -0.2, w: 0.32, d: 0.32 },
            { x: -0.22, z: -0.16, w: 0.25, d: 0.25 },
          ].map((cp, idx) => (
            <group key={idx} position={[cp.x, 0.012, cp.z]}>
              {/* Copper Cold-Plate */}
              <mesh>
                <boxGeometry args={[cp.w, 0.014, cp.d]} />
                <meshStandardMaterial color="#c2410c" metalness={0.92} roughness={0.2} />
              </mesh>
              {/* Stamped Steel Retention Bracket */}
              <mesh position={[0, 0.01, 0]}>
                <boxGeometry args={[cp.w + 0.06, 0.008, cp.d + 0.06]} />
                <meshStandardMaterial color="#52525b" metalness={0.78} roughness={0.28} />
              </mesh>
              {/* 4 Captive Clamp Screws */}
              {(
                [
                  [-cp.w * 0.45, -cp.d * 0.45],
                  [cp.w * 0.45, -cp.d * 0.45],
                  [-cp.w * 0.45, cp.d * 0.45],
                  [cp.w * 0.45, cp.d * 0.45],
                ] as [number, number][]
              ).map(([sx, sz], sIdx) => (
                <mesh key={sIdx} position={[sx, 0.018, sz]}>
                  <cylinderGeometry args={[0.014, 0.014, 0.008, 12]} />
                  <meshStandardMaterial color="#e2e8f0" metalness={0.92} roughness={0.18} />
                </mesh>
              ))}
            </group>
          ))}

          {/* Dual Curved Copper Heatpipes */}
          <mesh geometry={heatpipeGeoLeft}>
            <meshStandardMaterial {...pbr('cooling_system', '#c2410c', 0.94, 0.16)} />
          </mesh>
          <mesh geometry={heatpipeGeoRight}>
            <meshStandardMaterial {...pbr('cooling_system', '#ea580c', 0.94, 0.16)} />
          </mesh>

          {/* Denser Stacked 24-Fin Copper Heatsink Array (Right) */}
          <group position={[0.98, 0.02, -0.12]}>
            <mesh position={[0, -0.022, 0]}>
              <boxGeometry args={[0.56, 0.016, 0.34]} />
              <meshStandardMaterial color="#18181b" roughness={0.62} metalness={0.28} />
            </mesh>
            <mesh position={[0, 0.052, 0]}>
              <boxGeometry args={[0.56, 0.008, 0.32]} />
              <meshStandardMaterial color="#9a3412" metalness={0.88} roughness={0.22} />
            </mesh>
            {heatsinkFins.map((fx, i) => (
              <mesh key={i} position={[fx, 0.018, 0]}>
                <boxGeometry args={[0.007, 0.064, 0.32]} />
                <meshStandardMaterial color="#d97706" metalness={0.92} roughness={0.18} />
              </mesh>
            ))}
          </group>
        </LayerGroup>

        {/* 5. BRUSHED ALUMINUM KEYBOARD DECK, PRECISION TRACKPAD & CNC DISPLAY LID */}
        <LayerGroup
          id="keyboard_deck"
          baseY={0.05}
          explodedY={1.26}
          exploded={exploded}
          interactionRef={interactionRef}
          onSelect={toggle}
        >
          {/* Brushed Silver-Aluminum Top Deck */}
          <mesh>
            <boxGeometry args={[2.95, 0.04, 2.02]} />
            <meshStandardMaterial
              map={brushedTex}
              {...pbr('keyboard_deck', '#cbd5e1', 0.8, 0.26)}
            />
          </mesh>
          {/* Front Magnetic Thumb-Notch Scoop */}
          <mesh position={[0, 0.016, 0.99]}>
            <boxGeometry args={[0.56, 0.014, 0.045]} />
            <meshStandardMaterial color="#64748b" metalness={0.7} roughness={0.35} />
          </mesh>

          {/* Left & Right Speaker Micro-Grille Perforations */}
          <mesh position={[-1.33, 0.021, -0.22]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.16, 0.86]} />
            <meshStandardMaterial map={speakerTex} metalness={0.5} roughness={0.42} />
          </mesh>
          <mesh position={[1.33, 0.021, -0.22]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.16, 0.86]} />
            <meshStandardMaterial map={speakerTex} metalness={0.5} roughness={0.42} />
          </mesh>

          {/* Recessed Dark-Anodized Keyboard Well */}
          <mesh position={[0, 0.018, -0.22]}>
            <boxGeometry args={[2.44, 0.01, 0.9]} />
            <meshStandardMaterial color="#27272a" roughness={0.75} metalness={0.15} />
          </mesh>

          {/* Sculpted Chiclet Keycaps + Crisp Procedural QWERTY Legends */}
          {keyItems.map((k) => (
            <group key={k.id} position={[k.x, 0.024, k.z]}>
              {/* Tapered Keycap Skirt */}
              <mesh position={[0, -0.002, 0]}>
                <boxGeometry args={[k.w, 0.01, k.d]} />
                <meshStandardMaterial color="#18181b" roughness={0.7} metalness={0.08} />
              </mesh>
              {/* Sculpted Upper Cap */}
              <mesh position={[0, 0.005, 0]}>
                <boxGeometry args={[k.w * 0.9, 0.008, k.d * 0.9]} />
                <meshStandardMaterial color="#1e2028" roughness={0.58} metalness={0.1} />
              </mesh>
              {/* Crisp White Legend Face */}
              <mesh
                geometry={k.faceGeo}
                position={[0, 0.0095, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
              >
                <meshStandardMaterial map={keyAtlasTex} roughness={0.55} metalness={0.05} />
              </mesh>
            </group>
          ))}

          {/* Fingerprint / Power Button with Glowing LED Ring (Top Right) */}
          <group position={[1.28, 0.022, -0.82]}>
            <mesh>
              <cylinderGeometry args={[0.044, 0.044, 0.008, 24]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.88} roughness={0.22} />
            </mesh>
            <mesh position={[0, 0.003, 0]}>
              <cylinderGeometry args={[0.032, 0.032, 0.006, 24]} />
              <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.25} />
            </mesh>
            <mesh position={[0, 0.006, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.036, 0.0035, 10, 28]} />
              <meshStandardMaterial
                color="#38bdf8"
                emissive="#38bdf8"
                emissiveIntensity={1.4}
              />
            </mesh>
          </group>

          {/* Recessed Glass Precision Trackpad with Diamond-Cut Silver Border */}
          <group position={[0, 0.021, 0.62]}>
            <mesh>
              <boxGeometry args={[1.08, 0.005, 0.6]} />
              <meshStandardMaterial
                color="#334155"
                metalness={0.3}
                roughness={0.12}
              />
            </mesh>
            {/* Diamond-Cut Chamfered Silver Border Rails */}
            <mesh position={[0, 0.002, -0.305]}>
              <boxGeometry args={[1.1, 0.006, 0.012]} />
              <meshStandardMaterial color="#f1f5f9" metalness={0.96} roughness={0.12} />
            </mesh>
            <mesh position={[0, 0.002, 0.305]}>
              <boxGeometry args={[1.1, 0.006, 0.012]} />
              <meshStandardMaterial color="#f1f5f9" metalness={0.96} roughness={0.12} />
            </mesh>
            <mesh position={[-0.545, 0.002, 0]}>
              <boxGeometry args={[0.012, 0.006, 0.6]} />
              <meshStandardMaterial color="#f1f5f9" metalness={0.96} roughness={0.12} />
            </mesh>
            <mesh position={[0.545, 0.002, 0]}>
              <boxGeometry args={[0.012, 0.006, 0.6]} />
              <meshStandardMaterial color="#f1f5f9" metalness={0.96} roughness={0.12} />
            </mesh>
          </group>

          {/* Dual Metallic Clutch Hinges + CNC Display Lid */}
          <group
            onClick={(e) => {
              e.stopPropagation();
              toggle('display_lid');
            }}
          >
            {/* Left & Right Multi-Part Clutch Hinges */}
            {[-0.95, 0.95].map((hx, i) => (
              <group key={i} position={[hx, 0.032, -0.96]}>
                <mesh rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.038, 0.038, 0.24, 20]} />
                  <meshStandardMaterial color="#52525b" metalness={0.88} roughness={0.22} />
                </mesh>
                <mesh position={[-0.12, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.042, 0.042, 0.02, 16]} />
                  <meshStandardMaterial color="#18181b" metalness={0.5} roughness={0.4} />
                </mesh>
                <mesh position={[0.12, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.042, 0.042, 0.02, 16]} />
                  <meshStandardMaterial color="#18181b" metalness={0.5} roughness={0.4} />
                </mesh>
              </group>
            ))}

            <group position={[0, 0.03, -0.96]} rotation={[-0.26, 0, 0]}>
              {/* Beveled CNC Aluminum Outer Display Shell */}
              <mesh position={[0, 0.98, 0]}>
                <boxGeometry args={[2.95, 1.94, 0.04]} />
                <meshStandardMaterial
                  map={brushedTex}
                  {...pbr('display_lid', '#3f3f46', 0.72, 0.3)}
                />
              </mesh>
              {/* Chamfered CNC Perimeter Trim */}
              <mesh position={[0, 1.95, 0.005]}>
                <boxGeometry args={[2.95, 0.018, 0.036]} />
                <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.18} />
              </mesh>
              <mesh position={[-1.475, 0.98, 0.005]}>
                <boxGeometry args={[0.018, 1.94, 0.036]} />
                <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.18} />
              </mesh>
              <mesh position={[1.475, 0.98, 0.005]}>
                <boxGeometry args={[0.018, 1.94, 0.036]} />
                <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.18} />
              </mesh>

              {/* Anodized Dark-Slate Inner Bezel */}
              <mesh position={[0, 0.98, 0.022]}>
                <boxGeometry args={[2.86, 1.86, 0.01]} />
                <meshStandardMaterial color="#111827" roughness={0.45} metalness={0.12} />
              </mesh>

              {/* Magnetic Lid Latch Strip (Top Center Rim) */}
              <mesh position={[0, 1.925, 0.025]}>
                <boxGeometry args={[0.48, 0.016, 0.008]} />
                <meshStandardMaterial color="#334155" metalness={0.55} roughness={0.4} />
              </mesh>

              {/* Anti-Glare IPS LCD Panel */}
              <mesh position={[0, 0.96, 0.029]}>
                <planeGeometry args={[2.68, 1.64]} />
                <meshStandardMaterial
                  map={ipsTex}
                  color="#0f172a"
                  roughness={0.2}
                  metalness={0.12}
                />
              </mesh>

              {/* Webcam Module: Glass Lens Ring + IR Sensor + Dual Mic Pinholes + Privacy LED */}
              <group position={[0, 1.855, 0.03]}>
                {/* Module Housing Bar */}
                <mesh>
                  <boxGeometry args={[0.26, 0.042, 0.006]} />
                  <meshStandardMaterial color="#09090b" roughness={0.5} metalness={0.2} />
                </mesh>
                {/* Webcam Glass Lens Ring & Optical Glass */}
                <mesh position={[0, 0, 0.003]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.018, 0.018, 0.005, 18]} />
                  <meshStandardMaterial color="#475569" metalness={0.92} roughness={0.15} />
                </mesh>
                <mesh position={[0, 0, 0.005]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.011, 0.011, 0.004, 16]} />
                  <meshStandardMaterial
                    color="#020617"
                    roughness={0.05}
                    metalness={0.2}
                  />
                </mesh>
                {/* IR Sensor Window */}
                <mesh position={[-0.045, 0, 0.004]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.011, 0.011, 0.004, 14]} />
                  <meshStandardMaterial color="#4c1d95" metalness={0.6} roughness={0.12} />
                </mesh>
                {/* Privacy LED Dot */}
                <mesh position={[0.036, 0, 0.004]}>
                  <sphereGeometry args={[0.0045, 10, 10]} />
                  <meshStandardMaterial
                    color="#22c55e"
                    emissive="#16a34a"
                    emissiveIntensity={0.6}
                  />
                </mesh>
                {/* Dual Mic Pinholes */}
                <mesh position={[-0.095, 0, 0.004]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.004, 0.004, 0.004, 10]} />
                  <meshStandardMaterial color="#020617" roughness={0.9} />
                </mesh>
                <mesh position={[0.095, 0, 0.004]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.004, 0.004, 0.004, 10]} />
                  <meshStandardMaterial color="#020617" roughness={0.9} />
                </mesh>
              </group>
            </group>
          </group>
        </LayerGroup>
      </group>
    </>
  );
}
