"""
Database Models for Solarian User & Multi-Profile Security Architecture.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship as sa_relationship
from backend.database import Base, encrypt_profile, decrypt_profile


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="user", nullable=False)  # 'admin' | 'user'
    subscription_tier = Column(String(20), default="free", nullable=False)  # 'free' | 'premium' | 'pro'
    ai_queries_count = Column(Integer, default=0, nullable=False)
    subscription_expires_at = Column(DateTime, nullable=True)
    encrypted_profile = Column(Text, nullable=True)  # Legacy single profile container
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Multi-Profile relationship
    profiles = sa_relationship("BirthProfile", back_populates="user", cascade="all, delete-orphan", order_by="desc(BirthProfile.is_default), BirthProfile.id")

    @property
    def is_admin(self) -> bool:
        return self.role == "admin"

    @property
    def has_ai_access(self) -> bool:
        return self.is_admin or self.subscription_tier in ["premium", "pro"]

    def get_profile(self) -> dict:
        return decrypt_profile(self.encrypted_profile)

    def set_profile(self, profile: dict):
        self.encrypted_profile = encrypt_profile(profile)


class BirthProfile(Base):
    __tablename__ = "birth_profiles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False, default="ตัวฉันเอง")
    relationship = Column(String(50), default="self")  # self, spouse, child, partner, client, friend, other
    encrypted_data = Column(Text, nullable=False)
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = sa_relationship("User", back_populates="profiles")

    def get_data(self) -> dict:
        telemetry = decrypt_profile(self.encrypted_data)
        return {
            "birth_data_complete": telemetry.get("birth_data_complete", True) and all(
                telemetry.get(key) is not None and telemetry.get(key) != ""
                for key in ("birth_date", "birth_time", "latitude", "longitude", "tz_offset", "location_name")
            ),
            "id": self.id,
            "name": self.name,
            "relationship": self.relationship,
            "is_default": self.is_default,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "birth_date": telemetry.get("birth_date", "2000-01-01"),
            "birth_time": telemetry.get("birth_time", "12:00"),
            "latitude": telemetry.get("latitude", 13.75),
            "longitude": telemetry.get("longitude", 100.5167),
            "tz_offset": telemetry.get("tz_offset", 7.0),
            "location_name": telemetry.get("location_name", "Bangkok, Thailand"),
            "gender": telemetry.get("gender", "neutral"),
            "notes": telemetry.get("notes", "")
        }

    def set_data(self, payload: dict):
        telemetry = {
            "birth_data_complete": payload.get("birth_data_complete", True) and all(
                payload.get(key) is not None and payload.get(key) != ""
                for key in ("birth_date", "birth_time", "latitude", "longitude", "tz_offset", "location_name")
            ),
            "birth_date": payload.get("birth_date", "2000-01-01"),
            "birth_time": payload.get("birth_time", "12:00"),
            "latitude": float(payload.get("latitude", 13.75)),
            "longitude": float(payload.get("longitude", 100.5167)),
            "tz_offset": float(payload.get("tz_offset", 7.0)),
            "location_name": payload.get("location_name", "Bangkok, Thailand"),
            "gender": payload.get("gender", "neutral"),
            "notes": payload.get("notes", "")
        }
        self.encrypted_data = encrypt_profile(telemetry)
