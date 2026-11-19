import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';

const PARTICLES = [
  { left: '8%', top: '22%', size: 2, dur: '7s', delay: '0s', color: '#FF4D4D' },
  { left: '16%', top: '64%', size: 2, dur: '9s', delay: '1.2s', color: '#22D3EE' },
  { left: '27%', top: '18%', size: 3, dur: '8s', delay: '0.6s', color: '#F8FAFC' },
  { left: '38%', top: '72%', size: 2, dur: '10s', delay: '2.1s', color: '#FF3030' },
  { left: '52%', top: '14%', size: 2, dur: '7.5s', delay: '0.4s', color: '#22D3EE' },
  { left: '61%', top: '58%', size: 2, dur: '8.5s', delay: '1.7s', color: '#FF4D4D' },
  { left: '74%', top: '26%', size: 3, dur: '9.5s', delay: '0.9s', color: '#F8FAFC' },
  { left: '83%', top: '68%', size: 2, dur: '7.2s', delay: '2.4s', color: '#FF3030' },
  { left: '91%', top: '34%', size: 2, dur: '8.8s', delay: '1.1s', color: '#22D3EE' },
  { left: '44%', top: '42%', size: 2, dur: '11s', delay: '0.3s', color: '#F8FAFC' },
];

export const CinematicHeroBackdrop: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();
  const [allowParallax, setAllowParallax] = useState(false);
  const { scrollY } = useScroll();
  const yShift = useTransform(scrollY, [0, 600], [0, 36]);

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setAllowParallax(mq.matches && !prefersReducedMotion);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [prefersReducedMotion]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden bg-[#030303]"
    >
      {/* Layer A & B: Deep black foundation with controlled crimson ambient glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(65% 55% at 72% 38%, rgba(255, 48, 48, 0.16), transparent 68%), radial-gradient(50% 45% at 18% 24%, rgba(37, 99, 235, 0.10), transparent 70%)',
        }}
      />

      {/* Layer F: Subtle cyan depth accent near lower-left / horizon */}
      <div
        className="absolute inset-x-0 bottom-0 h-72"
        style={{
          background:
            'radial-gradient(60% 80% at 50% 100%, rgba(255, 48, 48, 0.18), rgba(34, 211, 238, 0.06) 55%, transparent 80%)',
        }}
      />

      {/* Layer C: Futuristic red perspective digital grid in lower portion */}
      <div
        className="absolute inset-x-0 bottom-0 h-64 overflow-hidden"
        style={{
          maskImage:
            'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0.9) 100%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0.9) 100%)',
        }}
      >
        <div className="rds-perspective-grid rds-grid-animate w-[160%] -ml-[30%] h-[360px]" />
      </div>

      {/* Layer D: Restrained red horizon laser line */}
      <div className="absolute inset-x-0 bottom-28 flex justify-center">
        <div
          className="h-px w-full max-w-5xl"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(255,48,48,0.15) 20%, rgba(255,77,77,0.65) 50%, rgba(255,48,48,0.15) 80%, transparent 100%)',
          }}
        />
      </div>

      {/* Layer E & H: Subtle peripheral technical network SVG with low-amplitude desktop parallax */}
      <motion.div
        style={allowParallax ? { y: yShift } : undefined}
        className="absolute inset-0 opacity-[0.16]"
      >
        <svg
          className="w-full h-full"
          viewBox="0 0 1440 800"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Left peripheral arc & circuit trace */}
          <path
            d="M -60 210 A 260 260 0 0 1 180 420"
            stroke="#FF3030"
            strokeWidth="1"
            strokeOpacity="0.55"
          />
          <path
            d="M 48 130 L 140 130 L 175 165 L 250 165"
            stroke="#F8FAFC"
            strokeWidth="1"
            strokeOpacity="0.45"
          />
          <circle cx="254" cy="165" r="3" fill="#22D3EE" fillOpacity="0.7" />
          <circle cx="48" cy="130" r="2.5" fill="#FF4D4D" fillOpacity="0.8" />

          {/* Right peripheral arc & neural nodes */}
          <path
            d="M 1500 180 A 300 300 0 0 0 1240 460"
            stroke="#FF3030"
            strokeWidth="1"
            strokeOpacity="0.55"
          />
          <path
            d="M 1220 110 L 1300 110 L 1340 150 L 1400 150"
            stroke="#F8FAFC"
            strokeWidth="1"
            strokeOpacity="0.4"
          />
          <circle cx="1220" cy="110" r="2.5" fill="#22D3EE" fillOpacity="0.75" />
          <circle cx="1340" cy="150" r="2.5" fill="#FF4D4D" fillOpacity="0.75" />
        </svg>
      </motion.div>

      {/* Layer G: Sparse lightweight particles */}
      {!prefersReducedMotion && (
        <div className="absolute inset-0">
          {PARTICLES.map((p, idx) => (
            <span
              key={idx}
              className="rds-particle absolute rounded-full"
              style={
                {
                  left: p.left,
                  top: p.top,
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  backgroundColor: p.color,
                  '--dur': p.dur,
                  '--delay': p.delay,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};
