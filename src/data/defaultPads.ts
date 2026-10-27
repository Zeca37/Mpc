import { BankConfig, PatternPreset } from '../types/sampler';

export const KEY_MAPPINGS: { label: string; code: string }[] = [
  // Row 4 (Bottom: Pads 0, 1, 2, 3)
  { label: 'Z', code: 'KeyZ' },
  { label: 'X', code: 'KeyX' },
  { label: 'C', code: 'KeyC' },
  { label: 'V', code: 'KeyV' },
  // Row 3 (Pads 4, 5, 6, 7)
  { label: 'A', code: 'KeyA' },
  { label: 'S', code: 'KeyS' },
  { label: 'D', code: 'KeyD' },
  { label: 'F', code: 'KeyF' },
  // Row 2 (Pads 8, 9, 10, 11)
  { label: 'Q', code: 'KeyQ' },
  { label: 'W', code: 'KeyW' },
  { label: 'E', code: 'KeyE' },
  { label: 'R', code: 'KeyR' },
  // Row 1 (Top: Pads 12, 13, 14, 15)
  { label: '1', code: 'Digit1' },
  { label: '2', code: 'Digit2' },
  { label: '3', code: 'Digit3' },
  { label: '4', code: 'Digit4' },
];

export const DEFAULT_BANKS: BankConfig[] = [
  {
    id: 0,
    name: 'BANK A',
    genre: 'SUPREME BOOM-BAP',
    pads: [
      { id: 0, name: 'Acoustic Kick', category: 'kick', color: '#ff2a44', keyLabel: 'Z', keyCode: 'KeyZ', volume: 1.0, pan: 0, tune: 0, trimStart: 0, trimEnd: 1, reversed: false, loop: false },
      { id: 1, name: 'Sub 808 Thump', category: 'bass', color: '#ff4d6d', keyLabel: 'X', keyCode: 'KeyX', volume: 0.95, pan: 0, tune: 0, trimStart: 0, trimEnd: 1, reversed: false, loop: false },
      { id: 2, name: 'Crispy Snare', category: 'snare', color: '#ff758f', keyLabel: 'C', keyCode: 'KeyC', volume: 0.95, pan: 0, tune: 0, trimStart: 0, trimEnd: 1, reversed: false, loop: false },
      { id: 3, name: 'Wood Rimshot', category: 'percussion', color: '#f72585', keyLabel: 'V', keyCode: 'KeyV', volume: 0.9, pan: 0.1, tune: 0, trimStart: 0, trimEnd: 1, reversed: false, loop: false },

      { id: 4, name: 'Golden Clap', category: 'clap', color: '#e63946', keyLabel: 'A', keyCode: 'KeyA', volume: 0.9, pan: -0.1, tune: 0, trimStart: 0, trimEnd: 1, reversed: false, loop: false },
      { id: 5, name: 'Tight Hat Clsd', category: 'hihat', color: '#f77f00', keyLabel: 'S', keyCode: 'KeyS', volume: 0.85, pan: -0.2, tune: 0, trimStart: 0, trimEnd: 1, reversed: false, chokeGroup: 1, loop: false },
      { id: 6, name: 'Sizzle Hat Open', category: 'hihat', color: '#fcbf49', keyLabel: 'D', keyCode: 'KeyD', volume: 0.8, pan: 0.25, tune: 0, trimStart: 0, trimEnd: 1, reversed: false, chokeGroup: 1, loop: false },
      { id: 7, name: 'Shaker Groove', category: 'percussion', color: '#ffb703', keyLabel: 'F', keyCode: 'KeyF', volume: 0.75, pan: 0.3, tune: 0, trimStart: 0, trimEnd: 1, reversed: false, loop: false },

      { id: 8, name: 'Vinyl Scratch', category: 'fx', color: '#7209b7', keyLabel: 'Q', keyCode: 'KeyQ', volume: 0.85, pan: -0.15, tune: 0, trimStart: 0, trimEnd: 1, reversed: false, loop: false },
      { id: 9, name: 'Vox "Yeah!"', category: 'vocal', color: '#b5179e', keyLabel: 'W', keyCode: 'KeyW', volume: 0.9, pan: 0, tune: 0, trimStart: 0, trimEnd: 1, reversed: false, loop: false },
      { id: 10, name: 'Vox "SUPREME"', category: 'vocal', color: '#d90429', keyLabel: 'E', keyCode: 'KeyE', volume: 0.95, pan: 0, tune: 0, trimStart: 0, trimEnd: 1, reversed: false, loop: false },
      { id: 11, name: 'Rhodes Em9', category: 'chord', color: '#4361ee', keyLabel: 'R', keyCode: 'KeyR', volume: 0.85, pan: 0.1, tune: 0, trimStart: 0, trimEnd: 1, reversed: false, loop: false },

      { id: 12, name: 'Brass Horn Stab', category: 'chord', color: '#3a0ca3', keyLabel: '1', keyCode: 'Digit1', volume: 0.85, pan: 0, tune: 0, trimStart: 0, trimEnd: 1, reversed: false, loop: false },
      { id: 13, name: 'Sub Bass Glide', category: 'bass', color: '#0077b6', keyLabel: '2', keyCode: 'Digit2', volume: 0.9, pan: 0, tune: 0, trimStart: 0, trimEnd: 1, reversed: false, loop: false },
      { id: 14, name: 'Boom Crash', category: 'percussion', color: '#48cae4', keyLabel: '3', keyCode: 'Digit3', volume: 0.8, pan: 0.2, tune: 0, trimStart: 0, trimEnd: 1, reversed: false, loop: false },
      { id: 15, name: 'Laser FX', category: 'fx', color: '#06d6a0', keyLabel: '4', keyCode: 'Digit4', volume: 0.75, pan: -0.2, tune: 0, trimStart: 0, trimEnd: 1, reversed: false, loop: false },
    ],
  },
  {
    id: 1,
    name: 'BANK B',
    genre: 'TRAP & DRILL 2026',
    pads: [
      { id: 0, name: 'Sub 808 Long', category: 'bass', color: '#d90429', keyLabel: 'Z', keyCode: 'KeyZ', volume: 1.0, pan: 0, tune: 0, trimStart: 0, trimEnd: 1, reversed: false, loop: false },
      { id: 1, name: 'Spinz Kick', category: 'kick', color: '#ef233c', keyLabel: 'X', keyCode: 'KeyX', volume: 1.0, pan: 0, tune: 0, trimStart: 0, trimEnd: 1, reversed: false, loop: false },
      { id: 2, name: 'Drill Snare', category: 'snare', color: '#ff4d6d', keyLabel: 'C', keyCode: 'KeyC', volume: 0.95, pan: 0, tune: 0, trimStart: 0, trimEnd: 1, reversed: false, loop: false },
      { id: 3, name: 'Metro Clap', category: 'clap', color: '#f72585', keyLabel: 'V', keyCode: 'KeyV', volume: 0.95, pan: 0, tune: 0, trimStart: 0, trimEnd: 1, reversed: false, loop: false },

      { id: 4, name: 'Trap Hat Fast', category: 'hihat', color: '#f77f00', keyLabel: 'A', keyCode: 'KeyA', volume: 0.85, pan: -0.15, tune: 0, trimStart: 0, trimEnd: 1, reversed: false, chokeGroup: 1, loop: false },
      { id: 5, name: 'Hat Roll Triplet', category: 'hihat', color: '#fcbf49', keyLabel: 'S', keyCode: 'KeyS', volume: 0.85, pan: 0.15, tune: 2, trimStart: 0, trimEnd: 1, reversed: false, chokeGroup: 1, loop: false },
      { id: 6, name: '808 Cowbell', category: 'percussion', color: '#ffb703', keyLabel: 'D', keyCode: 'KeyD', volume: 0.85, pan: 0.1, tune: 0, trimStart: 0, trimEnd: 1, reversed: false, loop: false },
      { id: 7, name: 'Chant "Hey!"', category: 'vocal', color: '#b5179e', keyLabel: 'F', keyCode: 'KeyF', volume: 0.9, pan: 0, tune: 0, trimStart: 0, trimEnd: 1, reversed: false, loop: false },

      { id: 8, name: 'Glass Chime', category: 'chord', color: '#4cc9f0', keyLabel: 'Q', keyCode: 'KeyQ', volume: 0.8, pan: -0.2, tune: 0, trimStart: 0, trimEnd: 1, reversed: false, loop: false },
      { id: 9, name: 'Flute Chop', category: 'chord', color: '#4361ee', keyLabel: 'W', keyCode: 'KeyW', volume: 0.85, pan: 0.2, tune: 0, trimStart: 0, trimEnd: 1, reversed: false, loop: false },
      { id: 10, name: 'Sub Drop FX', category: 'bass', color: '#7209b7', keyLabel: 'E', keyCode: 'KeyE', volume: 0.9, pan: 0, tune: -4, trimStart: 0, trimEnd: 1, reversed: false, loop: false },
      { id: 11, name: 'Horn Blast', category: 'chord', color: '#560bad', keyLabel: 'R', keyCode: 'KeyR', volume: 0.85, pan: 0, tune: 0, trimStart: 0, trimEnd: 1, reversed: false, loop: false },

      { id: 12, name: 'Siren Whistle', category: 'fx', color: '#f72585', keyLabel: '1', keyCode: 'Digit1', volume: 0.75, pan: -0.1, tune: 0, trimStart: 0, trimEnd: 1, reversed: false, loop: false },
      { id: 13, name: 'Reverse Riser', category: 'fx', color: '#b5179e', keyLabel: '2', keyCode: 'Digit2', volume: 0.8, pan: 0.1, tune: 0, trimStart: 0, trimEnd: 1, reversed: false, loop: false },
      { id: 14, name: 'Vox "Woo!"', category: 'vocal', color: '#d90429', keyLabel: '3', keyCode: 'Digit3', volume: 0.9, pan: 0, tune: 0, trimStart: 0, trimEnd: 1, reversed: false, loop: false },
      { id: 15, name: 'Trap Crash', category: 'percussion', color: '#00b4d8', keyLabel: '4', keyCode: 'Digit4', volume: 0.8, pan: 0.25, tune: 0, trimStart: 0, trimEnd: 1, reversed: false, loop: false },
    ],
  },
  {
    id: 2,
    name: 'BANK C',
    genre: 'LO-FI & NEO SOUL',
    pads: [
      { id: 0, name: 'Muffled Kick', category: 'kick', color: '#e07a5f', keyLabel: 'Z', keyCode: 'KeyZ', volume: 0.95, pan: 0, tune: -2, trimStart: 0, trimEnd: 1, reversed: false, loop: false },
      { id: 1, name: 'Dusty Snare', category: 'snare', color: '#f4a261', keyLabel: 'X', keyCode: 'KeyX', volume: 0.9, pan: 0, tune: 0, trimStart: 0, trimEnd: 1, reversed: false, loop: false },
      { id: 2, name: 'Finger Snap', category: 'clap', color: '#e76f51', keyLabel: 'C', keyCode: 'KeyC', volume: 0.85, pan: 0.1, tune: 0, trimStart: 0, trimEnd: 1, reversed: false, loop: false },
      { id: 3, name: 'Muted Hat Clsd', category: 'hihat', color: '#2a9d8f', keyLabel: 'V', keyCode: 'KeyV', volume: 0.8, pan: -0.2, tune: -2, trimStart: 0, trimEnd: 1, reversed: false, chokeGroup: 1, loop: false },

      { id: 4, name: 'Tape Hat Open', category: 'hihat', color: '#264653', keyLabel: 'A', keyCode: 'KeyA', volume: 0.75, pan: 0.2, tune: -1, trimStart: 0, trimEnd: 1, reversed: false, chokeGroup: 1, loop: false },
      { id: 5, name: 'Vinyl Rain', category: 'fx', color: '#8d99ae', keyLabel: 'S', keyCode: 'KeyS', volume: 0.8, pan: 0, tune: 0, trimStart: 0, trimEnd: 1, reversed: false, loop: false },
      { id: 6, name: 'Rhodes F#m7', category: 'chord', color: '#457b9d', keyLabel: 'D', keyCode: 'KeyD', volume: 0.9, pan: -0.15, tune: 0, trimStart: 0, trimEnd: 1, reversed: false, loop: false },
      { id: 7, name: 'Rhodes B7sus', category: 'chord', color: '#1d3557', keyLabel: 'F', keyCode: 'KeyF', volume: 0.9, pan: 0.15, tune: 0, trimStart: 0, trimEnd: 1, reversed: false, loop: false },

      { id: 8, name: 'Warm Bass Note', category: 'bass', color: '#6d6875', keyLabel: 'Q', keyCode: 'KeyQ', volume: 0.9, pan: 0, tune: 0, trimStart: 0, trimEnd: 1, reversed: false, loop: false },
      { id: 9, name: 'Guitar Pluck', category: 'chord', color: '#b5838d', keyLabel: 'W', keyCode: 'KeyW', volume: 0.85, pan: -0.2, tune: 0, trimStart: 0, trimEnd: 1, reversed: false, loop: false },
      { id: 10, name: 'Kalimba Ping', category: 'chord', color: '#e5989b', keyLabel: 'E', keyCode: 'KeyE', volume: 0.8, pan: 0.25, tune: 0, trimStart: 0, trimEnd: 1, reversed: false, loop: false },
      { id: 11, name: 'Muted Horn', category: 'chord', color: '#ffb4a2', keyLabel: 'R', keyCode: 'KeyR', volume: 0.8, pan: 0, tune: 0, trimStart: 0, trimEnd: 1, reversed: false, loop: false },

      { id: 12, name: 'Vox "Ooh"', category: 'vocal', color: '#e0a96d', keyLabel: '1', keyCode: 'Digit1', volume: 0.85, pan: 0, tune: 0, trimStart: 0, trimEnd: 1, reversed: false, loop: false },
      { id: 13, name: 'Conga Low', category: 'percussion', color: '#c38d9e', keyLabel: '2', keyCode: 'Digit2', volume: 0.8, pan: -0.15, tune: 0, trimStart: 0, trimEnd: 1, reversed: false, loop: false },
      { id: 14, name: 'Bongo High', category: 'percussion', color: '#e8a598', keyLabel: '3', keyCode: 'Digit3', volume: 0.8, pan: 0.2, tune: 0, trimStart: 0, trimEnd: 1, reversed: false, loop: false },
      { id: 15, name: 'Velvet Em9', category: 'chord', color: '#774936', keyLabel: '4', keyCode: 'Digit4', volume: 0.85, pan: 0, tune: 0, trimStart: 0, trimEnd: 1, reversed: false, loop: false },
    ],
  },
  {
    id: 3,
    name: 'BANK D',
    genre: 'HOUSE & ELECTRO FUNK',
    pads: [
      { id: 0, name: '909 Punch Kick', category: 'kick', color: '#f72585', keyLabel: 'Z', keyCode: 'KeyZ', volume: 1.0, pan: 0, tune: 0, trimStart: 0, trimEnd: 1, reversed: false, loop: false },
      { id: 1, name: '909 Snare', category: 'snare', color: '#7209b7', keyLabel: 'X', keyCode: 'KeyX', volume: 0.95, pan: 0, tune: 0, trimStart: 0, trimEnd: 1, reversed: false, loop: false },
      { id: 2, name: 'Disco Clap', category: 'clap', color: '#3a0ca3', keyLabel: 'C', keyCode: 'KeyC', volume: 0.9, pan: 0, tune: 0, trimStart: 0, trimEnd: 1, reversed: false, loop: false },
      { id: 3, name: '909 Hat Clsd', category: 'hihat', color: '#4361ee', keyLabel: 'V', keyCode: 'KeyV', volume: 0.85, pan: -0.2, tune: 0, trimStart: 0, trimEnd: 1, reversed: false, chokeGroup: 1, loop: false },

      { id: 4, name: '909 Hat Open', category: 'hihat', color: '#4cc9f0', keyLabel: 'A', keyCode: 'KeyA', volume: 0.8, pan: 0.2, tune: 0, trimStart: 0, trimEnd: 1, reversed: false, chokeGroup: 1, loop: false },
      { id: 5, name: 'Vintage Cowbell', category: 'percussion', color: '#06d6a0', keyLabel: 'S', keyCode: 'KeyS', volume: 0.85, pan: 0.1, tune: 0, trimStart: 0, trimEnd: 1, reversed: false, loop: false },
      { id: 6, name: 'High Conga', category: 'percussion', color: '#ffd166', keyLabel: 'D', keyCode: 'KeyD', volume: 0.85, pan: -0.15, tune: 0, trimStart: 0, trimEnd: 1, reversed: false, loop: false },
      { id: 7, name: 'Low Conga', category: 'percussion', color: '#f77f00', keyLabel: 'F', keyCode: 'KeyF', volume: 0.85, pan: 0.15, tune: 0, trimStart: 0, trimEnd: 1, reversed: false, loop: false },

      { id: 8, name: 'Slap Bass', category: 'bass', color: '#d90429', keyLabel: 'Q', keyCode: 'KeyQ', volume: 0.9, pan: 0, tune: 0, trimStart: 0, trimEnd: 1, reversed: false, loop: false },
      { id: 9, name: 'House Organ Stab', category: 'chord', color: '#ef233c', keyLabel: 'W', keyCode: 'KeyW', volume: 0.85, pan: 0.1, tune: 0, trimStart: 0, trimEnd: 1, reversed: false, loop: false },
      { id: 10, name: 'Disco Rhodes', category: 'chord', color: '#b5179e', keyLabel: 'E', keyCode: 'KeyE', volume: 0.85, pan: -0.1, tune: 0, trimStart: 0, trimEnd: 1, reversed: false, loop: false },
      { id: 11, name: 'Vox "Hit It!"', category: 'vocal', color: '#f72585', keyLabel: 'R', keyCode: 'KeyR', volume: 0.9, pan: 0, tune: 0, trimStart: 0, trimEnd: 1, reversed: false, loop: false },

      { id: 12, name: 'White Sweep', category: 'fx', color: '#00b4d8', keyLabel: '1', keyCode: 'Digit1', volume: 0.8, pan: 0, tune: 0, trimStart: 0, trimEnd: 1, reversed: false, loop: false },
      { id: 13, name: '909 Ride', category: 'percussion', color: '#0077b6', keyLabel: '2', keyCode: 'Digit2', volume: 0.8, pan: 0.25, tune: 0, trimStart: 0, trimEnd: 1, reversed: false, loop: false },
      { id: 14, name: 'Funk Rim', category: 'percussion', color: '#03045e', keyLabel: '3', keyCode: 'Digit3', volume: 0.85, pan: -0.1, tune: 0, trimStart: 0, trimEnd: 1, reversed: false, loop: false },
      { id: 15, name: 'Zap FX', category: 'fx', color: '#38b000', keyLabel: '4', keyCode: 'Digit4', volume: 0.75, pan: 0.1, tune: 0, trimStart: 0, trimEnd: 1, reversed: false, loop: false },
    ],
  },
];

// Helper to create an empty pattern (16 pads x 16 steps)
export function createEmptyPattern(): boolean[][] {
  return Array.from({ length: 16 }, () => Array(16).fill(false));
}

// Pre-built legendary patterns
export const PATTERN_PRESETS: PatternPreset[] = [
  {
    id: 'boombap-90s',
    name: 'Supreme BoomBap 92',
    bpm: 92,
    bank: 0,
    description: 'Classic 90s NYC hip-hop boom-bap groove with swung hats and ghost kicks',
    pattern: (() => {
      const p = createEmptyPattern();
      // Kick: Pad 0 at steps 0, 10
      p[0][0] = true;
      p[0][10] = true;
      // Ghost 808 kick: Pad 1 at steps 6, 14
      p[1][6] = true;
      p[1][14] = true;
      // Snare: Pad 2 on backbeat 4 and 12
      p[2][4] = true;
      p[2][12] = true;
      // Closed HiHat: Pad 5 on all even and swung 16ths
      for (let s = 0; s < 16; s += 2) p[5][s] = true;
      p[5][7] = true;
      p[5][15] = true;
      // Open Hat: Pad 6 at step 14
      p[6][14] = true;
      // Rhodes Chord: Pad 11 at step 0 and 8
      p[11][0] = true;
      p[11][8] = true;
      // Vocal "Supreme!": Pad 10 at step 12
      p[10][12] = true;
      return p;
    })(),
  },
  {
    id: 'trap-anthem-140',
    name: 'Cyber Trap Anthem 140',
    bpm: 140,
    bank: 1,
    description: 'Heavy 808 sub slides, fast rolling hi-hats, and punchy Spinz kicks',
    pattern: (() => {
      const p = createEmptyPattern();
      // 808 Sub: Pad 0 at steps 0, 6, 12
      p[0][0] = true;
      p[0][6] = true;
      p[0][12] = true;
      // Spinz Kick: Pad 1 at steps 0, 7, 10
      p[1][0] = true;
      p[1][7] = true;
      p[1][10] = true;
      // Metro Clap: Pad 3 at step 8
      p[3][8] = true;
      // Drill Snare: Pad 2 at step 4 and 12
      p[2][4] = true;
      p[2][12] = true;
      // Hi-Hats: Pad 4 on rolls
      for (let s = 0; s < 16; s++) {
        if (s !== 8 && s !== 14) p[4][s] = true;
      }
      p[5][14] = true; // Triplet roll
      // Chant "Hey!": Pad 7 at step 4 and 12
      p[7][4] = true;
      p[7][12] = true;
      // Bell chime: Pad 8 at step 0
      p[8][0] = true;
      return p;
    })(),
  },
  {
    id: 'lofi-chill-84',
    name: 'Midnight Lo-Fi Soul 84',
    bpm: 84,
    bank: 2,
    description: 'Warm tape drums, dusty snare, vinyl rain, and smooth jazz Rhodes chords',
    pattern: (() => {
      const p = createEmptyPattern();
      // Muffled Kick: Pad 0 at 0, 3, 10
      p[0][0] = true;
      p[0][3] = true;
      p[0][10] = true;
      // Dusty Snare: Pad 1 at 4, 12
      p[1][4] = true;
      p[1][12] = true;
      // Snap: Pad 2 at 12
      p[2][12] = true;
      // Closed Hat: Pad 3 on 8ths
      for (let s = 0; s < 16; s += 2) p[3][s] = true;
      // Open Hat: Pad 4 at 14
      p[4][14] = true;
      // Rhodes F#m7: Pad 6 at 0
      p[6][0] = true;
      // Rhodes B7sus: Pad 7 at 8
      p[7][8] = true;
      // Guitar pluck: Pad 9 at 6, 14
      p[9][6] = true;
      p[9][14] = true;
      // Vocal "Ooh": Pad 12 at 12
      p[12][12] = true;
      return p;
    })(),
  },
  {
    id: 'house-groove-126',
    name: 'Chicago 909 Groove 126',
    bpm: 126,
    bank: 3,
    description: 'Four-on-the-floor 909 kick, off-beat open hat, vintage cowbell and organ stab',
    pattern: (() => {
      const p = createEmptyPattern();
      // Four on the floor kick: Pad 0 at 0, 4, 8, 12
      p[0][0] = true;
      p[0][4] = true;
      p[0][8] = true;
      p[0][12] = true;
      // Disco Clap: Pad 2 at 4, 12
      p[2][4] = true;
      p[2][12] = true;
      // Offbeat open hat: Pad 4 at 2, 6, 10, 14
      p[4][2] = true;
      p[4][6] = true;
      p[4][10] = true;
      p[4][14] = true;
      // Closed hat: Pad 3 at 0, 4, 8, 12
      p[3][0] = true;
      p[3][4] = true;
      p[3][8] = true;
      p[3][12] = true;
      // Organ stab: Pad 9 at 3, 6, 11, 14
      p[9][3] = true;
      p[9][6] = true;
      p[9][11] = true;
      p[9][14] = true;
      // Cowbell: Pad 5 at 7, 15
      p[5][7] = true;
      p[5][15] = true;
      return p;
    })(),
  },
];
