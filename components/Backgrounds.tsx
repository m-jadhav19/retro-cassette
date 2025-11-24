import React from 'react';

export const WalkmanBackground: React.FC = () => (
  <div className="absolute inset-0 w-full h-full bg-slate-900 overflow-hidden select-none">
    {/* Neon Ambient Base */}
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#1e1b4b_0%,_#000000_100%)]"></div>
    
    {/* Neon Glows */}
    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[100px] rounded-full pointer-events-none mix-blend-screen"></div>
    <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600/20 blur-[100px] rounded-full pointer-events-none mix-blend-screen"></div>
    <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] bg-pink-600/10 blur-[80px] rounded-full pointer-events-none mix-blend-screen"></div>

    {/* Grid Overlay */}
    <div 
      className="absolute inset-0 opacity-10 pointer-events-none"
      style={{
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
        transform: 'perspective(500px) rotateX(60deg) translateY(-100px) scale(2)',
        maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 40%)'
      }}
    ></div>

    {/* --- KID'S DESK ITEMS --- */}
    <div className="absolute inset-0 pointer-events-none z-1">

      {/* PS2 Console (Top Left) */}
      <div className="absolute top-[10%] left-[10%] w-64 h-40 bg-black shadow-2xl transform rotate-6 z-10 border-t border-l border-gray-800 rounded-sm">
         {/* Vents */}
         <div className="absolute top-0 left-0 w-full h-full bg-[repeating-linear-gradient(90deg,transparent,transparent_4px,#111_4px,#111_6px)] opacity-50"></div>
         {/* Logo Area */}
         <div className="absolute top-4 right-8 w-12 h-4 bg-gradient-to-b from-blue-900 to-black transform skew-x-12 flex items-center justify-center">
             <div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_5px_#3b82f6]"></div>
         </div>
         {/* Disc Tray Line */}
         <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-800"></div>
         <div className="absolute bottom-4 right-4 text-gray-600 font-sans text-xs font-bold italic tracking-widest opacity-50">PS2</div>
      </div>
      {/* Controller Cable Hint */}
      <svg className="absolute top-[25%] left-[20%] w-40 h-40 pointer-events-none overflow-visible" style={{ zIndex: 9 }}>
         <path d="M 0,0 Q 20,50 60,40 T 120,80" fill="none" stroke="#111" strokeWidth="4" />
      </svg>

      {/* Scattered Game Discs */}
      <div className="absolute top-[25%] right-[20%] w-28 h-28 transform -rotate-12 opacity-90 z-5">
         <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-300 to-gray-100 shadow-lg flex items-center justify-center border border-gray-400">
            {/* Game Art Hint */}
            <div className="absolute inset-0 rounded-full bg-orange-500/20 mix-blend-multiply"></div>
            <div className="w-8 h-8 rounded-full bg-transparent border border-gray-300 z-10"></div>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[6px] font-bold text-black mt-12 bg-white/80 px-1">GTA: VICE CITY</span>
            </div>
         </div>
         <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-60 pointer-events-none"></div>
      </div>

      <div className="absolute top-[28%] right-[15%] w-28 h-28 transform rotate-45 opacity-90 z-4">
         <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-300 to-gray-100 shadow-lg flex items-center justify-center border border-gray-400">
            <div className="absolute inset-0 rounded-full bg-green-500/20 mix-blend-multiply"></div>
            <div className="w-8 h-8 rounded-full bg-transparent border border-gray-300 z-10"></div>
             <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[6px] font-bold text-black mt-12 bg-white/80 px-1">FIFA 2003</span>
            </div>
         </div>
      </div>

      {/* Coke Can */}
      <div className="absolute top-[-20px] right-[25%] w-24 h-24 drop-shadow-2xl transform rotate-12 z-10">
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
          <defs>
            <radialGradient id="cokeTop" cx="50%" cy="50%" r="50%">
              <stop offset="80%" stopColor="#e5e5e5" />
              <stop offset="100%" stopColor="#a3a3a3" />
            </radialGradient>
            <filter id="canShadow">
              <feDropShadow dx="5" dy="5" stdDeviation="4" floodColor="#000" floodOpacity="0.4" />
            </filter>
          </defs>
          <circle cx="50" cy="50" r="46" fill="url(#cokeTop)" stroke="#a3a3a3" strokeWidth="1" filter="url(#canShadow)" />
          <path d="M 50,8 A 42,42 0 0 1 92,50" fill="none" stroke="#fff" strokeWidth="2" opacity="0.6" />
          <rect x="38" y="30" width="24" height="40" rx="8" fill="#ef4444" stroke="#b91c1c" strokeWidth="1" /> {/* Tab is red on coke sometimes? keeping silver mostly */}
          <rect x="38" y="30" width="24" height="40" rx="8" fill="#a3a3a3" />
          <circle cx="50" cy="60" r="4" fill="#333" />
          {/* Red Branding Peek */}
          <circle cx="50" cy="50" r="48" stroke="#ef4444" strokeWidth="3" fill="none" opacity="0.9" style={{ transform: 'scale(1.02)', transformOrigin: 'center' }} />
        </svg>
      </div>

      {/* Soccer Ball (Bottom Left) */}
      <div className="absolute bottom-[-40px] left-[-40px] w-64 h-64 z-20 drop-shadow-2xl">
         <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="48" fill="#fff" stroke="#ddd" strokeWidth="1" />
            <defs>
                <radialGradient id="ballShade" cx="30%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#fff" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#000" stopOpacity="0.3" />
                </radialGradient>
            </defs>
            {/* Pentagons */}
            <path d="M 50,50 L 35,60 L 25,45 L 40,30 L 60,35 Z" fill="#111" transform="rotate(10 50 50)" />
            <path d="M 80,50 L 70,70 L 90,80 Z" fill="#111" />
            <path d="M 10,50 L 0,70 L 20,80 Z" fill="#111" />
            <path d="M 50,10 L 30,0 L 70,0 Z" fill="#111" />
            
            {/* Shadow Overlay */}
            <circle cx="50" cy="50" r="48" fill="url(#ballShade)" />
         </svg>
      </div>

      {/* Pokemon Cards (Bottom Right) */}
      <div className="absolute bottom-[15%] right-[15%] w-24 h-32 bg-[#fcd34d] rounded-md shadow-md transform -rotate-12 border-[3px] border-[#fbbf24] z-10 flex flex-col items-center p-1 overflow-hidden">
          <div className="w-full h-16 bg-red-500 rounded-sm mb-1 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-red-600 to-red-400"></div>
              <div className="absolute bottom-0 right-0 w-10 h-10 bg-orange-500 rounded-full blur-md opacity-50"></div>
          </div>
          <div className="w-full flex-1 bg-[#fef3c7] rounded-sm p-1">
              <div className="w-full h-1 bg-gray-300 mb-1"></div>
              <div className="w-2/3 h-1 bg-gray-300 mb-1"></div>
          </div>
      </div>
      
      <div className="absolute bottom-[12%] right-[10%] w-24 h-32 bg-[#60a5fa] rounded-md shadow-md transform rotate-6 border-[3px] border-[#3b82f6] z-9 flex flex-col items-center p-1 overflow-hidden">
          <div className="w-full h-16 bg-blue-600 rounded-sm mb-1 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-700 to-blue-400"></div>
          </div>
          <div className="w-full flex-1 bg-[#eff6ff] rounded-sm p-1">
               <div className="w-full h-1 bg-gray-300 mb-1"></div>
              <div className="w-2/3 h-1 bg-gray-300 mb-1"></div>
          </div>
      </div>

    </div>
  </div>
);

export const TurntableBackground: React.FC = () => (
  <div className="absolute inset-0 w-full h-full overflow-hidden select-none bg-[#2c1810]">
    
    {/* Luxurious Wood Texture Base */}
    <div 
        className="absolute inset-0 opacity-60"
        style={{
            backgroundImage: `
                repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(0,0,0,0.2) 50px, rgba(0,0,0,0.2) 51px),
                url("https://www.transparenttextures.com/patterns/wood-pattern.png")
            `,
            backgroundSize: '100% 100%, 200px 200px'
        }}
    ></div>

    {/* Velvet Table Runner */}
    <div className="absolute top-0 left-[10%] w-[30%] h-full bg-[#4a0404] shadow-2xl opacity-90">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-30 mix-blend-overlay"></div>
        {/* Gold Trim */}
        <div className="absolute left-2 top-0 bottom-0 w-1 bg-yellow-600/40"></div>
        <div className="absolute right-2 top-0 bottom-0 w-1 bg-yellow-600/40"></div>
    </div>
    
    {/* Vignette & Lighting */}
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(0,0,0,0)_20%,_rgba(0,0,0,0.8)_100%)] pointer-events-none"></div>
    <div className="absolute inset-0 bg-orange-500/5 mix-blend-overlay pointer-events-none"></div>

    {/* --- ANTIQUE DECORATIONS --- */}
    <div className="absolute inset-0 pointer-events-none z-1">
        
        {/* Old Letter / Parchment */}
        <div className="absolute top-[10%] right-[15%] w-64 h-80 bg-[#f3e5ab] shadow-md transform -rotate-6 p-6 font-serif text-[#3e2723] opacity-90 mask-image-torn">
            <div className="w-full h-full border border-[#d7ccc8] p-4 text-sm italic leading-relaxed overflow-hidden">
                <p>My Dearest,</p>
                <p className="mt-2">The music last night was simply divine. I find myself lost in the melodies we shared...</p>
                <p className="mt-4">Yours,</p>
                <p>E.</p>
            </div>
             <div className="absolute bottom-10 right-10 w-12 h-12 bg-red-900 rounded-full opacity-80 shadow-inner flex items-center justify-center text-xs text-red-200 font-bold border-2 border-red-950 transform rotate-12">
                W
             </div>
        </div>

        {/* Quill */}
        <div className="absolute top-[35%] right-[12%] w-48 h-4 bg-white transform -rotate-45 flex items-center drop-shadow-md">
             <svg viewBox="0 0 100 20" className="w-full h-full overflow-visible">
                 <path d="M 0,10 Q 50,0 100,10 Q 50,20 0,10" fill="#f5f5f5" />
                 <path d="M 80,10 L 100,10" stroke="#333" strokeWidth="1" /> {/* Tip */}
             </svg>
        </div>

        {/* Pocket Watch */}
        <div className="absolute bottom-[10%] left-[5%] w-24 h-24 drop-shadow-2xl transform rotate-12">
            <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="50" cy="50" r="45" fill="#d4af37" stroke="#b8860b" strokeWidth="2" />
                <circle cx="50" cy="50" r="38" fill="#fff" stroke="#d4af37" strokeWidth="1" />
                <text x="50" y="20" textAnchor="middle" fontSize="12" fontFamily="serif" fill="#000">XII</text>
                <text x="80" y="55" textAnchor="middle" fontSize="12" fontFamily="serif" fill="#000">III</text>
                <text x="50" y="90" textAnchor="middle" fontSize="12" fontFamily="serif" fill="#000">VI</text>
                <text x="20" y="55" textAnchor="middle" fontSize="12" fontFamily="serif" fill="#000">IX</text>
                <line x1="50" y1="50" x2="50" y2="25" stroke="#000" strokeWidth="2" />
                <line x1="50" y1="50" x2="70" y2="50" stroke="#000" strokeWidth="1.5" />
                <circle cx="50" cy="5" r="5" fill="none" stroke="#d4af37" strokeWidth="2" /> {/* Loop */}
            </svg>
            {/* Chain */}
            <svg className="absolute -top-20 -left-10 w-40 h-40 pointer-events-none" viewBox="0 0 100 100">
                 <path d="M 80,80 Q 50,100 20,20" fill="none" stroke="#d4af37" strokeWidth="2" strokeDasharray="2 1" />
            </svg>
        </div>

        {/* Candle */}
        <div className="absolute top-[5%] left-[5%] w-16 h-32 z-20">
            <div className="absolute bottom-0 left-4 w-8 h-24 bg-[#fff8e1] rounded-sm shadow-inner"></div>
            <div className="absolute bottom-24 left-7 w-2 h-4 bg-black opacity-50"></div> {/* Wick */}
            {/* Flame Animation */}
            <div className="absolute bottom-26 left-6 w-4 h-12 bg-orange-400 rounded-full blur-sm animate-pulse opacity-80 origin-bottom transform scale-y-110"></div>
            <div className="absolute bottom-26 left-7 w-2 h-8 bg-yellow-200 rounded-full blur-md animate-bounce opacity-90"></div>
            {/* Glow */}
            <div className="absolute bottom-20 left-0 w-16 h-16 bg-orange-500/20 rounded-full blur-xl animate-pulse"></div>
        </div>

        {/* Dust Particles */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 animate-pulse"></div>

    </div>
  </div>
);
