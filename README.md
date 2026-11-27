# HND GEST — 3D Gesture Control Studio

**Control the digital world with your hands.**

HND GEST (`HND = Hand · GEST = Gesture`) is an interactive 3D spatial computing and exploration web application powered by **React**, **TypeScript**, **Three.js / React Three Fiber**, **MediaPipe Tasks Vision**, **Tailwind CSS**, and **Framer Motion**.

## Features

- **Real-Time Webcam Hand Tracking**: Local in-browser MediaPipe hand landmark detection supporting 1-hand and 2-hand gestures with zero video uploads.
- **Spatial Gesture Controls**:
  - **Open Palm**: Expand energy sphere & particle field
  - **Closed Fist**: Contract energy sphere & particles
  - **Pinch**: Grab & manipulate 3D objects
  - **Left / Right & Up / Down**: Smooth 3D rotation & elevation
  - **Two-Hand Distance**: Continuous real-time 3D exploded-view component separation (`0%–100%`)
  - **Pointing**: Spatial holographic selection cursor
  - **Thumbs Up**: Reset model & camera view
- **Multi-World 3D Exploration Labs**:
  - **Cosmic Universe & Planets** (`NOVA`, `ORBIT`, `QUANTUM`, `ECLIPSE`)
  - **Robotics Lab** (PBR Engineering-Prototype Humanoid Robot with 5-finger hands, 6-Axis Industrial Robot Arm, Exploration Rover, Futuristic AI Robot)
  - **Automotive Lab** (Realistic PBR GLB automobile with 51-mesh hierarchical exploded view & Interior Cockpit transition)
  - **Armor Lab**, **Engineering Engine Lab**, **Space Exploration**, **Science Lab**, **Digital Art**, and **Future Technology**
- **Light Mode, Dark Mode & System Default**: Instant, zero-flash theme switching persisted in `localStorage`.

## Local Development

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

---

✦ CREATED BY DINESH ✦
