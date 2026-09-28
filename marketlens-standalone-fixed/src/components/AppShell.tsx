import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { BarChart2, GitCompare, PlayCircle, TrendingUp, Search, Menu, X, Activity } from "lucide-react";
import { api } from "../lib/api";
import type { StockSummary } from '@/types';

const NAV = [
  { path: "/", label: "Market Overview", icon: BarChart2 },
  { path: "/compare", label: "Compare Stocks", icon: GitCompare },
  { path: "/simulate", label: "Simulator", icon: PlayCircle },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StockSummary[]>([]);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try { setResults(await api.search(query)); } catch { setResults([]); }
      setSearching(false);
    }, 350);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setResults([]);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-bg-base">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-56 bg-bg-surface border-r border-bg-border flex flex-col transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static`}>
        <div className="flex items-center gap-2 px-4 py-4 border-b border-bg-border">
          <Activity className="text-accent" size={20} />
          <span className="font-display font-semibold text-white tracking-tight">MarketLens</span>
          <button className="ml-auto lg:hidden text-neutral" onClick={() => setSidebarOpen(false)}><X size={18} /></button>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          {NAV.map(({ path, label, icon: Icon }) => (
            <Link key={path} href={path}>
              <a onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${location === path ? "bg-accent/10 text-accent" : "text-neutral hover:text-white hover:bg-bg-elevated"}`}>
                <Icon size={16} />
                {label}
              </a>
            </Link>
          ))}
        </nav>
        <div className="px-4 py-3 border-t border-bg-border text-xs text-neutral">
          <p>MarketLens Analytics</p>
          <p className="mt-0.5 text-[10px]">Mini-project — not financial advice</p>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex items-center gap-3 px-4 py-3 bg-bg-surface border-b border-bg-border shrink-0">
          <button className="lg:hidden text-neutral" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
          <TrendingUp size={18} className="text-accent hidden lg:block" />

          {/* Search */}
          <div className="relative flex-1 max-w-sm" ref={searchRef}>
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search stocks…"
              className="w-full pl-8 pr-3 py-1.5 bg-bg-elevated border border-bg-border rounded-lg text-sm text-white placeholder:text-neutral focus:outline-none focus:border-accent/50 font-mono"
            />
            {(results.length > 0 || searching) && (
              <div className="absolute top-full mt-1 w-full bg-bg-elevated border border-bg-border rounded-lg overflow-hidden z-50 shadow-xl">
                {searching && <div className="px-3 py-2 text-xs text-neutral">Searching…</div>}
                {results.map(s => (
                  <button key={s.symbol} onClick={() => { navigate(`/stock/${s.symbol}`); setQuery(""); setResults([]); }}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-bg-border text-left transition-colors">
                    <span className="font-mono text-sm font-medium text-accent w-14 shrink-0">{s.symbol}</span>
                    <span className="text-xs text-neutral truncate">{s.company}</span>
                    <span className={`ml-auto text-xs font-mono ${s.changePercent >= 0 ? "text-bull" : "text-bear"}`}>
                      {s.changePercent >= 0 ? "+" : ""}{s.changePercent.toFixed(2)}%
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
