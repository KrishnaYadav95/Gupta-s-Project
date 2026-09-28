import { useState } from "react";
import { api } from "../lib/api";
import { Card, DataModePill, ErrorCard, SectionTitle } from "../components/ui";
import type { SimulationResult } from '@/types';

export default function Simulator() {
  const [symbol, setSymbol] = useState("AAPL");
  const [investment, setInvestment] = useState(10000);
  const [yearsAgo, setYearsAgo] = useState(5);
  const [monthlyContribution, setMonthlyContribution] = useState(0);
  const [benchmark, setBenchmark] = useState("SPY");
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function run() {
    setLoading(true);
    setError("");
    try {
      const res = await api.simulate({ symbol, investment, yearsAgo, monthlyContribution: monthlyContribution || undefined, benchmark });
      setResult(res);
    } catch {
      setError("Simulation failed. Try again.");
    }
    setLoading(false);
  }

  const gain = result ? result.returnAmount >= 0 : true;

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      <div>
        <h1 className="text-xl font-semibold text-white">Investment Simulator</h1>
        <p className="text-xs text-neutral mt-0.5">Historical what-if replay — hypothetical only</p>
      </div>

      <Card>
        <SectionTitle>Simulation Parameters</SectionTitle>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Stock Symbol", type: "text", value: symbol, setter: (v: string) => setSymbol(v.toUpperCase()), placeholder: "AAPL" },
            { label: "Benchmark", type: "text", value: benchmark, setter: setBenchmark, placeholder: "SPY" },
          ].map(f => (
            <div key={f.label}>
              <label className="text-xs text-neutral block mb-1">{f.label}</label>
              <input
                type={f.type}
                value={f.value}
                onChange={e => f.setter(e.target.value)}
                placeholder={f.placeholder}
                className="w-full px-3 py-2 bg-bg-elevated border border-bg-border rounded-lg text-sm font-mono text-white placeholder:text-neutral focus:outline-none focus:border-accent/50"
              />
            </div>
          ))}
          {[
            { label: "Initial Investment ($)", value: investment, setter: setInvestment, min: 100 },
            { label: "Monthly Contribution ($)", value: monthlyContribution, setter: setMonthlyContribution, min: 0 },
            { label: "Years Ago", value: yearsAgo, setter: setYearsAgo, min: 1, max: 20 },
          ].map(f => (
            <div key={f.label}>
              <label className="text-xs text-neutral block mb-1">{f.label}</label>
              <input
                type="number"
                value={f.value}
                onChange={e => f.setter(Number(e.target.value))}
                min={f.min}
                max={f.max}
                className="w-full px-3 py-2 bg-bg-elevated border border-bg-border rounded-lg text-sm font-mono text-white focus:outline-none focus:border-accent/50"
              />
            </div>
          ))}
        </div>

        <button
          onClick={run}
          disabled={loading}
          className="mt-4 px-5 py-2 bg-accent text-bg-base rounded-lg text-sm font-semibold hover:bg-accent-dim transition-colors disabled:opacity-50"
        >
          {loading ? "Running…" : "Run Simulation"}
        </button>
      </Card>

      {error && <ErrorCard message={error} />}

      {result && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <DataModePill mode={result.dataMode} />
            <span className="text-xs text-neutral">Hypothetical — not real returns</span>
          </div>

          {/* Result headline */}
          <Card className={`border-2 ${gain ? "border-bull/40" : "border-bear/40"}`}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-xs text-neutral">${result.investment.toLocaleString()} invested in {result.symbol} · {yearsAgo}yr ago</p>
                <p className="text-3xl font-mono font-bold text-white mt-1">${result.currentValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <p className={`text-lg font-mono font-semibold ${gain ? "text-bull" : "text-bear"}`}>
                  {gain ? "+" : ""}${result.returnAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })} ({gain ? "+" : ""}{result.returnPercent.toFixed(1)}%)
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-neutral">vs S&P 500 benchmark</p>
                <p className="text-xl font-mono font-semibold text-neutral mt-1">+{result.benchmarkReturnPercent.toFixed(1)}%</p>
              </div>
            </div>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              ["Max Drawdown", `${result.maxDrawdown.toFixed(1)}%`, "bear"],
              ["Best Period", result.bestPeriod, "bull"],
              ["Worst Period", result.worstPeriod, "bear"],
              ["Benchmark Return", `+${result.benchmarkReturnPercent.toFixed(1)}%`, "neutral"],
            ].map(([label, val, color]) => (
              <Card key={label} className="text-center">
                <p className="text-[10px] text-neutral mb-1">{label}</p>
                <p className={`text-sm font-mono font-semibold ${color === "bull" ? "text-bull" : color === "bear" ? "text-bear" : "text-neutral"}`}>{val}</p>
              </Card>
            ))}
          </div>

          <p className="text-[10px] text-neutral bg-bg-elevated border border-bg-border rounded-lg p-3">{result.disclaimer}</p>
        </div>
      )}
    </div>
  );
}
