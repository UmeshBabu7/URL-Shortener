from threading import Lock

_store: dict[str, list] = {}
_lock = Lock()
