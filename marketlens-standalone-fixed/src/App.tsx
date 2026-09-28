import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch } from "wouter";
import AppShell from "./components/AppShell";
import MarketOverview from "./pages/MarketOverview";
import StockDetail from "./pages/StockDetail";
import Compare from "./pages/Compare";
import Simulator from "./pages/Simulator";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 60_000 } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppShell>
        <Switch>
          <Route path="/" component={MarketOverview} />
          <Route path="/stock/:symbol" component={StockDetail} />
          <Route path="/compare" component={Compare} />
          <Route path="/simulate" component={Simulator} />
          <Route>
            <div className="flex items-center justify-center h-64 text-neutral">404 — Page not found</div>
          </Route>
        </Switch>
      </AppShell>
    </QueryClientProvider>
  );
}
