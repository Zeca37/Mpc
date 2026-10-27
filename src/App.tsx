import React, { useCallback, useEffect, useState } from 'react';
import { TopNav } from './components/TopNav';
import { ScreenDisplay } from './components/ScreenDisplay';
import { PadMatrix } from './components/PadMatrix';
import { SequencerGrid } from './components/SequencerGrid';
import { FxRack } from './components/FxRack';
import { SampleEditorModal } from './components/SampleEditorModal';
import { MicSamplerModal } from './components/MicSamplerModal';
import { QuickHelpModal } from './components/QuickHelpModal';
import { audioEngine } from './audio/audioEngine';
import { DEFAULT_BANKS, KEY_MAPPINGS, PATTERN_PRESETS } from './data/defaultPads';
import { BankConfig, FXSettings, PadConfig, PatternPreset, PlayMode } from './types/sampler';

const CHROMATIC_SCALE = [-12, -10, -9, -7, -5, -4, -2, 0, 2, 3, 5, 7, 8, 10, 12, 14];

export default function App() {
  const [banks, setBanks] = useState<BankConfig[]>(DEFAULT_BANKS);
  const [currentBankId, setCurrentBankId] = useState<0 | 1 | 2 | 3>(0);
  const [selectedPadIndex, setSelectedPadIndex] = useState<number>(0);
  const [activePads, setActivePads] = useState<Set<number>>(new Set());
  const [mutedPads, setMutedPads] = useState<Set<number>>(new Set());

  // Performance Modes
  const [playMode, setPlayMode] = useState<PlayMode>('normal');
  const [fullLevel, setFullLevel] = useState<boolean>(true);

  // Sequencer & Tempo
  const [bpm, setBpm] = useState<number>(92);
  const [swing, setSwing] = useState<number>(0.54);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [pattern, setPattern] = useState<boolean[][]>(PATTERN_PRESETS[0].pattern);

  // FX Settings
  const [fx, setFx] = useState<FXSettings>({
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
  });

  // Master Record
  const [isRecordingMaster, setIsRecordingMaster] = useState<boolean>(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);

  // Navigation & Modals
  const [activeTab, setActiveTab] = useState<'main' | 'sequencer' | 'fx'>('main');
  const [editingPad, setEditingPad] = useState<PadConfig | null>(null);
  const [micSamplerPadIndex, setMicSamplerPadIndex] = useState<number | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);

  const currentBank = banks[currentBankId];
  const selectedPad = currentBank.pads[selectedPadIndex];

  // Trigger audio voice and tactile backlight flash
  const triggerPad = useCallback(
    (padIdx: number, velocity: number = 1.0, pitchOffset: number = 0) => {
      audioEngine.resume();
      if (mutedPads.has(padIdx)) return;

      const pad = currentBank.pads[padIdx];
      if (!pad) return;

      const finalVel = fullLevel ? 1.0 : velocity;
      audioEngine.playPad(currentBankId, pad, finalVel, pitchOffset);

      // Illuminate pad
      setActivePads((prev) => {
        const next = new Set(prev);
        next.add(padIdx);
        return next;
      });

      setTimeout(() => {
        setActivePads((prev) => {
          const next = new Set(prev);
          next.delete(padIdx);
          return next;
        });
      }, 100);
    },
    [currentBank, currentBankId, fullLevel, mutedPads]
  );

  // Sequencer Engine Synchronization
  useEffect(() => {
    audioEngine.setBpm(bpm);
  }, [bpm]);

  useEffect(() => {
    audioEngine.setSwing(swing);
  }, [swing]);

  useEffect(() => {
    audioEngine.onStepChange = (step: number) => {
      setCurrentStep(step);

      // Trigger active pad sounds at this step in the pattern
      for (let pIdx = 0; pIdx < 16; pIdx++) {
        if (pattern[pIdx] && pattern[pIdx][step]) {
          triggerPad(pIdx, 1.0, 0);
        }
      }
    };
  }, [pattern, triggerPad]);

  // Handle Play/Stop Sequencer
  const togglePlay = () => {
    audioEngine.resume();
    if (isPlaying) {
      audioEngine.stopSequencer();
      setIsPlaying(false);
      setCurrentStep(0);
    } else {
      audioEngine.startSequencer();
      setIsPlaying(true);
    }
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not trigger if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // Spacebar: play/stop sequencer
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
        return;
      }

      // Map keys to pads
      const mappingIdx = KEY_MAPPINGS.findIndex((m) => m.code === e.code);
      if (mappingIdx !== -1) {
        e.preventDefault();
        setSelectedPadIndex(mappingIdx);

        if (playMode === '16-levels-tune') {
          const pitch = CHROMATIC_SCALE[mappingIdx] || 0;
          triggerPad(selectedPadIndex, 1.0, pitch);
        } else if (playMode === '16-levels-vel') {
          const vel = ((mappingIdx + 1) / 16) * 0.9 + 0.1;
          triggerPad(selectedPadIndex, vel, 0);
        } else {
          triggerPad(mappingIdx, 1.0, 0);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPadIndex, playMode, triggerPad, isPlaying]);

  // Master Record toggle
  const toggleMasterRecord = async () => {
    if (!isRecordingMaster) {
      const ok = audioEngine.startMasterRecording();
      if (ok) setIsRecordingMaster(true);
    } else {
      const url = await audioEngine.stopMasterRecording();
      setIsRecordingMaster(false);
      setRecordedAudioUrl(url);
    }
  };

  // Update specific pad settings
  const handleSavePad = (updatedPad: PadConfig) => {
    setBanks((prevBanks) => {
      return prevBanks.map((b) => {
        if (b.id !== currentBankId) return b;
        return {
          ...b,
          pads: b.pads.map((p) => (p.id === updatedPad.id ? updatedPad : p)),
        };
      });
    });
  };

  // Assign recorded mic sample
  const handleAssignMicSample = (padIndex: number, buffer: AudioBuffer, sampleName: string) => {
    audioEngine.setCustomBuffer(currentBankId, padIndex, buffer);
    setBanks((prevBanks) => {
      return prevBanks.map((b) => {
        if (b.id !== currentBankId) return b;
        return {
          ...b,
          pads: b.pads.map((p) => {
            if (p.id !== padIndex) return p;
            return {
              ...p,
              name: sampleName,
              customBuffer: buffer,
              trimStart: 0,
              trimEnd: 1,
            };
          }),
        };
      });
    });
  };

  // Sequencer Pattern Helpers
  const handleToggleStep = (padIndex: number, stepIndex: number) => {
    setPattern((prev) => {
      const next = prev.map((row) => [...row]);
      if (!next[padIndex]) next[padIndex] = Array(16).fill(false);
      next[padIndex][stepIndex] = !next[padIndex][stepIndex];
      return next;
    });
  };

  const handleLoadPreset = (preset: PatternPreset) => {
    setCurrentBankId(preset.bank);
    setBpm(preset.bpm);
    setPattern(preset.pattern.map((r) => [...r]));
  };

  const handleClearPattern = () => {
    setPattern(Array.from({ length: 16 }, () => Array(16).fill(false)));
  };

  const handleRandomizePattern = () => {
    const next = Array.from({ length: 16 }, () => Array(16).fill(false));
    // Core drums: kick on 0 & 8, snare on 4 & 12, hats on 16ths
    next[0][0] = true;
    next[0][8] = true;
    if (Math.random() > 0.5) next[0][10] = true;

    next[2][4] = true;
    next[2][12] = true;

    for (let s = 0; s < 16; s += 2) {
      if (Math.random() > 0.25) next[5][s] = true;
    }
    // Percussion sprinkles
    for (let s = 0; s < 16; s++) {
      if (Math.random() > 0.8) next[7][s] = true;
    }
    setPattern(next);
  };

  const handleUpdateFx = (newFx: Partial<FXSettings>) => {
    setFx((prev) => {
      const updated = { ...prev, ...newFx };
      audioEngine.updateFX(updated);
      return updated;
    });
  };

  const handleToggleMute = (padIdx: number) => {
    setMutedPads((prev) => {
      const next = new Set(prev);
      if (next.has(padIdx)) next.delete(padIdx);
      else next.add(padIdx);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#08080c] text-zinc-100 flex flex-col relative selection:bg-rose-500 selection:text-white">
      {/* Background Glass Aurora / Glow Orbs */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Top Bar adhering strictly to Top Bar contract */}
      <TopNav
        isRecordingMaster={isRecordingMaster}
        onToggleMasterRecord={toggleMasterRecord}
        recordedAudioUrl={recordedAudioUrl}
        onOpenMicSampler={() => setMicSamplerPadIndex(selectedPadIndex)}
        onOpenHelp={() => setIsHelpOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Studio Workstation */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-5 flex flex-col gap-5">
        {/* Central Glass LCD & Transport Monitor */}
        <ScreenDisplay
          currentBank={currentBank}
          selectedPad={selectedPad}
          bpm={bpm}
          setBpm={setBpm}
          swing={swing}
          setSwing={setSwing}
          isPlaying={isPlaying}
          onTogglePlay={togglePlay}
          playMode={playMode}
          setPlayMode={setPlayMode}
          fullLevel={fullLevel}
          setFullLevel={setFullLevel}
          onSelectBank={setCurrentBankId}
          currentStep={currentStep}
        />

        {/* View Tabs Switching */}
        {activeTab === 'main' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Column: 16 Glass Trigger Pads Matrix */}
            <div className="lg:col-span-8">
              <PadMatrix
                pads={currentBank.pads}
                selectedPadIndex={selectedPadIndex}
                onSelectPad={setSelectedPadIndex}
                onTriggerPad={triggerPad}
                activePads={activePads}
                playMode={playMode}
                fullLevel={fullLevel}
                onOpenSampleEditor={setEditingPad}
                onOpenMicSamplerForPad={(idx) => setMicSamplerPadIndex(idx)}
                mutedPads={mutedPads}
                onToggleMute={handleToggleMute}
              />
            </div>

            {/* Right Column: Mini Sequencer Peek & Sound Inspector */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              {/* Selected Pad Sound Card */}
              <div className="glass-panel rounded-2xl p-4 border border-white/15 flex flex-col gap-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="text-xs font-mono font-bold text-zinc-300">
                    PAD #{selectedPad.id + 1} PARÂMETROS
                  </span>
                  <button
                    onClick={() => setEditingPad(selectedPad)}
                    className="text-xs text-rose-400 hover:text-rose-300 font-mono font-medium underline"
                  >
                    Editar Onda
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold font-mono text-white shadow-md"
                    style={{ backgroundColor: selectedPad.color }}
                  >
                    #{selectedPad.id + 1}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{selectedPad.name}</div>
                    <div className="text-xs font-mono uppercase text-zinc-400">
                      Categoria: {selectedPad.category}
                    </div>
                  </div>
                </div>

                {/* Quick Faders */}
                <div className="space-y-2.5 pt-1">
                  <div>
                    <div className="flex justify-between text-[11px] font-mono text-zinc-400 mb-1">
                      <span>VOLUME DO PAD</span>
                      <span className="text-white tabular-nums">
                        {Math.round((selectedPad.volume ?? 1) * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1.5"
                      step="0.05"
                      value={selectedPad.volume ?? 1}
                      onChange={(e) =>
                        handleSavePad({ ...selectedPad, volume: parseFloat(e.target.value) })
                      }
                      className="w-full accent-rose-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-mono text-zinc-400 mb-1">
                      <span>AFINAÇÃO (PITCH)</span>
                      <span className="text-amber-400 tabular-nums">
                        {selectedPad.tune >= 0 ? `+${selectedPad.tune}` : selectedPad.tune} st
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-24"
                      max="24"
                      step="1"
                      value={selectedPad.tune || 0}
                      onChange={(e) =>
                        handleSavePad({ ...selectedPad, tune: parseInt(e.target.value) })
                      }
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => triggerPad(selectedPad.id, 1.0, 0)}
                    className="flex-1 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-mono font-bold border border-white/15 transition-colors cursor-pointer"
                  >
                    TOCAR PAD
                  </button>
                  <button
                    onClick={() => handleToggleMute(selectedPad.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-colors cursor-pointer ${
                      mutedPads.has(selectedPad.id)
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-white/5 hover:bg-white/10 text-zinc-400 border-white/10'
                    }`}
                  >
                    {mutedPads.has(selectedPad.id) ? 'DESMUTAR' : 'MUTAR'}
                  </button>
                </div>
              </div>

              {/* Quick FX Snapshot */}
              <div className="glass-panel rounded-2xl p-4 border border-white/15 flex flex-col gap-2.5">
                <div className="flex items-center justify-between pb-1 border-b border-white/10">
                  <span className="text-xs font-mono font-bold text-zinc-300">ESTADO DO DSP MASTER</span>
                  <button
                    onClick={() => setActiveTab('fx')}
                    className="text-xs text-rose-400 hover:text-rose-300 font-mono underline"
                  >
                    Abrir Rack FX
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 bg-black/40 rounded-lg border border-white/5">
                    <span className="text-zinc-500 block text-[10px]">FILTER</span>
                    <span className={fx.filterEnabled ? 'text-cyan-400 font-bold' : 'text-zinc-400'}>
                      {fx.filterEnabled ? `${fx.filterCutoff}Hz` : 'Bypass'}
                    </span>
                  </div>
                  <div className="p-2 bg-black/40 rounded-lg border border-white/5">
                    <span className="text-zinc-500 block text-[10px]">DRIVE</span>
                    <span className={fx.driveEnabled ? 'text-rose-400 font-bold' : 'text-zinc-400'}>
                      {fx.driveEnabled ? `${Math.round(fx.driveAmount * 100)}%` : 'Bypass'}
                    </span>
                  </div>
                  <div className="p-2 bg-black/40 rounded-lg border border-white/5">
                    <span className="text-zinc-500 block text-[10px]">DELAY</span>
                    <span className={fx.delayEnabled ? 'text-blue-400 font-bold' : 'text-zinc-400'}>
                      {fx.delayEnabled ? `${Math.round(fx.delayTime * 1000)}ms` : 'Bypass'}
                    </span>
                  </div>
                  <div className="p-2 bg-black/40 rounded-lg border border-white/5">
                    <span className="text-zinc-500 block text-[10px]">REVERB</span>
                    <span className={fx.reverbEnabled ? 'text-purple-400 font-bold' : 'text-zinc-400'}>
                      {fx.reverbEnabled ? `${Math.round(fx.reverbMix * 100)}%` : 'Bypass'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sequencer' && (
          <SequencerGrid
            currentBank={currentBank}
            pattern={pattern}
            onToggleStep={handleToggleStep}
            currentStep={currentStep}
            isPlaying={isPlaying}
            onTogglePlay={togglePlay}
            onLoadPreset={handleLoadPreset}
            onClearPattern={handleClearPattern}
            onRandomizePattern={handleRandomizePattern}
            selectedPadIndex={selectedPadIndex}
            onSelectPad={setSelectedPadIndex}
            bpm={bpm}
            setBpm={setBpm}
            swing={swing}
            setSwing={setSwing}
          />
        )}

        {activeTab === 'fx' && <FxRack fx={fx} onUpdateFx={handleUpdateFx} />}
      </main>

      {/* Footer info adhering to anti-slop rules */}
      <footer className="mt-auto border-t border-white/10 px-6 py-4 text-center text-xs text-zinc-500 font-mono">
        <div className="flex flex-wrap items-center justify-center gap-4">
          <span>SUPREMO MPA-2000 GLASS EDITION</span>
          <span aria-hidden="true">·</span>
          <span>MOTOR WEBAUDIO DE BAIXA LATÊNCIA</span>
          <span aria-hidden="true">·</span>
          <span>4 BANCOS DE 16 PADS (64 SONS)</span>
          <span aria-hidden="true">·</span>
          <button
            onClick={() => setIsHelpOpen(true)}
            className="hover:text-zinc-300 underline cursor-pointer"
          >
            Atalhos do Teclado
          </button>
        </div>
      </footer>

      {/* Modals */}
      {editingPad && (
        <SampleEditorModal
          pad={editingPad}
          bankId={currentBankId}
          isOpen={true}
          onClose={() => setEditingPad(null)}
          onSavePad={handleSavePad}
        />
      )}

      {micSamplerPadIndex !== null && (
        <MicSamplerModal
          isOpen={true}
          onClose={() => setMicSamplerPadIndex(null)}
          bankId={currentBankId}
          initialPadIndex={micSamplerPadIndex}
          currentBank={currentBank}
          onAssignRecordedSample={handleAssignMicSample}
        />
      )}

      <QuickHelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}
