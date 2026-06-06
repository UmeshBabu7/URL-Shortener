import { useState, useEffect } from "react";
import { shortenURL } from "../api/client";

export default function URLShortener({ onNewURL }) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim() || countdown > 0) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const { ok, status, data } = await shortenURL(input.trim());

    setLoading(false);

    if (status === 429) {
      setCountdown(data.retry_after_seconds ?? 60);
      setError(
        `Rate limit exceeded. Please wait ${data.retry_after_seconds}s.`,
      );
    } else if (!ok) {
      setError(data.error ?? "Something went wrong.");
    } else {
      setResult(data);
      setInput("");
      onNewURL?.();
    }
  }

  return (
    <section className="shortener-card">
      <h2>Shorten a URL</h2>
      <form onSubmit={handleSubmit} className="shortener-form">
        <input
          type="url"
          placeholder="https://example.com/very/long/url"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading || countdown > 0}
          required
        />
        <button type="submit" disabled={loading || countdown > 0}>
          {loading
            ? "Shortening…"
            : countdown > 0
              ? `Wait ${countdown}s`
              : "Shorten"}
        </button>
      </form>

      {countdown > 0 && (
        <p className="rate-limit-notice">
          ⏱ Rate limit hit. Try again in <strong>{countdown}s</strong>.
        </p>
      )}

      {error && !countdown && <p className="error-msg">⚠ {error}</p>}

      {result && (
        <div className="result-box">
          <p>Shortened!</p>
          <a href={result.short_url} target="_blank" rel="noreferrer">
            {result.short_url}
          </a>
          <p className="original-url">↪ {result.original_url}</p>
        </div>
      )}
    </section>
  );
}
