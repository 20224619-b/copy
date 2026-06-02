// Code block sin ejecutar — solo highlight (cuando lang no es Python o el
// autor del contenido marcó {runnable=false}).

interface Props {
  code: string;
  language?: string;
}

export function CodeBlockStatic({ code, language = 'text' }: Props) {
  return (
    <div
      className="rounded-xl border overflow-hidden font-mono text-[13px] leading-relaxed"
      style={{
        background: '#0a0e1a',
        borderColor: 'rgba(148,163,184,0.12)',
      }}
    >
      <div
        className="flex items-center justify-between px-3 py-1.5 border-b"
        style={{
          background: 'rgba(17,23,38,0.6)',
          borderBottomColor: 'rgba(148,163,184,0.08)',
        }}
      >
        <span className="text-[10px] uppercase tracking-wider text-text-muted font-semibold">
          {language || 'text'}
        </span>
      </div>
      <pre className="m-0 p-4 overflow-auto text-text-primary whitespace-pre">
        {code}
      </pre>
    </div>
  );
}
