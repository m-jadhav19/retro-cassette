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
      <svg viewBox="0 0 300 300" className="w-full h-full overflow-visible filter drop-shadow-md pointer-events-none">
        <defs>
          {/* Realistic CD Spectral Gradient */}
          <radialGradient id={`spectral-${filterId}`} cx="50%" cy="50%" r="50%">
            <stop offset="25%" stopColor="#e0e0e0" />
            <stop offset="30%" stopColor="#ffcccc" />
            <stop offset="35%" stopColor="#ffffcc" />
            <stop offset="40%" stopColor="#ccffcc" />
            <stop offset="45%" stopColor="#ccffff" />
            <stop offset="50%" stopColor="#ccccff" />
            <stop offset="55%" stopColor="#ffccff" />
            <stop offset="60%" stopColor="#ffcccc" />
            <stop offset="70%" stopColor="#e0e0e0" />
            <stop offset="100%" stopColor="#d0d0d0" />
          </radialGradient>

          {/* Angular Reflection (Conic approximation using linear gradients) */}
          <linearGradient id={`sheen-${filterId}`} x1="0%" y1="0%" x2="100%" y2="100%">
             <stop offset="0%" stopColor="white" stopOpacity="0.0" />
             <stop offset="45%" stopColor="white" stopOpacity="0.0" />
             <stop offset="50%" stopColor="white" stopOpacity="0.6" />
             <stop offset="55%" stopColor="white" stopOpacity="0.0" />
             <stop offset="100%" stopColor="white" stopOpacity="0.0" />
          </linearGradient>

           {/* Paths for text curvature */}
           {/* Upper Arc: Clockwise from 9 o'clock to 3 o'clock */}
           <path id={upperCurveId} d="M 60,150 A 90,90 0 0,1 240,150" fill="none" />
           
           {/* Lower Arc: Counter-Clockwise from 9 o'clock to 3 o'clock (so text sits on top) */}
           {/* Actually for bottom text to read left-to-right, we need an arc that goes left to right along the bottom */}
           <path id={lowerCurveId} d="M 60,150 A 90,90 0 0,0 240,150" fill="none" />

        </defs>

        <g className={isSpinning ? "animate-spin-slow" : ""} style={{ transformOrigin: '150px 150px', animation: isSpinning ? 'spin 2s linear infinite' : 'none' }}>
          
          {/* Main Disc Body - Metallic Base */}
          <circle cx="150" cy="150" r="148" fill="#e5e5e5" stroke="#b0b0b0" strokeWidth="1" />
          
          {/* Data Surface with Rainbow Effect */}
          <circle cx="150" cy="150" r="140" fill={`url(#spectral-${filterId})`} opacity="0.4" />
          <circle cx="150" cy="150" r="140" fill={`url(#sheen-${filterId})`} opacity="0.5" style={{ mixBlendMode: 'overlay' }} />
          <circle cx="150" cy="150" r="140" fill={`url(#sheen-${filterId})`} opacity="0.3" transform="rotate(90 150 150)" style={{ mixBlendMode: 'overlay' }} />

          {/* Inner Clear Plastic Ring */}
          <circle cx="150" cy="150" r="45" fill="#f5f5f5" stroke="#d4d4d4" strokeWidth="1" opacity="0.9" />
          
          {/* Center Hub */}
          <circle cx="150" cy="150" r="15" fill="none" stroke="#e0e0e0" strokeWidth="2" />
          
          {/* Text on Disc (Marker Style) */}
          <text
            className="font-hand font-bold tracking-widest uppercase"
            style={{
                fontSize: '16px',
                fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif',
                fill: song.color || '#333',
                textShadow: '1px 1px 0px rgba(0,0,0,0.1)',
                letterSpacing: '2px'
            }}
          >
             <textPath xlinkHref={`#${upperCurveId}`} startOffset="50%" textAnchor="middle">
                {song.title}
             </textPath>
          </text>

          <text
            className="font-hand font-bold tracking-widest"
            style={{
                fontSize: '12px',
                fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif',
                fill: song.color || '#333',
                opacity: 0.8,
                letterSpacing: '1px'
            }}
          >
             <textPath xlinkHref={`#${lowerCurveId}`} startOffset="50%" textAnchor="middle" side="left">
                {song.artist}
             </textPath>
          </text>

          {/* Decorative "Marker" Rings or Doodles */}
          <circle cx="150" cy="150" r="100" fill="none" stroke={song.color} strokeWidth="2" strokeDasharray="10 20" opacity="0.3" transform="rotate(20 150 150)" />

        </g>
        
        <style>{`
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `}</style>
      </svg>
    </div>
  );
};

export default CompactDisc;
