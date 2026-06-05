import { useState, useEffect, useRef, useCallback } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { listURLs, getAnalytics } from "../api";
import styles from "./Dashboard.module.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
);

export default function Dashboard({ refreshTrigger }) {
  const [urls, setUrls] = useState([]);
  const [selectedAlias, setSelectedAlias] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loadingURLs, setLoadingURLs] = useState(true);
  const [loadingChart, setLoadingChart] = useState(false);
  const [error, setError] = useState(null);

  const fetchURLs = useCallback(async () => {
    setLoadingURLs(true);
    try {
      const res = await listURLs();
      setUrls(res.data.urls);
    } catch {
      setError("Failed to load URLs.");
    } finally {
      setLoadingURLs(false);
    }
  }, []);

  const fetchAnalytics = useCallback(async (alias) => {
    if (!alias) return;
    setLoadingChart(true);
    setError(null);
    try {
      const res = await getAnalytics(alias);
      setAnalytics(res.data);
    } catch {
      setError("Failed to load analytics.");
    } finally {
      setLoadingChart(false);
    }
  }, []);

  useEffect(() => {
    fetchURLs();
  }, [fetchURLs, refreshTrigger]);

  useEffect(() => {
    if (selectedAlias) fetchAnalytics(selectedAlias);
  }, [selectedAlias, fetchAnalytics]);

  const handleSelect = (alias) => {
    setSelectedAlias(alias === selectedAlias ? null : alias);
    if (alias === selectedAlias) setAnalytics(null);
  };

  const handleRefresh = () => {
    fetchURLs();
    if (selectedAlias) fetchAnalytics(selectedAlias);
  };

  const chartData = analytics
    ? {
        labels: analytics.analytics.labels,
        datasets: [
          {
            label: "Clicks",
            data: analytics.analytics.data,
            borderColor: "#e8ff47",
            backgroundColor: "rgba(232, 255, 71, 0.06)",
            borderWidth: 2,
            pointBackgroundColor: "#e8ff47",
            pointBorderColor: "#0a0a0a",
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
            fill: true,
            tension: 0.3,
          },
        ],
      }
    : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1a1a1a",
        borderColor: "#3a3a3a",
        borderWidth: 1,
        titleColor: "#e8ff47",
        bodyColor: "#f0f0f0",
        titleFont: { family: "JetBrains Mono", size: 11 },
        bodyFont: { family: "JetBrains Mono", size: 11 },
        padding: 10,
        callbacks: {
          title: (items) => items[0].label,
          label: (item) => ` ${item.raw} click${item.raw !== 1 ? "s" : ""}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(255,255,255,0.04)" },
        ticks: { color: "#666", font: { family: "JetBrains Mono", size: 10 } },
        border: { color: "#2a2a2a" },
      },
      y: {
        grid: { color: "rgba(255,255,255,0.04)" },
        ticks: {
          color: "#666",
          font: { family: "JetBrains Mono", size: 10 },
          stepSize: 1,
          precision: 0,
        },
        border: { color: "#2a2a2a" },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.tag}>02 /</span>
          <h2 className={styles.title}>ANALYTICS</h2>
        </div>
        <button
          className={styles.refreshBtn}
          onClick={handleRefresh}
          disabled={loadingURLs}
        >
          {loadingURLs ? "···" : "↻ REFRESH"}
        </button>
      </div>

      {error && (
        <div className={styles.error}>
          <span>✕</span> {error}
        </div>
      )}

      <div className={styles.body}>
        <div className={styles.urlList}>
          <div className={styles.listHeader}>
            ALL LINKS
            <span className={styles.count}>{urls.length}</span>
          </div>

          {loadingURLs ? (
            <div className={styles.loading}>
              <span className={styles.loadingDot} />
              <span className={styles.loadingDot} />
              <span className={styles.loadingDot} />
            </div>
          ) : urls.length === 0 ? (
            <div className={styles.empty}>No URLs shortened yet.</div>
          ) : (
            <ul className={styles.list}>
              {urls.map((url) => (
                <li
                  key={url.alias}
                  className={`${styles.listItem} ${selectedAlias === url.alias ? styles.selected : ""}`}
                  onClick={() => handleSelect(url.alias)}
                >
                  <div className={styles.itemAlias}>/{url.alias}</div>
                  <div className={styles.itemOriginal} title={url.original_url}>
                    {url.original_url.replace(/^https?:\/\//, "").slice(0, 32)}
                    {url.original_url.length > 40 ? "…" : ""}
                  </div>
                  <div className={styles.itemStats}>
                    <span className={styles.clickBadge}>
                      {url.total_clicks}
                    </span>
                    <span className={styles.clickLabel}>clicks</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={styles.chartPanel}>
          {!selectedAlias ? (
            <div className={styles.chartPlaceholder}>
              <div className={styles.placeholderIcon}>◈</div>
              <div className={styles.placeholderText}>
                Select a URL to view its click analytics
              </div>
            </div>
          ) : loadingChart ? (
            <div className={styles.chartPlaceholder}>
              <div className={styles.loadingText}>Loading chart data…</div>
            </div>
          ) : analytics ? (
            <div className={styles.chartContent}>
              <div className={styles.chartMeta}>
                <div>
                  <div className={styles.chartAlias}>/{analytics.alias}</div>
                  <div
                    className={styles.chartUrl}
                    title={analytics.original_url}
                  >
                    {analytics.original_url
                      .replace(/^https?:\/\//, "")
                      .slice(0, 50)}
                    {analytics.original_url.length > 50 ? "…" : ""}
                  </div>
                </div>
                <div className={styles.totalClicks}>
                  <div className={styles.totalNum}>
                    {analytics.total_clicks}
                  </div>
                  <div className={styles.totalLabel}>TOTAL CLICKS</div>
                </div>
              </div>
              <div className={styles.chartSubtitle}>CLICKS — LAST 7 DAYS</div>
              <div className={styles.chartWrapper}>
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
