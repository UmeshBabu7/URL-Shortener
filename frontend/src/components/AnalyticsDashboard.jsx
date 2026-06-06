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
  const [listError, setListError] = useState(null);
  const [chartError, setChartError] = useState(null);

  const chartInstanceRef = useRef(null);
  const canvasNodeRef = useRef(null);

  const buildChart = useCallback((canvas, data) => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }
    if (!canvas || !data) return;

    chartInstanceRef.current = new Chart(canvas, {
      type: "line",
      data: {
        labels: data.analytics.labels,
        datasets: [
          {
            label: "Clicks",
            data: data.analytics.data,
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
  }, []);

  useEffect(() => {
    buildChart(canvasNodeRef.current, analytics);
  }, [analytics, buildChart]);

  useEffect(() => {
    return () => {
      chartInstanceRef.current?.destroy();
    };
  }, []);

  const fetchURLList = useCallback(async () => {
    setLoadingList(true);
    setListError(null);
    const { ok, urls: data, error } = await listURLs();
    if (ok) {
      setUrls(data);
    } else {
      setListError(error ?? "Failed to load URLs.");
    }
    setLoadingList(false);
  }, []);

  useEffect(() => {
    fetchURLList();
  }, [fetchURLList, refreshTrigger]);

  const fetchAnalyticsData = useCallback(async (alias) => {
    setLoadingChart(true);
    setChartError(null);
    setAnalytics(null);
    const { ok, data, error } = await getAnalytics(alias);
    if (ok) {
      setAnalytics(data);
    } else {
      setChartError(error ?? "Failed to load analytics.");
    }
    setLoadingChart(false);
  }, []);

  useEffect(() => {
    if (selectedAlias) {
      fetchAnalyticsData(selectedAlias);
    }
  }, [selectedAlias, fetchAnalyticsData]);

  function handleRefresh() {
    fetchURLList();
    if (selectedAlias) fetchAnalyticsData(selectedAlias);
  }

  return (
    <section className="dashboard-card">
      <div className="dashboard-header">
        <h2>Analytics Dashboard</h2>
        <button
          className="refresh-btn"
          onClick={handleRefresh}
          disabled={loadingList || loadingChart}
        >
          {loadingList || loadingChart ? "Refreshing…" : "↻ Refresh"}
        </button>
      </div>

      {loadingList ? (
        <p className="muted">Loading URLs…</p>
      ) : listError ? (
        <p className="error-msg">⚠ {listError}</p>
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

      {selectedAlias && (
        <div className="chart-container">
          <h3>
            <code>{selectedAlias}</code> — last 7 days
            {analytics && (
              <span className="total-badge">
                Total: {analytics.total_clicks}
              </span>
            )}
          </h3>

          {chartError && <p className="error-msg">⚠ {chartError}</p>}
          {loadingChart && <p className="muted">Loading chart…</p>}

          <canvas
            ref={canvasNodeRef}
            style={{ display: analytics && !loadingChart ? "block" : "none" }}
          />

          {!loadingChart && !analytics && !chartError && (
            <p className="muted">Select a URL to view analytics.</p>
          )}
        </div>
      )}
    </section>
  );
}
