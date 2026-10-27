import React, { useEffect, useRef, useState } from 'react';
import { X, Mic, Square, Play, Check, AlertCircle } from 'lucide-react';
import { audioEngine } from '../audio/audioEngine';
import { BankConfig, PadConfig } from '../types/sampler';

interface MicSamplerModalProps {
  isOpen: boolean;
  onClose: () => void;
  bankId: number;
  initialPadIndex: number;
  currentBank: BankConfig;
  onAssignRecordedSample: (padIndex: number, buffer: AudioBuffer, sampleName: string) => void;
}

export const MicSamplerModal: React.FC<MicSamplerModalProps> = ({
  isOpen,
  onClose,
  bankId,
  initialPadIndex,
  currentBank,
  onAssignRecordedSample,
}) => {
  if (!isOpen) return null;

  const [targetPad, setTargetPad] = useState<number>(initialPadIndex);
  const [sampleName, setSampleName] = useState<string>(`Mic Sample ${initialPadIndex + 1}`);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedBuffer, setRecordedBuffer] = useState<AudioBuffer | null>(null);
  const [recordProgress, setRecordProgress] = useState<number>(0);
  const [micError, setMicError] = useState<string | null>(null);
  const [inputLevel, setInputLevel] = useState<number>(0);

  const streamRef = useRef<MediaStream | null>(null);
  const animRef = useRef<number | null>(null);

  // Monitor live mic level
  useEffect(() => {
    let audioCtx: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let source: MediaStreamAudioSourceNode | null = null;

    const setupMicMeter = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        const data = new Uint8Array(analyser.frequencyBinCount);
        const checkLevel = () => {
          if (!analyser) return;
          analyser.getByteFrequencyData(data);
          let sum = 0;
          for (let i = 0; i < data.length; i++) sum += data[i];
          const avg = sum / data.length / 255;
          setInputLevel(Math.min(1, avg * 3.5));
          animRef.current = requestAnimationFrame(checkLevel);
        };
        checkLevel();
      } catch (err) {
        setMicError('Acesso ao microfone foi recusado ou não está disponível.');
      }
    };

    setupMicMeter();

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioCtx) audioCtx.close();
    };
  }, []);

  const handleStartRecord = async () => {
    setMicError(null);
    setIsRecording(true);
    setRecordProgress(0);

    const startTime = Date.now();
    const durationMs = 3500;

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / durationMs) * 100));
      setRecordProgress(pct);
      if (pct >= 100) {
        clearInterval(progressInterval);
      }
    }, 50);

    try {
      const buffer = await audioEngine.recordMicSample(3.5);
      setRecordedBuffer(buffer);
      setIsRecording(false);
      clearInterval(progressInterval);
      setRecordProgress(100);
    } catch {
      setMicError('Falha ao capturar o microfone.');
      setIsRecording(false);
      clearInterval(progressInterval);
    }
  };

  const handlePreview = () => {
    if (!recordedBuffer) return;
    const tempConfig: PadConfig = {
      id: targetPad,
      name: sampleName,
      category: 'vocal',
      color: '#ff0033',
      keyLabel: '',
      keyCode: '',
      volume: 1,
      pan: 0,
      tune: 0,
      trimStart: 0,
      trimEnd: 1,
      reversed: false,
      loop: false,
      customBuffer: recordedBuffer,
    };
    audioEngine.playPad(bankId, tempConfig, 1.0, 0);
  };

  const handleAssign = () => {
    if (!recordedBuffer) return;
    onAssignRecordedSample(targetPad, recordedBuffer, sampleName);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="glass-panel w-full max-w-lg rounded-2xl p-6 border border-white/20 shadow-2xl flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold font-mono text-white">
              GRAVAR SAMPLE AO VIVO (MIC)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {micError && (
          <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{micError}</span>
          </div>
        )}

        {/* Live Input VU Meter */}
        <div className="p-3 bg-black/50 border border-white/10 rounded-xl flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>SINAL DE ENTRADA DO MICROFONE</span>
            <span className="text-emerald-400 font-bold">{Math.round(inputLevel * 100)}%</span>
          </div>
          {/* VU Meter Bar */}
          <div className="h-3 w-full bg-black/60 rounded-full overflow-hidden p-0.5 border border-white/10">
            <div
              className="h-full rounded-full transition-all duration-75"
              style={{
                width: `${Math.max(4, inputLevel * 100)}%`,
                background:
                  inputLevel > 0.85
                    ? '#ef233c'
                    : inputLevel > 0.6
                    ? '#fbbf24'
                    : '#10b981',
              }}
            />
          </div>
        </div>

        {/* Record Station */}
        <div className="flex flex-col items-center justify-center py-4 bg-black/30 border border-white/10 rounded-xl gap-3">
          <button
            onClick={handleStartRecord}
            disabled={isRecording}
            className={`w-20 h-20 rounded-full flex flex-col items-center justify-center transition-all cursor-pointer ${
              isRecording
                ? 'bg-rose-600 text-white animate-pulse shadow-[0_0_25px_#ef233c]'
                : 'bg-white/10 hover:bg-rose-600/80 text-white border-2 border-white/20 hover:border-rose-400'
            }`}
          >
            {isRecording ? (
              <Square className="w-8 h-8 fill-current" />
            ) : (
              <Mic className="w-8 h-8 text-rose-400" />
            )}
          </button>

          <div className="text-center font-mono">
            <div className="text-xs font-bold text-white">
              {isRecording ? 'GRAVANDO VOZ / BEATBOX...' : 'Clique para Gravar (3.5s)'}
            </div>
            {isRecording && (
              <div className="text-[11px] text-rose-400 mt-1">Progresso: {recordProgress}%</div>
            )}
          </div>
        </div>

        {/* Assignment Settings */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-mono text-zinc-400 uppercase">Atribuir ao Pad</label>
            <select
              value={targetPad}
              onChange={(e) => {
                const idx = Number(e.target.value);
                setTargetPad(idx);
                setSampleName(`Mic Sample ${idx + 1}`);
              }}
              className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none cursor-pointer"
            >
              {currentBank.pads.map((p) => (
                <option key={p.id} value={p.id} className="bg-zinc-900 text-white">
                  Pad #{p.id + 1} - {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-mono text-zinc-400 uppercase">Nome do Sample</label>
            <input
              type="text"
              value={sampleName}
              onChange={(e) => setSampleName(e.target.value)}
              className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <button
            onClick={handlePreview}
            disabled={!recordedBuffer}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
              recordedBuffer
                ? 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
                : 'bg-white/5 text-zinc-600 cursor-not-allowed'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current text-rose-400" />
            <span>Ouvir Gravação</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Fechar
            </button>
            <button
              onClick={handleAssign}
              disabled={!recordedBuffer}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                recordedBuffer
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>GRAVAR NO PAD</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
