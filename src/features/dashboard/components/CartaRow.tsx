import { CartaJugador, RARITY } from '@/components/cardly/CartaJugador';
import type { UsuarioCartaItem } from '@/types/api';

export function CartaRow({ item }: { item: UsuarioCartaItem }) {
  const R = RARITY[item.carta.rareza];
  const nivel = item.carta.niveles.find((n) => n.nivel === item.nivelActual)
    ?? item.carta.niveles[0];

  return (
    <div
      className="flex items-center gap-3 rounded-[10px] border bg-black/20 px-2.5 py-2 transition-all hover:-translate-y-0.5"
      style={{ borderColor: R.glow }}
    >
      <div className="flex-shrink-0">
        <CartaJugador
          carta={{
            nombre: item.carta.nombre,
            rareza: item.carta.rareza,
            stats: nivel
              ? { dano: nivel.dano, salud: nivel.salud, mana: nivel.mana, danoHabilidad: nivel.danoHabilidad }
              : undefined,
            habilidad: { nombre: item.carta.habilidad },
          }}
          size={48}
          tilt={false}
          holo={false}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div
          className="text-sm font-semibold truncate"
          style={{ color: R.color }}
        >
          {item.carta.nombre}
        </div>
        <div className="text-[11px] text-text-muted flex items-center gap-2">
          <span>{R.label}</span>
          {nivel && (
            <>
              <span>·</span>
              <span>Nv {item.nivelActual}</span>
              <span>·</span>
              <span>⚔ {nivel.dano}</span>
              <span>♥ {nivel.salud}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
