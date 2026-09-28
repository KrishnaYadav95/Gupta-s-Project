import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { TrendingUp, TrendingDown, ArrowRight, AlertTriangle, Brain, ChartBar } from "lucide-react";
import { api } from "../lib/api";
import { Card, DataModePill, GeneratedByPill, ChangeChip, Skeleton, ErrorCard, SectionTitle } from "../components/ui";

// Simple SVG line chart
function PriceChart({ data }: { data: { label: string; price: number }[] }) {
  if (!data.length) return null;
  const w = 800, h = 180, pad = 40;
  const prices = data.map(d => d.price);
  const min = Math.min(...prices), max = Math.max(...prices);
  const range = max - min || 1;
  const scaleX = (i: number) => pad + (i / (data.length - 1)) * (w - pad * 2);
  const scaleY = (v: number) => h - pad - ((v - min) / range) * (h - pad * 2);
  const points = data.map((d, i) => `${scaleX(i)},${scaleY(d.price)}`).join(" ");
  const positive = prices[prices.length - 1] >= prices[0];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 180 }}>
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={positive ? "#00d4aa" : "#ff4d6a"} stopOpacity="0.2" />
          <stop offset="100%" stopColor={positive ? "#00d4aa" : "#ff4d6a"} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`${scaleX(0)},${h - pad} ${points} ${scaleX(data.length - 1)},${h - pad}`}
        fill="url(#chartGrad)"
      />
      <polyline points={points} fill="none" stroke={positive ? "#00d4aa" : "#ff4d6a"} strokeWidth="2" />
      {[min, (min + max) / 2, max].map((v, i) => (
        <text key={i} x={pad - 5} y={scaleY(v) + 4} textAnchor="end" fontSize="10" fill="#8888aa">${v.toFixed(0)}</text>
      ))}
    </svg>
  );
}

export default function StockDetail() {
  const { symbol } = useParams<{ symbol: string }>();
  const sym = symbol?.toUpperCase() ?? "";

  const detail = useQuery({ queryKey: ["stock", sym], queryFn: () => api.stockDetail(sym) });
  const aiAnalysis = useQuery({ queryKey: ["ai-analysis", sym], queryFn: () => api.aiAnalysis(sym) });
  const prediction = useQuery({ queryKey: ["prediction", sym], queryFn: () => api.prediction(sym) });
  const movement = useQuery({ queryKey: ["movement", sym], queryFn: () => api.movement(sym) });

  if (detail.error) return <ErrorCard message={`Could not load data for ${sym}`} />;

  const s = detail.data?.summary;

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          {detail.isLoading ? <Skeleton className="h-8 w-40 mb-2" /> : (
            <>
              <h1 className="text-2xl font-semibold text-white font-mono">{sym}</h1>
              <p className="text-neutral text-sm">{s?.company}</p>
            </>
          )}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {s && <DataModePill mode={detail.data!.dataMode} />}
          {s && (
            <div className="text-right">
              <div className="text-2xl font-mono font-bold text-white">${s.price.toFixed(2)}</div>
              <ChangeChip value={s.changePercent} />
            </div>
          )}
        </div>
      </div>

      {/* Price chart */}
      <Card>
        <SectionTitle>Price History — {detail.data?.timeframe ?? "..."}</SectionTitle>
        {detail.isLoading ? <Skeleton className="h-44" /> : <PriceChart data={detail.data!.history} />}
      </Card>

      {/* AI Analysis + Prediction side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* AI Analysis */}
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Brain size={15} className="text-purple-400" />
            <SectionTitle>AI Stock Analysis</SectionTitle>
            {aiAnalysis.data && <GeneratedByPill by={aiAnalysis.data.generatedBy} />}
          </div>
          {aiAnalysis.isLoading ? (
            <div className="space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-16" /><Skeleton className="h-4 w-1/2" /></div>
          ) : aiAnalysis.data ? (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-white">{aiAnalysis.data.headline}</p>
              <p className="text-sm text-neutral leading-relaxed">{aiAnalysis.data.summary}</p>
              <div>
                <p className="text-xs font-mono text-neutral uppercase mb-1">Key Observations</p>
                <ul className="space-y-1">
                  {aiAnalysis.data.keyObservations.map((o, i) => (
                    <li key={i} className="flex gap-2 text-xs text-neutral"><ArrowRight size={12} className="shrink-0 mt-0.5 text-accent" />{o}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-mono text-neutral uppercase mb-1">Risk Factors</p>
                <ul className="space-y-1">
                  {aiAnalysis.data.riskFactors.map((r, i) => (
                    <li key={i} className="flex gap-2 text-xs text-neutral"><AlertTriangle size={12} className="shrink-0 mt-0.5 text-yellow-400" />{r}</li>
                  ))}
                </ul>
              </div>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(aiAnalysis.data.indicators).map(([k, v]) => (
                  <span key={k} className="px-2 py-0.5 bg-bg-elevated border border-bg-border rounded text-xs font-mono">
                    {k}: <span className="text-accent">{typeof v === "number" ? v.toFixed(1) : v}</span>
                  </span>
                ))}
              </div>
              <p className="text-[10px] text-neutral border-t border-bg-border pt-2">{aiAnalysis.data.disclaimer}</p>
            </div>
          ) : <ErrorCard message="AI analysis unavailable" />}
        </Card>

        {/* Price Prediction */}
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <ChartBar size={15} className="text-accent" />
            <SectionTitle>ML Price Prediction</SectionTitle>
          </div>
          {prediction.isLoading ? (
            <div className="space-y-2"><Skeleton className="h-16" /><Skeleton className="h-4" /><Skeleton className="h-4 w-2/3" /></div>
          ) : prediction.data ? (
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-xs text-neutral">Current</p>
                  <p className="text-xl font-mono font-bold text-white">${prediction.data.currentPrice.toFixed(2)}</p>
                </div>
                <div className={`text-2xl ${prediction.data.predictedDirection === "UP" ? "text-bull" : "text-bear"}`}>
                  {prediction.data.predictedDirection === "UP" ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                </div>
                <div>
                  <p className="text-xs text-neutral">Predicted Next</p>
                  <p className={`text-xl font-mono font-bold ${prediction.data.predictedDirection === "UP" ? "text-bull" : "text-bear"}`}>
                    ${prediction.data.predictedPrice.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  ["Change", `${prediction.data.predictedChangePercent >= 0 ? "+" : ""}${prediction.data.predictedChangePercent.toFixed(2)}%`],
                  ["Confidence", prediction.data.confidence],
                  ["Method", "Linear Regression"],
                  ["Backtest MAE", `$${prediction.data.backtest.mae.toFixed(3)}`],
                  ["Dir. Accuracy", `${prediction.data.backtest.directionalAccuracyPercent.toFixed(1)}%`],
                  ["Samples", String(prediction.data.backtest.samples)],
                ].map(([label, val]) => (
                  <div key={label} className="bg-bg-elevated rounded-lg p-2">
                    <p className="text-[10px] text-neutral">{label}</p>
                    <p className="text-xs font-mono text-white">{val}</p>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-neutral border-t border-bg-border pt-2">{prediction.data.disclaimer}</p>
            </div>
          ) : <ErrorCard message="Prediction unavailable" />}
        </Card>
      </div>

      {/* Fundamentals + Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <SectionTitle>Fundamentals</SectionTitle>
          {detail.isLoading ? <Skeleton className="h-32" /> : (
            <div className="grid grid-cols-2 gap-2">
              {detail.data?.fundamentals.map(f => (
                <div key={f.label} className="bg-bg-elevated rounded-lg p-2">
                  <p className="text-[10px] text-neutral">{f.label} {f.period && <span>· {f.period}</span>}</p>
                  <p className="text-sm font-mono text-white">{f.value}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card>
          <SectionTitle>Technical Indicators</SectionTitle>
          {detail.isLoading ? <Skeleton className="h-32" /> : (
            <div className="grid grid-cols-2 gap-2">
              {detail.data?.indicators.map(f => (
                <div key={f.label} className="bg-bg-elevated rounded-lg p-2">
                  <p className="text-[10px] text-neutral">{f.label}</p>
                  <p className="text-sm font-mono text-accent">{f.value}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* News */}
      <Card>
        <SectionTitle>Recent News</SectionTitle>
        <div className="space-y-3">
          {detail.isLoading ? Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-12" />) :
            detail.data?.news.map((n, i) => (
              <div key={i} className="flex items-start gap-3 pb-3 border-b border-bg-border last:border-0">
                <span className={`shrink-0 mt-0.5 w-2 h-2 rounded-full ${n.sentiment === "Positive" ? "bg-bull" : n.sentiment === "Negative" ? "bg-bear" : "bg-neutral"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">{n.headline}</p>
                  <p className="text-xs text-neutral mt-0.5">{n.source} · {n.timestamp} {n.impact && `· ${n.impact}`}</p>
                </div>
              </div>
            ))}
        </div>
      </Card>

      {/* Movement */}
      {movement.data && (
        <Card>
          <SectionTitle>Movement Analysis</SectionTitle>
          <p className="text-sm text-neutral mb-3">{movement.data.summary}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {movement.data.evidence.map((e, i) => (
              <div key={i} className={`rounded-lg p-3 border ${e.direction === "supporting" ? "border-bull/30 bg-bull/5" : "border-bear/30 bg-bear/5"}`}>
                <p className="text-xs font-mono text-neutral">{e.label}</p>
                <p className="text-sm font-mono font-semibold text-white">{e.value}</p>
                <p className="text-xs text-neutral mt-0.5">{e.interpretation}</p>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-neutral mt-3">{movement.data.caveat}</p>
        </Card>
      )}
    </div>
  );
}
