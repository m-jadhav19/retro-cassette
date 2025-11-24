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

  return (
    <div
      className={`relative inline-block ${className} ${isDraggable ? 'cursor-grab active:cursor-grabbing' : ''}`}
      style={style}
    >
      <svg viewBox="0 0 300 300" className="w-full h-full overflow-visible filter drop-shadow-lg pointer-events-none">
        <defs>
            {/* Vinyl Grooves Texture */}
            <radialGradient id={`grooves-gradient-${filterId}`} cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="40%" stopColor="#111" />
                <stop offset="42%" stopColor="#222" />
                <stop offset="44%" stopColor="#111" />
                <stop offset="46%" stopColor="#222" />
                <stop offset="48%" stopColor="#111" />
                <stop offset="50%" stopColor="#222" />
                <stop offset="52%" stopColor="#111" />
                <stop offset="54%" stopColor="#222" />
                <stop offset="56%" stopColor="#111" />
                <stop offset="58%" stopColor="#222" />
                <stop offset="60%" stopColor="#111" />
                <stop offset="62%" stopColor="#222" />
                <stop offset="64%" stopColor="#111" />
                <stop offset="66%" stopColor="#222" />
                <stop offset="68%" stopColor="#111" />
                <stop offset="70%" stopColor="#222" />
                <stop offset="72%" stopColor="#111" />
                <stop offset="74%" stopColor="#222" />
                <stop offset="76%" stopColor="#111" />
                <stop offset="78%" stopColor="#222" />
                <stop offset="80%" stopColor="#111" />
                <stop offset="82%" stopColor="#222" />
                <stop offset="84%" stopColor="#111" />
                <stop offset="86%" stopColor="#222" />
                <stop offset="88%" stopColor="#111" />
                <stop offset="90%" stopColor="#222" />
                <stop offset="92%" stopColor="#111" />
                <stop offset="95%" stopColor="#000" />
            </radialGradient>
            
            {/* Light Reflection on Grooves */}
            <linearGradient id={`reflection-gradient-${filterId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="white" stopOpacity="0" />
                <stop offset="40%" stopColor="white" stopOpacity="0" />
                <stop offset="50%" stopColor="white" stopOpacity="0.1" />
                <stop offset="60%" stopColor="white" stopOpacity="0" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
        </defs>

        <g className={isSpinning ? "animate-spin-slow" : ""} style={{ transformOrigin: '150px 150px', animation: isSpinning ? 'spin 4s linear infinite' : 'none' }}>
             {/* Main Record Body */}
            <circle cx="150" cy="150" r="148" fill="#050505" stroke="#000" strokeWidth="1" />
            <circle cx="150" cy="150" r="145" fill={`url(#grooves-gradient-${filterId})`} />
            
            {/* Reflections */}
            <circle cx="150" cy="150" r="145" fill={`url(#reflection-gradient-${filterId})`} pointerEvents="none" />
            <circle cx="150" cy="150" r="145" fill={`url(#reflection-gradient-${filterId})`} transform="rotate(90 150 150)" pointerEvents="none" />

            {/* Label */}
            <circle cx="150" cy="150" r="50" fill={song.accentColor} stroke="#000" strokeWidth="0.5" />
            
            {/* Label Details */}
             <foreignObject x="100" y="100" width="100" height="100">
                <div className="w-full h-full flex flex-col items-center justify-center text-center p-1" style={{ color: song.color }}>
                    <div 
                        className="font-bold uppercase tracking-widest leading-none mb-1" 
                        style={{ fontSize: '8px', fontFamily: 'sans-serif' }}
                    >
                        STEREO
                    </div>
                    <div 
                        className="font-hand leading-tight line-clamp-2"
                        style={{ 
                            fontSize: song.title.length > 15 ? '10px' : '12px', 
                            fontWeight: 'bold',
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                         }}
                    >
                        {song.title}
                    </div>
                     <div 
                        className="font-sans uppercase opacity-80 mt-1 truncate w-full"
                        style={{ fontSize: '6px' }}
                    >
                        {song.artist}
                    </div>
                </div>
            </foreignObject>

             {/* Center Hole */}
            <circle cx="150" cy="150" r="4" fill="#e5e5e5" stroke="#000" strokeWidth="0.5" />
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

export default Vinyl;

