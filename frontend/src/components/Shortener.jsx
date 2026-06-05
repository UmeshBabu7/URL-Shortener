import { useState, useEffect, useRef } from "react";
import { shortenURL } from "../api";
import styles from "./Shortener.module.css";

export default function Shortener({ onNewURL }) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const countdownRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    return () => clearInterval(countdownRef.current);
  }, []);

  const startCountdown = (seconds) => {
    setCountdown(seconds);
    clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          setError(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading || countdown > 0) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await shortenURL(input.trim());
      setResult(res.data);
      setInput("");
      onNewURL?.();
    } catch (err) {
      if (err.response?.status === 429) {
        const retryAfter = err.response.data.retry_after_seconds || 60;
        setError({
          type: "rate_limit",
          message: err.response.data.message,
          retryAfter,
        });
        startCountdown(retryAfter);
      } else if (err.response?.data?.error) {
        setError({ type: "validation", message: err.response.data.error });
      } else {
        setError({
          type: "network",
          message: "Could not connect to the server.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).catch(() => {});
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.tag}>01 /</span>
        <h2 className={styles.title}>SHORTEN</h2>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputRow}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="https://your-very-long-url.com/goes/here"
            className={styles.input}
            disabled={loading || countdown > 0}
            spellCheck={false}
          />
          <button
            type="submit"
            className={styles.btn}
            disabled={loading || countdown > 0 || !input.trim()}
          >
            {loading ? "..." : countdown > 0 ? `WAIT ${countdown}s` : "SNIP →"}
          </button>
        </div>
      </form>

      {countdown > 0 && (
        <div className={styles.rateLimitBox}>
          <div className={styles.rateLimitHeader}>
            <span className={styles.rateLimitIcon}>⚠</span>
            RATE LIMITED
          </div>
          <div className={styles.countdownDisplay}>
            <span className={styles.countdownNum}>{countdown}</span>
            <span className={styles.countdownLabel}>seconds remaining</span>
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{
                width: `${(countdown / (error?.retryAfter || 60)) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {error && error.type !== "rate_limit" && (
        <div className={styles.errorBox}>
          <span className={styles.errorIcon}>✕</span>
          {error.message}
        </div>
      )}

      {result && (
        <div className={styles.resultBox}>
          <div className={styles.resultLabel}>SHORT URL</div>
          <div className={styles.resultRow}>
            <a
              href={result.short_url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.shortUrl}
            >
              {result.short_url}
            </a>
            <button
              className={styles.copyBtn}
              onClick={() => copyToClipboard(result.short_url)}
              title="Copy to clipboard"
            >
              COPY
            </button>
          </div>
          <div className={styles.originalUrl} title={result.original_url}>
            ↳{" "}
            {result.original_url.length > 60
              ? result.original_url.slice(0, 60) + "…"
              : result.original_url}
          </div>
        </div>
      )}
    </div>
  );
}
