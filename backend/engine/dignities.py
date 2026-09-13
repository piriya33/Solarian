"""
Solarian Astrology Engine - Planetary Dignities & Relationships Module
Evaluates essential dignities (เกษตร, อุจจ์, นิจ, ประ), planetary relationships (คู่มิตร, คู่ศัตรู, คู่สมพล, คู่ธาตุ),
and house rulerships.
"""

from __future__ import annotations
from typing import Dict, List, Any, Optional

# Traditional Sign Rulers
SIGN_RULERS = {
    "Aries": {"num": 3, "name": "Mars", "thai": "อังคาร"},
    "Taurus": {"num": 6, "name": "Venus", "thai": "ศุกร์"},
    "Gemini": {"num": 4, "name": "Mercury", "thai": "พุธ"},
    "Cancer": {"num": 2, "name": "Moon", "thai": "จันทร์"},
    "Leo": {"num": 1, "name": "Sun", "thai": "อาทิตย์"},
    "Virgo": {"num": 4, "name": "Mercury", "thai": "พุธ"},
    "Libra": {"num": 6, "name": "Venus", "thai": "ศุกร์"},
    "Scorpio": {"num": 3, "name": "Mars", "thai": "อังคาร"},
    "Sagittarius": {"num": 5, "name": "Jupiter", "thai": "พฤหัสบดี"},
    "Capricorn": {"num": 7, "name": "Saturn", "thai": "เสาร์"},
    "Aquarius": {"num": 7, "name": "Saturn", "thai": "เสาร์"},
    "Pisces": {"num": 5, "name": "Jupiter", "thai": "พฤหัสบดี"}
}

# Essential Dignities (Tropical / Classical)
# Exaltation signs & peak degree
EXALTATIONS = {
    "Sun": {"sign": "Aries", "peak_deg": 10.0, "thai": "มหาอุจจ์"},
    "Moon": {"sign": "Taurus", "peak_deg": 3.0, "thai": "มหาอุจจ์"},
    "Mars": {"sign": "Capricorn", "peak_deg": 28.0, "thai": "มหาอุจจ์"},
    "Mercury": {"sign": "Virgo", "peak_deg": 15.0, "thai": "มหาอุจจ์"},
    "Jupiter": {"sign": "Cancer", "peak_deg": 5.0, "thai": "มหาอุจจ์"},
    "Venus": {"sign": "Pisces", "peak_deg": 27.0, "thai": "มหาอุจจ์"},
    "Saturn": {"sign": "Libra", "peak_deg": 20.0, "thai": "มหาอุจจ์"},
    "True Node": {"sign": "Taurus", "peak_deg": 15.0, "thai": "อุจจ์"},
    "Mean Node": {"sign": "Taurus", "peak_deg": 15.0, "thai": "อุจจ์"}
}

# Falls (Opposite sign of exaltation)
FALLS = {
    "Sun": {"sign": "Libra", "thai": "นิจ"},
    "Moon": {"sign": "Scorpio", "thai": "นิจ"},
    "Mars": {"sign": "Cancer", "thai": "นิจ"},
    "Mercury": {"sign": "Pisces", "thai": "นิจ"},
    "Jupiter": {"sign": "Capricorn", "thai": "นิจ"},
    "Venus": {"sign": "Virgo", "thai": "นิจ"},
    "Saturn": {"sign": "Aries", "thai": "นิจ"},
    "True Node": {"sign": "Scorpio", "thai": "นิจ"},
    "Mean Node": {"sign": "Scorpio", "thai": "นิจ"}
}

# Domicile / Ruler signs
DOMICILES = {
    "Sun": ["Leo"],
    "Moon": ["Cancer"],
    "Mercury": ["Gemini", "Virgo"],
    "Venus": ["Taurus", "Libra"],
    "Mars": ["Aries", "Scorpio"],
    "Jupiter": ["Sagittarius", "Pisces"],
    "Saturn": ["Capricorn", "Aquarius"]
}

# Detriments (Opposite sign of domicile)
DETRIMENTS = {
    "Sun": ["Aquarius"],
    "Moon": ["Capricorn"],
    "Mercury": ["Sagittarius", "Pisces"],
    "Venus": ["Aries", "Scorpio"],
    "Mars": ["Taurus", "Libra"],
    "Jupiter": ["Gemini", "Virgo"],
    "Saturn": ["Cancer", "Leo"]
}

# Planetary Relationships (Thai Astrology Pairs)
PLANET_PAIRS = {
    # คู่มิตร
    (1, 5): {"type": "คู่มิตร", "desc": "มิตรภาพ ความเกื้อกูล ผู้ใหญ่อุปถัมภ์ สติปัญญา บารมี", "nature": "positive"},
    (5, 1): {"type": "คู่มิตร", "desc": "มิตรภาพ ความเกื้อกูล ผู้ใหญ่อุปถัมภ์ สติปัญญา บารมี", "nature": "positive"},
    (2, 4): {"type": "คู่มิตร", "desc": "เสน่ห์ การเจรจา การประสานงาน มนุษยสัมพันธ์ ความเข้าอกเข้าใจ", "nature": "positive"},
    (4, 2): {"type": "คู่มิตร", "desc": "เสน่ห์ การเจรจา การประสานงาน มนุษยสัมพันธ์ ความเข้าอกเข้าใจ", "nature": "positive"},
    (3, 6): {"type": "คู่มิตร", "desc": "ความรัก เสน่หา ความเพลิดเพลิน สุนทรียภาพ ศิลปะ", "nature": "positive"},
    (6, 3): {"type": "คู่มิตร", "desc": "ความรัก เสน่หา ความเพลิดเพลิน สุนทรียภาพ ศิลปะ", "nature": "positive"},
    (7, 8): {"type": "คู่มิตร", "desc": "มิตรนักเลง พรรคพวก ลาภลอย การเสี่ยงโชค การขยายอิทธิพล", "nature": "positive"},
    (8, 7): {"type": "คู่มิตร", "desc": "มิตรนักเลง พรรคพวก ลาภลอย การเสี่ยงโชค การขยายอิทธิพล", "nature": "positive"},

    # คู่ศัตรู
    (1, 3): {"type": "คู่ศัตรู", "desc": "ความขัดแย้ง อุบัติเหตุ การใช้อารมณ์ การแตกหัก โทสะ", "nature": "negative"},
    (3, 1): {"type": "คู่ศัตรู", "desc": "ความขัดแย้ง อุบัติเหตุ การใช้อารมณ์ การแตกหัก โทสะ", "nature": "negative"},
    (4, 8): {"type": "คู่ศัตรู", "desc": "การหลอกลวง เอกสารสัญญาผิดพลาด คำพูดทำให้เสียชื่อเสียง", "nature": "negative"},
    (8, 4): {"type": "คู่ศัตรู", "desc": "การหลอกลวง เอกสารสัญญาผิดพลาด คำพูดทำให้เสียชื่อเสียง", "nature": "negative"},
    (6, 7): {"type": "คู่ศัตรู", "desc": "รักซ้อน อุปสรรคความรัก การพลัดพราก ความกดดันทางอารมณ์", "nature": "negative"},
    (7, 6): {"type": "คู่ศัตรู", "desc": "รักซ้อน อุปสรรคความรัก การพลัดพราก ความกดดันทางอารมณ์", "nature": "negative"},

    # คู่สมพล
    (1, 6): {"type": "คู่สมพล", "desc": "ยศศักดิ์ ความสง่างาม การเงินโดดเด่น ความมั่งคั่ง", "nature": "positive"},
    (6, 1): {"type": "คู่สมพล", "desc": "ยศศักดิ์ ความสง่างาม การเงินโดดเด่น ความมั่งคั่ง", "nature": "positive"},
    (2, 8): {"type": "คู่สมพล", "desc": "ปฏิภาณไหวพริบ โชคลาภฉับพลัน แก้ไขวิกฤตได้ดีเยี่ยม", "nature": "positive"},
    (8, 2): {"type": "คู่สมพล", "desc": "ปฏิภาณไหวพริบ โชคลาภฉับพลัน แก้ไขวิกฤตได้ดีเยี่ยม", "nature": "positive"},
    (3, 5): {"type": "คู่สมพล", "desc": "ความกล้าหาญพร้อมสติปัญญา ชัยชนะจากการแข่งขัน ความยุติธรรม", "nature": "positive"},
    (5, 3): {"type": "คู่สมพล", "desc": "ความกล้าหาญพร้อมสติปัญญา ชัยชนะจากการแข่งขัน ความยุติธรรม", "nature": "positive"},
    (4, 7): {"type": "คู่สมพล", "desc": "ความสุขุม รอบคอบ งานโครงการขนาดใหญ่ การวางแผนระยะยาว", "nature": "positive"},
    (7, 4): {"type": "คู่สมพล", "desc": "ความสุขุม รอบคอบ งานโครงการขนาดใหญ่ การวางแผนระยะยาว", "nature": "positive"},
    (5, 7): {"type": "คู่สมพล / คู่ปฏิรูปโครงสร้าง", "desc": "การเปลี่ยนแปลงโครงสร้างครั้งใหญ่ การยกระดับบทบาทสู่ที่ปรึกษา การจัดระเบียบระบบและสินทรัพย์ใหม่", "nature": "positive"},
    (7, 5): {"type": "คู่สมพล / คู่ปฏิรูปโครงสร้าง", "desc": "การเปลี่ยนแปลงโครงสร้างครั้งใหญ่ การยกระดับบทบาทสู่ที่ปรึกษา การจัดระเบียบระบบและสินทรัพย์ใหม่", "nature": "positive"},

    # คู่ธาตุ
    (1, 7): {"type": "คู่ธาตุไฟ", "desc": "พลังแห่งการสร้างสรรค์ ความกระตือรือร้น ความมุ่งมั่นอันแรงกล้า", "nature": "positive"},
    (7, 1): {"type": "คู่ธาตุไฟ", "desc": "พลังแห่งการสร้างสรรค์ ความกระตือรือร้น ความมุ่งมั่นอันแรงกล้า", "nature": "positive"},
    (2, 5): {"type": "คู่ศัตรู (คู่ธาตุดิน)", "desc": "มีธาตุดินร่วมกันที่เกื้อหนุนความมั่นคง แต่มีความขัดแย้งทางทัศนะและศีลธรรม ต้องใช้สติในการจัดสมดุล", "nature": "mixed"},
    (5, 2): {"type": "คู่ศัตรู (คู่ธาตุดิน)", "desc": "มีธาตุดินร่วมกันที่เกื้อหนุนความมั่นคง แต่มีความขัดแย้งทางทัศนะและศีลธรรม ต้องใช้สติในการจัดสมดุล", "nature": "mixed"},
    (3, 8): {"type": "คู่ธาตุลม", "desc": "ความรวดเร็ว ว่องไว การเปลี่ยนแปลงรวดเร็ว การลุยไปข้างหน้า", "nature": "positive"},
    (8, 3): {"type": "คู่ธาตุลม", "desc": "ความรวดเร็ว ว่องไว การเปลี่ยนแปลงรวดเร็ว การลุยไปข้างหน้า", "nature": "positive"},
    (4, 6): {"type": "คู่ธาตุน้ำ", "desc": "ความร่มเย็น อ่อนโยน เสน่ห์เมตตา ความอุดมสมบูรณ์", "nature": "positive"},
    (6, 4): {"type": "คู่ธาตุน้ำ", "desc": "ความร่มเย็น อ่อนโยน เสน่ห์เมตตา ความอุดมสมบูรณ์", "nature": "positive"}
}


def evaluate_dignity(planet_name: str, sign: str) -> Dict[str, Any]:
    """
    Evaluates the astrological dignity of a planet in a zodiac sign.
    Returns dignity type with plain-language translation, score, full meaning, and action advice.
    """
    # Exaltation
    if planet_name in EXALTATIONS and EXALTATIONS[planet_name]["sign"] == sign:
        return {
            "type": "อุจจ์ (โดดเด่นระดับผู้นำ)",
            "short_type": "อุจจ์",
            "score": +5,
            "badge_color": "#eab308",
            "desc": "ตำแหน่งเกียรติยศสูงสุด มีพลังบารมี และความโดดเด่นเต็มเปี่ยม",
            "plain_meaning": "เปรียบเหมือน 'ผู้นำบนเวทีใหญ่' มีพลังในการสร้างสรรค์และมีโอกาสเฉิดฉายสูง ในเชิงสัญลักษณ์ใช้ทบทวนวิธีนำเสนอผลงานและการรับข้อเสนอแนะ ไม่ได้รับรองการยอมรับจากผู้อื่น",
            "action_advice": "กล้าก้าวขึ้นมานำ แสดงวิสัยทัศน์ และใช้ชื่อเสียงบารมีในการสร้างคุณค่าระยะยาว"
        }

    # Domicile / Ruler
    if planet_name in DOMICILES and sign in DOMICILES[planet_name]:
        return {
            "type": "เกษตร (เจ้าบ้านผู้มั่นคง)",
            "short_type": "เกษตร",
            "score": +4,
            "badge_color": "#16a34a",
            "desc": "ตำแหน่งเจ้าบ้าน มั่นคง เป็นตัวของตัวเอง มีรากฐานแข็งแกร่ง",
            "plain_meaning": "เปรียบเหมือน 'เจ้าบ้านที่มีอำนาจและทรัพยากรพร้อมในมือ' มีความมั่นคงในตนเองสูง หยิบจับสิ่งใดก็ตั้งตัวได้เร็ว มีต้นทุนทางสติปัญญาและทักษะที่หนักแน่น",
            "action_advice": "สร้างระบบและรากฐานที่ยั่งยืน ทบทวนการใช้ทรัพยากรที่มีอยู่กับต้นทุนและข้อจำกัดจริง"
        }

    # Detriment
    if planet_name in DETRIMENTS and sign in DETRIMENTS[planet_name]:
        return {
            "type": "ประเกษตร (แม่ทัพสร้างเมืองใหม่)",
            "short_type": "ประเกษตร",
            "score": -3,
            "badge_color": "#ea580c",
            "desc": "ต้องพึ่งพาตนเอง พลิกแพลง และสร้างความเชี่ยวชาญเฉพาะตัว",
            "plain_meaning": "ดาวอยู่ในราศีตรงข้ามกับถิ่นตนเอง เปรียบเหมือน 'แม่ทัพที่ต้องไปสร้างเมืองใหม่ในแดนไกล' สภาพแวดล้อมไม่ได้จัดเตรียมความสะดวกสบายไว้ให้ คุณต้องออกแรงมากกว่าคนอื่น 2 เท่า ต้องพึ่งพาตนเอง พลิกแพลง และใช้ความคิดสร้างสรรค์ แต่เมื่อผ่านพ้นไปได้ จะกลายเป็นความเชี่ยวชาญเฉพาะตัวที่หาใครลอกเลียนแบบไม่ได้",
            "action_advice": "อย่ารอคอยความช่วยเหลือสำเร็จรูป จงใช้การเรียนรู้จากการลงมือทำจริง พลิกวิกฤตให้เป็นความเชี่ยวชาญเฉพาะทาง"
        }

    # Fall
    if planet_name in FALLS and FALLS[planet_name]["sign"] == sign:
        return {
            "type": "นิจ (เพชรในตม/สั่งสมความเพียร)",
            "short_type": "นิจ",
            "score": -4,
            "badge_color": "#dc2626",
            "desc": "พลังแสดงผลช้า ต้องอาศัยความเพียรและวินัยระยะยาว",
            "plain_meaning": "เปรียบเหมือน 'เพชรที่ยังอยู่ในตม' หรือ 'ม้าแข่งที่ต้องวิ่งระยะไกล' พลังงานแสดงผลช้า ไม่ควรหวังโชคลาภทางลัด แต่ยิ่งผ่านบทเรียน อุปสรรค และการขัดเกลา วินัยที่สั่งสมจะกลายเป็นรากฐานความสำเร็จที่แข็งแกร่งที่สุดในบั้นปลาย",
            "action_advice": "โฟกัสที่กระบวนการและวินัยรายวัน สะสมความรู้และประสบการณ์อย่างต่อเนื่อง ชัยชนะที่แท้จริงจะปรากฏในระยะยาว"
        }

    return {
        "type": "มาตรฐานปกติ (พร้อมรับการปรับตัว)",
        "short_type": "ปกติ",
        "score": 0,
        "badge_color": "#64748b",
        "desc": "ตำแหน่งกลางๆ แสดงพลังตามธรรมชาติและพร้อมต่อยอด",
        "plain_meaning": "พลังงานของดาวอยู่ในระดับสมดุลเป็นกลาง เปรียบเหมือน 'ผ้าขาวที่พร้อมถูกแต่งแต้ม' ไม่มีข้อบ่งชี้พิเศษจากมาตรฐานดาวนี้เพียงอย่างเดียว ผลลัพธ์ยังขึ้นอยู่กับการเลือกสภาพแวดล้อม การฝึกฝนตนเอง และการร่วมมือกับกัลยาณมิตรเป็นสำคัญ",
        "action_advice": "เลือกสภาพแวดล้อมและคู่คิดที่ส่งเสริมเป้าหมาย ลงมือปฏิบัติด้วยความสม่ำเสมอ ผลลัพธ์ยังขึ้นกับทรัพยากร สภาพแวดล้อม และข้อจำกัดที่ต้องประเมิน"
    }


def evaluate_relationship(planet1_num: int, planet2_num: int) -> Optional[Dict[str, Any]]:
    """
    Looks up the Thai astrological relationship between two planets (คู่มิตร, คู่ศัตรู, คู่สมพล, คู่ธาตุ).
    """
    pair = (planet1_num, planet2_num)
    if pair in PLANET_PAIRS:
        return PLANET_PAIRS[pair]
    return None


def evaluate_period_synergy(
    major_planet_num: int,
    sub_planet_num: int,
    natal_planets_dict: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Synthesizes the interaction between Major period ruler (ดาวเสวยอายุ), Sub-period ruler (ดาวแทรก),
    and Natal Sun/Ascendant placements.
    """
    # Lookup names
    num_to_name = {1: "Sun", 2: "Moon", 3: "Mars", 4: "Mercury", 5: "Jupiter", 6: "Venus", 7: "Saturn", 8: "True Node"}
    m_name = num_to_name.get(major_planet_num, "Sun")
    s_name = num_to_name.get(sub_planet_num, "Sun")

    m_natal = natal_planets_dict.get(m_name, {})
    s_natal = natal_planets_dict.get(s_name, {})

    rel = evaluate_relationship(major_planet_num, sub_planet_num)

    m_dignity = evaluate_dignity(m_name, m_natal.get("sign", ""))
    s_dignity = evaluate_dignity(s_name, s_natal.get("sign", ""))

    summary = []
    if rel:
        summary.append(f"ดาวเสวยอายุ ({m_natal.get('thai', '')}) กับดาวแทรก ({s_natal.get('thai', '')}) เป็น {rel['type']}: {rel['desc']}")
    else:
        summary.append(f"ดาวเสวยอายุ ({m_natal.get('thai', '')}) ดำเนินคู่กับดาวแทรก ({s_natal.get('thai', '')}) ในสถานะดำเนินงานตามจังหวะปกติ: ไม่มีข้อบ่งชี้พิเศษตามเกณฑ์นี้ ผลลัพธ์ยังขึ้นกับการลงมือทำและสภาพแวดล้อมจริง")

    summary.append(f"ในพื้นดวงเดิม ดาว {m_natal.get('thai', '')} สถิต {m_natal.get('sign_thai', '')} เรือน {m_natal.get('house', 1)} ได้ตำแหน่ง {m_dignity['type']}")
    summary.append(f"ดาวแทรก {s_natal.get('thai', '')} สถิต {s_natal.get('sign_thai', '')} เรือน {s_natal.get('house', 1)} ได้ตำแหน่ง {s_dignity['type']}")

    return {
        "relationship": rel if rel else {
            "type": "จังหวะปกติ (ผลลัพธ์ตามวินัย)",
            "desc": "ไม่มีความขัดแย้งรุนแรงและไม่มีโชคช่วยกะทันหัน ทุกความสำเร็จมาจากความสม่ำเสมอในการลงมือทำ",
            "nature": "neutral"
        },
        "major_dignity": m_dignity,
        "sub_dignity": s_dignity,
        "major_house": m_natal.get("house", 1),
        "sub_house": s_natal.get("house", 1),
        "synthesis_notes": summary
    }
