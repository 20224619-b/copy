import { useEffect, useState } from 'react';

interface CronometroProps {
  startedAt: number;
  paused?: boolean;
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const r = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}

export function useElapsedSeconds(startedAt: number, paused = false) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [paused]);
  return Math.max(0, Math.floor((now - startedAt) / 1000));
}

export function Cronometro({ startedAt, paused }: CronometroProps) {
  const seconds = useElapsedSeconds(startedAt, paused);
  const color = seconds < 180 ? '#10b981' : seconds < 360 ? '#fbbf24' : '#ef4444';

  return (
    <div
      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border"
      style={{
        background: 'rgba(10,14,26,0.7)',
        borderColor: `${color}40`,
        boxShadow: `0 0 12px -4px ${color}`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{
          background: color,
          color,
          boxShadow: `0 0 8px ${color}`,
          animation: paused ? 'none' : 'pulseDot 1.5s ease infinite',
        }}
      />
      <span
        className="font-mono font-bold tabular-nums text-base tracking-wider"
        style={{ color }}
      >
        {formatTime(seconds)}
      </span>
    </div>
  );
}
