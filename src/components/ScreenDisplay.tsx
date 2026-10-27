import React, { useEffect, useRef, useState } from 'react';
import { Play, Square, Volume2, Sparkles, Sliders, Activity, Disc } from 'lucide-react';
import { audioEngine } from '../audio/audioEngine';
import { BankConfig, PadConfig, PlayMode } from '../types/sampler';

interface ScreenDisplayProps {
  currentBank: BankConfig;
  selectedPad: PadConfig;
  bpm: number;
  setBpm: (bpm: number) => void;
  swing: number;
  setSwing: (swing: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  playMode: PlayMode;
  setPlayMode: (mode: PlayMode) => void;
  fullLevel: boolean;
  setFullLevel: (val: boolean) => void;
  onSelectBank: (id: 0 | 1 | 2 | 3) => void;
  currentStep: number;
}

export const ScreenDisplay: React.FC<ScreenDisplayProps> = ({
  currentBank,
  selectedPad,
  bpm,
  setBpm,
  swing,
  setSwing,
  isPlaying,
  onTogglePlay,
  playMode,
  setPlayMode,
  fullLevel,
  setFullLevel,
  onSelectBank,
  currentStep,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [visualMode, setVisualMode] = useState<'spectrum' | 'oscilloscope'>('spectrum');
  const tapTimesRef = useRef<number[]>([]);

  // Real-time canvas visualizer loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dataArray = new Uint8Array(64);

    const render = () => {
      animId = requestAnimationFrame(render);
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Subtle frosted grid background in display
      ctx.fillStyle = 'rgba(8, 9, 14, 0.7)';
      ctx.fillRect(0, 0, width, height);

      // Grid scanlines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      for (let y = 0; y < height; y += 8) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      if (visualMode === 'spectrum') {
        audioEngine.getVisualizerData(dataArray);
        const barWidth = width / 32;
        for (let i = 0; i < 32; i++) {
          const val = dataArray[i * 2] / 255;
          const barHeight = val * (height - 6);

          // Crimson to cyan gradient
          const grad = ctx.createLinearGradient(0, height, 0, 0);
          grad.addColorStop(0, 'rgba(239, 35, 60, 0.9)');
          grad.addColorStop(0.6, 'rgba(255, 183, 3, 0.9)');
          grad.addColorStop(1, 'rgba(67, 97, 238, 1)');

          ctx.fillStyle = grad;
          ctx.fillRect(i * barWidth + 1, height - barHeight, barWidth - 2, barHeight);

          // Peak cap
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.fillRect(i * barWidth + 1, height - barHeight - 2, barWidth - 2, 2);
        }
      } else {
        // Oscilloscope
        audioEngine.getTimeDomainData(dataArray);
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#ef233c';
        ctx.shadowColor = '#ef233c';
        ctx.shadowBlur = 8;
        ctx.beginPath();

        const sliceWidth = width / 64;
        let x = 0;
        for (let i = 0; i < 64; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * height) / 2;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
          x += sliceWidth;
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [visualMode]);

  // Tap tempo handler
  const handleTapTempo = () => {
    const now = Date.now();
    const times = tapTimesRef.current;
    times.push(now);
    if (times.length > 4) times.shift();

    if (times.length >= 2) {
      let intervals = 0;
      for (let i = 1; i < times.length; i++) {
        intervals += times[i] - times[i - 1];
      }
      const avgInterval = intervals / (times.length - 1);
      const calculatedBpm = Math.round(60000 / avgInterval);
      if (calculatedBpm >= 50 && calculatedBpm <= 220) {
        setBpm(calculatedBpm);
      }
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5 mb-5 border border-white/15 relative overflow-hidden">
      {/* Background neon ambient highlight */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Display Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Left Column: LCD Status & Waveform Visualizer */}
        <div className="lg:col-span-5 flex flex-col gap-2.5">
          {/* OLED Glass Screen Frame */}
          <div className="relative rounded-xl overflow-hidden border border-white/15 bg-black/60 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] p-3">
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-2">
              <span className="flex items-center gap-1.5 font-bold tracking-wider text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_#ef233c]" />
                {currentBank.genre}
              </span>
              <button
                onClick={() => setVisualMode(visualMode === 'spectrum' ? 'oscilloscope' : 'spectrum')}
                className="hover:text-white transition-colors cursor-pointer text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 border border-white/10"
              >
                {visualMode === 'spectrum' ? 'FFT Spectrum' : 'Oscilloscope'}
              </button>
            </div>

            {/* Visualizer Canvas */}
            <canvas
              ref={canvasRef}
              width={320}
              height={70}
              className="w-full h-16 rounded bg-black/70 border border-white/5"
            />

            {/* Sub-header info */}
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10 text-xs font-mono">
              <div className="text-zinc-300">
                PAD <span className="font-bold text-white">{selectedPad.id + 1}</span>:{' '}
                <span className="text-zinc-100 font-semibold">{selectedPad.name}</span>
              </div>
              <div className="text-zinc-400 tabular-nums">
                VOL: {Math.round(selectedPad.volume * 100)}%
              </div>
            </div>
          </div>
        </div>

        {/* Center Column: Bank Selector & 16-Levels Controls */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          {/* Bank Selectors (A, B, C, D) */}
          <div className="flex items-center justify-between bg-black/40 border border-white/10 rounded-xl p-1.5">
            <span className="text-xs font-mono font-bold text-zinc-400 px-2 tracking-wider">BANCOS</span>
            <div className="flex items-center gap-1">
              {([0, 1, 2, 3] as const).map((bId) => {
                const isCurrent = currentBank.id === bId;
                const labels = ['A', 'B', 'C', 'D'];
                return (
                  <button
                    key={bId}
                    onClick={() => onSelectBank(bId)}
                    className={`px-3 py-1.5 text-xs font-bold font-mono rounded-lg transition-all ${
                      isCurrent
                        ? 'bg-rose-600 text-white shadow-[0_0_12px_rgba(239,35,60,0.5)] border border-rose-400'
                        : 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-transparent'
                    }`}
                  >
                    BANK {labels[bId]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* MPC Pro Mode Controls */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() =>
                setPlayMode(playMode === '16-levels-tune' ? 'normal' : '16-levels-tune')
              }
              className={`px-2.5 py-2 text-xs font-medium rounded-lg border transition-all text-center ${
                playMode === '16-levels-tune'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                  : 'bg-white/5 hover:bg-white/10 text-zinc-300 border-white/10'
              }`}
              title="Distribui o sample selecionado em escala cromática nas 16 teclas!"
            >
              <div className="text-[10px] text-zinc-400 uppercase tracking-wider">16-Levels</div>
              <div className="font-bold">Pitch Scale</div>
            </button>

            <button
              onClick={() =>
                setPlayMode(playMode === '16-levels-vel' ? 'normal' : '16-levels-vel')
              }
              className={`px-2.5 py-2 text-xs font-medium rounded-lg border transition-all text-center ${
                playMode === '16-levels-vel'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                  : 'bg-white/5 hover:bg-white/10 text-zinc-300 border-white/10'
              }`}
              title="Distribui velocidades de 1 a 16 nos pads"
            >
              <div className="text-[10px] text-zinc-400 uppercase tracking-wider">16-Levels</div>
              <div className="font-bold">Velocity</div>
            </button>

            <button
              onClick={() => setFullLevel(!fullLevel)}
              className={`px-2.5 py-2 text-xs font-medium rounded-lg border transition-all text-center ${
                fullLevel
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-[0_0_12px_rgba(239,35,60,0.3)]'
                  : 'bg-white/5 hover:bg-white/10 text-zinc-300 border-white/10'
              }`}
              title="Força velocidade 100% (Full Level como no Akai MPC original)"
            >
              <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Touch</div>
              <div className="font-bold">{fullLevel ? 'Full 127' : 'Sensível'}</div>
            </button>
          </div>
        </div>

        {/* Right Column: Transport & Tempo Station */}
        <div className="lg:col-span-3 flex flex-col gap-2.5 bg-black/40 border border-white/10 rounded-xl p-3">
          {/* BPM & Swing Row */}
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Tempo</div>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="50"
                  max="220"
                  value={bpm}
                  onChange={(e) => setBpm(Number(e.target.value))}
                  className="w-16 bg-white/10 border border-white/15 rounded px-1.5 py-0.5 text-sm font-mono font-bold text-white text-center tabular-nums focus:outline-none focus:border-rose-400"
                />
                <span className="text-[11px] font-mono text-zinc-400">BPM</span>
              </div>
            </div>

            <button
              onClick={handleTapTempo}
              className="px-2.5 py-1 text-xs font-mono font-bold bg-white/10 hover:bg-white/20 active:bg-rose-600 active:text-white text-zinc-200 border border-white/15 rounded-lg transition-colors"
            >
              TAP
            </button>

            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Swing</div>
              <div className="text-xs font-mono font-bold text-amber-300 tabular-nums">
                {Math.round(swing * 100)}%
              </div>
            </div>
          </div>

          {/* Master Transport Button */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={onTogglePlay}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl font-bold text-sm tracking-wide transition-all ${
                isPlaying
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_0_18px_rgba(16,185,129,0.5)]'
                  : 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
              }`}
            >
              {isPlaying ? (
                <>
                  <Square className="w-4 h-4 fill-current" />
                  <span>PARAR RITMO</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current text-rose-400" />
                  <span>TOCAR RITMO</span>
                </>
              )}
            </button>

            {/* Step Chaser Indicator */}
            <div className="px-2.5 py-1.5 bg-black/60 border border-white/15 rounded-lg text-center font-mono">
              <div className="text-[9px] text-zinc-500 uppercase">Passo</div>
              <div className="text-xs font-bold text-rose-400 tabular-nums">
                {isPlaying ? currentStep + 1 : '--'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
