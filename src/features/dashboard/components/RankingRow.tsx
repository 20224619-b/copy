import { IconFlame } from '@/components/cardly/Icon2';
import type { RankingItem } from '@/types/api';

interface Props {
  item: RankingItem;
  isMe?: boolean;
}

export function RankingRow({ item, isMe }: Props) {
  const medal = item.posicion === 1 ? '🥇' : item.posicion === 2 ? '🥈' : item.posicion === 3 ? '🥉' : null;
  return (
    <div
      className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 border"
      style={{
        background: isMe ? 'linear-gradient(90deg, rgba(139,92,246,0.18), transparent)' : 'transparent',
        borderColor: isMe ? 'rgba(139,92,246,0.4)' : 'transparent',
      }}
    >
      <div
        className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold font-display flex-shrink-0"
        style={{
          background: 'rgba(0,0,0,0.3)',
          color: item.posicion <= 3 ? 'var(--color-accent-gold)' : 'var(--color-text-muted)',
        }}
      >
        {medal ?? item.posicion}
      </div>
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
        style={{
          background: `linear-gradient(135deg, hsl(${item.username.length * 37}, 70%, 60%), hsl(${
            item.username.length * 37 + 60
          }, 70%, 50%))`,
        }}
      >
        {item.username.slice(0, 2).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div
          className="text-[13px] font-semibold truncate"
          style={{ color: isMe ? 'var(--color-accent-cyan)' : 'var(--color-text-primary)' }}
        >
          {item.username}
          {isMe && <span className="text-text-muted font-normal ml-1.5 text-[11px]">tú</span>}
        </div>
        <div className="flex gap-2 text-[11px] text-text-muted items-center">
          <span className="inline-flex items-center gap-0.5">
            <IconFlame size={10} /> {item.rachaEjercicios}
          </span>
          <span>· {item.puntos.toLocaleString()} pts</span>
        </div>
      </div>
    </div>
  );
}
