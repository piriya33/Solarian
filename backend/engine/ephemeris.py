"""
Solarian Astrology Engine - High-Precision Ephemeris Module
Calculates celestial positions, Placidus houses, aspects, and sunrise/sunset using Swiss Ephemeris.
"""

from __future__ import annotations
import os
import math
from typing import Dict, List, Any, Tuple, Optional
from datetime import datetime, date, time, timedelta, timezone
import swisseph as swe

# Configure Ephemeris data path with robust discovery
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
POSSIBLE_EPHE_PATHS = [
    os.environ.get("EPHE_PATH"),
    os.path.abspath(os.path.join(CURRENT_DIR, "..", "..", "ephe")),
    os.path.abspath(os.path.join(CURRENT_DIR, "..", "ephe")),
    "/app/ephe",
    "./ephe",
    os.path.join(os.getcwd(), "ephe"),
    "/usr/share/swisseph",
    "/usr/local/share/swisseph"
]

ACTIVE_EPHE_PATH = None
for p in POSSIBLE_EPHE_PATHS:
    if p and os.path.exists(p) and os.path.isdir(p):
        ACTIVE_EPHE_PATH = p
        break

if ACTIVE_EPHE_PATH:
    swe.set_ephe_path(ACTIVE_EPHE_PATH)
    print(f"[Solarian] Swiss Ephemeris loaded from: {ACTIVE_EPHE_PATH}")
else:
    swe.set_ephe_path("/app/ephe:/usr/share/swisseph:./ephe")
    print("[Solarian] Swiss Ephemeris fallback path configured")

def ensure_ephe_configured():
    """Ensures ephe path is re-verified at request or startup time."""
    for p in POSSIBLE_EPHE_PATHS:
        if p and os.path.exists(p) and os.path.isdir(p):
            swe.set_ephe_path(p)
            return p
    return None

ZODIAC_SIGNS = [
    {"name": "Aries", "thai": "ราศีเมษ", "symbol": "♈", "element": "Fire", "modality": "Cardinal", "ruler": "Mars"},
    {"name": "Taurus", "thai": "ราศีพฤษภ", "symbol": "♉", "element": "Earth", "modality": "Fixed", "ruler": "Venus"},
    {"name": "Gemini", "thai": "ราศีเมถุน", "symbol": "♊", "element": "Air", "modality": "Mutable", "ruler": "Mercury"},
    {"name": "Cancer", "thai": "ราศีกรกฎ", "symbol": "♋", "element": "Water", "modality": "Cardinal", "ruler": "Moon"},
    {"name": "Leo", "thai": "ราศีสิงห์", "symbol": "♌", "element": "Fire", "modality": "Fixed", "ruler": "Sun"},
    {"name": "Virgo", "thai": "ราศีกันย์", "symbol": "♍", "element": "Earth", "modality": "Mutable", "ruler": "Mercury"},
    {"name": "Libra", "thai": "ราศีตุลย์", "symbol": "♎", "element": "Air", "modality": "Cardinal", "ruler": "Venus"},
    {"name": "Scorpio", "thai": "ราศีพิจิก", "symbol": "♏", "element": "Water", "modality": "Fixed", "ruler": "Mars"},
    {"name": "Sagittarius", "thai": "ราศีธนู", "symbol": "♐", "element": "Fire", "modality": "Mutable", "ruler": "Jupiter"},
    {"name": "Capricorn", "thai": "ราศีมังกร", "symbol": "♑", "element": "Earth", "modality": "Cardinal", "ruler": "Saturn"},
    {"name": "Aquarius", "thai": "ราศีกุมภ์", "symbol": "♒", "element": "Air", "modality": "Fixed", "ruler": "Saturn"},
    {"name": "Pisces", "thai": "ราศีมีน", "symbol": "♓", "element": "Water", "modality": "Mutable", "ruler": "Jupiter"}
]

PLANET_DEFS = [
    {"id": swe.SUN, "name": "Sun", "thai": "อาทิตย์", "symbol": "☉", "thaksa_num": 1, "is_core": True},
    {"id": swe.MOON, "name": "Moon", "thai": "จันทร์", "symbol": "☽", "thaksa_num": 2, "is_core": True},
    {"id": swe.MERCURY, "name": "Mercury", "thai": "พุธ", "symbol": "☿", "thaksa_num": 4, "is_core": True},
    {"id": swe.VENUS, "name": "Venus", "thai": "ศุกร์", "symbol": "♀", "thaksa_num": 6, "is_core": True},
    {"id": swe.MARS, "name": "Mars", "thai": "อังคาร", "symbol": "♂", "thaksa_num": 3, "is_core": True},
    {"id": swe.JUPITER, "name": "Jupiter", "thai": "พฤหัสบดี", "symbol": "♃", "thaksa_num": 5, "is_core": True},
    {"id": swe.SATURN, "name": "Saturn", "thai": "เสาร์", "symbol": "♄", "thaksa_num": 7, "is_core": True},
    {"id": swe.URANUS, "name": "Uranus", "thai": "มฤตยู", "symbol": "♅", "thaksa_num": 0, "is_core": False},
    {"id": swe.NEPTUNE, "name": "Neptune", "thai": "เนปจูน", "symbol": "♆", "thaksa_num": 0, "is_core": False},
    {"id": swe.PLUTO, "name": "Pluto", "thai": "พลูโต", "symbol": "♇", "thaksa_num": 0, "is_core": False},
    {"id": swe.TRUE_NODE, "name": "True Node", "thai": "ราหู (จริง)", "symbol": "☊", "thaksa_num": 8, "is_core": True},
    {"id": swe.MEAN_NODE, "name": "Mean Node", "thai": "ราหู (เฉลี่ย)", "symbol": "☊", "thaksa_num": 8, "is_core": False},
    {"id": swe.CHIRON, "name": "Chiron", "thai": "ไครอน", "symbol": "⚷", "thaksa_num": 0, "is_core": False}
]

ASPECT_DEFS = [
    {"name": "Conjunction", "thai": "กุม", "angle": 0.0, "orb": 10.0, "symbol": "☌", "nature": "major", "color": "#2563eb"},
    {"name": "Semi-Sextile", "thai": "โยคครึ่ง (30°)", "angle": 30.0, "orb": 2.0, "symbol": "⚺", "nature": "minor", "color": "#059669"},
    {"name": "Semi-Square", "thai": "ครึ่งฉาก (45°)", "angle": 45.0, "orb": 2.5, "symbol": "∠", "nature": "minor", "color": "#dc2626"},
    {"name": "Sextile", "thai": "โยคหน้า/หลัง (60°)", "angle": 60.0, "orb": 6.0, "symbol": "⚹", "nature": "major", "color": "#2563eb"},
    {"name": "Quintile", "thai": "ควินไทล์ (72°)", "angle": 72.0, "orb": 1.5, "symbol": "Q", "nature": "minor", "color": "#7c3aed"},
    {"name": "Square", "thai": "ฉาก (90°)", "angle": 90.0, "orb": 8.0, "symbol": "□", "nature": "major", "color": "#dc2626"},
    {"name": "Trine", "thai": "ตรีโกณ (120°)", "angle": 120.0, "orb": 8.0, "symbol": "△", "nature": "major", "color": "#2563eb"},
    {"name": "Sesquiquadrate", "thai": "ฉากครึ่ง (135°)", "angle": 135.0, "orb": 2.5, "symbol": "⚼", "nature": "minor", "color": "#dc2626"},
    {"name": "Bi-Quintile", "thai": "ไบคควินไทล์ (144°)", "angle": 144.0, "orb": 1.5, "symbol": "bQ", "nature": "minor", "color": "#7c3aed"},
    {"name": "Quincunx", "thai": "ควินคังซ์ (150°)", "angle": 150.0, "orb": 3.0, "symbol": "⚻", "nature": "minor", "color": "#16a34a"},
    {"name": "Opposition", "thai": "เล็ง (180°)", "angle": 180.0, "orb": 10.0, "symbol": "☍", "nature": "major", "color": "#dc2626"}
]


def deg_to_dms(deg: float) -> Tuple[int, int, int]:
    """Converts decimal degrees into (degrees, minutes, seconds)."""
    norm_deg = deg % 360.0
    sign_deg = norm_deg % 30.0
    d = int(sign_deg)
    rem_m = (sign_deg - d) * 60.0
    m = int(rem_m)
    s = int(round((rem_m - m) * 60.0))
    if s == 60:
        s = 0
        m += 1
    if m == 60:
        m = 0
        d += 1
    return d, m, s


def format_dms(deg: float, include_sign: bool = True) -> str:
    """Formats decimal degrees into AstroDienst standard string (e.g. 22°51'39")."""
    d, m, s = deg_to_dms(deg)
    sign_idx = int((deg % 360.0) / 30.0)
    sign = ZODIAC_SIGNS[sign_idx]["name"] if include_sign else ""
    if include_sign:
        return f"{sign} {d:2d}°{m:02d}'{s:02d}\""
    return f"{d:2d}°{m:02d}'{s:02d}\""


def format_coord_dms(deg: float, is_lat: bool = True) -> str:
    """Formats latitude or declination with N/S or longitude with E/W."""
    direction = "N" if deg >= 0 else "S"
    if not is_lat:
        direction = "E" if deg >= 0 else "W"
    abs_val = abs(deg)
    d = int(abs_val)
    rem_m = (abs_val - d) * 60.0
    m = int(rem_m)
    s = int(round((rem_m - m) * 60.0))
    if s == 60:
        s = 0
        m += 1
    if m == 60:
        m = 0
        d += 1
    return f"{d}°{m:02d}'{s:02d}\" {direction}"


def format_speed(speed: float) -> str:
    """Formats longitudinal speed into deg/min/sec per day."""
    sign = "-" if speed < 0 else ""
    abs_speed = abs(speed)
    d = int(abs_speed)
    rem_m = (abs_speed - d) * 60.0
    m = int(rem_m)
    s = int(round((rem_m - m) * 60.0))
    if s == 60:
        s = 0
        m += 1
    if m == 60:
        m = 0
        d += 1
    if d > 0:
        return f"{sign}{d}° {m:02d}' {s:02d}\""
    return f"{sign}{m}'{s:02d}\""


def get_house_for_lon(lon: float, cusps: List[float]) -> int:
    """Determines which house (1-12) a longitude falls into, based on Placidus cusps."""
    norm_lon = lon % 360.0
    for i in range(12):
        cusp_current = cusps[i] % 360.0
        cusp_next = cusps[(i + 1) % 12] % 360.0

        if cusp_next < cusp_current:
            # Passes 360/0 degree boundary
            if norm_lon >= cusp_current or norm_lon < cusp_next:
                return i + 1
        else:
            if cusp_current <= norm_lon < cusp_next:
                return i + 1
    return 1


def calculate_declination(lon: float, lat: float, eps: float = 23.44) -> float:
    """Calculates equatorial declination from ecliptic longitude and latitude."""
    rad_lon = math.radians(lon)
    rad_lat = math.radians(lat)
    rad_eps = math.radians(eps)
    sin_dec = math.sin(rad_lat) * math.cos(rad_eps) + math.cos(rad_lat) * math.sin(rad_eps) * math.sin(rad_lon)
    return math.degrees(math.asin(max(-1.0, min(1.0, sin_dec))))


def calculate_chart(
    birth_date: str,  # YYYY-MM-DD
    birth_time: str,  # HH:MM or HH:MM:SS
    latitude: float,
    longitude: float,
    tz_offset: float = 7.0,  # e.g. +7.0 for Bangkok
    house_system: str = "P"  # 'P' for Placidus
) -> Dict[str, Any]:
    """
    Computes full high-precision natal chart data.
    Matches AstroDienst / Swiss Ephemeris exact output.
    """
    # 1. Parse Date and Time
    date_parts = [int(x) for x in birth_date.split("-")]
    time_parts = [int(float(x)) for x in birth_time.split(":")]
    sec = time_parts[2] if len(time_parts) > 2 else 0

    local_dt = datetime(date_parts[0], date_parts[1], date_parts[2], time_parts[0], time_parts[1], sec)
    utc_dt = local_dt - timedelta(hours=tz_offset)

    year = utc_dt.year
    month = utc_dt.month
    day = utc_dt.day
    hour_utc = utc_dt.hour + utc_dt.minute / 60.0 + utc_dt.second / 3600.0

    # 2. Julian Day
    tjd_ut = swe.julday(year, month, day, hour_utc)
    deltat = swe.deltat(tjd_ut) * 86400.0  # in seconds
    tjd_tt = tjd_ut + deltat / 86400.0

    # 3. Sidereal Time
    sidereal_time_hours = swe.sidtime(tjd_ut) + (longitude / 15.0)
    sidereal_time_hours = sidereal_time_hours % 24.0
    st_h = int(sidereal_time_hours)
    st_m = int((sidereal_time_hours - st_h) * 60)
    st_s = int(round(((sidereal_time_hours - st_h) * 60 - st_m) * 60))
    if st_s == 60:
        st_s = 0
        st_m += 1
    if st_m == 60:
        st_m = 0
        st_h = (st_h + 1) % 24
    sidereal_time_str = f"{st_h:02d}:{st_m:02d}:{st_s:02d}"

    # 4. Placidus Houses & Angles
    house_byte = house_system.encode("ascii")
    cusps_raw, ascmc_raw = swe.houses(tjd_ut, latitude, longitude, house_byte)

    # Cusps list: index 0 is House 1, index 11 is House 12
    house_cusps = list(cusps_raw)

    ascendant_deg = ascmc_raw[0]
    mc_deg = ascmc_raw[1]
    descendant_deg = (ascendant_deg + 180.0) % 360.0
    ic_deg = (mc_deg + 180.0) % 360.0

    # House objects
    houses_data = []
    house_names_thai = [
        "ตนุ (House 1 - ตัวตน/ลัคนา)", "กดุมภะ (House 2 - การเงิน/ทรัพย์สิน)", "สหัสชะ (House 3 - เพื่อน/การติดต่อ)",
        "พันธุ (House 4 - ครอบครัว/รากฐาน)", "ปุตตะ (House 5 - บุตร/บริวาร/ความสุข)", "อริ (House 6 - อุปสรรค/สุขภาพ)",
        "ปัตนิ (House 7 - คู่ครอง/หุ้นส่วน)", "มรณะ (House 8 - การเปลี่ยนแปลง/มรดก)", "ศุภะ (House 9 - ความเจริญ/ปรัชญา)",
        "กัมมะ (House 10 - การงาน/สถานะ)", "ลาภะ (House 11 - โชคลาภ/มิตรภาพ)", "วินาศน์ (House 12 - สิ่งซ่อนเร้น/จิตวิญญาณ)"
    ]

    for i in range(12):
        c_deg = house_cusps[i]
        s_idx = int((c_deg % 360.0) / 30.0)
        d, m, s = deg_to_dms(c_deg)
        dec = calculate_declination(c_deg, 0.0)
        houses_data.append({
            "house": i + 1,
            "name_thai": house_names_thai[i],
            "longitude": c_deg,
            "sign": ZODIAC_SIGNS[s_idx]["name"],
            "sign_thai": ZODIAC_SIGNS[s_idx]["thai"],
            "sign_symbol": ZODIAC_SIGNS[s_idx]["symbol"],
            "sign_index": s_idx,
            "degrees": d,
            "minutes": m,
            "seconds": s,
            "formatted_dms": f"{ZODIAC_SIGNS[s_idx]['name']} {d:2d}°{m:02d}'{s:02d}\"",
            "declination": dec,
            "declination_str": format_coord_dms(dec, is_lat=True)
        })

    # Ensure ephemeris paths are active
    ensure_ephe_configured()

    # 5. Planetary Positions
    planets_data = []
    planets_dict = {}

    for p_def in PLANET_DEFS:
        p_id = p_def["id"]
        try:
            res, flags = swe.calc_ut(tjd_ut, p_id)
            res_eq, _ = swe.calc_ut(tjd_ut, p_id, swe.FLG_EQUATORIAL)
        except swe.Error as e:
            # Fallback to Moshier analytical ephemeris for planetary bodies, or skip optional asteroid
            try:
                res, flags = swe.calc_ut(tjd_ut, p_id, swe.FLG_MOSEPH | swe.FLG_SPEED)
                res_eq, _ = swe.calc_ut(tjd_ut, p_id, swe.FLG_MOSEPH | swe.FLG_EQUATORIAL)
            except Exception:
                # If an asteroid (like Chiron) requires external file not yet synced, skip gracefully
                print(f"[Solarian] Warning: unable to compute body {p_def['name']}: {e}")
                continue

        lon_p, lat_p, dist_p, speed_lon, speed_lat, speed_dist = res

        sign_idx = int((lon_p % 360.0) / 30.0)
        d, m, s = deg_to_dms(lon_p)
        house_num = get_house_for_lon(lon_p, house_cusps)

        dec_p = res_eq[1]

        p_obj = {
            "id": p_id,
            "name": p_def["name"],
            "thai": p_def["thai"],
            "symbol": p_def["symbol"],
            "thaksa_num": p_def["thaksa_num"],
            "is_core": p_def["is_core"],
            "longitude": lon_p,
            "latitude": lat_p,
            "latitude_str": format_coord_dms(lat_p, is_lat=True),
            "declination": dec_p,
            "declination_str": format_coord_dms(dec_p, is_lat=True),
            "distance_au": dist_p,
            "speed_lon": speed_lon,
            "speed_str": format_speed(speed_lon),
            "is_retrograde": speed_lon < 0,
            "sign": ZODIAC_SIGNS[sign_idx]["name"],
            "sign_thai": ZODIAC_SIGNS[sign_idx]["thai"],
            "sign_symbol": ZODIAC_SIGNS[sign_idx]["symbol"],
            "sign_index": sign_idx,
            "degrees": d,
            "minutes": m,
            "seconds": s,
            "formatted_dms": f"{d:2d}°{m:02d}'{s:02d}\"",
            "full_formatted": f"{ZODIAC_SIGNS[sign_idx]['name']} {d:2d}°{m:02d}'{s:02d}\"",
            "house": house_num
        }
        planets_data.append(p_obj)
        planets_dict[p_def["name"]] = p_obj

    # 6. Angles summary
    def make_angle_obj(name: str, thai: str, symbol: str, deg: float):
        s_idx = int((deg % 360.0) / 30.0)
        d, m, s = deg_to_dms(deg)
        dec = calculate_declination(deg, 0.0)
        return {
            "name": name,
            "thai": thai,
            "symbol": symbol,
            "longitude": deg,
            "sign": ZODIAC_SIGNS[s_idx]["name"],
            "sign_thai": ZODIAC_SIGNS[s_idx]["thai"],
            "sign_symbol": ZODIAC_SIGNS[s_idx]["symbol"],
            "sign_index": s_idx,
            "degrees": d,
            "minutes": m,
            "seconds": s,
            "formatted_dms": f"{ZODIAC_SIGNS[s_idx]['name']} {d:2d}°{m:02d}'{s:02d}\"",
            "declination": dec,
            "declination_str": format_coord_dms(dec, is_lat=True)
        }

    angles_data = {
        "Ascendant": make_angle_obj("Ascendant", "ลัคนา (AC)", "AC", ascendant_deg),
        "Midheaven": make_angle_obj("Midheaven", "เมอริเดียน (MC)", "MC", mc_deg),
        "Descendant": make_angle_obj("Descendant", "เดสเซนแดนท์ (DC)", "DC", descendant_deg),
        "ImumCoeli": make_angle_obj("Imum Coeli", "ไอซี (IC)", "IC", ic_deg)
    }

    # 7. Aspects Matrix
    # Include major planets, True Node, Chiron, AC, MC
    aspect_targets = [p for p in planets_data if p["name"] not in ["Mean Node"]]
    # Append AC and MC as aspect targets
    ac_pseudo = {
        "name": "Ascendant", "thai": "ลัคนา", "symbol": "AC", "longitude": ascendant_deg, "speed_lon": 360.0
    }
    mc_pseudo = {
        "name": "Midheaven", "thai": "MC", "symbol": "MC", "longitude": mc_deg, "speed_lon": 360.0
    }
    all_aspect_bodies = aspect_targets + [ac_pseudo, mc_pseudo]

    aspects_list = []
    n_bodies = len(all_aspect_bodies)

    for i in range(n_bodies):
        b1 = all_aspect_bodies[i]
        for j in range(i + 1, n_bodies):
            b2 = all_aspect_bodies[j]

            diff = abs(b1["longitude"] - b2["longitude"]) % 360.0
            if diff > 180.0:
                diff = 360.0 - diff

            for asp in ASPECT_DEFS:
                orb = abs(diff - asp["angle"])
                if orb <= asp["orb"]:
                    # Determine applying (a) or separating (s)
                    # Faster body approaching or moving away
                    v1 = b1.get("speed_lon", 0.0)
                    v2 = b2.get("speed_lon", 0.0)
                    rel_speed = v1 - v2
                    # Approximate applying vs separating
                    is_applying = True  # fallback
                    if b1["name"] not in ["Ascendant", "Midheaven"] and b2["name"] not in ["Ascendant", "Midheaven"]:
                        # check distance in 0.1 day
                        future_diff = abs((b1["longitude"] + v1 * 0.1) - (b2["longitude"] + v2 * 0.1)) % 360.0
                        if future_diff > 180.0:
                            future_diff = 360.0 - future_diff
                        future_orb = abs(future_diff - asp["angle"])
                        is_applying = future_orb < orb

                    orb_d = int(orb)
                    orb_m = int(round((orb - orb_d) * 60))
                    if orb_m == 60:
                        orb_d += 1
                        orb_m = 0

                    aspects_list.append({
                        "body1": b1["name"],
                        "body1_thai": b1["thai"],
                        "body1_symbol": b1["symbol"],
                        "body2": b2["name"],
                        "body2_thai": b2["thai"],
                        "body2_symbol": b2["symbol"],
                        "aspect_name": asp["name"],
                        "aspect_thai": asp["thai"],
                        "aspect_symbol": asp["symbol"],
                        "aspect_angle": asp["angle"],
                        "orb": orb,
                        "orb_str": f"{orb_d}°{orb_m:02d}'" + ("a" if is_applying else "s"),
                        "is_applying": is_applying,
                        "color": asp["color"]
                    })

    # 8. Astronomical Sunrise / Sunset calculation
    # Local midnight in UT
    local_midnight = datetime(date_parts[0], date_parts[1], date_parts[2], 0, 0, 0)
    utc_midnight = local_midnight - timedelta(hours=tz_offset)
    tjd_midnight = swe.julday(utc_midnight.year, utc_midnight.month, utc_midnight.day,
                              utc_midnight.hour + utc_midnight.minute / 60.0)

    # Sunrise
    res_rise, rise_tjd = swe.rise_trans(tjd_midnight, swe.SUN, geopos=(longitude, latitude, 0.0), rsmi=swe.CALC_RISE)
    sunrise_local = None
    sunrise_str = "06:00:00"
    if res_rise == 0:
        ry, rm, rd, rh = swe.revjul(rise_tjd[0])
        r_sec = int(round((rh % 1.0) * 3600))
        r_h = int(rh)
        r_m = r_sec // 60
        r_s = r_sec % 60
        rise_utc = datetime(ry, rm, rd, r_h, r_m, r_s, tzinfo=timezone.utc)
        sunrise_local = rise_utc + timedelta(hours=tz_offset)
        sunrise_str = sunrise_local.strftime("%H:%M:%S")

    # Sunset
    res_set, set_tjd = swe.rise_trans(tjd_midnight, swe.SUN, geopos=(longitude, latitude, 0.0), rsmi=swe.CALC_SET)
    sunset_local = None
    sunset_str = "18:00:00"
    if res_set == 0:
        sy, sm, sd, sh = swe.revjul(set_tjd[0])
        s_sec = int(round((sh % 1.0) * 3600))
        s_h = int(sh)
        s_m = s_sec // 60
        s_s = s_sec % 60
        set_utc = datetime(sy, sm, sd, s_h, s_m, s_s, tzinfo=timezone.utc)
        sunset_local = set_utc + timedelta(hours=tz_offset)
        sunset_str = sunset_local.strftime("%H:%M:%S")

    # Is birth after sunrise?
    birth_time_sec = time_parts[0] * 3600 + time_parts[1] * 60 + sec
    sunrise_sec = (sunrise_local.hour * 3600 + sunrise_local.minute * 60 + sunrise_local.second) if sunrise_local else 6 * 3600
    is_after_sunrise = birth_time_sec >= sunrise_sec

    return {
        "metadata": {
            "birth_date": birth_date,
            "birth_time": birth_time,
            "latitude": latitude,
            "longitude": longitude,
            "tz_offset": tz_offset,
            "julian_day_ut": tjd_ut,
            "julian_day_tt": tjd_tt,
            "delta_t_sec": deltat,
            "sidereal_time": sidereal_time_str,
            "sunrise_local": sunrise_str,
            "sunset_local": sunset_str,
            "is_after_sunrise": is_after_sunrise
        },
        "planets": planets_data,
        "planets_dict": planets_dict,
        "houses": houses_data,
        "angles": angles_data,
        "aspects": aspects_list
    }
