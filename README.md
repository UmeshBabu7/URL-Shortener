# URL-Shortener
Snip is a full-stack URL shortener with an HTTP API that generates 6-character SHA-256 aliases, stores data in SQLite, and serves permanent redirects. A Fixed Window rate limiter (5 req/IP/60s) guards the shorten endpoint. A React dashboard lists URLs and visualizes 7-day click analytics via Chart.js.
