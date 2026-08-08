import React, { useMemo } from 'react';
import { Song } from '../types';

export type ReelMode = 'stopped' | 'play' | 'fast';
export type CassetteSide = 'A' | 'B';

interface CassetteProps {
  song: Song;
  isDraggable?: boolean;
  className?: string;
  isSpinning?: boolean;
  reelMode?: ReelMode;
  reelDirection?: 1 | -1;
  progress?: number;
  side?: CassetteSide;
  flipRotation?: number;
  style?: React.CSSProperties;
}

const ReelHub: React.FC<{
  tapeRadius: number;
  isSpinning: boolean;
  reelMode: ReelMode;
  direction: 1 | -1;
  filterId: string;
}> = ({ tapeRadius, isSpinning, reelMode, direction, filterId }) => {
  const spinClass = isSpinning
    ? reelMode === 'fast'
      ? 'animate-spin-reel-fast'
      : 'animate-spin-reel'
    : '';

  const spinStyle: React.CSSProperties = {
    transformOrigin: '0px 0px',
    animationDirection: direction < 0 ? 'reverse' : 'normal',
  };

  return (
    <>
      <circle r={tapeRadius + 6} fill="#1a1515" stroke="#111" strokeWidth="1" />
      <circle r={tapeRadius} fill="#221d1d" stroke="#111" strokeWidth="0.5" />
      <g className={spinClass} style={spinStyle}>
        <circle r={22} fill="#f5f5f5" stroke="#ccc" strokeWidth="1" />
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <rect key={deg} x="-4" y="-22" width="8" height="12" fill="#fff" transform={`rotate(${deg})`} />
        ))}
        <circle r={16} fill="#221d1d" />
        <rect x="-3" y="-16" width="6" height="8" fill="#fff" />
        <rect x="-3" y="-16" width="6" height="8" fill="#fff" transform="rotate(120)" />
        <rect x="-3" y="-16" width="6" height="8" fill="#fff" transform="rotate(240)" />
      </g>
    </>
  );
};

const Cassette: React.FC<CassetteProps> = ({
  song,
  isDraggable = true,
  className = '',
  isSpinning = false,
  reelMode = 'stopped',
  reelDirection = 1,
  progress = 0,
  side = 'A',
  flipRotation = 0,
  style,
}) => {
  const filterId = useMemo(() => Math.random().toString(36).substr(2, 9), []);
  const p = Math.max(0, Math.min(1, progress));

  const leftTapeRadius = 32 + (1 - p) * 26;
  const rightTapeRadius = 32 + p * 26;
  const leftX = 185 - (1 - p) * 8;
  const rightX = 415 + p * 8;
  const tapeY = 175 + Math.sin(p * Math.PI) * 2;

  const labelSide = side === 'A' ? 'A' : 'B';
  const isFlipped = Math.abs(flipRotation) > 90;
  const leftReelDirection: 1 | -1 = reelDirection === -1 ? 1 : -1;
  const rightReelDirection: 1 | -1 = reelDirection === -1 ? -1 : 1;

  return (
    <div
      className={`relative inline-block ${className} ${isDraggable ? 'cursor-grab active:cursor-grabbing' : ''}`}
      style={{
        ...style,
        transform: `rotateY(${flipRotation}deg)`,
        transformStyle: 'preserve-3d',
        transition: 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      <svg
        viewBox="0 0 600 380"
        className="w-full h-full overflow-visible pointer-events-none cassette-shadow"
      >
        <defs>
          <filter id={`plastic-grain-${filterId}`} x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="1.5" numOctaves="3" result="noise" />
            <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.05 0" in="noise" result="coloredNoise" />
            <feComposite operator="in" in="coloredNoise" in2="SourceGraphic" result="composite" />
            <feBlend mode="overlay" in="composite" in2="SourceGraphic" />
          </filter>
          <linearGradient id={`body-gradient-${filterId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={song.color} stopOpacity="1" />
            <stop offset="40%" stopColor={song.color} stopOpacity="0.95" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.25" />
          </linearGradient>
          <linearGradient id={`body-highlight-${filterId}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.15" />
            <stop offset="50%" stopColor="#fff" stopOpacity="0" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0.08" />
          </linearGradient>
          <filter id={`paper-texture-${filterId}`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" result="noise" />
            <feDiffuseLighting in="noise" lightingColor="#fff" surfaceScale="1.2">
              <feDistantLight azimuth="45" elevation="60" />
            </feDiffuseLighting>
            <feComposite operator="in" in2="SourceGraphic" />
            <feBlend mode="multiply" in="SourceGraphic" />
          </filter>
          {song.artworkUrl && (
            <clipPath id={`cassette-art-${filterId}`}>
              <rect x="395" y="58" width="100" height="100" rx="4" />
            </clipPath>
          )}
        </defs>

        <path
          d="M 20,20 H 580 A 15,15 0 0 1 595,35 V 345 A 15,15 0 0 1 580,360 H 540 L 530,370 H 70 L 60,360 H 20 A 15,15 0 0 1 5,345 V 35 A 15,15 0 0 1 20,20 Z"
          fill={`url(#body-gradient-${filterId})`}
          stroke="#000"
          strokeOpacity="0.2"
          strokeWidth="1"
        />
        <path d="M 20,22 H 580 A 12,12 0 0 1 592,34" stroke="#fff" strokeWidth="2" fill="none" opacity="0.5" />
        <path
          d="M 20,20 H 580 A 15,15 0 0 1 595,35 V 345 A 15,15 0 0 1 580,360 H 540 L 530,370 H 70 L 60,360 H 20 A 15,15 0 0 1 5,345 V 35 A 15,15 0 0 1 20,20 Z"
          fill={`url(#body-highlight-${filterId})`}
          pointerEvents="none"
        />

        {[[30, 30], [570, 30], [30, 350], [570, 350]].map(([cx, cy], i) => (
          <g key={i} transform={`translate(${cx}, ${cy})`}>
            <circle r="6" fill="#222" stroke="#111" strokeWidth="0.5" />
            <line x1="-3" y1="0" x2="3" y2="0" stroke="#444" strokeWidth="1" transform={`rotate(${i * 45})`} />
            <line x1="0" y1="-3" x2="0" y2="3" stroke="#444" strokeWidth="1" transform={`rotate(${i * 45})`} />
          </g>
        ))}

        <path d="M 5,345 A 15,15 0 0 0 20,360 H 60 L 70,370 H 530 L 540,360 H 580" stroke="#000" strokeWidth="3" fill="none" opacity="0.2" />

        <g transform="translate(45, 55)" opacity={isFlipped ? 0.85 : 1}>
          <rect width="510" height="200" rx="8" fill={song.accentColor} filter={`url(#paper-texture-${filterId})`} />
          <line x1="0" y1="40" x2="510" y2="40" stroke={song.color} strokeWidth="2" opacity="0.4" />
          <line x1="0" y1="44" x2="510" y2="44" stroke={song.color} strokeWidth="1" opacity="0.3" />
          <text x="25" y="32" fontFamily="IBM Plex Mono, monospace" fontSize="24" fontWeight="900" fill={song.color}>{labelSide}</text>
          <text x="470" y="32" fontFamily="IBM Plex Mono, monospace" fontSize="14" fontWeight="bold" fill={song.color} opacity="0.6">NR</text>

          {song.artworkUrl && !isFlipped && (
            <g>
              <rect x="395" y="58" width="100" height="100" rx="4" fill="#ddd" stroke={song.color} strokeWidth="1.5" opacity="0.5" />
              <image href={song.artworkUrl} x="395" y="58" width="100" height="100" clipPath={`url(#cassette-art-${filterId})`} preserveAspectRatio="xMidYMid slice" />
            </g>
          )}

          <foreignObject x="55" y="5" width={song.artworkUrl && !isFlipped ? '320' : '490'} height="180">
            <div className="w-full h-full flex flex-col items-start justify-start text-left" style={{ color: song.color }}>
              <div className="font-display leading-tight" style={{ fontSize: song.title.length > 20 ? '20px' : '26px', maxWidth: '400px' }}>
                {isFlipped ? `${song.artist} — B-SIDE` : song.title}
              </div>
              <div className="font-mono uppercase opacity-70 tracking-wider truncate mt-2" style={{ fontSize: '11px', maxWidth: '400px' }}>
                {isFlipped ? 'FLIP FOR SIDE A' : song.artist}
              </div>
            </div>
          </foreignObject>
        </g>

        <path d="M 130,110 H 470 L 490,240 H 110 Z" fill="#0a0a0a" />
        <path d="M 130,110 H 470 L 490,240 H 110 Z" fill="none" stroke="#333" strokeWidth="1" />
        <path d="M 130,110 L 160,240 L 200,240 L 170,110 Z" fill="#fff" opacity="0.04" pointerEvents="none" />

        {/* Dynamic tape path between reels */}
        <path
          d={`M ${leftX + leftTapeRadius * 0.6},${tapeY} Q 300,${tapeY + 6} ${rightX - rightTapeRadius * 0.6},${tapeY}`}
          fill="none"
          stroke="#2a2220"
          strokeWidth={Math.max(8, (leftTapeRadius + rightTapeRadius) * 0.35)}
          strokeLinecap="round"
          opacity="0.9"
        />

        <g transform={`translate(${leftX}, ${tapeY})`}>
          <ReelHub tapeRadius={leftTapeRadius} isSpinning={isSpinning} reelMode={reelMode} direction={leftReelDirection} filterId={filterId} />
        </g>
        <g transform={`translate(${rightX}, ${tapeY})`}>
          <ReelHub tapeRadius={rightTapeRadius} isSpinning={isSpinning} reelMode={reelMode} direction={rightReelDirection} filterId={filterId} />
        </g>

        <g transform="translate(0, 260)">
          <path d="M 130,0 H 470 L 460,60 H 140 Z" fill="#000" opacity="0.2" />
          <rect x="280" y="30" width="40" height="25" fill="#c0a060" rx="2" />
          <rect x="285" y="35" width="30" height="15" fill="#5d4037" rx="1" />
        </g>

        <text x="520" y="330" fill={song.color} opacity="0.7" fontFamily="IBM Plex Mono, monospace" fontSize="10" fontWeight="bold">TYPE I</text>
      </svg>
    </div>
  );
};

export default Cassette;
