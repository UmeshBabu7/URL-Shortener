import time
from .config import RATE_LIMIT, WINDOW_SECONDS
from .store import _store, _lock


def check_rate_limit(ip: str) -> tuple[bool, int]:
    now = time.time()
    with _lock:
        if ip not in _store:
            _store[ip] = [now, 1]
            return True, 0

        window_start, count = _store[ip]
        elapsed = now - window_start

        if elapsed >= WINDOW_SECONDS:
            _store[ip] = [now, 1]
            return True, 0

        if count < RATE_LIMIT:
            _store[ip][1] += 1
            return True, 0

        retry_after = int(WINDOW_SECONDS - elapsed) + 1
        return False, retry_after
