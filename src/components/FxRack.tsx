import React, { useRef, useState } from 'react';
import { Sliders, Zap, Radio, Disc, Waves, ShieldCheck } from 'lucide-react';
import { FXSettings } from '../types/sampler';

interface FxRackProps {
  fx: FXSettings;
  onUpdateFx: (settings: Partial<FXSettings>) => void;
}

export const FxRack: React.FC<FxRackProps> = ({ fx, onUpdateFx }) => {
  const padRef = useRef<HTMLDivElement | null>(null);
  const [touchPos, setTouchPos] = useState<{ x: number; y: number } | null>(null);

  // 2D Glass Touchpad interaction (X = Filter Cutoff, Y = Resonance)
  const handleTouchpad = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const pad = padRef.current;
    if (!pad) return;
    const rect = pad.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const normX = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const normY = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));

    setTouchPos({ x: normX * 100, y: normY * 100 });

    // Exponential frequency mapping 200Hz to 16000Hz
    const cutoff = Math.round(200 * Math.pow(16000 / 200, normX));
    // Resonance 0.5 to 12
    const resonance = +(0.5 + (1 - normY) * 11.5).toFixed(1);

    onUpdateFx({
      filterCutoff: cutoff,
      filterResonance: resonance,
      filterEnabled: true,
    });
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-white/15 flex flex-col gap-6">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-rose-500" />
          <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-zinc-200">
            DSP Multi-FX & Master Limiter
          </h3>
        </div>
        <div className="text-xs font-mono text-zinc-400">
          PROCESSAMENTO ANALÓGICO EM TEMPO REAL
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Module 1: Glass Resonant Filter & 2D XY Touchpad */}
        <div className="glass-card rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-zinc-300 flex items-center gap-1.5">
              <Waves className="w-3.5 h-3.5 text-cyan-400" />
              GLASS FILTER (XY)
            </span>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-[10px] font-mono text-zinc-400">
                {fx.filterEnabled ? 'ON' : 'BYPASS'}
              </span>
              <input
                type="checkbox"
                checked={fx.filterEnabled}
                onChange={(e) => onUpdateFx({ filterEnabled: e.target.checked })}
                className="accent-rose-500 cursor-pointer"
              />
            </label>
          </div>

          {/* Interactive XY Touchpad */}
          <div
            ref={padRef}
            onMouseDown={handleTouchpad}
            onMouseMove={(e) => e.buttons === 1 && handleTouchpad(e)}
            onTouchMove={handleTouchpad}
            className="relative h-32 rounded-lg bg-black/60 border border-white/15 overflow-hidden cursor-crosshair select-none"
          >
            {/* Grid Lines */}
            <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 pointer-events-none opacity-20">
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className="border border-white/10" />
              ))}
            </div>

            {/* Glowing Touch Cursor */}
            {touchPos && (
              <div
                className="absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-cyan-400 bg-cyan-400/30 shadow-[0_0_15px_#22d3ee] pointer-events-none transition-all duration-75"
                style={{ left: `${touchPos.x}%`, top: `${touchPos.y}%` }}
              />
            )}

            {/* Labels inside touchpad */}
            <div className="absolute bottom-1.5 left-2 text-[9px] font-mono text-zinc-500 pointer-events-none">
              CUTOFF: {fx.filterCutoff} Hz
            </div>
            <div className="absolute top-1.5 right-2 text-[9px] font-mono text-zinc-500 pointer-events-none">
              RES: Q {fx.filterResonance}
            </div>
          </div>

          {/* Filter Type Selector */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => onUpdateFx({ filterType: 'lowpass' })}
              className={`flex-1 py-1 text-xs font-mono font-medium rounded ${
                fx.filterType === 'lowpass'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-white/5 text-zinc-400'
              }`}
            >
              Low-Pass
            </button>
            <button
              onClick={() => onUpdateFx({ filterType: 'highpass' })}
              className={`flex-1 py-1 text-xs font-mono font-medium rounded ${
                fx.filterType === 'highpass'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-white/5 text-zinc-400'
              }`}
            >
              High-Pass
            </button>
          </div>
        </div>

        {/* Module 2: Supreme Drive & Saturation */}
        <div className="glass-card rounded-xl p-4 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-zinc-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-rose-500" />
              SUPREME DRIVE & WARMTH
            </span>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-[10px] font-mono text-zinc-400">
                {fx.driveEnabled ? 'ON' : 'BYPASS'}
              </span>
              <input
                type="checkbox"
                checked={fx.driveEnabled}
                onChange={(e) => onUpdateFx({ driveEnabled: e.target.checked })}
                className="accent-rose-500 cursor-pointer"
              />
            </label>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-[11px] font-mono text-zinc-400 mb-1">
                <span>SATURAÇÃO / CLIP</span>
                <span className="text-rose-400 tabular-nums">
                  {Math.round(fx.driveAmount * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={fx.driveAmount}
                onChange={(e) =>
                  onUpdateFx({ driveAmount: parseFloat(e.target.value), driveEnabled: true })
                }
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-mono text-zinc-400 mb-1">
                <span>RUIDO VINIL ANALÓGICO</span>
                <span className="text-amber-400 tabular-nums">
                  {Math.round(fx.vinylCrackle * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={fx.vinylCrackle}
                onChange={(e) => onUpdateFx({ vinylCrackle: parseFloat(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="p-2 rounded bg-black/40 border border-white/5 text-[10px] font-mono text-zinc-400">
            Adiciona saturação harmônica de válvula e textura vintage ao som.
          </div>
        </div>

        {/* Module 3: Space Reverb & Echo Delay */}
        <div className="glass-card rounded-xl p-4 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-zinc-300 flex items-center gap-1.5">
              <Disc className="w-3.5 h-3.5 text-blue-400" />
              ESPACIAL (DELAY & REVERB)
            </span>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1 text-[10px] font-mono text-zinc-400 cursor-pointer">
                <span>DLY</span>
                <input
                  type="checkbox"
                  checked={fx.delayEnabled}
                  onChange={(e) => onUpdateFx({ delayEnabled: e.target.checked })}
                  className="accent-blue-500"
                />
              </label>
              <label className="flex items-center gap-1 text-[10px] font-mono text-zinc-400 cursor-pointer">
                <span>REV</span>
                <input
                  type="checkbox"
                  checked={fx.reverbEnabled}
                  onChange={(e) => onUpdateFx({ reverbEnabled: e.target.checked })}
                  className="accent-purple-500"
                />
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-[11px] font-mono text-zinc-400 mb-1">
                <span>DELAY TIME / ECO</span>
                <span className="text-blue-400 tabular-nums">{Math.round(fx.delayTime * 1000)}ms</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.8"
                step="0.01"
                value={fx.delayTime}
                onChange={(e) =>
                  onUpdateFx({ delayTime: parseFloat(e.target.value), delayEnabled: true })
                }
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-mono text-zinc-400 mb-1">
                <span>REVERB LUSH (ROOM)</span>
                <span className="text-purple-400 tabular-nums">
                  {Math.round(fx.reverbMix * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="0.8"
                step="0.01"
                value={fx.reverbMix}
                onChange={(e) =>
                  onUpdateFx({ reverbMix: parseFloat(e.target.value), reverbEnabled: true })
                }
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Master Limiter Punch */}
          <div className="flex items-center justify-between p-2 rounded bg-rose-950/30 border border-rose-500/20">
            <span className="text-xs font-mono font-bold text-rose-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
              LIMITER MPC PUNCH
            </span>
            <input
              type="checkbox"
              checked={fx.compressorPunch}
              onChange={(e) => onUpdateFx({ compressorPunch: e.target.checked })}
              className="accent-rose-500 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
