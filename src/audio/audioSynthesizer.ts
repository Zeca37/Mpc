/**
 * High-Fidelity Audio Synthesizer for SUPREMO MPA
 * Generates authentic drum machine and acoustic/sampler AudioBuffers
 * without relying on external network assets.
 */

// Helper: create an AudioBuffer
export function createBuffer(
  ctx: AudioContext,
  duration: number,
  channels: number = 2
): AudioBuffer {
  return ctx.createBuffer(channels, Math.max(1, Math.floor(ctx.sampleRate * duration)), ctx.sampleRate);
}

// Generate White Noise
function createNoise(length: number): Float32Array {
  const noise = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    noise[i] = Math.random() * 2 - 1;
  }
  return noise;
}

// Synthesize 808 Sub Kick
export function synth808Kick(ctx: AudioContext, pitch: number = 55, decay: number = 0.65): AudioBuffer {
  const sr = ctx.sampleRate;
  const length = Math.floor(sr * decay);
  const buffer = ctx.createBuffer(2, length, sr);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  let currentPhase = 0;
  for (let i = 0; i < length; i++) {
    const t = i / sr;
    // Exponential pitch drop from 180Hz down to pitch
    const currentFreq = pitch + (200 - pitch) * Math.exp(-t * 35);
    currentPhase += (2 * Math.PI * currentFreq) / sr;
    
    // Amp envelope: punchy attack, smooth exponential decay
    const amp = Math.exp(-t * (1 / (decay * 0.35)));
    
    // Soft saturation for analog warmth
    let sample = Math.sin(currentPhase) * 1.3;
    // Click transient
    if (i < sr * 0.005) {
      sample += (Math.random() * 2 - 1) * 0.4 * (1 - i / (sr * 0.005));
    }
    // Tube soft clip
    sample = Math.tanh(sample * 1.4) * amp * 0.95;

    left[i] = sample;
    right[i] = sample;
  }
  return buffer;
}

// Synthesize Punchy Boom-Bap Acoustic Kick
export function synthBoomBapKick(ctx: AudioContext): AudioBuffer {
  const sr = ctx.sampleRate;
  const decay = 0.42;
  const length = Math.floor(sr * decay);
  const buffer = ctx.createBuffer(2, length, sr);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  let phase = 0;
  for (let i = 0; i < length; i++) {
    const t = i / sr;
    const freq = 48 + 140 * Math.exp(-t * 40);
    phase += (2 * Math.PI * freq) / sr;
    const amp = Math.exp(-t * 9.5);
    
    let sample = Math.sin(phase) + 0.35 * Math.sin(phase * 2.1);
    if (t < 0.01) {
      // Wood beater click
      sample += (Math.sin(2 * Math.PI * 850 * t) + Math.random() * 0.5) * (1 - t / 0.01) * 0.8;
    }
    sample = Math.tanh(sample * 1.6) * amp * 0.92;
    left[i] = sample;
    right[i] = sample;
  }
  return buffer;
}

// Synthesize Snare Drum (Body tone + filtered noise burst)
export function synthSnare(ctx: AudioContext, isLofi: boolean = false): AudioBuffer {
  const sr = ctx.sampleRate;
  const decay = isLofi ? 0.32 : 0.28;
  const length = Math.floor(sr * decay);
  const buffer = ctx.createBuffer(2, length, sr);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  let tonePhase = 0;
  let noiseFilter = 0;
  const cutoff = isLofi ? 0.25 : 0.45;

  for (let i = 0; i < length; i++) {
    const t = i / sr;
    // Tone: 180Hz down to 130Hz
    const toneFreq = 135 + 90 * Math.exp(-t * 30);
    tonePhase += (2 * Math.PI * toneFreq) / sr;
    const toneAmp = Math.exp(-t * 22) * 0.6;
    const tone = Math.sin(tonePhase) * toneAmp;

    // Noise component
    const rawNoise = Math.random() * 2 - 1;
    noiseFilter += (rawNoise - noiseFilter) * cutoff;
    const noiseAmp = Math.exp(-t * (isLofi ? 14 : 17)) * 0.75;
    const noise = noiseFilter * noiseAmp;

    let sample = tone + noise;
    if (isLofi) {
      // Subtle bitcrush feel
      sample = Math.round(sample * 32) / 32;
    }
    sample = Math.tanh(sample * 1.5) * 0.88;

    left[i] = sample;
    right[i] = sample;
  }
  return buffer;
}

// Synthesize Rimshot
export function synthRimshot(ctx: AudioContext): AudioBuffer {
  const sr = ctx.sampleRate;
  const decay = 0.14;
  const length = Math.floor(sr * decay);
  const buffer = ctx.createBuffer(2, length, sr);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  let phase1 = 0;
  let phase2 = 0;
  for (let i = 0; i < length; i++) {
    const t = i / sr;
    phase1 += (2 * Math.PI * 460) / sr;
    phase2 += (2 * Math.PI * 1150) / sr;
    const amp = Math.exp(-t * 35);
    const click = t < 0.005 ? (Math.random() * 2 - 1) * 0.8 : 0;
    const sample = (Math.sin(phase1) * 0.6 + Math.sin(phase2) * 0.4 + click) * amp;
    left[i] = sample * 0.85;
    right[i] = sample * 0.85;
  }
  return buffer;
}

// Synthesize Clap (Multiple rapid pre-hits + tail)
export function synthClap(ctx: AudioContext): AudioBuffer {
  const sr = ctx.sampleRate;
  const decay = 0.35;
  const length = Math.floor(sr * decay);
  const buffer = ctx.createBuffer(2, length, sr);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  // Pre-delays at 0ms, 12ms, 24ms, then main release
  const burstTimes = [0, 0.012, 0.024];
  let filterState = 0;

  for (let i = 0; i < length; i++) {
    const t = i / sr;
    const raw = Math.random() * 2 - 1;
    // Bandpass around 1200Hz
    filterState += (raw - filterState) * 0.38;

    let amp = 0;
    for (const b of burstTimes) {
      if (t >= b && t < b + 0.02) {
        amp += Math.exp(-(t - b) * 90) * 0.6;
      }
    }
    if (t >= 0.035) {
      amp += Math.exp(-(t - 0.035) * 16) * 0.8;
    }

    const sample = Math.tanh(filterState * amp * 2.0) * 0.9;
    left[i] = sample;
    right[i] = sample * 0.95 + (Math.random() * 0.05); // slight stereo width
  }
  return buffer;
}

// Synthesize Metallic Hi-Hat (Closed or Open)
export function synthHiHat(ctx: AudioContext, open: boolean = false): AudioBuffer {
  const sr = ctx.sampleRate;
  const decay = open ? 0.45 : 0.07;
  const length = Math.floor(sr * decay);
  const buffer = ctx.createBuffer(2, length, sr);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  // 6 square wave frequencies (classic 808 metallic cluster: 245, 306, 368, 421, 540, 800 Hz)
  const freqs = [245, 306, 368, 421, 540, 800];
  const phases = freqs.map(() => 0);

  let highpassState = 0;

  for (let i = 0; i < length; i++) {
    const t = i / sr;
    let sum = 0;
    for (let f = 0; f < freqs.length; f++) {
      phases[f] += (2 * Math.PI * freqs[f]) / sr;
      sum += Math.sin(phases[f]) > 0 ? 0.16 : -0.16;
    }
    // High-pass filter above 7000Hz
    const raw = sum + (Math.random() * 2 - 1) * 0.3;
    highpassState += (raw - highpassState) * 0.65;
    const filtered = raw - highpassState;

    const amp = Math.exp(-t * (open ? 8 : 45));
    const sample = filtered * amp * 1.5;

    left[i] = sample;
    right[i] = sample;
  }
  return buffer;
}

// Synthesize 808 Cowbell
export function synthCowbell(ctx: AudioContext): AudioBuffer {
  const sr = ctx.sampleRate;
  const decay = 0.38;
  const length = Math.floor(sr * decay);
  const buffer = ctx.createBuffer(2, length, sr);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  let p1 = 0;
  let p2 = 0;
  for (let i = 0; i < length; i++) {
    const t = i / sr;
    p1 += (2 * Math.PI * 587) / sr;
    p2 += (2 * Math.PI * 845) / sr;
    const s1 = Math.sin(p1) > 0 ? 0.5 : -0.5;
    const s2 = Math.sin(p2) > 0 ? 0.5 : -0.5;
    const amp = Math.exp(-t * 18);
    const sample = (s1 + s2) * amp * 0.7;
    left[i] = sample;
    right[i] = sample;
  }
  return buffer;
}

// Synthesize Percussion (Conga / Bongo)
export function synthPerc(ctx: AudioContext, pitch: number = 220): AudioBuffer {
  const sr = ctx.sampleRate;
  const decay = 0.28;
  const length = Math.floor(sr * decay);
  const buffer = ctx.createBuffer(2, length, sr);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  let phase = 0;
  for (let i = 0; i < length; i++) {
    const t = i / sr;
    const f = pitch + 60 * Math.exp(-t * 40);
    phase += (2 * Math.PI * f) / sr;
    const slap = t < 0.008 ? (Math.random() * 2 - 1) * 0.5 : 0;
    const amp = Math.exp(-t * 14);
    const sample = (Math.sin(phase) + slap) * amp * 0.85;
    left[i] = sample;
    right[i] = sample;
  }
  return buffer;
}

// Synthesize Vinyl Scratch / Cut
export function synthVinylScratch(ctx: AudioContext): AudioBuffer {
  const sr = ctx.sampleRate;
  const decay = 0.35;
  const length = Math.floor(sr * decay);
  const buffer = ctx.createBuffer(2, length, sr);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  let phase = 0;
  for (let i = 0; i < length; i++) {
    const t = i / sr;
    // Scratch modulation curve
    const speed = Math.sin(t * Math.PI * 7) * 350 + 400;
    phase += (2 * Math.PI * speed) / sr;
    const vinylHiss = (Math.random() * 2 - 1) * 0.25;
    const amp = Math.sin((t / decay) * Math.PI) * 0.8;
    const sample = Math.tanh((Math.sin(phase) * 0.7 + vinylHiss) * 1.5) * amp;
    left[i] = sample;
    right[i] = sample;
  }
  return buffer;
}

// Synthesize Vocal Formant Chops ("Yeah", "Supreme", "Ooh", "Hit It")
export function synthVocalFormant(
  ctx: AudioContext,
  vowel: 'yeah' | 'supreme' | 'ooh' | 'hey' | 'woo',
  pitch: number = 130
): AudioBuffer {
  const sr = ctx.sampleRate;
  const decay = vowel === 'supreme' ? 0.65 : 0.42;
  const length = Math.floor(sr * decay);
  const buffer = ctx.createBuffer(2, length, sr);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  // Formant center frequencies [F1, F2, F3]
  const formants =
    vowel === 'yeah' ? [650, 1800, 2700] :
    vowel === 'supreme' ? [450, 2100, 2900] :
    vowel === 'hey' ? [700, 1600, 2500] :
    vowel === 'woo' ? [350, 950, 2400] :
    [320, 850, 2200]; // ooh

  let voicePhase = 0;
  const resStates = [0, 0, 0];

  for (let i = 0; i < length; i++) {
    const t = i / sr;
    // Pitch intonation
    const currentPitch = pitch * (1 + 0.15 * Math.sin(t * 12) * Math.exp(-t * 4));
    voicePhase += (2 * Math.PI * currentPitch) / sr;

    // Glottal pulse wave
    const glottal = Math.sin(voicePhase) + 0.5 * Math.sin(voicePhase * 2) + 0.25 * Math.sin(voicePhase * 3);

    // Formant filter resonances
    let formantSum = 0;
    for (let f = 0; f < 3; f++) {
      const targetFreq = formants[f];
      const coeff = (2 * Math.PI * targetFreq) / sr;
      resStates[f] += (glottal - resStates[f]) * Math.min(0.8, coeff * 1.8);
      formantSum += resStates[f] * (f === 0 ? 0.5 : f === 1 ? 0.35 : 0.2);
    }

    const env = Math.sin(Math.min(1, t / 0.03) * (Math.PI / 2)) * Math.exp(-t * (1 / (decay * 0.45)));
    let sample = Math.tanh(formantSum * 2.2) * env * 0.85;

    left[i] = sample;
    right[i] = sample;
  }
  return buffer;
}

// Synthesize Lush Rhodes Chord (Electric Piano)
export function synthRhodesChord(ctx: AudioContext, chordType: 'Em9' | 'F#m7' | 'B7'): AudioBuffer {
  const sr = ctx.sampleRate;
  const decay = 1.6;
  const length = Math.floor(sr * decay);
  const buffer = ctx.createBuffer(2, length, sr);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  // Frequencies for chords:
  // Em9: E3(164.81), G3(196), B3(246.94), D4(293.66), F#4(369.99)
  // F#m7: F#3(185.00), A3(220), C#4(277.18), E4(329.63)
  // B7: B2(123.47), D#3(155.56), F#3(185.00), A3(220.00)
  const freqs =
    chordType === 'Em9' ? [164.81, 196.00, 246.94, 293.66, 369.99] :
    chordType === 'F#m7' ? [185.00, 220.00, 277.18, 329.63] :
    [123.47, 155.56, 185.00, 220.00];

  const phases = freqs.map(() => 0);
  const bellPhases = freqs.map(() => 0);

  for (let i = 0; i < length; i++) {
    const t = i / sr;
    let sampleL = 0;
    let sampleR = 0;
    const tremolo = 1 + 0.15 * Math.sin(2 * Math.PI * 4.5 * t);

    for (let f = 0; f < freqs.length; f++) {
      const baseFreq = freqs[f];
      phases[f] += (2 * Math.PI * baseFreq) / sr;
      // Chime overtone (FM tine bell)
      bellPhases[f] += (2 * Math.PI * baseFreq * 4.02) / sr;
      
      const tineEnv = Math.exp(-t * 9) * 0.4;
      const bodyEnv = Math.exp(-t * 2.2);

      const tone = Math.sin(phases[f]) * bodyEnv + Math.sin(bellPhases[f]) * tineEnv;
      // Pan notes slightly across stereo field
      const pan = (f / freqs.length) * 0.6 - 0.3;
      sampleL += tone * (0.5 - pan * 0.5);
      sampleR += tone * (0.5 + pan * 0.5);
    }

    const amp = tremolo * Math.exp(-t * 1.5) * 0.35;
    left[i] = Math.tanh(sampleL * 1.4) * amp;
    right[i] = Math.tanh(sampleR * 1.4) * amp;
  }
  return buffer;
}

// Synthesize Sub Bass Glide Note
export function synthSubBass(ctx: AudioContext, noteFreq: number = 43.65): AudioBuffer {
  const sr = ctx.sampleRate;
  const decay = 1.2;
  const length = Math.floor(sr * decay);
  const buffer = ctx.createBuffer(2, length, sr);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  let phase = 0;
  for (let i = 0; i < length; i++) {
    const t = i / sr;
    phase += (2 * Math.PI * noteFreq) / sr;
    const amp = Math.exp(-t * 1.8);
    // Pure sine with 2nd harmonic saturation
    let sample = Math.sin(phase) + 0.25 * Math.sin(phase * 2);
    sample = Math.tanh(sample * 1.8) * amp * 0.9;
    left[i] = sample;
    right[i] = sample;
  }
  return buffer;
}

// Synthesize Brass Horn Hit
export function synthHornStab(ctx: AudioContext): AudioBuffer {
  const sr = ctx.sampleRate;
  const decay = 0.55;
  const length = Math.floor(sr * decay);
  const buffer = ctx.createBuffer(2, length, sr);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  const freqs = [220, 277.18, 329.63, 440]; // A major triad
  const phases = freqs.map(() => 0);

  for (let i = 0; i < length; i++) {
    const t = i / sr;
    let sum = 0;
    for (let f = 0; f < freqs.length; f++) {
      phases[f] += (2 * Math.PI * freqs[f]) / sr;
      // Sawtooth-like brass timbre
      sum += (Math.sin(phases[f]) + 0.5 * Math.sin(phases[f] * 2) + 0.3 * Math.sin(phases[f] * 3)) * 0.25;
    }
    const filterEnv = Math.exp(-t * 12);
    const amp = Math.sin(Math.min(1, t / 0.015) * (Math.PI / 2)) * Math.exp(-t * 4);
    const sample = Math.tanh(sum * (1 + 2 * filterEnv)) * amp * 0.8;
    left[i] = sample;
    right[i] = sample;
  }
  return buffer;
}

// Synthesize Pluck (Acoustic Guitar / Kalimba / Bell)
export function synthPluck(ctx: AudioContext, freq: number = 440, metallic: boolean = false): AudioBuffer {
  const sr = ctx.sampleRate;
  const decay = metallic ? 0.9 : 0.6;
  const length = Math.floor(sr * decay);
  const buffer = ctx.createBuffer(2, length, sr);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  let p1 = 0;
  let p2 = 0;
  for (let i = 0; i < length; i++) {
    const t = i / sr;
    p1 += (2 * Math.PI * freq) / sr;
    p2 += (2 * Math.PI * freq * (metallic ? 2.76 : 3)) / sr;
    const strike = t < 0.005 ? (Math.random() * 2 - 1) * 0.7 : 0;
    const amp = Math.exp(-t * (metallic ? 4.5 : 7));
    const sample = (Math.sin(p1) * 0.7 + Math.sin(p2) * (metallic ? 0.4 : 0.15) + strike) * amp;
    left[i] = sample * 0.85;
    right[i] = sample * 0.85;
  }
  return buffer;
}

// Synthesize Crash Cymbal / White Noise Sweep
export function synthCymbal(ctx: AudioContext, isSweep: boolean = false): AudioBuffer {
  const sr = ctx.sampleRate;
  const decay = isSweep ? 0.9 : 1.2;
  const length = Math.floor(sr * decay);
  const buffer = ctx.createBuffer(2, length, sr);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  let filtL = 0;
  let filtR = 0;

  for (let i = 0; i < length; i++) {
    const t = i / sr;
    const rawL = Math.random() * 2 - 1;
    const rawR = Math.random() * 2 - 1;

    const cutoff = isSweep ? 0.05 + 0.8 * (t / decay) : 0.45;
    filtL += (rawL - filtL) * cutoff;
    filtR += (rawR - filtR) * cutoff;

    const amp = isSweep
      ? Math.sin((t / decay) * Math.PI) * 0.75
      : Math.exp(-t * 3.5) * 0.8;

    left[i] = filtL * amp;
    right[i] = filtR * amp;
  }
  return buffer;
}

// Synthesize Sci-Fi Laser FX
export function synthLaser(ctx: AudioContext): AudioBuffer {
  const sr = ctx.sampleRate;
  const decay = 0.35;
  const length = Math.floor(sr * decay);
  const buffer = ctx.createBuffer(2, length, sr);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  let phase = 0;
  for (let i = 0; i < length; i++) {
    const t = i / sr;
    const f = 2400 * Math.exp(-t * 22) + 80;
    phase += (2 * Math.PI * f) / sr;
    const amp = Math.exp(-t * 8);
    const sample = Math.sin(phase) * amp * 0.75;
    left[i] = sample;
    right[i] = sample;
  }
  return buffer;
}

// Master Buffer Factory for each of the 64 pad positions
export function generatePadSample(ctx: AudioContext, bankIdx: number, padIdx: number): AudioBuffer {
  switch (bankIdx) {
    case 0: // Bank A: SUPREME BOOM-BAP
      switch (padIdx) {
        case 0: return synthBoomBapKick(ctx);
        case 1: return synth808Kick(ctx, 48, 0.5);
        case 2: return synthSnare(ctx, false);
        case 3: return synthRimshot(ctx);
        case 4: return synthClap(ctx);
        case 5: return synthHiHat(ctx, false);
        case 6: return synthHiHat(ctx, true);
        case 7: return synthPerc(ctx, 380);
        case 8: return synthVinylScratch(ctx);
        case 9: return synthVocalFormant(ctx, 'yeah', 140);
        case 10: return synthVocalFormant(ctx, 'supreme', 130);
        case 11: return synthRhodesChord(ctx, 'Em9');
        case 12: return synthHornStab(ctx);
        case 13: return synthSubBass(ctx, 41.2); // E1
        case 14: return synthCymbal(ctx, false);
        case 15: return synthLaser(ctx);
      }
      break;

    case 1: // Bank B: MODERN TRAP & DRILL
      switch (padIdx) {
        case 0: return synth808Kick(ctx, 42, 0.85); // Heavy 808
        case 1: return synth808Kick(ctx, 60, 0.38); // Spinz punch kick
        case 2: return synthSnare(ctx, false);
        case 3: return synthClap(ctx);
        case 4: return synthHiHat(ctx, false);
        case 5: return synthHiHat(ctx, false);
        case 6: return synthCowbell(ctx);
        case 7: return synthVocalFormant(ctx, 'hey', 160);
        case 8: return synthPluck(ctx, 880, true); // Bell chime
        case 9: return synthPluck(ctx, 587.33, false); // Flute chop
        case 10: return synthSubBass(ctx, 36.7); // D1 Sub
        case 11: return synthHornStab(ctx);
        case 12: return synthLaser(ctx);
        case 13: return synthCymbal(ctx, true); // Riser
        case 14: return synthVocalFormant(ctx, 'woo', 180);
        case 15: return synthCymbal(ctx, false);
      }
      break;

    case 2: // Bank C: LO-FI & NEO SOUL
      switch (padIdx) {
        case 0: return synthBoomBapKick(ctx);
        case 1: return synthSnare(ctx, true); // Lofi dusty snare
        case 2: return synthRimshot(ctx); // Snap
        case 3: return synthHiHat(ctx, false);
        case 4: return synthHiHat(ctx, true);
        case 5: return synthVinylScratch(ctx);
        case 6: return synthRhodesChord(ctx, 'F#m7');
        case 7: return synthRhodesChord(ctx, 'B7');
        case 8: return synthSubBass(ctx, 46.25);
        case 9: return synthPluck(ctx, 329.63, false); // Pluck guitar
        case 10: return synthPluck(ctx, 523.25, true); // Kalimba
        case 11: return synthHornStab(ctx);
        case 12: return synthVocalFormant(ctx, 'ooh', 125);
        case 13: return synthPerc(ctx, 290);
        case 14: return synthPerc(ctx, 440);
        case 15: return synthRhodesChord(ctx, 'Em9');
      }
      break;

    case 3: // Bank D: HOUSE & ELECTRO FUNK
      switch (padIdx) {
        case 0: return synthBoomBapKick(ctx); // 909 kick
        case 1: return synthSnare(ctx, false); // 909 snare
        case 2: return synthClap(ctx);
        case 3: return synthHiHat(ctx, false);
        case 4: return synthHiHat(ctx, true);
        case 5: return synthCowbell(ctx);
        case 6: return synthPerc(ctx, 280); // High conga
        case 7: return synthPerc(ctx, 190); // Low conga
        case 8: return synthSubBass(ctx, 48.99); // Slap bass G1
        case 9: return synthHornStab(ctx); // Organ stab
        case 10: return synthRhodesChord(ctx, 'Em9');
        case 11: return synthVocalFormant(ctx, 'yeah', 150);
        case 12: return synthCymbal(ctx, true); // Noise sweep
        case 13: return synthCymbal(ctx, false); // Ride
        case 14: return synthRimshot(ctx);
        case 15: return synthLaser(ctx);
      }
      break;
  }
  return synthBoomBapKick(ctx);
}
