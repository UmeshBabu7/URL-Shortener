const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export async function shortenURL(url) {
  const res = await fetch(`${BASE_URL}/api/shorten/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

export async function listURLs() {
  const res = await fetch(`${BASE_URL}/api/urls/`);
  const data = await res.json();
  return data.urls ?? [];
}

export async function getAnalytics(alias) {
  const res = await fetch(`${BASE_URL}/api/urls/${alias}/analytics/`);
  return await res.json();
}
