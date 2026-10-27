import React, { useEffect, useState } from 'react';
import { Edit3, VolumeX, Mic } from 'lucide-react';
import { PadConfig, PlayMode } from '../types/sampler';

interface PadMatrixProps {
  pads: PadConfig[];
  selectedPadIndex: number;
  onSelectPad: (index: number) => void;
  onTriggerPad: (padIndex: number, velocity?: number, pitchOffset?: number) => void;
  activePads: Set<number>;
  playMode: PlayMode;
  fullLevel: boolean;
  onOpenSampleEditor: (pad: PadConfig) => void;
  onOpenMicSamplerForPad: (padIndex: number) => void;
  mutedPads: Set<number>;
  onToggleMute: (padIndex: number) => void;
}

// 16-Levels chromatic semitone offsets for the 16 pads
const CHROMATIC_SCALE = [-12, -10, -9, -7, -5, -4, -2, 0, 2, 3, 5, 7, 8, 10, 12, 14];

export const PadMatrix: React.FC<PadMatrixProps> = ({
  pads,
  selectedPadIndex,
  onSelectPad,
  onTriggerPad,
  activePads,
  playMode,
  fullLevel,
  onOpenSampleEditor,
  onOpenMicSamplerForPad,
  mutedPads,
  onToggleMute,
}) => {
  // Akai MPC layout: Row 1 is pads 12-15, Row 2 is 8-11, Row 3 is 4-7, Row 4 is 0-3
  // We render 4 rows of 4 pads
  const padRows = [
    [12, 13, 14, 15],
    [8, 9, 10, 11],
    [4, 5, 6, 7],
    [0, 1, 2, 3],
  ];

  const handlePadInteraction = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>, padIdx: number) => {
    e.preventDefault();
    onSelectPad(padIdx);

    let velocity = 1.0;
    if (!fullLevel && 'clientX' in e) {
      // Calculate distance from center of pad for organic touch dynamics
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left - rect.width / 2;
      const clickY = e.clientY - rect.top - rect.height / 2;
      const dist = Math.hypot(clickX, clickY);
      const maxDist = Math.hypot(rect.width / 2, rect.height / 2);
      velocity = Math.max(0.45, 1.0 - (dist / maxDist) * 0.55);
    }

    if (playMode === '16-levels-tune') {
      const pitchOffset = CHROMATIC_SCALE[padIdx] || 0;
      onTriggerPad(selectedPadIndex, velocity, pitchOffset);
    } else if (playMode === '16-levels-vel') {
      const vel = ((padIdx + 1) / 16) * 0.9 + 0.1;
      onTriggerPad(selectedPadIndex, vel, 0);
    } else {
      onTriggerPad(padIdx, velocity, 0);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* 4x4 Glass Pads Matrix */}
      <div className="grid grid-rows-4 gap-2.5 sm:gap-3.5 p-3.5 sm:p-5 glass-panel rounded-2xl border border-white/15">
        {padRows.map((row, rIdx) => (
          <div key={rIdx} className="grid grid-cols-4 gap-2.5 sm:gap-3.5">
            {row.map((padIdx) => {
              const pad = pads[padIdx] || {
                id: padIdx,
                name: `Pad ${padIdx + 1}`,
                category: 'percussion',
                color: '#ef233c',
                keyLabel: '',
                keyCode: '',
                volume: 1,
                pan: 0,
                tune: 0,
                trimStart: 0,
                trimEnd: 1,
                reversed: false,
                loop: false,
              };

              const isSelected = selectedPadIndex === padIdx;
              const isActive = activePads.has(padIdx);
              const isMuted = mutedPads.has(padIdx);

              // Display details for 16-levels
              let secondaryLabel = pad.keyLabel ? `[ ${pad.keyLabel} ]` : '';
              let primaryName = pad.name;

              if (playMode === '16-levels-tune') {
                const semi = CHROMATIC_SCALE[padIdx];
                primaryName = `${semi >= 0 ? '+' : ''}${semi} Semitons`;
                secondaryLabel = `Grau ${padIdx + 1}`;
              } else if (playMode === '16-levels-vel') {
                const velPct = Math.round(((padIdx + 1) / 16) * 100);
                primaryName = `Vel: ${velPct}%`;
                secondaryLabel = `Nível ${padIdx + 1}`;
              }

              return (
                <div
                  key={padIdx}
                  onMouseDown={(e) => handlePadInteraction(e, padIdx)}
                  onTouchStart={(e) => handlePadInteraction(e, padIdx)}
                  style={
                    {
                      '--pad-glow': pad.color || '#ef233c',
                    } as React.CSSProperties
                  }
                  className={`glass-pad group relative aspect-square rounded-xl p-2 sm:p-3 flex flex-col justify-between cursor-pointer select-none overflow-hidden transition-all duration-75 ${
                    isActive ? 'pad-active' : ''
                  } ${
                    isSelected
                      ? 'border-rose-500/80 shadow-[0_0_18px_rgba(239,35,60,0.4)] ring-1 ring-rose-400'
                      : ''
                  } ${isMuted ? 'opacity-40 grayscale' : ''}`}
                >
                  {/* Frosted Specular Glare */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-black/30 pointer-events-none" />

                  {/* Pad Glow Ambient Backlight */}
                  <div
                    className="absolute -inset-1 opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur-lg rounded-xl pointer-events-none"
                    style={{ backgroundColor: pad.color }}
                  />

                  {/* Top Bar on Pad: Number & Keyboard Trigger */}
                  <div className="relative z-10 flex items-center justify-between text-[11px] font-mono">
                    <span className="font-bold text-zinc-300 group-hover:text-white">
                      #{padIdx + 1}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-black/40 border border-white/10 text-[10px] text-zinc-400 font-bold tracking-tight">
                      {secondaryLabel}
                    </span>
                  </div>

                  {/* Middle: Sound Name */}
                  <div className="relative z-10 my-auto text-left">
                    <div className="text-xs sm:text-sm font-bold text-zinc-100 group-hover:text-white truncate tracking-tight">
                      {primaryName}
                    </div>
                    {playMode === 'normal' && (
                      <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 truncate mt-0.5">
                        {pad.category}
                      </div>
                    )}
                  </div>

                  {/* Bottom Pad Actions Bar */}
                  <div className="relative z-10 flex items-center justify-between pt-1 border-t border-white/5 text-[10px]">
                    <div
                      className="w-2 h-2 rounded-full shadow-sm"
                      style={{ backgroundColor: pad.color }}
                    />

                    {/* Quick Tools */}
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenMicSamplerForPad(padIdx);
                        }}
                        className="p-1 hover:text-amber-400 text-zinc-400 rounded hover:bg-white/10 transition-colors"
                        title="Gravar mic neste pad"
                      >
                        <Mic className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenSampleEditor(pad);
                        }}
                        className="p-1 hover:text-white text-zinc-400 rounded hover:bg-white/10 transition-colors"
                        title="Editar sample e onda sonora"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Under-pad Quick Toolstrip */}
      <div className="flex items-center justify-between px-3 py-2 bg-black/30 border border-white/10 rounded-xl text-xs font-mono text-zinc-400">
        <div className="flex items-center gap-2">
          <span>TECLADO ATIVO:</span>
          <span className="text-zinc-200">[ 1 2 3 4 ] · [ Q W E R ] · [ A S D F ] · [ Z X C V ]</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-rose-400 font-bold">PAD SELECIONADO: #{selectedPadIndex + 1}</span>
        </div>
      </div>
    </div>
  );
};
