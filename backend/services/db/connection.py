# -*- coding: utf-8 -*-
"""
🔌 SQLite Database Connection & Session
Thread-Safe connection, WAL mode, PRAGMA optimizations, and Turkish collation/folding function.
"""
import sqlite3
import threading
from contextlib import contextmanager
from backend.config import DB_PATH
from backend.utils.text_utils import fold_turkish_text

_DB_LOCK = threading.RLock()

def get_connection():
    """Thread-safe SQLite bağlantısı ve optimize PRAGMA ayarları."""
    conn = sqlite3.connect(DB_PATH, timeout=30.0, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.create_function("fold_tr", 1, fold_turkish_text)
    
    conn.execute("PRAGMA journal_mode = WAL;")
    conn.execute("PRAGMA synchronous = NORMAL;")
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.execute("PRAGMA busy_timeout = 5000;")
    return conn

@contextmanager
def db_session():
    """ACID güvenli veritabanı oturum bağlamı."""
    with _DB_LOCK:
        conn = get_connection()
        try:
            yield conn
            conn.commit()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()
