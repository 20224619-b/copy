import { useMemo, type CSSProperties } from 'react';

interface ParticlesProps {
  count?: number;
  color?: string;
}

export function Particles({ count = 24, color }: ParticlesProps) {
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        left: Math.random() * 100,
        delay: -Math.random() * 12,
        dur: 8 + Math.random() * 10,
        size: 1 + Math.random() * 2.5,
      })),
    [count],
  );
  return (
    <div className="cardly-particles" aria-hidden>
      {seeds.map((s, i) => {
        const style: CSSProperties = {
          left: `${s.left}%`,
          width: `${s.size}px`,
          height: `${s.size}px`,
          animationDelay: `${s.delay}s`,
          animationDuration: `${s.dur}s`,
          ...(color ? { background: color, boxShadow: `0 0 10px ${color}` } : null),
        };
        return <span key={i} style={style} />;
      })}
    </div>
  );
}
