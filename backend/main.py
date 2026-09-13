"""
Solarian Astrology Engine - FastAPI Server
Exposes REST endpoints for chart calculation, 108-year lifecycle analysis, and PDF export.
"""

from __future__ import annotations
import os
import io
from datetime import date, datetime
from zoneinfo import ZoneInfo
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from backend.database import engine, Base, get_db, ensure_db_schema
from backend.models import User, BirthProfile
from backend.auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    get_optional_user
)

from backend.engine.ephemeris import calculate_chart, ensure_ephe_configured
from backend.engine.thaksa import determine_astrological_day, calculate_thaksa_matrix, calculate_108_timeline
from backend.engine.transits import build_108_transits_map
from backend.engine.interpretation import (
    analyze_natal_chart,
    synthesize_year_life_reading,
    analyze_aspect_dynamics
)
from backend.engine.bazi import calculate_bazi
from backend.engine.ai_counselor import (
    build_astrology_prompt_context,
    call_gemini_api,
    call_openrouter_api,
    call_ai_counselor_api,
    generate_structured_fallback_reading,
    generate_structured_fallback_chat,
    SYSTEM_COACH_PERSONA
)
from backend.engine.pdf_generator import generate_astrology_pdf
from backend.engine.practical_guidance import build_practical_guidance

app = FastAPI(
    title="Solarian Astrology Engine",
    description="High-precision Natal Chart, Maha Thaksa 108-Year Lifespan, and Transits API",
    version="1.0.0"
)

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    ensure_db_schema()
    configured_path = ensure_ephe_configured()
    print(f"[Solarian Startup] Ephemeris path initialized: {configured_path}")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChartRequest(BaseModel):
    name: str = Field(default="เจ้าชะตา", description="Person's name")
    birth_date: str = Field(default="1985-01-13", description="YYYY-MM-DD")
    birth_time: str = Field(default="09:45", description="HH:MM")
    latitude: float = Field(default=13.75, description="Latitude in decimal degrees")
    longitude: float = Field(default=100.516667, description="Longitude in decimal degrees")
    tz_offset: float = Field(default=7.0, description="Timezone offset from UTC in hours")
    location_name: str = Field(default="Bangkok, Thailand", description="City / Country label")
    reference_date: date = Field(
        default_factory=lambda: datetime.now(ZoneInfo("Asia/Bangkok")).date(),
        description="Date for practical guidance; defaults to today in Asia/Bangkok",
    )


PRESET_CITIES = [
    {"city": "Bangkok, Thailand (กรุงเทพฯ)", "lat": 13.7500, "lon": 100.5167, "tz": 7.0},
    {"city": "Chiang Mai, Thailand (เชียงใหม่)", "lat": 18.7883, "lon": 98.9853, "tz": 7.0},
    {"city": "Phuket, Thailand (ภูเก็ต)", "lat": 7.8804, "lon": 98.3923, "tz": 7.0},
    {"city": "Khon Kaen, Thailand (ขอนแก่น)", "lat": 16.4322, "lon": 102.8236, "tz": 7.0},
    {"city": "Singapore (สิงคโปร์)", "lat": 1.3521, "lon": 103.8198, "tz": 8.0},
    {"city": "Tokyo, Japan (โตเกียว)", "lat": 35.6762, "lon": 139.6503, "tz": 9.0},
    {"city": "London, UK (ลอนดอน)", "lat": 51.5074, "lon": -0.1278, "tz": 0.0},
    {"city": "Paris, France (ปารีส)", "lat": 48.8566, "lon": 2.3522, "tz": 1.0},
    {"city": "New York, USA (นิวยอร์ก)", "lat": 40.7128, "lon": -74.0060, "tz": -5.0},
    {"city": "Los Angeles, USA (ลอสแอนเจลิส)", "lat": 34.0522, "lon": -118.2437, "tz": -8.0},
    {"city": "Sydney, Australia (ซิดนีย์)", "lat": -33.8688, "lon": 151.2093, "tz": 10.0}
]


@app.get("/api/health")
@app.get("/healthz")
def health_check():
    """Health check endpoint for container orchestrators (Railway, Render, K8s)."""
    return {"status": "ok", "service": "solarian-astrology-engine"}


@app.get("/api/cities")
def get_cities():
    """Returns list of preset major cities with coordinates and timezones."""
    return PRESET_CITIES


@app.get("/api/chart/preset/default")
@app.get("/api/chart/preset/piriya")
def get_default_preset():
    """Returns the benchmark chart parameters."""
    return {
        "name": "เจ้าชะตา",
        "birth_date": "1985-01-13",
        "birth_time": "09:45",
        "latitude": 13.75,
        "longitude": 100.516667,
        "tz_offset": 7.0,
        "location_name": "Bangkok, Thailand"
    }


@app.post("/api/chart/calculate")
def calculate_astrology(req: ChartRequest):
    """
    Computes full natal chart, Placidus houses, aspects, Thaksa 108-year lifecycle,
    annual transits, personality trinity, and Eastern Bazi Four Pillars.
    """
    try:
        chart = calculate_chart(
            birth_date=req.birth_date,
            birth_time=req.birth_time,
            latitude=req.latitude,
            longitude=req.longitude,
            tz_offset=req.tz_offset,
            house_system="P"
        )

        sunrise_time = chart["metadata"]["sunrise_local"]
        day_res = determine_astrological_day(req.birth_date, req.birth_time, sunrise_time)
        matrix = calculate_thaksa_matrix(day_res["thaksa_num"])
        timeline = calculate_108_timeline(req.birth_date, day_res["thaksa_num"], chart["planets_dict"])
        transits_map = build_108_transits_map(chart)
        trinity = analyze_natal_chart(chart, matrix)
        aspect_dynamics = analyze_aspect_dynamics(chart, matrix)
        bazi = calculate_bazi(
            birth_date=req.birth_date,
            birth_time=req.birth_time,
            latitude=req.latitude,
            longitude=req.longitude,
            tz_offset=req.tz_offset,
            gender="m"
        )

        # Enrich years_map with synthesized reading for each year
        for year_entry in timeline["years_map"]:
            age = year_entry["age"]
            t_data = transits_map[age] if age < len(transits_map) else {}
            reading = synthesize_year_life_reading(age, year_entry, chart, t_data, thaksa_matrix=matrix)
            year_entry["reading"] = reading

        return {
            "success": True,
            "profile": {
                "name": req.name,
                "location_name": req.location_name
            },
            "chart": chart,
            "day_result": day_res,
            "thaksa_matrix": matrix,
            "timeline": timeline,
            "transits_map": transits_map,
            "trinity": trinity,
            "aspect_dynamics": aspect_dynamics,
            "bazi": bazi,
            "guidance": build_practical_guidance(chart, timeline, req.reference_date.isoformat()),
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


class SynastryRequest(BaseModel):
    person1: ChartRequest
    person2: ChartRequest


@app.post("/api/chart/synastry")
def calculate_synastry(req: SynastryRequest):
    """
    Computes cross-chart synastry analysis:
    - Person 1 & Person 2 natal charts
    - Cross-planetary aspects (e.g. Sun-Moon, Venus-Mars, Jupiter-Sun)
    - Western relationship dynamics
    - Eastern Bazi Day Master element synergy
    """
    try:
        # Calculate Chart 1
        p1 = req.person1
        chart1 = calculate_chart(p1.birth_date, p1.birth_time, p1.latitude, p1.longitude, p1.tz_offset, "P")
        bazi1 = calculate_bazi(p1.birth_date, p1.birth_time, p1.latitude, p1.longitude, p1.tz_offset, "m")

        # Calculate Chart 2
        p2 = req.person2
        chart2 = calculate_chart(p2.birth_date, p2.birth_time, p2.latitude, p2.longitude, p2.tz_offset, "P")
        bazi2 = calculate_bazi(p2.birth_date, p2.birth_time, p2.latitude, p2.longitude, p2.tz_offset, "f")

        # Cross Aspects
        from backend.engine.ephemeris import ASPECT_DEFS
        planets1 = chart1["planets"]
        planets2 = chart2["planets"]

        cross_aspects = []
        for pl1 in planets1:
            if pl1["name"] in ["Mean Node"]:
                continue
            for pl2 in planets2:
                if pl2["name"] in ["Mean Node"]:
                    continue

                diff = abs(pl1["longitude"] - pl2["longitude"]) % 360.0
                if diff > 180.0:
                    diff = 360.0 - diff

                for asp in ASPECT_DEFS:
                    orb = abs(diff - asp["angle"])
                    if orb <= asp["orb"]:
                        # Harmony vs Tension
                        is_harmonious = asp["name"] in ["Trine", "Sextile", "Semi-Sextile"]
                        is_challenging = asp["name"] in ["Square", "Opposition", "Sesquiquadrate", "Semi-Square"]

                        cross_aspects.append({
                            "p1_planet": pl1["name"],
                            "p1_thai": pl1["thai"],
                            "p1_symbol": pl1["symbol"],
                            "p1_sign": pl1["sign_thai"],
                            "p2_planet": pl2["name"],
                            "p2_thai": pl2["thai"],
                            "p2_symbol": pl2["symbol"],
                            "p2_sign": pl2["sign_thai"],
                            "aspect_name": asp["name"],
                            "aspect_thai": asp["thai"],
                            "aspect_symbol": asp["symbol"],
                            "angle": asp["angle"],
                            "orb": round(orb, 2),
                            "color": asp["color"],
                            "is_harmonious": is_harmonious,
                            "is_challenging": is_challenging,
                            "summary": f"{pl1['thai']} (คนที่ 1) ทำมุม{asp['thai']}กับ{pl2['thai']} (คนที่ 2)"
                        })

        # Sort cross aspects by orb
        cross_aspects.sort(key=lambda x: x["orb"])

        # Bazi Day Master synergy
        dm1 = bazi1["day_master"]
        dm2 = bazi2["day_master"]
        elem1 = dm1["stem"]["element"]
        elem2 = dm2["stem"]["element"]

        # Generating cycle: Wood -> Fire -> Earth -> Metal -> Water -> Wood
        GEN_ORDER = ["Wood", "Fire", "Earth", "Metal", "Water"]
        idx1 = GEN_ORDER.index(elem1) if elem1 in GEN_ORDER else 0
        idx2 = GEN_ORDER.index(elem2) if elem2 in GEN_ORDER else 0

        if elem1 == elem2:
            synergy_type = "ธาตุเดียวกัน (Companion / Equal)"
            synergy_desc = "เข้าใจกันง่าย มีจังหวะความคิดและวิถีชีวิตที่กลมกลืน เสมือนเพื่อนคู่คิดที่มองเห็นภาพเดียวกัน"
        elif (idx1 + 1) % 5 == idx2:
            synergy_type = f"{dm1['stem']['thai']} ส่งเสริม {dm2['stem']['thai']} (Nurturing)"
            synergy_desc = f"{p1.name} เป็นฝ่ายเกื้อหนุน ให้กำลังใจ และเติมเต็มทรัพยากรให้ {p2.name} เติบโต"
        elif (idx2 + 1) % 5 == idx1:
            synergy_type = f"{dm2['stem']['thai']} ส่งเสริม {dm1['stem']['thai']} (Supported)"
            synergy_desc = f"{p2.name} เป็นฝ่ายเกื้อหนุน คอยสนับสนุนและสร้างความมั่นคงให้กับ {p1.name}"
        elif (idx1 + 2) % 5 == idx2 or (idx2 + 2) % 5 == idx1:
            synergy_type = "ธาตุควบคุม/ท้าทาย (Dynamic Catalyst)"
            synergy_desc = "กระตุ้นการเติบโตผ่านมุมมองที่แตกต่าง ต้องอาศัยความเข้าใจและการสื่อสารที่ชัดเจนเพื่อแปรความขัดแย้งเป็นพลังสร้างสรรค์"
        else:
            synergy_type = "ธาตุคู่สมดุล (Harmonious Balance)"
            synergy_desc = "เกื้อกูลกันในมิติที่มองไม่เห็น สร้างความสมบูรณ์รอบด้าน"

        return {
            "success": True,
            "person1": {
                "name": p1.name,
                "sun": chart1["planets_dict"]["Sun"]["sign_thai"],
                "moon": chart1["planets_dict"]["Moon"]["sign_thai"],
                "ascendant": chart1["angles"]["Ascendant"]["sign_thai"],
                "day_master": dm1
            },
            "person2": {
                "name": p2.name,
                "sun": chart2["planets_dict"]["Sun"]["sign_thai"],
                "moon": chart2["planets_dict"]["Moon"]["sign_thai"],
                "ascendant": chart2["angles"]["Ascendant"]["sign_thai"],
                "day_master": dm2
            },
            "cross_aspects": cross_aspects,
            "bazi_synergy": {
                "p1_element": dm1["stem"]["thai"],
                "p2_element": dm2["stem"]["thai"],
                "synergy_type": synergy_type,
                "synergy_desc": synergy_desc
            }
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/chart/export-pdf")
def export_pdf(req: ChartRequest):
    """
    Generates and streams the PDF document.
    """
    try:
        chart = calculate_chart(
            birth_date=req.birth_date,
            birth_time=req.birth_time,
            latitude=req.latitude,
            longitude=req.longitude,
            tz_offset=req.tz_offset,
            house_system="P"
        )
        sunrise_time = chart["metadata"]["sunrise_local"]
        day_res = determine_astrological_day(req.birth_date, req.birth_time, sunrise_time)
        matrix = calculate_thaksa_matrix(day_res["thaksa_num"])
        timeline = calculate_108_timeline(req.birth_date, day_res["thaksa_num"], chart["planets_dict"])
        trinity = analyze_natal_chart(chart, matrix)
        aspect_dynamics = analyze_aspect_dynamics(chart, matrix)

        pdf_bytes = generate_astrology_pdf(
            person_name=req.name,
            chart_data=chart,
            day_res=day_res,
            thaksa_matrix=matrix,
            timeline_data=timeline,
            trinity_data=trinity,
            location_name=req.location_name,
            aspect_dynamics=aspect_dynamics
        )

        safe_name = req.name.replace(" ", "_")
        filename = f"Solarian_Chart_{safe_name}_{req.birth_date}.pdf"

        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'}
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# --- User & Privacy-First Authentication Schemas & Endpoints ---

class UserRegisterRequest(BaseModel):
    email: str = Field(..., description="User email for login")
    password: str = Field(..., min_length=6, description="Minimum 6 characters")
    profile: Optional[Dict[str, Any]] = None


class UserLoginRequest(BaseModel):
    email: str
    password: str


class UserProfileUpdateRequest(BaseModel):
    profile: Dict[str, Any]


@app.post("/api/auth/register")
def register_user(req: UserRegisterRequest, db: Session = Depends(get_db)):
    email_clean = req.email.strip().lower()
    if not email_clean or "@" not in email_clean:
        raise HTTPException(status_code=400, detail="กรุณาระบุอีเมลที่ถูกต้อง")
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร")

    existing = db.query(User).filter(User.email == email_clean).first()
    if existing:
        raise HTTPException(status_code=400, detail="อีเมลนี้ลงทะเบียนไว้แล้ว")

    admin_email = os.environ.get("ADMIN_EMAIL", "admin@solarian.io").strip().lower()
    user_count = db.query(User).count()
    is_admin_candidate = (user_count == 0) or (email_clean == admin_email)
    user_role = "admin" if is_admin_candidate else "user"
    user_tier = "pro" if is_admin_candidate else "free"

    user = User(
        email=email_clean,
        password_hash=hash_password(req.password),
        role=user_role,
        subscription_tier=user_tier,
        ai_queries_count=0
    )
    if req.profile:
        user.set_profile(req.profile)
    db.add(user)
    db.commit()
    db.refresh(user)

    if req.profile:
        bp = BirthProfile(
            user_id=user.id,
            name=req.profile.get("name") or "ดวงของฉัน",
            relationship=req.profile.get("relationship") or "self",
            is_default=True
        )
        bp.set_data(req.profile)
        db.add(bp)
        db.commit()

    token = create_access_token({"sub": str(user.id), "email": user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "subscription_tier": user.subscription_tier,
            "has_ai_access": user.has_ai_access,
            "ai_queries_count": user.ai_queries_count or 0,
            "profile": user.get_profile()
        }
    }


@app.post("/api/auth/login")
def login_user(req: UserLoginRequest, db: Session = Depends(get_db)):
    email_clean = req.email.strip().lower()
    user = db.query(User).filter(User.email == email_clean).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="อีเมลหรือรหัสผ่านไม่ถูกต้อง")

    admin_email = os.environ.get("ADMIN_EMAIL", "admin@solarian.io").strip().lower()
    if user.email.lower() == admin_email and user.role != "admin":
        user.role = "admin"
        user.subscription_tier = "pro"
        db.commit()

    token = create_access_token({"sub": str(user.id), "email": user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role or "user",
            "subscription_tier": user.subscription_tier or "free",
            "has_ai_access": user.has_ai_access,
            "ai_queries_count": user.ai_queries_count or 0,
            "profile": user.get_profile()
        }
    }


@app.get("/api/auth/me")
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@solarian.io").strip().lower()
    if current_user.email.lower() == admin_email and current_user.role != "admin":
        current_user.role = "admin"
        current_user.subscription_tier = "pro"
        db.commit()

    return {
        "id": current_user.id,
        "email": current_user.email,
        "role": current_user.role or "user",
        "subscription_tier": current_user.subscription_tier or "free",
        "has_ai_access": current_user.has_ai_access,
        "ai_queries_count": current_user.ai_queries_count or 0,
        "profile": current_user.get_profile()
    }


@app.put("/api/auth/profile")
def update_profile(
    req: UserProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    current_user.set_profile(req.profile)
    db.commit()
    db.refresh(current_user)
    return {
        "id": current_user.id,
        "email": current_user.email,
        "profile": current_user.get_profile()
    }


# --- Multi-Profile Schemas & Endpoints ---

class BirthProfileCreateRequest(BaseModel):
    name: str = Field(default="ตัวฉันเอง", description="Profile label")
    relationship: Optional[str] = Field(default="self")
    birth_date: str = Field(default="1985-01-13", description="YYYY-MM-DD")
    birth_time: str = Field(default="09:45", description="HH:MM")
    latitude: float = Field(default=13.75)
    longitude: float = Field(default=100.5167)
    tz_offset: float = Field(default=7.0)
    location_name: str = Field(default="Bangkok, Thailand")
    gender: Optional[str] = Field(default="m")
    notes: Optional[str] = Field(default="")
    is_default: Optional[bool] = Field(default=False)


class BirthProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    relationship: Optional[str] = None
    birth_date: Optional[str] = None
    birth_time: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    tz_offset: Optional[float] = None
    location_name: Optional[str] = None
    gender: Optional[str] = None
    notes: Optional[str] = None
    is_default: Optional[bool] = None


def ensure_user_profiles_migrated(user: User, db: Session):
    """Seamlessly auto-migrates single profile users to multi-profile model."""
    profile_count = db.query(BirthProfile).filter(BirthProfile.user_id == user.id).count()
    if profile_count == 0 and user.encrypted_profile:
        legacy = user.get_profile()
        if legacy and legacy.get("birth_date"):
            bp = BirthProfile(
                user_id=user.id,
                name=legacy.get("name") or "ดวงของฉัน",
                relationship="self",
                is_default=True
            )
            bp.set_data(legacy)
            db.add(bp)
            db.commit()
            db.refresh(user)


@app.get("/api/profiles")
def list_profiles(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ensure_user_profiles_migrated(current_user, db)
    profiles = db.query(BirthProfile).filter(BirthProfile.user_id == current_user.id).order_by(BirthProfile.is_default.desc(), BirthProfile.id.asc()).all()
    return [p.get_data() for p in profiles]


@app.post("/api/profiles")
def create_profile(req: BirthProfileCreateRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    count = db.query(BirthProfile).filter(BirthProfile.user_id == current_user.id).count()
    make_default = req.is_default or (count == 0)

    if make_default:
        db.query(BirthProfile).filter(BirthProfile.user_id == current_user.id).update({"is_default": False})

    bp = BirthProfile(
        user_id=current_user.id,
        name=req.name.strip() or "ดวงใหม่",
        relationship=req.relationship or "self",
        is_default=make_default
    )
    bp.set_data(req.dict())
    db.add(bp)
    db.commit()
    db.refresh(bp)
    return bp.get_data()


@app.put("/api/profiles/{profile_id}")
def update_profile_by_id(
    profile_id: int,
    req: BirthProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    bp = db.query(BirthProfile).filter(BirthProfile.id == profile_id, BirthProfile.user_id == current_user.id).first()
    if not bp:
        raise HTTPException(status_code=404, detail="ไม่พบข้อมูลดวงชะตานี้")

    if req.is_default:
        db.query(BirthProfile).filter(BirthProfile.user_id == current_user.id, BirthProfile.id != profile_id).update({"is_default": False})
        bp.is_default = True

    if req.name is not None:
        bp.name = req.name.strip()
    if req.relationship is not None:
        bp.relationship = req.relationship

    current_data = bp.get_data()
    for key in ["birth_date", "birth_time", "latitude", "longitude", "tz_offset", "location_name", "gender", "notes"]:
        val = getattr(req, key, None)
        if val is not None:
            current_data[key] = val

    bp.set_data(current_data)
    bp.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(bp)
    return bp.get_data()


@app.delete("/api/profiles/{profile_id}")
def delete_profile_by_id(
    profile_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    bp = db.query(BirthProfile).filter(BirthProfile.id == profile_id, BirthProfile.user_id == current_user.id).first()
    if not bp:
        raise HTTPException(status_code=404, detail="ไม่พบข้อมูลดวงชะตานี้")

    was_default = bp.is_default
    db.delete(bp)
    db.commit()

    if was_default:
        next_p = db.query(BirthProfile).filter(BirthProfile.user_id == current_user.id).first()
        if next_p:
            next_p.is_default = True
            db.commit()

    return {"success": True, "message": "ลบข้อมูลดวงชะตาเรียบร้อยแล้ว"}


@app.post("/api/profiles/{profile_id}/set-default")
def set_default_profile(
    profile_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    bp = db.query(BirthProfile).filter(BirthProfile.id == profile_id, BirthProfile.user_id == current_user.id).first()
    if not bp:
        raise HTTPException(status_code=404, detail="ไม่พบข้อมูลดวงชะตานี้")

    db.query(BirthProfile).filter(BirthProfile.user_id == current_user.id).update({"is_default": False})
    bp.is_default = True
    db.commit()
    return {"success": True, "default_profile_id": bp.id}


# --- Admin & Subscription Management Schemas & Endpoints ---

class AdminUserTierUpdateRequest(BaseModel):
    subscription_tier: Optional[str] = None  # 'free', 'premium', 'pro'
    role: Optional[str] = None  # 'user', 'admin'


class SubscriptionUpgradeRequest(BaseModel):
    tier: str = Field(default="pro", description="Target tier: premium or pro")


@app.get("/api/admin/users")
def admin_list_users(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="สงวนสิทธิ์เฉพาะผู้ดูแลระบบ (Admin) เท่านั้น")
    users = db.query(User).order_by(User.id.asc()).all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "role": u.role,
            "subscription_tier": u.subscription_tier,
            "ai_queries_count": u.ai_queries_count or 0,
            "profiles_count": len(u.profiles),
            "created_at": u.created_at.isoformat() if u.created_at else None
        }
        for u in users
    ]


@app.put("/api/admin/users/{user_id}/tier")
def admin_update_user_tier(
    user_id: int,
    req: AdminUserTierUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="สงวนสิทธิ์เฉพาะผู้ดูแลระบบ (Admin) เท่านั้น")
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="ไม่พบผู้ใช้งานนี้")
    if req.subscription_tier is not None:
        target.subscription_tier = req.subscription_tier
    if req.role is not None:
        target.role = req.role
    db.commit()
    db.refresh(target)
    return {
        "success": True,
        "user_id": target.id,
        "email": target.email,
        "role": target.role,
        "subscription_tier": target.subscription_tier
    }


@app.get("/api/admin/stats")
def admin_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="สงวนสิทธิ์เฉพาะผู้ดูแลระบบ (Admin) เท่านั้น")
    total_users = db.query(User).count()
    total_profiles = db.query(BirthProfile).count()
    premium_users = db.query(User).filter(User.subscription_tier.in_(["premium", "pro"])).count()
    admin_users = db.query(User).filter(User.role == "admin").count()
    total_ai_queries = sum([u.ai_queries_count or 0 for u in db.query(User).all()])
    return {
        "total_users": total_users,
        "total_profiles": total_profiles,
        "premium_users": premium_users,
        "admin_users": admin_users,
        "total_ai_queries": total_ai_queries
    }


@app.post("/api/subscription/upgrade-simulation")
def upgrade_subscription_simulation(
    req: SubscriptionUpgradeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    current_user.subscription_tier = req.tier
    db.commit()
    db.refresh(current_user)
    return {
        "success": True,
        "message": f"ยกระดับบัญชีสู่แพ็กเกจ {req.tier.upper()} เรียบร้อยแล้ว (เปิดใช้งาน AI Life Counselor ไม่จำกัด)",
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "role": current_user.role,
            "subscription_tier": current_user.subscription_tier,
            "has_ai_access": current_user.has_ai_access,
            "ai_queries_count": current_user.ai_queries_count or 0
        }
    }


# --- AI Astrological Life Counselor Schemas & Endpoints ---

class AIReadingRequest(BaseModel):
    chart_params: ChartRequest
    api_key: Optional[str] = None


class AIChatRequest(BaseModel):
    chart_params: ChartRequest
    question: str
    history: Optional[List[Dict[str, str]]] = None
    api_key: Optional[str] = None


@app.post("/api/ai/reading")
def generate_ai_reading(
    req: AIReadingRequest,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """
    Synthesizes a deep executive life reading from Western Natal, Thai Thaksa,
    and Eastern Bazi data using Google Gemini (with deterministic synthesis fallback).
    """
    # Paywall / Token Protection Gating Check
    if not current_user:
        if not req.api_key:
            return {
                "success": False,
                "status": "auth_required",
                "message": "กรุณาเข้าสู่ระบบเพื่อใช้งานที่ปรึกษา AI Life Counselor"
            }
    elif not current_user.has_ai_access:
        if (current_user.ai_queries_count or 0) >= 1 and not req.api_key:
            return {
                "success": False,
                "status": "paywall_required",
                "message": "คุณใช้โควตาทดลองใช้งานฟรีครบแล้ว กรุณายกระดับเป็น Premium หรือ Pro เพื่อรับคำปรึกษา AI ได้ไม่จำกัด (ระบบอยู่ระหว่างจำกัดโควตา Token)",
                "user_tier": current_user.subscription_tier,
                "ai_queries_count": current_user.ai_queries_count
            }

    cp = req.chart_params
    chart = calculate_chart(cp.birth_date, cp.birth_time, cp.latitude, cp.longitude, cp.tz_offset, "P")
    sunrise_time = chart["metadata"]["sunrise_local"]
    day_res = determine_astrological_day(cp.birth_date, cp.birth_time, sunrise_time)
    matrix = calculate_thaksa_matrix(day_res["thaksa_num"])
    timeline = calculate_108_timeline(cp.birth_date, day_res["thaksa_num"], chart["planets_dict"])
    trinity = analyze_natal_chart(chart, matrix)
    aspect_dynamics = analyze_aspect_dynamics(chart, matrix)
    bazi = calculate_bazi(cp.birth_date, cp.birth_time, cp.latitude, cp.longitude, cp.tz_offset, "m")

    # Build dense structured context
    context = build_astrology_prompt_context(
        chart_data=chart,
        day_res=day_res,
        thaksa_matrix=matrix,
        timeline_data=timeline,
        trinity_data=trinity,
        bazi_data=bazi,
        aspect_dynamics=aspect_dynamics
    )

    prompt = (
        f"{context}\n\n"
        f"กรุณาวิเคราะห์และจัดทำรายงาน 'พิมพ์เขียวกลยุทธ์ชีวิตเชิงลึก (Solarian Executive Life Blueprint)' "
        f"สำหรับ {cp.name} โดยครอบคลุม 4 หัวข้อสำคัญ:\n"
        f"1. ถอดรหัสแก่นแท้แห่งตัวตนและพลังงานจิตวิญญาณ (Core Archetype & Energy Matrix)\n"
        f"2. วิเคราะห์จังหวะชีวิต ยุคสมัย และการบริหารเอนโทรปี (Current Chapter & Entropy Management)\n"
        f"3. สามเสาหลักแห่งความสำเร็จ: การงาน การเงิน และความสัมพันธ์ (The 3 Strategic Domains)\n"
        f"4. แผนปฏิบัติการเชิงรุก 90 วันแรก (Immediate 90-Day Action Roadmap)\n"
        f"เขียนด้วยภาษาที่ลึกซึ้ง สุขุม สร้างแรงบันดาลใจ มีระดับ และนำไปใช้ได้จริง"
    )

    if current_user:
        current_user.ai_queries_count = (current_user.ai_queries_count or 0) + 1
        db.commit()

    ai_resp = call_ai_counselor_api(prompt, api_key=req.api_key)
    if ai_resp.get("success") and ai_resp.get("text"):
        return {
            "success": True,
            "status": "success",
            "reading": ai_resp["text"],
            "source": ai_resp["provider"],
            "model": ai_resp.get("model"),
            "user_tier": current_user.subscription_tier if current_user else "guest",
            "ai_queries_count": current_user.ai_queries_count if current_user else 0
        }
    else:
        fallback = generate_structured_fallback_reading(chart, bazi)
        return {
            "success": True,
            "status": "success",
            "reading": fallback,
            "source": "deterministic_synthesis",
            "user_tier": current_user.subscription_tier if current_user else "guest",
            "ai_queries_count": current_user.ai_queries_count if current_user else 0
        }


@app.post("/api/ai/chat")
def chat_ai_counselor(
    req: AIChatRequest,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """
    Answers user life counseling questions grounded in their chart telemetry.
    """
    # Paywall / Token Protection Gating Check
    if not current_user:
        if not req.api_key:
            return {
                "success": False,
                "status": "auth_required",
                "message": "กรุณาเข้าสู่ระบบเพื่อใช้งานที่ปรึกษา AI Life Counselor"
            }
    elif not current_user.has_ai_access:
        if (current_user.ai_queries_count or 0) >= 1 and not req.api_key:
            return {
                "success": False,
                "status": "paywall_required",
                "message": "คุณใช้โควตาทดลองใช้งานฟรีครบแล้ว กรุณายกระดับเป็น Premium หรือ Pro เพื่อรับคำปรึกษา AI ได้ไม่จำกัด (ระบบอยู่ระหว่างจำกัดโควตา Token)",
                "user_tier": current_user.subscription_tier,
                "ai_queries_count": current_user.ai_queries_count
            }

    cp = req.chart_params
    chart = calculate_chart(cp.birth_date, cp.birth_time, cp.latitude, cp.longitude, cp.tz_offset, "P")
    sunrise_time = chart["metadata"]["sunrise_local"]
    day_res = determine_astrological_day(cp.birth_date, cp.birth_time, sunrise_time)
    matrix = calculate_thaksa_matrix(day_res["thaksa_num"])
    timeline = calculate_108_timeline(cp.birth_date, day_res["thaksa_num"], chart["planets_dict"])
    trinity = analyze_natal_chart(chart, matrix)
    aspect_dynamics = analyze_aspect_dynamics(chart, matrix)
    bazi = calculate_bazi(cp.birth_date, cp.birth_time, cp.latitude, cp.longitude, cp.tz_offset, "m")

    context = build_astrology_prompt_context(
        chart_data=chart,
        day_res=day_res,
        thaksa_matrix=matrix,
        timeline_data=timeline,
        trinity_data=trinity,
        bazi_data=bazi,
        aspect_dynamics=aspect_dynamics
    )

    chat_prompt = (
        f"{context}\n\n"
        f"คำถามจากเจ้าชะตา ({cp.name}): \"{req.question}\"\n\n"
        f"กรุณาตอบคำถามนี้โดยอิงจากตำแหน่งดาว พลวัตมุมสัมพันธ์ และสี่เสาชะตาชีวิตของเจ้าชะตา "
        f"เน้นความชัดเจนเชิงกลยุทธ์ ความเห็นอกเห็นใจ และแนวทางปฏิบัติที่สร้างความก้าวหน้า"
    )

    if current_user:
        current_user.ai_queries_count = (current_user.ai_queries_count or 0) + 1
        db.commit()

    ai_resp = call_ai_counselor_api(chat_prompt, api_key=req.api_key)
    if ai_resp.get("success") and ai_resp.get("text"):
        return {
            "success": True,
            "status": "success",
            "answer": ai_resp["text"],
            "source": ai_resp["provider"],
            "model": ai_resp.get("model"),
            "user_tier": current_user.subscription_tier if current_user else "guest",
            "ai_queries_count": current_user.ai_queries_count if current_user else 0
        }
    else:
        fallback = generate_structured_fallback_chat(req.question, chart, bazi)
        return {
            "success": True,
            "status": "success",
            "answer": fallback,
            "source": "deterministic_synthesis",
            "user_tier": current_user.subscription_tier if current_user else "guest",
            "ai_queries_count": current_user.ai_queries_count if current_user else 0
        }


# Mount frontend dist if exists
FRONTEND_DIST = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))
if os.path.exists(FRONTEND_DIST):
    app.mount("/", StaticFiles(directory=FRONTEND_DIST, html=True), name="frontend")
