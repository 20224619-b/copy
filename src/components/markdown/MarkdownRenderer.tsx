// Markdown renderer minimal — bloque por bloque, sin dependencias.
//
// Soporta:
// - # H1 / ## H2 / ### H3
// - Párrafos
// - Listas con `- ` o `* ` (unordered) y `1. ` (ordered)
// - **bold**, *italic*, `inline code`, [link](url)
// - > blockquotes con tipos: `> [!tip]`, `> [!warning]`, `> [!info]` (default info)
// - Fenced code blocks ```lang con atributos opcionales: { expected="..." } o { runnable=false }
//
// Los bloques de código de Python se renderizan como InteractiveExample (editable + Probar)
// salvo que tengan { runnable=false }, en cuyo caso son sólo highlight.

import { useState } from 'react';
import { InteractiveExample } from '@/features/modulos/components/InteractiveExample';
import { CodeBlockStatic } from '@/features/modulos/components/CodeBlockStatic';

interface MarkdownRendererProps {
  source: string;
}

type Block =
  | { type: 'heading'; level: 1 | 2 | 3; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; ordered: boolean; items: string[] }
  | { type: 'quote'; kind: 'info' | 'tip' | 'warning'; text: string }
  | { type: 'code'; lang: string; code: string; runnable: boolean; expected?: string }
  | { type: 'spoiler'; title: string; inner: Block[] };

export function MarkdownRenderer({ source }: MarkdownRendererProps) {
  const blocks = parseMarkdown(source ?? '');
  return (
    <div className="flex flex-col gap-4 text-[15px] leading-relaxed text-text-secondary">
      {blocks.map((b, i) => (
        <BlockNode key={i} block={b} />
      ))}
    </div>
  );
}

function BlockNode({ block }: { block: Block }) {
  switch (block.type) {
    case 'heading':
      return <Heading level={block.level} text={block.text} />;
    case 'paragraph':
      return (
        <p className="m-0">
          <InlineText text={block.text} />
        </p>
      );
    case 'list':
      return <ListNode ordered={block.ordered} items={block.items} />;
    case 'quote':
      return <QuoteNode kind={block.kind} text={block.text} />;
    case 'code':
      if (block.runnable && block.lang.startsWith('py')) {
        return (
          <InteractiveExample initialCode={block.code} expected={block.expected} />
        );
      }
      return <CodeBlockStatic code={block.code} language={block.lang || 'text'} />;
    case 'spoiler':
      return <SpoilerNode title={block.title} inner={block.inner} />;
  }
}

function SpoilerNode({ title, inner }: { title: string; inner: Block[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{
        background: 'rgba(168,85,247,0.05)',
        borderColor: 'rgba(168,85,247,0.25)',
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-3.5 py-2.5 text-left hover:bg-white/5 transition-colors"
      >
        <span className="text-base" style={{ color: 'var(--color-accent-primary-2)' }}>
          {open ? '▾' : '▸'}
        </span>
        <span
          className="text-[11px] uppercase tracking-wider font-bold"
          style={{ color: 'var(--color-accent-primary-2)' }}
        >
          {title || 'Ver más'}
        </span>
        <span className="text-[10px] text-text-muted ml-auto">
          {open ? 'ocultar' : 'click para revelar'}
        </span>
      </button>
      {open && (
        <div className="px-3.5 pb-3.5 pt-1 flex flex-col gap-3">
          {inner.map((b, i) => (
            <BlockNode key={i} block={b} />
          ))}
        </div>
      )}
    </div>
  );
}

function Heading({ level, text }: { level: 1 | 2 | 3; text: string }) {
  const cls = {
    1: 'text-2xl font-display font-bold text-text-primary mt-2',
    2: 'text-xl font-display font-bold text-text-primary mt-2',
    3: 'text-base font-display font-semibold text-accent-cyan uppercase tracking-wider mt-1',
  }[level];
  return (
    <h3 className={`m-0 ${cls}`}>
      <InlineText text={text} />
    </h3>
  );
}

function ListNode({ ordered, items }: { ordered: boolean; items: string[] }) {
  const Tag = ordered ? 'ol' : 'ul';
  return (
    <Tag
      className={`m-0 pl-6 flex flex-col gap-1.5 ${
        ordered ? 'list-decimal' : 'list-disc'
      } marker:text-accent-primary`}
    >
      {items.map((it, i) => (
        <li key={i} className="text-text-secondary">
          <InlineText text={it} />
        </li>
      ))}
    </Tag>
  );
}

const QUOTE_STYLES = {
  info: {
    color: 'var(--color-accent-cyan)',
    bg: 'rgba(34,211,238,0.08)',
    border: 'rgba(34,211,238,0.3)',
    icon: 'ℹ',
    label: 'Nota',
  },
  tip: {
    color: 'var(--color-accent-success)',
    bg: 'rgba(16,185,129,0.08)',
    border: 'rgba(16,185,129,0.3)',
    icon: '✨',
    label: 'Tip',
  },
  warning: {
    color: '#fbbf24',
    bg: 'rgba(251,191,36,0.08)',
    border: 'rgba(251,191,36,0.3)',
    icon: '⚠',
    label: 'Atención',
  },
};

function QuoteNode({ kind, text }: { kind: 'info' | 'tip' | 'warning'; text: string }) {
  const s = QUOTE_STYLES[kind];
  return (
    <div
      className="rounded-xl border px-4 py-3"
      style={{ background: s.bg, borderColor: s.border }}
    >
      <div
        className="text-[11px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5"
        style={{ color: s.color }}
      >
        <span>{s.icon}</span> {s.label}
      </div>
      <div className="text-sm text-text-secondary leading-relaxed">
        <InlineText text={text} />
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Inline parser — convierte un string con **bold**, *italic*,
// `code`, [link](url) en un fragment de spans.
// ────────────────────────────────────────────────────────────

function InlineText({ text }: { text: string }) {
  const nodes = parseInline(text);
  return <>{nodes.map((n, i) => renderInline(n, i))}</>;
}

type InlineNode =
  | { type: 'text'; value: string }
  | { type: 'bold'; value: string }
  | { type: 'italic'; value: string }
  | { type: 'code'; value: string }
  | { type: 'link'; text: string; href: string };

function parseInline(text: string): InlineNode[] {
  const tokens: InlineNode[] = [];
  // Regex global con alternativas; el primer grupo que matchee define el tipo.
  // Orden importa: bold ANTES que italic (porque ** vs *).
  const re = /(\*\*([^*]+)\*\*)|(\*([^*\n]+)\*)|(`([^`]+)`)|(\[([^\]]+)\]\(([^)\s]+)\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) tokens.push({ type: 'text', value: text.slice(last, m.index) });
    if (m[2] !== undefined) tokens.push({ type: 'bold', value: m[2] });
    else if (m[4] !== undefined) tokens.push({ type: 'italic', value: m[4] });
    else if (m[6] !== undefined) tokens.push({ type: 'code', value: m[6] });
    else if (m[8] !== undefined && m[9] !== undefined)
      tokens.push({ type: 'link', text: m[8], href: m[9] });
    last = re.lastIndex;
  }
  if (last < text.length) tokens.push({ type: 'text', value: text.slice(last) });
  return tokens;
}

function renderInline(n: InlineNode, key: number) {
  switch (n.type) {
    case 'text':
      return <span key={key}>{n.value}</span>;
    case 'bold':
      return (
        <strong key={key} className="text-text-primary font-semibold">
          {n.value}
        </strong>
      );
    case 'italic':
      return (
        <em key={key} className="italic">
          {n.value}
        </em>
      );
    case 'code':
      return (
        <code
          key={key}
          className="font-mono text-[0.85em] px-1.5 py-0.5 rounded"
          style={{
            background: 'rgba(34,211,238,0.1)',
            color: 'var(--color-accent-cyan)',
            border: '1px solid rgba(34,211,238,0.18)',
          }}
        >
          {n.value}
        </code>
      );
    case 'link':
      return (
        <a
          key={key}
          href={n.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent-cyan underline hover:text-accent-primary-2"
        >
          {n.text}
        </a>
      );
  }
}

// ────────────────────────────────────────────────────────────
// Block parser
// ────────────────────────────────────────────────────────────

function parseMarkdown(src: string): Block[] {
  return parseBlocks(src.replace(/\r\n/g, '\n').split('\n'));
}

function parseBlocks(lines: string[]): Block[] {
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Spoiler block: ::: spoiler "titulo" ... :::
    const spoilerMatch = line.match(/^:::\s*spoiler\s*(.*)$/);
    if (spoilerMatch) {
      const rawTitle = spoilerMatch[1].trim();
      const title = rawTitle.replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
      const inner: string[] = [];
      i++;
      while (i < lines.length && !lines[i].match(/^:::\s*$/)) {
        inner.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++; // skip closing :::
      blocks.push({ type: 'spoiler', title: title || 'Ver más', inner: parseBlocks(inner) });
      continue;
    }

    // Fenced code block
    const fenceMatch = line.match(/^```(\S*)\s*(.*)$/);
    if (fenceMatch) {
      const lang = fenceMatch[1] || 'text';
      const attrs = parseCodeAttrs(fenceMatch[2] ?? '');
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      // skip closing ```
      if (i < lines.length) i++;
      blocks.push({
        type: 'code',
        lang,
        code: codeLines.join('\n'),
        runnable: attrs.runnable !== 'false',
        expected: attrs.expected,
      });
      continue;
    }

    // Heading
    const h = line.match(/^(#{1,3})\s+(.+)$/);
    if (h) {
      blocks.push({ type: 'heading', level: h[1].length as 1 | 2 | 3, text: h[2].trim() });
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith('>')) {
      const buf: string[] = [];
      let kind: 'info' | 'tip' | 'warning' = 'info';
      while (i < lines.length && lines[i].startsWith('>')) {
        const stripped = lines[i].replace(/^>\s?/, '');
        // Detectar marcador de tipo en la primera línea
        const tagMatch = stripped.match(/^\[!(tip|warning|info)\]\s*(.*)$/i);
        if (tagMatch && buf.length === 0) {
          kind = tagMatch[1].toLowerCase() as 'info' | 'tip' | 'warning';
          if (tagMatch[2]) buf.push(tagMatch[2]);
        } else {
          buf.push(stripped);
        }
        i++;
      }
      blocks.push({ type: 'quote', kind, text: buf.join(' ').trim() });
      continue;
    }

    // List (unordered or ordered)
    const ulMatch = line.match(/^[-*]\s+(.+)$/);
    const olMatch = line.match(/^\d+\.\s+(.+)$/);
    if (ulMatch || olMatch) {
      const ordered = !!olMatch;
      const items: string[] = [];
      while (i < lines.length) {
        const m = ordered
          ? lines[i].match(/^\d+\.\s+(.+)$/)
          : lines[i].match(/^[-*]\s+(.+)$/);
        if (!m) break;
        items.push(m[1]);
        i++;
      }
      blocks.push({ type: 'list', ordered, items });
      continue;
    }

    // Blank line → skip
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Otherwise — paragraph (concatenate following non-blank, non-special lines)
    const paraLines: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].startsWith('#') &&
      !lines[i].startsWith('>') &&
      !lines[i].startsWith('```') &&
      !lines[i].match(/^[-*]\s+/) &&
      !lines[i].match(/^\d+\.\s+/)
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    blocks.push({ type: 'paragraph', text: paraLines.join(' ') });
  }

  return blocks;
}

function parseCodeAttrs(raw: string): { runnable?: string; expected?: string } {
  // Acepta {expected="..."} {runnable=false}
  const stripped = raw.trim().replace(/^\{/, '').replace(/\}$/, '');
  if (!stripped) return {};
  const out: Record<string, string> = {};
  const re = /(\w+)\s*=\s*(?:"((?:[^"\\]|\\.)*)"|(\S+))/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(stripped))) {
    out[m[1]] = (m[2] ?? m[3]).replace(/\\n/g, '\n').replace(/\\"/g, '"');
  }
  return out;
}
