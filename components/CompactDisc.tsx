import React, { useMemo } from 'react';
import { Song } from '../types';

interface CompactDiscProps {
  song: Song;
  isDraggable?: boolean;
  className?: string;
  isSpinning?: boolean;
  style?: React.CSSProperties;
}

const CompactDisc: React.FC<CompactDiscProps> = ({
  song,
  isDraggable = true,
  className = "",
  isSpinning = false,
  style
}) => {
  const filterId = useMemo(() => Math.random().toString(36).substr(2, 9), []);
  const upperCurveId = `upper-curve-${filterId}`;
  const lowerCurveId = `lower-curve-${filterId}`;

  return (
    <div
      className={`relative inline-block ${className} ${isDraggable ? 'cursor-grab active:cursor-grabbing' : ''}`}
      style={style}
    >
      <svg viewBox="0 0 300 300" className="w-full h-full overflow-visible pointer-events-none" style={{ filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.35)) drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>
        <defs>
          <radialGradient id={`spectral-${filterId}`} cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#f8f8f8" />
            <stop offset="28%" stopColor="#e8d4f0" />
            <stop offset="35%" stopColor="#d4f0e8" />
            <stop offset="42%" stopColor="#f0f0d4" />
            <stop offset="50%" stopColor="#d4e8f0" />
            <stop offset="58%" stopColor="#f0d4e8" />
            <stop offset="65%" stopColor="#e0e8f0" />
            <stop offset="80%" stopColor="#d8d8d8" />
            <stop offset="100%" stopColor="#c0c0c0" />
          </radialGradient>

          <linearGradient id={`sheen-a-${filterId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="42%" stopColor="white" stopOpacity="0" />
            <stop offset="50%" stopColor="white" stopOpacity="0.55" />
            <stop offset="58%" stopColor="white" stopOpacity="0" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>

          <linearGradient id={`sheen-b-${filterId}`} x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="48%" stopColor="white" stopOpacity="0.25" />
            <stop offset="52%" stopColor="white" stopOpacity="0" />
          </linearGradient>

          <radialGradient id={`hub-${filterId}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fafafa" />
            <stop offset="70%" stopColor="#e8e8e8" />
            <stop offset="100%" stopColor="#d0d0d0" />
          </radialGradient>

          <filter id={`disc-shadow-${filterId}`}>
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3" />
          </filter>

          <path id={upperCurveId} d="M 55,150 A 95,95 0 0,1 245,150" fill="none" />
          <path id={lowerCurveId} d="M 55,150 A 95,95 0 0,0 245,150" fill="none" />

          {song.artworkUrl && (
            <clipPath id={`cd-art-clip-${filterId}`}>
              <circle cx="150" cy="150" r="115" />
            </clipPath>
          )}
        </defs>

        {/* Outer clear plastic rim */}
        <circle cx="150" cy="150" r="148" fill="#f0f0f0" stroke="#c8c8c8" strokeWidth="0.5" />

        <g
          className={isSpinning ? 'animate-spin-cd' : ''}
          style={{ transformOrigin: '150px 150px' }}
        >
          {/* Data surface */}
          {song.artworkUrl && (
            <image
              href={song.artworkUrl}
              x="35" y="35" width="230" height="230"
              clipPath={`url(#cd-art-clip-${filterId})`}
              preserveAspectRatio="xMidYMid slice"
            />
          )}
          <circle cx="150" cy="150" r="140" fill={`url(#spectral-${filterId})`} opacity={song.artworkUrl ? 0.35 : 1} />
          <circle cx="150" cy="150" r="140" fill={`url(#sheen-a-${filterId})`} style={{ mixBlendMode: 'overlay' }} />
          <circle cx="150" cy="150" r="140" fill={`url(#sheen-b-${filterId})`} style={{ mixBlendMode: 'soft-light' }} transform="rotate(72 150 150)" />

          {/* Micro-groove rings */}
          {[118, 108, 98, 88, 78, 68, 58, 52].map((r) => (
            <circle key={r} cx="150" cy="150" r={r} fill="none" stroke="#000" strokeWidth="0.3" opacity="0.06" />
          ))}

          {/* Inner clear ring */}
          <circle cx="150" cy="150" r="48" fill="#f8f8f8" stroke="#ddd" strokeWidth="0.5" />

          {/* Hub */}
          <circle cx="150" cy="150" r="22" fill={`url(#hub-${filterId})`} stroke="#ccc" strokeWidth="0.5" />
          <circle cx="150" cy="150" r="15" fill="none" stroke="#e0e0e0" strokeWidth="1.5" />
          <circle cx="150" cy="150" r="4" fill="#bbb" stroke="#999" strokeWidth="0.5" />

          {/* Handwritten label — only when no artwork */}
          {!song.artworkUrl && (
            <>
              <text
                style={{
                  fontSize: '15px',
                  fontFamily: '"Permanent Marker", "Comic Sans MS", cursive',
                  fill: song.color || '#444',
                  letterSpacing: '1px',
                }}
              >
                <textPath href={`#${upperCurveId}`} startOffset="50%" textAnchor="middle">
                  {song.title}
                </textPath>
              </text>
              <text
                style={{
                  fontSize: '11px',
                  fontFamily: '"Permanent Marker", "Comic Sans MS", cursive',
                  fill: song.color || '#666',
                  opacity: 0.85,
                }}
              >
                <textPath href={`#${lowerCurveId}`} startOffset="50%" textAnchor="middle">
                  {song.artist}
                </textPath>
              </text>
            </>
          )}

          <circle cx="150" cy="150" r="105" fill="none" stroke={song.color} strokeWidth="1.5" strokeDasharray="6 14" opacity="0.25" transform="rotate(15 150 150)" />
        </g>

        {/* Static specular highlight (doesn't spin) */}
        <ellipse cx="115" cy="105" rx="55" ry="25" fill="white" opacity="0.12" transform="rotate(-30 115 105)" pointerEvents="none" />
        <circle cx="150" cy="150" r="148" fill="none" stroke="#fff" strokeWidth="1" opacity="0.4" />
      </svg>
    </div>
  );
};

export default CompactDisc;
