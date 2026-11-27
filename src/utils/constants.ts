import { PlanetData, ParticleMode } from '../types/scene';

export const PLANETS: PlanetData[] = [
  {
    id: 'nova',
    name: 'NOVA',
    classification: 'HYPER-LUMINOUS PLASMA WORLD',
    description:
      'A radiant cyan-core exoplanet suspended in an ionized magnetic field. Its upper atmosphere discharges rhythmic aurorae synced to neural frequencies.',
    color: '#00f0ff',
    emissiveColor: '#00a3ff',
    ringColor: '#38bdf8',
    basePosition: [-5.4, 1.8, -2.5],
    radius: 0.72,
    orbitSpeed: 0.24,
    hasRings: true,
    stats: [
      { label: 'RESONANCE', value: '98.4 THz' },
      { label: 'ORBITAL RADIUS', value: '4.2 AU' },
      { label: 'CORE TEMP', value: '14,200 K' },
    ],
  },
  {
    id: 'orbit',
    name: 'ORBIT',
    classification: 'GYROSCOPIC RINGED SATELLITE',
    description:
      'Encased in twin counter-rotating crystalline rings, ORBIT acts as a spatial anchor stabilizing gravitational waves across the inner sector.',
    color: '#3b82f6',
    emissiveColor: '#60a5fa',
    ringColor: '#818cf8',
    basePosition: [5.6, -1.4, -2.2],
    radius: 0.65,
    orbitSpeed: 0.19,
    hasRings: true,
    wireframeOverlay: true,
    stats: [
      { label: 'RING VELOCITY', value: '22.8 km/s' },
      { label: 'MASS INDEX', value: '3.14 M⊕' },
      { label: 'STABILITY', value: '99.97%' },
    ],
  },
  {
    id: 'quantum',
    name: 'QUANTUM',
    classification: 'PHASE-SHIFTED SINGULARITY',
    description:
      'A violet crystalline anomaly existing in partial superposition. Its faceted holographic shell refracts ambient dark-matter particles into coherent streams.',
    color: '#8b5cf6',
    emissiveColor: '#a855f7',
    ringColor: '#c084fc',
    basePosition: [-4.6, -2.3, 1.2],
    radius: 0.56,
    orbitSpeed: 0.31,
    wireframeOverlay: true,
    stats: [
      { label: 'COHERENCE', value: '0.94 Ψ' },
      { label: 'ENTANGLEMENT', value: '1,024 QUBITS' },
      { label: 'PHASE DRIFT', value: '0.002 ms' },
    ],
  },
  {
    id: 'eclipse',
    name: 'ECLIPSE',
    classification: 'OBSIDIAN CORONA SPHERE',
    description:
      'A dark-matter core surrounded by a magenta-violet corona. ECLIPSE absorbs stray photonic noise and emits high-density gravitational pulses.',
    color: '#ec4899',
    emissiveColor: '#db2777',
    ringColor: '#f472b6',
    basePosition: [4.8, 2.2, 0.8],
    radius: 0.62,
    orbitSpeed: 0.16,
    hasRings: true,
    stats: [
      { label: 'ALBEDO', value: '0.03 α' },
      { label: 'CORONA FLUX', value: '840 GW' },
      { label: 'GRAVITY', value: '2.45 g' },
    ],
  },
];

export const PARTICLE_MODES: { id: ParticleMode; label: string; description: string }[] = [
  { id: 'COSMIC', label: 'COSMIC', description: 'Deep-space volumetric starfield drift' },
  { id: 'SPIRAL', label: 'SPIRAL', description: 'Galactic logarithmic vortex arms' },
  { id: 'ORBIT', label: 'ORBIT', description: 'Concentric equatorial ring streams' },
  { id: 'ENERGY', label: 'ENERGY', description: 'High-velocity spherical plasma shell' },
];

export const GESTURE_GUIDE_ITEMS = [
  {
    gesture: 'OPEN_PALM',
    title: 'OPEN PALM',
    action: 'EXPAND',
    detail: 'Expand energy sphere, rings & particle field',
  },
  {
    gesture: 'CLOSED_FIST',
    title: 'CLOSED FIST',
    action: 'CONTRACT',
    detail: 'Compress core & pull particles inward',
  },
  {
    gesture: 'PINCH',
    title: 'PINCH',
    action: 'INTERACT',
    detail: 'Grab & manipulate central 3D sphere',
  },
  {
    gesture: 'MOVE_X',
    title: 'LEFT / RIGHT',
    action: 'ROTATE',
    detail: 'Sweep palm horizontally to orbit universe',
  },
  {
    gesture: 'MOVE_Y',
    title: 'UP / DOWN',
    action: 'MOVE',
    detail: 'Raise or lower palm to shift elevation',
  },
  {
    gesture: 'TWO_HANDS',
    title: 'TWO HANDS',
    action: 'SCALE',
    detail: 'Move hands apart or together to scale',
  },
  {
    gesture: 'POINTING',
    title: 'POINTING',
    action: 'SELECT',
    detail: 'Extend index finger for holographic cursor',
  },
  {
    gesture: 'THUMBS_UP',
    title: 'THUMBS UP',
    action: 'RESET',
    detail: 'Raise thumb to reset model & camera view',
  },
] as const;

export const GESTURE_LABELS: Record<string, string> = {
  NONE: 'STANDBY',
  OPEN_PALM: 'EXPANSION',
  CLOSED_FIST: 'COMPRESSION',
  PINCH: 'OBJECT INTERACTION',
  POINTING: 'SELECTION MODE',
  TWO_HANDS: 'DUAL-HAND SCALE',
  THUMBS_UP: 'SYSTEM RESET',
};

export const MEDIAPIPE_WASM_URL =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm';

export const HAND_LANDMARKER_MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
