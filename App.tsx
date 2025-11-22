
import React, { useState, useRef, useEffect } from 'react';
import { searchMusic } from './services/geminiService';
import { Song } from './types';
import { DEFAULT_SONGS, SFX } from './constants';
import Cassette from './components/Cassette';
import Walkman from './components/Walkman';

interface DragState {
  id: string;
  offsetX: number;
  offsetY: number;
}

// --- 2000s DESK DECORATIONS ---
const RetroDecorations = () => (
  <div className="absolute inset-0 pointer-events-none z-1 overflow-hidden">

    {/* Coffee Ring Stain */}
    <svg className="absolute top-[15%] right-[35%] w-40 h-40 opacity-10 mix-blend-multiply pointer-events-none" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="40" fill="none" stroke="#3e2723" strokeWidth="4" strokeDasharray="80 30" filter="blur(1px)" />
      <circle cx="52" cy="48" r="40" fill="none" stroke="#3e2723" strokeWidth="1" opacity="0.5" />
    </svg>

    {/* Math Homework (Top Left) */}
    <div className="absolute -top-12 -left-12 w-72 h-96 bg-white shadow-md transform rotate-6 flex flex-col p-6 opacity-90 border border-gray-200">
      <div className="w-full h-full border-l-2 border-red-200 relative">
        {/* Blue Lines */}
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="w-full h-px bg-blue-100 absolute" style={{ top: `${(i + 1) * 2}rem` }}></div>
        ))}
        <div className="absolute top-4 right-4 font-hand text-red-600 text-5xl transform -rotate-12 opacity-80">C+</div>
        <div className="font-mono text-xs text-gray-500 mt-4 ml-4">
          Math 101<br />
          Name: Alex<br /><br />
          1. 2x + 4 = 10<br />
          &nbsp;&nbsp;x = 3<br /><br />
          2. 5y - 3 = 12<br />
          &nbsp;&nbsp;y = ?
        </div>
        <div className="absolute bottom-10 right-10 font-hand text-blue-600 text-sm rotate-[-5deg]">See me after class!</div>
      </div>
    </div>

    {/* Yellow #2 Pencil */}
    <div className="absolute top-[40%] left-[10%] w-64 h-4 bg-yellow-400 shadow-lg transform rotate-[25deg] flex items-center border-b border-yellow-600">
      <div className="w-8 h-full bg-pink-400 border-r border-gray-400"></div> {/* Eraser */}
      <div className="w-4 h-full bg-gray-300 border-r border-gray-400"></div> {/* Ferrule */}
      <div className="flex-1"></div>
      <div className="w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[24px] border-l-yellow-100"></div> {/* Wood tip */}
      <div className="absolute right-[-24px] w-0 h-0 border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent border-l-[8px] border-l-black"></div> {/* Lead */}
      <div className="absolute inset-0 text-[8px] flex items-center justify-center font-sans font-bold text-green-700 opacity-60 tracking-widest">DIXON TICONDEROGA 1388-2</div>
    </div>

    {/* Soda Can (Top Right) */}
    <div className="absolute top-[-20px] right-[25%] w-24 h-24 drop-shadow-2xl transform rotate-12 z-10">
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        <defs>
          <radialGradient id="canTop" cx="50%" cy="50%" r="50%">
            <stop offset="80%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#94a3b8" />
          </radialGradient>
          <filter id="canShadow">
            <feDropShadow dx="5" dy="5" stdDeviation="4" floodColor="#000" floodOpacity="0.4" />
          </filter>
        </defs>
        <circle cx="50" cy="50" r="46" fill="url(#canTop)" stroke="#64748b" strokeWidth="1" filter="url(#canShadow)" />
        <circle cx="50" cy="50" r="42" fill="none" stroke="#fff" strokeWidth="1" opacity="0.5" />
        {/* Rim */}
        <path d="M 50,8 A 42,42 0 0 1 92,50" fill="none" stroke="#fff" strokeWidth="2" opacity="0.4" />
        {/* Tab */}
        <rect x="38" y="30" width="24" height="40" rx="8" fill="#94a3b8" stroke="#64748b" strokeWidth="1" />
        <circle cx="50" cy="60" r="4" fill="#333" />
        <path d="M 45,40 Q 50,35 55,40" fill="none" stroke="#333" strokeWidth="1" />
        {/* Branding color peek */}
        <circle cx="50" cy="50" r="48" stroke="#dc2626" strokeWidth="2" fill="none" opacity="0.8" style={{ transform: 'scale(1.05)', transformOrigin: 'center' }} />
      </svg>
    </div>

    {/* PS2 Game Case (Stacked under/near homework) */}
    <div className="absolute top-[5%] left-[20%] w-32 h-44 bg-blue-900 rounded shadow-xl transform -rotate-6 opacity-95 flex flex-col border border-blue-800">
      <div className="absolute top-0 left-0 w-full h-6 bg-black flex items-center pl-2">
        <div className="w-12 h-2 bg-white/90 skew-x-12"></div>
      </div>
      <div className="mt-8 mx-2 h-32 bg-gradient-to-b from-gray-800 to-black flex items-center justify-center">
        <span className="text-gray-500 font-sans text-[8px] -rotate-90">SHADOW OF THE COLOSSUS</span>
      </div>
    </div>

    {/* Atomic Purple Gameboy Color (Bottom Left) */}
    <div className="absolute bottom-[5%] left-[5%] transform rotate-6 drop-shadow-2xl opacity-95 z-20">
      <svg width="150" height="240" viewBox="0 0 160 260">
        <defs>
          <linearGradient id="atomicPurple" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.9" />
          </linearGradient>
        </defs>
        {/* Body */}
        <path d="M 0,20 A 20,20 0 0 1 20,0 H 140 A 20,20 0 0 1 160,20 V 220 A 40,40 0 0 1 120,260 H 20 A 20,20 0 0 1 0,240 Z" fill="url(#atomicPurple)" stroke="#5b21b6" strokeWidth="2" />
        {/* Interior Circuit Hints */}
        <path d="M 20,40 H 140 V 100 H 20 Z" fill="none" stroke="#000" strokeOpacity="0.1" strokeWidth="4" />
        <circle cx="120" cy="180" r="15" fill="none" stroke="#000" strokeOpacity="0.1" strokeWidth="2" />

        {/* Screen Lens */}
        <path d="M 10,20 H 150 V 120 H 10 Z" fill="#222" opacity="0.9" rx="5" />
        <rect x="35" y="35" width="90" height="75" fill="#7ca383" opacity="0.8" /> {/* LCD */}
        <circle cx="45" cy="70" r="10" fill="#000" opacity="0.1" /> {/* Reflection */}

        {/* Controls */}
        <g transform="translate(30, 160)">
          <rect x="10" y="0" width="10" height="30" fill="#111" />
          <rect x="0" y="10" width="30" height="10" fill="#111" />
        </g>
        <circle cx="120" cy="165" r="8" fill="#111" />
        <circle cx="140" cy="155" r="8" fill="#111" />
        <g transform="translate(60, 220) rotate(-25)">
          <rect width="25" height="8" rx="4" fill="#333" />
          <rect x="35" width="25" height="8" rx="4" fill="#333" />
        </g>
      </svg>
    </div>

    {/* Tamagotchi (Attached to Gameboy area) */}
    <div className="absolute bottom-[22%] left-[18%] w-16 h-20 drop-shadow-xl transform -rotate-12 z-20 origin-top-left">
      {/* Chain */}
      <svg className="absolute -top-12 -left-8 w-20 h-20" viewBox="0 0 100 100">
        <path d="M 100,100 Q 80,80 50,50 T 10,10" fill="none" stroke="#ccc" strokeWidth="2" strokeDasharray="4 2" />
      </svg>
      <svg viewBox="0 0 100 120" className="w-full h-full">
        {/* Egg Body */}
        <path d="M 10,60 Q 10,10 50,10 Q 90,10 90,60 Q 90,110 50,110 Q 10,110 10,60" fill="#ec4899" stroke="#be185d" strokeWidth="2" />
        {/* Screen */}
        <rect x="25" y="35" width="50" height="40" rx="4" fill="#d1fae5" stroke="#065f46" strokeWidth="1" />
        {/* Pixel Pet */}
        <rect x="45" y="50" width="4" height="4" fill="#000" />
        <rect x="51" y="50" width="4" height="4" fill="#000" />
        <rect x="42" y="54" width="16" height="4" fill="#000" />
        <rect x="45" y="58" width="4" height="4" fill="#000" />
        <rect x="51" y="58" width="4" height="4" fill="#000" />
        {/* Buttons */}
        <circle cx="30" cy="90" r="4" fill="#fef08a" stroke="#eab308" />
        <circle cx="50" cy="85" r="4" fill="#fef08a" stroke="#eab308" />
        <circle cx="70" cy="90" r="4" fill="#fef08a" stroke="#eab308" />
      </svg>
    </div>

    {/* Trading Card (Bottom Rightish) */}
    <div className="absolute bottom-[10%] right-[35%] w-24 h-36 bg-black rounded shadow-lg transform rotate-12 border-2 border-yellow-500 overflow-hidden opacity-90">
      <div className="w-full h-full bg-gradient-to-br from-purple-700 via-blue-600 to-teal-500 relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30 mix-blend-overlay"></div>
        <div className="absolute top-2 left-2 right-2 h-20 bg-slate-800 border border-slate-600"></div>
        <div className="absolute bottom-2 inset-x-2 h-10 bg-orange-100 text-[6px] p-1 font-mono leading-tight text-black">
          ATK/2500 DEF/2100<br />
          [Dragon/Effect]
        </div>
        {/* Holographic Glint */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-50 pointer-events-none"></div>
      </div>
    </div>

    {/* Burned CD-R (Bottom Right) */}
    <div className="absolute bottom-[15%] right-[5%] w-48 h-48 opacity-80 drop-shadow-md transform -rotate-12">
      <div className="w-full h-full rounded-full bg-gradient-to-tr from-blue-200 via-purple-100 to-pink-200 flex items-center justify-center border border-white/20 relative overflow-hidden">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[spin_10s_linear_infinite] opacity-50"></div>
        <div className="w-16 h-16 rounded-full bg-[#5a3e36] border-4 border-white/30 z-10"></div> {/* Desk color showing through hole */}
        <span className="absolute bottom-10 text-sm font-hand text-black/70 rotate-180 font-bold">SUMMER MIX '03</span>
      </div>
    </div>

    {/* Loose Change */}
    <div className="absolute bottom-[30%] left-[40%] w-8 h-8 rounded-full bg-gray-300 shadow-sm border border-gray-400 flex items-center justify-center text-[8px] text-gray-500 font-serif">¢25</div>
    <div className="absolute bottom-[28%] left-[43%] w-6 h-6 rounded-full bg-orange-300 shadow-sm border border-orange-400"></div>

  </div>
);

const NotebookUI: React.FC<{
  query: string;
  setQuery: (q: string) => void;
  handleSearch: (e: React.FormEvent) => void;
  handleSurpriseMe: () => void;
  isLoading: boolean;
}> = ({ query, setQuery, handleSearch, handleSurpriseMe, isLoading }) => {
  return (
    <div className="absolute top-[5%] right-[8%] w-[340px] z-40 transform rotate-2 hover:rotate-0 transition-transform duration-300 origin-top-right">
      {/* Notebook Spiral Binding */}
      <div className="absolute left-0 top-0 w-full h-8 z-20 flex justify-evenly">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="w-3 h-6 bg-gray-400 rounded-full border-2 border-gray-500 shadow-md -mt-3"></div>
        ))}
      </div>

      {/* Paper Body */}
      <div className="bg-[#fefce8] w-full h-[300px] rounded-b-md shadow-2xl relative overflow-hidden pt-8 px-6 border border-gray-300">
        {/* Lined Paper Pattern */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'linear-gradient(transparent 23px, #93c5fd 24px)',
          backgroundSize: '100% 24px',
          marginTop: '40px'
        }}></div>
        <div className="absolute inset-0 pointer-events-none border-l-2 border-red-300 ml-8"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full font-hand text-gray-800">
          <h3 className="text-xl text-gray-500 underline decoration-wavy decoration-blue-300 mb-4 ml-6 transform -rotate-1">Mixtape Ideas:</h3>

          <form onSubmit={handleSearch} className="flex flex-col gap-6 ml-6">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="write vibe here..."
                className="w-full bg-transparent border-none outline-none text-2xl text-blue-700 placeholder:text-blue-200 leading-[24px]"
                style={{ background: 'none' }}
                autoFocus
              />
            </div>

            <div className="flex items-center gap-4 mt-4">
              {/* Scribbled Button 1 */}
              <button
                type="button"
                onClick={handleSurpriseMe}
                disabled={isLoading}
                className="group relative"
              >
                <svg width="100" height="40" viewBox="0 0 100 40" className="absolute inset-0 -z-10 group-hover:scale-105 transition-transform">
                  <path d="M 5,20 Q 25,5 50,20 T 95,20" fill="none" stroke="#8b5cf6" strokeWidth="20" strokeLinecap="round" opacity="0.3" />
                  <path d="M 5,20 Q 25,5 50,20 T 95,20" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span className="text-xs font-bold text-purple-900 ml-2">✨ Random?</span>
              </button>

              {/* Scribbled Button 2 */}
              <button
                type="submit"
                disabled={isLoading}
                className="group relative ml-auto"
              >
                <div className="absolute inset-0 bg-red-500/20 rounded-full blur-sm group-hover:bg-red-500/40 transition-colors"></div>
                <div className="border-2 border-red-500 rounded-full px-3 py-1 transform rotate-[-2deg] bg-white hover:rotate-2 transition-transform">
                  <span className="text-sm font-bold text-red-600">
                    {isLoading ? 'Loading...' : 'CREATE!'}
                  </span>
                </div>
              </button>
            </div>
          </form>

          <div className="mt-auto mb-4 ml-6 opacity-50 text-[10px] font-mono text-gray-400">
            Assignment done by: @mandar
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Initialize library with random positions
  const [library, setLibrary] = useState<Song[]>(() => {
    return (DEFAULT_SONGS as Song[]).map((song, index) => {
      // Avoid Walkman area (x: 600-900, y: 200-680)
      // Spawn cassettes to the left or right of Walkman
      const offsetX = index % 2 === 0 ? 200 + (index * 150) : 950 + (index * 150);
      return {
        ...song,
        x: song.x ?? offsetX,
        y: song.y ?? (150 + (index * 120) % 400), // Spread out vertically, avoid Walkman area
        rotation: song.rotation ?? ((Math.random() * 30) - 15) // Less extreme rotation
      };
    });
  });

  const [currentTape, setCurrentTape] = useState<Song | null>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);

  // Walkman State
  const [walkmanPosition, setWalkmanPosition] = useState({ x: 600, y: 200, rotation: -2 });
  const [isWalkmanDragging, setIsWalkmanDragging] = useState(false);
  const [walkmanDragOffset, setWalkmanDragOffset] = useState<{ x: number, y: number } | null>(null);

  const walkmanRef = useRef<HTMLDivElement>(null);

  const playSound = (type: keyof typeof SFX) => {
    const audio = new Audio(SFX[type]);
    audio.volume = 0.4;
    audio.play().catch(e => console.log("Audio play error", e));
  };

  const performSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;

    setIsLoading(true);

    const results = await searchMusic(searchTerm);

    const positionedResults = results.map((song, index) => {
      // Avoid Walkman area (x: 600-900, y: 200-680)
      // Alternate between left and right of Walkman
      const baseX = index % 2 === 0 ? 200 + (index * 150) : 950 + (index * 150);
      return {
        ...song,
        x: baseX + (Math.random() * 100 - 50),
        y: 150 + (index * 120) % 400 + (Math.random() * 100 - 50), // Avoid Walkman vertical area
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

  const handleTapeDrop = (song: Song) => {
    playSound('INSERT');
    setLibrary(prev => prev.filter(s => s.id !== song.id));

    if (currentTape) {
      const returnedTape = {
        ...currentTape,
        // Spawn to the right of Walkman to avoid overlap
        x: 950 + Math.random() * 100,
        y: 300 + Math.random() * 100,
        rotation: Math.random() * 20 - 10
      };
      setLibrary(prev => [...prev, returnedTape]);
    }
    setCurrentTape(song);
  };

  const handleEject = () => {
    if (currentTape) {
      const ejectedTape = {
        ...currentTape,
        // Spawn to the right of Walkman to avoid overlap
        x: 950 + Math.random() * 100,
        y: 250 + Math.random() * 100,
        rotation: Math.random() * 15 - 7.5
      };
      setLibrary(prev => [ejectedTape, ...prev]);
      setCurrentTape(null);
    }
  };

  // --- WALKMAN DRAG HANDLERS ---
  const handleWalkmanPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    const element = e.currentTarget as HTMLDivElement;
    element.setPointerCapture(e.pointerId);

    setIsWalkmanDragging(true);
    setWalkmanDragOffset({
      x: e.clientX - walkmanPosition.x,
      y: e.clientY - walkmanPosition.y
    });
  };

  const handleWalkmanPointerMove = (e: React.PointerEvent) => {
    if (!walkmanDragOffset) return;
    e.preventDefault();
    e.stopPropagation();

    const newX = e.clientX - walkmanDragOffset.x;
    const newY = e.clientY - walkmanDragOffset.y;

    setWalkmanPosition(prev => ({ ...prev, x: newX, y: newY }));
  };

  const handleWalkmanPointerUp = (e: React.PointerEvent) => {
    if (!walkmanDragOffset) return;
    const element = e.currentTarget as HTMLDivElement;
    element.releasePointerCapture(e.pointerId);

    setIsWalkmanDragging(false);
    setWalkmanDragOffset(null);
  };

  // --- CASSETTE POINTER DRAG LOGIC ---
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

    let droppedInWalkman = false;

    if (walkmanRef.current) {
      const walkmanRect = walkmanRef.current.getBoundingClientRect();
      // Simple AABB collision using the Walkman's current on-screen position
      if (
        e.clientX >= walkmanRect.left + 20 &&
        e.clientX <= walkmanRect.right - 20 &&
        e.clientY >= walkmanRect.top + 20 &&
        e.clientY <= walkmanRect.bottom - 20
      ) {
        const song = library.find(s => s.id === dragState.id);
        if (song) {
          handleTapeDrop(song);
          droppedInWalkman = true;
        }
      }
    }

    setDragState(null);
  };

  return (
    <div
      className="fixed inset-0 w-full h-full overflow-hidden select-none bg-[#8d6e63]"
      style={{
        touchAction: 'none',
        backgroundImage: `
            url("https://www.transparenttextures.com/patterns/wood-pattern.png"),
            radial-gradient(circle at center, rgba(0,0,0,0) 20%, rgba(0,0,0,0.5) 100%)
          `,
        backgroundBlendMode: 'multiply'
      }}
    >

      {/* Desk Scratches / Wear */}
      <div className="absolute inset-0 pointer-events-none opacity-30 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/shattered-island.png')]"></div>

      <RetroDecorations />

      {/* --- MAIN WORKSPACE --- */}
      <div className="relative w-full h-full z-10">

        {/* WALKMAN - NOW DRAGGABLE */}
        <div
          ref={walkmanRef}
          className={`absolute z-20 drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] touch-none will-change-transform
             ${isWalkmanDragging
              ? 'cursor-grabbing z-40 transition-none scale-[1.02]'
              : 'cursor-grab transition-transform duration-300'
            }
          `}
          style={{
            left: walkmanPosition.x,
            top: walkmanPosition.y,
            transform: `rotate(${walkmanPosition.rotation}deg)`
          }}
          onPointerDown={handleWalkmanPointerDown}
          onPointerMove={handleWalkmanPointerMove}
          onPointerUp={handleWalkmanPointerUp}
          onPointerCancel={handleWalkmanPointerUp}
        >
          <Walkman
            currentTape={currentTape}
            onEject={handleEject}
          />
        </div>

        {/* SCATTERED CASSETTES */}
        <div className="absolute inset-0 pointer-events-none z-30">
          {library.map((song) => {
            const isDragging = dragState?.id === song.id;
            return (
              <div
                key={song.id}
                className={`absolute w-[280px] pointer-events-auto will-change-transform
                    ${isDragging
                    ? 'z-50 cursor-grabbing drop-shadow-[0_35px_35px_rgba(0,0,0,0.5)] transition-none' // Remove transition when dragging for smoothness
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
                <Cassette song={song} isDraggable={false} />
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
        />

      </div>
    </div>
  );
};

export default App;
