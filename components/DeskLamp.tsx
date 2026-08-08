import React, { useEffect, useState } from 'react';

const DeskLamp: React.FC = () => {
  const [pos, setPos] = useState({ x: 50, y: 45 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setPos({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[5] transition-opacity duration-300"
      style={{
        background: `radial-gradient(ellipse 55% 45% at ${pos.x}% ${pos.y}%, rgba(255, 235, 190, 0.11) 0%, rgba(255, 220, 160, 0.04) 35%, transparent 70%)`,
      }}
    />
  );
};

export default DeskLamp;
