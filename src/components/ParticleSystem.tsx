import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ParticleMode, UniverseInteractionRef } from '../types/scene';
import { damp } from '../utils/smoothing';

interface ParticleSystemProps {
  mode: ParticleMode;
  interactionRef: React.MutableRefObject<UniverseInteractionRef>;
  count?: number;
}

function createGlowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.25, 'rgba(180,245,255,0.85)');
    gradient.addColorStop(0.6, 'rgba(56,189,248,0.25)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function ParticleSystem({
  mode,
  interactionRef,
  count = 2400,
}: ParticleSystemProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const currentExpansion = useRef(1);
  const lastModeRef = useRef<ParticleMode>(mode);
  const morphActiveUntilRef = useRef<number>(0);

  const glowTexture = useMemo(() => createGlowTexture(), []);

  useEffect(() => {
    return () => {
      glowTexture.dispose();
    };
  }, [glowTexture]);

  useEffect(() => {
    if (lastModeRef.current !== mode) {
      lastModeRef.current = mode;
      morphActiveUntilRef.current = performance.now() + 2200;
    }
  }, [mode]);

  // Precompute target position buffers for all 4 particle formations
  const { targets, colors, currentPositions } = useMemo(() => {
    const cosmic = new Float32Array(count * 3);
    const spiral = new Float32Array(count * 3);
    const orbit = new Float32Array(count * 3);
    const energy = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const palette = [
      new THREE.Color('#00f0ff'),
      new THREE.Color('#3b82f6'),
      new THREE.Color('#8b5cf6'),
      new THREE.Color('#ec4899'),
      new THREE.Color('#e0f2fe'),
    ];

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // 1. COSMIC: volumetric cosmic cloud
      const cR = 2.8 + Math.random() * 11.5;
      const cTheta = Math.random() * Math.PI * 2;
      const cPhi = Math.acos(2 * Math.random() - 1);
      cosmic[i3] = cR * Math.sin(cPhi) * Math.cos(cTheta);
      cosmic[i3 + 1] = cR * Math.sin(cPhi) * Math.sin(cTheta) * 0.72;
      cosmic[i3 + 2] = cR * Math.cos(cPhi);

      // 2. SPIRAL: 3-arm galactic vortex
      const arm = i % 3;
      const sDist = 1.6 + Math.pow(Math.random(), 0.75) * 9.5;
      const sAngle = sDist * 0.75 + (arm * Math.PI * 2) / 3 + (Math.random() - 0.5) * 0.55;
      spiral[i3] = Math.cos(sAngle) * sDist;
      spiral[i3 + 1] = (Math.random() - 0.5) * (1.8 / (1 + sDist * 0.25));
      spiral[i3 + 2] = Math.sin(sAngle) * sDist;

      // 3. ORBIT: concentric equatorial rings
      const ringBand = 2.4 + (i % 5) * 1.45 + (Math.random() - 0.5) * 0.35;
      const oAngle = Math.random() * Math.PI * 2;
      orbit[i3] = Math.cos(oAngle) * ringBand;
      orbit[i3 + 1] = (Math.random() - 0.5) * 0.45;
      orbit[i3 + 2] = Math.sin(oAngle) * ringBand;

      // 4. ENERGY: dense multi-shell sphere
      const eR = 2.6 + (i % 4) * 1.1 + (Math.random() - 0.5) * 0.4;
      const eTheta = Math.random() * Math.PI * 2;
      const ePhi = Math.acos(2 * Math.random() - 1);
      energy[i3] = eR * Math.sin(ePhi) * Math.cos(eTheta);
      energy[i3 + 1] = eR * Math.sin(ePhi) * Math.sin(eTheta);
      energy[i3 + 2] = eR * Math.cos(ePhi);

      const c = palette[i % palette.length];
      col[i3] = c.r;
      col[i3 + 1] = c.g;
      col[i3 + 2] = c.b;
    }

    const initial = new Float32Array(cosmic);
    return {
      targets: { COSMIC: cosmic, SPIRAL: spiral, ORBIT: orbit, ENERGY: energy },
      colors: col,
      currentPositions: initial,
    };
  }, [count]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const inter = interactionRef.current;

    const prevExp = currentExpansion.current;
    currentExpansion.current = damp(
      currentExpansion.current,
      inter.particleExpansion,
      4.5,
      dt
    );

    const pts = pointsRef.current;
    if (!pts) return;

    const needsMorph =
      performance.now() < morphActiveUntilRef.current ||
      Math.abs(currentExpansion.current - prevExp) > 0.0005 ||
      Math.abs(inter.pinchOffset.x) > 0.01 ||
      Math.abs(inter.pinchOffset.y) > 0.01;

    if (needsMorph) {
      const posAttr = pts.geometry.getAttribute('position') as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;
      const targetArr = targets[mode];
      const exp = currentExpansion.current;
      const lerpSpeed = Math.min(dt * 3.8, 0.25);

      for (let i = 0; i < arr.length; i += 3) {
        const tx = targetArr[i] * exp + inter.pinchOffset.x * 0.45;
        const ty = targetArr[i + 1] * exp + inter.pinchOffset.y * 0.45;
        const tz = targetArr[i + 2] * exp;

        arr[i] += (tx - arr[i]) * lerpSpeed;
        arr[i + 1] += (ty - arr[i + 1]) * lerpSpeed;
        arr[i + 2] += (tz - arr[i + 2]) * lerpSpeed;
      }

      posAttr.needsUpdate = true;
    }

    const spinRate = mode === 'SPIRAL' ? 0.14 : mode === 'ORBIT' ? 0.11 : 0.045;
    pts.rotation.y += dt * spinRate;
    pts.rotation.x = Math.sin(state.clock.elapsedTime * 0.15) * 0.06;
  });

  return (
    <points ref={pointsRef} raycast={() => null}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={currentPositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.14}
        map={glowTexture}
        vertexColors
        transparent
        opacity={0.88}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
