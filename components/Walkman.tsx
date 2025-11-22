
import React, { useState, useRef, useEffect } from 'react';
import { Song, PlayerStatus } from '../types';
import { SFX } from '../constants';
import Cassette from './Cassette';

interface WalkmanProps {
  currentTape: Song | null;
  onEject: () => void;
}

const Walkman: React.FC<WalkmanProps> = ({ currentTape, onEject }) => {
  const [status, setStatus] = useState<PlayerStatus>(PlayerStatus.IDLE);
  const [volume, setVolume] = useState(0.7); // 0 to 1
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playTimeoutRef = useRef<number | null>(null);
  const volumeTrackRef = useRef<SVGRectElement>(null);
  const progressTrackRef = useRef<SVGRectElement>(null);
  const isScrubbingRef = useRef(false); // Ref to avoid re-render/closure issues during updates

  const [isInserting, setIsInserting] = useState(false);

  // SFX Helper
  const playSfx = (url: string) => {
    const audio = new Audio(url);
    audio.volume = 0.4;
    audio.play().catch(() => {});
  };

  // Helper to format time
  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Initialize Audio when tape changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
      audioRef.current = null;
    }
    if (playTimeoutRef.current) {
      clearTimeout(playTimeoutRef.current);
    }

    setCurrentTime(0);
    setDuration(0);

    if (currentTape) {
      setIsInserting(true);
      
      const timer = setTimeout(() => setIsInserting(false), 600);

      if (currentTape.audioUrl) {
        const newAudio = new Audio(currentTape.audioUrl);
        newAudio.loop = true;
        newAudio.volume = volume;
        
        newAudio.onloadedmetadata = () => {
          setDuration(newAudio.duration);
        };

        newAudio.ontimeupdate = () => {
          if (!isScrubbingRef.current) {
            setCurrentTime(newAudio.currentTime);
          }
        };
        
        newAudio.onerror = (e) => {
          let errorMsg = "Unknown error";
          if (typeof e !== 'string' && e.target) {
            const error = (e.target as HTMLAudioElement).error;
            if (error) {
               errorMsg = `Code: ${error.code}, Message: ${error.message}`;
            }
          } else if (typeof e === 'string') {
            errorMsg = e;
          }
          console.error("Audio playback error:", errorMsg, currentTape.audioUrl);
          setStatus(PlayerStatus.STOPPED);
        };
        
        audioRef.current = newAudio;
        setStatus(PlayerStatus.STOPPED);

        // Auto-play after insertion animation + small delay
        playTimeoutRef.current = window.setTimeout(() => {
            play(); 
        }, 1000); 
      } else {
        setStatus(PlayerStatus.IDLE);
      }
      return () => clearTimeout(timer);
    } else {
      setStatus(PlayerStatus.IDLE);
      setIsInserting(false);
    }

    return () => {
      if (playTimeoutRef.current) clearTimeout(playTimeoutRef.current);
      if (audioRef.current) audioRef.current.pause();
    };
  }, [currentTape]);

  // Update volume when state changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const play = async () => {
    if (audioRef.current) {
      try {
        await audioRef.current.play();
        setStatus(PlayerStatus.PLAYING);
        playSfx(SFX.PLAY_CLICK);
      } catch (e) {
        console.error("Audio play failed (Promise rejected):", e);
        setStatus(PlayerStatus.STOPPED);
      }
    }
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0; // Reset to start
      setCurrentTime(0);
    }
    setStatus(PlayerStatus.STOPPED);
    playSfx(SFX.CLICK);
  };

  const handlePlayClick = () => {
    if (!currentTape) return;
    if (status === PlayerStatus.PLAYING) return; 
    play();
  };

  const handleStopClick = () => {
    if (status === PlayerStatus.PLAYING || status === PlayerStatus.PAUSED) {
        stop();
    } else if (currentTape) {
        handleEject();
    }
  };

  const handleRewind = () => {
    if (audioRef.current) {
      playSfx(SFX.CLICK);
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 5);
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleFastForward = () => {
    if (audioRef.current) {
      playSfx(SFX.CLICK);
      audioRef.current.currentTime = Math.min(audioRef.current.duration, audioRef.current.currentTime + 5);
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleEject = () => {
    stop();
    playSfx(SFX.EJECT);
    setTimeout(() => {
       onEject();
    }, 300);
  };

  // Volume Slider Logic
  const handleVolumePointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    handleVolumeDrag(e);
  };

  const handleVolumeDrag = (e: React.PointerEvent) => {
    if (volumeTrackRef.current) {
      const rect = volumeTrackRef.current.getBoundingClientRect();
      const relativeY = e.clientY - rect.top;
      const percent = Math.max(0, Math.min(1, relativeY / rect.height));
      setVolume(1 - percent); 
    }
  };

  // Scrubbing Logic
  const handleProgressPointerDown = (e: React.PointerEvent) => {
    if (!currentTape || !audioRef.current) return;
    isScrubbingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    handleProgressDrag(e);
  };

  const handleProgressDrag = (e: React.PointerEvent) => {
    if (progressTrackRef.current && duration > 0) {
      const rect = progressTrackRef.current.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const percent = Math.max(0, Math.min(1, relativeX / rect.width));
      const newTime = percent * duration;
      setCurrentTime(newTime);
      if (audioRef.current) {
        audioRef.current.currentTime = newTime;
      }
    }
  };

  const handleProgressPointerUp = (e: React.PointerEvent) => {
    if (!isScrubbingRef.current) return;
    isScrubbingRef.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const knobY = (1 - volume) * 70;

  return (
    <div 
      className="relative w-[300px] h-[480px] flex-shrink-0 z-20 select-none drop-shadow-2xl"
    >
      <style>{`
        @keyframes tapeDropIn {
          0% { transform: translateY(-120px) rotate(90deg) scale(0.48) translateZ(0); opacity: 0; }
          60% { transform: translateY(10px) rotate(90deg) scale(0.48) translateZ(0); opacity: 1; }
          80% { transform: translateY(-5px) rotate(90deg) scale(0.48) translateZ(0); }
          100% { transform: translateY(0px) rotate(90deg) scale(0.48) translateZ(0); }
        }
      `}</style>

      <svg viewBox="0 0 300 480" className="w-full h-full overflow-visible" style={{ filter: "drop-shadow(rgba(10, 5, 30, 0.7) 0px 20px 30px) drop-shadow(rgba(20, 10, 50, 0.6) 5px 5px 5px)" }}>
        <defs>
            {/* Noise Texture */}
            <filter id="body-noise">
                <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="noise" />
                <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.1 0" in="noise" result="coloredNoise" />
                <feComposite operator="in" in="coloredNoise" in2="SourceGraphic" result="composite" />
                <feBlend mode="multiply" in="composite" in2="SourceGraphic" />
            </filter>

            {/* Gradients */}
            <linearGradient id="body-blue" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#152238" />
                <stop offset="50%" stopColor="#1b2e4b" />
                <stop offset="100%" stopColor="#152238" />
            </linearGradient>
            <linearGradient id="metal-silver" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#9ca3af" />
                <stop offset="20%" stopColor="#cbd5e1" />
                <stop offset="50%" stopColor="#6b7280" />
                <stop offset="80%" stopColor="#94a3b8" />
                <stop offset="100%" stopColor="#6b7280" />
            </linearGradient>
            <linearGradient id="glass-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
                <stop offset="50%" stopColor="rgba(255,255,255,0.05)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.2)" />
            </linearGradient>
            <radialGradient id="window-vignette" cx="50%" cy="50%" r="70%" fx="50%" fy="50%">
                <stop offset="80%" stopColor="#000" stopOpacity="0" />
                <stop offset="100%" stopColor="#000" stopOpacity="0.8" />
            </radialGradient>
            <radialGradient id="screw-gradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fff" />
                <stop offset="100%" stopColor="#333" />
            </radialGradient>
            
            {/* Filters */}
            <filter id="window-inset-soft">
                <feGaussianBlur in="SourceAlpha" stdDeviation="4" />
                <feOffset dx="0" dy="4" result="offsetblur" />
                <feFlood floodColor="#000" floodOpacity="0.4" />
                <feComposite in2="offsetblur" operator="in" />
                <feComposite in2="SourceAlpha" operator="in" />
                <feMerge>
                    <feMergeNode in="SourceGraphic" />
                    <feMergeNode />
                </feMerge>
            </filter>
            <filter id="button-bevel" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="blur" />
                <feOffset in="blur" dx="0" dy="1" result="shadow" />
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="10" lightingColor="#fff" result="specular">
                    <fePointLight x="-5000" y="-10000" z="20000" />
                </feSpecularLighting>
                <feComposite in="specular" in2="SourceAlpha" operator="in" result="specular" />
                <feComposite in="SourceGraphic" in2="shadow" operator="over" />
            </filter>

            <clipPath id="window-clip">
                <rect x="0" y="0" width="170" height="250" rx="2" />
            </clipPath>
        </defs>

        {/* --- MAIN CHASSIS --- */}
        <path d="M 20,20 H 220 V 460 H 20 A 10,10 0 0 1 10,450 V 30 A 10,10 0 0 1 20,20 Z" fill="url(#body-blue)" filter="url(#body-noise)" stroke="#0f172a" strokeWidth="1" />
        <path d="M 220,20 H 280 A 10,10 0 0 1 290,30 V 450 A 10,10 0 0 1 280,460 H 220 V 20 Z" fill="url(#metal-silver)" stroke="#6b7280" strokeWidth="1" />
        <line x1="220" y1="20" x2="220" y2="460" stroke="#000" strokeOpacity="0.3" strokeWidth="1" />

        <text x="30" y="60" fontFamily="serif" fontWeight="bold" fontSize="22" fill="#cbd5e1" letterSpacing="1" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>SONY</text>
        <text x="30" y="430" fontFamily="sans-serif" fontWeight="bold" fontSize="16" fill="#fff" letterSpacing="2">WALKMAN</text>
        <text x="30" y="442" fontFamily="sans-serif" fontSize="8" fill="#94a3b8">STEREO CASSETTE PLAYER</text>

        {/* --- THE WINDOW --- */}
        <g transform="translate(30, 100)">
            <rect x="-5" y="-5" width="180" height="260" rx="4" fill="#050505" /> 
            <rect x="0" y="0" width="170" height="250" rx="2" fill="#0a0a0a" filter="url(#window-inset-soft)" />
            
            {/* Content Clipped inside Window */}
            <g clipPath="url(#window-clip)">
                {currentTape ? (
                    <foreignObject x="-215" y="-65" width="600" height="380" style={{ overflow: 'visible' }}>
                        <div className="w-full h-full flex items-center justify-center">
                             <div style={{ 
                                width: '600px', 
                                height: '380px', 
                                transformOrigin: 'center center',
                                transform: 'rotate(90deg) scale(0.48) translateZ(0)',
                                animation: isInserting ? 'tapeDropIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center' 
                             }}>
                                <Cassette 
                                    song={currentTape} 
                                    isDraggable={false} 
                                    isSpinning={status === PlayerStatus.PLAYING}
                                    style={{ width: '100%', height: '100%' }}
                                />
                             </div>
                        </div>
                    </foreignObject>
                ) : (
                    <text x="85" y="125" textAnchor="middle" fill="#333" fontSize="10" letterSpacing="3">NO TAPE</text>
                )}
                
                {/* Progress Bar inside Window Glass */}
                <g transform="translate(15, 230)">
                  {/* Hit Area */}
                  <rect 
                    x="-5" y="-10" width="150" height="20" fill="transparent" 
                    className={currentTape ? "cursor-pointer" : ""}
                    onPointerDown={handleProgressPointerDown}
                    onPointerMove={handleProgressDrag}
                    onPointerUp={handleProgressPointerUp}
                    onPointerCancel={handleProgressPointerUp}
                  />
                  
                  {/* Track */}
                  <rect ref={progressTrackRef} x="0" y="0" width="140" height="4" rx="2" fill="rgba(255,255,255,0.2)" pointerEvents="none" />
                  
                  {/* Progress */}
                  <rect 
                    x="0" y="0" 
                    width={duration > 0 ? (currentTime / duration) * 140 : 0} 
                    height="4" rx="2" 
                    fill="#f97316" 
                    pointerEvents="none"
                  />
                  
                  {/* Knob */}
                  <circle 
                    cx={duration > 0 ? (currentTime / duration) * 140 : 0} 
                    cy="2" r="4" 
                    fill="#fff" 
                    pointerEvents="none"
                    className="transition-transform hover:scale-125"
                  />
                  
                  {/* Time Display */}
                  <text x="140" y="-5" fontSize="8" fill="rgba(255,255,255,0.6)" textAnchor="end" fontFamily="monospace">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </text>
                </g>

                <rect x="0" y="0" width="170" height="250" rx="2" fill="#000" opacity="0.3" pointerEvents="none" />
                <rect x="0" y="0" width="170" height="250" rx="2" fill="url(#window-vignette)" pointerEvents="none" style={{ mixBlendMode: 'multiply' }} />
                <rect x="0" y="0" width="170" height="250" rx="2" fill="none" stroke="#000" strokeWidth="12" opacity="0.4" filter="blur(6px)" />
            </g>
            
            <path d="M 0,250 L 60,0 L 100,0 L 40,250 Z" fill="#fff" opacity="0.03" pointerEvents="none" />
            <rect x="0" y="0" width="170" height="250" rx="2" fill="url(#glass-gradient)" opacity="0.15" pointerEvents="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            <path d="M 150,200 L 150,170 L 145,175 M 150,170 L 155,175" stroke="#64748b" strokeWidth="2" fill="none" />
        </g>

        {/* --- BATT INDICATOR --- */}
        <circle cx="190" cy="55" r="3" fill="#333" stroke="#111" />
        <circle cx="190" cy="55" r="3" fill="#ef4444" opacity={status === PlayerStatus.PLAYING ? 1 : 0.3} style={{ filter: 'drop-shadow(0 0 4px red)' }}>
           {status === PlayerStatus.PLAYING && <animate attributeName="opacity" values="0.5;1;0.5" dur="1s" repeatCount="indefinite" />}
        </circle>
        <text x="195" y="58" fontSize="6" fill="#94a3b8">BATT</text>

        {/* --- CONTROLS --- */}
        <g transform="translate(220, 80)">
            <g 
              className="cursor-ns-resize outline-none"
              onPointerDown={handleVolumePointerDown}
              onPointerMove={handleVolumeDrag}
              style={{ touchAction: 'none' }}
            >
                <rect 
                  ref={volumeTrackRef}
                  x="15" y="0" width="6" height="80" rx="3" fill="#111" 
                  className="stroke-white/10 stroke-[0.5]"
                />
                <rect 
                  x="12" 
                  y={knobY} 
                  width="12" height="10" rx="1" 
                  fill="#333" stroke="#555" strokeWidth="0.5"
                  className="transition-all duration-75"
                />
                <rect x="0" y="0" width="40" height="80" fill="transparent" />
            </g>
            <text x="35" y="45" fontSize="6" fill="#222" transform="rotate(90 35,45)">VOLUME</text>

            {/* Background for buttons - Extended height for 4 buttons */}
            <rect x="2" y="140" width="36" height="245" rx="4" fill="#1a1a1a" stroke="#4b5563" strokeWidth="0.5" />
            
            <g transform="translate(0, 150)">
                {/* STOP BUTTON */}
                <g className="cursor-pointer" onClick={handleStopClick}>
                    <rect x="5" y="0" width="30" height="50" rx="2" fill="#333" stroke="#111" strokeWidth="0.5" filter="url(#button-bevel)" className="active:translate-y-[1px]" />
                    <rect x="15" y="20" width="10" height="10" fill="#9ca3af" />
                </g>
                
                {/* PLAY BUTTON */}
                <g className="cursor-pointer" transform="translate(0, 60)" onClick={handlePlayClick}>
                    <rect x="5" y="0" width="30" height="50" rx="2" fill="#f97316" stroke="#c2410c" strokeWidth="0.5" filter="url(#button-bevel)" className={`active:translate-y-[1px] ${status === PlayerStatus.PLAYING ? 'translate-y-[2px] brightness-90' : ''}`} />
                    <path d="M 15,20 L 25,25 L 15,30 Z" fill="#fff" />
                </g>

                {/* REWIND BUTTON */}
                <g className="cursor-pointer" transform="translate(0, 120)" onClick={handleRewind}>
                    <rect x="5" y="0" width="30" height="50" rx="2" fill="#333" stroke="#111" strokeWidth="0.5" filter="url(#button-bevel)" className="active:translate-y-[1px]" />
                    {/* Double Arrow Left */}
                    <path d="M 22,20 L 14,25 L 22,30 M 14,20 L 6,25 L 14,30" transform="translate(4,0)" fill="#9ca3af" />
                </g>

                {/* FAST FORWARD BUTTON */}
                <g className="cursor-pointer" transform="translate(0, 180)" onClick={handleFastForward}>
                    <rect x="5" y="0" width="30" height="50" rx="2" fill="#333" stroke="#111" strokeWidth="0.5" filter="url(#button-bevel)" className="active:translate-y-[1px]" />
                    {/* Double Arrow Right */}
                    <path d="M 10,20 L 18,25 L 10,30 M 18,20 L 26,25 L 18,30" transform="translate(4,0)" fill="#9ca3af" />
                </g>
            </g>
        </g>

        {/* --- SCREWS --- */}
        <g transform="translate(25, 25)">
            <circle r="3" fill="url(#screw-gradient)" stroke="#111" strokeWidth="0.2" />
            <line x1="-2" y1="0" x2="2" y2="0" stroke="#111" strokeWidth="0.5" />
            <line x1="0" y1="-2" x2="0" y2="2" stroke="#111" strokeWidth="0.5" />
        </g>
        <g transform="translate(215, 25)">
            <circle r="3" fill="url(#screw-gradient)" stroke="#111" strokeWidth="0.2" />
            <line x1="-2" y1="0" x2="2" y2="0" stroke="#111" strokeWidth="0.5" transform="rotate(45)" />
            <line x1="0" y1="-2" x2="0" y2="2" stroke="#111" strokeWidth="0.5" transform="rotate(45)" />
        </g>
        <g transform="translate(25, 455)">
            <circle r="3" fill="url(#screw-gradient)" stroke="#111" strokeWidth="0.2" />
            <line x1="-2" y1="0" x2="2" y2="0" stroke="#111" strokeWidth="0.5" transform="rotate(90)" />
            <line x1="0" y1="-2" x2="0" y2="2" stroke="#111" strokeWidth="0.5" transform="rotate(90)" />
        </g>
        <g transform="translate(215, 455)">
            <circle r="3" fill="url(#screw-gradient)" stroke="#111" strokeWidth="0.2" />
            <line x1="-2" y1="0" x2="2" y2="0" stroke="#111" strokeWidth="0.5" transform="rotate(135)" />
            <line x1="0" y1="-2" x2="0" y2="2" stroke="#111" strokeWidth="0.5" transform="rotate(135)" />
        </g>
        
        <rect x="40" y="12" width="40" height="6" fill="#f97316" rx="1" stroke="#c2410c" strokeWidth="0.5" />

      </svg>
    </div>
  );
};

export default Walkman;
