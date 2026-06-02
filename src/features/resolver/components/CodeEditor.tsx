import { useRef, type CSSProperties } from 'react';

const PY_KEYWORDS = new Set([
  'def', 'return', 'if', 'elif', 'else', 'for', 'while', 'in', 'not', 'and', 'or', 'is',
  'True', 'False', 'None', 'class', 'import', 'from', 'as', 'with', 'try', 'except', 'finally',
  'raise', 'lambda', 'pass', 'break', 'continue', 'yield', 'global', 'nonlocal', 'assert', 'del',
]);
const PY_BUILTINS = new Set([
  'print', 'range', 'len', 'int', 'str', 'float', 'list', 'dict', 'set', 'tuple', 'bool',
  'input', 'open', 'enumerate', 'zip', 'map', 'filter', 'sorted', 'reversed', 'sum', 'min', 'max',
  'abs', 'round', 'any', 'all', 'type', 'isinstance',
]);

type TokenType = 'kw' | 'def' | 'builtin' | 'str' | 'num' | 'com' | 'op' | 'fn' | 'id';
interface Token { t: TokenType; v: string }

function tokenizeLine(line: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < line.length) {
    const ch = line[i];
    if (ch === '#') {
      tokens.push({ t: 'com', v: line.slice(i) });
      break;
    }
    if (ch === '"' || ch === "'") {
      const quote = ch;
      let j = i + 1;
      while (j < line.length && line[j] !== quote) {
        if (line[j] === '\\') j++;
        j++;
      }
      tokens.push({ t: 'str', v: line.slice(i, j + 1) });
      i = j + 1;
      continue;
    }
    if (/[0-9]/.test(ch)) {
      let j = i;
      while (j < line.length && /[0-9_.]/.test(line[j])) j++;
      tokens.push({ t: 'num', v: line.slice(i, j) });
      i = j;
      continue;
    }
    if (/[A-Za-z_]/.test(ch)) {
      let j = i;
      while (j < line.length && /[A-Za-z0-9_]/.test(line[j])) j++;
      const w = line.slice(i, j);
      const next = line[j];
      let t: TokenType = 'id';
      if (PY_KEYWORDS.has(w)) t = 'kw';
      else if (PY_BUILTINS.has(w)) t = 'builtin';
      else if (next === '(') t = 'fn';

      // `def NAME` o `class NAME` → name as 'def'
      let k = tokens.length - 1;
      while (k >= 0 && tokens[k].t === 'op' && tokens[k].v.trim() === '') k--;
      if (k >= 0 && tokens[k].t === 'kw' && (tokens[k].v === 'def' || tokens[k].v === 'class')) {
        t = 'def';
      }

      tokens.push({ t, v: w });
      i = j;
      continue;
    }
    let j = i;
    while (j < line.length && !/[A-Za-z0-9_"'#]/.test(line[j])) j++;
    if (j === i) j = i + 1;
    tokens.push({ t: 'op', v: line.slice(i, j) });
    i = j;
  }
  return tokens;
}

function HighlightedCode({ code }: { code: string }) {
  const lines = code.split('\n');
  return (
    <>
      {lines.map((line, idx) => {
        const toks = tokenizeLine(line);
        return (
          <div key={idx} className="flex min-h-[1.5em]">
            <span
              className="flex-shrink-0 w-[54px] pr-3 text-right select-none"
              style={{ color: 'rgba(100,116,139,0.5)' }}
            >
              {idx + 1}
            </span>
            <span className="flex-1 whitespace-pre">
              {toks.length === 0 ? ' ' : toks.map((t, i) => (
                <span key={i} className={`tok-${t.t}`}>{t.v}</span>
              ))}
            </span>
          </div>
        );
      })}
    </>
  );
}

interface CodeEditorProps {
  value: string;
  onChange: (v: string) => void;
  language?: string;
  readOnly?: boolean;
  height?: number | string;
}

export function CodeEditor({
  value,
  onChange,
  language = 'python',
  readOnly,
  height = '100%',
}: CodeEditorProps) {
  const preRef = useRef<HTMLPreElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (preRef.current) {
      preRef.current.scrollTop = e.currentTarget.scrollTop;
      preRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const next = value.slice(0, start) + '    ' + value.slice(end);
      onChange(next);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 4;
      });
    }
  };

  const containerStyle: CSSProperties = {
    height,
    background: '#0a0e1a',
    borderColor: 'rgba(148,163,184,0.12)',
  };

  return (
    <div
      className="relative overflow-hidden rounded-xl border font-mono text-[13px] leading-relaxed"
      style={containerStyle}
    >
      {/* gutter glow */}
      <div
        className="pointer-events-none absolute top-0 bottom-0 left-0 w-[54px] border-r"
        style={{
          background: 'linear-gradient(180deg, rgba(139,92,246,0.08), rgba(34,211,238,0.05))',
          borderRightColor: 'rgba(148,163,184,0.12)',
        }}
      />
      <pre
        ref={preRef}
        aria-hidden
        className="absolute inset-0 m-0 overflow-auto text-text-primary pointer-events-none"
        style={{ padding: '14px 16px 14px 0' }}
      >
        <HighlightedCode code={value} />
      </pre>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        readOnly={readOnly}
        className="absolute inset-0 h-full w-full resize-none border-none bg-transparent outline-none whitespace-pre"
        style={{
          color: 'transparent',
          caretColor: 'var(--color-accent-cyan)',
          padding: '14px 16px 14px 54px',
          fontFamily: 'inherit',
          fontSize: 'inherit',
          lineHeight: 'inherit',
          tabSize: 4,
        }}
      />
      <div
        className="pointer-events-none absolute bottom-2.5 right-3.5 inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-mono text-text-muted tracking-wider"
        style={{
          background: 'rgba(10,14,26,0.7)',
          borderColor: 'rgba(148,163,184,0.12)',
        }}
      >
        {language} · utf-8
      </div>
    </div>
  );
}
