export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  sector?: string;
  pe?: number;
  dayHigh?: number;
  dayLow?: number;
  yearHigh?: number;
  yearLow?: number;
}

export interface PricePoint {
  timestamp: string;
  price: number;
}

export interface PortfolioItem {
  symbol: string;
  quantity: number;
  averagePrice: number;
}

export interface NewsItem {
  title: string;
  source: string;
  publishedAt: string;
  url?: string;
}

export interface Prediction {
  symbol: string;
  currentPrice: number;
  predictedPrice: number;
  confidence: number;
  horizon: string;
  reasoning?: string;
}
