export type MenuSection = 'universe' | 'planets' | 'particles' | 'controls' | 'about';

export type ParticleMode = 'COSMIC' | 'SPIRAL' | 'ORBIT' | 'ENERGY';

export interface PlanetStat {
  label: string;
  value: string;
}

export interface PlanetData {
  id: string;
  name: string;
  classification: string;
  description: string;
  color: string;
  emissiveColor: string;
  ringColor?: string;
  basePosition: [number, number, number];
  radius: number;
  orbitSpeed: number;
  hasRings?: boolean;
  wireframeOverlay?: boolean;
  stats: PlanetStat[];
}

export interface UniverseInteractionRef {
  /** Target uniform scale of central sphere & system (driven by two hands / palm / fist) */
  sphereScale: number;
  /** Particle radial expansion factor */
  particleExpansion: number;
  /** Environment rotation offset (driven by hand left/right) */
  rotationYaw: number;
  /** Environment pitch / vertical offset (driven by hand up/down) */
  verticalOffset: number;
  /** Object drag offset when pinching */
  pinchOffset: { x: number; y: number; z: number };
  /** Trigger timestamp for shockwave pulse */
  wavePulse: number;
  /** Continuous [0, 1] exploded-view separation factor */
  explosionProgress: number;
  /** Whether hand distance is actively driving separation (preserved on 1-hand inspect) */
  handExplosionActive: boolean;
  /** Current active gesture */
  activeGesture: string;
}
