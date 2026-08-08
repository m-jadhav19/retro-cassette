import React, { useMemo } from 'react';
import { Song } from '../types';

interface VinylProps {
  song: Song;
  isDraggable?: boolean;
  className?: string;
  isSpinning?: boolean;
  style?: React.CSSProperties;
}

const Vinyl: React.FC<VinylProps> = ({
  song,
  isDraggable = true,
  className = "",
  isSpinning = false,
  style
}) => {
  const filterId = useMemo(() => Math.random().toString(36).substr(2, 9), []);
  const vinylTint = song.vinylColor || '#111';

  return (
    <div
      className={`relative inline-block ${className} ${isDraggable ? 'cursor-grab active:cursor-grabbing' : ''}`}
      style={style}
    >
      <svg viewBox="0 0 300 300" className="w-full h-full overflow-visible pointer-events-none" style={{ filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5)) drop-shadow(0 3px 6px rgba(0,0,0,0.3))' }}>
        <defs>
          <radialGradient id={`vinyl-base-${filterId}`} cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor={vinylTint} stopOpacity="0.9" />
            <stop offset="60%" stopColor="#0a0a0a" />
            <stop offset="100%" stopColor="#000" />
          </radialGradient>

          <linearGradient id={`vinyl-sheen-${filterId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="35%" stopColor="white" stopOpacity="0" />
            <stop offset="50%" stopColor="white" stopOpacity="0.12" />
            <stop offset="65%" stopColor="white" stopOpacity="0" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>

          <radialGradient id={`label-shadow-${filterId}`} cx="50%" cy="50%" r="50%">
            <stop offset="85%" stopColor="#000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.4" />
          </radialGradient>

          {song.artworkUrl && (
            <clipPath id={`vinyl-art-${filterId}`}>
              <circle cx="150" cy="150" r="50" />
            </clipPath>
          )}
        </defs>

        {/* Outer edge lip */}
        <circle cx="150" cy="150" r="149" fill="#1a1a1a" stroke="#333" strokeWidth="0.5" />

        <g
          className={isSpinning ? 'animate-spin-vinyl' : ''}
          style={{ transformOrigin: '150px 150px' }}
        >
          <circle cx="150" cy="150" r="145" fill={`url(#vinyl-base-${filterId})`} />

          {/* Groove rings */}
          {Array.from({ length: 40 }).map((_, i) => {
            const r = 52 + i * 2.3;
            if (r > 143) return null;
            return (
              <circle
                key={i}
                cx="150" cy="150" r={r}
                fill="none"
                stroke={i % 2 === 0 ? '#222' : '#111'}
                strokeWidth="0.4"
                opacity="0.7"
              />
            );
          })}

          <circle cx="150" cy="150" r="145" fill={`url(#vinyl-sheen-${filterId})`} pointerEvents="none" />
          <circle cx="150" cy="150" r="145" fill={`url(#vinyl-sheen-${filterId})`} transform="rotate(90 150 150)" pointerEvents="none" />

          {/* Label */}
          <circle cx="150" cy="150" r="52" fill={song.accentColor} stroke="#222" strokeWidth="0.8" />
          {song.artworkUrl ? (
            <image
              href={song.artworkUrl}
              x="100" y="100" width="100" height="100"
              clipPath={`url(#vinyl-art-${filterId})`}
              preserveAspectRatio="xMidYMid slice"
            />
          ) : (
            <foreignObject x="100" y="100" width="100" height="100">
              <div className="w-full h-full flex flex-col items-center justify-center text-center p-1" style={{ color: song.color }}>
                <div className="font-bold uppercase tracking-widest leading-none mb-1 opacity-60" style={{ fontSize: '7px', fontFamily: 'sans-serif' }}>
                  STEREO
                </div>
                <div
                  className="font-hand leading-tight"
                  style={{
                    fontSize: song.title.length > 15 ? '10px' : '12px',
                    fontWeight: 'bold',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {song.title}
                </div>
                <div className="font-sans uppercase opacity-70 mt-1 truncate w-full" style={{ fontSize: '6px' }}>
                  {song.artist}
                </div>
              </div>
            </foreignObject>
          )}
          <circle cx="150" cy="150" r="52" fill={`url(#label-shadow-${filterId})`} pointerEvents="none" />
          <circle cx="150" cy="150" r="50" fill="none" stroke={song.color} strokeWidth="0.5" opacity="0.3" />

          <circle cx="150" cy="150" r="4" fill="#e8e8e8" stroke="#666" strokeWidth="0.5" />
        </g>

        {/* Static highlight arc */}
        <path d="M 60,90 Q 150,50 240,90" fill="none" stroke="white" strokeWidth="8" opacity="0.06" strokeLinecap="round" pointerEvents="none" />
      </svg>
    </div>
  );
};

export default Vinyl;
