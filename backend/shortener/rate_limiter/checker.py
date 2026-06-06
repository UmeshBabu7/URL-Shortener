import time
import threading
from .config import RATE_LIMIT, WINDOW_SECONDS


_store: dict[str, dict] = {}
_lock = threading.Lock()


def check_rate_limit(ip: str) -> tuple[bool, int]:
    now = time.time()
    with _lock:
        record = _store.get(ip)
        if record is None or (now - record["window_start"]) >= WINDOW_SECONDS:
            _store[ip] = {"window_start": now, "count": 1}
            return True, 0
        if record["count"] < RATE_LIMIT:
            record["count"] += 1
            return True, 0
        elapsed = now - record["window_start"]
        retry_after = int(WINDOW_SECONDS - elapsed) + 1
        return False, retry_after
