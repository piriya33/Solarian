"""Short, evidence-backed guidance for the first layer of the product.

This module intentionally keeps the 108-year material behind a small set of
cards.  It does not call an LLM and does not treat symbolic harmonic ages as
observed transits.
"""

from __future__ import annotations

from datetime import date
from typing import Any, Dict, Iterable, List, Optional, Tuple

from backend.engine.dignities import SIGN_RULERS, evaluate_relationship
from backend.engine.interpretation import (
    HOUSE_SIGNIFICATIONS,
    NOTABLE_PAIR_INTERPRETATIONS,
    build_planetary_context,
    canonical_planet_name,
)
from backend.engine.transits import calculate_transits_for_date


BANGKOK_NOON_UTC_HOURS = 5.0

HOUSE_FOCUS = {
    1: "ตัวตน",
    2: "การเงินส่วนตัว",
    3: "การสื่อสาร",
    4: "บ้านและครอบครัว",
    5: "งานสร้างสรรค์",
    6: "งานประจำ",
    7: "คู่สัมพันธ์และข้อตกลง",
    8: "ภาระร่วม",
    9: "การเรียนรู้",
    10: "การงาน",
    11: "เครือข่ายและเป้าหมาย",
    12: "งานเบื้องหลังและการพัก",
}

PLANET_PRACTICE = {
    "Sun": ("เลือกสิ่งสำคัญหนึ่งเรื่องแล้วตัดสินใจให้ชัด", "อย่าฝืนทำทุกเรื่องเพื่อพิสูจน์ตัวเอง"),
    "Moon": ("เช็กพลังใจและจัดจังหวะพักให้พอ", "อย่าตอบทันทีตอนอารมณ์ยังแกว่ง"),
    "Mars": ("เริ่มจากงานสั้นที่เห็นผลและใช้แรงอย่างมีจังหวะ", "อย่าเร่งจนข้ามขั้นตอนหรือปะทะโดยไม่จำเป็น"),
    "Mercury": ("เขียนประเด็นสำคัญและยืนยันความเข้าใจกับผู้เกี่ยวข้อง", "อย่าสรุปจากข้อมูลชิ้นเดียว"),
    "Jupiter": ("เรียนรู้เพิ่มหนึ่งเรื่องแล้วนำมาใช้กับงานจริง", "อย่ารับปากเกินเวลาและกำลังที่มี"),
    "Venus": ("คุยเรื่องความต้องการและขอบเขตให้ชัด", "อย่ารักษาความราบรื่นด้วยการเก็บปัญหาไว้"),
    "Saturn": ("แบ่งภาระใหญ่เป็นขั้นเล็กและกำหนดเส้นตายที่ทำได้", "อย่ากดดันตัวเองด้วยมาตรฐานที่ไม่มีวันจบ"),
    "True Node": ("ตรวจแรงจูงใจและข้อมูลก่อนรับโอกาสใหม่", "อย่าตัดสินใจเพราะกระแสหรือความกลัวว่าจะพลาด"),
    "Uranus": ("ทดลองทางเลือกใหม่ในขอบเขตเล็กที่ย้อนกลับได้", "อย่าเปลี่ยนทุกอย่างพร้อมกัน"),
    "Neptune": ("แยกข้อเท็จจริงออกจากความคาดหวังเป็นลายลักษณ์อักษร", "อย่าพึ่งคำสัญญาที่ตรวจสอบไม่ได้"),
    "Pluto": ("เลือกสิ่งที่ควรหยุดเพื่อคืนพื้นที่ให้เรื่องสำคัญ", "อย่าใช้แรงกดดันแทนการคุยตรง ๆ"),
    "Chiron": ("ทบทวนบทเรียนเดิมและขอความช่วยเหลือในจุดที่ยังติด", "อย่าเหมารวมว่าประสบการณ์ครั้งก่อนจะซ้ำเดิม"),
}

SIGN_STYLE = {
    "Aries": "เริ่มไวและเรียนรู้จากการลงมือ",
    "Taurus": "ค่อย ๆ สร้างความมั่นคงจากสิ่งที่จับต้องได้",
    "Gemini": "คิดผ่านการพูดคุยและเชื่อมข้อมูลหลายด้าน",
    "Cancer": "ให้ความสำคัญกับความไว้ใจและพื้นที่ปลอดภัย",
    "Leo": "ต้องเห็นความหมายของสิ่งที่ทำและกล้าแสดงจุดยืน",
    "Virgo": "สบายใจเมื่อเรื่องต่าง ๆ มีระบบและตรวจรายละเอียดได้",
    "Libra": "มองหลายฝ่ายและพยายามหาจุดที่อยู่ร่วมกันได้",
    "Scorpio": "มองลึกถึงเหตุผลและไม่ชอบปล่อยปัญหาค้างคา",
    "Sagittarius": "ต้องเห็นภาพกว้างและมีพื้นที่ให้เรียนรู้สิ่งใหม่",
    "Capricorn": "คิดเป็นขั้นตอนและให้คุณค่ากับสิ่งที่อยู่ได้นาน",
    "Aquarius": "ต้องมีอิสระทางความคิดและชอบทดลองวิธีที่ต่างออกไป",
    "Pisces": "รับบรรยากาศรอบตัวไวและใช้จินตนาการช่วยหาคำตอบ",
}

SIGN_ACTION = {
    "Aries": "กำหนดงานชิ้นแรกที่เริ่มได้ทันทีและปิดให้จบก่อนรับเรื่องใหม่",
    "Taurus": "จัดทรัพยากร เวลา และขั้นตอนให้มั่นคงก่อนขยายงาน",
    "Gemini": "เขียนประเด็นสำคัญแล้วคุยยืนยันความเข้าใจกับผู้เกี่ยวข้อง",
    "Cancer": "สร้างข้อตกลงที่ทำให้ทุกฝ่ายรู้สึกปลอดภัยและพูดความกังวลได้",
    "Leo": "ระบุผลงานที่ต้องการยืนหยัดและสื่อสารเหตุผลให้ชัด",
    "Virgo": "ทำรายการตรวจงานและแก้จุดผิดพลาดที่กระทบผลลัพธ์มากที่สุด",
    "Libra": "ฟังความต้องการของแต่ละฝ่ายแล้วเขียนข้อตกลงกลางที่ตรวจได้",
    "Scorpio": "หาสาเหตุรากของปัญหาและตัดขั้นตอนที่ไม่สร้างคุณค่า",
    "Sagittarius": "เลือกเรื่องเรียนรู้ที่ช่วยเป้าหมายหลักและนำไปทดลองกับงานจริง",
    "Capricorn": "แตกเป้าหมายระยะยาวเป็นหมุดหมายพร้อมเจ้าของงานและวันส่ง",
    "Aquarius": "ทดลองวิธีใหม่ในขอบเขตเล็กและเก็บผลก่อนเปลี่ยนระบบหลัก",
    "Pisces": "เปลี่ยนภาพที่คิดไว้เป็นตัวอย่างให้คนอื่นเห็นและช่วยตรวจความเข้าใจ",
}

SIGN_CAUTION = {
    "Aries": "อย่ารีบจนข้ามรายละเอียดหรือจังหวะของคนอื่น",
    "Taurus": "อย่ายึดวิธีเดิมเพียงเพราะคุ้นเคย",
    "Gemini": "อย่ารับข้อมูลหลายทางจนไม่มีข้อสรุป",
    "Cancer": "อย่ารับความกังวลของทุกคนมาเป็นภาระของตัวเอง",
    "Leo": "อย่าผูกคุณค่าของตัวเองกับการยอมรับจากคนอื่น",
    "Virgo": "อย่าแก้รายละเอียดจนงานหลักไม่เดิน",
    "Libra": "อย่ารักษาความราบรื่นด้วยการเลี่ยงประเด็นที่ต้องตกลง",
    "Scorpio": "อย่าควบคุมสถานการณ์แทนการพูดความต้องการตรง ๆ",
    "Sagittarius": "อย่าขยายแผนก่อนเช็กเวลาและกำลังที่มี",
    "Capricorn": "อย่ากดดันตัวเองด้วยเป้าหมายที่ไม่มีจุดพัก",
    "Aquarius": "อย่าเปลี่ยนระบบเพียงเพราะอยากหลุดจากความจำเจ",
    "Pisces": "อย่าตกลงกับสิ่งที่ยังอธิบายเงื่อนไขไม่ได้",
}

PAIR_PLAIN = {
    frozenset(["Mercury", "Neptune"]): "อีกด้าน คุณมักเชื่อมข้อมูลกับจินตนาการได้ดี จึงคิดภาพใหม่ได้ไว แต่ต้องแยกข้อเท็จจริงออกจากสิ่งที่คาดหวัง",
    frozenset(["Sun", "Jupiter"]): "ความมั่นใจกับการมองภาพกว้างช่วยให้คุณพาคนไปข้างหน้าได้ แต่ควรเช็กกำลังและข้อจำกัดก่อนรับปาก",
    frozenset(["Sun", "Saturn"]): "ความตั้งใจกับวินัยช่วยให้คุณทำเรื่องยาวได้ดี แต่ควรระวังการกดดันตัวเองเกินจำเป็น",
    frozenset(["Venus", "Mars"]): "คุณมีทั้งแรงลงมือและความไวต่อความต้องการของคน จึงเหมาะกับงานที่ต้องสร้างและปรับจากเสียงตอบรับ",
    frozenset(["Mercury", "Pluto"]): "คุณมีแนวโน้มมองลึกและจับจุดที่คนอื่นมองข้าม แต่ควรระวังคำพูดที่แรงหรือการยึดข้อสรุปเร็วเกินไป",
    frozenset(["Venus", "Pluto"]): "คุณให้คุณค่ากับความสัมพันธ์และสิ่งที่เลือกอย่างจริงจัง จึงควรคุยเรื่องขอบเขตและอำนาจตัดสินใจให้ชัด",
    frozenset(["Jupiter", "Saturn"]): "คุณทำได้ดีเมื่อวางภาพใหญ่คู่กับข้อจำกัดจริง จังหวะสำคัญคือรู้ว่าเมื่อไรควรขยายและเมื่อไรควรรอ",
    frozenset(["Saturn", "True Node"]): "คุณมักจริงจังกับภาระที่รับไว้ จึงควรแยกสิ่งที่จำเป็นออกจากแรงกดดันที่ไม่ใช่หน้าที่ของคุณ",
}

THAI_MONTHS = (
    "", "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
    "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
)


def _thai_date(value: date) -> str:
    return f"{value.day} {THAI_MONTHS[value.month]} {value.year + 543}"


def _completed_age(birth_date: date, reference_date: date) -> int:
    age = reference_date.year - birth_date.year
    try:
        birthday = birth_date.replace(year=reference_date.year)
    except ValueError:  # 29 February in a non-leap year
        birthday = date(reference_date.year, 2, 28)
    return age - (reference_date < birthday)


def _find_current_period(
    timeline: Dict[str, Any], reference_date: date
) -> Tuple[Optional[Dict[str, Any]], Optional[Dict[str, Any]]]:
    for major in timeline.get("major_periods", []):
        start = date.fromisoformat(major["start_date"])
        end = date.fromisoformat(major["end_date"])
        if start <= reference_date < end or (
            reference_date == end and major is timeline.get("major_periods", [])[-1]
        ):
            for sub in major.get("sub_periods", []):
                sub_start = date.fromisoformat(sub["start_date"])
                sub_end = date.fromisoformat(sub["end_date"])
                if sub_start <= reference_date < sub_end or (
                    reference_date == sub_end and sub is major.get("sub_periods", [])[-1]
                ):
                    return major, sub
            return major, None
    return None, None


def _year_entry(timeline: Dict[str, Any], age: int) -> Optional[Dict[str, Any]]:
    return next((row for row in timeline.get("years_map", []) if row.get("age") == age), None)


def _placement_phrase(context: Dict[str, Any]) -> str:
    placement = context["placement"]
    if placement["status"] != "known":
        return "ยังไม่มีตำแหน่งดาวในพื้นดวง"
    house = placement.get("house")
    focus = HOUSE_FOCUS.get(house, "เรื่องที่เกี่ยวข้องในพื้นดวง")
    sign = placement.get("sign_thai") or placement.get("sign") or "ไม่ทราบราศี"
    return f"อยู่{sign} เรือน {house} จึงเน้น{focus}"


def _context_focuses(context: Dict[str, Any]) -> List[str]:
    focuses: List[str] = []
    placement_house = context.get("placement", {}).get("house")
    if placement_house in HOUSE_FOCUS:
        focuses.append(HOUSE_FOCUS[placement_house])
    for item in context.get("house_rulership", {}).get("houses", []):
        focus = HOUSE_FOCUS.get(item.get("house"))
        if focus and focus not in focuses:
            focuses.append(focus)
    return focuses


def _context_source(kind: str, role: str, context: Dict[str, Any]) -> Dict[str, str]:
    placement = context.get("placement", {})
    rulership = context.get("house_rulership", {})
    if placement.get("status") == "known":
        placed = f"{placement.get('planet_thai') or placement.get('planet_name')} {placement.get('sign_thai') or placement.get('sign')} เรือน {placement.get('house')}"
    else:
        placed = "ตำแหน่งไม่ทราบ"
    if rulership.get("status") == "known":
        ruled = ", ".join(str(item["house"]) for item in rulership.get("houses", [])) or "ไม่มีเรือนที่ครองตามระบบนี้"
    elif rulership.get("scheme") == "not_applicable_to_angle":
        ruled = "ไม่ใช้กับจุดมุม"
    else:
        ruled = "ไม่ทราบ (ข้อมูล cusp ไม่ครบ)"
    dispositor = context.get("sign_dispositor", {})
    disp_place = dispositor.get("ruler_placement") or {}
    disp = (
        f"เจ้า{dispositor.get('basis_sign')}={dispositor.get('ruler_planet_thai')} "
        f"อยู่{disp_place.get('sign_thai') or disp_place.get('sign')} เรือน {disp_place.get('house')} "
        f"({dispositor.get('relationship_to_planet', {}).get('status')}/"
        f"{dispositor.get('relationship_to_planet', {}).get('type') or 'ไม่มีกฎคู่'})"
        if dispositor.get("status") == "known" else "เจ้าแห่งราศี: ไม่ทราบ"
    )
    occupied = context.get("occupied_house_ruler", {})
    occ_place = occupied.get("ruler_placement") or {}
    occ = (
        f"เจ้า cusp เรือนที่อยู่={occupied.get('ruler_planet_thai')} "
        f"อยู่{occ_place.get('sign_thai') or occ_place.get('sign')} เรือน {occ_place.get('house')}"
        if occupied.get("status") == "known" else "เจ้า cusp เรือนที่อยู่: ไม่ทราบ"
    )
    return _source(kind, f"{role}: {placed}; ครองเรือนจาก cusp: {ruled}; {disp}; {occ}")


def _context_relationship_sources(role: str, context: Dict[str, Any]) -> List[Dict[str, str]]:
    return [
        _source(
            "natal_pair_relationship",
            f"{role}↔{item.get('with_planet_thai') or item.get('with_planet')}: "
            f"{item.get('status')} / {item.get('type') or 'ไม่มีกฎระบุ'}",
        )
        for item in context.get("relationships", [])
    ]


def _relationship_phrase(
    chart: Dict[str, Any], first_name: str, second_name: str
) -> Tuple[str, Dict[str, Any]]:
    planets = chart.get("planets_dict", {})
    first = planets.get(canonical_planet_name(first_name), {})
    second = planets.get(canonical_planet_name(second_name), {})
    first_chart_name = canonical_planet_name(first_name)
    second_chart_name = canonical_planet_name(second_name)
    if first_chart_name == second_chart_name:
        evidence = {
            "between": [first_chart_name, second_chart_name],
            "status": "known",
            "type": "same_planet",
            "nature": "concentrated",
        }
        return "แรงหลักและแรงย่อยมาจากจุดเดียวกัน จึงควรเลือกเป้าหมายเดียวให้ชัด", evidence
    relationship = evaluate_relationship(first.get("thaksa_num"), second.get("thaksa_num")) \
        if first.get("thaksa_num") and second.get("thaksa_num") else None
    evidence = {
        "between": [canonical_planet_name(first_name), canonical_planet_name(second_name)],
        "status": "known" if relationship else "unknown",
        "type": relationship.get("type") if relationship else None,
        "nature": relationship.get("nature") if relationship else None,
    }
    if relationship and relationship.get("nature") == "positive":
        return "สองแรงหลักประสานกันได้ดีเมื่อแบ่งบทบาทชัด แต่ยังต้องดูผลที่เกิดขึ้นจริง", evidence
    if relationship and relationship.get("nature") == "negative":
        return "สองแรงหลักมีจังหวะตึงกัน จึงควรชะลอและเช็กขอบเขตก่อนตกลง", evidence
    if relationship:
        return "สองแรงหลักมีรูปแบบเฉพาะ ควรเช็กข้อดี ข้อเสีย และผลกระทบก่อนเลือกทางเดิน", evidence
    return "ทดลองทีละขั้น แล้วใช้ผลที่เกิดขึ้นจริงช่วยตัดสินใจ", evidence


def _relationship_practice(relationship: Dict[str, Any]) -> Tuple[str, str]:
    nature = relationship.get("nature")
    if nature == "positive":
        return (
            "ทดลองแบ่งบทบาทกับคนที่เกี่ยวข้องแล้วนัดเช็กผล",
            "อย่าคิดว่าความเข้ากันได้จะรับรองผลลัพธ์",
        )
    if nature == "negative":
        return (
            "ทวนขอบเขต เวลา และความคาดหวังก่อนตกลง",
            "อย่าตัดสินใจตอนบทสนทนายังตึง",
        )
    if nature == "concentrated":
        return (
            "เลือกเป้าหมายเดียวและกันเวลาให้เต็มที่",
            "อย่าแบกหลายเรื่องสำคัญพร้อมกัน",
        )
    return (
        "ตั้งเกณฑ์วัดผลเล็ก ๆ แล้วกลับมาดูข้อมูลจริง",
        "อย่าสรุปว่าคนหรือจังหวะเข้ากันหรือขัดกันโดยไม่มีหลักฐาน",
    )


def _context_dynamic_practice(context: Dict[str, Any]) -> Tuple[str, str]:
    """Turn explicit pair rules and actual natal aspects into plain advice."""
    relation_natures = {
        item.get("nature") for item in context.get("relationships", [])
        if item.get("status") == "known"
    }
    aspect_names = {
        item.get("aspect_name") for item in context.get("natal_aspects", [])
    }
    hard_aspects = {"Opposition", "Square", "Semi-Square", "Sesquiquadrate", "Quincunx"}
    easy_aspects = {"Trine", "Sextile", "Conjunction"}
    if "negative" in relation_natures or aspect_names & hard_aspects:
        return (
            "ทวนขอบเขตและผลกระทบกับคนที่เกี่ยวข้องก่อนลงมือ",
            "อย่าเร่งข้อสรุปเมื่อยังมีจุดเห็นต่าง",
        )
    if "positive" in relation_natures or aspect_names & easy_aspects:
        return (
            "แบ่งบทบาทให้ชัด ทดลองทำร่วมกัน แล้วนัดดูผล",
            "อย่าคิดว่าจังหวะที่เข้ากันจะรับรองผลลัพธ์",
        )
    return (
        "กำหนดผลที่อยากเห็นหนึ่งข้อ แล้วทดลองทีละขั้น",
        "อย่าตัดสินจากความรู้สึกเข้ากันหรือขัดกันเพียงอย่างเดียว",
    )


def _practice(planet_name: str) -> Tuple[str, str]:
    return PLANET_PRACTICE.get(
        canonical_planet_name(planet_name),
        ("เลือกหนึ่งเรื่องที่ทำได้จริงและกำหนดเวลาทบทวน", "อย่าคาดเดาแทนข้อมูลที่ตรวจสอบได้"),
    )


def _placement_practice(context: Dict[str, Any]) -> Tuple[str, str]:
    sign = context.get("placement", {}).get("sign")
    return (
        SIGN_ACTION.get(sign, "กำหนดผลลัพธ์ที่ตรวจได้และนัดวันทบทวน"),
        SIGN_CAUTION.get(sign, "อย่าคาดเดาแทนข้อมูลที่ตรวจสอบได้"),
    )


def _natal_target_context(
    chart: Dict[str, Any], target_name: str, related: List[str]
) -> Dict[str, Any]:
    if target_name in chart.get("planets_dict", {}):
        return build_planetary_context(chart, target_name, related)
    angle_keys = {"Ascendant": ("Ascendant", 1), "Midheaven": ("Midheaven", 10)}
    angle_key, house = angle_keys.get(target_name, (None, None))
    angle = chart.get("angles", {}).get(angle_key, {}) if angle_key else {}
    if not angle:
        return build_planetary_context(chart, target_name, related)
    ruler = SIGN_RULERS.get(angle.get("sign"))
    ruler_context = build_planetary_context(chart, ruler["name"], related) if ruler else None
    ruler_placement = (ruler_context or {}).get("placement", {})
    link = {
        "status": ruler_placement.get("status", "unknown"),
        "basis_sign": angle.get("sign"),
        "ruler_planet": ruler.get("name") if ruler else None,
        "ruler_planet_thai": ruler.get("thai") if ruler else None,
        "ruler_placement": {
            "sign": ruler_placement.get("sign"),
            "sign_thai": ruler_placement.get("sign_thai"),
            "house": ruler_placement.get("house"),
        } if ruler_placement.get("status") == "known" else None,
        "relationship_to_planet": {"status": "unknown", "type": None, "nature": None},
    }
    return {
        "placement": {
            "status": "known", "planet_name": target_name,
            "planet_thai": angle.get("thai"), "sign": angle.get("sign"),
            "sign_thai": angle.get("sign_thai"), "house": house,
            "house_theme": HOUSE_SIGNIFICATIONS.get(house, {}).get("theme"),
        },
        "house_rulership": {
            "status": "unknown", "scheme": "not_applicable_to_angle",
            "houses": [], "missing_cusp_houses": [],
        },
        "sign_dispositor": link,
        "occupied_house_ruler": {**link, "occupied_house": house},
        "dignity": {"status": "unknown", "type": None, "score": None},
        "relationships": [], "natal_aspects": [],
    }


def _unique_limited(items: Iterable[str], limit: int = 3) -> List[str]:
    result = []
    for item in items:
        if item and item not in result:
            result.append(item)
        if len(result) == limit:
            break
    return result


def _join_thai(items: Iterable[str]) -> str:
    values = _unique_limited(items, 3)
    if len(values) <= 1:
        return values[0] if values else ""
    if len(values) == 2:
        return f"{values[0]} รวมถึง{values[1]}"
    return f"{values[0]}, {values[1]} และ{values[2]}"


def _source(kind: str, label: str) -> Dict[str, str]:
    return {"kind": kind, "label": label}


def _ruler_ref(period: Optional[Dict[str, Any]]) -> Optional[Dict[str, str]]:
    if not period:
        return None
    name = period.get("planet_name") or period.get("name")
    thai = period.get("planet_thai") or period.get("thai")
    return {"name": name, "thai": thai} if name and thai else None


def _strongest_relevant_aspect(context: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    aspects = context.get("natal_aspects", [])
    if not aspects:
        return None
    major_names = {"Conjunction", "Opposition", "Square", "Trine", "Sextile"}
    return min(
        aspects,
        key=lambda item: (
            0 if item.get("aspect_name") in major_names else 1,
            item.get("orb") if item.get("orb") is not None else 999,
        ),
    )


def _period_personalized_text(
    major_context: Dict[str, Any], sub_context: Dict[str, Any],
    relation_text: str, relation: Dict[str, Any], sub: Dict[str, Any],
) -> Tuple[str, List[str], List[str]]:
    placement = major_context.get("placement", {})
    sign = placement.get("sign")
    main_focus = next(iter(_context_focuses(major_context)), "เป้าหมายระยะยาว")
    ruled_focuses = _context_focuses(major_context)[1:3]
    ruled_text = _join_thai(ruled_focuses)
    style = SIGN_STYLE.get(sign, "ทำทีละขั้นและกลับมาดูผลจริง")
    sign_action = SIGN_ACTION.get(sign, "กำหนดผลลัพธ์ที่ตรวจได้และนัดวันทบทวน")

    dignity = major_context.get("dignity", {})
    score = dignity.get("score")
    if isinstance(score, (int, float)) and score > 0:
        strength_text = "จุดแข็งนี้ออกตัวได้ค่อนข้างเป็นธรรมชาติ แต่ยังต้องมีเป้าหมายวัดผล"
        dignity_avoid = "อย่าพึ่งความถนัดจนข้ามการตรวจรายละเอียด"
    elif isinstance(score, (int, float)) and score < 0:
        strength_text = "เรื่องนี้ต้องอาศัยระบบและการฝึกซ้ำ จึงจะเปลี่ยนแรงกดดันเป็นความชำนาญ"
        dignity_avoid = "อย่าเร่งผลลัพธ์หรือเทียบจังหวะของตัวเองกับคนอื่น"
    else:
        strength_text = "ความสามารถส่วนนี้เด่นขึ้นเมื่อมีกรอบงานและข้อมูลย้อนกลับที่ชัด"
        dignity_avoid = "อย่าปล่อยให้เป้าหมายกว้างจนวัดความคืบหน้าไม่ได้"

    dispositor = major_context.get("sign_dispositor", {})
    disp_house = (dispositor.get("ruler_placement") or {}).get("house")
    disp_focus = HOUSE_FOCUS.get(disp_house)
    occupied_ruler = major_context.get("occupied_house_ruler", {})
    occupied_ruler_house = (occupied_ruler.get("ruler_placement") or {}).get("house")
    occupied_focus = HOUSE_FOCUS.get(occupied_ruler_house)

    aspect = _strongest_relevant_aspect(major_context)
    aspect_note = ""
    aspect_do = ""
    aspect_avoid = ""
    if aspect:
        pair_key = frozenset([placement.get("planet_name"), aspect.get("with_planet")])
        curated = NOTABLE_PAIR_INTERPRETATIONS.get(pair_key)
        if curated:
            aspect_note = PAIR_PLAIN.get(
                pair_key,
                "อีกด้าน ความสามารถสองแบบในตัวคุณทำงานร่วมกันเด่นชัด จึงควรใช้จุดแข็งพร้อมตรวจผลกระทบ",
            )
            aspect_do = curated["empowerment"]
            aspect_avoid = curated["challenges"]
        else:
            dynamic_do, dynamic_avoid = _context_dynamic_practice(major_context)
            aspect_note = f"ความสัมพันธ์เด่นในพื้นดวงทำให้เรื่องนี้ต้องใช้ทั้งจุดแข็งและการตรวจผลจริง"
            aspect_do, aspect_avoid = dynamic_do, dynamic_avoid

    sub_focus = next(iter(_context_focuses(sub_context)), "งานตรงหน้า")
    summary_parts = [
        f"ช่วงชีวิตนี้เน้น{main_focus} วิธีที่เหมาะกับคุณคือ{style}",
        f"{strength_text}{f' และผลของการตัดสินใจมักโยงถึง{ruled_text}' if ruled_text else ''}",
    ]
    if disp_focus or occupied_focus:
        linked = _join_thai([disp_focus, occupied_focus])
        summary_parts.append(f"แรงสนับสนุนเบื้องหลังมาจาก{linked}")
    if aspect_note:
        summary_parts.append(aspect_note)
    summary_parts.append(
        f"ช่วงย่อยถึง {_thai_date(date.fromisoformat(sub['end_date']))} ดึง{sub_focus}เข้ามาเป็นเรื่องรอง; {relation_text}"
    )
    relation_do, relation_avoid = _relationship_practice(relation)
    impact_check = (
        f"ก่อนตัดสินใจเรื่อง{main_focus} ให้เช็กผลต่อ{ruled_text}"
        if ruled_text else f"กำหนดเกณฑ์วัดผลของ{main_focus}ก่อนเริ่ม"
    )
    do_items = _unique_limited([sign_action, impact_check, aspect_do or relation_do])
    avoid_items = _unique_limited([aspect_avoid, dignity_avoid, relation_avoid])
    return ". ".join(summary_parts), do_items, avoid_items


def _period_card(
    chart: Dict[str, Any], major: Optional[Dict[str, Any]], sub: Optional[Dict[str, Any]]
) -> Dict[str, Any]:
    if not major or not sub:
        return {
            "title": "ช่วงนี้: อยู่นอกกรอบ 108 ปี",
            "summary": "วันที่อ้างอิงไม่อยู่ในช่วงดาวเสวยอายุที่คำนวณไว้ จึงไม่สร้างช่วงเวลาแทนข้อมูลที่หายไป",
            "do": ["ใช้ข้อมูลพื้นดวงเป็นคำถามสำหรับทบทวนชีวิตปัจจุบัน"],
            "avoid": ["อย่าสมมติช่วงดาวเสวยอายุที่ไม่มีในผลคำนวณ"],
            "sources": [],
            "start_date": None,
            "end_date": None,
            "time_scope": "outside_108_year_timeline",
            "context": {"major_planet": None, "sub_planet": None},
            "evidence": {"status": "unknown"},
        }

    major_name = major["planet_name"]
    sub_name = sub["planet_name"]
    related = list(chart.get("planets_dict", {}).keys()) + [major_name, sub_name, "Sun"]
    major_context = build_planetary_context(chart, major_name, related)
    sub_context = build_planetary_context(chart, sub_name, [major_name, sub_name, "Sun", "Moon"])
    relation_text, relation = _relationship_phrase(chart, major_name, sub_name)
    summary, period_do, period_avoid = _period_personalized_text(
        major_context, sub_context, relation_text, relation, sub
    )
    strongest_aspect = _strongest_relevant_aspect(major_context)
    return {
        "title": "ช่วงนี้: ธีมหลักของชีวิต",
        "summary": summary,
        "do": period_do,
        "avoid": period_avoid,
        "sources": [
            _source("major_period", f"ดาว{major['planet_thai']} {major['start_date']}–{major['end_date']}"),
            _source("sub_period", f"ดาว{sub['planet_thai']} {sub['start_date']}–{sub['end_date']}"),
            _context_source("major_natal_context", "ดาวเสวยอายุ", major_context),
            _context_source("sub_natal_context", "ดาวแทรก", sub_context),
            _source("planetary_relationship", f"คู่ดาว: {relation['status']} / {relation.get('type') or 'ไม่มีกฎระบุ'}"),
            *([
                _source(
                    "strongest_natal_aspect",
                    f"{major['planet_thai']} {strongest_aspect.get('aspect_thai')} "
                    f"{strongest_aspect.get('with_planet')} · orb {strongest_aspect.get('orb')}°",
                )
            ] if strongest_aspect else []),
        ],
        "start_date": major["start_date"],
        "end_date": major["end_date"],
        "sub_start_date": sub["start_date"],
        "sub_end_date": sub["end_date"],
        "time_scope": "exact_current_major_period",
        "context": {
            "major_planet": _ruler_ref(major),
            "sub_planet": _ruler_ref(sub),
        },
        "evidence": {
            "major_period": {**major, "sub_periods": []},
            "sub_period": sub,
            "relationship": relation,
            "major_context": major_context,
            "sub_context": sub_context,
        },
    }


def _today_card(
    chart: Dict[str, Any], reference_date: date,
    major: Optional[Dict[str, Any]], sub: Optional[Dict[str, Any]],
) -> Dict[str, Any]:
    transits = calculate_transits_for_date(
        reference_date.isoformat(), BANGKOK_NOON_UTC_HOURS, chart,
        include_fast_bodies=True,
    )
    aspects = sorted(transits.get("active_aspects", []), key=lambda item: item.get("orb", 999))
    leading = aspects[:3]
    relevant = ["Sun"]
    if major:
        relevant.append(major["planet_name"])
    if sub:
        relevant.append(sub["planet_name"])
    relevant.extend(item.get("natal_target") for item in leading if item.get("natal_target"))
    contexts = {
        name: _natal_target_context(chart, name, relevant)
        for name in dict.fromkeys(relevant)
    }
    transit_relationships = []

    if leading:
        first = leading[0]
        target = chart.get("planets_dict", {}).get(first["natal_target"], {})
        focus = HOUSE_FOCUS.get(target.get("house"), "งานที่กำลังทำ")
        if first.get("aspect_nature") == "challenging":
            summary = f"วันนี้ควรเผื่อเวลาและตรวจรายละเอียดในเรื่อง{focus}ก่อนตอบตกลงหรือเปลี่ยนแผน"
        elif first.get("aspect_nature") == "harmonious":
            summary = f"วันนี้เหมาะกับการทดลองขยับเรื่อง{focus}ทีละขั้น แล้วดูผลตอบรับจริง"
        else:
            summary = f"วันนี้ให้สังเกตเรื่อง{focus}เป็นพิเศษ แล้วใช้ข้อมูลจริงกำหนดจังหวะลงมือ"
        transit_do = []
        transit_avoid = []
        seen_focuses = set()
        for aspect in leading:
            target_context = _natal_target_context(chart, aspect["natal_target"], relevant)
            target_focus = next(iter(_context_focuses(target_context)), "งานที่กำลังทำ")
            if target_focus in seen_focuses:
                continue
            seen_focuses.add(target_focus)
            action, caution = _placement_practice(target_context)
            _, transit_relation = _relationship_phrase(
                chart, aspect["transit_planet"], aspect["natal_target"]
            )
            transit_relationships.append({
                "transit_planet": aspect["transit_planet"],
                "natal_target": aspect["natal_target"],
                **transit_relation,
            })
            relation_do, relation_avoid = _relationship_practice(transit_relation)
            transit_do.append(f"กับ{target_focus}: {action}; {relation_do}")
            transit_avoid.append(f"กับ{target_focus}: {caution}; {relation_avoid}")
    else:
        summary = "วันนี้ไม่มีจุดเด่นตามเกณฑ์รายวันที่ใช้ จึงเหมาะกับการจัดลำดับงานและทำสิ่งที่ค้างให้จบ"
        transit_do, transit_avoid = [], []

    if sub:
        sub_context = contexts.get(sub["planet_name"], {})
        sub_do, sub_avoid = _placement_practice(sub_context)
        sub_focus = next(iter(_context_focuses(sub_context)), "งานตรงหน้า")
        transit_do.append(f"กับ{sub_focus}: {sub_do}")
        transit_avoid.append(f"กับ{sub_focus}: {sub_avoid}")
    return {
        "title": "วันนี้: ดูหนึ่งจังหวะแล้วลงมือ",
        "summary": summary,
        "do": _unique_limited(transit_do),
        "avoid": _unique_limited(transit_avoid),
        "sources": [
            _source("daily_transits", f"ดาวจรจริง {_thai_date(reference_date)} เวลา 12:00 น. กรุงเทพฯ"),
            *[
                _source(
                    "transit_aspect",
                    f"{item['transit_thai']} {item['aspect_thai']} {item['natal_thai']} · orb {item['orb']:.2f}°",
                ) for item in leading
            ],
            *[
                _context_source("relevant_natal_context", name, context)
                for name, context in contexts.items()
            ],
            *[
                _source(
                    "transit_pair_relationship",
                    f"{item['transit_planet']}→{item['natal_target']}: {item['status']} / {item.get('type') or 'ไม่มีกฎระบุ'}",
                ) for item in transit_relationships
            ],
            *([_source("current_period", f"ช่วงดาว{sub['planet_thai']}แทรก")] if sub else []),
        ],
        "date_label": f"{_thai_date(reference_date)} · 12:00 น. กรุงเทพฯ",
        "time_scope": "bangkok_noon_snapshot",
        "context": {
            "major_planet": _ruler_ref(major),
            "sub_planet": _ruler_ref(sub),
        },
        "evidence": {
            "transits": transits,
            "relevant_ruler_contexts": contexts,
            "transit_relationships": transit_relationships,
        },
    }


def _year_card(
    chart: Dict[str, Any], timeline: Dict[str, Any], reference_date: date,
    age: int, major: Optional[Dict[str, Any]], sub: Optional[Dict[str, Any]],
) -> Dict[str, Any]:
    row = _year_entry(timeline, age)
    if not row:
        return {
            "title": f"ปีนี้: อายุ {age} ปี",
            "summary": "อายุ ณ วันที่อ้างอิงอยู่นอกแผนที่ 108 ปี จึงไม่มีจุดกระทบฐาน 30° สำหรับช่วงนี้",
            "do": ["ใช้เหตุการณ์จริงของปีนี้ตั้งเป้าหมายที่ตรวจความคืบหน้าได้"],
            "avoid": ["อย่าสร้างจุดกระทบหรือคำทำนายแทนข้อมูลที่ไม่มี"],
            "sources": [],
            "age": age,
            "calendar_year": reference_date.year,
            "date_label": f"ปี {reference_date.year} · อายุ {age} ปี ณ {_thai_date(reference_date)}",
            "time_scope": "outside_108_year_timeline",
            "context": {
                "major_planet": None, "sub_planet": None, "annual_planet": None,
                "age": age, "calendar_year": reference_date.year,
            },
            "evidence": {"status": "unknown", "harmonic_hits": []},
        }

    hits = row.get("degree_triggers", [])
    major_name = row["major_planet"]["name"]
    sub_name = row["sub_planet"]["name"]
    related_names = [major_name, sub_name, "Sun", *[hit["planet_name"] for hit in hits]]
    ruler_contexts = {
        "major": build_planetary_context(chart, major_name, related_names),
        "sub": build_planetary_context(chart, sub_name, related_names),
    }
    hit_evidence = []
    for hit in hits:
        hit_evidence.append({
            **hit,
            "planetary_context": build_planetary_context(chart, hit["planet_name"], related_names),
        })

    relation_text, relation = _relationship_phrase(chart, major_name, sub_name)
    relation_do, relation_avoid = _relationship_practice(relation)
    if hits:
        hit_focuses = []
        for item in hit_evidence:
            hit_focuses.extend(_context_focuses(item["planetary_context"]))
        focus_text = " และ ".join(_unique_limited(hit_focuses)) or "เรื่องสำคัญที่กำลังเกิดขึ้น"
        summary = (
            f"ช่วงอายุนี้มี {len(hits)} ประเด็นให้ทบทวน โดยเน้น{focus_text}. {relation_text} "
            "นี่เป็นหัวข้อทบทวนตามช่วงอายุ ไม่ใช่คำพยากรณ์ต่อเนื่องทั้งปี"
        )
        do_items = [relation_do]
        avoid_items = [relation_avoid]
        for item in hit_evidence:
            focus = next(iter(_context_focuses(item["planetary_context"])), "เรื่องที่กำลังทบทวน")
            action, caution = _placement_practice(item["planetary_context"])
            dynamic_do, dynamic_avoid = _context_dynamic_practice(item["planetary_context"])
            do_items.append(f"กับ{focus}: {dynamic_do}; {action}")
            avoid_items.append(f"กับ{focus}: {dynamic_avoid}; {caution}")
    else:
        summary = (
            f"ช่วงอายุนี้ไม่มีหัวข้อพิเศษจากวิธีคำนวณที่ใช้ จึงกลับมาเน้นเป้าหมายหลักและงานตรงหน้า. {relation_text} "
            "ข้อมูลนี้ไม่ได้หมายความว่าปีนี้จะไม่มีเหตุการณ์สำคัญ"
        )
        sub_do, sub_avoid = _placement_practice(ruler_contexts["sub"])
        major_do, _ = _placement_practice(ruler_contexts["major"])
        do_items = [relation_do, sub_do, major_do]
        avoid_items = [relation_avoid, sub_avoid]

    return {
        "title": f"ปีนี้: อายุ {age} ปี ณ วันที่อ้างอิง",
        "summary": summary,
        "do": _unique_limited(do_items),
        "avoid": _unique_limited(avoid_items),
        "sources": [
            _source("reference_age", f"อายุ {age} ปี ณ {_thai_date(reference_date)}"),
            _source("harmonic_30", f"จุดกระทบฐาน 30° จำนวน {len(hits)} จุด"),
            _source("period_context", f"{row['major_planet']['thai']}เสวยอายุ · {row['sub_planet']['thai']}แทรก"),
            _context_source("major_natal_context", "ดาวเสวยอายุ", ruler_contexts["major"]),
            _context_source("sub_natal_context", "ดาวแทรก", ruler_contexts["sub"]),
            _source("planetary_relationship", f"คู่ดาว: {relation['status']} / {relation.get('type') or 'ไม่มีกฎระบุ'}"),
            *[
                _context_source("harmonic_hit_context", f"ดาว{item['planet_thai']}", item["planetary_context"])
                for item in hit_evidence
            ],
            *[
                source
                for item in hit_evidence
                for source in _context_relationship_sources(
                    f"ดาว{item['planet_thai']}", item["planetary_context"]
                )
            ],
        ],
        "age": age,
        "calendar_year": reference_date.year,
        "date_label": f"ปี {reference_date.year} · อายุ {age} ปี ณ {_thai_date(reference_date)}",
        "time_scope": "reference_age_harmonic_context",
        "context": {
            "major_planet": _ruler_ref(row["major_planet"]),
            "sub_planet": _ruler_ref(row["sub_planet"]),
            "annual_planet": _ruler_ref(row["annual_thaksa"]),
            "age": age,
            "calendar_year": reference_date.year,
        },
        "evidence": {
            "formula": "(planet_longitude - sun_longitude) % 30",
            "timing_note": "จุดอายุจากสูตรเชิงสัญลักษณ์ ไม่ใช่วันที่เกิดเหตุการณ์หรือดาวจรจริง",
            "harmonic_hits": hit_evidence,
            "ruler_contexts": ruler_contexts,
        },
    }


def _identity_card(chart: Dict[str, Any]) -> Dict[str, Any]:
    planets = chart.get("planets_dict", {})
    asc = chart.get("angles", {}).get("Ascendant", {})
    asc_sign = asc.get("sign")
    # Reuse cusp-derived ownership: the ruler of House 1 is whichever planet's
    # rulership context contains House 1.
    candidate_names = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"]
    contexts = {
        name: build_planetary_context(chart, name, ["Sun", "Moon", *candidate_names])
        for name in candidate_names
    }
    asc_ruler_name = next((
        name for name, context in contexts.items()
        if any(item["house"] == 1 for item in context["house_rulership"]["houses"])
    ), None)
    sun = planets.get("Sun", {})
    moon = planets.get("Moon", {})
    asc_ruler_context = contexts.get(asc_ruler_name) if asc_ruler_name else None
    if sun and moon and asc:
        sun_focus = next(iter(_context_focuses(contexts["Sun"])), "ทิศทางชีวิต")
        moon_focus = next(iter(_context_focuses(contexts["Moon"])), "ความสบายใจ")
        ruler_candidates = _context_focuses(asc_ruler_context) if asc_ruler_context else []
        ruler_focus = next(
            (focus for focus in ruler_candidates if focus not in {sun_focus, moon_focus}),
            "วิธีนำตัวเองในโลกภายนอก",
        )
        if ruler_focus == "ตัวตน":
            ruler_focus = "การตัดสินใจด้วยตัวเอง"
        sun_style = SIGN_STYLE.get(sun.get("sign"), "ตัดสินใจจากสิ่งที่มีความหมายกับตัวเอง")
        moon_style = SIGN_STYLE.get(moon.get("sign"), "ต้องมีจังหวะพักที่เหมาะกับตัวเอง")
        asc_ruler_placement = (asc_ruler_context or {}).get("placement", {})
        summary = (
            f"เมื่อต้องจัดการ{sun_focus} คุณมัก{sun_style}. เวลาตั้งหลัก คุณจะ{moon_style}; "
            f"สิ่งที่ควรดูประกอบคือ{ruler_focus}"
        )
    else:
        summary = "ข้อมูลอาทิตย์ จันทร์ หรือลัคนาไม่ครบ จึงแสดงเฉพาะส่วนที่ยืนยันจากพื้นดวงได้"

    sun_do, sun_avoid = _placement_practice(contexts["Sun"])
    moon_do, moon_avoid = _placement_practice(contexts["Moon"])
    ruler_do, ruler_avoid = _placement_practice(asc_ruler_context or {})
    return {
        "title": "ตัวตน: เข็มทิศที่ใช้ซ้ำได้",
        "summary": summary,
        "do": _unique_limited([
            f"กับ{sun_focus if sun else 'ทิศทางชีวิต'}: {sun_do}",
            f"กับ{moon_focus if moon else 'การดูแลความรู้สึก'}: {moon_do}",
            f"กับ{ruler_focus if asc_ruler_context else 'วิธีรับมือโลกภายนอก'}: {ruler_do}",
        ]),
        "avoid": _unique_limited([sun_avoid, moon_avoid, ruler_avoid]),
        "sources": [
            _source("natal_sun", "อาทิตย์: แก่นการตัดสินใจและทิศทาง"),
            _source("natal_moon", "จันทร์: ความต้องการภายในและจังหวะพัก"),
            _source("ascendant_ruler", f"เจ้าเรือนลัคนาจากราศีบน cusp เรือน 1: {asc_sign or 'ไม่ทราบ'}"),
            _context_source("sun_natal_context", "อาทิตย์", contexts["Sun"]),
            _context_source("moon_natal_context", "จันทร์", contexts["Moon"]),
            *([_context_source("ascendant_ruler_context", "เจ้าเรือนลัคนา", asc_ruler_context)] if asc_ruler_context else []),
        ],
        "time_scope": "natal_identity",
        "evidence": {
            "ascendant": asc,
            "ascendant_ruler": asc_ruler_name,
            "sun_context": contexts.get("Sun"),
            "moon_context": contexts.get("Moon"),
            "ascendant_ruler_context": asc_ruler_context,
        },
    }


def build_practical_guidance(
    chart: Dict[str, Any], timeline: Dict[str, Any], reference_date: str
) -> Dict[str, Any]:
    """Build the four bounded guidance cards for an explicit Bangkok date."""
    ref = date.fromisoformat(reference_date)
    birth_date = date.fromisoformat(chart["metadata"]["birth_date"])
    age = _completed_age(birth_date, ref)
    major, sub = _find_current_period(timeline, ref)
    return {
        "reference_date": ref.isoformat(),
        "time_scope": "explicit_reference_date_bangkok",
        "periods": {
            "today": _today_card(chart, ref, major, sub),
            "period": _period_card(chart, major, sub),
            "year": _year_card(chart, timeline, ref, age, major, sub),
            "identity": _identity_card(chart),
        },
    }
