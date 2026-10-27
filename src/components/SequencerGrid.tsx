import React, { useState } from 'react';
import { Play, Square, Trash2, Shuffle, Music, Volume2 } from 'lucide-react';
import { BankConfig, PadConfig, PatternPreset } from '../types/sampler';
import { PATTERN_PRESETS } from '../data/defaultPads';

interface SequencerGridProps {
  currentBank: BankConfig;
  pattern: boolean[][]; // [padIndex][stepIndex]
  onToggleStep: (padIndex: number, stepIndex: number) => void;
  currentStep: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onLoadPreset: (preset: PatternPreset) => void;
  onClearPattern: () => void;
  onRandomizePattern: () => void;
  selectedPadIndex: number;
  onSelectPad: (index: number) => void;
  bpm: number;
  setBpm: (bpm: number) => void;
  swing: number;
  setSwing: (swing: number) => void;
}

export const SequencerGrid: React.FC<SequencerGridProps> = ({
  currentBank,
  pattern,
  onToggleStep,
  currentStep,
  isPlaying,
  onTogglePlay,
  onLoadPreset,
  onClearPattern,
  onRandomizePattern,
  selectedPadIndex,
  onSelectPad,
  bpm,
  setBpm,
  swing,
  setSwing,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const visiblePads = currentBank.pads.filter(
    (pad) => filterCategory === 'all' || pad.category === filterCategory
  );

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-white/15 flex flex-col gap-4">
      {/* Top Toolbar: Preset selector, Transport, Clear, Randomize */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePlay}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs font-mono transition-all ${
              isPlaying
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_15px_rgba(239,35,60,0.4)]'
            }`}
          >
            {isPlaying ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>STOP</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>PLAY</span>
              </>
            )}
          </button>

          {/* Pattern Presets Dropdown */}
          <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 rounded-xl px-2.5 py-1 text-xs">
            <Music className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-zinc-400 font-mono text-[11px]">PRESET:</span>
            <select
              onChange={(e) => {
                const found = PATTERN_PRESETS.find((p) => p.id === e.target.value);
                if (found) onLoadPreset(found);
              }}
              defaultValue=""
              className="bg-transparent text-white font-mono font-medium focus:outline-none cursor-pointer"
            >
              <option value="" disabled className="bg-zinc-900 text-zinc-400">
                Escolha um Beat...
              </option>
              {PATTERN_PRESETS.map((pr) => (
                <option key={pr.id} value={pr.id} className="bg-zinc-900 text-white">
                  {pr.name} ({pr.bpm} BPM)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Groove & Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onRandomizePattern}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-mono text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
            title="Gerar ritmo aleatório"
          >
            <Shuffle className="w-3 h-3 text-amber-400" />
            <span>Aleatório</span>
          </button>

          <button
            onClick={onClearPattern}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-mono text-zinc-400 hover:text-rose-400 bg-white/5 hover:bg-rose-500/10 border border-white/10 rounded-lg transition-colors"
            title="Limpar todos os passos"
          >
            <Trash2 className="w-3 h-3" />
            <span>Limpar</span>
          </button>
        </div>
      </div>

      {/* Chaser Playhead Numbers (1 to 16) */}
      <div className="flex items-center gap-1.5 pl-36 sm:pl-44 pr-2">
        {Array.from({ length: 16 }).map((_, stepIdx) => {
          const isQuarter = stepIdx % 4 === 0;
          const isCurrent = isPlaying && currentStep === stepIdx;
          return (
            <div
              key={stepIdx}
              className={`flex-1 text-center py-1 rounded text-[10px] font-mono font-bold transition-all ${
                isCurrent
                  ? 'bg-rose-600 text-white shadow-[0_0_10px_#ef233c]'
                  : isQuarter
                  ? 'text-zinc-200 bg-white/10'
                  : 'text-zinc-500 bg-white/[0.02]'
              }`}
            >
              {stepIdx + 1}
            </div>
          );
        })}
      </div>

      {/* Grid of Tracks (16 Pads) */}
      <div className="flex flex-col gap-1.5 max-h-[460px] overflow-y-auto pr-1">
        {visiblePads.map((pad) => {
          const isSelected = selectedPadIndex === pad.id;
          const padSteps = pattern[pad.id] || Array(16).fill(false);

          return (
            <div
              key={pad.id}
              className={`flex items-center gap-1.5 p-1 rounded-xl transition-colors ${
                isSelected ? 'bg-white/[0.08] ring-1 ring-white/20' : 'bg-black/20 hover:bg-white/[0.03]'
              }`}
            >
              {/* Pad Label Header */}
              <button
                onClick={() => onSelectPad(pad.id)}
                className="w-36 sm:w-44 flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left bg-white/5 hover:bg-white/10 border border-white/10 transition-colors shrink-0"
              >
                <div className="flex items-center gap-2 truncate">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: pad.color }}
                  />
                  <div className="truncate">
                    <div className="text-xs font-bold text-white truncate">{pad.name}</div>
                    <div className="text-[9px] uppercase font-mono text-zinc-400">
                      PAD {pad.id + 1} · {pad.keyLabel ? `[${pad.keyLabel}]` : ''}
                    </div>
                  </div>
                </div>
              </button>

              {/* 16 Step Buttons */}
              <div className="flex-1 grid grid-cols-16 gap-1">
                {Array.from({ length: 16 }).map((_, stepIdx) => {
                  const isActive = padSteps[stepIdx];
                  const isCurrent = isPlaying && currentStep === stepIdx;
                  const isQuarterBeat = stepIdx % 4 === 0;

                  return (
                    <button
                      key={stepIdx}
                      onClick={() => onToggleStep(pad.id, stepIdx)}
                      className={`h-9 rounded-md transition-all relative cursor-pointer border ${
                        isActive
                          ? 'shadow-[0_0_12px_var(--step-glow)] border-white/40'
                          : isQuarterBeat
                          ? 'bg-white/10 hover:bg-white/15 border-white/10'
                          : 'bg-white/[0.03] hover:bg-white/10 border-white/5'
                      } ${isCurrent ? 'ring-2 ring-white scale-105' : ''}`}
                      style={
                        {
                          backgroundColor: isActive ? pad.color : undefined,
                          '--step-glow': pad.color,
                        } as React.CSSProperties
                      }
                      title={`Pad ${pad.id + 1} - Passo ${stepIdx + 1}`}
                    >
                      {/* Active step center dot */}
                      {isActive && (
                        <div className="absolute inset-0 m-auto w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                      )}
                      {/* Playhead sweep indicator */}
                      {isCurrent && !isActive && (
                        <div className="absolute inset-0 bg-white/20 rounded-md animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
