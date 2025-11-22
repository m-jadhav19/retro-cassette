
import React, { useMemo } from 'react';
import { Song } from '../types';

interface CassetteProps {
  song: Song;
  isDraggable?: boolean;
  className?: string;
  isSpinning?: boolean;
  style?: React.CSSProperties;
}

const Cassette: React.FC<CassetteProps> = ({ 
  song, 
  isDraggable = true, 
  className = "", 
  isSpinning = false,
  style
}) => {
  
  // Unique IDs for filters to prevent conflicts when multiple cassettes are rendered
  const filterId = useMemo(() => Math.random().toString(36).substr(2, 9), []);
  
  return (
    <div 
      className={`relative inline-block ${className} ${isDraggable ? 'cursor-grab active:cursor-grabbing' : ''}`}
      style={style}
    >
      <svg viewBox="0 0 600 380" className="w-full h-full overflow-visible filter drop-shadow-lg pointer-events-none">
        <defs>
          {/* Plastic Grain Texture */}
          <filter id={`plastic-grain-${filterId}`} x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="1.5" numOctaves="3" result="noise" />
            <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.05 0" in="noise" result="coloredNoise" />
            <feComposite operator="in" in="coloredNoise" in2="SourceGraphic" result="composite" />
            <feBlend mode="overlay" in="composite" in2="SourceGraphic" />
          </filter>

          {/* Body Gradient */}
          <linearGradient id={`body-gradient-${filterId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={song.color} stopOpacity="0.95" />
            <stop offset="100%" stopColor={song.color} stopOpacity="1" />
          </linearGradient>

          {/* Paper Texture */}
          <filter id={`paper-texture-${filterId}`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" result="noise" />
            <feDiffuseLighting in="noise" lightingColor="#fff" surfaceScale="1.2">
              <feDistantLight azimuth="45" elevation="60" />
            </feDiffuseLighting>
            <feComposite operator="in" in2="SourceGraphic" />
            <feBlend mode="multiply" in="SourceGraphic" />
          </filter>
        </defs>

        {/* --- CASSETTE BODY --- */}
        {/* Main Shape */}
        <path 
          d="M 20,20 H 580 A 15,15 0 0 1 595,35 V 345 A 15,15 0 0 1 580,360 H 540 L 530,370 H 70 L 60,360 H 20 A 15,15 0 0 1 5,345 V 35 A 15,15 0 0 1 20,20 Z" 
          fill={`url(#body-gradient-${filterId})`} 
          stroke="#000" 
          strokeOpacity="0.2" 
          strokeWidth="1" 
        />
        
        {/* Top Bevel Highlight */}
        <path d="M 20,22 H 580 A 12,12 0 0 1 592,34" stroke="#fff" strokeWidth="2" fill="none" opacity="0.5" />
        
        {/* Bottom Bevel Shadow */}
        <path d="M 5,345 A 15,15 0 0 0 20,360 H 60 L 70,370 H 530 L 540,360 H 580" stroke="#000" strokeWidth="3" fill="none" opacity="0.2" />
        
        {/* Texture Overlay */}
        <path 
          d="M 20,20 H 580 A 15,15 0 0 1 595,35 V 345 A 15,15 0 0 1 580,360 H 540 L 530,370 H 70 L 60,360 H 20 A 15,15 0 0 1 5,345 V 35 A 15,15 0 0 1 20,20 Z" 
          fill={song.color} 
          filter={`url(#plastic-grain-${filterId})`} 
          opacity="0.3" 
        />

        {/* --- LABEL AREA --- */}
        <g transform="translate(45, 55)">
          <rect width="510" height="200" rx="8" fill={song.accentColor} filter={`url(#paper-texture-${filterId})`} />
          {/* Stripes */}
          <line x1="0" y1="40" x2="510" y2="40" stroke={song.color} strokeWidth="2" opacity="0.4" />
          <line x1="0" y1="44" x2="510" y2="44" stroke={song.color} strokeWidth="1" opacity="0.3" />
          
          {/* Side Markers */}
          <text x="25" y="32" fontFamily="sans-serif" fontSize="24" fontWeight="900" fill={song.color}>A</text>
          <text x="470" y="32" fontFamily="sans-serif" fontSize="14" fontWeight="bold" fill={song.color} opacity="0.6">NR</text>

          {/* --- HTML Text Overlay for Wrapping --- */}
          <foreignObject x="55" y="10" width="400" height="180">
            <div className="w-full h-full flex flex-col items-center justify-center text-center" style={{ color: song.color }}>
               {/* Title: Handwritten font, allows wrapping */}
               <div 
                 className="font-hand leading-tight w-full"
                 style={{ 
                   fontSize: song.title.length > 20 ? '20px' : '28px',
                   display: '-webkit-box',
                   WebkitLineClamp: 2,
                   WebkitBoxOrient: 'vertical',
                   overflow: 'hidden',
                   marginTop: '10px'
                 }}
               >
                 {song.title}
               </div>
               
               {/* Artist: Smaller font, pushed to bottom area */}
               <div 
                 className="font-sans font-bold uppercase opacity-70 tracking-wider w-full truncate mt-2"
                 style={{ fontSize: '12px', fontFamily: "'Rock Salt', cursive" }}
               >
                 {song.artist}
               </div>
            </div>
          </foreignObject>
        </g>

        {/* --- CENTER WINDOW (Trapezoid) --- */}
        <path d="M 130,110 H 470 L 490,240 H 110 Z" fill="#1a1a1a" opacity="0.9" />
        <path d="M 130,110 H 470 L 490,240 H 110 Z" fill="#fff" opacity="0.15" /> {/* Reflection */}

        {/* --- REELS --- */}
        {/* Left Reel */}
        <g transform="translate(185, 175)">
          <circle r="58" fill="#221d1d" stroke="#111" strokeWidth="1" />
          {/* White Teeth */}
          <g 
            style={{ 
              animation: isSpinning ? 'spin 4s linear infinite reverse' : 'none', 
              transformOrigin: '0px 0px' 
            }}
          >
            <circle r="22" fill="#fff" stroke="#ccc" strokeWidth="1" />
            {[0, 60, 120, 180, 240, 300].map((deg) => (
              <rect key={deg} x="-4" y="-22" width="8" height="12" fill="#fff" transform={`rotate(${deg})`} />
            ))}
            <circle r="16" fill="#221d1d" />
            <rect x="-3" y="-16" width="6" height="8" fill="#fff" />
            <rect x="-3" y="-16" width="6" height="8" fill="#fff" transform="rotate(120)" />
            <rect x="-3" y="-16" width="6" height="8" fill="#fff" transform="rotate(240)" />
          </g>
        </g>

        {/* Right Reel */}
        <g transform="translate(415, 175)">
          <circle r="45" fill="#221d1d" stroke="#111" strokeWidth="1" />
          <g 
             style={{ 
              animation: isSpinning ? 'spin 4s linear infinite reverse' : 'none', 
              transformOrigin: '0px 0px' 
            }}
          >
             <circle r="22" fill="#fff" stroke="#ccc" strokeWidth="1" />
            {[0, 60, 120, 180, 240, 300].map((deg) => (
              <rect key={deg} x="-4" y="-22" width="8" height="12" fill="#fff" transform={`rotate(${deg})`} />
            ))}
            <circle r="16" fill="#221d1d" />
            <rect x="-3" y="-16" width="6" height="8" fill="#fff" />
            <rect x="-3" y="-16" width="6" height="8" fill="#fff" transform="rotate(120)" />
            <rect x="-3" y="-16" width="6" height="8" fill="#fff" transform="rotate(240)" />
          </g>
        </g>

        {/* Tape Ribbon */}
        <path d="M 243,185 Q 300,188 370,185" fill="none" stroke="#3a2f2f" strokeWidth="45" strokeLinecap="butt" />

        {/* Window Shine */}
        <path d="M 130,110 L 160,240 L 200,240 L 170,110 Z" fill="#fff" opacity="0.05" pointerEvents="none" />

        {/* --- BOTTOM FELT PAD --- */}
        <g transform="translate(0, 260)">
          <path d="M 130,0 H 470 L 460,60 H 140 Z" fill="#000" opacity="0.2" />
          <rect x="280" y="30" width="40" height="25" fill="#c0a060" rx="2" /> {/* Felt */}
          <rect x="285" y="35" width="30" height="15" fill="#5d4037" rx="1" /> {/* Metal shield */}
          <circle cx="180" cy="30" r="8" fill="#000" /> {/* Screw hole */}
          <circle cx="420" cy="30" r="8" fill="#000" /> {/* Screw hole */}
        </g>

        <text x="520" y="330" fill={song.color} opacity="0.7" fontFamily="monospace" fontSize="10" fontWeight="bold">TYPE I</text>
      </svg>
    </div>
  );
};

export default Cassette;
