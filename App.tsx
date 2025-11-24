import React, { useState, useRef, useEffect } from 'react';
import { searchMusic } from './services/geminiService';
import { Song, PlayerStatus } from './types';
import { DEFAULT_SONGS, SFX } from './constants';
import Cassette from './components/Cassette';
import Walkman from './components/Walkman';
import Turntable from './components/Turntable';
import Vinyl from './components/Vinyl';
import { WalkmanBackground, TurntableBackground } from './components/Backgrounds';

interface DragState {
  id: string;
  offsetX: number;
  offsetY: number;
}

type PlayerMode = 'walkman' | 'turntable';

const NotebookUI: React.FC<{
  query: string;
  setQuery: (q: string) => void;
  handleSearch: (e: React.FormEvent) => void;
  handleSurpriseMe: () => void;
  isLoading: boolean;
  mode: PlayerMode;
}> = ({ query, setQuery, handleSearch, handleSurpriseMe, isLoading, mode }) => {
  
  const isWalkman = mode === 'walkman';

  return (
    <div className={`absolute top-[5%] right-[8%] w-[340px] z-40 transform rotate-2 hover:rotate-0 transition-transform duration-300 origin-top-right`}>
      {/* Notebook Spiral Binding (Only for Walkman) */}
      {isWalkman && (
        <div className="absolute left-0 top-0 w-full h-8 z-20 flex justify-evenly">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="w-3 h-6 bg-gray-400 rounded-full border-2 border-gray-500 shadow-md -mt-3"></div>
          ))}
        </div>
      )}

      {/* Book Spine/Binding (Only for Turntable) */}
      {!isWalkman && (
         <div className="absolute -left-2 top-0 bottom-0 w-8 bg-[#3e2723] rounded-l-sm shadow-md z-0 border-r border-[#2d1b18]"></div>
      )}

      {/* Paper Body */}
      <div 
        className={`w-full h-[300px] rounded-b-md shadow-2xl relative overflow-hidden pt-8 px-6 border 
          ${isWalkman ? 'bg-[#fefce8] border-gray-300' : 'bg-[#d7ccc8] border-[#5d4037] rounded-tr-md'}
        `}
      >
        {/* Texture Overlays */}
        {isWalkman ? (
            // Lined Paper Pattern
            <>
                <div className="absolute inset-0 pointer-events-none" style={{
                backgroundImage: 'linear-gradient(transparent 23px, #93c5fd 24px)',
                backgroundSize: '100% 24px',
                marginTop: '40px'
                }}></div>
                <div className="absolute inset-0 pointer-events-none border-l-2 border-red-300 ml-8"></div>
            </>
        ) : (
            // Aged Paper / Parchment
            <div className="absolute inset-0 pointer-events-none opacity-40" style={{
                 backgroundImage: `url("https://www.transparenttextures.com/patterns/aged-paper.png")`,
                 backgroundColor: '#d7ccc8'
            }}></div>
        )}


        {/* Content */}
        <div className={`relative z-10 flex flex-col h-full ${isWalkman ? 'font-hand text-gray-800' : 'font-serif text-[#3e2723]'}`}>
          <h3 className={`text-xl mb-4 ml-6 transform -rotate-1 
             ${isWalkman ? 'text-gray-500 underline decoration-wavy decoration-blue-300' : 'text-[#3e2723] font-bold italic tracking-wider border-b border-[#5d4037]/30'}`}
          >
            {isWalkman ? "Mixtape Ideas:" : "Musical Requests"}
          </h3>

          <form onSubmit={handleSearch} className="flex flex-col gap-6 ml-6">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={isWalkman ? "write vibe here..." : "Enter composition..."}
                className={`w-full bg-transparent border-none outline-none text-2xl placeholder:text-opacity-40 leading-[24px]
                    ${isWalkman ? 'text-blue-700 placeholder:text-blue-400' : 'text-[#3e2723] placeholder:text-[#5d4037] italic'}
                `}
                style={{ background: 'none' }}
                autoFocus
              />
            </div>

            <div className="flex items-center gap-4 mt-4">
              {/* Random Button */}
              <button
                type="button"
                onClick={handleSurpriseMe}
                disabled={isLoading}
                className="group relative"
              >
                 {isWalkman ? (
                    <>
                        <svg width="100" height="40" viewBox="0 0 100 40" className="absolute inset-0 -z-10 group-hover:scale-105 transition-transform">
                        <path d="M 5,20 Q 25,5 50,20 T 95,20" fill="none" stroke="#8b5cf6" strokeWidth="20" strokeLinecap="round" opacity="0.3" />
                        <path d="M 5,20 Q 25,5 50,20 T 95,20" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        <span className="text-xs font-bold text-purple-900 ml-2">✨ Random?</span>
                    </>
                 ) : (
                     <span className="text-xs font-serif italic border-b border-[#5d4037] hover:text-[#5d4037] text-[#3e2723]/70">Surprise Me</span>
                 )}
              </button>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="group relative ml-auto"
              >
                {isWalkman ? (
                    <>
                        <div className="absolute inset-0 bg-red-500/20 rounded-full blur-sm group-hover:bg-red-500/40 transition-colors"></div>
                        <div className="border-2 border-red-500 rounded-full px-3 py-1 transform rotate-[-2deg] bg-white hover:rotate-2 transition-transform">
                        <span className="text-sm font-bold text-red-600">
                            {isLoading ? 'Loading...' : 'CREATE!'}
                        </span>
                        </div>
                    </>
                ) : (
                     <div className="px-4 py-1 border border-[#5d4037] rounded-sm hover:bg-[#5d4037]/10 transition-colors">
                        <span className="text-sm font-serif font-bold text-[#3e2723]">
                            {isLoading ? 'Composing...' : 'Inscribe'}
                        </span>
                     </div>
                )}
              </button>
            </div>
          </form>

          <div className="mt-auto mb-4 ml-6 opacity-50 text-[10px] font-mono text-gray-400">
            {isWalkman ? "Assignment done by: @mandar" : "Est. 2024"}
          </div>
        </div>
      </div>
    </div>
  );
};


const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [playerMode, setPlayerMode] = useState<PlayerMode>('walkman');

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

  // Shared Audio State - managed at App level
  const sharedAudioRef = useRef<HTMLAudioElement | null>(null);
  const [audioStatus, setAudioStatus] = useState<PlayerStatus>(PlayerStatus.IDLE);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioVolume, setAudioVolume] = useState(0.75);
  const isScrubbingRef = useRef(false);

  // Player Position State
  const [playerPosition, setPlayerPosition] = useState({ x: 600, y: 200, rotation: -2 });
  const [isPlayerDragging, setIsPlayerDragging] = useState(false);
  const [playerDragOffset, setPlayerDragOffset] = useState<{ x: number, y: number } | null>(null);

  const playerRef = useRef<HTMLDivElement>(null);

  const playSound = (type: keyof typeof SFX) => {
    const audio = new Audio(SFX[type]);
    audio.volume = 0.4;
    audio.play().catch(e => console.log("Audio play error", e));
  };

  // Initialize/Update Shared Audio when currentMedia changes
  useEffect(() => {
    // Clean up previous audio
    if (sharedAudioRef.current) {
      sharedAudioRef.current.pause();
      sharedAudioRef.current.removeAttribute('src');
      sharedAudioRef.current.load();
      sharedAudioRef.current = null;
    }

    setAudioCurrentTime(0);
    setAudioDuration(0);

    if (currentMedia?.audioUrl) {
      const newAudio = new Audio(currentMedia.audioUrl);
      newAudio.loop = true;
      newAudio.volume = audioVolume;
      
      newAudio.onloadedmetadata = () => {
        setAudioDuration(newAudio.duration);
      };

      newAudio.ontimeupdate = () => {
        if (!isScrubbingRef.current && sharedAudioRef.current) {
          setAudioCurrentTime(sharedAudioRef.current.currentTime);
        }
      };
      
      newAudio.onerror = () => {
        console.error("Audio playback error", currentMedia.audioUrl);
        setAudioStatus(PlayerStatus.STOPPED);
      };
      
      sharedAudioRef.current = newAudio;
      setAudioStatus(PlayerStatus.STOPPED);

      // Auto-play after a short delay
      const timeout = setTimeout(() => {
        if (sharedAudioRef.current) {
          sharedAudioRef.current.play().then(() => {
            setAudioStatus(PlayerStatus.PLAYING);
          }).catch(() => {
            setAudioStatus(PlayerStatus.STOPPED);
          });
        }
      }, 1000);

      return () => {
        clearTimeout(timeout);
        if (sharedAudioRef.current) {
          sharedAudioRef.current.pause();
        }
      };
    } else {
      setAudioStatus(PlayerStatus.IDLE);
    }
  }, [currentMedia]);

  // Update volume when it changes
  useEffect(() => {
    if (sharedAudioRef.current) {
      sharedAudioRef.current.volume = audioVolume;
    }
  }, [audioVolume]);

  // Switch modes without ejecting - retain music playing
  const togglePlayerMode = () => {
      setPlayerMode(prev => prev === 'walkman' ? 'turntable' : 'walkman');
  };

  const performSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;

    setIsLoading(true);

    const results = await searchMusic(searchTerm);

    const positionedResults = results.map((song, index) => {
      // Avoid Player area (x: 600-900, y: 200-680)
      // Alternate between left and right of Player
      const baseX = index % 2 === 0 ? 200 + (index * 150) : 950 + (index * 150);
      return {
        ...song,
        x: baseX + (Math.random() * 100 - 50),
        y: 150 + (index * 120) % 400 + (Math.random() * 100 - 50), // Avoid Player vertical area
        rotation: (Math.random() * 30) - 15
      };
    });

    // Replace existing library with new search results
    setLibrary(positionedResults);
    setIsLoading(false);
    setQuery('');
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
        // Spawn to the right of Player to avoid overlap
        x: 950 + Math.random() * 100,
        y: 300 + Math.random() * 100,
        rotation: Math.random() * 20 - 10
      };
      setLibrary(prev => [...prev, returnedMedia]);
    }
    setCurrentMedia(song);
  };

  const handleEject = () => {
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

  // Shared audio control functions
  const handlePlay = async () => {
    if (sharedAudioRef.current) {
      try {
        await sharedAudioRef.current.play();
        setAudioStatus(PlayerStatus.PLAYING);
      } catch (e) {
        setAudioStatus(PlayerStatus.STOPPED);
      }
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
  };

  return (
    <div
      className="fixed inset-0 w-full h-full overflow-hidden select-none"
      style={{ touchAction: 'none' }}
    >
      {playerMode === 'walkman' ? <WalkmanBackground /> : <TurntableBackground />}

      {/* --- MAIN WORKSPACE --- */}
      <div className="relative w-full h-full z-10">

        {/* Mode Switcher */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
             <div className="flex items-center bg-gray-800 rounded-full p-1 border-2 border-gray-600 shadow-xl">
                 <button 
                    onClick={togglePlayerMode}
                    className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${playerMode === 'walkman' ? 'bg-purple-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'text-gray-400 hover:text-white'}`}
                 >
                    WALKMAN
                 </button>
                 <button 
                    onClick={togglePlayerMode}
                    className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${playerMode === 'turntable' ? 'bg-yellow-600 text-white shadow-[0_0_10px_rgba(202,138,4,0.5)]' : 'text-gray-400 hover:text-white'}`}
                 >
                    TURNTABLE
                 </button>
             </div>
        </div>

        {/* PLAYER - DRAGGABLE */}
        <div
          ref={playerRef}
          className={`absolute z-20 drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] touch-none will-change-transform
             ${isPlayerDragging
              ? 'cursor-grabbing z-40 transition-none scale-[1.02]'
              : 'cursor-grab transition-transform duration-300'
            }
          `}
          style={{
            left: playerPosition.x,
            top: playerPosition.y,
            transform: `rotate(${playerPosition.rotation}deg)`
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
                  onStop: handleStop,
                  onSeek: handleSeek,
                  isScrubbingRef: isScrubbingRef
                }}
              />
          ) : (
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
            return (
              <div
                key={song.id}
                className={`absolute ${playerMode === 'walkman' ? 'w-[280px]' : 'w-[200px]'} pointer-events-auto will-change-transform
                    ${isDragging
                    ? 'z-50 cursor-grabbing drop-shadow-[0_35px_35px_rgba(0,0,0,0.5)] transition-none' 
                    : 'z-auto cursor-grab hover:scale-105 hover:z-40 drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)] transition-all duration-300 ease-out'
                  }
                  `}
                style={{
                  left: song.x,
                  top: song.y,
                  transform: isDragging
                    ? `rotate(${(song.rotation || 0) + 5}deg) scale(1.08)`
                    : `rotate(${song.rotation || 0}deg) scale(1)`,
                }}
                onPointerDown={(e) => handlePointerDown(e, song)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
              >
                {playerMode === 'walkman' ? (
                    <Cassette song={song} isDraggable={false} />
                ) : (
                    <Vinyl song={song} isDraggable={false} />
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
          mode={playerMode}
        />

      </div>
    </div>
  );
};

export default App;
