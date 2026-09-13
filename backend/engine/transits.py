"""
Solarian Astrology Engine - Transits Engine (ดาวจร & จุดกระทบ 108 ปี)
Calculates planetary transits, major transiting aspects to natal points,
and detects key astrological life milestones (Saturn Return, Jupiter Return, Uranus Opposition, etc.)
across all 108 years.
"""

from __future__ import annotations
from typing import Dict, List, Any, Optional
import math
from datetime import datetime, timedelta
from calendar import monthrange
import swisseph as swe

TRANSIT_BODIES = [
    {"id": swe.JUPITER, "name": "Jupiter", "thai": "พฤหัสบดี", "symbol": "♃", "color": "#f97316"},
    {"id": swe.SATURN, "name": "Saturn", "thai": "เสาร์", "symbol": "♄", "color": "#8b5cf6"},
    {"id": swe.URANUS, "name": "Uranus", "thai": "มฤตยู", "symbol": "♅", "color": "#06b6d4"},
    {"id": swe.NEPTUNE, "name": "Neptune", "thai": "เนปจูน", "symbol": "♆", "color": "#3b82f6"},
    {"id": swe.PLUTO, "name": "Pluto", "thai": "พลูโต", "symbol": "♇", "color": "#6366f1"},
    {"id": swe.TRUE_NODE, "name": "True Node", "thai": "ราหู", "symbol": "☊", "color": "#64748b"}
]

# Daily readings include fast-moving bodies without changing the annual-map contract.
DAILY_FAST_BODIES = [
    {"id": swe.SUN, "name": "Sun", "thai": "อาทิตย์", "symbol": "☉", "color": "#ef4444"},
    {"id": swe.MOON, "name": "Moon", "thai": "จันทร์", "symbol": "☽", "color": "#eab308"},
    {"id": swe.MERCURY, "name": "Mercury", "thai": "พุธ", "symbol": "☿", "color": "#22c55e"},
    {"id": swe.VENUS, "name": "Venus", "thai": "ศุกร์", "symbol": "♀", "color": "#06b6d4"},
    {"id": swe.MARS, "name": "Mars", "thai": "อังคาร", "symbol": "♂", "color": "#ec4899"},
]

TRANSIT_ASPECTS = [
    {"name": "Conjunction", "thai": "กุม / ทับ", "angle": 0.0, "orb": 4.0, "symbol": "☌", "nature": "intense"},
    {"name": "Opposition", "thai": "เล็ง", "angle": 180.0, "orb": 3.5, "symbol": "☍", "nature": "challenging"},
    {"name": "Square", "thai": "ฉาก", "angle": 90.0, "orb": 3.5, "symbol": "□", "nature": "challenging"},
    {"name": "Trine", "thai": "ตรีโกณ", "angle": 120.0, "orb": 3.5, "symbol": "△", "nature": "harmonious"},
    {"name": "Sextile", "thai": "โยค", "angle": 60.0, "orb": 3.0, "symbol": "⚹", "nature": "harmonious"}
]


def calculate_transits_for_date(
    date_str: str,  # YYYY-MM-DD
    time_utc_hours: float,
    natal_chart: Dict[str, Any],
    *,
    include_fast_bodies: bool = False,
) -> Dict[str, Any]:
    """
    Calculates transiting planet positions on a specific date and all active aspects to natal bodies.
    """
    dt = datetime.strptime(date_str, "%Y-%m-%d")
    tjd_ut = swe.julday(dt.year, dt.month, dt.day, time_utc_hours)

    natal_planets = natal_chart["planets_dict"]
    natal_asc = natal_chart["angles"]["Ascendant"]
    natal_mc = natal_chart["angles"]["Midheaven"]

    # Compile list of natal targets to test against
    natal_targets = [
        {"name": "Sun", "thai": "อาทิตย์เดิม", "symbol": "☉", "lon": natal_planets["Sun"]["longitude"]},
        {"name": "Moon", "thai": "จันทร์เดิม", "symbol": "☽", "lon": natal_planets["Moon"]["longitude"]},
        {"name": "Mercury", "thai": "พุธเดิม", "symbol": "☿", "lon": natal_planets["Mercury"]["longitude"]},
        {"name": "Venus", "thai": "ศุกร์เดิม", "symbol": "♀", "lon": natal_planets["Venus"]["longitude"]},
        {"name": "Mars", "thai": "อังคารเดิม", "symbol": "♂", "lon": natal_planets["Mars"]["longitude"]},
        {"name": "Jupiter", "thai": "พฤหัสเดิม", "symbol": "♃", "lon": natal_planets["Jupiter"]["longitude"]},
        {"name": "Saturn", "thai": "เสาร์เดิม", "symbol": "♄", "lon": natal_planets["Saturn"]["longitude"]},
        {"name": "Ascendant", "thai": "ลัคนาเดิม", "symbol": "AC", "lon": natal_asc["longitude"]},
        {"name": "Midheaven", "thai": "MCเดิม", "symbol": "MC", "lon": natal_mc["longitude"]}
    ]

    transit_positions = []
    active_transit_aspects = []

    bodies = DAILY_FAST_BODIES + TRANSIT_BODIES if include_fast_bodies else TRANSIT_BODIES
    for t_def in bodies:
        res, _ = swe.calc_ut(tjd_ut, t_def["id"])
        t_lon = res[0]
        t_speed = res[3]

        transit_positions.append({
            "name": t_def["name"],
            "thai": t_def["thai"],
            "symbol": t_def["symbol"],
            "color": t_def["color"],
            "longitude": t_lon,
            "speed": t_speed,
            "is_retrograde": t_speed < 0
        })

        # Check aspects to natal targets
        for n_target in natal_targets:
            diff = abs(t_lon - n_target["lon"]) % 360.0
            if diff > 180.0:
                diff = 360.0 - diff

            for asp in TRANSIT_ASPECTS:
                orb = abs(diff - asp["angle"])
                if orb <= asp["orb"]:
                    active_transit_aspects.append({
                        "transit_planet": t_def["name"],
                        "transit_thai": t_def["thai"],
                        "transit_symbol": t_def["symbol"],
                        "aspect_name": asp["name"],
                        "aspect_thai": asp["thai"],
                        "aspect_symbol": asp["symbol"],
                        "aspect_nature": asp["nature"],
                        "natal_target": n_target["name"],
                        "natal_thai": n_target["thai"],
                        "natal_symbol": n_target["symbol"],
                        "orb": round(orb, 2),
                        "description": generate_transit_description(t_def["name"], asp["name"], n_target["name"])
                    })

    # Detect Milestones
    milestones = detect_milestones(dt.year, natal_chart, transit_positions)

    return {
        "date": date_str,
        "transit_positions": transit_positions,
        "active_aspects": active_transit_aspects,
        "milestones": milestones
    }


def generate_transit_description(t_planet: str, aspect: str, n_target: str) -> str:
    """Provides clear, professional Thai interpretation of the transit impact."""
    # Saturn
    if t_planet == "Saturn":
        if aspect == "Conjunction" and n_target == "Saturn":
            return "เสาร์ทับเสาร์เดิม (Saturn Return): จุดเปลี่ยนสำคัญในการเติบโตเป็นผู้ใหญ่ รับผิดชอบสูงขึ้น วางรากฐานชีวิตระยะยาว"
        if aspect in ["Conjunction", "Opposition", "Square"] and n_target in ["Sun", "Ascendant"]:
            return f"ดาวเสาร์จร{aspect}ถึง{n_target}: ช่วงเวลาแห่งการทดสอบความอดทน ภาระหน้าที่หนักขึ้น ต้องมีวินัยและความสุขุม"
        if aspect in ["Conjunction", "Square", "Opposition"] and n_target == "Moon":
            return "ดาวเสาร์จรส่งผลต่อดวงจันทร์: สภาพจิตใจอาจรู้สึกกดดันหรือต้องการความสงบ ระวังความเครียดสะสม"
        if aspect in ["Trine", "Sextile"]:
            return f"ดาวเสาร์จรทำมุมดีกับ{n_target}: ความมั่นคง ประสบการณ์ตกผลึก ผู้ใหญ่ให้ความไว้วางใจ"

    # Jupiter
    if t_planet == "Jupiter":
        if aspect == "Conjunction" and n_target == "Jupiter":
            return "พฤหัสทับพฤหัสเดิม (Jupiter Return - ทุก 12 ปี): วงรอบใหม่แห่งโชคลาภ การขยายตัว โอกาสทางความรู้และการงาน"
        if aspect in ["Conjunction", "Trine", "Sextile"] and n_target in ["Sun", "Ascendant"]:
            return f"ดาวพฤหัสจรส่งกระแสดีถึง{n_target}: โชคลาภเปิดกว้าง สติปัญญาแจ่มใส มีผู้ใหญ่อุปถัมภ์ โอกาสทอง"
        if aspect in ["Conjunction", "Trine"] and n_target == "Moon":
            return "ดาวพฤหัสส่งกระแสดีถึงดวงจันทร์: ความสุขสงบทางอารมณ์ ความอบอุ่นในครอบครัว ความราบรื่น"

    # Uranus
    if t_planet == "Uranus":
        if aspect == "Opposition" and n_target == "Uranus":
            return "มฤตยูเล็งมฤตยูเดิม (Uranus Opposition / Midlife Transition): การปลดแอก ต้องการอิสรภาพ เปลี่ยนมุมมองชีวิตครั้งใหญ่"
        if aspect in ["Conjunction", "Opposition", "Square"]:
            return f"มฤตยูจรส่งกระแสมุมแรงถึง{n_target}: การเปลี่ยนแปลงฉับพลัน ความคิดสร้างสรรค์นอกกรอบ สิ่งไม่คาดคิด"

    # Pluto
    if t_planet == "Pluto":
        return f"ดาวพลูโตจรทำมุม {aspect} กับ {n_target}: การเปลี่ยนผ่านในระดับรากฐาน การสลัดสิ่งเก่าเพื่อเริ่มต้นสิ่งใหม่อย่างทรงพลัง"

    # True Node (Rahu)
    if t_planet == "True Node":
        if aspect == "Conjunction" and n_target in ["Ascendant", "Sun"]:
            return f"พระราหูจรทับ{n_target}: ความทะเยอทะยานสูงขึ้น โฟกัสเรื่องชื่อเสียง การขยายขอบเขต แต่ต้องมีสติรอบคอบ"
        if aspect == "Opposition" and n_target in ["Ascendant", "Sun"]:
            return f"พระราหูจรเล็ง{n_target}: การปรับสมดุลเรื่องคู่ครอง หุ้นส่วน และความสัมพันธ์กับคนรอบข้าง"

    return f"ดาวจร {t_planet} ทำมุม {aspect} กับ {n_target}"


def detect_milestones(current_year: int, natal_chart: Dict[str, Any], transits: List[Dict[str, Any]]) -> List[Dict[str, str]]:
    """Detects life milestones based on planetary cycles."""
    milestones = []
    # Calculate approx age
    b_date = natal_chart["metadata"]["birth_date"]
    b_year = int(b_date.split("-")[0])
    age = current_year - b_year

    if 28 <= age <= 30:
        milestones.append({
            "title": "First Saturn Return (อายุ ~29.5 ปี)",
            "category": "major_milestone",
            "desc": "ก้าวข้ามสู่การเป็นผู้ใหญ่เต็มตัว บททดสอบความรับผิดชอบและการสร้างความมั่นคงที่แท้จริง"
        })
    elif 58 <= age <= 60:
        milestones.append({
            "title": "Second Saturn Return (อายุ ~59 ปี)",
            "category": "major_milestone",
            "desc": "การตกผลึกของความสำเร็จ วางแผนการส่งต่อมรดกทางปัญญาและวิถีชีวิตวัยเกษียณ"
        })

    if age > 0 and age % 12 == 0:
        milestones.append({
            "title": f"Jupiter Return รอบที่ {age // 12} (อายุ {age} ปี)",
            "category": "growth_cycle",
            "desc": "ครบวงรอบดาวพฤหัสบดี 12 ปี การเปิดประตูบานใหม่ โอกาส การศึกษา และการขยายขอบเขตชีวิต"
        })

    if 40 <= age <= 44:
        milestones.append({
            "title": "Uranus Opposition (ช่วงวัย 40-44 ปี)",
            "category": "breakthrough",
            "desc": "จุดเปลี่ยนผ่านวัยกลางคน การตระหนักรู้อิสรภาพและค้นพบตัวตนที่แท้จริง"
        })

    if 49 <= age <= 51:
        milestones.append({
            "title": "Chiron Return (อายุ ~50 ปี)",
            "category": "healing",
            "desc": "การเยียวยาปมบาดแผลในอดีต การยอมรับตนเองอย่างลึกซึ้ง และการกลายเป็นผู้ชี้แนะผู้อื่น"
        })

    return milestones


def build_108_transits_map(
    natal_chart: Dict[str, Any],
    sample_every_years: int = 1
) -> List[Dict[str, Any]]:
    """
    Computes transits and major hits for every year of the 108-year timeline.
    """
    b_date = natal_chart["metadata"]["birth_date"]
    b_time = natal_chart["metadata"]["birth_time"]
    b_dt = datetime.strptime(b_date, "%Y-%m-%d")
    tz_offset = natal_chart["metadata"]["tz_offset"]

    time_parts = [int(float(x)) for x in b_time.split(":")]
    utc_hours = (time_parts[0] + time_parts[1] / 60.0) - tz_offset

    annual_transits = []

    for age in range(0, 109, sample_every_years):
        t_year = b_dt.year + age
        # Annual birthday sampling uses the last day of February when Feb 29
        # does not exist. The returned target_date exposes this convention.
        target_day = min(b_dt.day, monthrange(t_year, b_dt.month)[1])
        target_date_str = f"{t_year:04d}-{b_dt.month:02d}-{target_day:02d}"

        t_res = calculate_transits_for_date(target_date_str, utc_hours, natal_chart)

        annual_transits.append({
            "age": age,
            "calendar_year": t_year,
            "target_date": target_date_str,
            "active_aspects": t_res["active_aspects"],
            "milestones": t_res["milestones"],
            "impact_level": "high" if len(t_res["milestones"]) > 0 or any(a["aspect_nature"] in ["intense", "challenging"] for a in t_res["active_aspects"]) else "normal"
        })

    return annual_transits
