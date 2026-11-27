export type GestureType =
  | 'NONE'
  | 'OPEN_PALM'
  | 'CLOSED_FIST'
  | 'PINCH'
  | 'POINTING'
  | 'TWO_HANDS'
  | 'THUMBS_UP';

export type CameraStatus =
  | 'idle'
  | 'requesting'
  | 'active'
  | 'denied'
  | 'unavailable'
  | 'error';

export interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

export interface Point2D {
  x: number;
  y: number;
}

export interface HandTrackingState {
  isModelLoading: boolean;
  modelError: string | null;
  detectedHands: number;
  gesture: GestureType;
  gestureLabel: string;
  confidence: number;
  /** Normalized [-1, 1] palm center in screen-aligned coordinates */
  palmPosition: Point2D;
  /** Normalized [0, 1] index fingertip for selection cursor */
  pointerPosition: Point2D;
  /** Normalized distance between two hands when 2 hands are visible */
  twoHandDistance: number;
  /** Continuous [0, 1] component separation progress driven by two-hand distance */
  explosionProgress: number;
  /** Normalized pinch distance between thumb tip & index tip */
  pinchStrength: number;
  /** Raw landmarks for optional preview overlay */
  landmarks: HandLandmark[][];
}
