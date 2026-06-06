# Rate-Limited URL Shortener with Analytics

Snip is a full-stack URL shortener with an HTTP API that generates 6-character SHA-256 aliases, stores data in SQLite, and serves permanent redirects. A Fixed Window rate limiter (5 req/IP/60s) guards the shorten endpoint. A React dashboard lists URLs and visualizes 7-day click analytics via Chart.js.
---

## Getting Started

### Prerequisites
- Python

---

### Backend Setup

```bash
cd backend

# 1. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment variables
cp .env.example .env
# Edit .env and set a SECRET_KEY (any long random string)

# 4. Apply migrations
python manage.py migrate

# 5. Start the development server
python manage.py runserver
```

The API will be available at `http://localhost:8000`.

---

### Frontend Setup

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env
# VITE_API_URL defaults to http://localhost:8000 — change if needed

# 3. Start the dev server
npm run dev
```

The UI will be available at `http://localhost:5173`.

---

## How the Rate Limiter Works

The rate limiter uses the **Fixed Window** algorithm, implemented from scratch in `backend/shortener/rate_limiter/checker.py` — no third-party library is used.

**Algorithm:**

1. An in-memory Python `dict` maps each client IP address to a record containing a `window_start` timestamp and a `count`.
2. On every `POST /api/shorten/` request, the middleware checks the record for the caller's IP:
   - If no record exists, or the current time is more than 60 seconds past `window_start`, a **new window** is opened and the request is allowed.
   - If `count < 5`, the count is incremented and the request is allowed.
   - If `count >= 5`, the request is **denied** with HTTP `429 Too Many Requests`, and the response JSON includes `retry_after_seconds` — calculated as `window_end - now`.
3. A `threading.Lock` ensures the counter updates are atomic under multi-threaded WSGI servers.

**Configuration** (`rate_limiter/config.py`):
```python
RATE_LIMIT = 5        # max requests per window
WINDOW_SECONDS = 60   # window size in seconds
```

---

## API Documentation

### `POST /api/shorten/`
Shorten a long URL.

**Request body:**
```json
{ "url": "https://example.com/very/long/path" }
```

**Response `201 Created`:**
```json
{
  "alias": "a3f9b2",
  "short_url": "http://localhost:8000/a3f9b2",
  "original_url": "https://example.com/very/long/path",
  "created_at": "2026-06-05T10:00:00Z"
}
```

**Response `429 Too Many Requests`** (rate limit exceeded):
```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. You may shorten 5 URLs per minute.",
  "retry_after_seconds": 42
}
```

**Response `400 Bad Request`** (invalid input):
```json
{ "error": "URL must start with http:// or https:// and include a valid domain." }
```

---

### `GET /{alias}`
Redirects to the original URL (`302 Found`) and records a click.

**Response `302`:** Redirects to original URL.
**Response `404`:**
```json
{ "error": "Alias 'xyz123' not found." }
```

---

### `GET /api/urls/`
Returns all shortened URLs with total click counts.

**Response `200 OK`:**
```json
{
  "urls": [
    {
      "alias": "a3f9b2",
      "short_url": "http://localhost:8000/a3f9b2",
      "original_url": "https://example.com/very/long/path",
      "total_clicks": 14,
      "created_at": "2026-06-05T10:00:00Z"
    }
  ]
}
```

---

### `GET /api/urls/{alias}/analytics/`
Returns per-day click counts for the last 7 days.

**Response `200 OK`:**
```json
{
  "alias": "a3f9b2",
  "original_url": "https://example.com/very/long/path",
  "short_url": "http://localhost:8000/a3f9b2",
  "total_clicks": 14,
  "analytics": {
    "labels": ["May 30", "May 31", "Jun 01", "Jun 02", "Jun 03", "Jun 04", "Jun 05"],
    "data":   [0, 3, 1, 4, 2, 0, 4]
  }
}
```

**Response `404`:**
```json
{ "error": "Alias not found." }
```
