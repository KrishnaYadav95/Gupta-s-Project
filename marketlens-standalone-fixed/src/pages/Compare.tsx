import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, Plus } from "lucide-react";
import { api } from "../lib/api";
import { Card, DataModePill, GeneratedByPill, ChangeChip, ErrorCard, SectionTitle } from "../components/ui";

const SUGGESTIONS = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA", "META", "JPM"];

export default function Compare() {
  const [chips, setChips] = useState<string[]>(["AAPL", "MSFT"]);
  const [input, setInput] = useState("");
  const [enabled, setEnabled] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["compare", chips.join(",")],
    queryFn: () => api.compare(chips),
    enabled,
  });

  function addChip(sym: string) {
    const s = sym.trim().toUpperCase();
    if (!s || chips.includes(s) || chips.length >= 4) return;
    setChips(prev => [...prev, s]);
    setInput("");
    setEnabled(false);
  }

  function removeChip(sym: string) {
    setChips(prev => prev.filter(s => s !== sym));
    setEnabled(false);
  }

  function handleCompare() { setEnabled(true); refetch(); }

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl font-semibold text-white">Compare Stocks</h1>
        <p className="text-xs text-neutral mt-0.5">Select 2–4 tickers and compare metrics side by side</p>
      </div>

      <Card>
        <SectionTitle>Select Tickers (2–4)</SectionTitle>
        <div className="flex flex-wrap gap-2 mb-3">
          {chips.map(sym => (
            <span key={sym} className="flex items-center gap-1.5 px-3 py-1 bg-accent/10 border border-accent/30 rounded-full text-sm font-mono text-accent">
              {sym}
              <button onClick={() => removeChip(sym)} className="hover:text-white transition-colors"><X size={12} /></button>
            </span>
          ))}
          {chips.length < 4 && (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === "Enter" && addChip(input)}
                placeholder="Add ticker…"
                className="px-3 py-1 bg-bg-elevated border border-bg-border rounded-full text-sm font-mono text-white placeholder:text-neutral focus:outline-none focus:border-accent/50 w-28"
              />
              <button onClick={() => addChip(input)} className="p-1 hover:text-accent text-neutral transition-colors"><Plus size={16} /></button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {SUGGESTIONS.filter(s => !chips.includes(s)).map(s => (
            <button key={s} onClick={() => addChip(s)}
              className="px-2 py-0.5 text-xs font-mono text-neutral bg-bg-elevated border border-bg-border rounded hover:border-accent/50 hover:text-accent transition-colors">
              +{s}
            </button>
          ))}
        </div>

        <button
          onClick={handleCompare}
          disabled={chips.length < 2 || isLoading}
          className="px-4 py-2 bg-accent text-bg-base rounded-lg text-sm font-semibold hover:bg-accent-dim transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Comparing…" : "Compare"}
        </button>
      </Card>

      {error && <ErrorCard message="Comparison failed. Check ticker symbols and try again." />}

      {data && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <DataModePill mode={data.dataMode} />
            <GeneratedByPill by={data.generatedBy} />
          </div>

          {/* Metrics table */}
          <Card>
            <SectionTitle>Metrics Comparison</SectionTitle>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-bg-border">
                    <th className="text-left py-2 pr-4 text-xs font-mono text-neutral">Metric</th>
                    {data.metrics.map(m => (
                      <th key={m.symbol} className="text-right py-2 px-3 text-xs font-mono text-accent">{m.symbol}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: "Price", get: (m: typeof data.metrics[0]) => `$${m.price.toFixed(2)}` },
                    { label: "Change %", get: (m: typeof data.metrics[0]) => `${m.changePercent.toFixed(2)}%` },
                    { label: "Market Cap", get: (m: typeof data.metrics[0]) => m.marketCap },
                    { label: "Sector", get: (m: typeof data.metrics[0]) => m.sector },
                    { label: "RSI", get: (m: typeof data.metrics[0]) => m.rsi.toFixed(1) },
                    { label: "Volatility", get: (m: typeof data.metrics[0]) => `${m.volatilityPercent.toFixed(1)}%` },
                    { label: "Momentum", get: (m: typeof data.metrics[0]) => `${m.momentumPercent.toFixed(1)}%` },
                  ].map(row => (
                    <tr key={row.label} className="border-b border-bg-border/50 hover:bg-bg-elevated transition-colors">
                      <td className="py-2 pr-4 text-xs font-mono text-neutral">{row.label}</td>
                      {data.metrics.map(m => (
                        <td key={m.symbol} className="py-2 px-3 text-right font-mono text-white text-xs">{row.get(m)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* AI summary */}
          <Card>
            <div className="flex items-center gap-2 mb-2">
              <SectionTitle>AI Comparison Summary</SectionTitle>
              <GeneratedByPill by={data.generatedBy} />
            </div>
            <p className="text-sm text-neutral leading-relaxed">{data.summary}</p>
            <p className="text-[10px] text-neutral border-t border-bg-border pt-2 mt-3">{data.disclaimer}</p>
          </Card>
        </div>
      )}
    </div>
  );
}
