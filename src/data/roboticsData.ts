import { InspectablePart } from '../types/worlds';

export type RobotId = 'humanoid' | 'industrial_arm' | 'exploration' | 'ai_robot';

export interface RobotDefinition {
  id: RobotId;
  name: string;
  type: string;
  shortDescription: string;
  educationalInfo: string;
  supportsExplodedView: boolean;
  accentColor: string;
  components: InspectablePart[];
}

export const ROBOTS: RobotDefinition[] = [
  {
    id: 'humanoid',
    name: 'HUMANOID ROBOT',
    type: 'BIPEDAL AUTONOMOUS PLATFORM',
    shortDescription:
      'Full-scale articulated humanoid featuring stereo vision sensors, multi-axis joints, and balanced bipedal locomotion.',
    educationalInfo:
      'Humanoid robots combine inverse kinematics, inertial measurement units (IMUs), and rotary actuators to mirror human balance and dexterity in human-centric environments.',
    supportsExplodedView: true,
    accentColor: '#00f0ff',
    components: [
      {
        id: 'head',
        name: 'Head',
        category: 'CRANIAL SENSOR HOUSING',
        material: 'Brushed Titanium Ti-6Al-4V & Gorilla Glass Visor',
        jointType: '2-Axis Cervical Gimbal',
        movement: '±45° Yaw, ±25° Pitch',
        description:
          'Aerospace-grade titanium cranial shell with a dark reflective glass faceplate concealing stereo RGB-D cameras and thermal sensors.',
      },
      {
        id: 'sensors',
        name: 'Head sensors',
        category: 'PERCEPTION & LIDAR ARRAY',
        material: 'Optical Sapphire Lenses & Carbon Shroud',
        jointType: 'Fixed Vibration-Isolated Mount',
        movement: '360° Depth & Stereo Optical Scan',
        description:
          'Dual stereo vision lenses, solid-state LiDAR emitter, and inertial tracking unit providing real-time 3D SLAM environmental mapping.',
      },
      {
        id: 'neck',
        name: 'Neck',
        category: 'CERVICAL ACTUATOR',
        material: 'Stainless Steel 316L & Braided Conduit',
        jointType: 'Differential Pitch/Yaw Linkage',
        movement: '2-DOF Smooth Optical Stabilization',
        description:
          'Exposed dual-rod cervical actuator column routing shielded fiber-optic data cables between the cranial sensors and torso compute bus.',
      },
      {
        id: 'torso',
        name: 'Chest assembly',
        category: 'STRUCTURAL CHASSIS & CORE',
        material: 'Carbon-Fiber Monocoque & Titanium Plates',
        jointType: 'Rigid Spine + 2-DOF Waist Gimbal',
        movement: '±30° Torso Twist, ±15° Lean',
        description:
          'Segmented titanium chest armor over an exposed structural frame housing the liquid-cooled neural compute stack and 48V power bus.',
      },
      {
        id: 'shoulders',
        name: 'Shoulder actuators',
        category: 'HIGH-TORQUE ROTARY DRIVES',
        material: 'Polished Aluminum 7075 & Harmonic Steel',
        jointType: '3-DOF Spherical Rotary Stack',
        movement: '180° Flexion, 160° Abduction',
        description:
          'Frameless brushless torque motors coupled to zero-backlash harmonic reducers for smooth, high-payload upper-limb positioning.',
      },
      {
        id: 'arms',
        name: 'Arms',
        category: 'UPPER & FOREARM STRUCTURE',
        material: 'Machined Aluminum & Carbon Struts',
        jointType: 'Rotary Humeral + Dual-Rod Forearm',
        movement: 'Continuous Smooth Trajectory Control',
        description:
          'Open-truss upper arm and forearm housings integrating linear ball-screw actuators and internal tension cables.',
      },
      {
        id: 'hands',
        name: 'Robotic hands',
        category: '5-FINGER DEXTEROUS MANIPULATORS',
        material: 'Titanium Phalanges & Silicone Tactile Pads',
        jointType: '15-DOF Tendon-Driven Articulation',
        movement: 'Individual Finger Flexion & Precision Pinch',
        description:
          'Anthropomorphic 5-finger mechanical hands with segmented phalanges and embedded force-torque fingertip sensors.',
      },
      {
        id: 'joints',
        name: 'Elbow & knee joints',
        category: 'KINEMATIC HINGES',
        material: 'Hardened Steel Bearings & Rubber Bellows',
        jointType: 'Single-Axis High-Load Clevis Hinge',
        movement: '0°–135° Controlled Flexion',
        description:
          'Sealed harmonic-drive rotary joints protected by flexible elastomer bellows to prevent dust ingress during continuous operation.',
      },
      {
        id: 'legs',
        name: 'Hip & knee actuators',
        category: 'BIPEDAL PROPULSION LIMBS',
        material: 'Titanium Thighs & Hydraulic Cylinders',
        jointType: '3-DOF Hip + 1-DOF Knee Actuator',
        movement: 'Dynamic Bipedal Gait & Squat',
        description:
          'High-power electric/hydraulic leg actuators engineered to support full body weight and absorb heel-strike impact.',
      },
      {
        id: 'feet',
        name: 'Ankle mechanisms & feet',
        category: 'GROUND CONTACT STABILIZERS',
        material: 'Forged Aluminum & High-Grip Elastomer',
        jointType: '2-DOF Universal Ankle Linkage',
        movement: '±25° Pitch, ±15° Roll Balance',
        description:
          'Dual-rod parallel ankle actuators paired with split-sole pressure-sensing footplates for active center-of-mass balance.',
      },
    ],
  },
  {
    id: 'industrial_arm',
    name: 'INDUSTRIAL ROBOT ARM',
    type: '6-AXIS ARTICULATED MANIPULATOR',
    shortDescription:
      'Precision multi-jointed robotic arm engineered for smooth, repeatable automated positioning and assembly.',
    educationalInfo:
      'Industrial manipulators use six degrees of freedom (3 positional, 3 rotational) and closed-loop encoder feedback to reach any point within their work envelope with sub-millimeter repeatability.',
    supportsExplodedView: false,
    accentColor: '#38bdf8',
    components: [
      {
        id: 'base',
        name: 'Base',
        category: 'ANCHOR PEDESTAL',
        description:
          'Heavy-duty cast mounting base that absorbs reaction torques and anchors the manipulator to the lab floor.',
      },
      {
        id: 'platform',
        name: 'Rotating platform',
        category: 'WAIST TURRET (J1)',
        description:
          '360-degree slewing ring driven by a high-torque servo motor to orient the entire arm assembly.',
      },
      {
        id: 'arm_segments',
        name: 'Arm segments',
        category: 'LOWER & UPPER BOOMS',
        description:
          'Rigid hollow-cast structural booms engineered for high stiffness-to-weight ratio and minimal deflection.',
      },
      {
        id: 'joints',
        name: 'Joints',
        category: 'SERVO AXES (J2–J5)',
        description:
          'Sealed rotary actuator housings with optical encoders for synchronized multi-axis trajectory control.',
      },
      {
        id: 'gripper',
        name: 'Gripper',
        category: 'PARALLEL END-EFFECTOR',
        description:
          'Electromechanical two-jaw precision gripper designed for safe, controlled demonstration of object grasping.',
      },
    ],
  },
  {
    id: 'exploration',
    name: 'EXPLORATION ROBOT',
    type: 'AUTONOMOUS FIELD ROVER',
    shortDescription:
      'All-terrain planetary and hazardous-environment scout equipped with 6-wheel suspension and mast optics.',
    educationalInfo:
      'Exploration rovers rely on independent wheel-drive motors, elevated mast cameras, and low-center-of-gravity chassis designs to traverse uneven terrain autonomously.',
    supportsExplodedView: false,
    accentColor: '#3b82f6',
    components: [
      {
        id: 'chassis',
        name: 'Chassis',
        category: 'WARM ELECTRONICS BOX',
        description:
          'Insulated structural body protecting power cells, drive controllers, and scientific telemetry computers.',
      },
      {
        id: 'wheels',
        name: 'Wheels',
        category: '6-WHEEL MOBILITY',
        description:
          'Cleated metallic mobility wheels with independent hub motors for climbing obstacles and maintaining traction.',
      },
      {
        id: 'sensors',
        name: 'Sensors',
        category: 'HAZARD AVOIDANCE',
        description:
          'Front-mounted ultrasonic and infrared obstacle-detection arrays scanning the terrain ahead.',
      },
      {
        id: 'camera',
        name: 'Camera',
        category: 'PAN-TILT MAST OPTICS',
        description:
          'Elevated stereo imaging turret providing 360-degree panoramic views and depth reconstruction.',
      },
      {
        id: 'antenna',
        name: 'Antenna',
        category: 'HIGH-GAIN TELEMETRY',
        description:
          'Directional communication mast transmitting scientific data and receiving remote navigation waypoints.',
      },
    ],
  },
  {
    id: 'ai_robot',
    name: 'FUTURISTIC AI ROBOT',
    type: 'COBOT & SPATIAL ASSISTANT',
    shortDescription:
      'Next-generation interactive robotic companion combining expressive holographic optics with agile arms.',
    educationalInfo:
      'Modern AI assistant robots integrate natural-language understanding, computer vision, and compliant actuators to collaborate safely alongside humans.',
    supportsExplodedView: false,
    accentColor: '#a855f7',
    components: [
      {
        id: 'head',
        name: 'Head',
        category: 'EXPRESSIVE VISOR',
        description:
          'Curved glass-composite head housing an adaptive OLED/holographic eye interface for intuitive human interaction.',
      },
      {
        id: 'sensors',
        name: 'Sensors',
        category: 'AMBIENT ARRAY',
        description:
          '360-degree spatial awareness ring detecting user gestures, proximity, and environmental acoustics.',
      },
      {
        id: 'body',
        name: 'Body',
        category: 'AERO-COMPOSITE SHELL',
        description:
          'Streamlined monocoque torso housing a silent magnetic-levitation stabilizer and neural inference module.',
      },
      {
        id: 'arms',
        name: 'Arms',
        category: 'COMPLIANT LIMBS',
        description:
          'Lightweight dual manipulator arms with soft-touch exteriors designed for safe human-robot collaboration.',
      },
      {
        id: 'joints',
        name: 'Joints',
        category: 'MAGNETIC COUPLINGS',
        description:
          'Low-friction spherical joints enabling fluid, lifelike expressive gestures and smooth motion.',
      },
    ],
  },
];
