import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { api } from "../lib/api";
import { Card, DataModePill, ChangeChip, Sparkline, Skeleton, ErrorCard, SectionTitle } from "../components/ui";
import type { StockSummary } from '@/types';

function StockRow({ s }: { s: StockSummary }) {
  return (
    <Link href={`/stock/${s.symbol}`}>
      <a className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-bg-elevated transition-colors cursor-pointer">
        <div className="w-14 shrink-0">
          <span className="font-mono text-sm font-semibold text-white">{s.symbol}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-neutral truncate">{s.company}</div>
          <div className="font-mono text-sm text-white">${s.price.toFixed(2)}</div>
        </div>
        <div className="flex items-center gap-3">
          <Sparkline data={s.sparkline} positive={s.changePercent >= 0} />
          <ChangeChip value={s.changePercent} />
        </div>
      </a>
    </Link>
  );
}

export default function MarketOverview() {
  const { data, isLoading, error } = useQuery({ queryKey: ["overview"], queryFn: api.overview });

  if (error) return <ErrorCard message="Failed to load market data." />;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Market Overview</h1>
          {data && <p className="text-xs text-neutral mt-0.5">As of {new Date(data.asOf).toLocaleTimeString()}</p>}
        </div>
        {data && <DataModePill mode={data.dataMode} />}
      </div>

      {/* Indexes */}
      <div className="grid grid-cols-3 gap-3">
        {isLoading
          ? Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-20" />)
          : data?.indexes.map(idx => (
            <Card key={idx.symbol} className="flex flex-col gap-1">
              <span className="text-xs font-mono text-neutral">{idx.label}</span>
              <span className="text-lg font-mono font-semibold text-white">{idx.value.toLocaleString()}</span>
              <ChangeChip value={idx.changePercent} />
            </Card>
          ))}
      </div>

      {/* Movers grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[
          { title: "Top Gainers", key: "topGainers" as const },
          { title: "Top Losers", key: "topLosers" as const },
          { title: "Most Active", key: "mostActive" as const },
        ].map(({ title, key }) => (
          <Card key={key}>
            <SectionTitle>{title}</SectionTitle>
            {isLoading
              ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-12 mb-2" />)
              : data?.[key]?.slice(0, 5).map(s => <StockRow key={s.symbol} s={s} />)}
          </Card>
        ))}
      </div>

      {/* Sector breadth */}
      {data && (
        <Card>
          <SectionTitle>Sector Performance</SectionTitle>
          <div className="space-y-2">
            {data.sectors.map(s => (
              <div key={s.name} className="flex items-center gap-3">
                <span className="text-xs text-neutral w-36 shrink-0">{s.name}</span>
                <div className="flex-1 h-4 bg-bg-elevated rounded overflow-hidden">
                  <div
                    className={`h-full rounded transition-all ${s.changePercent >= 0 ? "bg-bull/40" : "bg-bear/40"}`}
                    style={{ width: `${Math.min(Math.abs(s.changePercent) * 15, 100)}%` }}
                  />
                </div>
                <ChangeChip value={s.changePercent} />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
