import React, { useEffect, useRef, useState } from 'react';
import { X, Play, RotateCcw, Upload, Volume2, Sliders, Scissors } from 'lucide-react';
import { PadConfig } from '../types/sampler';
import { audioEngine } from '../audio/audioEngine';

interface SampleEditorModalProps {
  pad: PadConfig;
  bankId: number;
  isOpen: boolean;
  onClose: () => void;
  onSavePad: (updatedPad: PadConfig) => void;
}

export const SampleEditorModal: React.FC<SampleEditorModalProps> = ({
  pad,
  bankId,
  isOpen,
  onClose,
  onSavePad,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(pad.name);
  const [tune, setTune] = useState(pad.tune || 0);
  const [volume, setVolume] = useState(pad.volume ?? 1);
  const [pan, setPan] = useState(pad.pan || 0);
  const [trimStart, setTrimStart] = useState(pad.trimStart || 0);
  const [trimEnd, setTrimEnd] = useState(pad.trimEnd !== undefined ? pad.trimEnd : 1);
  const [reversed, setReversed] = useState(pad.reversed || false);
  const [customBuffer, setCustomBuffer] = useState<AudioBuffer | undefined>(pad.customBuffer);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Draw waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const buffer = customBuffer || audioEngine.getAudioBuffer(bankId, pad.id, pad);
    const data = buffer.getChannelData(0);
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Dark grid background
    ctx.fillStyle = '#08080c';
    ctx.fillRect(0, 0, width, height);

    // Waveform drawing
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#06d6a0';
    ctx.beginPath();

    const step = Math.ceil(data.length / width);
    const amp = height / 2;

    for (let i = 0; i < width; i++) {
      let min = 1.0;
      let max = -1.0;
      for (let j = 0; j < step; j++) {
        const datum = data[i * step + j];
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }
      ctx.moveTo(i, (1 + min) * amp);
      ctx.lineTo(i, (1 + max) * amp);
    }
    ctx.stroke();

    // Dim regions outside trim
    const startX = trimStart * width;
    const endX = trimEnd * width;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fillRect(0, 0, startX, height);
    ctx.fillRect(endX, 0, width - endX, height);

    // Trim markers
    ctx.strokeStyle = '#ef233c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(startX, 0);
    ctx.lineTo(startX, height);
    ctx.moveTo(endX, 0);
    ctx.lineTo(endX, height);
    ctx.stroke();
  }, [trimStart, trimEnd, customBuffer, pad, bankId]);

  const handlePreview = () => {
    const tempConfig: PadConfig = {
      ...pad,
      name,
      tune,
      volume,
      pan,
      trimStart,
      trimEnd,
      reversed,
      customBuffer,
    };
    audioEngine.playPad(bankId, tempConfig, 1.0, 0);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const decoded = await audioEngine.decodeAudioFile(file);
      setCustomBuffer(decoded);
      setName(file.name.replace(/\.[^/.]+$/, '').slice(0, 20));
      audioEngine.setCustomBuffer(bankId, pad.id, decoded);
    } catch {
      alert('Formato de áudio não suportado. Utilize .wav, .mp3 ou .ogg.');
    }
  };

  const handleSave = () => {
    onSavePad({
      ...pad,
      name,
      tune,
      volume,
      pan,
      trimStart,
      trimEnd,
      reversed,
      customBuffer,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-xl rounded-2xl p-6 border border-white/20 shadow-2xl flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-rose-500" />
            <h3 className="text-base font-bold font-mono text-white">
              EDITOR DE SAMPLE · PAD #{pad.id + 1}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sound Name & Upload */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="text-[11px] font-mono text-zinc-400 uppercase">Nome do Som</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-1.5 text-sm font-semibold text-white focus:outline-none focus:border-rose-400"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-zinc-400 uppercase">Substituir Áudio</label>
            <label className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/15 text-white border border-white/20 rounded-lg text-xs font-mono font-medium cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5 text-amber-400" />
              <span>Arquivo (.wav / .mp3)</span>
              <input type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Waveform Editor Display */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span className="flex items-center gap-1">
              <Scissors className="w-3.5 h-3.5 text-rose-400" />
              TRIM / CORTE DE TRANSIENTE
            </span>
            <span className="text-zinc-500">
              Início: {Math.round(trimStart * 100)}% · Fim: {Math.round(trimEnd * 100)}%
            </span>
          </div>
          <canvas
            ref={canvasRef}
            width={520}
            height={100}
            className="w-full h-24 rounded-lg border border-white/10 bg-black"
          />

          {/* Trim sliders */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <span className="text-[10px] font-mono text-zinc-400">Trim Início</span>
              <input
                type="range"
                min="0"
                max={Math.min(0.95, trimEnd - 0.05)}
                step="0.01"
                value={trimStart}
                onChange={(e) => setTrimStart(parseFloat(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>
            <div>
              <span className="text-[10px] font-mono text-zinc-400">Trim Fim</span>
              <input
                type="range"
                min={Math.max(0.05, trimStart + 0.05)}
                max="1"
                step="0.01"
                value={trimEnd}
                onChange={(e) => setTrimEnd(parseFloat(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Pitch, Volume, Pan */}
        <div className="grid grid-cols-3 gap-4 p-3 bg-black/40 border border-white/10 rounded-xl">
          <div>
            <div className="flex justify-between text-[11px] font-mono text-zinc-400 mb-1">
              <span>AFINAÇÃO</span>
              <span className="text-amber-400 tabular-nums">
                {tune >= 0 ? `+${tune}` : tune} st
              </span>
            </div>
            <input
              type="range"
              min="-24"
              max="24"
              step="1"
              value={tune}
              onChange={(e) => setTune(parseInt(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-[11px] font-mono text-zinc-400 mb-1">
              <span>VOLUME</span>
              <span className="text-rose-400 tabular-nums">{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1.5"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-[11px] font-mono text-zinc-400 mb-1">
              <span>PANORAMA</span>
              <span className="text-cyan-400 tabular-nums">
                {pan === 0 ? 'C' : pan < 0 ? `L${Math.round(-pan * 100)}` : `R${Math.round(pan * 100)}`}
              </span>
            </div>
            <input
              type="range"
              min="-1"
              max="1"
              step="0.1"
              value={pan}
              onChange={(e) => setPan(parseFloat(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <button
            onClick={handlePreview}
            className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold rounded-lg border border-white/15 transition-colors cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current text-rose-400" />
            <span>OUVIR SAMPLE</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold rounded-lg shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
            >
              SALVAR NO PAD
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
