import { useState } from 'react';
import { NavLink, useNavigate, type To } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth';
import { Logo } from './Logo';
import { Background } from './Background';
import {
  IconBolt,
  IconBook,
  IconCards,
  IconCoin,
  IconCrown,
  IconFlame,
  IconHome,
  IconLogout,
  IconMenu,
  IconSwords,
  IconX,
} from './Icon2';

interface NavItem {
  to: To;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: <IconHome size={18} /> },
  { to: '/ejercicios', label: 'Ejercicios', icon: <IconSwords size={18} /> },
  { to: '/modulos', label: 'Módulos', icon: <IconBook size={18} /> },
  { to: '/inventario', label: 'Inventario', icon: <IconCards size={18} /> },
  { to: '/ranking', label: 'Ranking', icon: <IconCrown size={18} /> },
];

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden">
      <Background />

      {/* Sidebar — desktop fijo / móvil drawer */}
      <SidebarContent
        onNavigate={() => setMobileOpen(false)}
        className="hidden lg:flex"
      />
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <SidebarContent
            onNavigate={() => setMobileOpen(false)}
            className="fixed inset-y-0 left-0 z-50 flex lg:hidden"
          />
        </>
      )}

      {/* Main column */}
      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-5 sm:p-7">{children}</main>
      </div>
    </div>
  );
}

function SidebarContent({
  onNavigate,
  className,
}: {
  onNavigate: () => void;
  className?: string;
}) {
  return (
    <aside
      className={`${className ?? ''} w-56 flex-col gap-1 border-r p-4 z-10`}
      style={{
        background: 'linear-gradient(180deg, rgba(17,23,38,0.95), rgba(10,14,26,0.95))',
        borderRightColor: 'rgba(139,92,246,0.18)',
      }}
    >
      <div className="flex items-center justify-between">
        <Logo />
        <button
          type="button"
          onClick={onNavigate}
          className="lg:hidden text-text-muted hover:text-text-primary p-1 rounded"
          aria-label="Cerrar menú"
        >
          <IconX size={18} />
        </button>
      </div>

      <div className="h-4" />

      {NAV_ITEMS.map((item) => (
        <NavLink
          key={String(item.to)}
          to={item.to}
          onClick={onNavigate}
          className={({ isActive }) =>
            [
              'relative flex items-center gap-3 rounded-[10px] px-3.5 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'text-text-primary'
                : 'text-text-secondary hover:text-text-primary hover:bg-white/5',
            ].join(' ')
          }
          style={({ isActive }) =>
            isActive
              ? {
                  background:
                    'linear-gradient(90deg, rgba(139,92,246,0.18), rgba(34,211,238,0.06))',
                  border: '1px solid rgba(139,92,246,0.35)',
                }
              : { border: '1px solid transparent' }
          }
        >
          {({ isActive }) => (
            <>
              <span className={isActive ? 'text-accent-cyan' : 'text-text-muted'}>
                {item.icon}
              </span>
              {item.label}
              {isActive && (
                <span
                  className="absolute left-0 top-2 bottom-2 w-[3px] rounded"
                  style={{
                    background:
                      'linear-gradient(180deg, var(--color-accent-primary), var(--color-accent-cyan))',
                    boxShadow: '0 0 12px var(--color-accent-primary)',
                  }}
                />
              )}
            </>
          )}
        </NavLink>
      ))}

      <div className="flex-1" />

      <LogoutButton />
    </aside>
  );
}

function LogoutButton() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  return (
    <button
      type="button"
      onClick={() => {
        logout();
        navigate('/login', { replace: true });
      }}
      className="flex items-center gap-3 rounded-[10px] px-3.5 py-2.5 text-sm font-medium text-text-secondary hover:text-accent-danger hover:bg-white/5 transition-colors"
    >
      <IconLogout size={18} />
      Salir
    </button>
  );
}

function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const user = useAuthStore((s) => s.user);
  if (!user) return null;

  return (
    <header
      className="flex items-center gap-3 px-4 sm:px-7 py-3 border-b backdrop-blur-md"
      style={{
        borderBottomColor: 'rgba(148,163,184,0.12)',
        background: 'rgba(10,14,26,0.6)',
      }}
    >
      <button
        type="button"
        onClick={onMenuClick}
        className="lg:hidden text-text-secondary hover:text-text-primary p-1.5 rounded-md"
        aria-label="Abrir menú"
      >
        <IconMenu size={20} />
      </button>

      <div className="flex-1" />

      <ResourcePill icon={<IconBolt size={14} />} value={user.puntos} label="PTS" color="#a78bfa" />
      <ResourcePill icon={<IconCoin size={14} />} value={user.monedas} label="MON" color="#fbbf24" />
      <ResourcePill
        icon={<IconFlame size={14} />}
        value={user.rachaEjercicios}
        label="DÍAS"
        color="#f97316"
      />

      <div
        className="hidden sm:flex w-9 h-9 rounded-full items-center justify-center text-white font-bold text-sm border-2"
        style={{
          background: 'linear-gradient(135deg, #8b5cf6, #22d3ee)',
          borderColor: 'rgba(139,92,246,0.5)',
          boxShadow: '0 0 16px -4px var(--color-accent-primary)',
        }}
        title={user.username}
      >
        {user.username.slice(0, 2).toUpperCase()}
      </div>
    </header>
  );
}

function ResourcePill({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  color: string;
}) {
  return (
    <div
      className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border"
      style={{
        background: 'rgba(26,34,56,0.6)',
        borderColor: 'rgba(148,163,184,0.12)',
        boxShadow: `inset 0 0 0 1px ${color}10`,
      }}
    >
      {icon}
      <span className="text-sm text-text-primary font-display font-extrabold tabular-nums">
        {value.toLocaleString()}
      </span>
      <span className="text-[10px] text-text-muted font-semibold tracking-wider">{label}</span>
    </div>
  );
}
