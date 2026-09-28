import type { DataMode, GeneratedBy } from '@/types';

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-bg-surface border border-bg-border rounded-xl p-4 ${className}`}>
      {children}
    </div>
  );
}

export function DataModePill({ mode }: { mode: DataMode }) {
  return mode === "LIVE"
    ? <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-bull/10 border border-bull/30 rounded-full text-[10px] font-mono text-bull uppercase"><span className="w-1.5 h-1.5 rounded-full bg-bull animate-pulse" />Live</span>
    : <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-[10px] font-mono text-yellow-400 uppercase">⚠ Demo Data</span>;
}

export function GeneratedByPill({ by }: { by: GeneratedBy }) {
  return by === "groq"
    ? <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-500/10 border border-purple-500/30 rounded-full text-[10px] font-mono text-purple-400">✦ Groq LLM</span>
    : <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-bg-elevated border border-bg-border rounded-full text-[10px] font-mono text-neutral">Rule-based</span>;
}

export function ChangeChip({ value }: { value: number }) {
  const pos = value >= 0;
  return (
    <span className={`font-mono text-sm font-medium ${pos ? "text-bull" : "text-bear"}`}>
      {pos ? "▲" : "▼"} {Math.abs(value).toFixed(2)}%
    </span>
  );
}

export function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  if (!data.length) return null;
  const w = 80, h = 28;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  return (
    <svg width={w} height={h} className="shrink-0">
      <polyline className="sparkline-path" points={pts} stroke={positive ? "var(--bull)" : "var(--bear)"} />
    </svg>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`bg-bg-elevated rounded animate-pulse ${className}`} />;
}

export function ErrorCard({ message }: { message: string }) {
  return (
    <div className="bg-bear/10 border border-bear/30 rounded-xl p-4 text-sm text-bear">
      ⚠ {message}
    </div>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xs font-mono uppercase tracking-widest text-neutral mb-3">{children}</h2>;
}
