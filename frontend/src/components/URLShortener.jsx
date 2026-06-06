import { useState } from "react";
import { shortenURL } from "../api/client";
import useCountdown from "../hooks/useCountdown";

export default function URLShortener({ onNewURL }) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useCountdown(0);

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || countdown > 0) return;

    const urlToSend = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;

    setLoading(true);
    setError(null);
    setResult(null);

    const { ok, status, data } = await shortenURL(urlToSend);

    setLoading(false);

    if (status === 429) {
      const wait = data.retry_after_seconds ?? 60;
      setCountdown(wait);
      setError(
        `Rate limit exceeded. Please wait ${wait}s before trying again.`,
      );
    } else if (status === 0) {
      setError(data.error);
    } else if (!ok) {
      setError(data.error ?? "Something went wrong. Please try again.");
    } else {
      setResult(data);
      setInput("");
      onNewURL?.();
    }
  }

  const isBlocked = loading || countdown > 0;

  return (
    <section className="shortener-card">
      <h2>Shorten a URL</h2>
      <form onSubmit={handleSubmit} className="shortener-form">
        <input
          type="text"
          placeholder="https://example.com/very/long/url"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isBlocked}
          required
          aria-label="URL to shorten"
        />
        <button type="submit" disabled={isBlocked}>
          {loading
            ? "Shortening…"
            : countdown > 0
              ? `Wait ${countdown}s`
              : "Shorten"}
        </button>
      </form>

      {countdown > 0 && (
        <p className="rate-limit-notice">
          Rate limit hit — try again in <strong>{countdown}s</strong>.
        </p>
      )}

      {error && countdown <= 0 && <p className="error-msg">⚠ {error}</p>}

      {result && (
        <div className="result-box">
          <p>✓ Shortened successfully</p>
          <a href={result.short_url} target="_blank" rel="noreferrer">
            {result.short_url}
          </a>
          <p className="original-url">↪ {result.original_url}</p>
        </div>
      )}
    </section>
  );
}
