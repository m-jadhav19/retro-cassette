import React, { useState, useRef, useEffect } from 'react';
import { searchMusic } from './services/geminiService';
import { Song, PlayerStatus, HistoryEntry } from './types';
import { DEFAULT_SONGS } from './constants';
import { playSfx, unlockAudio } from './services/sfxService';
import Cassette from './components/Cassette';
import Walkman from './components/Walkman';
import Turntable from './components/Turntable';
import CDPlayer from './components/CDPlayer';
import Vinyl from './components/Vinyl';
import CompactDisc from './components/CompactDisc';
import HistoryStacker from './components/HistoryStacker';
import DeskLamp from './components/DeskLamp';
import AnalogImperfections from './components/AnalogImperfections';
import { WalkmanBackground, TurntableBackground, CDPlayerBackground } from './components/Backgrounds';

const HISTORY_STORAGE_KEY = 'retro-cassette-play-history';
const MAX_HISTORY = 30;

const loadHistory = (): HistoryEntry[] => {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryEntry[];
    return Array.isArray(parsed) ? parsed.slice(0, MAX_HISTORY) : [];
  } catch {
    return [];
  }
};

interface DragState {
  id: string;
  offsetX: number;
  offsetY: number;
}

type PlayerMode = 'walkman' | 'turntable' | 'cd_player';

const NotebookUI: React.FC<{
  query: string;
  setQuery: (q: string) => void;
  handleSearch: (e: React.FormEvent) => void;
  handleSurpriseMe: () => void;
  isLoading: boolean;
  searchMessage: string | null;
  mode: PlayerMode;
}> = ({ query, setQuery, handleSearch, handleSurpriseMe, isLoading, searchMessage, mode }) => {
  
  const isWalkman = mode === 'walkman';
  const isTurntable = mode === 'turntable';
  const isCDPlayer = mode === 'cd_player';

  return (
    <div className={`absolute z-40 transform transition-all duration-500 ease-out origin-top-right
      ${isWalkman ? 'top-auto bottom-[6%] right-[4%] w-[260px] opacity-55 hover:opacity-90 scale-90 hover:scale-95 rotate-1' : 'top-[5%] right-[8%] w-[340px] rotate-2 hover:rotate-0'}
    `}>
      {/* Notebook Spiral Binding (Only for Walkman) */}
      {isWalkman && (
        <div className="absolute left-0 top-0 w-full h-8 z-20 flex justify-evenly">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="w-3 h-6 bg-gray-400 rounded-full border-2 border-gray-500 shadow-md -mt-3"></div>
          ))}
        </div>
      )}

      {/* Book Spine/Binding (Only for Turntable) */}
      {isTurntable && (
         <div className="absolute -left-2 top-0 bottom-0 w-8 bg-[#3e2723] rounded-l-sm shadow-md z-0 border-r border-[#2d1b18]"></div>
      )}

      {/* CD Case Hinge/Spine (Only for CD Player) */}
      {isCDPlayer && (
          <div className="absolute -left-1 top-0 bottom-0 w-2 bg-transparent border-l border-white/40 z-20"></div>
      )}

      {/* Paper Body */}
      <div 
        className={`w-full h-[300px] shadow-2xl relative overflow-hidden pt-8 px-6 border transition-all
          ${isWalkman ? 'rounded-b-md bg-[#fefce8] border-gray-300' : ''}
          ${isTurntable ? 'rounded-b-md rounded-tr-md bg-[#d7ccc8] border-[#5d4037]' : ''}
          ${isCDPlayer ? 'rounded-sm bg-slate-50 border-slate-300/50 backdrop-blur-sm bg-opacity-90' : ''}
        `}
      >
        {/* Texture Overlays */}
        {isWalkman && (
            // Lined Paper Pattern
            <>
                <div className="absolute inset-0 pointer-events-none" style={{
                backgroundImage: 'linear-gradient(transparent 23px, #93c5fd 24px)',
                backgroundSize: '100% 24px',
                marginTop: '40px'
                }}></div>
                <div className="absolute inset-0 pointer-events-none border-l-2 border-red-300 ml-8"></div>
            </>
        )}
        {isTurntable && (
            // Aged Paper / Parchment
            <div className="absolute inset-0 pointer-events-none opacity-40" style={{
                 backgroundImage: `url("https://www.transparenttextures.com/patterns/aged-paper.png")`,
                 backgroundColor: '#d7ccc8'
            }}></div>
        )}
        {isCDPlayer && (
            // Tech/Grid Pattern
            <>
                <div className="absolute inset-0 pointer-events-none opacity-5" style={{
                    backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
                    backgroundSize: '20px 20px'
                }}></div>
                {/* Glossy Sheen */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-transparent to-slate-200/50 pointer-events-none"></div>
                {/* Decorative Barcode */}
                <div className="absolute bottom-4 right-4 w-24 h-8 bg-black opacity-10 pointer-events-none flex gap-0.5 items-end px-1 pb-1">
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className="bg-white" style={{ width: Math.random() > 0.5 ? '2px' : '1px', height: Math.random() * 100 + '%' }}></div>
                    ))}
                </div>
            </>
        )}


        {/* Content */}
        <div className={`relative z-10 flex flex-col h-full 
            ${isWalkman ? 'font-hand text-gray-800' : ''}
            ${isTurntable ? 'font-serif text-[#3e2723]' : ''}
            ${isCDPlayer ? 'font-sans text-slate-700' : ''}
        `}>
          <h3 className={`text-xl mb-4 ml-6 transform 
             ${isWalkman ? '-rotate-1 text-gray-500 underline decoration-wavy decoration-blue-300' : ''}
             ${isTurntable ? '-rotate-1 text-[#3e2723] font-bold italic tracking-wider border-b border-[#5d4037]/30' : ''}
             ${isCDPlayer ? 'rotate-0 text-slate-800 font-bold uppercase tracking-widest text-sm border-b-2 border-slate-200 pb-1' : ''}
          `}>
            {isWalkman ? "Mixtape Ideas:" : isTurntable ? "Musical Requests" : "DISC DATABASE // SEARCH"}
          </h3>

          <form onSubmit={handleSearch} className="flex flex-col gap-6 ml-6">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={isWalkman ? "write vibe here..." : isTurntable ? "Enter composition..." : "Enter artist or track..."}
                className={`w-full bg-transparent border-none outline-none text-2xl placeholder:text-opacity-40 leading-[24px]
                    ${isWalkman ? 'text-blue-700 placeholder:text-blue-400' : ''}
                    ${isTurntable ? 'text-[#3e2723] placeholder:text-[#5d4037] italic' : ''}
                    ${isCDPlayer ? 'text-slate-900 placeholder:text-slate-400 font-bold tracking-tight' : ''}
                `}
                style={{ background: 'none' }}
                autoFocus
              />
              {isCDPlayer && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500/30"></div>}
            </div>

            <div className="flex items-center gap-4 mt-4">
              {/* Random Button */}
              <button
                type="button"
                onClick={handleSurpriseMe}
                disabled={isLoading}
                className="group relative"
              >
                 {isWalkman && (
                    <>
                        <svg width="100" height="40" viewBox="0 0 100 40" className="absolute inset-0 -z-10 group-hover:scale-105 transition-transform">
                        <path d="M 5,20 Q 25,5 50,20 T 95,20" fill="none" stroke="#8b5cf6" strokeWidth="20" strokeLinecap="round" opacity="0.3" />
                        <path d="M 5,20 Q 25,5 50,20 T 95,20" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        <span className="text-xs font-bold text-purple-900 ml-2">✨ Random?</span>
                    </>
                 )}
                 {isTurntable && (
                     <span className="text-xs font-serif italic border-b border-[#5d4037] hover:text-[#5d4037] text-[#3e2723]/70">Surprise Me</span>
                 )}
                 {isCDPlayer && (
                     <div className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-wider">
                        <span className="text-lg">↺</span> SHUFFLE
                     </div>
                 )}
              </button>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="group relative ml-auto"
              >
                {isWalkman && (
                    <>
                        <div className="absolute inset-0 bg-red-500/20 rounded-full blur-sm group-hover:bg-red-500/40 transition-colors"></div>
                        <div className="border-2 border-red-500 rounded-full px-3 py-1 transform rotate-[-2deg] bg-white hover:rotate-2 transition-transform">
                        <span className="text-sm font-bold text-red-600">
                            {isLoading ? 'Loading...' : 'CREATE!'}
                        </span>
                        </div>
                    </>
                )}
                {isTurntable && (
                     <div className="px-4 py-1 border border-[#5d4037] rounded-sm hover:bg-[#5d4037]/10 transition-colors">
                        <span className="text-sm font-serif font-bold text-[#3e2723]">
                            {isLoading ? 'Composing...' : 'Inscribe'}
                        </span>
                     </div>
                )}
                {isCDPlayer && (
                     <div className="px-6 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-md hover:shadow-lg hover:brightness-110 active:scale-95 transition-all">
                        <span className="text-xs font-bold text-white tracking-widest uppercase">
                            {isLoading ? 'SEARCHING...' : 'BURN DISC'}
                        </span>
                     </div>
                )}
              </button>
            </div>
          </form>

          <div className="mt-auto mb-4 ml-6 opacity-50 text-[10px] font-mono text-gray-400">
            {isWalkman ? "Assignment done by: @mandar" : isTurntable ? "Est. 2024" : "v2.0.03 // SYSTEM READY"}
          </div>

          {searchMessage && (
            <div className={`ml-6 mb-3 text-xs font-medium px-2 py-1 rounded ${
              searchMessage.startsWith('No') ? 'text-red-600 bg-red-50' : 'text-green-700 bg-green-50'
            }`}>
              {searchMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchMessage, setSearchMessage] = useState<string | null>(null);
  const [playerMode, setPlayerMode] = useState<PlayerMode>('walkman');
  const [playHistory, setPlayHistory] = useState<HistoryEntry[]>(loadHistory);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);

  // Initialize library with random positions
  const [library, setLibrary] = useState<Song[]>(() => {
    return (DEFAULT_SONGS as Song[]).map((song, index) => {
      // Avoid Player area (x: 600-900, y: 200-680)
      // Spawn cassettes to the left or right of Player
      const offsetX = index % 2 === 0 ? 200 + (index * 150) : 950 + (index * 150);
      return {
        ...song,
        x: song.x ?? offsetX,
        y: song.y ?? (150 + (index * 120) % 400), // Spread out vertically, avoid Player area
        rotation: song.rotation ?? ((Math.random() * 30) - 15) // Less extreme rotation
      };
    });
  });

  const [currentMedia, setCurrentMedia] = useState<Song | null>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [isHoveringPlayer, setIsHoveringPlayer] = useState(false);

  // Shared Audio State - managed at App level
  const sharedAudioRef = useRef<HTMLAudioElement | null>(null);
  const [audioStatus, setAudioStatus] = useState<PlayerStatus>(PlayerStatus.IDLE);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioVolume, setAudioVolume] = useState(0.75);
  const isScrubbingRef = useRef(false);
  const loadIdRef = useRef(0);

  // Player Position State
  const [playerPosition, setPlayerPosition] = useState({ x: 600, y: 200, rotation: -2 });
  const [isPlayerDragging, setIsPlayerDragging] = useState(false);
  const [playerDragOffset, setPlayerDragOffset] = useState<{ x: number, y: number } | null>(null);
  const [cassetteSide, setCassetteSide] = useState<'A' | 'B'>('A');

  const playerRef = useRef<HTMLDivElement>(null);

  // Persist play history
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(playHistory));
    } catch {
      // storage full or unavailable
    }
  }, [playHistory]);

  const addToHistory = (song: Song) => {
    setPlayHistory(prev => {
      const filtered = prev.filter(h => !(h.title === song.title && h.artist === song.artist));
      const entry: HistoryEntry = { ...song, playedAt: Date.now() };
      return [entry, ...filtered].slice(0, MAX_HISTORY);
    });
  };

  const handleHistoryReplay = (entry: HistoryEntry) => {
    const { playedAt: _, ...songData } = entry;
    const replaySong: Song = {
      ...songData,
      id: `${songData.id}-replay-${Date.now()}`,
      x: 120 + Math.random() * 250,
      y: 80 + Math.random() * 350,
      rotation: (Math.random() * 30) - 15,
    };
    setLibrary(prev => [...prev, replaySong]);
    setIsHistoryExpanded(false);
  };

  const handleClearHistory = () => {
    setPlayHistory([]);
    setIsHistoryExpanded(false);
  };

  const playSound = (type: 'INSERT' | 'EJECT') => {
    playSfx(type);
  };

  // Unlock SFX on first interaction (browser autoplay policy)
  useEffect(() => {
    const unlock = () => unlockAudio();
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  const attachAudioElement = (audio: HTMLAudioElement) => {
    audio.volume = audioVolume;
    audio.loop = true;

    audio.onloadedmetadata = () => {
      setAudioDuration(audio.duration);
    };

    audio.ontimeupdate = () => {
      if (!isScrubbingRef.current && sharedAudioRef.current) {
        setAudioCurrentTime(sharedAudioRef.current.currentTime);
      }
    };

    audio.onerror = () => {
      console.error("Audio playback error", audio.src);
      setAudioStatus(PlayerStatus.STOPPED);
    };

    audio.onwaiting = () => {
      setAudioStatus(prev => prev === PlayerStatus.PLAYING ? PlayerStatus.LOADING : prev);
    };

    audio.onplaying = () => {
      setAudioStatus(PlayerStatus.PLAYING);
    };

    sharedAudioRef.current = audio;
  };

  const loadAudio = (song: Song, autoPlay = false) => {
    const loadId = ++loadIdRef.current;

    if (sharedAudioRef.current) {
      sharedAudioRef.current.pause();
      sharedAudioRef.current.removeAttribute('src');
      sharedAudioRef.current.load();
      sharedAudioRef.current = null;
    }

    setAudioCurrentTime(0);
    setAudioDuration(0);

    if (!song.audioUrl) {
      setAudioStatus(PlayerStatus.IDLE);
      return;
    }

    setAudioStatus(PlayerStatus.LOADING);

    const newAudio = new Audio(song.audioUrl);
    attachAudioElement(newAudio);

    const startPlayback = () => {
      if (loadId !== loadIdRef.current) return;
      if (!autoPlay) {
        setAudioStatus(PlayerStatus.STOPPED);
        return;
      }
      newAudio.play()
        .then(() => {
          if (loadId !== loadIdRef.current) return;
          setAudioStatus(PlayerStatus.PLAYING);
        })
        .catch((err) => {
          if (loadId !== loadIdRef.current) return;
          console.warn("Autoplay blocked:", err);
          setAudioStatus(PlayerStatus.STOPPED);
        });
    };

    const onError = () => {
      if (loadId !== loadIdRef.current) return;
      setAudioStatus(PlayerStatus.STOPPED);
    };

    if (newAudio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      startPlayback();
    } else {
      newAudio.addEventListener('canplay', startPlayback, { once: true });
      newAudio.addEventListener('error', onError, { once: true });
    }
  };

  // Sync audio element when currentMedia changes (e.g. eject clears it)
  useEffect(() => {
    if (!currentMedia) {
      if (sharedAudioRef.current) {
        sharedAudioRef.current.pause();
        sharedAudioRef.current.removeAttribute('src');
        sharedAudioRef.current.load();
        sharedAudioRef.current = null;
      }
      setAudioCurrentTime(0);
      setAudioDuration(0);
      setAudioStatus(PlayerStatus.IDLE);
    }

    return () => {
      if (sharedAudioRef.current) {
        sharedAudioRef.current.pause();
      }
    };
  }, [currentMedia]);

  // Update volume when it changes
  useEffect(() => {
    if (sharedAudioRef.current) {
      sharedAudioRef.current.volume = audioVolume;
    }
  }, [audioVolume]);

  // Switch modes without ejecting — keep music playing
  const togglePlayerMode = (mode?: PlayerMode) => {
    if (mode) {
      setPlayerMode(mode);
      if (mode !== 'walkman') setCassetteSide('A');
    } else {
      setPlayerMode(prev => {
        if (prev === 'walkman') return 'turntable';
        if (prev === 'turntable') return 'cd_player';
        return 'walkman';
      });
    }
  };

  const performSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    setSearchMessage(null);

    const results = await searchMusic(searchTerm);

    if (results.length === 0) {
      setSearchMessage('No tracks found — try a different search term.');
      setIsLoading(false);
      return;
    }

    const positionedResults = results.map((song, index) => {
      const baseX = index % 2 === 0 ? 200 + (index * 150) : 950 + (index * 150);
      return {
        ...song,
        x: baseX + (Math.random() * 100 - 50),
        y: 150 + (index * 120) % 400 + (Math.random() * 100 - 50),
        rotation: (Math.random() * 30) - 15
      };
    });

    setLibrary(positionedResults);
    setSearchMessage(`Found ${results.length} track${results.length > 1 ? 's' : ''}!`);
    setIsLoading(false);
    setQuery('');

    setTimeout(() => setSearchMessage(null), 4000);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  const handleSurpriseMe = () => {
    const discoveryTerms = [
      "1985 hits", "jazz classics", "synthwave", "lofi hiphop",
      "90s rock", "indie folk", "disco fever", "techno",
      "classical piano", "blues guitar", "reggae vibes",
      "anime openings", "movie soundtracks", "heavy metal",
      "funk", "soul", "punk", "country", "pop hits", "ambient"
    ];
    const randomTerm = discoveryTerms[Math.floor(Math.random() * discoveryTerms.length)];
    setQuery("Surprise: " + randomTerm);
    performSearch(randomTerm);
  };

  const handleMediaDrop = (song: Song) => {
    playSound('INSERT');
    setLibrary(prev => prev.filter(s => s.id !== song.id));

    if (currentMedia) {
      const returnedMedia = {
        ...currentMedia,
        x: 950 + Math.random() * 100,
        y: 300 + Math.random() * 100,
        rotation: Math.random() * 20 - 10
      };
      setLibrary(prev => [...prev, returnedMedia]);
    }
    setCurrentMedia(song);
    addToHistory(song);
    // Brief delay so insert SFX plays before music stream starts
    setTimeout(() => loadAudio(song, true), 100);
  };

  const handleEject = () => {
    playSound('EJECT');
    if (sharedAudioRef.current) {
      sharedAudioRef.current.pause();
      setAudioStatus(PlayerStatus.STOPPED);
    }
    if (currentMedia) {
      const ejectedMedia = {
        ...currentMedia,
        // Spawn to the right of Player to avoid overlap
        x: 950 + Math.random() * 100,
        y: 250 + Math.random() * 100,
        rotation: Math.random() * 15 - 7.5
      };
      setLibrary(prev => [ejectedMedia, ...prev]);
      setCurrentMedia(null);
    }
  };

  const handlePlay = async () => {
    if (audioStatus === PlayerStatus.LOADING) return;
    if (sharedAudioRef.current) {
      try {
        await sharedAudioRef.current.play();
        setAudioStatus(PlayerStatus.PLAYING);
      } catch (e) {
        setAudioStatus(PlayerStatus.STOPPED);
      }
    }
  };

  const handlePause = () => {
    if (audioStatus === PlayerStatus.LOADING) return;
    if (sharedAudioRef.current) {
      sharedAudioRef.current.pause();
      setAudioStatus(PlayerStatus.PAUSED);
    }
  };

  const handleStop = () => {
    if (sharedAudioRef.current) {
      sharedAudioRef.current.pause();
      sharedAudioRef.current.currentTime = 0;
      setAudioCurrentTime(0);
    }
    setAudioStatus(PlayerStatus.STOPPED);
  };

  const handleSeek = (time: number) => {
    if (sharedAudioRef.current) {
      sharedAudioRef.current.currentTime = time;
      setAudioCurrentTime(time);
    }
  };

  // --- PLAYER DRAG HANDLERS ---
  const handlePlayerPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    const element = e.currentTarget as HTMLDivElement;
    element.setPointerCapture(e.pointerId);

    setIsPlayerDragging(true);
    setPlayerDragOffset({
      x: e.clientX - playerPosition.x,
      y: e.clientY - playerPosition.y
    });
  };

  const handlePlayerPointerMove = (e: React.PointerEvent) => {
    if (!playerDragOffset) return;
    e.preventDefault();
    e.stopPropagation();

    const newX = e.clientX - playerDragOffset.x;
    const newY = e.clientY - playerDragOffset.y;

    setPlayerPosition(prev => ({ ...prev, x: newX, y: newY }));
  };

  const handlePlayerPointerUp = (e: React.PointerEvent) => {
    if (!playerDragOffset) return;
    const element = e.currentTarget as HTMLDivElement;
    element.releasePointerCapture(e.pointerId);

    setIsPlayerDragging(false);
    setPlayerDragOffset(null);
  };

  // --- CASSETTE/VINYL POINTER DRAG LOGIC ---
  const handlePointerDown = (e: React.PointerEvent, song: Song) => {
    e.stopPropagation();
    const element = e.currentTarget as HTMLDivElement;
    element.setPointerCapture(e.pointerId);

    // Bring to front
    setLibrary(prev => {
      const others = prev.filter(s => s.id !== song.id);
      return [...others, song];
    });

    setDragState({
      id: song.id,
      offsetX: e.clientX - (song.x || 0),
      offsetY: e.clientY - (song.y || 0),
    });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragState) return;
    e.preventDefault(); // Prevent scrolling on touch
    e.stopPropagation();

    const newX = e.clientX - dragState.offsetX;
    const newY = e.clientY - dragState.offsetY;

    // Check if hovering over player
    if (playerRef.current) {
      const playerRect = playerRef.current.getBoundingClientRect();
      const isHovering = (
        e.clientX >= playerRect.left + 20 &&
        e.clientX <= playerRect.right - 20 &&
        e.clientY >= playerRect.top + 20 &&
        e.clientY <= playerRect.bottom - 20
      );
      setIsHoveringPlayer(isHovering);
    } else {
      setIsHoveringPlayer(false);
    }

    setLibrary(prev => {
      // Optimization: only map if necessary
      const index = prev.findIndex(s => s.id === dragState.id);
      if (index === -1) return prev;

      const newArr = [...prev];
      newArr[index] = { ...newArr[index], x: newX, y: newY };
      return newArr;
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!dragState) return;
    const element = e.currentTarget as HTMLDivElement;
    element.releasePointerCapture(e.pointerId);

    if (playerRef.current) {
      const playerRect = playerRef.current.getBoundingClientRect();
      // Simple AABB collision using the Player's current on-screen position
      if (
        e.clientX >= playerRect.left + 20 &&
        e.clientX <= playerRect.right - 20 &&
        e.clientY >= playerRect.top + 20 &&
        e.clientY <= playerRect.bottom - 20
      ) {
        const song = library.find(s => s.id === dragState.id);
        if (song) {
          handleMediaDrop(song);
        }
      }
    }

    setDragState(null);
    setIsHoveringPlayer(false);
  };

  return (
    <div
      className="fixed inset-0 w-full h-full overflow-hidden select-none"
      style={{ touchAction: 'none' }}
    >
      {playerMode === 'walkman' && <div className="animate-bg-enter absolute inset-0"><WalkmanBackground /></div>}
      {playerMode === 'walkman' && <DeskLamp />}
      {playerMode === 'walkman' && <AnalogImperfections />}
      {playerMode === 'turntable' && <div className="animate-bg-enter absolute inset-0"><TurntableBackground /></div>}
      {playerMode === 'cd_player' && <div className="animate-bg-enter absolute inset-0"><CDPlayerBackground /></div>}

      {/* --- MAIN WORKSPACE --- */}
      <div className="relative w-full h-full z-10">

        {/* Mode Switcher */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="relative flex items-center bg-gray-900/85 backdrop-blur-md rounded-full p-1 border border-gray-600/60 shadow-2xl shadow-black/40">
            {([
              { id: 'walkman' as const, label: 'WALKMAN', active: 'bg-purple-500 shadow-[0_0_14px_rgba(168,85,247,0.45)]', hover: 'hover:text-purple-300' },
              { id: 'turntable' as const, label: 'TURNTABLE', active: 'bg-amber-600 shadow-[0_0_14px_rgba(202,138,4,0.45)]', hover: 'hover:text-amber-300' },
              { id: 'cd_player' as const, label: 'CD PLAYER', active: 'bg-blue-500 shadow-[0_0_14px_rgba(59,130,246,0.45)]', hover: 'hover:text-blue-300' },
            ]).map(({ id, label, active, hover }) => (
              <button
                key={id}
                onClick={() => togglePlayerMode(id)}
                className={`relative z-10 px-5 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all duration-300 ease-out
                  ${playerMode === id ? `${active} text-white scale-105` : `text-gray-400 ${hover}`}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* PLAYER - DRAGGABLE */}
        <div
          ref={playerRef}
          className={`absolute z-20 drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] touch-none will-change-transform transition-all duration-200
             ${isPlayerDragging
              ? 'cursor-grabbing z-40 transition-none scale-[1.02]'
              : 'cursor-grab transition-transform duration-300'
            }
            ${isHoveringPlayer && dragState
              ? playerMode === 'walkman'
                ? 'ring-4 ring-purple-500/50 ring-offset-4 ring-offset-transparent scale-[1.05] drop-shadow-[0_0_30px_rgba(168,85,247,0.6)]'
                : playerMode === 'turntable'
                  ? 'ring-4 ring-yellow-500/50 ring-offset-4 ring-offset-transparent scale-[1.05] drop-shadow-[0_0_30px_rgba(202,138,4,0.6)]'
                  : 'ring-4 ring-blue-500/50 ring-offset-4 ring-offset-transparent scale-[1.05] drop-shadow-[0_0_30px_rgba(59,130,246,0.6)]'
              : ''
            }
          `}
          style={{
            left: playerPosition.x,
            top: playerPosition.y,
            transform: `rotate(${playerPosition.rotation}deg)`,
          }}
          onPointerDown={handlePlayerPointerDown}
          onPointerMove={handlePlayerPointerMove}
          onPointerUp={handlePlayerPointerUp}
          onPointerCancel={handlePlayerPointerUp}
        >
          {playerMode === 'walkman' ? (
              <Walkman
                currentTape={currentMedia}
                onEject={handleEject}
                sharedAudio={{
                  status: audioStatus,
                  currentTime: audioCurrentTime,
                  duration: audioDuration,
                  volume: audioVolume,
                  setVolume: setAudioVolume,
                  onPlay: handlePlay,
                  onPause: handlePause,
                  onStop: handleStop,
                  onSeek: handleSeek,
                  isScrubbingRef: isScrubbingRef
                }}
              />
          ) : playerMode === 'turntable' ? (
              <Turntable 
                currentRecord={currentMedia}
                onEject={handleEject}
                sharedAudio={{
                  status: audioStatus,
                  currentTime: audioCurrentTime,
                  duration: audioDuration,
                  volume: audioVolume,
                  setVolume: setAudioVolume,
                  onPlay: handlePlay,
                  onPause: handlePause,
                  onStop: handleStop,
                  onSeek: handleSeek,
                  isScrubbingRef: isScrubbingRef
                }}
              />
          ) : (
              <CDPlayer
                currentDisc={currentMedia}
                onEject={handleEject}
                sharedAudio={{
                    status: audioStatus,
                    currentTime: audioCurrentTime,
                    duration: audioDuration,
                    volume: audioVolume,
                    setVolume: setAudioVolume,
                    onPlay: handlePlay,
                    onPause: handlePause,
                    onStop: handleStop,
                    onSeek: handleSeek,
                    isScrubbingRef: isScrubbingRef
                  }}
              />
          )}
        </div>

        {/* SCATTERED MEDIA */}
        <div className="absolute inset-0 pointer-events-none z-30">
          {library.map((song) => {
            const isDragging = dragState?.id === song.id;
            const isWalkmanMode = playerMode === 'walkman';
            const getSizeClass = () => {
                if (isWalkmanMode) return 'w-[200px]';
                if (playerMode === 'turntable') return 'w-[200px]';
                return 'w-[160px]';
            };

            return (
              <div
                key={song.id}
                className={`absolute ${getSizeClass()} pointer-events-auto will-change-transform
                    ${isDragging
                    ? `z-50 cursor-grabbing transition-none ${
                        isHoveringPlayer
                          ? isWalkmanMode
                            ? 'drop-shadow-[0_0_40px_rgba(168,85,247,0.8)] drop-shadow-[0_35px_35px_rgba(0,0,0,0.6)] scale-[1.15]'
                            : playerMode === 'turntable'
                              ? 'drop-shadow-[0_0_40px_rgba(202,138,4,0.8)] drop-shadow-[0_35px_35px_rgba(0,0,0,0.6)] scale-[1.15]'
                              : 'drop-shadow-[0_0_40px_rgba(59,130,246,0.8)] drop-shadow-[0_35px_35px_rgba(0,0,0,0.6)] scale-[1.15]'
                          : 'drop-shadow-[0_0_25px_rgba(255,255,255,0.4)] drop-shadow-[0_35px_35px_rgba(0,0,0,0.5)] scale-[1.08]'
                      }`
                    : `z-auto cursor-grab transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
                      ${isWalkmanMode
                        ? 'opacity-40 hover:opacity-80 hover:scale-105 hover:z-40 drop-shadow-[0_6px_10px_rgba(0,0,0,0.3)]'
                        : 'hover:scale-105 hover:z-40 drop-shadow-[0_8px_12px_rgba(0,0,0,0.35)]'
                      }`
                  }
                  `}
                style={{
                  left: song.x,
                  top: song.y,
                  transform: isDragging
                    ? `rotate(${(song.rotation || 0) + 5}deg) ${isHoveringPlayer ? 'scale(1.15)' : 'scale(1.08)'}`
                    : `rotate(${song.rotation || 0}deg) scale(1)`,
                  filter: isDragging && isHoveringPlayer 
                    ? playerMode === 'walkman'
                      ? 'brightness(1.2) saturate(1.3)'
                      : 'brightness(1.2) saturate(1.3)'
                    : isDragging
                    ? 'brightness(1.1)'
                    : 'none',
                  transition: isDragging ? 'none' : 'all 0.3s ease-out'
                }}
                onPointerDown={(e) => handlePointerDown(e, song)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
              >
                {playerMode === 'walkman' ? (
                    <Cassette song={song} isDraggable={false} />
                ) : playerMode === 'turntable' ? (
                    <Vinyl song={song} isDraggable={false} />
                ) : (
                    <CompactDisc song={song} isDraggable={false} />
                )}
              </div>
            );
          })}
        </div>

        {/* NOTEBOOK / MIXTAPE UI */}
        <NotebookUI
          query={query}
          setQuery={setQuery}
          handleSearch={handleSearch}
          handleSurpriseMe={handleSurpriseMe}
          isLoading={isLoading}
          searchMessage={searchMessage}
          mode={playerMode}
        />

        {/* Play history stacker */}
        <HistoryStacker
          history={playerMode === 'walkman' && cassetteSide === 'B' ? [...playHistory].reverse() : playHistory}
          playerMode={playerMode}
          cassetteSide={playerMode === 'walkman' ? cassetteSide : undefined}
          isExpanded={isHistoryExpanded}
          onToggleExpand={() => setIsHistoryExpanded(prev => !prev)}
          onReplay={handleHistoryReplay}
          onClear={handleClearHistory}
        />

      </div>
    </div>
  );
};

export default App;
