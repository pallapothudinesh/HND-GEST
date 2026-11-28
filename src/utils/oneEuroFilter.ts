/**
 * 1-Euro Adaptive Low-Pass Filter (Casiez et al., CHI 2012).
 * Provides near-zero lag during rapid hand movements while eliminating
 * micro-jitter when holding a hand steady.
 */
export class OneEuroFilter {
  private minCutoff: number;
  private beta: number;
  private dCutoff: number;
  private xPrev: number | null = null;
  private dxPrev = 0;
  private tPrev: number | null = null;

  constructor(minCutoff = 1.4, beta = 0.045, dCutoff = 1.0) {
    this.minCutoff = minCutoff;
    this.beta = beta;
    this.dCutoff = dCutoff;
  }

  private alpha(cutoff: number, dt: number): number {
    const tau = 1.0 / (2 * Math.PI * cutoff);
    return 1.0 / (1.0 + tau / dt);
  }

  filter(value: number, timestampMs = performance.now()): number {
    if (!Number.isFinite(value)) {
      return this.xPrev ?? 0;
    }

    if (this.xPrev === null || this.tPrev === null) {
      this.xPrev = value;
      this.tPrev = timestampMs;
      return value;
    }

    const dt = Math.max((timestampMs - this.tPrev) / 1000, 1 / 120);
    this.tPrev = Math.max(this.tPrev, timestampMs);

    const dValue = (value - this.xPrev) / dt;
    const aD = this.alpha(this.dCutoff, dt);
    const dxHat = aD * dValue + (1 - aD) * this.dxPrev;
    this.dxPrev = dxHat;

    const cutoff = this.minCutoff + this.beta * Math.abs(dxHat);
    const a = this.alpha(cutoff, dt);
    const xHat = a * value + (1 - a) * this.xPrev;
    this.xPrev = xHat;

    return xHat;
  }

  reset(value?: number): void {
    this.xPrev = value ?? null;
    this.dxPrev = 0;
    this.tPrev = null;
  }
}
