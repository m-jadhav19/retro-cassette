import React, { useRef, useState, useEffect } from 'react';
import { Song, PlayerStatus } from '../types';
import CompactDisc from './CompactDisc';

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

interface CDPlayerProps {
  currentDisc: Song | null;
  onEject: () => void;
  sharedAudio: SharedAudio;
}

const CDPlayer: React.FC<CDPlayerProps> = ({ currentDisc, onEject, sharedAudio }) => {
  const { status, currentTime, duration, volume, setVolume, onPlay, onStop, onSeek, isScrubbingRef } = sharedAudio;
  
  const [isLidOpen, setIsLidOpen] = useState(false);
  const volumeTrackRef = useRef<SVGRectElement>(null);
  const isVolumeDraggingRef = useRef(false);

  // Format time for LCD
  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Handle Play/Pause
  const handlePlayPause = () => {
    if (status === PlayerStatus.PLAYING) {
      onStop();
    } else {
      if (currentDisc) onPlay();
    }
  };

  // Handle Volume Drag
  const handleVolumePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    isVolumeDraggingRef.current = true;
    const element = e.currentTarget as Element;
    element.setPointerCapture(e.pointerId);
    
    if (volumeTrackRef.current) {
        const rect = volumeTrackRef.current.getBoundingClientRect();
        const relativeY = e.clientY - rect.top; // Vertical slider for thumbwheel
        const percent = 1 - Math.max(0, Math.min(1, relativeY / rect.height));
        setVolume(percent);
    }
  };

  const handleVolumePointerMove = (e: React.PointerEvent) => {
      if (!isVolumeDraggingRef.current) return;
      e.stopPropagation();
      if (volumeTrackRef.current) {
        const rect = volumeTrackRef.current.getBoundingClientRect();
        const relativeY = e.clientY - rect.top;
        const percent = 1 - Math.max(0, Math.min(1, relativeY / rect.height));
        setVolume(percent);
      }
  };

  const handleVolumePointerUp = (e: React.PointerEvent) => {
      isVolumeDraggingRef.current = false;
      const element = e.currentTarget as Element;
      element.releasePointerCapture(e.pointerId);
  };

  // Helper for skip buttons
  const handleSkipForward = () => {
      onSeek(Math.min(duration, currentTime + 10));
  };

  const handleSkipBack = () => {
      onSeek(Math.max(0, currentTime - 10));
  };

  return (
    <div className="relative w-[400px] h-[400px] select-none">
      <svg viewBox="0 0 500 500" className="w-full h-full drop-shadow-2xl">
        <defs>
          {/* Main Body Silver Gradient */}
          <radialGradient id="chassis-gradient" cx="30%" cy="30%" r="80%" fx="30%" fy="30%">
            <stop offset="0%" stopColor="#e5e7eb" />
            <stop offset="100%" stopColor="#9ca3af" />
          </radialGradient>
          
          {/* Side/Edge Gradient for 3D depth */}
          <linearGradient id="chassis-side-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#6b7280" />
            <stop offset="50%" stopColor="#374151" />
            <stop offset="100%" stopColor="#1f2937" />
          </linearGradient>

          {/* Lid Glass Gradient */}
          <linearGradient id="lid-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#1d4ed8" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.4" />
          </linearGradient>

          {/* Button Gradient */}
          <linearGradient id="button-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#d1d5db" />
            <stop offset="100%" stopColor="#9ca3af" />
          </linearGradient>

          {/* Button Active Gradient */}
          <linearGradient id="button-active-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#9ca3af" />
            <stop offset="100%" stopColor="#6b7280" />
          </linearGradient>

          {/* LCD Glow */}
          <filter id="lcd-glow">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          
          {/* Inset Shadow for LCD/Buttons */}
          <filter id="inset-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feComponentTransfer in="SourceAlpha">
                <feFuncA type="table" tableValues="1 0" />
            </feComponentTransfer>
            <feGaussianBlur stdDeviation="2" />
            <feOffset dx="1" dy="2" result="offsetblur" />
            <feFlood floodColor="#000" floodOpacity="0.5" result="color" />
            <feComposite in2="offsetblur" operator="in" />
            <feComposite in2="SourceAlpha" operator="in" />
            <feMerge>
                <feMergeNode in="SourceGraphic" />
                <feMergeNode />
            </feMerge>
          </filter>
        </defs>

        {/* --- MAIN CHASSIS (3D Depth) --- */}
        {/* Darker bottom layer for thickness */}
        <path 
            d="M 50,250 A 200,200 0 0 0 450,250 L 450,270 A 200,200 0 0 1 50,270 Z" 
            fill="url(#chassis-side-gradient)" 
        />
        {/* Main Top Surface */}
        <circle cx="250" cy="250" r="200" fill="url(#chassis-gradient)" stroke="#d1d5db" strokeWidth="1" />
        
        {/* Anti-shock Ring / Groove */}
        <circle cx="250" cy="250" r="190" fill="none" stroke="#fff" strokeWidth="1" opacity="0.5" />
        <circle cx="250" cy="250" r="192" fill="none" stroke="#6b7280" strokeWidth="1" opacity="0.3" />


        {/* --- LID AREA --- */}
        <g transform="translate(0, -10)">
            <circle cx="250" cy="230" r="160" fill="#18181b" stroke="#27272a" strokeWidth="6" />
            {/* Inner Ring Detail */}
            <circle cx="250" cy="230" r="156" fill="none" stroke="#3f3f46" strokeWidth="1" />

            {/* Render CD inside */}
            {currentDisc && (
                <foreignObject x="90" y="70" width="320" height="320">
                    <div className={`w-full h-full flex items-center justify-center transition-opacity duration-500`}>
                        <CompactDisc 
                            song={currentDisc} 
                            isDraggable={false} 
                            isSpinning={status === PlayerStatus.PLAYING}
                            className="w-[300px] h-[300px]" 
                        />
                    </div>
                </foreignObject>
            )}

            {/* Glass Window Reflection */}
            <circle cx="250" cy="230" r="160" fill="url(#lid-gradient)" pointerEvents="none" />
            {/* Specular Highlight on Glass */}
            <path d="M 150,150 Q 250,100 350,150 Q 300,180 200,180 Q 150,150 150,150" fill="white" opacity="0.1" pointerEvents="none" />
        </g>

        {/* Hinge Detail */}
        <rect x="200" y="25" width="100" height="25" rx="4" fill="#9ca3af" stroke="#6b7280" strokeWidth="1" />
        <line x1="200" y1="37" x2="300" y2="37" stroke="#6b7280" strokeWidth="1" />


        {/* --- CONTROL PANEL (Bottom Curve) --- */}
        <g transform="translate(0, 10)">
            {/* Panel Area Background */}
            <path d="M 80,330 Q 250,480 420,330 L 420,360 Q 250,510 80,360 Z" fill="#d1d5db" opacity="0.5" />
            
            {/* LCD Screen - Recessed */}
            <g transform="translate(190, 390)">
                <rect x="0" y="0" width="120" height="40" rx="4" fill="#1f2937" stroke="#4b5563" strokeWidth="2" filter="url(#inset-shadow)" />
                <rect x="5" y="5" width="110" height="30" rx="2" fill="#86efac" opacity="0.1" />
                {/* Text */}
                <text x="60" y="26" textAnchor="middle" fontFamily="monospace" fontSize="20" fill="#86efac" fontWeight="bold" filter="url(#lcd-glow)" letterSpacing="2">
                    {status === PlayerStatus.PLAYING ? formatTime(currentTime) : "--:--"}
                </text>
                <text x="60" y="38" textAnchor="middle" fontFamily="sans-serif" fontSize="6" fill="#86efac" opacity="0.7">
                    {currentDisc ? "TRACK 01" : "NO DISC"}
                </text>
            </g>

            {/* BUTTONS - 3D Pill Shape */}
            <g transform="translate(0, 10)">
                
                {/* Play/Pause Button - Central */}
                <g 
                    className="cursor-pointer hover:brightness-110 active:brightness-90 transition-all"
                    onPointerDown={handlePlayPause}
                    transform="translate(400, 360)"
                >
                    <circle r="22" fill="url(#button-gradient)" stroke="#9ca3af" strokeWidth="1" filter="url(#inset-shadow)" />
                    <circle r="18" fill="#e5e7eb" opacity="0.5" />
                    {/* Play Icon */}
                    {status === PlayerStatus.PLAYING ? (
                         <g transform="translate(-6, -6)">
                             <rect width="4" height="12" fill="#374151" />
                             <rect x="8" width="4" height="12" fill="#374151" />
                         </g>
                    ) : (
                        <path d="M -4,-8 L 10,0 L -4,8 Z" fill="#374151" />
                    )}
                </g>

                {/* Stop Button - Left */}
                <g 
                    className="cursor-pointer hover:brightness-110 active:brightness-90 transition-all"
                    onPointerDown={onStop}
                    transform="translate(100, 360)"
                >
                    <circle r="22" fill="url(#button-gradient)" stroke="#9ca3af" strokeWidth="1" filter="url(#inset-shadow)" />
                     <circle r="18" fill="#e5e7eb" opacity="0.5" />
                    <rect x="-6" y="-6" width="12" height="12" fill="#ef4444" opacity="0.8" />
                </g>

                {/* Skip Controls - Grouped */}
                <g transform="translate(140, 330)">
                     {/* Back */}
                    <path 
                        d="M 0,0 L 25,0 L 30,15 L 25,30 L 0,30 L -5,15 Z" 
                        fill="url(#button-gradient)" 
                        stroke="#9ca3af" 
                        strokeWidth="1"
                        transform="translate(0,0) scale(0.8)"
                        className="cursor-pointer hover:brightness-110 active:scale-95 transition-transform origin-center"
                        onPointerDown={handleSkipBack}
                    />
                    <path d="M 12,12 L 8,15 L 12,18 M 16,12 L 12,15 L 16,18" stroke="#374151" strokeWidth="2" fill="none" pointerEvents="none" />
                </g>

                <g transform="translate(330, 330)">
                    {/* Forward */}
                     <path 
                        d="M 0,0 L 25,0 L 30,15 L 25,30 L 0,30 L -5,15 Z" 
                        fill="url(#button-gradient)" 
                        stroke="#9ca3af" 
                        strokeWidth="1"
                         transform="translate(0,0) scale(0.8)"
                        className="cursor-pointer hover:brightness-110 active:scale-95 transition-transform origin-center"
                        onPointerDown={handleSkipForward}
                    />
                    <path d="M 8,12 L 12,15 L 8,18 M 12,12 L 16,15 L 12,18" stroke="#374151" strokeWidth="2" fill="none" pointerEvents="none" />
                </g>
            </g>
        </g>

        {/* Volume Thumbwheel (Side) */}
        <g transform="translate(450, 200)">
            <text x="-25" y="-60" fontSize="8" fill="#4b5563" transform="rotate(90)" fontWeight="bold">VOLUME</text>
            <rect x="-10" y="-50" width="20" height="100" rx="4" fill="#374151" stroke="#1f2937" />
            {/* The wheel itself */}
            <rect 
                ref={volumeTrackRef}
                x="-8" y="-45" width="16" height="90" rx="2" 
                fill="#1f2937" 
                className="cursor-ns-resize"
                onPointerDown={handleVolumePointerDown}
                onPointerMove={handleVolumePointerMove}
                onPointerUp={handleVolumePointerUp}
                onPointerLeave={handleVolumePointerUp}
            />
            {/* Serrated texture lines */}
            {[...Array(15)].map((_, i) => (
                <line 
                    key={i} 
                    x1="-8" y1={-40 + i * 6} 
                    x2="8" y2={-40 + i * 6} 
                    stroke="#4b5563" 
                    strokeWidth="1" 
                    pointerEvents="none"
                    opacity={Math.abs((volume * 15) - (15-i)) < 3 ? 1 : 0.3} // Highlight based on volume
                />
            ))}
            {/* Indicator */}
            <circle cx="12" cy={45 - (volume * 90)} r="2" fill="#facc15" />
        </g>

        {/* Eject Slider Latch */}
        <g transform="translate(460, 280) rotate(0)">
             <path 
                d="M 0,0 L 20,0 L 25,10 L 20,20 L 0,20 Z" 
                fill="#f97316" stroke="#c2410c" strokeWidth="1"
                className="cursor-pointer hover:brightness-110 active:translate-x-1 transition-transform"
                onPointerDown={onEject}
            />
            <path d="M 12,6 L 18,10 L 12,14" stroke="white" strokeWidth="2" fill="none" pointerEvents="none" />
             <text x="5" y="-5" fontSize="8" fill="#4b5563" fontWeight="bold">OPEN</text>
        </g>

        {/* Branding */}
        <g transform="translate(250, 470)">
             <text textAnchor="middle" fontFamily="sans-serif" fontWeight="bold" fontSize="12" fill="#6b7280" letterSpacing="4">SONY</text>
             <text y="15" textAnchor="middle" fontFamily="sans-serif" fontSize="8" fill="#9ca3af" letterSpacing="1">ELECTRONIC SHOCK PROTECTION</text>
        </g>

      </svg>
    </div>
  );
};

export default CDPlayer;
