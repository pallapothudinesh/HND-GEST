export function lerp(current: number, target: number, factor: number): number {
  return current + (target - current) * factor;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Exponential moving average smoother for 1D values, resilient to variable frame rates.
 */
export function damp(current: number, target: number, lambda: number, dt: number): number {
  return lerp(current, target, 1 - Math.exp(-lambda * dt));
}

export class ValueSmoother {
  private value: number;
  private readonly alpha: number;

  constructor(initialValue = 0, alpha = 0.25) {
    this.value = initialValue;
    this.alpha = alpha;
  }

  update(nextValue: number): number {
    this.value = lerp(this.value, nextValue, this.alpha);
    return this.value;
  }

  get current(): number {
    return this.value;
  }

  reset(value = 0): void {
    this.value = value;
  }
}
