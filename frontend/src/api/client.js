const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export async function shortenURL(url) {
  try {
    const res = await fetch(`${BASE_URL}/api/shorten/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  } catch {
    return {
      ok: false,
      status: 0,
      data: { error: "Network error. Is the server running?" },
    };
  }
}

export async function listURLs() {
  try {
    const res = await fetch(`${BASE_URL}/api/urls/`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { ok: true, urls: data.urls ?? [] };
  } catch (err) {
    return { ok: false, urls: [], error: err.message };
  }
}

export async function getAnalytics(alias) {
  try {
    const res = await fetch(`${BASE_URL}/api/urls/${alias}/analytics/`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { ok: true, data: await res.json() };
  } catch (err) {
    return { ok: false, data: null, error: err.message };
  }
}
