import type {
  MarketOverview, StockSummary, StockDetail, MovementAnalysis,
  AiAnalysis, PricePrediction, StockComparison, SimulationInput, SimulationResult
} from '@/types';

const BASE = "/api";

async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export const api = {
  overview: () => getJSON<MarketOverview>("/market/overview"),
  search: (q: string) => getJSON<StockSummary[]>(`/stocks/search?q=${encodeURIComponent(q)}`),
  stockDetail: (symbol: string) => getJSON<StockDetail>(`/stocks/${symbol}`),
  movement: (symbol: string) => getJSON<MovementAnalysis>(`/stocks/${symbol}/movement`),
  aiAnalysis: (symbol: string) => getJSON<AiAnalysis>(`/market/ai-analysis/${symbol}`),
  prediction: (symbol: string) => getJSON<PricePrediction>(`/market/predict/${symbol}`),
  compare: (symbols: string[]) => getJSON<StockComparison>(`/market/compare?symbols=${symbols.join(",")}`),
  simulate: (input: SimulationInput): Promise<SimulationResult> =>
    fetch(`${BASE}/simulations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }).then(r => r.json()),
};
