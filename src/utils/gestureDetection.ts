import { GestureType, HandLandmark, Point2D } from '../types/gestures';
import { clamp } from './smoothing';

function distance2D(a: HandLandmark, b: HandLandmark): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

/**
 * Determines whether a finger is extended relative to the wrist and its MCP/PIP joints.
 * Works across hand rotations and scales by normalizing against palm size.
 */
function isFingerExtended(
  landmarks: HandLandmark[],
  tipIdx: number,
  pipIdx: number,
  mcpIdx: number
): boolean {
  const wrist = landmarks[0];
  const tip = landmarks[tipIdx];
  const pip = landmarks[pipIdx];
  const mcp = landmarks[mcpIdx];

  const tipToWrist = distance2D(tip, wrist);
  const pipToWrist = distance2D(pip, wrist);
  const mcpToWrist = distance2D(mcp, wrist);

  return tipToWrist > pipToWrist * 1.05 && tipToWrist > mcpToWrist * 1.15;
}

/**
 * Thumb extension check using distance from thumb tip (4) to pinky MCP (17)
 * normalized by palm width (index MCP 5 to pinky MCP 17).
 */
function isThumbExtended(landmarks: HandLandmark[]): boolean {
  const palmWidth = Math.max(distance2D(landmarks[5], landmarks[17]), 0.04);
  const thumbToPinkyMcp = distance2D(landmarks[4], landmarks[17]);
  const thumbIpToPinkyMcp = distance2D(landmarks[3], landmarks[17]);
  return thumbToPinkyMcp > palmWidth * 1.05 && thumbToPinkyMcp > thumbIpToPinkyMcp;
}

export interface RawGestureResult {
  gesture: GestureType;
  confidence: number;
  palmPosition: Point2D;
  pointerPosition: Point2D;
  pinchStrength: number;
  twoHandDistance: number;
}

/**
 * Classifies single-hand or two-hand gestures from MediaPipe 21-point landmarks.
 * Note: MediaPipe x is [0..1] from left to right of raw camera image; we mirror X
 * so moving the user's hand right moves the cursor/scene right naturally.
 */
export function classifyHandLandmarks(hands: HandLandmark[][]): RawGestureResult {
  if (!hands || hands.length === 0) {
    return {
      gesture: 'NONE',
      confidence: 0,
      palmPosition: { x: 0, y: 0 },
      pointerPosition: { x: 0.5, y: 0.5 },
      pinchStrength: 0,
      twoHandDistance: 0.4,
    };
  }

  const primary = hands[0];
  const wrist = primary[0];
  const middleMcp = primary[9];

  // Palm center averaged between wrist and middle MCP, mirrored on X for natural UX
  const rawPalmX = (wrist.x + middleMcp.x) * 0.5;
  const rawPalmY = (wrist.y + middleMcp.y) * 0.5;
  const mirroredPalmX = 1 - rawPalmX;

  // Map [0, 1] -> [-1, 1]
  const palmPosition: Point2D = {
    x: clamp((mirroredPalmX - 0.5) * 2, -1, 1),
    y: clamp((0.5 - rawPalmY) * 2, -1, 1),
  };

  const indexTip = primary[8];
  const pointerPosition: Point2D = {
    x: clamp(1 - indexTip.x, 0, 1),
    y: clamp(indexTip.y, 0, 1),
  };

  const palmSize = Math.max(distance2D(wrist, middleMcp), 0.05);
  const pinchDist = distance2D(primary[4], primary[8]) / palmSize;
  const pinchStrength = clamp(1 - (pinchDist - 0.18) / 0.45, 0, 1);

  // Two-hand scaling takes priority when 2 hands are clearly visible
  if (hands.length >= 2) {
    const second = hands[1];
    const p1 = {
      x: (hands[0][0].x + hands[0][9].x) * 0.5,
      y: (hands[0][0].y + hands[0][9].y) * 0.5,
    };
    const p2 = {
      x: (second[0].x + second[9].x) * 0.5,
      y: (second[0].y + second[9].y) * 0.5,
    };
    const twoHandDistance = clamp(Math.hypot(p1.x - p2.x, p1.y - p2.y), 0.1, 0.9);
    return {
      gesture: 'TWO_HANDS',
      confidence: 0.94,
      palmPosition,
      pointerPosition,
      pinchStrength,
      twoHandDistance,
    };
  }

  const thumbOpen = isThumbExtended(primary);
  const indexOpen = isFingerExtended(primary, 8, 6, 5);
  const middleOpen = isFingerExtended(primary, 12, 10, 9);
  const ringOpen = isFingerExtended(primary, 16, 14, 13);
  const pinkyOpen = isFingerExtended(primary, 20, 18, 17);

  const extendedCount =
    (thumbOpen ? 1 : 0) +
    (indexOpen ? 1 : 0) +
    (middleOpen ? 1 : 0) +
    (ringOpen ? 1 : 0) +
    (pinkyOpen ? 1 : 0);

  // 1. Pinch: thumb & index close together while at least one other finger is open (prevents CLOSED_FIST conflict)
  if (pinchDist < 0.36 && (middleOpen || ringOpen || pinkyOpen)) {
    return {
      gesture: 'PINCH',
      confidence: clamp(0.75 + pinchStrength * 0.25, 0, 1),
      palmPosition,
      pointerPosition,
      pinchStrength,
      twoHandDistance: 0.4,
    };
  }

  // 2. Pointing: only index finger extended
  if (indexOpen && !middleOpen && !ringOpen && !pinkyOpen) {
    return {
      gesture: 'POINTING',
      confidence: 0.9,
      palmPosition,
      pointerPosition,
      pinchStrength,
      twoHandDistance: 0.4,
    };
  }

  // 3. Thumbs Up: thumb extended upward while all 4 other fingers are folded
  const thumbPointingUp = primary[4].y < primary[2].y - 0.04 && primary[4].y < primary[5].y;
  if (thumbOpen && thumbPointingUp && !indexOpen && !middleOpen && !ringOpen && !pinkyOpen) {
    return {
      gesture: 'THUMBS_UP',
      confidence: 0.91,
      palmPosition,
      pointerPosition,
      pinchStrength,
      twoHandDistance: 0.4,
    };
  }

  // 4. Open Palm: 4 or 5 fingers extended
  if (extendedCount >= 4 && indexOpen && middleOpen && ringOpen) {
    return {
      gesture: 'OPEN_PALM',
      confidence: 0.92,
      palmPosition,
      pointerPosition,
      pinchStrength,
      twoHandDistance: 0.4,
    };
  }

  // 4. Closed Fist: 0 or 1 fingers extended (and not pointing)
  if (extendedCount <= 1 && !indexOpen && !middleOpen && !ringOpen && !pinkyOpen) {
    return {
      gesture: 'CLOSED_FIST',
      confidence: 0.9,
      palmPosition,
      pointerPosition,
      pinchStrength,
      twoHandDistance: 0.4,
    };
  }

  return {
    gesture: 'NONE',
    confidence: 0.5,
    palmPosition,
    pointerPosition,
    pinchStrength,
    twoHandDistance: 0.4,
  };
}

/**
 * Hysteresis stabilizer to prevent rapid flickering between gestures.
 */
export class GestureStabilizer {
  private stableGesture: GestureType = 'NONE';
  private candidateGesture: GestureType = 'NONE';
  private candidateFrames = 0;
  private readonly requiredFrames: number;

  constructor(requiredFrames = 4) {
    this.requiredFrames = requiredFrames;
  }

  update(nextGesture: GestureType): GestureType {
    if (nextGesture === this.stableGesture) {
      this.candidateGesture = nextGesture;
      this.candidateFrames = 0;
      return this.stableGesture;
    }

    if (nextGesture === this.candidateGesture) {
      this.candidateFrames += 1;
      if (this.candidateFrames >= this.requiredFrames) {
        this.stableGesture = nextGesture;
        this.candidateFrames = 0;
      }
    } else {
      this.candidateGesture = nextGesture;
      this.candidateFrames = 1;
    }

    return this.stableGesture;
  }

  reset(): void {
    this.stableGesture = 'NONE';
    this.candidateGesture = 'NONE';
    this.candidateFrames = 0;
  }
}
