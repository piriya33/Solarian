"""
Solarian Astrology Engine - Interpretation Engine (การวิเคราะห์พื้นดวงจากภาพใหญ่ไปเล็ก)
Hierarchical interpretation:
1. Macro: Maha Thaksa Period (ดาวเสวยอายุ) - Overarching life chapter and theme
2. Sub-Macro: Sub-period (ดาวแทรกอายุ) - Secondary focus and catalyst
3. Core Identity Trinity:
   - Sun (ดวงอาทิตย์): นิสัยสันดานลึก ๆ, เจตจำนงที่แท้จริง
   - Ascendant (ลัคนา): นิสัยและพฤติกรรมที่แสดงออกสู่ภายนอก
   - Moon (ดวงจันทร์): อารมณ์ ความรู้สึก ความต้องการภายใน
4. Micro / Annual: Transiting hits (ดาวจร) & Annual Thaksa (ทักษาจร)
"""

from __future__ import annotations
from typing import Dict, List, Any, Optional
from backend.engine.dignities import evaluate_dignity, evaluate_relationship, SIGN_RULERS

# Interpretations for Sun (แก่นแท้เจตจำนงและการวางแผนชีวิต)
SUN_INTERPRETATIONS = {
    "Aries": "ผู้นำเชิงรุก: มีพลังริเริ่มและกล้าได้กล้าเสีย คานงัดแห่งชีวิตคือการลงมือทำทันทีโดยไม่ลังเล",
    "Taurus": "ผู้สร้างความมั่งคั่งที่มั่นคง: หนักแน่น อดทนสูง คานงัดแห่งชีวิตคือการสะสมทรัพยากรและต่อยอดอย่างรอบคอบ",
    "Gemini": "นักเชื่อมโยงข้อมูลและโอกาส: ปรับตัวไว สติปัญญาเฉียบคม คานงัดแห่งชีวิตคือการสื่อสารและการต่อยอดเครือข่าย",
    "Cancer": "ผู้วางรากฐานและปกป้องคุณค่า: สัญชาตญาณลึกซึ้ง ผูกพันกับทีมและครอบครัว คานงัดแห่งชีวิตคือความไว้วางใจที่เหนียวแน่น",
    "Leo": "ผู้นำด้วยวิสัยทัศน์และเกียรติยศ: สง่างาม กล้าตัดสินใจ คานงัดแห่งชีวิตคือการสร้างความประทับใจและการนำทีมด้วยแรงบันดาลใจ",
    "Virgo": "นักพัฒนาระบบสู่ความสมบูรณ์แบบ: ประณีต วิเคราะห์แม่นยำ คานงัดแห่งชีวิตคือการเพิ่มประสิทธิภาพและกำจัดข้อผิดพลาด",
    "Libra": "นักเจรจายุทธศาสตร์และความสมดุล: มนุษยสัมพันธ์ยอดเยี่ยม ประนีประนอมเก่ง คานงัดแห่งชีวิตคือการสร้างพันธมิตรคุณภาพ",
    "Scorpio": "นักปฏิรูปและแปรสภาพวิกฤต: พลังจิตแกร่ง มองทะลุสถานการณ์ คานงัดแห่งชีวิตคือการฟื้นฟูและเปลี่ยนแปลงระดับโครงสร้าง",
    "Sagittarius": "นักแสวงหาความจริงและวิสัยทัศน์ไกล: มองการณ์กว้าง รักอิสระ คานงัดแห่งชีวิตคือการขยายตลาดและองค์ความรู้ระดับสากล",
    "Capricorn": "สถาปนิกชีวิตผู้สร้างความสำเร็จระยะยาว: รับผิดชอบสูง มีวินัยเหล็ก คานงัดแห่งชีวิตคือการสร้างระบบที่มั่นคงและยั่งยืนถาวร",
    "Aquarius": "นักนวัตกรรมและปฏิวัติแนวคิด: ก้าวหน้า ไม่ยึดติดกรอบเดิม คานงัดแห่งชีวิตคือการประยุกต์เทคโนโลยีและสร้างคุณค่าเพื่อส่วนรวม",
    "Pisces": "นักสังเคราะห์ญาณทัศน์และจินตนาการ: ลางสังหรณ์แม่นยำ เห็นภาพรวมลึกซึ้ง คานงัดแห่งชีวิตคือความคิดสร้างสรรค์ที่ไร้ขีดจำกัด"
}

# Interpretations for Ascendant (บุคลิกภาพ สไตล์การตัดสินใจ และการปรากฏตัว)
ASC_INTERPRETATIONS = {
    "Aries": "ปรากฏตัวกระฉับกระเฉง รวดเร็ว ตรงไปตรงมา ตัดสินใจไว พร้อมเผชิญหน้ากับความท้าทายอย่างมั่นใจ",
    "Taurus": "ปรากฏตัวสุขุม หนักแน่น นุ่มนวล ดูมั่นคงและน่าเชื่อถือตั้งแต่แรกพบ สร้างความรู้สึกปลอดภัยให้คนรอบข้าง",
    "Gemini": "ปรากฏตัวเป็นมิตร ช่างพูด ปฏิภาณไหวพริบดีเยี่ยม เปิดบทสนทนาและเชื่อมโยงผู้คนได้อย่างลื่นไหล",
    "Cancer": "ปรากฏตัวอบอุ่น อ่อนโยน เข้าอกเข้าใจผู้อื่นสูง มีแววตาที่จริงใจและสร้างความผูกพันได้เร็ว",
    "Leo": "ปรากฏตัวสง่างาม โดดเด่น มีออร่าความเป็นผู้นำ ดึงดูดสายตาและสร้างความเคารพเชื่อถือโดยธรรมชาติ",
    "Virgo": "ปรากฏตัวเรียบร้อย สะอาดสะอ้าน วางตัวถูกต้องตามกาลเทศะ ช่างสังเกตและมีความเป็นมืออาชีพสูง",
    "Libra": "ปรากฏตัวมีเสน่ห์ อ่อนหวาน รสนิยมดีเยี่ยม มีศิลปะในการเข้าสังคมและสร้างความประทับใจได้อย่างไร้ที่ติ",
    "Scorpio": "ปรากฏตัวนิ่งลึก แววตามีพลัง มีความลึกลับน่าเกรงขาม อ่านสถานการณ์และผู้คนได้อย่างแม่นยำ",
    "Sagittarius": "ปรากฏตัวเปิดเผย มีชีวิตชีวา มองโลกแง่ดี กระตือรือร้นและพร้อมเปิดรับประสบการณ์ใหม่อยู่เสมอ",
    "Capricorn": "ปรากฏตัวสุขุม เป็นผู้ใหญ่ น่าเชื่อถือ มีระเบียบแบบแผน ดูเป็นที่พึ่งพาในสถานการณ์สำคัญได้เสมอ",
    "Aquarius": "ปรากฏตัวมีเอกลักษณ์เฉพาะตัว เป็นตัวของตัวเองสูง เข้ากับคนได้ทุกกลุ่มอย่างเป็นกันเองและมีอิสระ",
    "Pisces": "ปรากฏตัวนุ่มนวล ยืดหยุ่น เข้าถึงความรู้สึกผู้อื่นได้ง่าย มีเสน่ห์ลึกลับและปรับตัวเข้ากับทุกสภาพแวดล้อมได้ดีเยี่ยม"
}

# Interpretations for Moon (สภาวะอารมณ์ กลไกคลายเครียด และความต้องการภายใน)
MOON_INTERPRETATIONS = {
    "Aries": "อารมณ์ตรงไปตรงมา คลี่คลายไว: ชาร์จพลังใจด้วยการลงมือทำทันทีและมีความเป็นอิสระในการตัดสินใจ",
    "Taurus": "อารมณ์มั่นคง หนักแน่น: ชาร์จพลังใจด้วยความสงบ ความมั่นคงทางการเงิน และสุนทรียภาพทางกายภาพ",
    "Gemini": "อารมณ์ปรับเปลี่ยนตามความคิด: ชาร์จพลังใจด้วยการแลกเปลี่ยนบทสนทนา การอ่าน และการเรียนรู้เรื่องสดใหม่",
    "Cancer": "อารมณ์อ่อนไหว ลึกซึ้ง: ชาร์จพลังใจด้วยความอบอุ่นจากครอบครัว พื้นที่ปลอดภัย และความทรงจำที่มีคุณค่า",
    "Leo": "อารมณ์ต้องการความอบอุ่นและการยอมรับ: ชาร์จพลังใจด้วยการแสดงความจริงใจ การให้กำลังใจ และคำชื่นชมที่แท้จริง",
    "Virgo": "อารมณ์สบายใจเมื่อทุกอย่างเป็นระบบ: ชาร์จพลังใจด้วยการจัดระเบียบ การทำงานที่มีประโยชน์ และการดูแลสุขภาพ",
    "Libra": "อารมณ์ต้องการความสงบและความสมดุล: ชาร์จพลังใจด้วยสภาพแวดล้อมที่ไร้ความขัดแย้ง มิตรสหายคู่คิด และศิลปะ",
    "Scorpio": "อารมณ์เข้มข้น ลึกซึ้ง รักแรงเกลียดแรง: ชาร์จพลังใจด้วยความจริงใจขั้นสูงสุดและความสัมพันธ์ที่ไร้หน้ากาก",
    "Sagittarius": "อารมณ์เปิดกว้าง รักอิสระ: ชาร์จพลังใจด้วยการเดินทาง การเปิดโลกทัศน์ และการค้นพบปรัชญาชีวิตใหม่ๆ",
    "Capricorn": "อารมณ์ควบคุมตนเองได้ดีเยี่ยม: ชาร์จพลังใจด้วยความคืบหน้าของงาน ความสำเร็จที่เป็นรูปธรรม และความมั่นคงระยะยาว",
    "Aquarius": "อารมณ์มีเหตุมีผลและมีระยะห่างที่พอดี: ชาร์จพลังใจด้วยเสรีภาพทางความคิดและการได้ร่วมสร้างอุดมการณ์เพื่อสังคม",
    "Pisces": "อารมณ์อ่อนโยน ญาณหยั่งรู้สูง: ชาร์จพลังใจด้วยการปลีกวิเวกในโลกส่วนตัว ศิลปะ เสียงดนตรี และการทำสมาธิ"
}

# House Significations (ความหมายเรือนชะตา 1-12)
HOUSE_SIGNIFICATIONS = {
    1: {"name": "ตนุ (House 1)", "theme": "ตัวตน ลัคนา บุคลิกภาพ พลังชีวิต สุขภาพ"},
    2: {"name": "กดุมภะ (House 2)", "theme": "การเงิน ทรัพย์สิน คุณค่า รายได้ ความมั่นคงทางการเงิน"},
    3: {"name": "สหัสชะ (House 3)", "theme": "การติดต่อสื่อสาร การเดินทางใกล้ เพื่อนฝูง พี่น้อง สังคมแวดล้อม"},
    4: {"name": "พันธุ (House 4)", "theme": "ครอบครัว อสังหาริมทรัพย์ บ้าน รากฐาน ความสงบใจ"},
    5: {"name": "ปุตตะ (House 5)", "theme": "ความคิดสร้างสรรค์ โครงการใหม่ การลงทุน บุตรบริวาร ความสุข"},
    6: {"name": "อริ (House 6)", "theme": "อุปสรรค การแก้ปัญหา วินัยการทำงาน สุขภาพ บริวารงานประจำ"},
    7: {"name": "ปัตนิ (House 7)", "theme": "คู่ครอง หุ้นส่วน คู่สัญญา ความสัมพันธ์แบบหนึ่งต่อหนึ่ง"},
    8: {"name": "มรณะ (House 8)", "theme": "การเปลี่ยนผ่าน มรดก ภาษี ทุนคนอื่น การเกิดใหม่ทางจิตวิญญาณ"},
    9: {"name": "ศุภะ (House 9)", "theme": "ความเจริญ ปรัชญา การศึกษาชั้นสูง การต่างประเทศ คุณธรรม"},
    10: {"name": "กัมมะ (House 10)", "theme": "หน้าที่การงาน เกียรติยศ ชื่อเสียง ภารกิจชีวิต ตำแหน่งแห่งหน"},
    11: {"name": "ลาภะ (House 11)", "theme": "โชคลาภ เครือข่ายมิตรภาพ ความหวัง ความสำเร็จในเป้าหมายใหญ่"},
    12: {"name": "วินาศน์ (House 12)", "theme": "สิ่งเร้นลับ เบื้องหลัง สมาธิ จิตใต้สำนึก การปลีกวิเวก การเสียสละ"}
}


_PLANET_ALIASES = {"Rahu": "True Node"}


def canonical_planet_name(planet_name: str) -> str:
    """Map timeline names to the corresponding ephemeris chart key."""
    return _PLANET_ALIASES.get(planet_name, planet_name)


def build_planetary_context(
    natal_chart: Dict[str, Any],
    planet_name: str,
    related_planet_names: Optional[List[str]] = None,
    thaksa_matrix: Optional[List[Dict[str, Any]]] = None,
) -> Dict[str, Any]:
    """Return evidence-backed natal context for a ruler or harmonic hit.

    House ownership is derived from all twelve actual cusp signs using the
    traditional ``SIGN_RULERS`` table.  Relationships are only labelled when
    ``evaluate_relationship`` has an explicit rule; otherwise their status is
    reported as unknown.  Natal aspects are matched in either body order.
    """
    chart_name = canonical_planet_name(planet_name)
    planets = natal_chart.get("planets_dict", {})
    placement = planets.get(chart_name)

    placement_context = {
        "status": "known" if placement else "unknown",
        "planet_name": chart_name,
        "planet_thai": placement.get("thai") if placement else None,
        "sign": placement.get("sign") if placement else None,
        "sign_thai": placement.get("sign_thai") if placement else None,
        "house": placement.get("house") if placement else None,
        "house_theme": HOUSE_SIGNIFICATIONS.get(
            placement.get("house") if placement else None, {}
        ).get("theme"),
    }

    houses = natal_chart.get("houses")
    by_number: Dict[int, Dict[str, Any]] = {}
    ruled_houses: List[Dict[str, Any]] = []
    missing_cusps: List[int] = []
    if isinstance(houses, list):
        by_number = {house.get("house"): house for house in houses}
        for house_number in range(1, 13):
            house = by_number.get(house_number, {})
            cusp_sign = house.get("sign")
            ruler = SIGN_RULERS.get(cusp_sign)
            if not cusp_sign or not ruler:
                missing_cusps.append(house_number)
                continue
            if canonical_planet_name(ruler["name"]) == chart_name:
                ruled_houses.append({
                    "house": house_number,
                    "cusp_sign": cusp_sign,
                    "cusp_sign_thai": house.get("sign_thai"),
                    "theme": HOUSE_SIGNIFICATIONS.get(house_number, {}).get("theme"),
                })
    else:
        missing_cusps = list(range(1, 13))

    rulership_context = {
        "status": "known" if not missing_cusps else "unknown",
        "scheme": "traditional_sign_rulers",
        "houses": ruled_houses,
        "missing_cusp_houses": missing_cusps,
    }

    def ruler_link(ruler: Optional[Dict[str, Any]], basis_sign: Optional[str]) -> Dict[str, Any]:
        if not ruler:
            return {
                "status": "unknown",
                "basis_sign": basis_sign,
                "ruler_planet": None,
                "ruler_planet_thai": None,
                "ruler_placement": None,
                "relationship_to_planet": {"status": "unknown", "type": None, "nature": None},
            }
        ruler_name = canonical_planet_name(ruler["name"])
        ruler_placement = planets.get(ruler_name)
        if ruler_name == chart_name:
            relationship = {"status": "known", "type": "self_ruler", "nature": "self"}
        else:
            rule = evaluate_relationship(
                placement.get("thaksa_num") if placement else None,
                ruler_placement.get("thaksa_num") if ruler_placement else None,
            ) if placement and ruler_placement else None
            relationship = {
                "status": "known" if rule else "unknown",
                "type": rule.get("type") if rule else None,
                "nature": rule.get("nature") if rule else None,
            }
        return {
            "status": "known" if ruler_placement else "unknown",
            "basis_sign": basis_sign,
            "ruler_planet": ruler_name,
            "ruler_planet_thai": ruler.get("thai"),
            "ruler_placement": {
                "sign": ruler_placement.get("sign"),
                "sign_thai": ruler_placement.get("sign_thai"),
                "house": ruler_placement.get("house"),
            } if ruler_placement else None,
            "relationship_to_planet": relationship,
        }

    placement_sign = placement.get("sign") if placement else None
    sign_dispositor = ruler_link(SIGN_RULERS.get(placement_sign), placement_sign)
    occupied_house = placement.get("house") if placement else None
    occupied_cusp_sign = by_number.get(occupied_house, {}).get("sign")
    occupied_house_ruler = ruler_link(SIGN_RULERS.get(occupied_cusp_sign), occupied_cusp_sign)
    occupied_house_ruler["occupied_house"] = occupied_house

    relationships = []
    seen_related = set()
    for related_name in related_planet_names or []:
        related_chart_name = canonical_planet_name(related_name)
        if related_chart_name in seen_related:
            continue
        seen_related.add(related_chart_name)
        if related_chart_name == chart_name:
            relationships.append({
                "with_planet": related_chart_name,
                "with_planet_thai": placement.get("thai") if placement else None,
                "status": "known",
                "type": "same_planet",
                "nature": "concentrated",
                "description": "เป็นดาวดวงเดียวกัน จึงรวมแรงไว้ที่แกนเดียว",
            })
            continue
        related = planets.get(related_chart_name)
        p_num = placement.get("thaksa_num") if placement else None
        r_num = related.get("thaksa_num") if related else None
        rule = evaluate_relationship(p_num, r_num) if p_num and r_num else None
        relationships.append({
            "with_planet": related_chart_name,
            "with_planet_thai": related.get("thai") if related else None,
            "status": "known" if rule else "unknown",
            "type": rule.get("type") if rule else None,
            "nature": rule.get("nature") if rule else None,
            "description": rule.get("desc") if rule else None,
        })

    related_set = {canonical_planet_name(name) for name in related_planet_names or []}
    natal_aspects = []
    for aspect in natal_chart.get("aspects", []):
        body1 = canonical_planet_name(aspect.get("body1", ""))
        body2 = canonical_planet_name(aspect.get("body2", ""))
        if body1 == chart_name and body2 in related_set:
            other = body2
        elif body2 == chart_name and body1 in related_set:
            other = body1
        else:
            continue
        natal_aspects.append({
            "with_planet": other,
            "aspect_name": aspect.get("aspect_name"),
            "aspect_thai": aspect.get("aspect_thai"),
            "aspect_nature": aspect.get("nature"),
            "aspect_angle": aspect.get("aspect_angle"),
            "orb": aspect.get("orb"),
            "is_applying": aspect.get("is_applying"),
        })

    dignity = evaluate_dignity(chart_name, placement.get("sign", "") if placement else "")

    natal_thaksa_info = None
    if thaksa_matrix and placement:
        p_num = placement.get("thaksa_num")
        for item in thaksa_matrix:
            if item.get("planet_num") == p_num:
                natal_thaksa_info = {
                    "role_key": item.get("role_key"),
                    "role_thai": item.get("role_thai"),
                    "role_desc": item.get("role_desc"),
                }
                break

    return {
        "placement": placement_context,
        "house_rulership": rulership_context,
        "sign_dispositor": sign_dispositor,
        "occupied_house_ruler": occupied_house_ruler,
        "dignity": {
            "status": "known" if placement else "unknown",
            "type": dignity.get("short_type") if placement else None,
            "score": dignity.get("score") if placement else None,
        },
        "natal_thaksa": natal_thaksa_info,
        "relationships": relationships,
        "natal_aspects": natal_aspects,
    }


def analyze_natal_chart(
    natal_chart: Dict[str, Any],
    thaksa_matrix: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Synthesizes the core personality trinity and overall foundation.
    """
    planets = natal_chart["planets_dict"]
    angles = natal_chart["angles"]

    # 1. Sun (นิสัยสันดานลึก ๆ)
    sun_obj = planets["Sun"]
    sun_sign = sun_obj["sign"]
    sun_house = sun_obj["house"]
    sun_dignity = evaluate_dignity("Sun", sun_sign)
    sun_desc = SUN_INTERPRETATIONS.get(sun_sign, "")

    # 2. Ascendant (นิสัยที่แสดงออก)
    asc_obj = angles["Ascendant"]
    asc_sign = asc_obj["sign"]
    asc_ruler_info = SIGN_RULERS[asc_sign]
    asc_desc = ASC_INTERPRETATIONS.get(asc_sign, "")

    # Ascendant Ruler in Natal Chart
    asc_ruler_planet = planets.get(asc_ruler_info["name"])
    asc_ruler_house = asc_ruler_planet["house"] if asc_ruler_planet else 1
    asc_ruler_sign = asc_ruler_planet["sign"] if asc_ruler_planet else asc_sign
    asc_ruler_dignity = evaluate_dignity(asc_ruler_info["name"], asc_ruler_sign) if asc_ruler_planet else {}

    # 3. Moon (อารมณ์และจิตใจ)
    moon_obj = planets["Moon"]
    moon_sign = moon_obj["sign"]
    moon_house = moon_obj["house"]
    moon_dignity = evaluate_dignity("Moon", moon_sign)
    moon_desc = MOON_INTERPRETATIONS.get(moon_sign, "")

    # Map house meanings
    sun_house_info = HOUSE_SIGNIFICATIONS.get(sun_house, {})
    moon_house_info = HOUSE_SIGNIFICATIONS.get(moon_house, {})
    asc_ruler_house_info = HOUSE_SIGNIFICATIONS.get(asc_ruler_house, {})

    personality_trinity = {
        "sun": {
            "title": "ดวงอาทิตย์ (นิสัยสันดานลึก ๆ)",
            "subtitle": f"สถิต {sun_obj['sign_thai']} เรือน {sun_house} ({sun_house_info.get('name', '')})",
            "dignity": sun_dignity["type"],
            "dignity_desc": sun_dignity["desc"],
            "core_nature": sun_desc,
            "house_theme": f"เจตจำนงของชีวิตถูกขับเคลื่อนผ่านเรื่อง: {sun_house_info.get('theme', '')}"
        },
        "ascendant": {
            "title": "ลัคนา (นิสัยที่แสดงออกสู่ภายนอก)",
            "subtitle": f"สถิต {asc_obj['sign_thai']} (ดาวเจ้าเรือนลัคนาคือดาว{asc_ruler_info['thai']})",
            "ruler_placement": f"ดาวประจำตัว ({asc_ruler_info['thai']}) สถิตใน {asc_ruler_sign} เรือน {asc_ruler_house} ({asc_ruler_house_info.get('name', '')}) ตำแหน่ง {asc_ruler_dignity.get('type', '')}",
            "outward_persona": asc_desc,
            "ruler_theme": f"ตัวตนและวิถีชีวิตเชื่อมโยงกับเรื่อง: {asc_ruler_house_info.get('theme', '')}"
        },
        "moon": {
            "title": "ดวงจันทร์ (อารมณ์และความรู้สึกภายใน)",
            "subtitle": f"สถิต {moon_obj['sign_thai']} เรือน {moon_house} ({moon_house_info.get('name', '')})",
            "dignity": moon_dignity["type"],
            "dignity_desc": moon_dignity["desc"],
            "emotional_instinct": moon_desc,
            "house_theme": f"ความมั่นคงทางอารมณ์ผูกพันกับเรื่อง: {moon_house_info.get('theme', '')}"
        }
    }

    return {
        "personality_trinity": personality_trinity
    }


PLANET_MACRO_PROFILES = {
    "Sun": {
        "thai": "อาทิตย์",
        "theme": "ยุคแห่งการสร้างอัตลักษณ์ การค้นพบแก่นแท้ของตนเอง และการก้าวขึ้นสู่บทบาทผู้นำ",
        "career": "การสถาปนาตนเองเป็นผู้นำ การตัดสินใจอย่างเด็ดขาด และการสร้างเกียรติยศชื่อเสียงให้เป็นที่ประจักษ์",
        "wealth": "การลงทุนในธุรกิจตนเอง การสร้างแบรนด์ส่วนบุคคล และการเป็นศูนย์กลางของทรัพยากร",
        "entropy": "ความเย่อหยิ่ง ยึดตนเองเป็นศูนย์กลาง และการไม่รับฟังมุมมองของผู้อื่นจนเกิดความขัดแย้ง"
    },
    "Moon": {
        "thai": "จันทร์",
        "theme": "ยุคแห่งการสร้างรากฐานความมั่นคงทางใจ ครอบครัว เครือข่ายความไว้วางใจ และการเยียวยา",
        "career": "การสร้างทีมที่เหนียวแน่น งานด้านการบริการ ทรัพยากรมนุษย์ และการสร้างวัฒนธรรมองค์กรที่อบอุ่น",
        "wealth": "การสะสมอสังหาริมทรัพย์ การลงทุนเพื่อความมั่นคงของครอบครัว และการบริหารเงินทุนอย่างปลอดภัย",
        "entropy": "ความอ่อนไหวทางอารมณ์ ความลังเลโลเล และการติดอยู่ในพื้นที่คุ้นเคย (Comfort Zone)"
    },
    "Mars": {
        "thai": "อังคาร",
        "theme": "ยุคแห่งการบุกเบิก การลงมือทำจริง การทลายขีดจำกัด และการเอาชนะการแข่งขัน",
        "career": "การริเริ่มโครงการท้าทาย การขยายตลาดเชิงรุก การแก้ปัญหาเฉพาะหน้า และการเป็นหัวหอกฝ่าฟันอุปสรรค",
        "wealth": "การลงทุนที่มีความเสี่ยงสูงแต่ผลตอบแทนรวดเร็ว การเข้าซื้อสินทรัพย์ และการหมุนเวียนเงินที่คล่องตัว",
        "entropy": "ความใจร้อน วู่วาม ความขัดแย้งกับคู่แข่งหรือทีมงาน และอุบัติเหตุจากการเร่งรีบ"
    },
    "Mercury": {
        "thai": "พุธ",
        "theme": "ยุคแห่งการใช้สติปัญญา การเจรจายุทธศาสตร์ การวางระบบข้อมูล และการสร้างเครือข่ายธุรกิจ",
        "career": "การขยายอำนาจผ่านการสื่อสาร การเจรจาดีลสำคัญ การสร้างระบบงานที่มีประสิทธิภาพ และการใช้ข้อมูลเป็นอาวุธ",
        "wealth": "รายได้จากการค้า การลงทุนตามข้อมูล การเป็นคนกลาง การเป็นที่ปรึกษา และการสร้างทรัพย์สินทางปัญญา",
        "entropy": "ความคิดฟุ้งซ่าน ภาวะลังเลจากการมีข้อมูลมากเกินไป (Analysis Paralysis) และความเครียดสะสมทางระบบประสาท"
    },
    "Saturn": {
        "thai": "เสาร์",
        "theme": "ยุคแห่งวินัยเหล็ก การแบกรับความรับผิดชอบ และการสร้างเสาหลักความสำเร็จที่มั่นคงถาวร",
        "career": "การบริหารโครงการขนาดใหญ่ การจัดระเบียบโครงสร้างองค์กร และการได้รับการยอมรับจากผลงานระยะยาว",
        "wealth": "การสะสมความมั่งคั่งอย่างช้าแต่มั่นคง การถือครองที่ดิน สินทรัพย์โครงสร้างพื้นฐาน และการลงทุนคุณค่า",
        "entropy": "ความกดดัน ความวิตกกังวล ความรู้สึกโดดเดี่ยว และการยึดติดกับกฎเกณฑ์จนขาดความยืดหยุ่น"
    },
    "Jupiter": {
        "thai": "พฤหัสบดี",
        "theme": "ยุคแห่งปัญญาญาณ การขยายวิสัยทัศน์ใหญ่ การเติบโตอย่างมีคุณธรรม และการได้รับการอุปถัมภ์",
        "career": "การได้รับบทบาทที่ปรึกษา ผู้เชี่ยวชาญระดับสูง การขยายงานสู่ระดับสากล และการสร้างคุณค่าแก่สังคม",
        "wealth": "โชคลาภทางการเงิน การได้รับมรดกหรือการเกื้อหนุน การเติบโตของพอร์ตการลงทุนอย่างก้าวกระโดด",
        "entropy": "ความประมาท การมองโลกแง่ดีเกินจริง และการแบกรับภาระช่วยคนอื่นจนตนเองเดือดร้อน"
    },
    "Rahu": {
        "thai": "ราหู",
        "theme": "ยุคแห่งการเปลี่ยนผ่านสู่มิติใหม่ โอกาสนอกกรอบ นวัตกรรมล้ำสมัย และการขยายอิทธิพลฉับพลัน",
        "career": "การริเริ่มธุรกิจเทคโนโลยี การทำงานกับต่างชาติหรือตลาดต่างประเทศ และการคิดค้นแนวทางใหม่ที่พลิกวงการ",
        "wealth": "โชคลาภจากการเก็งกำไร สินทรัพย์ดิจิทัล การคว้าโอกาสจากกระแสความเปลี่ยนแปลงของโลก",
        "entropy": "ความหลงใหลในภาพลวงตา ความประมาทในข้อกฎหมาย และการถูกชักจูงด้วยผลประโยชน์ระยะสั้น"
    },
    "Venus": {
        "thai": "ศุกร์",
        "theme": "ยุคแห่งความมั่งคั่ง สุนทรียภาพ ความสัมพันธ์ที่เกื้อกูล และการเก็บเกี่ยวผลลัพธ์อันงดงาม",
        "career": "การสร้างสรรค์ผลงานระดับมาสเตอร์พีซ การสร้างพันธมิตรคุณภาพ การตลาด และงานที่อาศัยความประณีต",
        "wealth": "การเติบโตของกระแสเงินสด ความสุขสบาย สินทรัพย์หรูหรา และรายได้จากความชื่นชอบของมหาชน",
        "entropy": "ความรักสบาย การใช้จ่ายฟุ่มเฟือย และการหลีกเลี่ยงการเผชิญหน้ากับความจริงที่ยากลำบาก"
    }
}

HOUSE_CONTEXTS = {
    1: {"name": "ตนุ (House 1)", "area": "ตัวตนและทิศทางชีวิตอิสระ", "leverage": "การตัดสินใจด้วยตนเองและความชัดเจนในเป้าหมาย"},
    2: {"name": "กดุมภะ (House 2)", "area": "การเงิน ทรัพย์สิน และการบริหารกระแสเงินสด", "leverage": "การแปลงทักษะเป็นรายได้และการสะสมสินทรัพย์มั่นคง"},
    3: {"name": "สหัสชะ (House 3)", "area": "การสื่อสาร เครือข่ายใกล้ตัว และการเดินทาง", "leverage": "ความไวในการเชื่อมโยงคนและข้อมูลข่าวสาร"},
    4: {"name": "พันธุ (House 4)", "area": "ครอบครัว อสังหาริมทรัพย์ และรากฐานชีวิต", "leverage": "การสร้างพื้นที่ปลอดภัยและฐานที่มั่นที่เข้มแข็ง"},
    5: {"name": "ปุตตะ (House 5)", "area": "ความคิดสร้างสรรค์ โปรเจกต์ใหม่ และการลงทุน", "leverage": "การกล้าเสี่ยงอย่างชาญฉลาดและนวัตกรรมใหม่"},
    6: {"name": "อริ (House 6)", "area": "การแก้ปัญหา วินัยการทำงาน และการบริหารระบบ", "leverage": "ความอดทนและกระบวนการทำงานที่ไร้ช่องโหว่"},
    7: {"name": "ปัตนิ (House 7)", "area": "หุ้นส่วนธุรกิจ คู่สัญญา และพันธมิตร", "leverage": "การสร้างข้อตกลงแบบ Win-Win และการเลือกคู่คิดที่ถูกต้อง"},
    8: {"name": "มรณะ (House 8)", "area": "การปฏิรูปโครงสร้าง การแปรวิกฤต และทุนผู้อื่น", "leverage": "การกล้าตัดสิ่งที่ไม่ก่อประโยชน์และการเกิดใหม่ทางธุรกิจ"},
    9: {"name": "ศุภะ (House 9)", "area": "วิสัยทัศน์สากล ความรู้ชั้นสูง และคุณธรรม", "leverage": "การมองการณ์ไกลและการขยายขอบเขตสู่ตลาดกว้าง"},
    10: {"name": "กัมมะ (House 10)", "area": "หน้าที่การงาน เกียรติยศ ชื่อเสียง และอำนาจบริหาร", "leverage": "การสร้างผลงานประจักษ์และการวางรากฐานสถาบัน"},
    11: {"name": "ลาภะ (House 11)", "area": "โชคลาภ ความสำเร็จใหญ่ และเครือข่ายมหาชน", "leverage": "การใช้พลังของกลุ่มและคอมมูนิตี้เป็นคานงัด"},
    12: {"name": "วินาศน์ (House 12)", "area": "งานเบื้องหลัง ยุทธศาสตร์ลับ และพลังสมาธิ", "leverage": "การพัฒนาผลงานชิ้นเอกเงียบๆ และการมีมุมมองที่ลึกซึ้ง"}
}

SIGN_ELEMENTS = {
    "Aries": ("ไฟ", "การบุกเบิกเชิงรุก ตรงไปตรงมา และรวดเร็ว"),
    "Taurus": ("ดิน", "ความหนักแน่น รอบคอบ และการสร้างมูลค่าจับต้องได้"),
    "Gemini": ("ลม", "ความคล่องตัว การสื่อสาร และการคิดเชื่อมโยง"),
    "Cancer": ("น้ำ", "สัญชาตญาณลึกซึ้ง ความเข้าอกเข้าใจ และการปกป้องคุณค่า"),
    "Leo": ("ไฟ", "วิสัยทัศน์ ความสง่างาม และการเป็นผู้นำที่สร้างแรงบันดาลใจ"),
    "Virgo": ("ดิน", "ความประณีต การจัดระบบ และการเพิ่มประสิทธิภาพสูงสุด"),
    "Libra": ("ลม", "การเจรจายุทธศาสตร์ การสร้างสมดุล และการสร้างพันธมิตร"),
    "Scorpio": ("น้ำ", "ความเฉียบคม การเจาะลึกความจริง และการเปลี่ยนผ่านระดับรากฐาน"),
    "Sagittarius": ("ไฟ", "การเปิดกว้าง วิสัยทัศน์ไกล และการขยายสู่สากล"),
    "Capricorn": ("ดิน", "โครงสร้างที่รัดกุม วินัยระยะยาว และความมุ่งมั่นสู่จุดสูงสุด"),
    "Aquarius": ("ลม", "ความคิดนอกกรอบ นวัตกรรมเพื่อส่วนรวม และความก้าวหน้า"),
    "Pisces": ("น้ำ", "จินตนาการล้ำลึก ญาณทัศน์ และสุนทรียภาพไร้ขีดจำกัด")
}


def _generate_macro_reading(major_name: str, m_natal: Dict[str, Any], m_dignity: Dict[str, Any], duration_years: int, age: int) -> Dict[str, Any]:
    profile = PLANET_MACRO_PROFILES.get(major_name, {
        "thai": major_name, "theme": "ยุคแห่งการพัฒนาตนเอง", "career": "การทำงานตามหน้าที่",
        "wealth": "การบริหารเงิน", "entropy": "ความประมาท"
    })
    sign = m_natal.get("sign", "")
    house = m_natal.get("house", 10)
    sign_thai = m_natal.get("sign_thai", "")
    h_ctx = HOUSE_CONTEXTS.get(house, {"name": f"House {house}", "area": "ภารกิจชีวิต", "leverage": "การวางแผน"})
    elem, style = SIGN_ELEMENTS.get(sign, ("ทั่วไป", "การปรับตัว"))

    clean_theme = profile["theme"].replace("ยุคแห่ง", "")
    epoch_title = f"ยุคแห่ง{clean_theme} ({duration_years} ปี)"
    dignity_plain = m_dignity.get("plain_meaning", "")
    dignity_advice = m_dignity.get("action_advice", "")

    epoch_theme = (
        f"ตลอดช่วง {duration_years} ปีนี้ (วัย {age} ปี) แกนหลักของชีวิตถูกขับเคลื่อนด้วยพลังของ **ดาว{profile['thai']}** "
        f"สถิตใน {sign_thai} (ธาตุ{elem}: {style}) ประจำ{h_ctx['name']} ({h_ctx['area']}) "
        f"ได้ตำแหน่ง **{m_dignity['type']}** — {dignity_plain} ภารกิจหลักคือการมุ่งเน้น {h_ctx['leverage']} "
        f"เพื่อกำหนดเป้าหมายระยะยาวที่กลับมาตรวจความคืบหน้าได้"
    )
    strategic_focus = (
        f"การงานและยุทธศาสตร์: {profile['career']} โดยมุ่งเน้นไปที่ {h_ctx['area']} "
        f"และในมิติด้านความมั่งคั่ง: {profile['wealth']} ({dignity_advice})"
    )
    entropy_risk = (
        f"จุดเปราะบางและการควบคุม Entropy: {profile['entropy']} ควบคุมแรงกดดันใน {h_ctx['name']} "
        f"อย่าให้ความตึงเครียดหรือความยึดติดมาลดทอนประสิทธิภาพการตัดสินใจระยะยาว"
    )

    macro_narrative = f"{epoch_theme} {strategic_focus}"

    return {
        "epoch_title": epoch_title,
        "epoch_theme": epoch_theme,
        "strategic_focus": strategic_focus,
        "entropy_risk": entropy_risk,
        "house_sign_label": f"ดาว{profile['thai']} สถิตใน{sign_thai} เรือนที่ {house} ({h_ctx['name'].split()[0]})",
        "dignity_label": m_dignity['type'],
        "dignity_plain_meaning": dignity_plain,
        "dignity_action_advice": dignity_advice,
        "macro_narrative": macro_narrative
    }


def _generate_sub_reading(major_name: str, sub_name: str, m_natal: Dict[str, Any], s_natal: Dict[str, Any], rel: Optional[Dict[str, Any]], s_dignity: Dict[str, Any], duration_str: str) -> Dict[str, Any]:
    m_profile = PLANET_MACRO_PROFILES.get(major_name, {})
    s_profile = PLANET_MACRO_PROFILES.get(sub_name, {})
    s_sign = s_natal.get("sign", "")
    s_house = s_natal.get("house", 12)
    s_sign_thai = s_natal.get("sign_thai", "")
    s_h_ctx = HOUSE_CONTEXTS.get(s_house, {"name": f"House {s_house}", "area": "ภารกิจย่อย", "leverage": "การปฏิบัติ"})
    s_elem, s_style = SIGN_ELEMENTS.get(s_sign, ("ทั่วไป", "การยืดหยุ่น"))

    rel_name = rel["type"] if rel else "จังหวะปกติ (ผลลัพธ์ตามวินัย)"
    rel_desc = rel["desc"] if rel else "ยังไม่มีความสัมพันธ์พิเศษตามเกณฑ์นี้ ใช้ติดตามความสม่ำเสมอและข้อจำกัดจากสถานการณ์จริง"
    s_plain = s_dignity.get("plain_meaning", "")
    s_advice = s_dignity.get("action_advice", "")

    catalyst_title = f"ตัวเร่งด้าน{s_h_ctx['area']} ({duration_str})"
    catalyst_role = (
        f"ในช่วงเวลานี้ ({duration_str}) **ดาว{s_profile.get('thai', sub_name)}** ใช้เป็นกรอบอ่านประเด็นระยะสั้น "
        f"สถิตใน {s_sign_thai} (ธาตุ{s_elem}) ใน{s_h_ctx['name']} ({s_h_ctx['area']}) ได้ตำแหน่ง **{s_dignity['type']}** "
        f"({s_plain}) ชวนทบทวนโอกาสและสถานการณ์ที่กำลังพิจารณาในระยะสั้น โดยตรวจข้อมูลจริงประกอบ"
    )
    synergy_dynamic = (
        f"การผสานพลังกับภาพใหญ่: ดาว{m_profile.get('thai', major_name)} ร่วมกับ ดาว{s_profile.get('thai', sub_name)} "
        f"จัดเป็น **{rel_name}** ({rel_desc}) ส่งผลให้เกิดแรงขับเคลื่อนที่สอดประสานกันอย่างมีนัยสำคัญ"
    )
    window_opportunity = (
        f"หน้าต่างแห่งโอกาส: ใช้คานงัดจาก {s_h_ctx['leverage']} ขับเคลื่อนงานด้วยแนวทาง {s_style} "
        f"เป็นจังหวะทองในการริเริ่มหรือสรุปผลงานใน {s_h_ctx['area']} ({s_advice})"
    )
    immediate_caution = (
        f"ข้อควรระวังเฉพาะหน้า: ระวัง {s_profile.get('entropy', 'ความประมาท')} "
        f"อย่าให้เรื่องเร่งด่วนใน {s_h_ctx['name']} มาทำให้เสียกระบวนหรือหลุดโฟกัสจากเป้าหมายภาพใหญ่ของยุค"
    )

    sub_narrative = f"{catalyst_role} {synergy_dynamic} {window_opportunity}"

    return {
        "catalyst_title": catalyst_title,
        "catalyst_role": catalyst_role,
        "synergy_dynamic": synergy_dynamic,
        "window_opportunity": window_opportunity,
        "immediate_caution": immediate_caution,
        "pair_type": rel_name,
        "pair_desc": rel_desc,
        "dignity_label": s_dignity['type'],
        "dignity_plain_meaning": s_plain,
        "dignity_action_advice": s_advice,
        "sub_narrative": sub_narrative
    }


def _generate_action_plan(major_name: str, sub_name: str, m_natal: Dict[str, Any], s_natal: Dict[str, Any], rel: Optional[Dict[str, Any]], m_dignity: Dict[str, Any], s_dignity: Dict[str, Any], age: int) -> Dict[str, Any]:
    m_h = m_natal.get("house", 10)
    s_h = s_natal.get("house", 12)
    m_ctx = HOUSE_CONTEXTS.get(m_h, {"name": f"House {m_h}", "area": "งานหลัก", "leverage": "ระบบ"})
    s_ctx = HOUSE_CONTEXTS.get(s_h, {"name": f"House {s_h}", "area": "งานรอง", "leverage": "จังหวะ"})
    m_p = PLANET_MACRO_PROFILES.get(major_name, {})
    s_p = PLANET_MACRO_PROFILES.get(sub_name, {})

    moves = [
        f"มุ่งเน้น {s_ctx['leverage']} เพื่อขับเคลื่อนเป้าหมายใน {m_ctx['area']} อย่างเป็นรูปธรรม",
        f"ประยุกต์ใช้จุดแข็งของดาว{s_p.get('thai', sub_name)} ในการต่อยอด {s_ctx['area']} เข้ากับงานหลัก",
        f"สร้างสินทรัพย์หรือผลงานที่อาศัย {m_ctx['leverage']} เป็นรากฐานระยะยาว"
    ]

    risks = [
        f"ระวัง {s_p.get('entropy', 'ความประมาท')} ในการจัดการ {s_ctx['area']}",
        f"ควบคุมไม่ให้ความตึงเครียดหรือจุดเปราะบางใน {m_ctx['name']} บั่นทอนสุขภาพหรือพลังใจ"
    ]

    framework = (
        f"ในวัย {age} ปี ยึดหลัก 'ใช้พลังขับเคลื่อนของ {s_ctx['area']} (ดาว{s_p.get('thai', sub_name)}) "
        f"สนับสนุนโครงสร้างความมั่นคงของ {m_ctx['area']} (ดาว{m_p.get('thai', major_name)})' "
        f"ทุกการตัดสินใจต้องคำนึงถึงผลตอบแทนและคุณค่าระยะยาวเกิน 3 ปีขึ้นไป"
    )

    return {
        "strategic_moves": moves,
        "risk_mitigation": risks,
        "decision_framework": framework
    }


def synthesize_year_life_reading(
    age: int,
    year_data: Dict[str, Any],
    natal_chart: Dict[str, Any],
    transits_for_year: Dict[str, Any],
    thaksa_matrix: Optional[List[Dict[str, Any]]] = None
) -> Dict[str, Any]:
    """
    Macro-to-Micro synthesis for a specific year in the 108-year lifecycle:
    1. Macro: ดาวเสวยอายุ (Major period) governs the main climate.
    2. Sub-Macro: ดาวแทรก (Sub-period) acts as the practical activator.
    3. Micro: Sun-based 30-degree symbolic age triggers; real transits are separate evidence.
    """
    major = year_data["major_planet"]
    sub = year_data["sub_planet"]
    ann_thaksa = year_data["annual_thaksa"]

    planets = natal_chart["planets_dict"]
    m_natal = planets.get(major["name"], {})
    s_natal = planets.get(sub["name"], {})

    m_dignity = evaluate_dignity(major["name"], m_natal.get("sign", ""))
    s_dignity = evaluate_dignity(sub["name"], s_natal.get("sign", ""))
    rel = evaluate_relationship(major["num"], sub["num"])

    # Check for 30-Degree Harmonic Degree Triggers in this specific year
    degree_triggers = year_data.get("degree_triggers", [])
    relevant_planets = [
        major["name"],
        sub["name"],
        "Sun",
        *[hit["planet_name"] for hit in degree_triggers],
    ]

    # High-precision rich synthesis
    macro_info = _generate_macro_reading(major["name"], m_natal, m_dignity, year_data.get("major_duration_years", 17), age)
    sub_info = _generate_sub_reading(major["name"], sub["name"], m_natal, s_natal, rel, s_dignity, year_data.get("sub_duration_str", ""))
    action_plan = _generate_action_plan(major["name"], sub["name"], m_natal, s_natal, rel, m_dignity, s_dignity, age)
    macro_info["planetary_context"] = build_planetary_context(
        natal_chart, major["name"], relevant_planets, thaksa_matrix=thaksa_matrix
    )
    sub_info["planetary_context"] = build_planetary_context(
        natal_chart, sub["name"], relevant_planets, thaksa_matrix=thaksa_matrix
    )

    # Interpret every calculated hit; the first item is only a compatibility alias.
    # This symbolic age progression is distinct from observed annual transits.
    degree_trigger_details = []
    trigger_themes = {
        "Moon": "ความต้องการของคนในทีมและความมั่นคงในชีวิตประจำวัน",
        "Mercury": "ข้อมูล การสื่อสาร และเงื่อนไขข้อตกลง",
        "Venus": "คุณค่าที่ให้ความสำคัญ ความสัมพันธ์ และการใช้ทรัพยากร",
        "Mars": "การลงมือทำ ความเร่งรีบ และการจัดการความขัดแย้ง",
        "Jupiter": "การเรียนรู้ การขยายขอบเขต และมาตรฐานที่ยึดถือ",
        "Saturn": "ภาระผูกพัน ข้อจำกัด และระบบระยะยาว",
        "Uranus": "การเปลี่ยนวิธีทำงานและทางเลือกที่แตกต่าง",
        "Neptune": "ภาพฝัน ความไม่ชัดเจน และข้อสมมติที่ยังไม่มีหลักฐาน",
        "Pluto": "อำนาจต่อรองและการเปลี่ยนโครงสร้าง",
        "True Node": "แรงดึงดูดต่อโอกาสใหม่และสิ่งที่ยังไม่คุ้นเคย",
        "Chiron": "จุดที่ต้องเรียนรู้เพิ่มเติมและประสบการณ์ที่นำมาทบทวนได้",
    }
    for hit in degree_triggers:
        hit_pname = hit["planet_name"]
        hit_natal = planets.get(hit_pname, {})
        hit_thaksa_num = hit_natal.get("thaksa_num", 0)
        hit_rel = (
            {"type": "ดาวดวงเดียวกัน", "desc": "แรงของจุดกระทบรวมกับแกนช่วงใหญ่", "nature": "concentrated"}
            if canonical_planet_name(major["name"]) == canonical_planet_name(hit_pname)
            else evaluate_relationship(major["num"], hit_thaksa_num) if hit_thaksa_num > 0 else None
        )
        sub_hit_rel = (
            {"type": "ดาวดวงเดียวกัน", "desc": "แรงของจุดกระทบรวมกับแกนช่วงย่อย", "nature": "concentrated"}
            if canonical_planet_name(sub["name"]) == canonical_planet_name(hit_pname)
            else evaluate_relationship(sub["num"], hit_thaksa_num) if hit_thaksa_num > 0 else None
        )
        hit_dignity = evaluate_dignity(hit_pname, hit_natal.get("sign", ""))
        hit_h = hit_natal.get("house")
        hit_h_ctx = HOUSE_CONTEXTS.get(hit_h, {"name": "ยังไม่มีข้อมูลเรือน", "area": "ยังระบุขอบเขตชีวิตจากเรือนไม่ได้"})
        hit_rel_title = hit_rel["type"] if hit_rel else "ยังไม่มีเกณฑ์คู่ดาวทักษาสำหรับคู่นี้"
        hit_rel_desc = hit_rel["desc"] if hit_rel else "อ่านความหมายของดาวและเรือนประกอบ โดยไม่สมมติสถานะคู่มิตรหรือคู่ศัตรู"
        theme = trigger_themes.get(hit_pname, "ประเด็นของดาวนี้ที่ควรทบทวน")
        exact_age = hit["exact_age"]
        planetary_context = build_planetary_context(
            natal_chart, hit_pname, relevant_planets, thaksa_matrix=thaksa_matrix
        )
        hard_aspects = {"Opposition", "Square", "Semi-Square", "Sesquiquadrate", "Quincunx"}
        easy_aspects = {"Trine", "Sextile", "Conjunction"}
        aspect_names = {
            item.get("aspect_name") for item in planetary_context.get("natal_aspects", [])
        }
        pair_natures = {
            item.get("nature") for item in (hit_rel, sub_hit_rel) if item
        }
        question = f"ในเรื่อง{hit_h_ctx['area']} มีข้อเท็จจริงใดสนับสนุนหรือขัดกับแผนที่วางไว้ โดยเฉพาะ{theme}?"
        if "negative" in pair_natures or aspect_names & hard_aspects:
            preparation = f"เลือกหนึ่งเรื่องใน{hit_h_ctx['area']} ทวนขอบเขตและผลกระทบกับผู้เกี่ยวข้องก่อนลงมือ"
            evidence = f"รวบรวมข้อมูลเรื่อง{theme}และจุดเห็นต่าง ก่อนเปลี่ยนแผน"
        elif "positive" in pair_natures or aspect_names & easy_aspects:
            preparation = f"เลือกหนึ่งเรื่องใน{hit_h_ctx['area']} แบ่งบทบาทให้ชัด ทดลองทำร่วมกัน แล้วกำหนดวันดูผล"
            evidence = f"รวบรวมข้อมูลเรื่อง{theme}เพื่อวัดผล โดยไม่ถือว่าความเข้ากันรับรองผลลัพธ์"
        else:
            preparation = f"เลือกหนึ่งเรื่องใน{hit_h_ctx['area']} จดสถานะปัจจุบัน เป้าหมาย และข้อจำกัด แล้วกำหนดวันทบทวน"
            evidence = f"รวบรวมข้อมูลเรื่อง{theme}จากเอกสารหรือผู้เกี่ยวข้อง ก่อนเปลี่ยนแผน"
        sun_speed_note = f" (ตามอัตราความเร็วสุริยะจริง {hit.get('sun_speed', 1.0):.4f}°/ปี)" if hit.get("sun_speed") and hit.get("sun_speed") != 1.0 else ""
        narrative = (
            f"ดาว{major['thai']}เสวยอายุเป็นบริบทใหญ่ของปีที่เลือก "
            f"ส่วนดาว{hit['planet_thai']}เป็นจุดกระตุ้นตามวิถีองศาดาวกระทบฐาน 30° "
            f"ระยะจากอาทิตย์ {hit['distance_deg']:.2f}° ให้จุดอายุประมาณ {exact_age:.2f} ปี{sun_speed_note} "
            f"ในรอบที่ {hit['cycle_num']} และจัดแสดงในช่องอายุ {age} ปีตามการปัดอายุของสูตร "
            f"ดาวนี้อยู่{hit_h_ctx['name']} จึงใช้ทบทวนเรื่อง{hit_h_ctx['area']} "
            f"ผ่านประเด็น{theme} ผลนี้เป็นกรอบตีความตามวิธีดังกล่าว ไม่ใช่การยืนยันว่าจะเกิดเหตุการณ์ในปีนั้น"
        )
        degree_trigger_details.append({
            **hit,
            "sun_in_sign_degree": round(planets["Sun"]["longitude"] % 30, 4) if planets.get("Sun", {}).get("longitude") is not None else None,
            "planet_in_sign_degree": round(hit_natal["longitude"] % 30, 4) if hit_natal.get("longitude") is not None else None,
            "natal_sign": hit_natal.get("sign_thai"),
            "natal_degree": hit_natal.get("formatted_dms"),
            "house_name": hit_h_ctx["name"],
            "house_area": hit_h_ctx["area"],
            "pair_type": hit_rel_title,
            "pair_desc": hit_rel_desc,
            "sub_pair_type": sub_hit_rel.get("type") if sub_hit_rel else None,
            "sub_pair_status": "known" if sub_hit_rel else "unknown",
            "dignity_label": hit_dignity.get("type", "ปกติ"),
            "trigger_narrative": narrative,
            "planning_question": question,
            "practical_actions": [preparation, evidence],
            "decision_check": "ก่อนตัดสินใจเรื่องงานหรือเงิน ให้เทียบทางเลือก ต้นทุน และผลเสียที่รับได้กับข้อมูลจริง บันทึกเหตุผลไว้กลับมาตรวจ",
            "planetary_context": planetary_context,
        })
    degree_trigger_detail = degree_trigger_details[0] if degree_trigger_details else None

    # Micro Transits
    active_transits = transits_for_year.get("active_aspects", [])
    milestones = transits_for_year.get("milestones", [])

    transit_highlights = []
    for t in active_transits:
        transit_highlights.append(f"{t['transit_thai']} {t['aspect_thai']} {t['natal_thai']} ({t['description']})")

    # A missing harmonic hit means no selected trigger, not an uneventful year.
    tone = "neutral"
    if degree_trigger_details:
        names = " / ".join("ดาว" + item["planet_thai"] for item in degree_trigger_details)
        advice = (
            f"เริ่มจากบริบทดาว{major['thai']}เสวยอายุ แล้วทบทวนจุดกระตุ้น {len(degree_trigger_details)} ดวง: {names} "
            "เลือกประเด็นที่สัมพันธ์กับสถานการณ์จริง จัดลำดับสิ่งที่จะเตรียม และเก็บหลักฐานไว้ทบทวน "
            "จำนวนดาวกระทบไม่ได้บอกความรุนแรงหรือรับรองผลลัพธ์"
        )
    else:
        advice = (
            f"ช่องอายุ {age} ปีไม่มีจุดกระทบฐาน 30° ตามการจัดปีของสูตรนี้ "
            f"จึงอ่านดาว{major['thai']}เสวยอายุและดาว{sub['thai']}แทรกเป็นบริบทสำหรับทบทวนแผน "
            "ไม่ได้หมายความว่าปีนั้นจะไม่มีเหตุการณ์สำคัญ ให้เลือกเป้าหมายที่ตรวจความคืบหน้าได้จากสถานการณ์จริง"
        )

    return {
        "age": age,
        "calendar_year": year_data["calendar_year"],
        "macro_narrative": macro_info["macro_narrative"],
        "sub_narrative": sub_info["sub_narrative"],
        "macro_detail": macro_info,
        "sub_detail": sub_info,
        "degree_triggers": degree_triggers,
        "degree_trigger_detail": degree_trigger_detail,
        "degree_trigger_details": degree_trigger_details,
        "harmonic_method": {"formula": "(planet_longitude - sun_longitude) % 30", "cycle_years": 30, "zero_distance": "next_cycle_30", "year_assignment": "nearest_integer_python_round", "timing_note": "อายุทศนิยมเป็นค่าตามสูตร ไม่ใช่วันเกิดเหตุการณ์หรือดาวจรจริง"},
        "action_plan": action_plan,
        "annual_thaksa_highlight": f"ทักษาจรประจำปีตกภูมิ: ดาว{ann_thaksa['thai']}",
        "milestones": milestones,
        "transit_highlights": transit_highlights,
        "tone": tone,
        "overall_advice": advice
    }


# ==============================================================================
# DEEP ASPECT & PLANETARY PAIR DYNAMICS INTERPRETATION ENGINE
# ==============================================================================

PLANET_NUM_MAP = {
    "Sun": 1,
    "Moon": 2,
    "Mars": 3,
    "Mercury": 4,
    "Jupiter": 5,
    "Venus": 6,
    "Saturn": 7,
    "True Node": 8,
}

# Curated high-precision interpretations for notable astrological pairings
NOTABLE_PAIR_INTERPRETATIONS = {
    frozenset(["Sun", "Jupiter"]): {
        "pair_name_thai": "คู่มิตรใหญ่ (บารมี เกียรติยศ และโชคลาภ)",
        "theme": "ความเจริญก้าวหน้า เกียรติยศ วาสนาสูง และการได้รับความเมตตาอุปถัมภ์จากผู้ใหญ่",
        "psychology": "มีความมั่นใจในตนเอง มองโลกในแง่ดี มีมโนธรรมสูง จิตใจเอื้อเฟื้อเผื่อแผ่ สง่างาม",
        "career": "โดดเด่นในงานบริหาร วิชาการ กฎหมาย การค้าระหว่างประเทศ หรือองค์กรระดับสูง ได้รับการเลื่อนขั้นรวดเร็ว",
        "relationships": "เป็นที่รักและนับถือของมิตรสหาย มีกัลยาณมิตรที่มีคุณภาพคอยเกื้อกูล",
        "challenges": "ระวังความประมาท มั่นใจเกินตัว หรือการใช้จ่ายมือเติบเมื่อชีวิตราบรื่น",
        "empowerment": "ใช้ความโชคดีและบารมีเป็นสะพานเกื้อกูลสังคม ยึดมั่นในความซื่อสัตย์จะรักษาความรุ่งเรืองได้ยั่งยืน"
    },
    frozenset(["Mercury", "Neptune"]): {
        "pair_name_thai": "คู่ญาณทัศน์และสุนทรียภาพแห่งความคิด",
        "theme": "สติปัญญาที่เชื่อมโยงกับจิตใต้สำนึก จินตนาการไร้ขอบเขต การสื่อสารที่มีเสน่ห์ดึงดูดใจ",
        "psychology": "มีความคิดสร้างสรรค์ล้ำลึก เข้าใจศิลปะและนามธรรม ลางสังหรณ์แม่นยำ ไวต่อความรู้สึกผู้อื่น",
        "career": "ยอดเยี่ยมในงานสร้างสรรค์ วรรณกรรม นวัตกรรม ดีไซน์ การตลาดเชิงจิตวิทยา และงานวิจัยเชิงลึก",
        "relationships": "โรแมนติก มีความเห็นอกเห็นใจสูง ปรารถนาความผูกพันทางจิตวิญญาณอันบริสุทธิ์",
        "challenges": "ระวังความคิดฟุ้งซ่าน ไม่ชัดเจน สับสนในรายละเอียด หรือความไว้ใจคนง่ายเกินไป",
        "empowerment": "ถ่ายทอดจินตนาการออกมาเป็นชิ้นงานที่จับต้องได้ ใช้ตรรกะและระบบตรวจทานความฝันเสมอ"
    },
    frozenset(["Sun", "Saturn"]): {
        "pair_name_thai": "คู่ธาตุไฟและมานะอดทน (มหาบารมีจากความเพียร)",
        "theme": "การสร้างความสำเร็จจากความมุ่งมั่น วินัย ความรับผิดชอบ และความอดทนไม่ยอมแพ้",
        "psychology": "มีความจริงจัง สุขุม รักษาคำพูด ไม่ชอบเรื่องฉาบฉวย มุ่งมั่นสร้างรากฐานที่มั่นคงถาวร",
        "career": "สำเร็จในระยะยาว ยิ่งอายุมากยิ่งมั่นคง ทรงอิทธิพลในการบริหารจัดการงานโครงสร้างขนาดใหญ่",
        "relationships": "ซื่อสัตย์ มั่นคง แต่แสดงออกไม่เก่ง อาจสร้างกำแพงปกป้องตนเองสูง",
        "challenges": "ความกดดันตนเอง ความเครียดสะสม และความกลัวความล้มเหลว",
        "empowerment": "มองทุกอุปสรรคเป็นบททดสอบเพื่อขัดเกลาความแข็งแกร่ง ให้รางวัลและผ่อนคลายตนเองบ้าง"
    },
    frozenset(["Venus", "Mars"]): {
        "pair_name_thai": "คู่มิตรเสน่หาและพลังสร้างสรรค์",
        "theme": "พลังแห่งแรงดึงดูด เสน่ห์ทางสังคม ความคิดสร้างสรรค์ และความกระตือรือร้น",
        "psychology": "มีชีวิตชีวา อารมณ์แจ่มใส กล้าแสดงออกทางอารมณ์ ชื่นชมความงดงามและสุนทรียภาพ",
        "career": "ยอดเยี่ยมในงานศิลปะ บันเทิง แฟชั่น การเจรจาต่อรอง การตลาด และงานที่สร้างแรงบันดาลใจ",
        "relationships": "มีความรักที่เข้มข้น ดึงดูดผู้คน เสน่ห์แรง มีแรงผลักดันทางความสัมพันธ์สูง",
        "challenges": "อารมณ์ขึ้นลงเร็วตามแรงขับเคลื่อน การตัดสินใจเรื่องเงินหรือความรักด้วยอารมณ์ชั่ววูบ",
        "empowerment": "แปรเปลี่ยนพลังความหลงใหล (Passion) ให้เป็นผลงานสร้างสรรค์และคุณค่าอันยิ่งใหญ่"
    },
    frozenset(["Mercury", "Pluto"]): {
        "pair_name_thai": "คู่ปัญญาเจาะลึกและพลังจิตวิเคราะห์",
        "theme": "ความสามารถในการสืบค้น มองทะลุความจริงที่ซ่อนอยู่ วาจาคมกริบและพลังการโน้มน้าวใจ",
        "psychology": "ช่างสังเกต สมาธิแน่วแน่ มองเห็นเจตนาที่แท้จริงของผู้อื่น ไม่ชอบความผิวเผิน",
        "career": "โดดเด่นในงานวิเคราะห์เชิงลึก การเงิน การลงทุน งานวิจัย จิตวิทยา กฎหมาย และเทคโนโลยีขั้นสูง",
        "relationships": "ต้องการความจริงใจและความซื่อสัตย์ระดับสูงสุด ไม่ยอมรับความคลุมเครือ",
        "challenges": "ความหวาดระแวง การยึดติด หรือการใช้คำพูดที่เชือดเฉือนทำร้ายจิตใจผู้อื่น",
        "empowerment": "ใช้สติปัญญาค้นหาความจริงเพื่อการพัฒนาและเยียวยา หลีกเลี่ยงการใช้วาจาควบคุมผู้อื่น"
    },
    frozenset(["Venus", "Pluto"]): {
        "pair_name_thai": "คู่เสน่ห์ลึกล้ำและความมั่งคั่งมหาศาล",
        "theme": "พลังดึงดูดอันทรงอำนาจ ความรักที่ลึกซึ้งระดับพลิกชีวิต และโชคลาภทางการเงินก้อนใหญ่",
        "psychology": "มีความรักที่ทุ่มเทหมดใจ มีเสน่ห์ลึกลับ ช่างเลือก และมองเห็นมูลค่าที่ซ่อนอยู่ในสรรพสิ่ง",
        "career": "ประสบความสำเร็จในการบริหารทุน ทรัพย์สิน การควบรวม การลงทุน และการต่อรองมูลค่าสูง",
        "relationships": "ความสัมพันธ์ที่ลึกซึ้งและเปลี่ยนแปลงจิตวิญญาณ ระวังความหึงหวงหรือความต้องการครอบครอง",
        "challenges": "ความต้องการควบคุมคนรัก หรือความหลงใหลในอำนาจและผลประโยชน์",
        "empowerment": "เรียนรู้การปล่อยวางและความไว้วางใจ ใช้พลังเสน่ห์ในการสร้างสิ่งดีงามและสร้างความมั่นคง"
    },
    frozenset(["Jupiter", "Saturn"]): {
        "pair_name_thai": "คู่ดุลยภาพแห่งความสำเร็จ (เจริญก้าวหน้า + มั่นคง)",
        "theme": "ความสมดุลระหว่างวิสัยทัศน์ที่กว้างไกล (Jupiter) กับโครงสร้างวินัยที่รัดกุม (Saturn)",
        "psychology": "สุขุม คิดการณ์ใหญ่แต่วางแผนเป็นขั้นตอน อดทนรอคอยจังหวะที่เหมาะสมอย่างมีสติ",
        "career": "เป็นผู้นำองค์กร นักวางกลยุทธ์ นักสร้างธุรกิจที่เติบโตอย่างมั่นคงและยั่งยืนถาวร",
        "relationships": "เป็นที่พึ่งพาที่อบอุ่นและน่าเชื่อถือ ให้คำปรึกษาที่เปี่ยมด้วยสติปัญญา",
        "challenges": "ความลังเลระหว่างการเร่งขยายตัวกับการระมัดระวังจนอาจเสียโอกาสดีๆ",
        "empowerment": "ผสมผสานความกล้าคิดกับความรอบคอบ เมื่อตัดสินใจแล้วให้ลงมือปฏิบัติอย่างต่อเนื่อง"
    },
    frozenset(["Saturn", "True Node"]): {
        "pair_name_thai": "คู่พันธสัญญาแห่งกรรมและบทเรียนชีวิต",
        "theme": "ภารกิจแห่งการเรียนรู้ความรับผิดชอบ การเอาชนะความกลัว และการสร้างเกียรติยศด้วยตนเอง",
        "psychology": "มีความรับผิดชอบต่อหน้าที่สูง มักผ่านบทเรียนยากในวัยเยาว์เพื่อเติบใหญ่เป็นผู้นำที่เข้มแข็ง",
        "career": "ยิ่งมีอายุมากยิ่งมีอิทธิพล ได้รับความไว้วางใจในงานที่ต้องใช้ความอดทนและประสบการณ์สูง",
        "relationships": "ผูกพันกับผู้คนผ่านภาระหน้าที่ อาจต้องเป็นหลักพึ่งพาให้แก่คนในครอบครัว",
        "challenges": "ความรู้สึกโดดเดี่ยว หรือรู้สึกว่าตนเองต้องแบกรับภาระมากกว่าคนอื่น",
        "empowerment": "มองความเหนื่อยยากเป็นบันไดสั่งสมบารมี ทุกอุปสรรคที่ข้ามผ่านคือพลังที่ไม่มีใครแย่งชิงได้"
    },
    frozenset(["Venus", "Ascendant"]): {
        "pair_name_thai": "คู่รูปลักษณ์สง่างามและเมตตามหานิยม",
        "theme": "เสน่ห์ตั้งแต่แรกพบ บุคลิกภาพดึงดูด อ่อนโยน มีมารยาทและศิลปะในการเข้าสังคม",
        "psychology": "รักความสงบ เข้ากับคนง่าย มีรสนิยมประณีต ชื่นชอบสิ่งสวยงามและความรื่นรมย์",
        "career": "งานบริการ การทูต การประชาสัมพันธ์ ศิลปะ บันเทิง และงานที่ต้องพบปะผู้คนประสบความสำเร็จสูง",
        "relationships": "เป็นที่รักใคร่และได้รับการเกื้อหนุนจากผู้คนอย่างสม่ำเสมอ ความสัมพันธ์ราบรื่น",
        "challenges": "ระวังการตามใจผู้อื่นมากเกินไปเพื่อหลีกเลี่ยงความขัดแย้ง จนอาจละเลยความต้องการตนเอง",
        "empowerment": "ใช้เสน่ห์เป็นสะพานสร้างมิตรภาพและเปิดประตูสู่โอกาสใหม่ๆ อย่างมั่นใจในคุณค่าของตน"
    },
    frozenset(["Mars", "Ascendant"]): {
        "pair_name_thai": "คู่พลังขับเคลื่อนและความกล้าหาญ",
        "theme": "บุคลิกภาพที่กระฉับกระเฉง รวดเร็ว มีพลังงานล้นเหลือ พร้อมเผชิญหน้าและลงมือทำทันที",
        "psychology": "ตรงไปตรงมา กล้าตัดสินใจ มีจิตวิญญาณของนักสู้ ไม่ยอมแพ้ต่อความยากลำบาก",
        "career": "ผู้นำ ผู้ประกอบการ วิศวกร งานบุกเบิก และงานที่ต้องตัดสินใจในสถานการณ์กดดัน",
        "relationships": "ชัดเจน จริงใจ แต่บางครั้งอาจดูดุดันหรือใจร้อนในสายตาผู้อื่น",
        "challenges": "ความใจร้อน วู่วาม ความขัดแย้งจากการพูดตรงเกินไป หรืออุบัติเหตุจากความเร่งรีบ",
        "empowerment": "มีสติกำกับความเร็ว นำพลังงานไปทุ่มเทให้กับการออกกำลังกายและการสร้างสรรค์ผลงาน"
    },
    frozenset(["Moon", "Venus"]): {
        "pair_name_thai": "คู่สุนทรียภาพแห่งจิตใจและเมตตาเสน่หา",
        "theme": "ความอ่อนโยน ความอบอุ่น รสนิยมประณีต และความสุขสบายในชีวิต",
        "psychology": "มีจิตใจที่ละเอียดอ่อน มีเสน่ห์แบบธรรมชาติ เข้าอกเข้าใจผู้อื่น รักสันติภาพและความสุขสงบ",
        "career": "โดดเด่นในงานศิลปะ การบริการ สุขภาพ ความงาม การต้อนรับ และการบริหารความสัมพันธ์",
        "relationships": "ความรักราบรื่น อบอุ่น เต็มไปด้วยความเอาใจใส่และเกียรติซึ่งกันและกัน",
        "challenges": "ความรักสบาย การผัดวันประกันพรุ่ง หรือการหลีกเลี่ยงความจริงที่ยากลำบาก",
        "empowerment": "ใช้ความอ่อนโยนเป็นพลังในการประสานรอยร้าวและสร้างบรรยากาศแห่งความสุขให้คนรอบข้าง"
    },
    frozenset(["Sun", "True Node"]): {
        "pair_name_thai": "คู่วาสนาและเส้นทางสู่เกียรติยศ",
        "theme": "โชคชะตานำพาให้ก้าวสู่ความเป็นผู้นำ การค้นพบศักยภาพสูงสุดของตนเอง และการได้รับการยอมรับ",
        "psychology": "มีความมุ่งมั่นสู่ความสำเร็จ มีเป้าหมายชีวิตที่ชัดเจน พร้อมก้าวออกจากพื้นที่คุ้นเคย",
        "career": "ก้าวหน้าในสายงานที่ต้องแสดงตัวตน เป็นที่รู้จักในวงกว้าง และมีบทบาทสำคัญในสังคม",
        "relationships": "ดึงดูดผู้คนที่มีอุดมการณ์เดียวกัน และมักได้รับโอกาสสำคัญผ่านเครือข่ายสัมพันธ์",
        "challenges": "การหลงในชื่อเสียง หรือความทะเยอทะยานที่มากเกินไปจนละเลยความสัมพันธ์ใกล้ชิด",
        "empowerment": "ยึดมั่นในความถูกต้อง นำเกียรติยศมาสร้างประโยชน์แก่สังคมอย่างแท้จริง"
    }
}


def analyze_aspect_dynamics(
    natal_chart: Dict[str, Any],
    thaksa_matrix: Optional[List[Dict[str, Any]]] = None
) -> List[Dict[str, Any]]:
    """
    Synthesizes deep aspect dynamics, planetary pairings, degree orb potency,
    and multi-dimensional impacts for all aspects in the chart.
    """
    raw_aspects = natal_chart.get("aspects", [])
    analyzed_list = []

    for asp in raw_aspects:
        b1 = asp["body1"]
        b2 = asp["body2"]
        asp_name = asp["aspect_name"]
        orb = asp.get("orb", 0.0)
        is_applying = asp.get("is_applying", True)

        # 1. Calculate Potency Score & Classification
        if orb <= 1.0:
            potency_score = int(round(100 - orb * 10))
            potency_level = "Exact (อิทธิพลเข้มข้นสูงสุด)"
            potency_badge = "exact"
        elif orb <= 3.0:
            potency_score = int(round(85 - (orb - 1.0) * 7.5))
            potency_level = "Close (อิทธิพลเด่นชัดตลอดชีวิต)"
            potency_badge = "close"
        elif orb <= 6.0:
            potency_score = int(round(65 - (orb - 3.0) * 5))
            potency_level = "Moderate (อิทธิพลปานกลาง)"
            potency_badge = "moderate"
        else:
            potency_score = max(35, int(round(45 - (orb - 6.0) * 4)))
            potency_level = "Wide (อิทธิพลแฝงในระดับจิตใต้สำนึก)"
            potency_badge = "wide"

        applying_text = (
            "กำลังเข้ามุมสนิท (Applying) - พลังเข้มข้น มีชีวิตชีวา แสดงออกเชิงรุก"
            if is_applying
            else "กำลังคลายมุม (Separating) - บทเรียนหรือสัญชาตญาณที่สั่งสมมาแต่กำเนิด"
        )

        # 2. Planetary Pair Classification (Thai & Western)
        pair_key = frozenset([b1, b2])
        thai_pair_info = None

        n1 = PLANET_NUM_MAP.get(b1)
        n2 = PLANET_NUM_MAP.get(b2)
        if n1 is not None and n2 is not None:
            rel = evaluate_relationship(n1, n2)
            if rel:
                thai_pair_info = {
                    "type": rel["type"],
                    "desc": rel["desc"],
                    "nature": rel.get("nature", "neutral")
                }

        # 3. Resolve Detailed Archetype Interpretation
        curated = NOTABLE_PAIR_INTERPRETATIONS.get(pair_key)
        if curated:
            pair_title = curated["pair_name_thai"]
            core_dynamic = f"{curated['theme']} ผ่านมุม {asp['aspect_thai']} ({asp['aspect_name']})"
            psychology = curated["psychology"]
            career = curated["career"]
            relationships = curated["relationships"]
            challenges = curated["challenges"]
            empowerment = curated["empowerment"]
        else:
            # Dynamic synthesis fallback
            t_type = f" [{thai_pair_info['type']}]" if thai_pair_info else ""
            pair_title = f"คู่สัมพันธ์ {asp['body1_thai']} - {asp['body2_thai']}{t_type}"

            if asp_name in ["Trine", "Sextile"]:
                core_dynamic = f"มุมเกื้อหนุน ({asp['aspect_thai']}) ส่งผลให้พลังของ {asp['body1_thai']} และ {asp['body2_thai']} ไหลเวียนอย่างราบรื่น เกิดเป็นพรสวรรค์และโอกาสในชีวิต"
                psychology = f"มีความสมดุลทางอารมณ์และสติปัญญา ใช้คุณสมบัติของ {asp['body1_thai']} เสริมส่ง {asp['body2_thai']} ได้อย่างเป็นธรรมชาติ"
                career = "ดำเนินงานได้อย่างมีประสิทธิภาพ ได้รับความร่วมมือและการสนับสนุนที่ดี มีความคล่องตัวสูง"
                relationships = "เข้ากับคนได้ง่าย ความสัมพันธ์มีความเข้าใจ เกื้อหนุนและให้เกียรติกัน"
                challenges = "อาจเกิดความชะล่าใจหรือปล่อยให้โอกาสผ่านไปโดยไม่ลงมือคว้าอย่างเต็มที่"
                empowerment = "ลงมือทำอย่างต่อเนื่องเพื่อแปรเปลี่ยนพรสวรรค์ให้เป็นความสำเร็จที่จับต้องได้"
            elif asp_name in ["Square", "Opposition"]:
                core_dynamic = f"มุมท้าทาย ({asp['aspect_thai']}) ก่อให้เกิดแรงกดดันและการเรียนรู้ระหว่าง {asp['body1_thai']} และ {asp['body2_thai']} ผลักดันให้เติบโตอย่างก้าวกระโดด"
                psychology = f"มักเกิดความขัดแย้งภายในระหว่างความต้องการของ {asp['body1_thai']} และ {asp['body2_thai']} ซึ่งต้องการสติในการจัดสมดุล"
                career = "ต้องฟันฝ่าอุปสรรคและแข่งขันสูง แต่หากบริหารจัดการได้จะกลายเป็นผู้นำที่เชี่ยวชาญเป็นพิเศษ"
                relationships = "ระวังความตึงเครียดหรือการยึดถือทัศนะของตนเอง ต้องฝึกการประนีประนอมและการฟังอย่างเปิดใจ"
                challenges = "ความตึงเครียด ความเร่งรีบ หรือการตอบสนองต่อแรงกดดันด้วยอารมณ์"
                empowerment = "แปรเปลี่ยนแรงต้านให้เป็นแรงขับเคลื่อน มองทุกปัญหาเป็นบันไดสู่การยกระดับจิตใจ"
            elif asp_name == "Conjunction":
                core_dynamic = f"มุมกุมสนิท ({asp['aspect_thai']}) หลอมรวมพลังของ {asp['body1_thai']} และ {asp['body2_thai']} เข้าด้วยกันอย่างแนบแน่น มีพลังขับเคลื่อนทรงอานุภาพ"
                psychology = f"แสดงออกคุณลักษณะของทั้งสองดาวอย่างชัดเจนในคราวเดียว มีเอกลักษณ์โดดเด่นและมุ่งมั่นสูง"
                career = "สร้างผลงานที่โดดเด่น มีพลังบุกเบิกและอิทธิพลในสายงานที่เกี่ยวข้องกับทั้งสองดวงดาว"
                relationships = "มีความจริงใจ ชัดเจนในความต้องการ แต่อาจมีพลังดึงดูดที่รุนแรงจนต้องการพื้นที่ของตนเอง"
                challenges = "การแสดงออกที่รุนแรงหรือสุดโต่งเกินไปจนขาดความยืดหยุ่น"
                empowerment = "กำหนดทิศทางของพลังงานให้ชัดเจน มุ่งเน้นการสร้างสรรค์คุณค่าระยะยาว"

            else:
                # Minor aspects have their own geometry; do not label them as conjunctions.
                core_dynamic = f"{asp['body1_thai']} และ {asp['body2_thai']} ทำมุม {asp['aspect_thai']} ({asp['aspect_angle']}°) ควรอ่านร่วมกับแกนอาทิตย์และบริบทอื่นของดวง"
                psychology = "ยังไม่มีบทตีความเฉพาะสำหรับคู่นี้"
                career = "ใช้เป็นประเด็นทบทวนร่วมกับข้อมูลการงานจริง"
                relationships = "ยังไม่สรุปความสัมพันธ์จากมุมนี้เพียงรายการเดียว"
                challenges = "หลีกเลี่ยงการตีความมุมย่อยเสมือนเป็นมุมกุม"
                empowerment = "ตรวจองศาคลาดและหลักการตีความก่อนนำไปประกอบแผน"

        analyzed_list.append({
            "body1": b1,
            "body1_thai": asp["body1_thai"],
            "body1_symbol": asp["body1_symbol"],
            "body2": b2,
            "body2_thai": asp["body2_thai"],
            "body2_symbol": asp["body2_symbol"],
            "aspect_name": asp_name,
            "aspect_thai": asp["aspect_thai"],
            "aspect_symbol": asp["aspect_symbol"],
            "aspect_angle": asp["aspect_angle"],
            "orb": orb,
            "orb_str": asp["orb_str"],
            "is_applying": is_applying,
            "color": asp.get("color", "#38bdf8"),
            "potency_score": potency_score,
            "potency_level": potency_level,
            "potency_badge": potency_badge,
            "applying_text": applying_text,
            "thai_pair_info": thai_pair_info,
            "pair_title": pair_title,
            "core_dynamic": core_dynamic,
            "psychology": psychology,
            "career": career,
            "relationships": relationships,
            "challenges": challenges,
            "empowerment": empowerment
        })

    # Sort by potency score descending (most potent first)
    analyzed_list.sort(key=lambda x: x["potency_score"], reverse=True)
    return analyzed_list
