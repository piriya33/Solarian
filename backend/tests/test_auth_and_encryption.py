"""
Unit tests for Solarian Privacy-First Authentication & At-Rest Encryption.
"""

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.database import Base, encrypt_profile, decrypt_profile
from backend.models import User
from backend.auth import hash_password, verify_password, create_access_token, decode_access_token

TEST_DB_URL = "sqlite:///:memory:"
engine = create_engine(TEST_DB_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


def test_password_hashing():
    pw = "SuperCosmicPassword123!"
    hashed = hash_password(pw)

    assert hashed != pw
    assert hashed.startswith("$2b$")
    assert verify_password(pw, hashed) is True
    assert verify_password("WrongPassword", hashed) is False


def test_birth_profile_encryption_at_rest():
    db = TestingSessionLocal()
    sensitive_birth_data = {
        "birth_date": "1985-01-13",
        "birth_time": "09:45",
        "latitude": 13.75,
        "longitude": 100.5167,
        "tz_offset": 7.0,
        "location_name": "Bangkok, Thailand",
        "name": "Piriya S"
    }

    user = User(
        email="explorer@solarian.space",
        password_hash=hash_password("securepassword")
    )
    user.set_profile(sensitive_birth_data)
    db.add(user)
    db.commit()
    db.refresh(user)

    # 1. Assert database column is encrypted and does NOT contain plaintext
    raw_stored_column = user.encrypted_profile
    assert raw_stored_column is not None
    assert "1985-01-13" not in raw_stored_column
    assert "Bangkok" not in raw_stored_column
    assert "Piriya" not in raw_stored_column
    assert "100.5167" not in raw_stored_column

    # 2. Assert decrypted profile matches the original payload
    decrypted = user.get_profile()
    assert decrypted["birth_date"] == "1985-01-13"
    assert decrypted["birth_time"] == "09:45"
    assert decrypted["name"] == "Piriya S"
    assert decrypted["location_name"] == "Bangkok, Thailand"
    assert decrypted["latitude"] == 13.75
    assert decrypted["longitude"] == 100.5167

    db.close()


def test_jwt_token_flow():
    token = create_access_token({"sub": "42", "email": "test@solarian.space"})
    assert isinstance(token, str)

    payload = decode_access_token(token)
    assert payload is not None
    assert payload["sub"] == "42"
    assert payload["email"] == "test@solarian.space"
    assert "exp" in payload
import uuid
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_api_auth_endpoints_flow():
    test_email = f"testuser_{uuid.uuid4().hex[:8]}@solarian.space"
    # 1. Register
    reg_payload = {
        "email": test_email,
        "password": "mypassword123",
        "profile": {
            "name": "Piriya Test",
            "birth_date": "1985-01-13",
            "birth_time": "09:45",
            "latitude": 13.75,
            "longitude": 100.5167,
            "tz_offset": 7.0,
            "location_name": "Bangkok, Thailand"
        }
    }
    r = client.post("/api/auth/register", json=reg_payload)
    assert r.status_code == 200, r.text
    data = r.json()
    assert "access_token" in data
    token = data["access_token"]
    assert data["user"]["email"] == test_email
    assert data["user"]["profile"]["birth_date"] == "1985-01-13"

    # 2. Duplicate registration fails
    r_dup = client.post("/api/auth/register", json=reg_payload)
    assert r_dup.status_code == 400

    # 3. Login
    login_payload = {
        "email": test_email,
        "password": "mypassword123"
    }
    r_login = client.post("/api/auth/login", json=login_payload)
    assert r_login.status_code == 200
    login_data = r_login.json()
    assert "access_token" in login_data
    token = login_data["access_token"]

    # 4. Get /api/auth/me
    headers = {"Authorization": f"Bearer {token}"}
    r_me = client.get("/api/auth/me", headers=headers)
    assert r_me.status_code == 200
    me_data = r_me.json()
    assert me_data["email"] == test_email
    assert me_data["profile"]["location_name"] == "Bangkok, Thailand"

    # 5. Update Profile
    updated_profile = {
        "profile": {
            "name": "Piriya Updated",
            "birth_date": "1985-01-13",
            "birth_time": "10:00",
            "latitude": 13.75,
            "longitude": 100.5167,
            "tz_offset": 7.0,
            "location_name": "Bangkok, Thailand"
        }
    }
    r_up = client.put("/api/auth/profile", json=updated_profile, headers=headers)
    assert r_up.status_code == 200
    assert r_up.json()["profile"]["birth_time"] == "10:00"
def test_multi_profile_crud_and_ai_endpoints():
    test_email = f"multi_{uuid.uuid4().hex[:8]}@solarian.space"
    reg_payload = {
        "email": test_email,
        "password": "mypassword123",
        "profile": {
            "name": "เจ้าชะตาหลัก",
            "relationship": "self",
            "birth_date": "1985-01-13",
            "birth_time": "09:45",
            "latitude": 13.75,
            "longitude": 100.5167,
            "tz_offset": 7.0,
            "location_name": "Bangkok, Thailand"
        }
    }
    r = client.post("/api/auth/register", json=reg_payload)
    assert r.status_code == 200
    token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. List profiles - should have initial profile
    r_list = client.get("/api/profiles", headers=headers)
    assert r_list.status_code == 200
    profiles = r_list.json()
    assert len(profiles) >= 1
    p1 = profiles[0]
    assert p1["is_default"] is True

    # 2. Add second profile (e.g. Spouse)
    new_profile_payload = {
        "name": "คู่ครอง",
        "relationship": "spouse",
        "birth_date": "1990-05-20",
        "birth_time": "14:30",
        "latitude": 18.7883,
        "longitude": 98.9853,
        "tz_offset": 7.0,
        "location_name": "Chiang Mai, Thailand",
        "is_default": False
    }
    r_add = client.post("/api/profiles", json=new_profile_payload, headers=headers)
    assert r_add.status_code == 200
    p2 = r_add.json()
    assert p2["name"] == "คู่ครอง"
    assert p2["relationship"] == "spouse"

    # List again
    r_list2 = client.get("/api/profiles", headers=headers)
    assert len(r_list2.json()) == 2

    # 3. Set p2 as default
    p2_id = p2["id"]
    r_def = client.post(f"/api/profiles/{p2_id}/set-default", headers=headers)
    assert r_def.status_code == 200

    # Verify p2 is now default
    r_list3 = client.get("/api/profiles", headers=headers)
    assert r_list3.json()[0]["id"] == p2_id
    assert r_list3.json()[0]["is_default"] is True

    # 4. Delete p2
    r_del = client.delete(f"/api/profiles/{p2_id}", headers=headers)
    assert r_del.status_code == 200

    # 5. Test AI Reading endpoint
    ai_req = {
        "chart_params": {
            "name": "เจ้าชะตา",
            "birth_date": "1985-01-13",
            "birth_time": "09:45",
            "latitude": 13.75,
            "longitude": 100.5167,
            "tz_offset": 7.0,
            "location_name": "Bangkok, Thailand"
        }
    }
    # 5. Test AI Reading endpoint without auth -> auth_required
    r_ai_unauth = client.post("/api/ai/reading", json=ai_req)
    assert r_ai_unauth.json()["status"] == "auth_required"

    # 5b. Test AI Reading endpoint with auth (Free trial gives 1 query)
    r_ai = client.post("/api/ai/reading", json=ai_req, headers=headers)
    assert r_ai.status_code == 200
    ai_data = r_ai.json()
    assert "reading" in ai_data
    assert "source" in ai_data

    # 6. Second AI query for Free user hits paywall
    r_ai_paywall = client.post("/api/ai/reading", json=ai_req, headers=headers)
    assert r_ai_paywall.status_code == 200
    assert r_ai_paywall.json().get("status") == "paywall_required"

    # 7. Upgrade simulation
    r_up = client.post("/api/subscription/upgrade-simulation", json={"tier": "pro"}, headers=headers)
    assert r_up.status_code == 200
    assert r_up.json()["user"]["subscription_tier"] == "pro"

    # 8. Test AI Chat endpoint with upgraded Pro tier
    chat_req = {
        "chart_params": ai_req["chart_params"],
        "question": "ปีนี้มีโอกาสเติบโตเรื่องงานอย่างไรบ้าง?"
    }
    r_chat = client.post("/api/ai/chat", json=chat_req, headers=headers)
    assert r_chat.status_code == 200
    chat_data = r_chat.json()
    assert "answer" in chat_data

