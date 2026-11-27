/**
 * Lightweight procedural Web Audio synthesizer for futuristic UI & gesture feedback.
 * Disabled by default and never autoplays without explicit user toggle/interaction.
 */
class NeuralAudioEngine {
  private ctx: AudioContext | null = null;
  private enabled = false;

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (enabled && !this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (enabled && this.ctx && this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  private playTone(freqStart: number, freqEnd: number, duration: number, gainPeak = 0.045, type: OscillatorType = 'sine'): void {
    if (!this.enabled || !this.ctx) return;
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(freqEnd, 40), now + duration);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(gainPeak, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  playClick(): void {
    this.playTone(760, 1120, 0.08, 0.035, 'sine');
  }

  playSelect(): void {
    this.playTone(520, 980, 0.14, 0.04, 'triangle');
  }

  playTransition(): void {
    this.playTone(220, 440, 0.28, 0.04, 'sine');
  }

  playGesture(type: 'expand' | 'contract' | 'interact'): void {
    if (type === 'expand') {
      this.playTone(320, 680, 0.22, 0.035, 'sine');
    } else if (type === 'contract') {
      this.playTone(520, 180, 0.22, 0.035, 'sine');
    } else {
      this.playTone(640, 820, 0.12, 0.03, 'triangle');
    }
  }
}

export const neuralAudio = new NeuralAudioEngine();
