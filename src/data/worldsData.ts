import { InspectablePart, WorldConfig, WorldId } from '../types/worlds';

export const WORLDS: WorldConfig[] = [
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
    id: 'jet_engine',
    name: 'JET ENGINE LAB',
    shortLabel: '03B // TURBOFAN',
    tagline: 'AEROSPACE PROPULSION',
    description:
      'High-bypass aerospace turbofan jet engine featuring 22 titanium fan blades, axial compressor stages, annular combustor, and axial exploded view.',
    accentColor: '#38bdf8',
    secondaryColor: '#f59e0b',
    gridColor: '#0284c7',
  },
  {
    id: 'laptop',
    name: 'WORKSTATION LAB',
    shortLabel: '03C // LAPTOP',
    tagline: 'HARDWARE ARCHITECTURE',
    description:
      'CNC aluminum workstation laptop with internal logic board, silicon SoC, copper vapor chamber, dual cooling fans, battery pack, and 6-layer exploded view.',
    accentColor: '#38bdf8',
    secondaryColor: '#818cf8',
    gridColor: '#0284c7',
  },
  {
    id: 'satellite',
    name: 'SPACECRAFT LAB',
    shortLabel: '05 // ISS ORBITAL',
    tagline: 'MODULAR ORBITAL SPACE STATION',
    description:
      'Inspect the International Space Station architecture featuring the Integrated Truss Structure, dual-wing Photovoltaic Arrays & iROSA, HRS ammonia radiators, USOS Pressurized Labs, and Russian Orbital Segment.',
    accentColor: '#fbbf24',
    secondaryColor: '#38bdf8',
    gridColor: '#d97706',
  },
];

export const WORLD_PARTS: Record<Exclude<WorldId, 'universe'>, InspectablePart[]> = {
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
  jet_engine: [
    {
      id: 'intake_nacelle',
      name: 'Intake Nacelle',
      category: 'AERODYNAMIC COWLING',
      description:
        'Composite acoustic inlet cowling with a polished aluminum anti-ice leading-edge lip guiding smooth airflow into the fan.',
    },
    {
      id: 'turbofan_blades',
      name: 'Titanium Fan & Spinner',
      category: 'PRIMARY BYPASS STAGE',
      description:
        '22 wide-chord twisted titanium fan blades driven by the low-pressure shaft to generate the majority of bypass thrust.',
    },
    {
      id: 'axial_compressor',
      name: 'Axial Compressor',
      category: 'MULTI-STAGE PRESSURE',
      description:
        'Successive rotating rotor and stator stages compressing incoming core air before combustion.',
    },
    {
      id: 'core_shaft',
      name: 'Main Drive Shaft',
      category: 'CONCENTRIC ROTOR AXIS',
      description:
        'High-strength titanium alloy shaft transferring torque from the rear turbine stages forward to the fan.',
    },
    {
      id: 'combustion_chamber',
      name: 'Annular Combustor',
      category: 'THERMAL CORE',
      description:
        'Inconel superalloy annular liner mixing compressed air with atomized fuel for continuous high-energy expansion.',
    },
    {
      id: 'turbine_stages',
      name: 'Turbine Stages',
      category: 'ENERGY EXTRACTION',
      description:
        'High- and low-pressure nickel-superalloy turbine disks extracting rotational energy from hot exhaust gases.',
    },
    {
      id: 'exhaust_nozzle',
      name: 'Exhaust Nozzle & Plug',
      category: 'THRUST ACCELERATOR',
      description:
        'Convergent titanium exhaust shroud and central acoustic plug accelerating core gas flow smoothly.',
    },
  ],
  laptop: [
    {
      id: 'display_lid',
      name: 'Display Lid & 4K OLED',
      category: 'OPTICAL ASSEMBLY',
      description:
        'Precision-milled aluminum display enclosure housing a laminated anti-reflective 4K OLED panel and CNC torque hinge.',
    },
    {
      id: 'keyboard_deck',
      name: 'Keyboard & Trackpad',
      category: 'UNIBODY TOP CASE',
      description:
        'Anodized aluminum upper deck featuring 71 low-travel scissor switches and a force-sensing haptic glass trackpad.',
    },
    {
      id: 'cooling_system',
      name: 'Vapor Chamber & Fans',
      category: 'THERMAL MANAGEMENT',
      description:
        'Copper vapor-chamber heatpipe paired with dual opposing 16-blade centrifugal blower fans for whisper-quiet heat dissipation.',
    },
    {
      id: 'logic_board',
      name: 'Logic Board & SoC',
      category: 'COMPUTE CORE',
      description:
        'High-density multi-layer PCB integrating the mirrored silicon SoC package, unified memory, and NVMe flash storage.',
    },
    {
      id: 'battery_pack',
      name: 'Battery Array',
      category: 'POWER ARCHITECTURE',
      description:
        'Contoured multi-cell lithium-polymer battery modules engineered to maximize chassis volume efficiency.',
    },
    {
      id: 'bottom_chassis',
      name: 'Bottom Unibody',
      category: 'STRUCTURAL ENCLOSURE',
      description:
        'CNC-machined aluminum lower shell with acoustic intake vents and vibration-damping elastomer feet.',
    },
  ],
  satellite: [
    {
      id: 'truss',
      name: 'Integrated Truss & Canadarm2',
      category: 'BACKBONE & ROBOTICS (S6–P6)',
      description:
        '108-meter open-lattice aluminum truss spine (S6, S5, S3/S4, S1, S0, Z1, P1, P3/P4, P5, P6) with Solar Alpha Rotary Joints (SARJ), Mobile Servicing System (Canadarm2), and AMS-02 particle physics observatory.',
      material: '7075-T6 Aluminum / Titanium',
    },
    {
      id: 'solar_arrays',
      name: 'Photovoltaic Arrays & iROSA',
      category: 'SOLAR POWER GENERATION',
      description:
        'Eight massive double-blanket silicon photovoltaic solar wings cantilevered from P4/P6 and S4/S6, augmented by four pink/violet-tinted Roll-Out Solar Arrays (iROSA) and outboard P6/S6 thermal radiators.',
      material: 'Silicon Cells / Kapton / CFRP',
    },
    {
      id: 'radiators',
      name: 'Thermal HRS Radiators',
      category: 'AMMONIA HEAT REJECTION',
      description:
        'Triple-panel starboard (S1) and port (P1) Heat Rejection Subsystem radiator wings circulating anhydrous ammonia through corrugated white Z-93 ceramic panels to radiate station waste heat.',
      material: 'Z-93 Ceramic / Aluminum Honeycomb',
    },
    {
      id: 'usos_modules',
      name: 'USOS Pressurized Labs & Nodes',
      category: 'HABITATION & SCIENCE SPINE',
      description:
        'United States Orbital Segment pressurized modules including Node 1 (Unity), U.S. Lab (Destiny), Node 2 (Harmony), Node 3 (Tranquility) with 7-window Cupola, ESA Columbus, and JAXA Kibo (JEM + ELM-PS + Exposed Facility).',
      material: '2219 Aluminum-Lithium / Whipple Shield',
    },
    {
      id: 'russian_segment',
      name: 'Russian Orbital Segment (ROS)',
      category: 'PROPULSION & ATTITUDE',
      description:
        'Aft pressurized Russian segment comprising FGB (Zarya), Service Module (Zvezda) with dual solar wings and RCS attitude thrusters, Multipurpose Laboratory Module (Nauka), Prichal node, and MRM-1/MRM-2.',
      material: 'AMG-6 Aluminum / Kapton MLI',
    },
    {
      id: 'docking_adapters',
      name: 'PMA & Docking Adapters',
      category: 'CREW & CARGO INTERFACES',
      description:
        'Pressurized Mating Adapters (PMA-1, PMA-2, PMA-3) and International Docking Adapters (IDA-2, IDA-3) enabling autonomous commercial crew and cargo spacecraft berthing.',
      material: 'Titanium / Al-Li Forgings',
    },
    {
      id: 'airlock_logistics',
      name: 'Quest Airlock, BEAM & ELC',
      category: 'EVA & EXTERNAL LOGISTICS',
      description:
        'Quest Joint Airlock for EVA spacewalks, Bigelow Expandable Activity Module (BEAM), Permanent Multipurpose Module (PMM Leonardo), and ExPRESS Logistics Carriers (ELC 1–4) for orbital spares.',
      material: 'Al-Li / Vectran / Kevlar',
    },
  ],
};
