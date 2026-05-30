import type { Highlight } from "@/lib/types";

export function HighlightedEssay({ text, highlights }: { text: string; highlights: Highlight[] }) {
  const sorted = [...highlights].sort((a, b) => a.start - b.start);
  const nodes: React.ReactNode[] = [];
  let cursor = 0;

  sorted.forEach((item, index) => {
    if (item.start > cursor) nodes.push(<span key={`t-${index}`}>{text.slice(cursor, item.start)}</span>);
    nodes.push(
      <mark key={`h-${index}`} className={`highlight-${item.type} rounded px-1`} title={`${item.message}${item.suggestion ? ` -> ${item.suggestion}` : ""}`}>
        {text.slice(item.start, item.end)}
      </mark>
    );
    cursor = Math.max(cursor, item.end);
  });

  if (cursor < text.length) nodes.push(<span key="tail">{text.slice(cursor)}</span>);

  return <div className="whitespace-pre-wrap rounded-lg border border-slate-200 bg-white p-5 leading-8 text-slate-800">{nodes}</div>;
}

