// Python syntax highlighter + editable code area.
// Lightweight: textarea on top (transparent), highlighted <pre> behind.

const PY_KEYWORDS = new Set([
  'def','return','if','elif','else','for','while','in','not','and','or','is',
  'True','False','None','class','import','from','as','with','try','except','finally',
  'raise','lambda','pass','break','continue','yield','global','nonlocal','assert','del'
]);
const PY_BUILTINS = new Set([
  'print','range','len','int','str','float','list','dict','set','tuple','bool',
  'input','open','enumerate','zip','map','filter','sorted','reversed','sum','min','max','abs','round','any','all','type','isinstance'
]);

function highlightPython(code) {
  // Tokenize line by line so comments and strings work right.
  const out = [];
  const lines = code.split('\n');
  lines.forEach((line, li) => {
    let i = 0;
    const tokens = [];
    while (i < line.length) {
      const ch = line[i];
      // Comment
      if (ch === '#') {
        tokens.push({ t: 'com', v: line.slice(i) });
        break;
      }
      // String
      if (ch === '"' || ch === "'") {
        const quote = ch;
        let j = i + 1;
        while (j < line.length && line[j] !== quote) {
          if (line[j] === '\\') j++;
          j++;
        }
        tokens.push({ t: 'str', v: line.slice(i, j + 1) });
        i = j + 1; continue;
      }
      // Number
      if (/[0-9]/.test(ch)) {
        let j = i;
        while (j < line.length && /[0-9_.]/.test(line[j])) j++;
        tokens.push({ t: 'num', v: line.slice(i, j) });
        i = j; continue;
      }
      // Identifier / keyword
      if (/[A-Za-z_]/.test(ch)) {
        let j = i;
        while (j < line.length && /[A-Za-z0-9_]/.test(line[j])) j++;
        const w = line.slice(i, j);
        const next = line[j];
        let t = 'id';
        if (PY_KEYWORDS.has(w)) t = 'kw';
        else if (PY_BUILTINS.has(w)) t = 'builtin';
        else if (next === '(') t = 'fn';
        // 'def NAME' / 'class NAME' — color the next identifier as def
        if (tokens.length) {
          const last = tokens[tokens.length - 1];
          // walk back through spaces
          let k = tokens.length - 1;
          while (k >= 0 && tokens[k].t === 'op' && tokens[k].v.trim() === '') k--;
          if (k >= 0 && tokens[k].t === 'kw' && (tokens[k].v === 'def' || tokens[k].v === 'class')) {
            t = 'def';
          }
        }
        tokens.push({ t, v: w });
        i = j; continue;
      }
      // Operator or punctuation or whitespace
      let j = i;
      while (j < line.length && !/[A-Za-z0-9_"'#]/.test(line[j])) j++;
      if (j === i) j = i + 1;
      tokens.push({ t: 'op', v: line.slice(i, j) });
      i = j;
    }
    out.push(tokens);
    if (li < lines.length - 1) out.push([{ t: 'op', v: '\n' }]);
  });
  return out;
}

function HighlightedCode({ code }) {
  const lines = code.split('\n');
  const rendered = lines.map((line, idx) => {
    const toks = highlightPython(line)[0] || [];
    return (
      <div key={idx} style={{ display: 'flex', minHeight: '1.5em' }}>
        <span style={{
          flex: '0 0 auto', width: 40, paddingRight: 14, textAlign: 'right',
          color: 'rgba(100,116,139,0.5)', userSelect: 'none',
        }}>{idx + 1}</span>
        <span style={{ flex: 1, whiteSpace: 'pre' }}>
          {toks.length === 0 ? ' ' : toks.map((t, i) =>
            <span key={i} className={`tok-${t.t}`}>{t.v}</span>
          )}
        </span>
      </div>
    );
  });
  return <>{rendered}</>;
}

function CodeEditor({ initial, height = 360, language = 'python', readOnly, label }) {
  const [code, setCode] = React.useState(initial);
  const taRef = React.useRef(null);
  const preRef = React.useRef(null);

  const onScroll = (e) => {
    if (preRef.current) {
      preRef.current.scrollTop = e.target.scrollTop;
      preRef.current.scrollLeft = e.target.scrollLeft;
    }
  };

  return (
    <div style={{
      position: 'relative',
      borderRadius: 12, overflow: 'hidden',
      background: '#0a0e1a',
      border: '1px solid var(--border-card)',
      height,
      fontFamily: 'var(--font-mono)',
      fontSize: 13, lineHeight: 1.5,
    }}>
      {/* gutter glow */}
      <div style={{
        position: 'absolute', top: 0, bottom: 0, left: 0, width: 54,
        background: 'linear-gradient(180deg, rgba(139,92,246,0.08), rgba(34,211,238,0.05))',
        borderRight: '1px solid var(--border-card)', pointerEvents: 'none',
      }}/>
      {/* highlighted layer */}
      <pre ref={preRef} aria-hidden style={{
        position: 'absolute', inset: 0, margin: 0,
        padding: '14px 16px 14px 0',
        overflow: 'auto',
        color: 'var(--text-primary)',
        pointerEvents: 'none',
      }}>
        <HighlightedCode code={code}/>
      </pre>
      {/* textarea on top */}
      <textarea
        ref={taRef}
        value={code}
        onChange={e => setCode(e.target.value)}
        onScroll={onScroll}
        spellCheck={false}
        readOnly={readOnly}
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          background: 'transparent',
          color: 'transparent',
          caretColor: 'var(--accent-cyan)',
          padding: '14px 16px 14px 54px',
          fontFamily: 'inherit', fontSize: 'inherit', lineHeight: 'inherit',
          border: 'none', outline: 'none', resize: 'none',
          whiteSpace: 'pre',
          tabSize: 4,
        }}
      />
      {/* language badge bottom right */}
      <div style={{
        position: 'absolute', bottom: 10, right: 14,
        fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)',
        background: 'rgba(10,14,26,0.7)', padding: '3px 8px', borderRadius: 6,
        border: '1px solid var(--border-card)', letterSpacing: 0.5,
        display: 'flex', alignItems: 'center', gap: 6,
        pointerEvents: 'none',
      }}>
        <Icon.Python size={11}/> {language} · ut-8
      </div>
    </div>
  );
}

window.CodeEditor = CodeEditor;
window.HighlightedCode = HighlightedCode;
