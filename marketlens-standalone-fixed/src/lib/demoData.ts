import type { Stock, PricePoint, Prediction } from '@/types';

const DATA: Record<string, Stock> = {
  AAPL: {symbol:'AAPL',name:'Apple Inc.',price:227.16,change:1.84,changePercent:0.82,volume:42100000,marketCap:3.42e12,sector:'Technology',pe:34.2,dayHigh:229.1,dayLow:224.8,yearHigh:260.1,yearLow:164.1},
  MSFT: {symbol:'MSFT',name:'Microsoft Corporation',price:511.46,change:2.91,changePercent:0.57,volume:18500000,marketCap:3.8e12,sector:'Technology',pe:37.8,dayHigh:514.2,dayLow:506.9,yearHigh:555.5,yearLow:344.8},
  NVDA: {symbol:'NVDA',name:'NVIDIA Corporation',price:178.12,change:-1.24,changePercent:-0.69,volume:152000000,marketCap:4.34e12,sector:'Technology',pe:48.1,dayHigh:181.2,dayLow:175.4,yearHigh:191.7,yearLow:86.62},
  TSLA: {symbol:'TSLA',name:'Tesla Inc.',price:443.25,change:4.37,changePercent:0.99,volume:88400000,marketCap:1.47e12,sector:'Automotive',pe:214.2,dayHigh:448.1,dayLow:435.2,yearHigh:488.54,yearLow:214.25},
  AMZN: {symbol:'AMZN',name:'Amazon.com Inc.',price:231.55,change:1.22,changePercent:0.53,volume:35200000,marketCap:2.47e12,sector:'Consumer',pe:37.1,dayHigh:233.2,dayLow:228.4,yearHigh:242.52,yearLow:151.61},
  GOOGL:{symbol:'GOOGL',name:'Alphabet Inc.',price:252.73,change:-0.38,changePercent:-0.15,volume:22100000,marketCap:3.06e12,sector:'Technology',pe:29.7,dayHigh:255.1,dayLow:250.4,yearHigh:256.5,yearLow:140.53},
  META:{symbol:'META',name:'Meta Platforms Inc.',price:738.42,change:3.84,changePercent:0.52,volume:12100000,marketCap:1.86e12,sector:'Technology',pe:28.9,dayHigh:744.1,dayLow:731.8,yearHigh:796.25,yearLow:476.36}
};

export function getStock(symbol:string): Stock | null {
  return DATA[symbol.toUpperCase()] ?? null;
}
export function getStocks(): Stock[] { return Object.values(DATA); }
export function getHistory(symbol:string, points=30): PricePoint[] {
  const stock=getStock(symbol); if(!stock) return [];
  return Array.from({length:points},(_,i)=>{
    const drift=Math.sin(i/4)*0.018 + (i-points)*0.0008;
    return {timestamp:new Date(Date.now()-(points-1-i)*86400000).toISOString(), price:+(stock.price*(1+drift)).toFixed(2)};
  });
}
export function predict(symbol:string): Prediction | null {
  const s=getStock(symbol); if(!s) return null;
  const predicted=s.price*(1+s.changePercent/100*2);
  return {symbol:s.symbol,currentPrice:s.price,predictedPrice:+predicted.toFixed(2),confidence:Math.min(92,Math.max(55,65+Math.abs(s.changePercent)*4)),horizon:'7 days',reasoning:'Demo prediction based on recent bundled price movement. Connect a live market-data service for production forecasting.'};
}
export function searchStocks(q:string): Stock[] {
  const x=q.toLowerCase();
  return getStocks().filter(s=>s.symbol.toLowerCase().includes(x)||s.name.toLowerCase().includes(x));
}
