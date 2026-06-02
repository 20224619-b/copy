import type { Dificultad } from '@/types/api';

const DIFFICULTY: Record<Dificultad, { label: string; cls: string }> = {
  FACIL: { label: 'Fácil', cls: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/8' },
  MEDIO: { label: 'Medio', cls: 'text-amber-400 border-amber-500/40 bg-amber-500/8' },
  DIFICIL: { label: 'Difícil', cls: 'text-rose-400 border-rose-500/40 bg-rose-500/8' },
};

export function DifficultyBadge({ dif }: { dif: Dificultad }) {
  const cfg = DIFFICULTY[dif] ?? DIFFICULTY.FACIL;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${cfg.cls}`}
    >
      ● {cfg.label}
    </span>
  );
}

export function LangBadge({ lang }: { lang: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/30 bg-amber-300/5 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-200">
      {lang}
    </span>
  );
}
