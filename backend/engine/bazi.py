"""
Solarian Bazi (Four Pillars of Destiny / 八字) Engine.
Computes True Solar Time, Sexagenary Cycle, 24 Solar Terms (節氣),
Hidden Stems (藏干), Five Elements (五行) Balance, Ten Gods (十神),
and Da Yun (大運) 10-Year Luck Pillars using Swiss Ephemeris JPL DE431.
"""

import math
from typing import Dict, Any, List, Tuple
import swisseph as swe

# 10 Heavenly Stems (天干)
STEMS = [
    {"chinese": "甲", "pinyin": "Jiǎ", "thai": "เจี่ย (ไม้หยาง)", "element": "Wood", "polarity": "Yang", "color": "#10b981"},
    {"chinese": "乙", "pinyin": "Yǐ", "thai": "อี่ (ไม้หยิน)", "element": "Wood", "polarity": "Yin", "color": "#34d399"},
    {"chinese": "丙", "pinyin": "Bǐng", "thai": "เปี้ย (ไฟหยาง)", "element": "Fire", "polarity": "Yang", "color": "#ef4444"},
    {"chinese": "丁", "pinyin": "Dīng", "thai": "เต็ง (ไฟหยิน)", "element": "Fire", "polarity": "Yin", "color": "#f87171"},
    {"chinese": "戊", "pinyin": "Wù", "thai": "โบ่ว (ดินหยาง)", "element": "Earth", "polarity": "Yang", "color": "#d97706"},
    {"chinese": "己", "pinyin": "Jǐ", "thai": "กี้ (ดินหยิน)", "element": "Earth", "polarity": "Yin", "color": "#f59e0b"},
    {"chinese": "庚", "pinyin": "Gēng", "thai": "แก (ทองหยาง)", "element": "Metal", "polarity": "Yang", "color": "#94a3b8"},
    {"chinese": "辛", "pinyin": "Xīn", "thai": "ซิน (ทองหยิน)", "element": "Metal", "polarity": "Yin", "color": "#cbd5e1"},
    {"chinese": "壬", "pinyin": "Rén", "thai": "หยิม (น้ำหยาง)", "element": "Water", "polarity": "Yang", "color": "#0284c7"},
    {"chinese": "癸", "pinyin": "Guǐ", "thai": "กุ่ย (น้ำหยิน)", "element": "Water", "polarity": "Yin", "color": "#38bdf8"},
]

# 12 Earthly Branches (地支)
BRANCHES = [
    {"chinese": "子", "pinyin": "Zǐ", "thai": "จื่อ (ชวด)", "animal": "Rat", "element": "Water", "polarity": "Yin", "hidden": ["癸"]},
    {"chinese": "丑", "pinyin": "Chǒu", "thai": "ทิ่ว (ฉลู)", "animal": "Ox", "element": "Earth", "polarity": "Yin", "hidden": ["己", "癸", "辛"]},
    {"chinese": "寅", "pinyin": "Yín", "thai": "เอี้ยง (ขาล)", "animal": "Tiger", "element": "Wood", "polarity": "Yang", "hidden": ["甲", "丙", "戊"]},
    {"chinese": "卯", "pinyin": "Mǎo", "thai": "เบ้า (เถาะ)", "animal": "Rabbit", "element": "Wood", "polarity": "Yin", "hidden": ["乙"]},
    {"chinese": "辰", "pinyin": "Chén", "thai": "ซิ้ง (มะโรง)", "animal": "Dragon", "element": "Earth", "polarity": "Yang", "hidden": ["戊", "乙", "癸"]},
    {"chinese": "巳", "pinyin": "Sì", "thai": "จี๋ (มะเส็ง)", "animal": "Snake", "element": "Fire", "polarity": "Yin", "hidden": ["丙", "庚", "戊"]},
    {"chinese": "午", "pinyin": "Wǔ", "thai": "โง่ว (มะเมีย)", "animal": "Horse", "element": "Fire", "polarity": "Yang", "hidden": ["丁", "己"]},
    {"chinese": "未", "pinyin": "Wèi", "thai": "บี่ (มะแม)", "animal": "Goat", "element": "Earth", "polarity": "Yin", "hidden": ["己", "丁", "乙"]},
    {"chinese": "申", "pinyin": "Shēn", "thai": "ซิม (วอก)", "animal": "Monkey", "element": "Metal", "polarity": "Yang", "hidden": ["庚", "壬", "戊"]},
    {"chinese": "酉", "pinyin": "Yǒu", "thai": "อิ้ว (ระกา)", "animal": "Rooster", "element": "Metal", "polarity": "Yin", "hidden": ["辛"]},
    {"chinese": "戌", "pinyin": "Xū", "thai": "สุก (จอ)", "animal": "Dog", "element": "Earth", "polarity": "Yang", "hidden": ["戊", "辛", "丁"]},
    {"chinese": "亥", "pinyin": "Hài", "thai": "ไห (กุน)", "animal": "Pig", "element": "Water", "polarity": "Yang", "hidden": ["壬", "甲"]},
]

# 12 Solar Terms (Jie) corresponding to Month Branch changes
SOLAR_MONTH_TERMS = [
    {"branch_idx": 2, "name": "立春 (Li Chun)", "lon": 315.0},  # Month 1: Yin (Tiger)
    {"branch_idx": 3, "name": "驚蟄 (Jing Zhe)", "lon": 345.0}, # Month 2: Mao (Rabbit)
    {"branch_idx": 4, "name": "清明 (Qing Ming)", "lon": 15.0},  # Month 3: Chen (Dragon)
    {"branch_idx": 5, "name": "立夏 (Li Xia)", "lon": 45.0},    # Month 4: Si (Snake)
    {"branch_idx": 6, "name": "芒種 (Mang Zhong)", "lon": 75.0}, # Month 5: Wu (Horse)
    {"branch_idx": 7, "name": "小暑 (Xiao Shu)", "lon": 105.0},  # Month 6: Wei (Goat)
    {"branch_idx": 8, "name": "立秋 (Li Qiu)", "lon": 135.0},   # Month 7: Shen (Monkey)
    {"branch_idx": 9, "name": "白露 (Bai Lu)", "lon": 165.0},   # Month 8: You (Rooster)
    {"branch_idx": 10, "name": "寒露 (Han Lu)", "lon": 195.0},  # Month 9: Xu (Dog)
    {"branch_idx": 11, "name": "立冬 (Li Dong)", "lon": 225.0},  # Month 10: Hai (Pig)
    {"branch_idx": 0, "name": "大雪 (Da Xue)", "lon": 255.0},   # Month 11: Zi (Rat)
    {"branch_idx": 1, "name": "小寒 (Xiao Han)", "lon": 285.0},  # Month 12: Chou (Ox)
]

ELEMENT_RELATIONS = {
    "Wood": {"generates": "Fire", "controls": "Earth", "generated_by": "Water", "controlled_by": "Metal"},
    "Fire": {"generates": "Earth", "controls": "Metal", "generated_by": "Wood", "controlled_by": "Water"},
    "Earth": {"generates": "Metal", "controls": "Water", "generated_by": "Fire", "controlled_by": "Wood"},
    "Metal": {"generates": "Water", "controls": "Wood", "generated_by": "Earth", "controlled_by": "Fire"},
    "Water": {"generates": "Wood", "controls": "Fire", "generated_by": "Metal", "controlled_by": "Earth"},
}


def get_ten_god(day_stem_idx: int, target_stem_idx: int) -> Dict[str, str]:
    """Determines the 10 Gods (十神) relationship between Day Master and target Stem."""
    dm = STEMS[day_stem_idx]
    target = STEMS[target_stem_idx]

    dm_elem = dm["element"]
    t_elem = target["element"]
    same_polar = (dm["polarity"] == target["polarity"])

    if dm_elem == t_elem:
        return {"chinese": "比肩" if same_polar else "劫財", "name_thai": "เทียบตน (เพื่อน)" if same_polar else "ชิงทรัพย์ (คู่แข่ง)"}
    elif ELEMENT_RELATIONS[dm_elem]["generates"] == t_elem:
        return {"chinese": "食神" if same_polar else "傷官", "name_thai": "โภคทรัพย์ (ปัญญา/ผลงาน)" if same_polar else "ท้าทาย (ความคิดสร้างสรรค์/บุกเบิก)"}
    elif ELEMENT_RELATIONS[dm_elem]["controls"] == t_elem:
        return {"chinese": "偏財" if same_polar else "正財", "name_thai": "โชคลาภลอย (โอกาสการเงิน)" if same_polar else "ทรัพย์สินประจำ (ความมั่งคั่งมั่นคง)"}
    elif ELEMENT_RELATIONS[dm_elem]["controlled_by"] == t_elem:
        return {"chinese": "七殺" if same_polar else "正官", "name_thai": "เพชฌฆาต (อำนาจบารมี/การฟันฝ่า)" if same_polar else "ขุนนาง (เกียรติยศ/ตำแหน่งการงาน)"}
    elif ELEMENT_RELATIONS[dm_elem]["generated_by"] == t_elem:
        return {"chinese": "偏印" if same_polar else "正印", "name_thai": "ตราประทับจร (สัญชาตญาณพิเศษ)" if same_polar else "ตราประทับแท้ (ผู้อุปถัมภ์/วิชาการ)"}
    return {"chinese": "元神", "name_thai": "ตัวตน"}


def calculate_true_solar_time(birth_time_str: str, lon: float, tz_offset: float, jd_ut: float) -> Tuple[float, float]:
    """
    Calculates True Solar Time (真太陽時) adjusting for longitude meridian and Equation of Time.
    Returns: (true_solar_decimal_hours, eot_minutes)
    """
    hh, mm = [int(x) for x in birth_time_str.split(":")]
    clock_hours = hh + mm / 60.0

    # 1. Longitude correction: 4 minutes per degree from standard meridian (tz_offset * 15 deg)
    std_meridian = tz_offset * 15.0
    lon_diff_deg = lon - std_meridian
    lon_correction_hours = (lon_diff_deg * 4.0) / 60.0

    # 2. Equation of Time (EoT) via Swiss Ephemeris
    # EoT = Apparent Solar Time - Mean Solar Time
    # Using sun apparent vs mean right ascension
    sun_pos, _ = swe.calc_ut(jd_ut, swe.SUN, swe.FLG_SWIEPH)
    sun_lon_rad = math.radians(sun_pos[0])
    # Approximate EoT formula from solar mean anomaly and obliquity
    n_days = jd_ut - 2451545.0
    L = math.radians(280.460 + 0.9856474 * n_days)
    g = math.radians(357.528 + 0.9856003 * n_days)
    eot_minutes = 4.0 * math.degrees(
        -0.0349 * math.sin(2 * L) - 0.0034 * math.sin(4 * L) +
        0.0018 * math.sin(g) - 0.0054 * math.sin(2 * g)
    )
    eot_hours = eot_minutes / 60.0

    true_solar_hours = (clock_hours + lon_correction_hours + eot_hours) % 24.0
    return true_solar_hours, eot_minutes


def get_month_branch(sun_lon: float) -> int:
    """
    Determines month branch index (0..11) from Sun ecliptic longitude.
    """
    lon = sun_lon % 360.0
    if 315.0 <= lon < 345.0: return 2  # 寅 (Tiger)
    elif 345.0 <= lon or lon < 15.0: return 3 # 卯 (Rabbit)
    elif 15.0 <= lon < 45.0: return 4  # 辰 (Dragon)
    elif 45.0 <= lon < 75.0: return 5  # 巳 (Snake)
    elif 75.0 <= lon < 105.0: return 6 # 午 (Horse)
    elif 105.0 <= lon < 135.0: return 7 # 未 (Goat)
    elif 135.0 <= lon < 165.0: return 8 # 申 (Monkey)
    elif 165.0 <= lon < 195.0: return 9 # 酉 (Rooster)
    elif 195.0 <= lon < 225.0: return 10 # 戌 (Dog)
    elif 225.0 <= lon < 255.0: return 11 # 亥 (Pig)
    elif 255.0 <= lon < 285.0: return 0  # 子 (Rat)
    else: return 1  # 丑 (Ox) [285 to 315]


def calculate_bazi(
    birth_date: str,
    birth_time: str,
    latitude: float,
    longitude: float,
    tz_offset: float = 7.0,
    gender: str = "m"
) -> Dict[str, Any]:
    """
    Computes complete, high-precision Bazi Four Pillars chart.
    """
    y, m, d = [int(x) for x in birth_date.split("-")]
    hh, mm = [int(x) for x in birth_time.split(":")]
    utc_hours = (hh + mm / 60.0) - tz_offset
    jd_ut = swe.julday(y, m, d, utc_hours)

    # 1. Sun Longitude for Solar Terms
    sun_pos, _ = swe.calc_ut(jd_ut, swe.SUN, swe.FLG_SWIEPH)
    sun_lon = sun_pos[0]

    # 2. True Solar Time
    true_solar_h, eot_min = calculate_true_solar_time(birth_time, longitude, tz_offset, jd_ut)
    tsh = int(true_solar_h)
    tsm = int((true_solar_h - tsh) * 60)
    true_solar_str = f"{tsh:02d}:{tsm:02d}"

    # 3. Year Pillar
    # Astrological solar year changes at Li Chun (315 deg Sun Lon)
    solar_year = y
    if m in [1, 2] and sun_lon < 315.0:
        solar_year = y - 1

    year_stem_idx = (solar_year - 4) % 10
    year_branch_idx = (solar_year - 4) % 12

    # 4. Month Pillar (Five Tigers rule: 五虎遁)
    month_branch_idx = get_month_branch(sun_lon)
    # Five Tigers base for Month 1 (Yin - 寅)
    five_tigers_base = {0: 2, 5: 2, 1: 4, 6: 4, 2: 6, 7: 6, 3: 8, 8: 8, 4: 0, 9: 0}
    m1_stem = five_tigers_base[year_stem_idx]
    # Count steps from Yin (branch index 2)
    month_step = (month_branch_idx - 2) % 12
    month_stem_idx = (m1_stem + month_step) % 10

    # 5. Day Pillar (Sexagenary cycle from Julian Day)
    # Day cutoff at 23:00 True Solar Time (Early/Late Rat hour convention)
    # At true_solar_h >= 23.0, the calendar day advances to next day stem/branch
    effective_jd = jd_ut
    if true_solar_h >= 23.0:
        effective_jd += 1.0
    day_num = int(effective_jd + 0.5)
    day_stem_idx = (day_num + 9) % 10
    day_branch_idx = (day_num + 1) % 12

    # 6. Hour Pillar (Five Rats rule: 五鼠遁)
    # Double-hour branch index
    hour_branch_idx = int((true_solar_h + 1.0) / 2.0) % 12
    five_rats_base = {0: 0, 5: 0, 1: 2, 6: 2, 2: 4, 7: 4, 3: 6, 8: 6, 4: 8, 9: 8}
    h_base = five_rats_base[day_stem_idx]
    hour_stem_idx = (h_base + hour_branch_idx) % 10

    # 7. Day Master & 10 Gods
    dm_stem = STEMS[day_stem_idx]
    year_stem = STEMS[year_stem_idx]
    month_stem = STEMS[month_stem_idx]
    hour_stem = STEMS[hour_stem_idx]

    pillars = {
        "year": {
            "label": "เสาปี (Year Pillar)",
            "stem": year_stem,
            "branch": BRANCHES[year_branch_idx],
            "ten_god": get_ten_god(day_stem_idx, year_stem_idx),
            "representation": "รากฐานตระกูล บรรพบุรุษ สังคมกว้าง และช่วงวัยเด็ก (0-18 ปี)"
        },
        "month": {
            "label": "เสาเดือน (Month Pillar)",
            "stem": month_stem,
            "branch": BRANCHES[month_branch_idx],
            "ten_god": get_ten_god(day_stem_idx, month_stem_idx),
            "representation": "บิดามารดา การงาน อาชีพ สภาพแวดล้อม และช่วงสร้างตัว (19-35 ปี)"
        },
        "day": {
            "label": "เสาวัน (Day Pillar / Day Master)",
            "stem": dm_stem,
            "branch": BRANCHES[day_branch_idx],
            "ten_god": {"chinese": "日主 (Self)", "name_thai": "ตัวตนแท้จริง (Day Master)"},
            "is_day_master": True,
            "representation": "แก่นแท้แห่งตน สุขภาพ จิตใจ และชีวิตคู่/คู่ครอง (36-50 ปี)"
        },
        "hour": {
            "label": "เสายาม (Hour Pillar)",
            "stem": hour_stem,
            "branch": BRANCHES[hour_branch_idx],
            "ten_god": get_ten_god(day_stem_idx, hour_stem_idx),
            "representation": "บุตรหลาน บริวาร ผลงานบั้นปลายชีวิต และช่วงวัย 51+ ปี"
        }
    }

    # 8. Five Elements Distribution (Stems + Main Branches + Hidden Stems)
    element_weights = {"Wood": 0.0, "Fire": 0.0, "Earth": 0.0, "Metal": 0.0, "Water": 0.0}
    # 4 Stems (Weight 1.0 each)
    for s_idx in [year_stem_idx, month_stem_idx, day_stem_idx, hour_stem_idx]:
        element_weights[STEMS[s_idx]["element"]] += 1.0
    # 4 Branches (Weight 1.2 each for Earthly Branch root strength)
    for b_idx in [year_branch_idx, month_branch_idx, day_branch_idx, hour_branch_idx]:
        element_weights[BRANCHES[b_idx]["element"]] += 1.2
    # Hidden Stems (Weight 0.5 each)
    for b_idx in [year_branch_idx, month_branch_idx, day_branch_idx, hour_branch_idx]:
        for h_char in BRANCHES[b_idx]["hidden"]:
            for st in STEMS:
                if st["chinese"] == h_char:
                    element_weights[st["element"]] += 0.5

    total_w = sum(element_weights.values()) or 1.0
    element_pct = {k: round((v / total_w) * 100.0, 1) for k, v in element_weights.items()}

    # Day Master Strength Assessment
    dm_elem = dm_stem["element"]
    support_score = element_pct[dm_elem] + element_pct[ELEMENT_RELATIONS[dm_elem]["generated_by"]]
    dm_strength = "แข็งแรง (Strong)" if support_score >= 42.0 else "อ่อนกำลัง (Weak)"

    favorable = []
    if dm_strength.startswith("แข็งแรง"):
        # Strong Day Master favors Output, Wealth, Power
        favorable = [
            ELEMENT_RELATIONS[dm_elem]["generates"],
            ELEMENT_RELATIONS[dm_elem]["controls"],
            ELEMENT_RELATIONS[dm_elem]["controlled_by"]
        ]
    else:
        # Weak Day Master favors Resource, Self
        favorable = [
            ELEMENT_RELATIONS[dm_elem]["generated_by"],
            dm_elem
        ]

    # 9. Da Yun (大運 - 10-Year Luck Pillars)
    # Yang Male or Yin Female = Forward (+1)
    # Yin Male or Yang Female = Backward (-1)
    year_polar = year_stem["polarity"]
    is_forward = (year_polar == "Yang" and gender.lower().startswith("m")) or (year_polar == "Yin" and gender.lower().startswith("f"))
    direction = 1 if is_forward else -1

    da_yun_list = []
    base_age = 5 # Standard approximation; detailed solar term distance can refine
    for i in range(1, 9):
        curr_age = base_age + (i - 1) * 10
        s_i = (month_stem_idx + i * direction) % 10
        b_i = (month_branch_idx + i * direction) % 12
        da_yun_list.append({
            "step": i,
            "start_age": curr_age,
            "end_age": curr_age + 9,
            "stem": STEMS[s_i],
            "branch": BRANCHES[b_i],
            "ten_god": get_ten_god(day_stem_idx, s_i)
        })

    bazi_result = {
        "true_solar_time": true_solar_str,
        "eot_minutes": round(eot_min, 1),
        "four_pillars": pillars,
        "day_master": {
            "stem": dm_stem,
            "strength": dm_strength,
            "support_score": round(support_score, 1),
            "favorable_elements": favorable
        },
        "five_elements_percent": element_pct,
        "da_yun": da_yun_list
    }

    try:
        from backend.engine.bazi_interpretation import generate_bazi_interpretation
        bazi_result["interpretation"] = generate_bazi_interpretation(bazi_result)
    except Exception as e:
        bazi_result["interpretation"] = None

    return bazi_result
