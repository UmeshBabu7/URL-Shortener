import { useState } from "react";
import URLShortener from "./components/URLShortener";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import "./index.css";

export default function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  return (
    <div className="app">
      <header className="site-header">
        <span className="logo">✂ Snip</span>
        <p className="tagline">Rate-limited URL shortener with analytics</p>
      </header>

      <main className="content">
        <URLShortener onNewURL={() => setRefreshTrigger((n) => n + 1)} />
        <AnalyticsDashboard refreshTrigger={refreshTrigger} />
      </main>
    </div>
  );
}
