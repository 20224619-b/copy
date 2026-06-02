import { useState, useEffect } from 'react';
import { Particles } from './Particles';

interface BackgroundProps {
  particles?: boolean;
  particleColor?: string;
}

export function Background({ particles = true, particleColor }: BackgroundProps) {
  // NUEVO: Estado para detectar si el usuario requiere ahorrar recursos (Eco Mode)
  const [ecoMode, setEcoMode] = useState(false);

  useEffect(() => {
    // Detecta si el sistema operativo está en modo ahorro de batería o reducir movimiento
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setEcoMode(mediaQuery.matches);

    // Escucha si el usuario cambia la configuración mientras usa la app
    const handler = (e: MediaQueryListEvent) => setEcoMode(e.matches);
    mediaQuery.addEventListener('change', handler);
    
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Las partículas solo se muestran si fueron solicitadas Y no estamos en modo eco
  const showParticles = particles && !ecoMode;

  return (
    <>
      {/* Fondo estático de bajo consumo siempre presente */}
      <div className="cardly-bg" />
      
      {/* Las partículas dinámicas se apagan automáticamente para ahorrar CPU/Batería */}
      {showParticles && <Particles color={particleColor} />}
    </>
  );
}