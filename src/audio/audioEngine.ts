/**
 * Master Web Audio Engine for SUPREMO MPA
 * Handles real-time voice dispatch, choke groups, multi-FX DSP,
 * sample trimming, clock-accurate step sequencing, and master export.
 */

import { FXSettings, PadConfig } from '../types/sampler';
import { generatePadSample } from './audioSynthesizer';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private driveNode: WaveShaperNode | null = null;
  private driveGain: GainNode | null = null;
  private delayNode: DelayNode | null = null;
  private delayFeedbackGain: GainNode | null = null;
  private delayMixGain: GainNode | null = null;
  private reverbNode: ConvolverNode | null = null;
  private reverbMixGain: GainNode | null = null;
  private compressorNode: DynamicsCompressorNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private streamDestination: MediaStreamAudioDestinationNode | null = null;

  // Active playing voices for choke handling
  private activeVoices: Map<number, AudioBufferSourceNode> = new Map();
  // Buffer cache: key is `${bankId}_${padId}`
  private bufferCache: Map<string, AudioBuffer> = new Map();

  // Master Jam Recorder
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  public isRecordingMaster: boolean = false;

  // Sequencer playback state
  public isPlaying: boolean = false;
  private tempo: number = 92;
  private swing: number = 0.54; // 50% = straight, 60% = classic MPC swing
  private currentStep: number = 0;
  private nextStepTime: number = 0;
  private timerID: number | null = null;
  private lookahead: number = 25.0; // ms
  private scheduleAheadTime: number = 0.1; // seconds

  // Callback to sync UI playhead
  public onStepChange: ((step: number) => void) | null = null;
  public getSequencerStepData: ((step: number) => { padIndex: number; velocity: number }[]) | null = null;

  // Current FX State
  private fx: FXSettings = {
    filterType: 'lowpass',
    filterCutoff: 14000,
    filterResonance: 1.5,
    filterEnabled: false,
    driveAmount: 0.15,
    driveEnabled: false,
    vinylCrackle: 0,
    delayTime: 0.32,
    delayFeedback: 0.35,
    delayMix: 0.25,
    delayEnabled: false,
    reverbSize: 0.5,
    reverbMix: 0.2,
    reverbEnabled: false,
    masterGain: 0.95,
    compressorPunch: true,
  };

  public init() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioCtx();

    // 1. Master Analyser
    this.analyserNode = this.ctx.createAnalyser();
    this.analyserNode.fftSize = 256;
    this.analyserNode.smoothingTimeConstant = 0.8;

    // 2. Stream destination for WAV recording
    this.streamDestination = this.ctx.createMediaStreamDestination();

    // 3. Compressor / Limiter
    this.compressorNode = this.ctx.createDynamicsCompressor();
    this.compressorNode.threshold.value = -14;
    this.compressorNode.knee.value = 30;
    this.compressorNode.ratio.value = 12;
    this.compressorNode.attack.value = 0.003;
    this.compressorNode.release.value = 0.25;

    // 4. Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.fx.masterGain;

    // 5. Filter Node
    this.filterNode = this.ctx.createBiquadFilter();
    this.filterNode.type = this.fx.filterType;
    this.filterNode.frequency.value = this.fx.filterCutoff;
    this.filterNode.Q.value = this.fx.filterResonance;

    // 6. Drive Node
    this.driveNode = this.ctx.createWaveShaper();
    this.driveGain = this.ctx.createGain();
    this.updateDriveCurve(this.fx.driveAmount);

    // 7. Delay Node & Feedback
    this.delayNode = this.ctx.createDelay(2.0);
    this.delayNode.delayTime.value = this.fx.delayTime;
    this.delayFeedbackGain = this.ctx.createGain();
    this.delayFeedbackGain.gain.value = this.fx.delayFeedback;
    this.delayMixGain = this.ctx.createGain();
    this.delayMixGain.gain.value = 0; // bypassed initially

    this.delayNode.connect(this.delayFeedbackGain);
    this.delayFeedbackGain.connect(this.delayNode);
    this.delayNode.connect(this.delayMixGain);

    // 8. Reverb Node & Mix
    this.reverbNode = this.ctx.createConvolver();
    this.reverbMixGain = this.ctx.createGain();
    this.reverbMixGain.gain.value = 0; // bypassed initially
    this.generateReverbImpulse(this.fx.reverbSize);
    this.reverbNode.connect(this.reverbMixGain);

    // Wiring Master FX Chain:
    // Filter -> Drive -> (Dry to Master, and sends to Delay & Reverb)
    // DelayMix & ReverbMix -> Master
    // Master -> Compressor -> Analyser -> Destination & StreamDestination
    this.filterNode.connect(this.driveNode);
    this.driveNode.connect(this.driveGain);

    // Dry path
    this.driveGain.connect(this.masterGain);

    // Wet FX sends
    this.driveGain.connect(this.delayNode);
    this.driveGain.connect(this.reverbNode);
    this.delayMixGain.connect(this.masterGain);
    this.reverbMixGain.connect(this.masterGain);

    // Master to output
    this.masterGain.connect(this.compressorNode);
    this.compressorNode.connect(this.analyserNode);
    this.analyserNode.connect(this.ctx.destination);
    this.analyserNode.connect(this.streamDestination);
  }

  public resume() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Pre-generate AudioBuffer for bank/pad
  public getAudioBuffer(bankIdx: number, padIdx: number, padConfig?: PadConfig): AudioBuffer {
    if (!this.ctx) this.init();
    const ctx = this.ctx!;

    // Custom user buffer takes priority
    if (padConfig?.customBuffer) {
      return padConfig.customBuffer;
    }

    const cacheKey = `${bankIdx}_${padIdx}`;
    if (this.bufferCache.has(cacheKey)) {
      return this.bufferCache.get(cacheKey)!;
    }

    const buffer = generatePadSample(ctx, bankIdx, padIdx);
    this.bufferCache.set(cacheKey, buffer);
    return buffer;
  }

  public setCustomBuffer(bankIdx: number, padIdx: number, buffer: AudioBuffer) {
    const cacheKey = `${bankIdx}_${padIdx}`;
    this.bufferCache.set(cacheKey, buffer);
  }

  // Play a pad sample with fine control over pitch, velocity, trimming, and choke groups
  public playPad(
    bankIdx: number,
    padConfig: PadConfig,
    velocity: number = 1.0,
    pitchOffsetSemitones: number = 0,
    timeOffset: number = 0
  ) {
    this.resume();
    if (!this.ctx || !this.filterNode) return;

    const ctx = this.ctx;
    const playTime = timeOffset > 0 ? timeOffset : ctx.currentTime;
    const buffer = this.getAudioBuffer(bankIdx, padConfig.id, padConfig);

    // Handle Choke Group (e.g. Hi-hat choke)
    if (padConfig.chokeGroup) {
      const activeSource = this.activeVoices.get(padConfig.chokeGroup);
      if (activeSource) {
        try {
          activeSource.stop(playTime);
        } catch {
          // ignore
        }
        this.activeVoices.delete(padConfig.chokeGroup);
      }
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    // Pitch shift calculation (semitones to playbackRate)
    const totalSemitones = (padConfig.tune || 0) + pitchOffsetSemitones;
    source.playbackRate.value = Math.pow(2, totalSemitones / 12);

    // Voice Gain & Velocity
    const voiceGain = ctx.createGain();
    const finalVolume = Math.max(0.01, (padConfig.volume ?? 1.0) * velocity);
    voiceGain.gain.setValueAtTime(finalVolume, playTime);

    // Voice Stereo Pan
    let panner: StereoPannerNode | null = null;
    if (ctx.createStereoPanner) {
      panner = ctx.createStereoPanner();
      panner.pan.value = padConfig.pan || 0;
    }

    // Connect voice nodes
    if (panner) {
      source.connect(voiceGain);
      voiceGain.connect(panner);
      panner.connect(this.filterNode);
    } else {
      source.connect(voiceGain);
      voiceGain.connect(this.filterNode);
    }

    // Trimming
    const trimStart = (padConfig.trimStart || 0) * buffer.duration;
    const trimEnd = (padConfig.trimEnd !== undefined ? padConfig.trimEnd : 1.0) * buffer.duration;
    const playDuration = Math.max(0.02, trimEnd - trimStart);

    source.start(playTime, trimStart, playDuration);

    if (padConfig.chokeGroup) {
      this.activeVoices.set(padConfig.chokeGroup, source);
    }
  }

  // Update DSP FX chain
  public updateFX(newFX: Partial<FXSettings>) {
    this.fx = { ...this.fx, ...newFX };
    if (!this.ctx || !this.filterNode) return;

    // Filter
    if (newFX.filterCutoff !== undefined || newFX.filterType !== undefined || newFX.filterResonance !== undefined || newFX.filterEnabled !== undefined) {
      this.filterNode.type = this.fx.filterType;
      this.filterNode.frequency.setTargetAtTime(
        this.fx.filterEnabled ? this.fx.filterCutoff : 18000,
        this.ctx.currentTime,
        0.02
      );
      this.filterNode.Q.setTargetAtTime(
        this.fx.filterEnabled ? this.fx.filterResonance : 1.0,
        this.ctx.currentTime,
        0.02
      );
    }

    // Drive
    if (newFX.driveAmount !== undefined || newFX.driveEnabled !== undefined) {
      this.updateDriveCurve(this.fx.driveEnabled ? this.fx.driveAmount : 0);
    }

    // Delay
    if (newFX.delayTime !== undefined && this.delayNode) {
      this.delayNode.delayTime.setTargetAtTime(this.fx.delayTime, this.ctx.currentTime, 0.05);
    }
    if (newFX.delayFeedback !== undefined && this.delayFeedbackGain) {
      this.delayFeedbackGain.gain.setTargetAtTime(this.fx.delayFeedback, this.ctx.currentTime, 0.02);
    }
    if ((newFX.delayMix !== undefined || newFX.delayEnabled !== undefined) && this.delayMixGain) {
      const target = this.fx.delayEnabled ? this.fx.delayMix : 0;
      this.delayMixGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.02);
    }

    // Reverb
    if (newFX.reverbSize !== undefined) {
      this.generateReverbImpulse(this.fx.reverbSize);
    }
    if ((newFX.reverbMix !== undefined || newFX.reverbEnabled !== undefined) && this.reverbMixGain) {
      const target = this.fx.reverbEnabled ? this.fx.reverbMix : 0;
      this.reverbMixGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.02);
    }

    // Master Gain
    if (newFX.masterGain !== undefined && this.masterGain) {
      this.masterGain.gain.setTargetAtTime(this.fx.masterGain, this.ctx.currentTime, 0.02);
    }
  }

  private updateDriveCurve(amount: number) {
    if (!this.driveNode) return;
    const n = 512;
    const curve = new Float32Array(n);
    const k = amount * 40;
    const deg = Math.PI / 180;
    for (let i = 0; i < n; i++) {
      const x = (i * 2) / n - 1;
      if (k === 0) {
        curve[i] = x;
      } else {
        curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
      }
    }
    this.driveNode.curve = curve;
  }

  private generateReverbImpulse(roomSize: number) {
    if (!this.ctx || !this.reverbNode) return;
    const rate = this.ctx.sampleRate;
    const length = Math.floor(rate * (0.8 + roomSize * 2.2));
    const impulse = this.ctx.createBuffer(2, length, rate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const t = i / rate;
      const decay = Math.exp(-t / (0.4 + roomSize * 0.9));
      left[i] = (Math.random() * 2 - 1) * decay;
      right[i] = (Math.random() * 2 - 1) * decay;
    }
    this.reverbNode.buffer = impulse;
  }

  // Visualizer Analyser Data
  public getVisualizerData(dataArray: Uint8Array) {
    if (this.analyserNode) {
      // Cast for modern TypeScript DOM lib ArrayBuffer vs ArrayBufferLike compatibility
      this.analyserNode.getByteFrequencyData(dataArray as unknown as Uint8Array<ArrayBuffer>);
    }
  }

  public getTimeDomainData(dataArray: Uint8Array) {
    if (this.analyserNode) {
      this.analyserNode.getByteTimeDomainData(dataArray as unknown as Uint8Array<ArrayBuffer>);
    }
  }

  // Sequencer Engine with Web Audio Clock Lookahead
  public setBpm(newBpm: number) {
    this.tempo = Math.max(40, Math.min(240, newBpm));
  }

  public setSwing(newSwing: number) {
    this.swing = Math.max(0.5, Math.min(0.75, newSwing));
  }

  public startSequencer() {
    this.resume();
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.currentStep = 0;
    this.nextStepTime = this.ctx!.currentTime + 0.05;
    this.scheduler();
  }

  public stopSequencer() {
    this.isPlaying = false;
    if (this.timerID !== null) {
      window.clearTimeout(this.timerID);
      this.timerID = null;
    }
    this.currentStep = 0;
    if (this.onStepChange) this.onStepChange(0);
  }

  private scheduler = () => {
    if (!this.isPlaying || !this.ctx) return;

    while (this.nextStepTime < this.ctx.currentTime + this.scheduleAheadTime) {
      this.scheduleStep(this.currentStep, this.nextStepTime);
      this.advanceStep();
    }
    this.timerID = window.setTimeout(this.scheduler, this.lookahead);
  };

  private advanceStep() {
    // 16th note base duration
    const secondsPerBeat = 60.0 / this.tempo;
    const baseStepDuration = 0.25 * secondsPerBeat;

    // MPC Swing formula: delay odd steps by swing offset
    const isOddStep = this.currentStep % 2 === 1;
    let stepDuration = baseStepDuration;
    if (this.swing > 0.5) {
      const swingOffset = (this.swing - 0.5) * baseStepDuration * 1.5;
      stepDuration = isOddStep ? baseStepDuration + swingOffset : baseStepDuration - swingOffset;
    }

    this.nextStepTime += stepDuration;
    this.currentStep = (this.currentStep + 1) % 16;
  }

  private scheduleStep(stepIndex: number, time: number) {
    // Notify visual UI when step time is reached
    const timeUntilStep = Math.max(0, (time - this.ctx!.currentTime) * 1000);
    setTimeout(() => {
      if (this.isPlaying && this.onStepChange) {
        this.onStepChange(stepIndex);
      }
    }, timeUntilStep);

    // Query registered step data
    if (this.getSequencerStepData) {
      const triggers = this.getSequencerStepData(stepIndex);
      for (const trig of triggers) {
        // Will be triggered by sequencer caller with appropriate bank config
      }
    }
  }

  // Master Jam WAV Recording
  public startMasterRecording(): boolean {
    if (!this.streamDestination) return false;
    this.resume();
    try {
      this.recordedChunks = [];
      const stream = this.streamDestination.stream;
      const options = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? { mimeType: 'audio/webm;codecs=opus' }
        : undefined;

      this.mediaRecorder = new MediaRecorder(stream, options);
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          this.recordedChunks.push(e.data);
        }
      };

      this.mediaRecorder.start(100);
      this.isRecordingMaster = true;
      return true;
    } catch (err) {
      console.error('Error starting master recorder:', err);
      return false;
    }
  }

  public stopMasterRecording(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No recording active'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        this.isRecordingMaster = false;
        const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        resolve(url);
      };

      this.mediaRecorder.stop();
    });
  }

  // Microphone Live Sampler
  public async recordMicSample(maxSeconds: number = 4): Promise<AudioBuffer> {
    this.resume();
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    const chunks: Blob[] = [];

    return new Promise((resolve, reject) => {
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        try {
          const blob = new Blob(chunks, { type: 'audio/webm' });
          const arrayBuffer = await blob.arrayBuffer();
          const decoded = await this.ctx!.decodeAudioData(arrayBuffer);
          resolve(decoded);
        } catch (err) {
          reject(err);
        }
      };

      mediaRecorder.start();
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, maxSeconds * 1000);
    });
  }

  // Custom audio file decoder (.mp3, .wav, .ogg)
  public async decodeAudioFile(file: File): Promise<AudioBuffer> {
    this.resume();
    const arrayBuffer = await file.arrayBuffer();
    return await this.ctx!.decodeAudioData(arrayBuffer);
  }
}

export const audioEngine = new AudioEngine();
