"""
Solarian Astrology Engine - Maha Thaksa 108-Year Engine (มหาทักษาพยากรณ์)
Calculates astrological day of birth (with sunrise cutoff), Thaksa attributes,
Major planetary ruling periods (ดาวเสวยอายุ), and Sub-periods (ดาวแทรกอายุ) across 108 years.
"""

from __future__ import annotations
from typing import Dict, List, Any, Tuple, Optional
from datetime import datetime, date, timedelta

# Thaksa Sequence (Circular Order)
# 1: อาทิตย์, 2: จันทร์, 3: อังคาร, 4: พุธ, 7: เสาร์, 5: พฤหัสบดี, 8: ราหู, 6: ศุกร์
THAKSA_ORDER = [1, 2, 3, 4, 7, 5, 8, 6]

PLANET_INFO = {
    1: {"name": "Sun", "thai": "อาทิตย์", "symbol": "☉", "period_years": 6, "element": "ไฟ", "color": "#ef4444", "day_name": "วันอาทิตย์"},
    2: {"name": "Moon", "thai": "จันทร์", "symbol": "☽", "period_years": 15, "element": "ดิน", "color": "#eab308", "day_name": "วันจันทร์"},
    3: {"name": "Mars", "thai": "อังคาร", "symbol": "♂", "period_years": 8, "element": "ลม", "color": "#ec4899", "day_name": "วันอังคาร"},
    4: {"name": "Mercury", "thai": "พุธ", "symbol": "☿", "period_years": 17, "element": "น้ำ", "color": "#22c55e", "day_name": "วันพุธ (กลางวัน)"},
    7: {"name": "Saturn", "thai": "เสาร์", "symbol": "♄", "period_years": 10, "element": "ไฟ", "color": "#8b5cf6", "day_name": "วันเสาร์"},
    5: {"name": "Jupiter", "thai": "พฤหัสบดี", "symbol": "♃", "period_years": 19, "element": "ดิน", "color": "#f97316", "day_name": "วันพฤหัสบดี"},
    8: {"name": "Rahu", "thai": "ราหู", "symbol": "☊", "period_years": 12, "element": "ลม", "color": "#171717", "day_name": "วันพุธกลางคืน (ราหู)"},
    6: {"name": "Venus", "thai": "ศุกร์", "symbol": "♀", "period_years": 21, "element": "น้ำ", "color": "#06b6d4", "day_name": "วันศุกร์"}
}

THAKSA_ROLES = [
    {"key": "barivari", "thai": "บริวาร", "desc": "คนรอบข้าง บุตร บริวาร ผู้ใต้บังคับบัญชา ผู้สนับสนุน"},
    {"key": "ayu", "thai": "อายุ", "desc": "สุขภาพ ร่างกาย ความเป็นอยู่ กำลังวังชา พลานามัย"},
    {"key": "dech", "thai": "เดช", "desc": "อำนาจบารมี ชัยชนะ เกียรติยศ ชื่อเสียง ความหนักแน่น"},
    {"key": "sri", "thai": "ศรี", "desc": "สิริมงคล โชคลาภ ทรัพย์สิน เสน่ห์ ความเจริญรุ่งเรือง"},
    {"key": "mula", "thai": "มูละ", "desc": "หลักทรัพย์ ฐานะ มรดก หลักแหล่ง ความมั่นคง ที่อยู่อาศัย"},
    {"key": "utsaha", "thai": "อุตสาหะ", "desc": "ความขยันหมั่นเพียร การงาน การลงแรง ความคิดริเริ่ม"},
    {"key": "montri", "thai": "มนตรี", "desc": "ผู้อุปถัมภ์ค้ำชู ที่ปรึกษา ผู้ใหญ่ให้ความเมตตา ความช่วยเหลือ"},
    {"key": "kalakini", "thai": "กาลกิณี", "desc": "อุปสรรค จุดบกพร่อง ความขัดแย้ง สิ่งที่ต้องระมัดระวัง"}
]


CIVIL_DAY_NAMES = {
    0: "วันจันทร์",
    1: "วันอังคาร",
    2: "วันพุธ",
    3: "วันพฤหัสบดี",
    4: "วันศุกร์",
    5: "วันเสาร์",
    6: "วันอาทิตย์",
}


def determine_astrological_day(
    birth_date: str,
    birth_time: str,
    sunrise_time: str = "06:00:00",
    sunset_time: str = "18:00:00"
) -> Dict[str, Any]:
    """
    Determines the astrological birth day accounting for the sunrise & sunset cutoff rules:
    - Traditional Thai astrology changes the day at Sunrise (พระอาทิตย์ขึ้น), not midnight (00:00).
    - If birth_time < sunrise_time: The day shifts back to the previous day.
      * If previous day was Wednesday: Wednesday night (sunset on Wed to sunrise on Thu) is พระราหู (๘ / วันพุธกลางคืน).
      * If previous day was Sun(1), Mon(2), Tue(3), Thu(5), Fri(6), Sat(7).
    - If birth_time >= sunrise_time: The day is on the civil birth date.
      * If birth_date is Wednesday:
        - birth_time < sunset_time: วันพุธกลางวัน (พระพุธ ๔)
        - birth_time >= sunset_time: วันพุธกลางคืน (พระราหู ๘)
      * If other days: Sun(1), Mon(2), Tue(3), Thu(5), Fri(6), Sat(7).
    """
    dt_birth = datetime.strptime(f"{birth_date} {birth_time[:5]}", "%Y-%m-%d %H:%M")
    dt_sunrise = datetime.strptime(f"{birth_date} {sunrise_time[:5]}", "%Y-%m-%d %H:%M")
    dt_sunset = datetime.strptime(f"{birth_date} {sunset_time[:5]}", "%Y-%m-%d %H:%M")

    cal_weekday = dt_birth.weekday()  # Monday=0, Sunday=6
    is_before_sunrise = dt_birth < dt_sunrise

    # Map Python weekday (0=Mon...6=Sun) to Thai Thaksa number:
    weekday_to_thaksa = {
        0: 2,  # Monday
        1: 3,  # Tuesday
        2: 4,  # Wednesday (Daytime)
        3: 5,  # Thursday
        4: 6,  # Friday
        5: 7,  # Saturday
        6: 1   # Sunday
    }

    if is_before_sunrise:
        # Before sunrise: Belong to previous civil day!
        prev_dt = dt_birth - timedelta(days=1)
        prev_weekday = prev_dt.weekday()
        effective_date = prev_dt.strftime("%Y-%m-%d")

        if prev_weekday == 2:
            # Civil date is Thursday, but born before sunrise -> Born during Wednesday night (Rahu 8)!
            thaksa_num = 8
            is_rahu_night = True
            reason = (
                f"เกิดเช้าตรู่วันพฤหัสบดี ({birth_time[:5]} น.) ก่อนเวลาพระอาทิตย์ขึ้น ({sunrise_time[:5]} น.) "
                f"ตามหลักโหราศาสตร์ไทยจึงนับเป็นช่วงคืนวันพุธหลังพระอาทิตย์ตก จัดเป็น 'วันพุธกลางคืน (พระราหู ๘)'"
            )
        else:
            thaksa_num = weekday_to_thaksa[prev_weekday]
            is_rahu_night = False
            civil_day = CIVIL_DAY_NAMES[cal_weekday]
            prev_day_name = PLANET_INFO[thaksa_num]["day_name"]
            reason = (
                f"เกิดเช้าตรู่{civil_day} ({birth_time[:5]} น.) ก่อนเวลาพระอาทิตย์ขึ้น ({sunrise_time[:5]} น.) "
                f"ตามหลักโหราศาสตร์ไทยวันใหม่จะเริ่มเมื่อพระอาทิตย์ขึ้น จึงนับเป็น '{prev_day_name}'"
            )
    else:
        # After sunrise: Belongs to current civil day
        effective_date = birth_date
        civil_day = CIVIL_DAY_NAMES[cal_weekday]

        if cal_weekday == 2:
            # Wednesday: check sunset cutoff
            if dt_birth >= dt_sunset:
                thaksa_num = 8  # Wednesday night / Rahu
                is_rahu_night = True
                reason = (
                    f"เกิดวันพุธ ({birth_time[:5]} น.) หลังเวลาพระอาทิตย์ตก ({sunset_time[:5]} น.) "
                    f"ตามหลักโหราศาสตร์ไทยจัดเป็น 'วันพุธกลางคืน (พระราหู ๘)'"
                )
            else:
                thaksa_num = 4  # Wednesday daytime / Mercury
                is_rahu_night = False
                reason = (
                    f"เกิดวันพุธ ({birth_time[:5]} น.) ระหว่างพระอาทิตย์ขึ้น ({sunrise_time[:5]} น.) "
                    f"ถึงพระอาทิตย์ตก ({sunset_time[:5]} น.) จัดเป็น 'วันพุธกลางวัน (พระพุธ ๔)'"
                )
        else:
            thaksa_num = weekday_to_thaksa[cal_weekday]
            is_rahu_night = False
            astro_day = PLANET_INFO[thaksa_num]["day_name"]
            reason = (
                f"เกิด{civil_day} ({birth_time[:5]} น.) หลังเวลาพระอาทิตย์ขึ้น ({sunrise_time[:5]} น.) "
                f"จึงนับเป็น '{astro_day}'"
            )

    p_info = PLANET_INFO[thaksa_num]

    return {
        "thaksa_num": thaksa_num,
        "planet_name": p_info["name"],
        "planet_thai": p_info["thai"],
        "day_name": p_info["day_name"],
        "astro_day_thai": p_info["day_name"],
        "civil_weekday_thai": CIVIL_DAY_NAMES[cal_weekday],
        "civil_date": birth_date,
        "effective_date": effective_date,
        "period_years": p_info["period_years"],
        "is_before_sunrise": is_before_sunrise,
        "is_rahu_night": is_rahu_night,
        "sunrise_time": sunrise_time[:5],
        "sunset_time": sunset_time[:5],
        "reason": reason
    }


def calculate_thaksa_matrix(birth_thaksa_num: int) -> List[Dict[str, Any]]:
    """
    Computes the 8 Thaksa roles (บริวาร to กาลกิณี) for the birth day ruler.
    """
    start_idx = THAKSA_ORDER.index(birth_thaksa_num)
    matrix = []

    for i in range(8):
        current_idx = (start_idx + i) % 8
        p_num = THAKSA_ORDER[current_idx]
        p_info = PLANET_INFO[p_num]
        role = THAKSA_ROLES[i]

        matrix.append({
            "role_key": role["key"],
            "role_thai": role["thai"],
            "role_desc": role["desc"],
            "planet_num": p_num,
            "planet_name": p_info["name"],
            "planet_thai": p_info["thai"],
            "planet_symbol": p_info["symbol"],
            "planet_color": p_info["color"],
            "period_years": p_info["period_years"]
        })

    return matrix


def calculate_degree_triggers_30(
    natal_planets_dict: Dict[str, Any],
    angles_dict: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Calculates the 30-Degree Harmonic Progression Triggers (วิถีองศาดาวกระทบฐาน 30):
    Measures the distance in degrees that the Natal Sun must travel to reach each planet
    within a 30° zodiac sign boundary (modular arithmetic base 30).

    Now incorporates True Solar Arc Progression (อัตราความเร็วดวงอาทิตย์จริงตาม Ephemeris):
    Instead of assuming a static 1.0°/year, we calculate using the Sun's true natal velocity:
        sun_speed = Sun['speed_lon'] (typically ~0.95° to 1.02°/day = °/year)
        exact_age = (dist + cycle * 30.0) / sun_speed
        rounded_age = round(exact_age)
    """
    if not natal_planets_dict or "Sun" not in natal_planets_dict:
        return {"planet_triggers": [], "age_trigger_map": {}, "sun_speed": 1.0}

    sun_obj = natal_planets_dict["Sun"]
    sun_in_sign = sun_obj["longitude"] % 30.0
    # True solar velocity in degrees per day (equates to degrees per year under Solar Arc Progression)
    raw_sun_speed = sun_obj.get("speed_lon")
    sun_speed = float(raw_sun_speed) if raw_sun_speed and float(raw_sun_speed) > 0.1 else 1.0

    # Collect planetary bodies to trace
    tracked_planets = [
        "Moon", "Mercury", "Venus", "Mars", "Jupiter",
        "Saturn", "Uranus", "Neptune", "Pluto", "True Node", "Chiron"
    ]

    planet_triggers = []
    age_trigger_map: Dict[int, List[Dict[str, Any]]] = {age: [] for age in range(109)}

    for p_name in tracked_planets:
        p_obj = natal_planets_dict.get(p_name)
        if not p_obj:
            continue

        p_in_sign = p_obj["longitude"] % 30.0
        dist = (p_in_sign - sun_in_sign) % 30.0
        if dist == 0.0:
            dist = 30.0

        # Calculate exact fractional month & day using True Solar Arc speed
        years_dist = dist / sun_speed
        months_total = years_dist * 12.0
        m_part = int(months_total) % 12
        d_part = int(round((months_total - int(months_total)) * 30.0))
        if d_part >= 30:
            m_part += 1
            d_part = 0

        # Color map fallback
        p_color = p_obj.get("color")
        if not p_color:
            p_color = PLANET_INFO.get(p_obj.get("thaksa_num", 0), {}).get("color", "#6366f1")

        trigger_data = {
            "planet_name": p_name,
            "planet_thai": p_obj.get("thai", p_name),
            "planet_symbol": p_obj.get("symbol", "★"),
            "planet_color": p_color,
            "sign_thai": p_obj.get("sign_thai", ""),
            "formatted_dms": p_obj.get("formatted_dms", ""),
            "in_sign_degree": round(p_in_sign, 2),
            "distance_deg": round(dist, 2),
            "sun_speed": round(sun_speed, 4),
            "timing_detail": f"{int(years_dist)} ปี {m_part} เดือน" if m_part > 0 else f"{int(years_dist)} ปี",
            "impact_ages": []
        }

        # Generate recurring ages in 30-year harmonic cycles up to 108 years using True Solar Arc
        for cycle in range(4):
            cycle_distance = dist + (cycle * 30.0)
            exact_age = cycle_distance / sun_speed
            rounded_age = int(round(exact_age))
            if rounded_age <= 108:
                trigger_data["impact_ages"].append({
                    "exact_age": round(exact_age, 2),
                    "rounded_age": rounded_age,
                    "cycle_num": cycle + 1,
                    "age_desc": f"วัย {rounded_age} ปี (รอบที่ {cycle + 1})"
                })

                # Register in age_trigger_map
                age_trigger_map[rounded_age].append({
                    "planet_name": p_name,
                    "planet_thai": p_obj.get("thai", p_name),
                    "planet_symbol": p_obj.get("symbol", "★"),
                    "planet_color": p_color,
                    "distance_deg": round(dist, 2),
                    "exact_age": round(exact_age, 2),
                    "sun_speed": round(sun_speed, 4),
                    "cycle_num": cycle + 1,
                    "timing_str": f"อายุ {rounded_age} ปี ({exact_age:.2f} ปี - รอบที่ {cycle + 1})"
                })

        planet_triggers.append(trigger_data)

    # Sort triggers by distance
    planet_triggers.sort(key=lambda x: x["distance_deg"])

    return {
        "sun_in_sign_deg": round(sun_in_sign, 2),
        "sun_speed": round(sun_speed, 4),
        "planet_triggers": planet_triggers,
        "age_trigger_map": age_trigger_map
    }


def calculate_108_timeline(
    birth_date: str,
    birth_thaksa_num: int,
    natal_planets_dict: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Generates the complete 108-year lifecycle map:
    - 8 Major periods (ดาวเสวยอายุ) in sequence
    - Sub-periods (ดาวแทรกอายุ) within each major period using exact proportional formula:
        sub_years = (major_years * sub_planet_years) / 108
    - 30-Degree Harmonic Triggers (วิถีองศาดาวกระทบฐาน 30) from Natal Sun to planets
    - Year-by-year inspection data (Age 0 to 108) with ruling planet, sub-planet, degree triggers, and life themes.
    """
    start_idx = THAKSA_ORDER.index(birth_thaksa_num)
    birth_dt = datetime.strptime(birth_date, "%Y-%m-%d")

    major_periods = []
    current_age = 0.0
    current_date = birth_dt

    # 1. Build Major Periods & Sub-periods
    for i in range(8):
        m_idx = (start_idx + i) % 8
        m_num = THAKSA_ORDER[m_idx]
        m_info = PLANET_INFO[m_num]
        m_duration = m_info["period_years"]

        start_major_age = current_age
        end_major_age = current_age + m_duration
        start_major_date = current_date
        end_major_date = current_date + timedelta(days=int(round(m_duration * 365.25)))

        # Sub-periods (แทรก)
        sub_periods = []
        sub_start_age = start_major_age
        sub_start_date = start_major_date

        for j in range(8):
            s_idx = (m_idx + j) % 8
            s_num = THAKSA_ORDER[s_idx]
            s_info = PLANET_INFO[s_num]

            # Exact proportional formula: (L_M * L_S) / 108 years
            s_duration = (m_duration * s_info["period_years"]) / 108.0
            sub_end_age = sub_start_age + s_duration
            sub_days = int(round(s_duration * 365.25))
            sub_end_date = sub_start_date + timedelta(days=sub_days)

            # Months & days
            tot_months = s_duration * 12.0
            m_part = int(tot_months)
            d_part = int(round((tot_months - m_part) * 30.0))
            if d_part == 30:
                m_part += 1
                d_part = 0
            duration_str = f"{m_part} เดือน {d_part} วัน" if m_part > 0 else f"{d_part} วัน"
            if s_duration >= 1.0:
                y_part = int(s_duration)
                rem_m = int(round((s_duration - y_part) * 12.0))
                duration_str = f"{y_part} ปี {rem_m} เดือน" if rem_m > 0 else f"{y_part} ปี"

            sub_periods.append({
                "sub_index": j + 1,
                "planet_num": s_num,
                "planet_name": s_info["name"],
                "planet_thai": s_info["thai"],
                "planet_symbol": s_info["symbol"],
                "planet_color": s_info["color"],
                "duration_years": round(s_duration, 4),
                "duration_str": duration_str,
                "start_age": round(sub_start_age, 2),
                "end_age": round(sub_end_age, 2),
                "start_date": sub_start_date.strftime("%Y-%m-%d"),
                "end_date": sub_end_date.strftime("%Y-%m-%d")
            })

            sub_start_age = sub_end_age
            sub_start_date = sub_end_date

        major_periods.append({
            "period_index": i + 1,
            "planet_num": m_num,
            "planet_name": m_info["name"],
            "planet_thai": m_info["thai"],
            "planet_symbol": m_info["symbol"],
            "planet_color": m_info["color"],
            "duration_years": m_duration,
            "start_age": round(start_major_age, 2),
            "end_age": round(end_major_age, 2),
            "start_date": start_major_date.strftime("%Y-%m-%d"),
            "end_date": end_major_date.strftime("%Y-%m-%d"),
            "sub_periods": sub_periods
        })

        current_age = end_major_age
        current_date = end_major_date

    # 2. Compute 30-Degree Harmonic Triggers from Natal Sun
    degree_triggers_info = {}
    if natal_planets_dict:
        degree_triggers_info = calculate_degree_triggers_30(natal_planets_dict)
    age_triggers_map = degree_triggers_info.get("age_trigger_map", {})

    # 3. Build Year-by-Year Map (Age 0 to 108)
    years_map = []
    for age in range(109):
        # Find which major period and sub-period covers this age
        matched_major = None
        matched_sub = None

        for mp in major_periods:
            if mp["start_age"] <= age < mp["end_age"] or (age == 108 and mp["end_age"] == 108):
                matched_major = mp
                for sp in mp["sub_periods"]:
                    if sp["start_age"] <= age < sp["end_age"] or (age == 108 and sp["end_age"] == 108):
                        matched_sub = sp
                        break
                if not matched_sub and mp["sub_periods"]:
                    matched_sub = mp["sub_periods"][-1]
                break

        if not matched_major:
            matched_major = major_periods[-1]
            matched_sub = matched_major["sub_periods"][-1]

        # Calculate annual Thaksa (ทักษาจร):
        # อายุย่าง = age + 1
        age_yang = age + 1
        # Shift in Thaksa order
        annual_thaksa_idx = (start_idx + (age_yang - 1)) % 8
        annual_thaksa_num = THAKSA_ORDER[annual_thaksa_idx]
        annual_thaksa_info = PLANET_INFO[annual_thaksa_num]

        cal_year = birth_dt.year + age

        # 30-degree triggers hitting this exact year
        hits_this_year = age_triggers_map.get(age, [])

        years_map.append({
            "age": age,
            "age_yang": age_yang,
            "calendar_year": cal_year,
            "major_planet": {
                "num": matched_major["planet_num"],
                "name": matched_major["planet_name"],
                "thai": matched_major["planet_thai"],
                "symbol": matched_major["planet_symbol"],
                "color": matched_major["planet_color"]
            },
            "sub_planet": {
                "num": matched_sub["planet_num"],
                "name": matched_sub["planet_name"],
                "thai": matched_sub["planet_thai"],
                "symbol": matched_sub["planet_symbol"],
                "color": matched_sub["planet_color"]
            },
            "annual_thaksa": {
                "num": annual_thaksa_num,
                "name": annual_thaksa_info["name"],
                "thai": annual_thaksa_info["thai"],
                "symbol": annual_thaksa_info["symbol"]
            },
            "sub_duration_str": matched_sub["duration_str"],
            "major_duration_years": matched_major["duration_years"],
            "degree_triggers": hits_this_year
        })

    return {
        "birth_day_ruler": PLANET_INFO[birth_thaksa_num],
        "total_cycle_years": 108,
        "major_periods": major_periods,
        "degree_triggers_catalog": degree_triggers_info.get("planet_triggers", []),
        "sun_in_sign_deg": degree_triggers_info.get("sun_in_sign_deg", 0.0),
        "sun_speed": degree_triggers_info.get("sun_speed", 1.0),
        "years_map": years_map
    }


def get_astrology_reference_tables() -> Dict[str, Any]:
    """Returns standardized reference tables for Zodiac signs, Thai planetary pairs, and Thaksa roles."""
    from backend.engine.reference_data import get_all_reference_tables
    return get_all_reference_tables()

