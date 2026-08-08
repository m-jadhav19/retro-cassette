import React from 'react';
import { HistoryEntry } from '../types';

type PlayerMode = 'walkman' | 'turntable' | 'cd_player';

interface HistoryStackerProps {
  history: HistoryEntry[];
  playerMode: PlayerMode;
  cassetteSide?: 'A' | 'B';
  isExpanded: boolean;
  onToggleExpand: () => void;
  onReplay: (entry: HistoryEntry) => void;
  onClear: () => void;
}

const modeStyles: Record<PlayerMode, { accent: string; bg: string; border: string; label: string }> = {
  walkman: { accent: 'text-purple-400', bg: 'bg-slate-900/90', border: 'border-purple-500/30', label: 'TAPE RACK' },
  turntable: { accent: 'text-amber-400', bg: 'bg-[#2c1810]/95', border: 'border-amber-700/40', label: 'RECORD CRATE' },
  cd_player: { accent: 'text-blue-400', bg: 'bg-slate-100/95', border: 'border-blue-300/50', label: 'DISC STACK' },
};

const formatPlayedAt = (ts: number) => {
  const d = new Date(ts);
  const now = new Date();
  const diffMin = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffMin < 1440) return `${Math.floor(diffMin / 60)}h ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const HistoryStacker: React.FC<HistoryStackerProps> = ({
  history,
  playerMode,
  cassetteSide,
  isExpanded,
  onToggleExpand,
  onReplay,
  onClear,
}) => {
  const style = modeStyles[playerMode];
  const stackPreview = history.slice(0, 5);
  const rackLabel = playerMode === 'walkman' && cassetteSide === 'B' ? 'SIDE B RACK' : style.label;

  return (
    <div className={`absolute bottom-6 left-6 z-50 flex flex-col items-start gap-2 pointer-events-auto`}>
      {/* Collapsed stack preview */}
      <button
        onClick={onToggleExpand}
        className={`relative group ${style.bg} backdrop-blur-md border ${style.border} rounded-lg shadow-2xl transition-all duration-300 hover:scale-[1.02] ${isExpanded ? 'opacity-0 pointer-events-none h-0 overflow-hidden' : ''}`}
        title="Play history"
      >
        <div className="px-3 pt-2 pb-1">
          <p className={`text-[9px] font-bold tracking-[0.2em] ${style.accent} opacity-80`}>{rackLabel}</p>
        </div>
        <div className="relative w-28 h-24 mx-3 mb-3">
          {stackPreview.length === 0 ? (
            <div className="w-full h-full rounded border border-dashed border-gray-600/50 flex items-center justify-center">
              <span className="text-[9px] text-gray-500 font-mono">empty</span>
            </div>
          ) : (
            stackPreview.map((entry, i) => (
              <div
                key={`${entry.id}-${entry.playedAt}`}
                className="absolute w-20 h-20 rounded shadow-lg border border-white/10 overflow-hidden transition-transform group-hover:translate-y-[-2px]"
                style={{
                  left: i * 6,
                  top: i * 4,
                  zIndex: stackPreview.length - i,
                  transform: `rotate(${(i - 2) * 3}deg)`,
                }}
              >
                {entry.artworkUrl ? (
                  <img src={entry.artworkUrl} alt="" className="w-full h-full object-cover" draggable={false} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[8px] font-bold p-1 text-center" style={{ backgroundColor: entry.color, color: entry.accentColor }}>
                    {entry.title.slice(0, 12)}
                  </div>
                )}
              </div>
            ))
          )}
          {history.length > 0 && (
            <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full ${playerMode === 'cd_player' ? 'bg-blue-500' : playerMode === 'turntable' ? 'bg-amber-600' : 'bg-purple-500'} text-white text-[10px] font-bold flex items-center justify-center shadow-md`}>
              {history.length}
            </span>
          )}
        </div>
      </button>

      {/* Expanded panel */}
      <div
        className={`${style.bg} backdrop-blur-md border ${style.border} rounded-xl shadow-2xl overflow-hidden transition-all duration-300 origin-bottom-left
          ${isExpanded ? 'w-72 max-h-96 opacity-100 scale-100' : 'w-0 h-0 opacity-0 scale-95 pointer-events-none'}`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div>
            <p className={`text-xs font-bold tracking-widest ${style.accent}`}>{rackLabel}</p>
            <p className={`text-[10px] ${playerMode === 'cd_player' ? 'text-gray-500' : 'text-gray-400'} mt-0.5`}>
              {history.length} track{history.length !== 1 ? 's' : ''} played
            </p>
          </div>
          <div className="flex gap-1">
            {history.length > 0 && (
              <button
                onClick={onClear}
                className={`text-[9px] px-2 py-1 rounded ${playerMode === 'cd_player' ? 'text-gray-500 hover:bg-gray-200' : 'text-gray-400 hover:bg-white/10'} transition-colors`}
              >
                CLEAR
              </button>
            )}
            <button
              onClick={onToggleExpand}
              className={`text-[9px] px-2 py-1 rounded ${playerMode === 'cd_player' ? 'text-gray-600 hover:bg-gray-200' : 'text-gray-300 hover:bg-white/10'} transition-colors`}
            >
              ✕
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-72 scrollbar-hide">
          {history.length === 0 ? (
            <p className={`text-xs text-center py-8 ${playerMode === 'cd_player' ? 'text-gray-400' : 'text-gray-500'}`}>
              Drop a track into the player to start your history
            </p>
          ) : (
            history.map((entry) => (
              <button
                key={`${entry.id}-${entry.playedAt}`}
                onClick={() => onReplay(entry)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors text-left
                  ${playerMode === 'cd_player' ? 'hover:bg-blue-50 border-b border-gray-100' : 'hover:bg-white/5 border-b border-white/5'}`}
              >
                <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0 shadow-md border border-white/10">
                  {entry.artworkUrl ? (
                    <img src={entry.artworkUrl} alt="" className="w-full h-full object-cover" draggable={false} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[7px] font-bold" style={{ backgroundColor: entry.color, color: entry.accentColor }}>
                      ♪
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold truncate ${playerMode === 'cd_player' ? 'text-gray-800' : 'text-gray-100'}`}>
                    {entry.title}
                  </p>
                  <p className={`text-[10px] truncate ${playerMode === 'cd_player' ? 'text-gray-500' : 'text-gray-400'}`}>
                    {entry.artist}
                  </p>
                </div>
                <span className={`text-[9px] font-mono flex-shrink-0 ${playerMode === 'cd_player' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {formatPlayedAt(entry.playedAt)}
                </span>
              </button>
            ))
          )}
        </div>

        {history.length > 0 && (
          <div className={`px-3 py-2 border-t ${playerMode === 'cd_player' ? 'border-gray-200 bg-gray-50' : 'border-white/10 bg-black/20'}`}>
            <p className={`text-[9px] text-center ${playerMode === 'cd_player' ? 'text-gray-400' : 'text-gray-500'}`}>
              Click a track to pull it back onto the desk
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryStacker;
