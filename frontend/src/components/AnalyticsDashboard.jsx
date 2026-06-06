import { useState, useEffect, useRef, useCallback } from "react";
import { listURLs, getAnalytics } from "../api/client";
import {
  Chart,
  LineElement,
  PointElement,
  LineController,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

Chart.register(
  LineElement,
  PointElement,
  LineController,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler,
);

export default function AnalyticsDashboard({ refreshTrigger }) {
  const [urls, setUrls] = useState([]);
  const [selectedAlias, setSelectedAlias] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingChart, setLoadingChart] = useState(false);
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  const fetchURLs = useCallback(async () => {
    setLoadingList(true);
    const data = await listURLs();
    setUrls(data);
    setLoadingList(false);
  }, []);

  useEffect(() => {
    fetchURLs();
  }, [fetchURLs, refreshTrigger]);

  const fetchAnalytics = useCallback(async (alias) => {
    setLoadingChart(true);
    const data = await getAnalytics(alias);
    setAnalytics(data);
    setLoadingChart(false);
  }, []);

  useEffect(() => {
    if (selectedAlias) fetchAnalytics(selectedAlias);
  }, [selectedAlias, fetchAnalytics]);

  useEffect(() => {
    if (!analytics || !chartRef.current) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    chartInstanceRef.current = new Chart(chartRef.current, {
      type: "line",
      data: {
        labels: analytics.analytics.labels,
        datasets: [
          {
            label: "Clicks",
            data: analytics.analytics.data,
            borderColor: "#6366f1",
            backgroundColor: "rgba(99,102,241,0.15)",
            pointBackgroundColor: "#6366f1",
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: { mode: "index", intersect: false },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 },
          },
        },
      },
    });

    return () => {
      chartInstanceRef.current?.destroy();
    };
  }, [analytics]);

  return (
    <section className="dashboard-card">
      <div className="dashboard-header">
        <h2>Analytics Dashboard</h2>
        <button
          className="refresh-btn"
          onClick={() => selectedAlias && fetchAnalytics(selectedAlias)}
          disabled={!selectedAlias || loadingChart}
        >
          {loadingChart ? "Refreshing…" : "↻ Refresh"}
        </button>
      </div>

      {loadingList ? (
        <p className="muted">Loading URLs…</p>
      ) : urls.length === 0 ? (
        <p className="muted">No URLs shortened yet. Create one above!</p>
      ) : (
        <ul className="url-list">
          {urls.map((u) => (
            <li
              key={u.alias}
              className={`url-item ${selectedAlias === u.alias ? "active" : ""}`}
              onClick={() => setSelectedAlias(u.alias)}
            >
              <span className="alias-badge">{u.alias}</span>
              <span className="original-truncated">{u.original_url}</span>
              <span className="click-count">{u.total_clicks} clicks</span>
            </li>
          ))}
        </ul>
      )}

      {selectedAlias && analytics && (
        <div className="chart-container">
          <h3>
            <code>{selectedAlias}</code> — last 7 days
            <span className="total-badge">Total: {analytics.total_clicks}</span>
          </h3>
          <canvas ref={chartRef} />
        </div>
      )}

      {selectedAlias && !analytics && !loadingChart && (
        <p className="muted">Select a URL to see its analytics.</p>
      )}
    </section>
  );
}
