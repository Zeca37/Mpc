import React from 'react';
import { Circle, Download, HelpCircle, Mic, Music2, Radio } from 'lucide-react';

interface TopNavProps {
  isRecordingMaster: boolean;
  onToggleMasterRecord: () => void;
  recordedAudioUrl: string | null;
  onOpenMicSampler: () => void;
  onOpenHelp: () => void;
  activeTab: 'main' | 'sequencer' | 'fx';
  setActiveTab: (tab: 'main' | 'sequencer' | 'fx') => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  isRecordingMaster,
  onToggleMasterRecord,
  recordedAudioUrl,
  onOpenMicSampler,
  onOpenHelp,
  activeTab,
  setActiveTab,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3 border-b border-white/10 glass-panel sticky top-0 z-40">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="px-2.5 py-1 supreme-badge rounded text-sm tracking-tighter uppercase font-black">
          SUPREMO
        </div>
        <span className="text-sm font-semibold tracking-wider text-zinc-300 font-mono hidden sm:inline">
          MPA-2000 <span className="text-zinc-500 font-normal">GLASS EDITION</span>
        </span>
      </div>

      {/* Zone 2: Clean single-line navigation buttons */}
      <nav className="flex items-center gap-1.5 p-1 bg-white/[0.04] rounded-lg border border-white/10 shrink-0">
        <button
          onClick={() => setActiveTab('main')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'main'
              ? 'bg-white/15 text-white shadow-sm border border-white/20'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Pads & Som
        </button>
        <button
          onClick={() => setActiveTab('sequencer')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'sequencer'
              ? 'bg-white/15 text-white shadow-sm border border-white/20'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Sequenciador 16-Step
        </button>
        <button
          onClick={() => setActiveTab('fx')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'fx'
              ? 'bg-white/15 text-white shadow-sm border border-white/20'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Rack FX & DSP
        </button>
      </nav>

      {/* Zone 3: Actions (Mic Sample + Master Record/Export + Help) */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={onOpenMicSampler}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 rounded-lg transition-colors whitespace-nowrap shrink-0"
          title="Gravar sample com microfone"
        >
          <Mic className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden md:inline">Gravar Sample</span>
        </button>

        {recordedAudioUrl && !isRecordingMaster && (
          <a
            href={recordedAudioUrl}
            download="supremo_master_beat.webm"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 rounded-lg transition-colors whitespace-nowrap shrink-0"
            title="Baixar gravação master"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Baixar WAV</span>
          </a>
        )}

        <button
          onClick={onToggleMasterRecord}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
            isRecordingMaster
              ? 'bg-rose-600 text-white animate-pulse shadow-[0_0_15px_rgba(239,35,60,0.6)]'
              : 'bg-white/10 hover:bg-white/15 text-white border border-white/15'
          }`}
        >
          <Circle className={`w-3 h-3 fill-current ${isRecordingMaster ? 'text-white' : 'text-rose-500'}`} />
          <span>{isRecordingMaster ? 'Gravando Master...' : 'Gravar Master'}</span>
        </button>

        <button
          onClick={onOpenHelp}
          className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          title="Atalhos e instruções de uso"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
