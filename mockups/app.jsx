// Cardly — Design Canvas assembly.
// Each artboard is one screen state; resolver artboards have their own
// "show result" internal state so you can click ENVIAR and see the modal.

const { useState } = React;

/* Wraps any screen in a resolver-with-modal so you can click ENVIAR
   to see the modal pop up *within* the artboard. */
function ResolverWithModal({ Variant, resultRareza = 'EPICA', resultVariant = 'correct' }) {
  const [showing, setShowing] = useState(false);
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Variant showResult={() => setShowing(true)} />
      {showing && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 100, animation: 'scaleIn .25s ease-out' }}>
          <ResultModal variant={resultVariant} rareza={resultRareza} />
          <button onClick={() => setShowing(false)} style={{
            position: 'absolute', top: 20, right: 20, zIndex: 200,
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-card)',
            color: 'white', cursor: 'pointer', fontSize: 18, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(8px)',
          }}>✕</button>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <DesignCanvas>

      <DCSection
        id="auth"
        title="Auth"
        subtitle="Entrada a la arena — split-screen con cartas flotantes y parallax al mouse."
      >
        <DCArtboard id="login" label="Login · Hero parallax" width={1440} height={900}>
          <LoginScreen />
        </DCArtboard>
      </DCSection>

      <DCSection
        id="dashboard"
        title="Dashboard"
        subtitle="Home del jugador. Dos direcciones: clásica vs hero-arena. Hover en stat cards para ver lift + glow."
      >
        <DCArtboard id="dash-v1" label="A · Clásica · 3 columnas" width={1440} height={900}>
          <DashboardV1 />
        </DCArtboard>
        <DCArtboard id="dash-v2" label="B · Hero arena · misión protagonista" width={1440} height={900}>
          <DashboardV2 />
        </DCArtboard>
      </DCSection>

      <DCSection
        id="arena"
        title="Arena"
        subtitle="Listado completo de ejercicios — filtros segmented + grid con borde de dificultad."
      >
        <DCArtboard id="listado" label="Listado · Filtros + grid 4col" width={1440} height={900}>
          <ListadoEjercicios />
        </DCArtboard>
      </DCSection>

      <DCSection
        id="resolver"
        title="Resolver"
        subtitle="⭐ La pantalla clave. Editor Python con resaltado real, cronómetro que cambia de color, casos de prueba. Haz click en ENVIAR para disparar el modal de resultado."
      >
        <DCArtboard id="resolver-v1" label="A · VS Code split (con modal)" width={1440} height={900}>
          <ResolverWithModal Variant={ResolverV1} resultRareza="EPICA" />
        </DCArtboard>
        <DCArtboard id="resolver-v2" label="B · Focused 3-col (con modal)" width={1440} height={900}>
          <ResolverWithModal Variant={ResolverV2} resultRareza="LEGENDARIA" />
        </DCArtboard>
      </DCSection>

      <DCSection
        id="reveal"
        title="Card Reveal"
        subtitle="El momento de dopamina. Pokemon TCG con tilt 3D al pasar el mouse + shimmer holográfico. Las legendarias además tienen pulse continuo."
      >
        <DCArtboard id="reveal-comun" label="Recompensa · Común" width={1100} height={820}>
          <ResultModal variant="correct" rareza="COMUN" />
        </DCArtboard>
        <DCArtboard id="reveal-epica" label="Recompensa · Épica" width={1100} height={820}>
          <ResultModal variant="correct" rareza="EPICA" />
        </DCArtboard>
        <DCArtboard id="reveal-legendaria" label="Recompensa · Legendaria · ✦" width={1100} height={820}>
          <ResultModal variant="correct" rareza="LEGENDARIA" />
        </DCArtboard>
        <DCArtboard id="reveal-flipping" label="Mid-flip · momento dramático" width={1100} height={820}>
          <ResultModal variant="correct" rareza="LEGENDARIA" stage="flipping" />
        </DCArtboard>
        <DCArtboard id="reveal-fail" label="Casi… · ejercicio incorrecto" width={1100} height={820}>
          <ResultModal variant="incorrect" />
        </DCArtboard>
      </DCSection>

      <DCSection
        id="atomic"
        title="Componentes atómicos"
        subtitle="Las cartas como objeto — pasa el mouse para ver el tilt holográfico de cada rareza."
      >
        <DCArtboard id="card-comun" label="Carta · Común" width={360} height={500}>
          <CardSandbox rareza="COMUN" />
        </DCArtboard>
        <DCArtboard id="card-rara" label="Carta · Rara" width={360} height={500}>
          <CardSandbox rareza="RARA" />
        </DCArtboard>
        <DCArtboard id="card-epica" label="Carta · Épica" width={360} height={500}>
          <CardSandbox rareza="EPICA" />
        </DCArtboard>
        <DCArtboard id="card-legendaria" label="Carta · Legendaria" width={360} height={500}>
          <CardSandbox rareza="LEGENDARIA" />
        </DCArtboard>
      </DCSection>

    </DesignCanvas>
  );
}

function CardSandbox({ rareza }) {
  const carta = REWARD_CARDS[rareza] || {
    nombre: 'Vidente del If', rareza, theme: 'cond',
    stats: { dano: 4, salud: 6, mana: 2, danoHabilidad: 5 },
    habilidad: { nombre: 'Ramificación' }, descripcion: 'Bifurca el flujo del hechizo.',
  };
  return (
    <div className="cardly" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Background particles={false} />
      <div style={{ position: 'relative', zIndex: 2 }}>
        <CartaJugador carta={{ ...carta, rareza }} size={260} />
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
