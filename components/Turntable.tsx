import React, { useState, useRef, useEffect } from 'react';
import { Song, PlayerStatus } from '../types';
import { SFX } from '../constants';
import Vinyl from './Vinyl';

interface SharedAudio {
  status: PlayerStatus;
  currentTime: number;
  duration: number;
  volume: number;
  setVolume: (vol: number) => void;
  onPlay: () => void;
  onStop: () => void;
  onSeek: (time: number) => void;
  isScrubbingRef: React.MutableRefObject<boolean>;
}

interface TurntableProps {
  currentRecord: Song | null;
  onEject: () => void;
  sharedAudio: SharedAudio;
}

const Turntable: React.FC<TurntableProps> = ({ currentRecord, onEject, sharedAudio }) => {
  const { status, currentTime, duration, volume, setVolume, onPlay, onStop, onSeek } = sharedAudio;
  const [armAngle, setArmAngle] = useState(0); 

  const volumeKnobRef = useRef<SVGCircleElement>(null);
  const isVolumeDraggingRef = useRef(false);
  const [strobePhase, setStrobePhase] = useState(0);

  // SFX Helper
  const playSfx = (url: string) => {
    const audio = new Audio(url);
    audio.volume = 0.4;
    audio.play().catch(() => {});
  };

  // Strobe Animation
  useEffect(() => {
      if (status === PlayerStatus.PLAYING) {
          const interval = setInterval(() => {
              setStrobePhase(p => (p + 1) % 2);
          }, 50);
          return () => clearInterval(interval);
      }
  }, [status]);

  // Update arm angle based on playback progress
  useEffect(() => {
      if (status === PlayerStatus.PLAYING && duration > 0) {
          const progress = currentTime / duration;
          // Adjusted angles for larger size
          const startAngle = 15;
          const endAngle = 35;
          setArmAngle(startAngle + (progress * (endAngle - startAngle)));
      } else if (status === PlayerStatus.STOPPED || status === PlayerStatus.IDLE) {
          setArmAngle(0); 
      }
  }, [currentTime, duration, status]);

    // Global volume drag handlers
    useEffect(() => {
        const handleGlobalPointerMove = (e: PointerEvent) => {
            if (isVolumeDraggingRef.current && volumeKnobRef.current) {
                e.preventDefault();
                const sensitivity = 0.01;
                setVolume(Math.max(0, Math.min(1, volume - e.movementY * sensitivity)));
            }
        };

        const handleGlobalPointerUp = (e: PointerEvent) => {
             if (isVolumeDraggingRef.current) {
                isVolumeDraggingRef.current = false;
                if (e.target && 'releasePointerCapture' in e.target) {
                  (e.target as HTMLElement).releasePointerCapture(e.pointerId);
                }
            }
        };

        window.addEventListener('pointermove', handleGlobalPointerMove);
        window.addEventListener('pointerup', handleGlobalPointerUp);
        return () => {
            window.removeEventListener('pointermove', handleGlobalPointerMove);
            window.removeEventListener('pointerup', handleGlobalPointerUp);
        };
    }, [volume, setVolume]);


  const handlePlayStopToggle = (e: React.PointerEvent) => {
      e.stopPropagation();
      // Use a click sound for the lever
      playSfx(SFX.INSERT); 
      if (status === PlayerStatus.PLAYING) {
          onStop();
      } else if (currentRecord) {
          onPlay();
      }
  };

  const handleEject = (e: React.PointerEvent) => {
    e.stopPropagation();
    onStop();
    playSfx(SFX.EJECT);
    setTimeout(() => {
       onEject();
    }, 300);
  };

  const handleVolumeDown = (e: React.PointerEvent) => {
      e.stopPropagation();
      e.preventDefault();
      isVolumeDraggingRef.current = true;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };


  return (
    <div className="relative w-[500px] h-[400px] flex-shrink-0 z-20 select-none drop-shadow-2xl">
      <svg viewBox="0 0 600 500" className="w-full h-full overflow-visible" style={{ filter: "drop-shadow(rgba(0, 0, 0, 0.6) 0px 20px 30px)" }}>
        <defs>
            <linearGradient id="mahogany-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3e2723" />
                <stop offset="20%" stopColor="#5d4037" />
                <stop offset="50%" stopColor="#3e2723" />
                <stop offset="80%" stopColor="#4e342e" />
                <stop offset="100%" stopColor="#2d1b18" />
            </linearGradient>
            <radialGradient id="brass-gradient" cx="50%" cy="50%" r="50%">
                 <stop offset="0%" stopColor="#fef08a" />
                 <stop offset="50%" stopColor="#eab308" />
                 <stop offset="100%" stopColor="#a16207" />
            </radialGradient>
             <filter id="vintage-glow">
                <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
                <feComposite in="blur" in2="SourceGraphic" operator="over" />
            </filter>
            <pattern id="wood-grain" width="20" height="20" patternUnits="userSpaceOnUse">
                 <path d="M 0,10 Q 10,0 20,10 T 40,10" stroke="#2d1b18" strokeWidth="0.5" fill="none" opacity="0.3"/>
            </pattern>
        </defs>

        {/* Main Chassis */}
        <rect x="10" y="10" width="580" height="480" rx="15" fill="url(#mahogany-gradient)" stroke="#2d1b18" strokeWidth="4" />
        <rect x="10" y="10" width="580" height="480" rx="15" fill="url(#wood-grain)" opacity="0.4" pointerEvents="none"/>
        
        {/* Gold Trim Border */}
        <rect x="25" y="25" width="550" height="450" rx="10" fill="none" stroke="#a16207" strokeWidth="2" opacity="0.5" />

        {/* Platter Area */}
        <circle cx="250" cy="250" r="210" fill="#111" stroke="#000" strokeWidth="2" />
        {/* Platter Ring with Strobe Dots */}
        <circle cx="250" cy="250" r="205" fill="none" stroke="#333" strokeWidth="10" />
        
        {/* Strobe Dots Animation */}
        <g transform="translate(250, 250)">
            {Array.from({ length: 36 }).map((_, i) => (
                 <rect 
                    key={i}
                    x="-2" y="-208" width="4" height="6" 
                    fill={status === PlayerStatus.PLAYING && i % 2 === strobePhase ? "#eab308" : "#555"}
                    transform={`rotate(${i * 10})`}
                />
            ))}
        </g>
        
        {/* Inner Platter */}
        <circle cx="250" cy="250" r="195" fill="#1a1a1a" />
        
        {/* The Record - Larger Size */}
        {currentRecord && (
             <foreignObject x="55" y="55" width="390" height="390">
                 <Vinyl 
                    song={currentRecord} 
                    isDraggable={false} 
                    isSpinning={status === PlayerStatus.PLAYING} 
                    style={{ width: '100%', height: '100%' }}
                 />
             </foreignObject>
        )}
        
        {/* Center Spindle - Gold */}
        <circle cx="250" cy="250" r="8" fill="url(#brass-gradient)" stroke="#a16207" strokeWidth="1" />

        {/* --- TONE ARM ASSEMBLY --- */}
        <g transform="translate(500, 100)">
            {/* Pivot Base - Brass */}
            <circle cx="0" cy="0" r="35" fill="url(#brass-gradient)" stroke="#713f12" strokeWidth="2" />
            <circle cx="0" cy="0" r="25" fill="#4e342e" />
            
            {/* S-Shaped Arm */}
            <g transform={`rotate(${armAngle}, 0, 0)`} style={{ transition: 'transform 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                {/* Counterweight */}
                <rect x="-25" y="-60" width="50" height="50" rx="5" fill="#333" stroke="#111" />
                <rect x="-25" y="-55" width="50" height="40" rx="2" fill="none" stroke="#555" strokeWidth="1" opacity="0.5"/>
                
                {/* The Arm Tube */}
                <path d="M 0,-30 L 0,200 Q 0,250 -30,280 L -40,290" fill="none" stroke="#eab308" strokeWidth="8" strokeLinecap="round" />
                <path d="M 0,-30 L 0,200 Q 0,250 -30,280 L -40,290" fill="none" stroke="#a16207" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
                
                {/* Head Shell */}
                <g transform="translate(-45, 295) rotate(25)">
                    <path d="M -15,-5 L 15,-5 L 20,40 L -20,40 Z" fill="#111" stroke="#333" />
                    <rect x="-5" y="40" width="10" height="5" fill="#fff" /> {/* Needle Cartridge */}
                </g>
            </g>
        </g>

        {/* --- CONTROLS INTERFACE --- */}
        
        {/* Speed Toggle Switch */}
        <g transform="translate(500, 250)">
             <rect x="-30" y="-15" width="60" height="30" rx="2" fill="#222" stroke="#000" />
             <text x="-20" y="5" fill="#888" fontSize="8" fontFamily="monospace">33</text>
             <text x="10" y="5" fill="#eab308" fontSize="8" fontFamily="monospace">45</text>
             {/* Toggle switch */}
             <rect x="5" y="-12" width="20" height="24" rx="2" fill="#333" stroke="#555" />
             <rect x="8" y="-8" width="14" height="16" fill="#111" />
        </g>
        
        {/* Vintage Start/Stop Lever */}
        <g transform="translate(500, 320)" className="cursor-pointer" onPointerDown={handlePlayStopToggle}>
            <rect x="-35" y="-35" width="70" height="70" rx="35" fill="#1a1a1a" stroke="#333" strokeWidth="2" />
            <text x="0" y="-20" textAnchor="middle" fill="#a16207" fontSize="8" fontWeight="bold" letterSpacing="2">POWER</text>
            
            {/* The Lever Base */}
            <circle cx="0" cy="15" r="20" fill="#000" />
            
            {/* The Lever Handle */}
            <g transform={`rotate(${status === PlayerStatus.PLAYING ? 45 : -45}, 0, 15)`} style={{ transition: 'transform 0.2s ease-out' }}>
                <rect x="-6" y="-40" width="12" height="50" rx="4" fill="url(#brass-gradient)" stroke="#713f12" />
                <circle cx="0" cy="-40" r="8" fill="#fefce8" stroke="#a16207" />
            </g>
            
            {/* Indicators */}
            <circle cx="-20" cy="15" r="4" fill={status !== PlayerStatus.PLAYING ? "#ef4444" : "#333"} />
            <circle cx="20" cy="15" r="4" fill={status === PlayerStatus.PLAYING ? "#22c55e" : "#333"} filter={status === PlayerStatus.PLAYING ? "url(#vintage-glow)" : ""} />
        </g>

        {/* Large Volume Dial */}
        <g transform="translate(500, 420)" className="cursor-ns-resize" onPointerDown={handleVolumeDown}>
             <circle r="35" fill="#1a1a1a" stroke="#333" strokeWidth="2" />
             <text x="0" y="45" textAnchor="middle" fill="#a16207" fontSize="10" fontWeight="bold" letterSpacing="2">VOLUME</text>
             
             {/* Dial Markings */}
             {Array.from({ length: 11 }).map((_, i) => (
                 <line 
                    key={i}
                    x1="0" y1="-28" x2="0" y2="-32" 
                    stroke="#555" strokeWidth="2" 
                    transform={`rotate(${(i * 27) - 135})`}
                 />
             ))}
             
             {/* The Knob */}
             <g transform={`rotate(${(volume * 270) - 135})`}>
                 <circle r="25" fill="url(#brass-gradient)" stroke="#713f12" />
                 <line x1="0" y1="-15" x2="0" y2="-25" stroke="#3e2723" strokeWidth="3" />
             </g>
             
             {/* Invisible hit area */}
             <circle ref={volumeKnobRef} r="35" fill="transparent" />
        </g>

         {/* Eject Button - Small, discreet */}
         {currentRecord && (
             <g transform="translate(430, 460)" className="cursor-pointer" onPointerDown={handleEject}>
                <rect x="-25" y="-10" width="50" height="20" rx="2" fill="#222" stroke="#444" />
                <text x="0" y="4" textAnchor="middle" fill="#666" fontSize="9" fontFamily="monospace">EJECT</text>
             </g>
         )}

      </svg>
    </div>
  );
};

export default Turntable;
