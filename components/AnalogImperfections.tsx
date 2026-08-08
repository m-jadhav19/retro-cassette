import React, { useEffect, useRef, useState } from 'react';

const AnalogImperfections: React.FC<{ active?: boolean }> = ({ active = true }) => {
  const [glitch, setGlitch] = useState(false);
  const [wobble, setWobble] = useState(false);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    if (!active) return;

    const addTimer = (id: number) => {
      timersRef.current.push(id);
      return id;
    };

    const scheduleGlitch = () => {
      const delay = 12000 + Math.random() * 18000;
      addTimer(window.setTimeout(() => {
        setGlitch(true);
        addTimer(window.setTimeout(() => {
          setGlitch(false);
          scheduleGlitch();
        }, 180 + Math.random() * 220));
      }, delay));
    };

    const scheduleWobble = () => {
      const delay = 8000 + Math.random() * 12000;
      addTimer(window.setTimeout(() => {
        setWobble(true);
        addTimer(window.setTimeout(() => {
          setWobble(false);
          scheduleWobble();
        }, 600 + Math.random() * 400));
      }, delay));
    };

    scheduleGlitch();
    scheduleWobble();

    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, [active]);

  if (!active) return null;

  return (
    <>
      <div
        className={`pointer-events-none fixed inset-0 z-[6] transition-opacity duration-100 ${glitch ? 'opacity-100 analog-glitch' : 'opacity-0'}`}
        aria-hidden
      />
      <div
        className={`pointer-events-none fixed inset-0 z-[6] transition-opacity duration-300 ${wobble ? 'opacity-30 analog-wobble' : 'opacity-0'}`}
        aria-hidden
      />
    </>
  );
};

export default AnalogImperfections;
