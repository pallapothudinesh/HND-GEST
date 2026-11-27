import { InspectablePart, WorldConfig, WorldId } from '../types/worlds';

export const WORLDS: WorldConfig[] = [
  {
    id: 'armor',
    name: 'ARMOR LAB',
    shortLabel: '01 // ARMOR',
    tagline: 'EXOSKELETON & ENERGY CORE',
    description:
      'Inspect an original futuristic powered exoskeleton with articulated plating, exploded assembly diagnostics, and a gesture-reactive chest energy core.',
    accentColor: '#00f0ff',
    secondaryColor: '#3b82f6',
    gridColor: '#0ea5e9',
  },
  {
    id: 'automotive',
    name: 'AUTOMOTIVE LAB',
    shortLabel: '02 // AUTO',
    tagline: 'HYPER-AERO SHOWROOM',
    description:
      'Explore a futuristic aerodynamic concept vehicle in a holographic showroom with 360° gesture rotation, component telemetry, and interior cockpit transition.',
    accentColor: '#38bdf8',
    secondaryColor: '#6366f1',
    gridColor: '#2563eb',
  },
  {
    id: 'engineering',
    name: 'ENGINEERING LAB',
    shortLabel: '03 // ENGINE',
    tagline: 'THERMODYNAMIC POWERTRAIN',
    description:
      'Educational 3D mechanical breakdown of a turbocharged 4-cylinder engine with live reciprocating pistons, crankshaft motion, and exploded view.',
    accentColor: '#f59e0b',
    secondaryColor: '#00f0ff',
    gridColor: '#0284c7',
  },
  {
    id: 'robotics',
    name: 'ROBOTICS LAB',
    shortLabel: '04 // ROBOTICS',
    tagline: 'AUTONOMOUS KINEMATICS',
    description:
      'Examine next-generation cybernetic systems including a bipedal humanoid chassis, 6-axis industrial manipulator arm, and autonomous recon drone.',
    accentColor: '#a855f7',
    secondaryColor: '#00f0ff',
    gridColor: '#7c3aed',
  },
  {
    id: 'space',
    name: 'SPACE EXPLORATION',
    shortLabel: '05 // SPACE',
    tagline: 'ORBITAL HABITAT & PROBES',
    description:
      'Navigate a deep-space orbital research station with solar arrays, modular docking rings, and deep-cosmos telemetry.',
    accentColor: '#3b82f6',
    secondaryColor: '#ec4899',
    gridColor: '#1d4ed8',
  },
  {
    id: 'science',
    name: 'SCIENCE LAB',
    shortLabel: '06 // SCIENCE',
    tagline: 'MOLECULAR & QUANTUM',
    description:
      'Visualize an interactive 3D DNA double-helix and quantum atomic orbital lattice reacting to spatial hand gestures.',
    accentColor: '#10b981',
    secondaryColor: '#00f0ff',
    gridColor: '#059669',
  },
  {
    id: 'digital_art',
    name: 'DIGITAL ART',
    shortLabel: '07 // ART',
    tagline: 'KINETIC LIGHT SCULPTURE',
    description:
      'A generative holographic torus-knot installation that morphs, expands, and resonates with your hand movements in real time.',
    accentColor: '#ec4899',
    secondaryColor: '#8b5cf6',
    gridColor: '#be185d',
  },
  {
    id: 'future_tech',
    name: 'FUTURE TECHNOLOGY',
    shortLabel: '08 // QUANTUM',
    tagline: 'NEURAL QUANTUM CORE',
    description:
      'Inspect a cryogenic quantum processor suspended inside levitating superconducting rings and photonic bus arrays.',
    accentColor: '#00f0ff',
    secondaryColor: '#a855f7',
    gridColor: '#0891b2',
  },
];

export const WORLD_PARTS: Record<Exclude<WorldId, 'universe'>, InspectablePart[]> = {
  armor: [
    {
      id: 'helmet',
      name: 'Helmet',
      category: 'OPTICS & NEURAL LINK',
      description:
        'Panoramic polarized visor housing spatial LiDAR sensors, HUD projection optics, and neural-sync telemetry receivers.',
    },
    {
      id: 'chest',
      name: 'Chest',
      category: 'CHASSIS ARMOR',
      description:
        'Multi-layered titanium-graphene composite breastplate engineered to distribute kinetic stress and shield internal power conduits.',
    },
    {
      id: 'energy_core',
      name: 'Energy core',
      category: 'FUSION REACTOR',
      description:
        'Fictional magnetic-confinement plasma core delivering clean harmonic power to all exoskeleton servos. Reacts dynamically to hand gestures.',
    },
    {
      id: 'shoulder',
      name: 'Shoulder',
      category: 'GYRO PAULDRONS',
      description:
        'Articulated dual-axis shoulder shrouds with micro-gimbal stabilizers for effortless upper-limb range of motion.',
    },
    {
      id: 'arm',
      name: 'Arm',
      category: 'ACTUATOR SLEEVE',
      description:
        'Electro-active polymer muscle fibers paired with lightweight carbon struts for smooth precision amplification.',
    },
    {
      id: 'hand',
      name: 'Hand',
      category: 'HAPTIC GAUNTLET',
      description:
        'High-dexterity articulated manipulator fingers equipped with force-feedback tactile arrays.',
    },
    {
      id: 'leg',
      name: 'Leg',
      category: 'KINETIC STRIDER',
      description:
        'Shock-absorbing hydraulic leg assemblies with magnetic-lock boots for high-stability traversal.',
    },
  ],
  automotive: [
    {
      id: 'front',
      name: 'Front',
      category: 'AERO SPLITTER & OPTICS',
      description:
        'Active carbon-fiber front splitter paired with razor-thin adaptive laser matrix headlights that channel airflow over the canopy.',
    },
    {
      id: 'rear',
      name: 'Rear',
      category: 'DIFFUSER & ACTIVE WING',
      description:
        'Electronically actuated rear aero wing and Venturi underbody diffuser generating balanced downforce at high velocities.',
    },
    {
      id: 'wheels',
      name: 'Wheels',
      category: 'FORGED AERO RIMS',
      description:
        '21-inch forged magnesium turbine wheels with ceramic brake discs and regenerative energy-capture hubs.',
    },
    {
      id: 'interior',
      name: 'Interior',
      category: 'HOLOGRAPHIC COCKPIT',
      description:
        'Minimalist twin-seat monocoque cabin featuring a yoke steering interface and panoramic wrap-around telemetry glass.',
    },
    {
      id: 'engine',
      name: 'Engine',
      category: 'HYBRID POWERTRAIN',
      description:
        'Mid-mounted tri-motor electric-turbine hybrid unit delivering instant torque vectoring across all four wheels.',
    },
    {
      id: 'body',
      name: 'Body',
      category: 'CARBON MONOCOQUE',
      description:
        'Sculpted unidirectional carbon-nanotube body shell engineered for ultra-low drag coefficient and torsional rigidity.',
    },
  ],
  engineering: [
    {
      id: 'engine_block',
      name: 'Engine block',
      category: 'STRUCTURAL CORE',
      description:
        'The primary cast-aluminum foundation housing the four cylinder bores, coolant jackets, and main crankshaft bearings.',
    },
    {
      id: 'cylinder_head',
      name: 'Cylinder head',
      category: 'COMBUSTION CHAMBER',
      description:
        'Sits atop the engine block, sealing the cylinders and housing the camshafts, spark plugs, and intake/exhaust ports.',
    },
    {
      id: 'pistons',
      name: 'Pistons',
      category: 'RECIPROCATING MASS',
      description:
        'Cylindrical components moving up and down inside the bores, transferring expanding gas pressure into mechanical force.',
    },
    {
      id: 'crankshaft',
      name: 'Crankshaft',
      category: 'ROTATIONAL OUTPUT',
      description:
        'Converts the linear up-and-down motion of the pistons into smooth rotational torque to drive the transmission.',
    },
    {
      id: 'connecting_rods',
      name: 'Connecting rods',
      category: 'KINEMATIC LINKAGE',
      description:
        'Forged steel links pivoting at both ends to join each piston to the offset journals of the rotating crankshaft.',
    },
    {
      id: 'valves',
      name: 'Valves',
      category: 'GAS EXCHANGE',
      description:
        'Precision-timed intake and exhaust poppet valves that open to admit air-fuel mixture and expel combustion gases.',
    },
    {
      id: 'intake_system',
      name: 'Intake system',
      category: 'AIRFLOW PLENUM',
      description:
        'Tuned manifold runners that distribute pressurized, cooled air evenly into each cylinder for clean combustion.',
    },
    {
      id: 'cooling_components',
      name: 'Cooling components',
      category: 'THERMAL REGULATION',
      description:
        'Radiator core, fan shroud, and coolant passages that dissipate excess thermal energy to maintain optimal operating temperature.',
    },
    {
      id: 'turbocharger',
      name: 'Turbocharger',
      category: 'FORCED INDUCTION',
      description:
        'Exhaust-driven turbine coupled to a compressor wheel that increases intake air density for higher thermodynamic efficiency.',
    },
    {
      id: 'oil_system',
      name: 'Oil system',
      category: 'LUBRICATION CIRCUIT',
      description:
        'Lower sump pan, oil pump, and spin-on filter circulating pressurized lubricant to reduce friction across moving parts.',
    },
  ],
  robotics: [
    {
      id: 'humanoid',
      name: 'Humanoid Robot',
      category: 'BIPEDAL CHASSIS',
      description:
        'Autonomous humanoid platform featuring balanced torso gyros, articulated limbs, and stereo vision optics.',
    },
    {
      id: 'robot_arm',
      name: 'Industrial Robot Arm',
      category: '6-AXIS MANIPULATOR',
      description:
        'High-precision articulated factory arm with servo-driven shoulder, elbow, and wrist joints executing smooth pick-and-place arcs.',
    },
    {
      id: 'rover_drone',
      name: 'Autonomous Recon Drone',
      category: 'QUAD-VECTOR UNIT',
      description:
        'Compact hovering scout unit with ducted plasma-ion rotors and a 360° holographic terrain scanner.',
    },
  ],
  space: [
    {
      id: 'habitat_ring',
      name: 'Orbital Habitat Ring',
      category: 'CENTRIFUGE MODULE',
      description:
        'Rotating torus station module generating simulated gravity for long-duration deep-space scientific crews.',
    },
    {
      id: 'solar_arrays',
      name: 'Photovoltaic Wings',
      category: 'POWER GENERATION',
      description:
        'Dual-axis tracking solar sails harvesting high-efficiency orbital radiation across the station truss.',
    },
    {
      id: 'command_spire',
      name: 'Command Spire',
      category: 'DOCKING & TELEMETRY',
      description:
        'Central zero-gravity docking hub and deep-space laser communication array.',
    },
  ],
  science: [
    {
      id: 'dna_helix',
      name: 'DNA Double Helix',
      category: 'GENOMIC STRUCTURE',
      description:
        'Interactive 3D molecular model illustrating sugar-phosphate backbones and complementary base-pair rungs.',
    },
    {
      id: 'quantum_atom',
      name: 'Quantum Atomic Lattice',
      category: 'ORBITAL SHELLS',
      description:
        'Multi-plane electron probability rings orbiting a high-energy nuclear cluster.',
    },
  ],
  digital_art: [
    {
      id: 'torus_sculpture',
      name: 'Harmonic Torus Knot',
      category: 'GENERATIVE GEOMETRY',
      description:
        'Continuous mathematical knot rendered in luminous wireframe and iridescent energy nodes.',
    },
    {
      id: 'orbital_halo',
      name: 'Chromatic Halo Rings',
      category: 'SPATIAL LIGHT',
      description:
        'Counter-rotating neon rings that respond to palm expansion and contraction gestures.',
    },
  ],
  future_tech: [
    {
      id: 'quantum_chip',
      name: 'Cryogenic QPU Core',
      category: 'QUANTUM PROCESSOR',
      description:
        'Suspended multi-tier superconducting processor cooled to near absolute zero for parallel neural computation.',
    },
    {
      id: 'mag_rings',
      name: 'Superconducting Rings',
      category: 'FLUX LEVITATION',
      description:
        'Frictionless magnetic-flux containment rings stabilizing the central quantum bus.',
    },
  ],
};
