"""
Solarian Database and Cryptographic Security Layer.
Ensures Privacy-First architecture:
- SQLite/PostgreSQL support via SQLAlchemy.
- Zero plaintext storage of birth telemetry.
- AES-256 (Fernet) field-level encryption at rest.
"""

import os
import json
import base64
from typing import Optional, Dict, Any
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from cryptography.fernet import Fernet

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "solarian.db")
DATABASE_URL = os.environ.get("DATABASE_URL", f"sqlite:///{DB_PATH}")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _get_or_create_fernet_key() -> bytes:
    env_key = os.environ.get("SOLARIAN_ENCRYPTION_KEY")
    if env_key:
        return env_key.encode("utf-8")

    key_file = os.path.join(BASE_DIR, ".secret_key")
    if os.path.exists(key_file):
        with open(key_file, "rb") as f:
            return f.read().strip()

    new_key = Fernet.generate_key()
    try:
        with open(key_file, "wb") as f:
            f.write(new_key)
    except Exception:
        pass
    return new_key


_fernet_instance = Fernet(_get_or_create_fernet_key())


def encrypt_profile(data: Dict[str, Any]) -> str:
    if not data:
        return ""
    raw_bytes = json.dumps(data, ensure_ascii=False).encode("utf-8")
    encrypted_bytes = _fernet_instance.encrypt(raw_bytes)
    return encrypted_bytes.decode("utf-8")


def decrypt_profile(ciphertext: Optional[str]) -> Dict[str, Any]:
    if not ciphertext:
        return {}
    try:
        decrypted_bytes = _fernet_instance.decrypt(ciphertext.encode("utf-8"))
        return json.loads(decrypted_bytes.decode("utf-8"))
    except Exception:
        return {}


def ensure_db_schema():
    """Auto-migrate schema columns for SQLite when tables evolve."""
    from sqlalchemy import text
    with engine.connect() as conn:
        try:
            res = conn.execute(text("PRAGMA table_info(users)")).fetchall()
            existing = {row[1] for row in res}
            if existing:
                if "role" not in existing:
                    conn.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user'"))
                if "subscription_tier" not in existing:
                    conn.execute(text("ALTER TABLE users ADD COLUMN subscription_tier VARCHAR(20) DEFAULT 'free'"))
                if "ai_queries_count" not in existing:
                    conn.execute(text("ALTER TABLE users ADD COLUMN ai_queries_count INTEGER DEFAULT 0"))
                if "subscription_expires_at" not in existing:
                    conn.execute(text("ALTER TABLE users ADD COLUMN subscription_expires_at DATETIME"))
                conn.commit()
        except Exception:
            pass

