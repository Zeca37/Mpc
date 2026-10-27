import React from 'react';
import { X, Keyboard, Zap, Mic, Music, Layers } from 'lucide-react';

interface QuickHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickHelpModal: React.FC<QuickHelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="glass-panel w-full max-w-lg rounded-2xl p-6 border border-white/20 shadow-2xl flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-rose-500" />
            <h3 className="text-base font-bold font-mono text-white">
              MANUAL DE CONTROLE SUPREMO MPA
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Keyboard Layout Chart */}
        <div className="flex flex-col gap-2">
          <div className="text-xs font-mono font-bold text-zinc-300 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            MAPA DE TECLADO 4x4 (ESTILO AKAI MPC)
          </div>
          <div className="p-3 bg-black/50 border border-white/10 rounded-xl flex flex-col gap-2 font-mono text-xs">
            <div className="flex items-center justify-between px-2 py-1 bg-white/5 rounded">
              <span className="text-zinc-400">Pads 13 a 16 (Linha Superior)</span>
              <span className="text-white font-bold bg-white/10 px-2 py-0.5 rounded border border-white/10">
                [ 1 ] [ 2 ] [ 3 ] [ 4 ]
              </span>
            </div>
            <div className="flex items-center justify-between px-2 py-1 bg-white/5 rounded">
              <span className="text-zinc-400">Pads 9 a 12 (Linha 2)</span>
              <span className="text-white font-bold bg-white/10 px-2 py-0.5 rounded border border-white/10">
                [ Q ] [ W ] [ E ] [ R ]
              </span>
            </div>
            <div className="flex items-center justify-between px-2 py-1 bg-white/5 rounded">
              <span className="text-zinc-400">Pads 5 a 8 (Linha 3)</span>
              <span className="text-white font-bold bg-white/10 px-2 py-0.5 rounded border border-white/10">
                [ A ] [ S ] [ D ] [ F ]
              </span>
            </div>
            <div className="flex items-center justify-between px-2 py-1 bg-white/5 rounded">
              <span className="text-zinc-400">Pads 1 a 4 (Bumbo / Caixa)</span>
              <span className="text-rose-400 font-bold bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/30">
                [ Z ] [ X ] [ C ] [ V ]
              </span>
            </div>
          </div>
        </div>

        {/* Pro MPC Features */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-black/40 border border-white/10 rounded-xl flex flex-col gap-1.5">
            <div className="font-bold text-amber-300 font-mono flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              16-LEVELS PITCH
            </div>
            <div className="text-zinc-400 text-[11px] leading-relaxed">
              Distribui qualquer sample (baixo 808, voz ou sino) em escala cromática pelas 16 teclas para criar melodias completas!
            </div>
          </div>

          <div className="p-3 bg-black/40 border border-white/10 rounded-xl flex flex-col gap-1.5">
            <div className="font-bold text-rose-300 font-mono flex items-center gap-1">
              <Mic className="w-3.5 h-3.5" />
              GRAVAÇÃO DE MIC
            </div>
            <div className="text-zinc-400 text-[11px] leading-relaxed">
              Clique em "Gravar Sample" ou no ícone de mic do pad para gravar beatbox, voz ou ruídos direto nos pads.
            </div>
          </div>
        </div>

        {/* Global Key Shortcuts */}
        <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-xs font-mono text-zinc-300 flex items-center justify-between">
          <span>Barra de Espaço:</span>
          <span className="text-white font-bold">Tocar / Pausar Sequenciador</span>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold rounded-lg transition-colors cursor-pointer"
        >
          ENTENDIDO, VAMOS FAZER O BEAT!
        </button>
      </div>
    </div>
  );
};
