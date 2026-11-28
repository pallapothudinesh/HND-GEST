import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import { UniverseInteractionRef } from '../../types/scene';
import { damp, lerp } from '../../utils/smoothing';

interface JetEngineLabSceneProps {
  interactionRef: React.MutableRefObject<UniverseInteractionRef>;
  selectedPartId: string | null;
  onSelectPart: (id: string | null) => void;
  exploded: boolean;
}

function AxialStage({
  id,
  baseX,
  explodedX,
  exploded,
  interactionRef,
  onSelect,
  children,
}: {
  id: string;
  baseX: number;
  explodedX: number;
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

    ref.current.position.x = damp(ref.current.position.x, lerp(baseX, explodedX, factor), 8.5, dt);
  });

  return (
    <group
      ref={ref}
      position={[baseX, 0, 0]}
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
 * Super-realistic High-Bypass Aerospace Turbofan Jet Engine built with
 * LatheGeometry nacelles/nozzles, 22 twisted titanium fan blades, multi-stage
 * axial compressor & turbine disks, annular combustor, and axial exploded view.
 */
export function JetEngineLabScene({
  interactionRef,
  selectedPartId,
  onSelectPart,
  exploded,
}: JetEngineLabSceneProps) {
  const rootRef = useRef<THREE.Group>(null);
  const fanRotorRef = useRef<THREE.Group>(null);
  const compressorRef = useRef<THREE.Group>(null);
  const turbineRef = useRef<THREE.Group>(null);

  // Sculpted LatheGeometry profiles (revolved around Y, rotated to align along X axis)
  const { intakeGeo, lipGeo, exhaustGeo, nozzlePlugGeo, spinnerGeo } = useMemo(() => {
    // 1. Outer Intake Nacelle Cowling
    const intakePts = [
      new THREE.Vector2(1.06, 0.65),
      new THREE.Vector2(1.16, 0.55),
      new THREE.Vector2(1.22, 0.15),
      new THREE.Vector2(1.2, -0.55),
      new THREE.Vector2(1.12, -0.85),
    ];
    const intake = new THREE.LatheGeometry(intakePts, 64);

    // 2. Polished Aluminum Anti-Ice Leading-Edge Lip
    const lipPts = [
      new THREE.Vector2(0.98, 0.62),
      new THREE.Vector2(1.04, 0.72),
      new THREE.Vector2(1.1, 0.68),
      new THREE.Vector2(1.06, 0.62),
    ];
    const lip = new THREE.LatheGeometry(lipPts, 64);

    // 3. Rear Core Exhaust Cowl
    const exhaustPts = [
      new THREE.Vector2(0.76, 0.45),
      new THREE.Vector2(0.72, 0.05),
      new THREE.Vector2(0.62, -0.45),
      new THREE.Vector2(0.54, -0.62),
    ];
    const exhaust = new THREE.LatheGeometry(exhaustPts, 64);

    // 4. Centerbody Exhaust Plug Cone
    const plugPts = [
      new THREE.Vector2(0.36, 0.18),
      new THREE.Vector2(0.28, -0.25),
      new THREE.Vector2(0.12, -0.68),
      new THREE.Vector2(0.0, -0.88),
    ];
    const plug = new THREE.LatheGeometry(plugPts, 48);

    // 5. Aerodynamic Nose Spinner Cone
    const spinPts = [
      new THREE.Vector2(0.0, 0.52),
      new THREE.Vector2(0.16, 0.34),
      new THREE.Vector2(0.31, 0.08),
      new THREE.Vector2(0.34, -0.05),
    ];
    const spin = new THREE.LatheGeometry(spinPts, 48);

    return {
      intakeGeo: intake,
      lipGeo: lip,
      exhaustGeo: exhaust,
      nozzlePlugGeo: plug,
      spinnerGeo: spin,
    };
  }, []);

  const fanBlades = useMemo(() => Array.from({ length: 22 }, (_, i) => (i / 22) * Math.PI * 2), []);
  const compBlades = useMemo(() => Array.from({ length: 28 }, (_, i) => (i / 28) * Math.PI * 2), []);
  const turbBlades = useMemo(() => Array.from({ length: 26 }, (_, i) => (i / 26) * Math.PI * 2), []);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const inter = interactionRef.current;

    if (rootRef.current) {
      const clampedScale =
        inter.activeGesture === 'TWO_HANDS'
          ? 1
          : Math.min(Math.max(inter.sphereScale, 0.72), 1.45);
      rootRef.current.scale.setScalar(damp(rootRef.current.scale.x, clampedScale, 8, dt));
      rootRef.current.position.x = damp(rootRef.current.position.x, inter.pinchOffset.x * 0.6, 8, dt);
      rootRef.current.position.y = damp(rootRef.current.position.y, 0.1 + inter.pinchOffset.y * 0.45, 8, dt);
    }

    // Smooth realistic turbine rotation
    if (fanRotorRef.current) fanRotorRef.current.rotation.x += dt * 1.4;
    if (compressorRef.current) compressorRef.current.rotation.x += dt * 2.4;
    if (turbineRef.current) turbineRef.current.rotation.x += dt * 2.8;
  });

  const pbr = (
    id: string,
    color: string,
    metalness = 0.86,
    roughness = 0.2,
    emissiveBase = '#080e1a'
  ) => {
    const sel = selectedPartId === id;
    return {
      color: sel ? '#38bdf8' : color,
      emissive: sel ? '#0284c7' : emissiveBase,
      emissiveIntensity: sel ? 0.85 : 0.12,
      metalness,
      roughness,
    };
  };

  const togglePart = (id: string) => {
    onSelectPart(selectedPartId === id ? null : id);
  };

  return (
    <>
      {/* Studio Softbox Reflections */}
      <Environment resolution={128} frames={1}>
        <Lightformer
          form="rect"
          intensity={2.6}
          position={[0, 6, 3]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[12, 4, 1]}
          color="#f8fafc"
        />
        <Lightformer
          form="rect"
          intensity={1.8}
          position={[-6, 2, 4]}
          rotation={[0, Math.PI / 3, 0]}
          scale={[7, 3, 1]}
          color="#e0f2fe"
        />
        <Lightformer
          form="rect"
          intensity={1.5}
          position={[6, 2, -4]}
          rotation={[0, -Math.PI / 3, 0]}
          scale={[7, 3, 1]}
          color="#bae6fd"
        />
      </Environment>

      <group ref={rootRef} position={[0, 0.1, 0]} rotation={[0, -0.52, 0]}>
        {/* 1. INTAKE NACELLE & LEADING EDGE */}
        <AxialStage
          id="intake_nacelle"
          baseX={-1.15}
          explodedX={-3.1}
          exploded={exploded}
          interactionRef={interactionRef}
          onSelect={togglePart}
        >
          <mesh geometry={intakeGeo} rotation={[0, 0, -Math.PI / 2]}>
            <meshStandardMaterial {...pbr('intake_nacelle', '#1e293b', 0.55, 0.32)} side={THREE.DoubleSide} />
          </mesh>
          <mesh geometry={lipGeo} rotation={[0, 0, -Math.PI / 2]}>
            <meshStandardMaterial {...pbr('intake_nacelle', '#e2e8f0', 0.94, 0.12)} side={THREE.DoubleSide} />
          </mesh>
        </AxialStage>

        {/* 2. TITANIUM FAN & SPINNER CONE (22 Curved Airfoil Blades) */}
        <AxialStage
          id="turbofan_blades"
          baseX={-0.95}
          explodedX={-1.95}
          exploded={exploded}
          interactionRef={interactionRef}
          onSelect={togglePart}
        >
          <group ref={fanRotorRef}>
            <mesh geometry={spinnerGeo} rotation={[0, 0, -Math.PI / 2]} position={[-0.18, 0, 0]}>
              <meshStandardMaterial {...pbr('turbofan_blades', '#0f172a', 0.4, 0.25)} />
            </mesh>
            {/* Hub Ring */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.33, 0.36, 0.24, 32]} />
              <meshStandardMaterial {...pbr('turbofan_blades', '#94a3b8', 0.9, 0.18)} />
            </mesh>
            {/* 22 Twisted Titanium Fan Blades */}
            {fanBlades.map((angle, i) => (
              <group key={i} rotation={[angle, 0, 0]}>
                <mesh position={[0, 0.64, 0]} rotation={[0.42, 0.25, 0]}>
                  <boxGeometry args={[0.14, 0.62, 0.025]} />
                  <meshStandardMaterial {...pbr('turbofan_blades', '#cbd5e1', 0.92, 0.16)} />
                </mesh>
              </group>
            ))}
          </group>
        </AxialStage>

        {/* 3. MULTI-STAGE AXIAL COMPRESSOR */}
        <AxialStage
          id="axial_compressor"
          baseX={-0.15}
          explodedX={-0.72}
          exploded={exploded}
          interactionRef={interactionRef}
          onSelect={togglePart}
        >
          <group ref={compressorRef}>
            {[-0.22, 0, 0.22].map((dx, stageIdx) => {
              const r = 0.56 - stageIdx * 0.05;
              return (
                <group key={stageIdx} position={[dx, 0, 0]}>
                  <mesh rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[r * 0.65, r * 0.65, 0.12, 28]} />
                    <meshStandardMaterial {...pbr('axial_compressor', '#64748b', 0.88, 0.22)} />
                  </mesh>
                  {compBlades.map((angle, bIdx) => (
                    <group key={bIdx} rotation={[angle, 0, 0]}>
                      <mesh position={[0, r * 0.82, 0]} rotation={[0.35, 0.18, 0]}>
                        <boxGeometry args={[0.06, r * 0.36, 0.014]} />
                        <meshStandardMaterial {...pbr('axial_compressor', '#e2e8f0', 0.9, 0.18)} />
                      </mesh>
                    </group>
                  ))}
                </group>
              );
            })}
          </group>
          {/* Outer Titanium Compressor Casing (Cutaway Top/Bottom) */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.68, 0.62, 0.72, 32, 1, true, 0.35, Math.PI * 1.45]} />
            <meshStandardMaterial {...pbr('axial_compressor', '#475569', 0.82, 0.28)} side={THREE.DoubleSide} />
          </mesh>
        </AxialStage>

        {/* 4. CENTRAL TITANIUM DRIVE SHAFT */}
        <AxialStage
          id="core_shaft"
          baseX={0.35}
          explodedX={0.18}
          exploded={exploded}
          interactionRef={interactionRef}
          onSelect={togglePart}
        >
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.14, 0.14, 2.55, 24]} />
            <meshStandardMaterial {...pbr('core_shaft', '#e2e8f0', 0.96, 0.12)} />
          </mesh>
        </AxialStage>

        {/* 5. ANNULAR COMBUSTION CHAMBER */}
        <AxialStage
          id="combustion_chamber"
          baseX={0.65}
          explodedX={0.55}
          exploded={exploded}
          interactionRef={interactionRef}
          onSelect={togglePart}
        >
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.58, 0.62, 0.68, 32, 1, true]} />
            <meshStandardMaterial {...pbr('combustion_chamber', '#78350f', 0.78, 0.3, '#451a03')} side={THREE.DoubleSide} />
          </mesh>
          {/* Subtle Warm Thermal Glow Ring */}
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.42, 0.06, 16, 48]} />
            <meshStandardMaterial color="#f59e0b" emissive="#ea580c" emissiveIntensity={1.6} />
          </mesh>
        </AxialStage>

        {/* 6. HIGH & LOW PRESSURE TURBINE STAGES */}
        <AxialStage
          id="turbine_stages"
          baseX={1.25}
          explodedX={1.75}
          exploded={exploded}
          interactionRef={interactionRef}
          onSelect={togglePart}
        >
          <group ref={turbineRef}>
            {[-0.14, 0.14].map((dx, tIdx) => {
              const r = 0.52 + tIdx * 0.06;
              return (
                <group key={tIdx} position={[dx, 0, 0]}>
                  <mesh rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[r * 0.62, r * 0.62, 0.1, 28]} />
                    <meshStandardMaterial {...pbr('turbine_stages', '#475569', 0.88, 0.24)} />
                  </mesh>
                  {turbBlades.map((angle, bIdx) => (
                    <group key={bIdx} rotation={[angle, 0, 0]}>
                      <mesh position={[0, r * 0.8, 0]} rotation={[-0.38, 0.2, 0]}>
                        <boxGeometry args={[0.055, r * 0.38, 0.015]} />
                        <meshStandardMaterial {...pbr('turbine_stages', '#94a3b8', 0.9, 0.2)} />
                      </mesh>
                    </group>
                  ))}
                </group>
              );
            })}
          </group>
        </AxialStage>

        {/* 7. EXHAUST NOZZLE & CENTERBODY CONE */}
        <AxialStage
          id="exhaust_nozzle"
          baseX={1.65}
          explodedX={2.95}
          exploded={exploded}
          interactionRef={interactionRef}
          onSelect={togglePart}
        >
          <mesh geometry={exhaustGeo} rotation={[0, 0, -Math.PI / 2]}>
            <meshStandardMaterial {...pbr('exhaust_nozzle', '#334155', 0.88, 0.22)} side={THREE.DoubleSide} />
          </mesh>
          <mesh geometry={nozzlePlugGeo} rotation={[0, 0, -Math.PI / 2]} position={[0.12, 0, 0]}>
            <meshStandardMaterial {...pbr('exhaust_nozzle', '#64748b', 0.9, 0.2)} />
          </mesh>
        </AxialStage>
      </group>
    </>
  );
}
