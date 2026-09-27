/**
 * Web Audio API synthesizer for OBS Studio and TikTok Live broadcast.
 * Zero external audio file dependency - generates 100% clean, latency-free synthesized sounds.
 * Supports customizable Sound Themes: Modern (Crystal Studio), Arcade (8-Bit Chiptune), Retro (Lo-Fi Analog Synth).
 */

import { SoundTheme, SoundThemeInfo } from '../types';

export const SOUND_THEMES: SoundThemeInfo[] = [
  {
    id: 'modern',
    name: 'Modern Studio',
    tagline: 'Crystal Audio & Digital Hi-Fi',
    icon: '💎',
    description: 'Crystal-clear modern harmonic sound with elegant high-fidelity acoustic tones.'
  },
  {
    id: 'arcade',
    name: 'Arcade 8-Bit',
    tagline: 'Chiptune & Retro Gameboy',
    icon: '👾',
    description: 'Punchy square waves inspired by retro arcade cabinets, Mario Bros, and 8-bit consoles.'
  },
  {
    id: 'retro',
    name: 'Lo-Fi Analog',
    tagline: 'Vintage Synth & Tape Saturation',
    icon: '📻',
    description: 'Warm 80s synthesizer tones with analog brass filters and lo-fi tape warmth.'
  }
];

class SoundEffectsService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.8;
  private currentTheme: SoundTheme = 'modern';

  constructor() {
    // Restore saved theme from local storage
    try {
      const savedTheme = localStorage.getItem('ls_sound_theme') as SoundTheme;
      if (savedTheme && (savedTheme === 'modern' || savedTheme === 'arcade' || savedTheme === 'retro')) {
        this.currentTheme = savedTheme;
      }
    } catch {}
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public getTheme(): SoundTheme {
    return this.currentTheme;
  }

  public setTheme(theme: SoundTheme) {
    this.currentTheme = theme;
    try {
      localStorage.setItem('ls_sound_theme', theme);
    } catch {}
    this.previewTheme(theme);
  }

  public toggleNextTheme(): SoundTheme {
    const order: SoundTheme[] = ['modern', 'arcade', 'retro'];
    const nextIdx = (order.indexOf(this.currentTheme) + 1) % order.length;
    const nextTheme = order[nextIdx];
    this.setTheme(nextTheme);
    return nextTheme;
  }

  public getAvailableThemes(): SoundThemeInfo[] {
    return SOUND_THEMES;
  }

  /**
   * Preview sound for theme change
   */
  public previewTheme(theme: SoundTheme) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      if (theme === 'arcade') {
        // Quick 8-bit coin jump
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(987.77, now); // B5
        osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6
        gain.gain.setValueAtTime(this.volume * 0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.32);
      } else if (theme === 'retro') {
        // Warm lo-fi brass chord
        [220, 277.18, 329.63].forEach((f) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const filter = this.ctx.createBiquadFilter();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(f, now);
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(900, now);
          filter.frequency.exponentialRampToValueAtTime(300, now + 0.4);
          gain.gain.setValueAtTime(this.volume * 0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.5);
        });
      } else {
        // Modern crystal chime
        this.playDing();
      }
    } catch {}
  }

  /**
   * Harmonic bell / "DING" for correct answer
   */
  public playDing() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      if (this.currentTheme === 'arcade') {
        // 8-Bit Chiptune Coin Ping
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(987.77, now); // B5
        osc.frequency.setValueAtTime(1318.51, now + 0.09); // E6
        gain.gain.setValueAtTime(this.volume * 0.38, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.5);
        return;
      }

      if (this.currentTheme === 'retro') {
        // Vintage 80s analog synth bell
        const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        freqs.forEach((f, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const filter = this.ctx.createBiquadFilter();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, now);
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(1400, now);
          filter.frequency.exponentialRampToValueAtTime(400, now + 0.8);
          gain.gain.setValueAtTime(this.volume * (0.35 / (idx + 1)), now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.95);
        });
        return;
      }

      // Default: Modern Studio Crystal Bell
      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(this.volume, now);
      masterGain.connect(this.ctx.destination);

      const freqs = [1046.5, 2093.0, 3135.96, 4186.0]; // C6, C7, G7, C8
      const gains = [0.4, 0.25, 0.15, 0.08];

      freqs.forEach((f, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = idx === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(f, now);
        gain.gain.setValueAtTime(gains[idx], now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2 + idx * 0.1);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 1.5);
      });
    } catch {}
  }

  /**
   * Click / Tap UI sound
   */
  public playClick() {
    this.playRatchetTick(1.2);
  }

  /**
   * Mechanical ratchet tick sound for spinner wheel peg hit
   */
  public playRatchetTick(pitchVariation: number = 1) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      if (this.currentTheme === 'arcade') {
        // 8-bit short blip
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(520 * pitchVariation, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.025);
        gain.gain.setValueAtTime(this.volume * 0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.035);
        return;
      }

      if (this.currentTheme === 'retro') {
        // Lo-fi woodblock click
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320 * pitchVariation, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.04);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(this.volume * 0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
        return;
      }

      // Modern
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(800, now);
      osc.type = 'sawtooth';
      const baseFreq = 380 * pitchVariation;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.035);
      gain.gain.setValueAtTime(this.volume * 0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.045);
    } catch {}
  }

  /**
   * Heartbeat / countdown beep
   */
  public playCountdownTick(isUrgent: boolean = false) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      if (this.currentTheme === 'arcade') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(isUrgent ? 1046.5 : 783.99, now);
        osc.frequency.setValueAtTime(isUrgent ? 523.25 : 392.0, now + 0.05);
        gain.gain.setValueAtTime(this.volume * 0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      } else if (this.currentTheme === 'retro') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(isUrgent ? 587.33 : 440, now);
        osc.frequency.exponentialRampToValueAtTime(isUrgent ? 293.66 : 220, now + 0.08);
        gain.gain.setValueAtTime(this.volume * 0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      } else {
        osc.type = isUrgent ? 'square' : 'sine';
        osc.frequency.setValueAtTime(isUrgent ? 880 : 660, now);
        osc.frequency.exponentialRampToValueAtTime(isUrgent ? 440 : 330, now + 0.09);
        gain.gain.setValueAtTime(this.volume * (isUrgent ? 0.45 : 0.25), now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      }

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.11);
    } catch {}
  }

  /**
   * Time up buzzer
   */
  public playTimeUp() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      if (this.currentTheme === 'arcade') {
        // 8-bit classic defeat buzz
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.setValueAtTime(110, now + 0.1);
        osc.frequency.setValueAtTime(80, now + 0.25);
        gain.gain.setValueAtTime(this.volume * 0.45, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      } else if (this.currentTheme === 'retro') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(70, now + 0.5);
        gain.gain.setValueAtTime(this.volume * 0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.linearRampToValueAtTime(120, now + 0.4);
        gain.gain.setValueAtTime(this.volume * 0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      }

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.5);
    } catch {}
  }

  /**
   * Bocoran (Hint) chime
   */
  public playBocoranChime() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const freqs = [587.33, 880.0, 1174.66]; // D5, A5, D6
      freqs.forEach((f, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = this.currentTheme === 'arcade' ? 'square' : 'sine';
        osc.frequency.setValueAtTime(f, now + idx * 0.08);
        gain.gain.setValueAtTime(0, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(this.volume * 0.3, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.4);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.45);
      });
    } catch {}
  }

  /**
   * Ambient spinning swoosh for the wheel
   */
  public playWheelSpin(durationMs: number = 3000) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const durSec = durationMs / 1000;

      // Low frequency hum
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = this.currentTheme === 'arcade' ? 'square' : 'triangle';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + durSec);

      gain.gain.setValueAtTime(this.volume * 0.15, now);
      gain.gain.linearRampToValueAtTime(this.volume * 0.22, now + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + durSec);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + durSec + 0.05);
    } catch {}
  }

  /**
   * Festive Victory Fanfare (Meriah & Semarak untuk Hadiah Pemenang)
   */
  public playVictoryFanfare() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(this.volume, now);
      masterGain.connect(this.ctx.destination);

      // 1. Festive Brass Fanfare Chords & Melodies
      // Sequence: Triumphal trumpet call -> ascending royal chords -> grand celebration finale chord
      const brassNotes: Array<{ f: number; time: number; dur: number; type?: OscillatorType; gain?: number }> = [
        // Intro trumpet call
        { f: 523.25, time: 0.00, dur: 0.12, type: 'sawtooth', gain: 0.35 }, // C5
        { f: 659.25, time: 0.12, dur: 0.12, type: 'sawtooth', gain: 0.35 }, // E5
        { f: 783.99, time: 0.24, dur: 0.14, type: 'sawtooth', gain: 0.40 }, // G5
        { f: 1046.50, time: 0.38, dur: 0.28, type: 'sawtooth', gain: 0.45 }, // C6

        // Rhythmic accent
        { f: 880.00, time: 0.70, dur: 0.10, type: 'sawtooth', gain: 0.35 }, // A5
        { f: 987.77, time: 0.82, dur: 0.10, type: 'sawtooth', gain: 0.38 }, // B5
        { f: 1046.50, time: 0.94, dur: 0.14, type: 'sawtooth', gain: 0.42 }, // C6
        { f: 1318.51, time: 1.10, dur: 0.32, type: 'sawtooth', gain: 0.45 }, // E6

        // Grand Triumphal Finale Chord (C Major Grand Royal Chord sustained)
        { f: 261.63, time: 1.45, dur: 1.10, type: 'triangle', gain: 0.40 }, // C4 (bass foundation)
        { f: 523.25, time: 1.45, dur: 1.10, type: 'sawtooth', gain: 0.35 }, // C5
        { f: 659.25, time: 1.45, dur: 1.10, type: 'sawtooth', gain: 0.35 }, // E5
        { f: 783.99, time: 1.45, dur: 1.10, type: 'sawtooth', gain: 0.35 }, // G5
        { f: 1046.50, time: 1.45, dur: 1.20, type: 'sawtooth', gain: 0.45 }, // C6
        { f: 1318.51, time: 1.45, dur: 1.20, type: 'sine', gain: 0.30 },     // E6
        { f: 1567.98, time: 1.45, dur: 1.20, type: 'sine', gain: 0.25 },     // G6
        { f: 2093.00, time: 1.45, dur: 1.30, type: 'sine', gain: 0.20 }      // C7 top shine
      ];

      brassNotes.forEach((n) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = n.type || 'sawtooth';
        osc.frequency.setValueAtTime(n.f, now + n.time);

        // Brass filter brightness envelope
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1800, now + n.time);
        filter.frequency.linearRampToValueAtTime(3200, now + n.time + n.dur * 0.3);
        filter.frequency.exponentialRampToValueAtTime(1200, now + n.time + n.dur);

        const peakGain = (n.gain || 0.35);
        noteGain.gain.setValueAtTime(0.001, now + n.time);
        noteGain.gain.linearRampToValueAtTime(peakGain, now + n.time + 0.03);
        noteGain.gain.setValueAtTime(peakGain, now + n.time + n.dur * 0.7);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + n.time + n.dur);

        osc.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(masterGain);

        osc.start(now + n.time);
        osc.stop(now + n.time + n.dur + 0.05);
      });

      // 2. Festive Victory Glitter Chimes (Cascading Sparkle Bells)
      const sparklePitches = [1046.5, 1318.5, 1567.9, 2093.0, 2637.0, 3135.9];
      sparklePitches.forEach((pitch, i) => {
        if (!this.ctx) return;
        const t = now + 1.55 + i * 0.06;
        const chimeOsc = this.ctx.createOscillator();
        const chimeGain = this.ctx.createGain();
        chimeOsc.type = 'sine';
        chimeOsc.frequency.setValueAtTime(pitch, t);

        chimeGain.gain.setValueAtTime(0.001, t);
        chimeGain.gain.linearRampToValueAtTime(0.18, t + 0.015);
        chimeGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);

        chimeOsc.connect(chimeGain);
        chimeGain.connect(masterGain);
        chimeOsc.start(t);
        chimeOsc.stop(t + 0.46);
      });

      // 3. Cheerful Crowd Applause / Celebration Whoosh Swell
      try {
        const bufferSize = this.ctx.sampleRate * 2.2;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 1.8));
        }

        const whiteNoise = this.ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;

        const applauseFilter = this.ctx.createBiquadFilter();
        applauseFilter.type = 'bandpass';
        applauseFilter.frequency.setValueAtTime(1400, now + 0.3);
        applauseFilter.Q.setValueAtTime(1.2, now + 0.3);

        const applauseGain = this.ctx.createGain();
        applauseGain.gain.setValueAtTime(0.001, now + 0.2);
        applauseGain.gain.linearRampToValueAtTime(0.18, now + 1.0);
        applauseGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

        whiteNoise.connect(applauseFilter);
        applauseFilter.connect(applauseGain);
        applauseGain.connect(masterGain);

        whiteNoise.start(now + 0.2);
        whiteNoise.stop(now + 2.6);
      } catch {}
    } catch {}
  }

  /**
   * Alias for victory fanfare
   */
  public playWinnerFanfare() {
    this.playVictoryFanfare();
  }

  public playWinner() {
    this.playVictoryFanfare();
  }

  public playAlert() {
    this.playCountdownTick(true);
  }

  public playDrumroll() {
    this.playShuffleSound();
  }

  /**
   * Alias for wrong / buzzer / error sound
   */
  public playWrong() {
    this.playTimeUp();
  }

  /**
   * Dramatic reveal swoosh & ta-da
   */
  public playPlotTwistReveal() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const chords = [329.63, 415.3, 493.88, 659.25];
      chords.forEach((f) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = this.currentTheme === 'arcade' ? 'square' : 'sawtooth';
        osc.frequency.setValueAtTime(f, now);
        osc.frequency.exponentialRampToValueAtTime(f * 1.5, now + 0.4);
        gain.gain.setValueAtTime(this.volume * 0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.75);
      });

      setTimeout(() => {
        this.playVictoryFanfare();
      }, 350);
    } catch {}
  }

  /**
   * Crisp shuffle whoosh / flutter sound effect
   */
  public playShuffleSound() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      if (this.currentTheme === 'arcade') {
        // 8-bit slot reel shuffle
        [440, 660, 880, 1100, 1320].forEach((freq, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(freq, now + idx * 0.03);
          gain.gain.setValueAtTime(this.volume * 0.25, now + idx * 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.03 + 0.04);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + idx * 0.03);
          osc.stop(now + idx * 0.03 + 0.05);
        });
        return;
      }

      if (this.currentTheme === 'retro') {
        // Cassette tape quick flutter
        [300, 450, 600, 750].forEach((freq, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const filter = this.ctx.createBiquadFilter();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.04);
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(900, now + idx * 0.04);
          gain.gain.setValueAtTime(this.volume * 0.25, now + idx * 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.07);
          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + idx * 0.04);
          osc.stop(now + idx * 0.04 + 0.08);
        });
        return;
      }

      // Modern
      [520, 680, 840, 1020].forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.3, now + idx * 0.04 + 0.08);
        gain.gain.setValueAtTime(this.volume * 0.18, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.09);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.1);
      });
    } catch {}
  }
}

export const sound = new SoundEffectsService();

export const playClick = () => sound.playClick();
export const playTick = () => sound.playRatchetTick();
export const playWinnerFanfare = () => sound.playVictoryFanfare();

