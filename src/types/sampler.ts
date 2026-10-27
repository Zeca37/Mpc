export type BankId = 0 | 1 | 2 | 3; // Bank A, B, C, D

export interface PadConfig {
  id: number; // 0 to 15
  name: string;
  category: 'kick' | 'snare' | 'clap' | 'hihat' | 'percussion' | 'bass' | 'chord' | 'vocal' | 'fx';
  color: string;
  keyLabel: string;
  keyCode: string;
  volume: number; // 0 to 1
  pan: number; // -1 to 1
  tune: number; // semitones -24 to +24
  trimStart: number; // 0 to 1
  trimEnd: number; // 0 to 1
  reversed: boolean;
  chokeGroup?: number; // e.g. 1 for hi-hats
  loop: boolean;
  customBuffer?: AudioBuffer;
}

export interface BankConfig {
  id: BankId;
  name: string;
  genre: string;
  pads: PadConfig[];
}

export type PlayMode = 'normal' | '16-levels-tune' | '16-levels-vel' | 'mute' | 'solo';

export interface FXSettings {
  filterType: 'lowpass' | 'highpass';
  filterCutoff: number; // 100Hz to 16000Hz
  filterResonance: number; // 0.1 to 15
  filterEnabled: boolean;

  driveAmount: number; // 0 to 1 (saturation/distortion)
  driveEnabled: boolean;
  vinylCrackle: number; // 0 to 1

  delayTime: number; // 0.05s to 0.8s
  delayFeedback: number; // 0 to 0.85
  delayMix: number; // 0 to 1
  delayEnabled: boolean;

  reverbSize: number; // 0.1 to 1
  reverbMix: number; // 0 to 1
  reverbEnabled: boolean;

  masterGain: number; // 0 to 1.5
  compressorPunch: boolean;
}

export interface SequencerStep {
  active: boolean;
  velocity: number; // 0.1 to 1.0
}

// 16 pads x 16 steps per pattern
export type PatternData = SequencerStep[][];

export interface PatternPreset {
  id: string;
  name: string;
  bpm: number;
  bank: BankId;
  description: string;
  pattern: boolean[][]; // boolean[padIdx][stepIdx]
}
