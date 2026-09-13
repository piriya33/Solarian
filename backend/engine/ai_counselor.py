"""
Solarian AI Astrological Life Counselor Engine.
Combines:
- Western Placidus & Aspect Dynamics
- Thai Maha Thaksa 108-Year Lifecycle
- Eastern Bazi Four Pillars
- Google Gemini API with fallback to deterministic strategic synthesis.
"""

import os
import json
from datetime import date
import urllib.request
import urllib.error
from typing import Dict, Any, List, Optional


SYSTEM_COACH_PERSONA = """คุณคือ "Solarian Life Strategy AI Counselor" - ที่ปรึกษาการสังเคราะห์ชะตาชีวิตระดับสูงที่ผสานมหาทักษาไทย 108 ปี, โหราศาสตร์สากล (Placidus & Aspects), วิถีองศาฐาน 30° (True Solar Arc) และระบบสี่เสาปาจื่อ เข้าด้วยกันอย่างลึกซึ้ง

กฎเหล็กและหลักการสังเคราะห์จากภาพใหญ่ไปหาภาพเล็ก (Macro to Micro Synthesis):
1. หน้าที่ของ AI: ร้อยเรียงคำทำนายจากสิ่งที่ระบบคำนวณไว้ในข้อ (1) และ (2) ออกมาอย่างทรงพลัง สุขุม ลุ่มลึก และนำไปใช้ได้จริง
   - ห้ามคิดคำนวณหรือแต่งเติมตำแหน่งดาวหรือตัวเลของศาเอง เพราะระบบคำนวณด้วยดาราศาสตร์แม่นยำ (Swiss Ephemeris DE431) ไว้อย่างชัดเจนแล้ว
2. การสังเคราะห์ 3 เสาหลัก (จากภาพใหญ่สู่ภาพย่อย):
   ก) เสาหลักที่ 1 - ดาวกระทบ 8 ดวงเดิม (8 Core Natal Planets):
      - ตรวจสอบเจ้าเรือน (House Lordship) ของแต่ละดวง
      - ตรวจสอบภพที่สถิต (House Placement)
      - ตรวจสอบตำแหน่งมหาทักษาเดิม (บริวาร, อายุ, เดช, ศรี, มูละ, อุตสาหะ, มนตรี, กาลกิณี)
      - ตรวจสอบคู่ดาวสัมพันธ์ (คู่มิตร, คู่ศัตรู, คู่สมพล, คู่ธาตุ)
   ข) เสาหลักที่ 2 - มหาทักษา 108 ปี (Current Life Cycle & Timing):
      - ดาวเสวยอายุ (Major Ruler) กุมภาพใหญ่ของยุค: สัมพันธ์กับภพอะไรในดวงเดิม เป็นตำแหน่งอะไรในมหาทักษาเดิม
      - ดาวแทรก (Sub Ruler) เป็นตัวเร่งและจุดเปลี่ยน: สัมพันธ์กับภพอะไรในดวงเดิม เป็นตำแหน่งอะไรในมหาทักษาเดิม
      - ได้คู่ดาวอะไรกับดาวเสวยอายุ (เช่น คู่มิตรใหญ่ ๗+๘, คู่สมพล/ปฏิรูปโครงสร้าง ๗+๕, คู่ศัตรู/พระศุกร์เข้าพระเสาร์แทรก ๗+๖, คู่ธาตุน้ำ ๔+๖)
   ค) เสาหลักที่ 3 - ดาวจรจริง และ วิถีองศาดาวกระทบฐาน 30 องศา (Astronomically Deterministic Triggers):
      - ผสานจุดกระตุ้นวิถีองศาและดาวจร ณ วันอ้างอิงเป็นเรดาร์จังหวะชีวิตเฉพาะช่วงเวลา
3. น้ำเสียงและสไตล์การพยากรณ์:
   - สุขุม นิ่ง ลึกซึ้ง อบอุ่น มีระดับ ดุจปราชญ์ผู้ชี้ทางยุทธศาสตร์ (Executive & Compassionate Wisdom)
   - ปราศจากความงมงายและการทำนายเชิงหายนะ (No Fatalism) มุ่งเน้นการสร้างพลังอำนาจในการตัดสินใจ การบริหารความเสี่ยง และการวางแผนเชิงรุก
"""


def build_astrology_prompt_context(
    chart_data: Dict[str, Any],
    day_res: Dict[str, Any],
    thaksa_matrix: List[Dict[str, Any]],
    timeline_data: Dict[str, Any],
    trinity_data: Dict[str, Any],
    bazi_data: Optional[Dict[str, Any]] = None,
    aspect_dynamics: Optional[List[Dict[str, Any]]] = None
) -> str:
    from backend.engine.interpretation import build_planetary_context, canonical_planet_name
    from backend.engine.dignities import evaluate_relationship

    meta = chart_data.get("metadata", {})
    name = meta.get("name", "เจ้าชะตา")
    birth_date = meta.get("birth_date", "")
    birth_time = meta.get("birth_time", "")
    loc = chart_data.get("location_name", "Bangkok, Thailand")

    lines = [
        "================================================================================",
        "ข้อมูลโทรมาตรดวงชะตาสำหรับการสังเคราะห์ (Macro to Micro Astrological Telemetry)",
        "================================================================================",
        f"ชื่อเจ้าชะตา: {name}",
        f"วันเดือนปีเกิด: {birth_date} เวลา {birth_time} น. สถานที่: {loc}",
        f"วันเกิดทางมหาทักษา: {day_res.get('day_name')} ({'ก่อนพระอาทิตย์ขึ้น' if day_res.get('is_before_sunrise') else 'หลังพระอาทิตย์ขึ้น'})",
        f"ลัคนา (Ascendant): ราศี{chart_data['angles']['Ascendant']['sign_thai']} ({chart_data['angles']['Ascendant']['formatted_dms']})",
        "",
        "--- เสาหลักที่ 1: ดาวกระทบ 8 ดวงเดิม (8 Core Natal Planets) ---",
        "(วิเคราะห์: เจ้าเรือน, ภพที่สถิต, ตำแหน่งมหาทักษาเดิม, คู่ดาวสัมพันธ์)",
    ]

    core_8 = [
        ("Sun", 1, "อาทิตย์", "๑"),
        ("Moon", 2, "จันทร์", "๒"),
        ("Mars", 3, "อังคาร", "๓"),
        ("Mercury", 4, "พุธ", "๔"),
        ("Jupiter", 5, "พฤหัสบดี", "๕"),
        ("Venus", 6, "ศุกร์", "๖"),
        ("Saturn", 7, "เสาร์", "๗"),
        ("Rahu", 8, "ราหู", "๘"),
    ]

    for p_name, p_num, p_thai, p_sym in core_8:
        p_ctx = build_planetary_context(
            natal_chart=chart_data,
            planet_name=p_name,
            thaksa_matrix=thaksa_matrix
        )
        plc = p_ctx.get("placement", {})
        h_rule = p_ctx.get("house_rulership", {})
        ruled_str = ", ".join([f"เรือน {h['house']} ({h.get('theme', '')})" for h in h_rule.get("houses", [])]) or "ไม่มีเรือนเกษตรหลักในชะตานี้"
        thaksa_role = p_ctx.get("natal_thaksa") or {}
        role_str = f"{thaksa_role.get('role_thai', '—')} ({thaksa_role.get('role_desc', '')})"

        lines.append(
            f"• ดาว{p_thai} ({p_sym}):\n"
            f"  - สถิตภพ: ภพที่ {plc.get('house', '—')} ({plc.get('house_theme', '—')}) ในราศี{plc.get('sign_thai', '—')}\n"
            f"  - เจ้าเรือน: {ruled_str}\n"
            f"  - ตำแหน่งมหาทักษาเดิม: {role_str}"
        )

    if aspect_dynamics:
        lines.append("\n--- คู่ดาวสัมพันธ์ที่ส่งผลเด่นชัดในดวงเดิม (Planetary Pair Dynamics) ---")
        for ad in aspect_dynamics[:6]:
            pair_info = ad.get("thai_pair_info") or {}
            pair_type = pair_info.get("type", "")
            lines.append(f"- {ad['body1_thai']} ทำมุม {ad['aspect_thai']} ({ad['aspect_symbol']}) กับ {ad['body2_thai']} [{pair_type}]: {ad['core_dynamic']}")

    today = date.today()
    try:
        born = date.fromisoformat(birth_date)
        curr_age = max(0, min(108, today.year - born.year - ((today.month, today.day) < (born.month, born.day))))
    except ValueError:
        curr_age = None

    lines.append(f"\n--- เสาหลักที่ 2: มหาทักษา 108 ปี (จังหวะชีวิต ณ อายุปัจจุบัน {curr_age} ปี) ---")
    years_map = timeline_data.get("years_map", [])
    curr_reading = None
    for y_entry in years_map:
        if y_entry["age"] == curr_age:
            curr_reading = y_entry
            break

    if curr_reading:
        lines.append(f"• วงรอบอายุเต็ม: {curr_age} ปี (อายุย่าง {curr_reading.get('age_yang', curr_age + 1)} ปี, ค.ศ. {curr_reading.get('calendar_year')})")
        lines.append(f"• ดาวเสวยอายุ (Major Ruler - บริบทภาพใหญ่): ดาว{curr_reading['major_planet']['thai']} ({curr_reading['major_planet']['symbol']})")
        lines.append(f"• ดาวแทรกอายุ (Sub Ruler - ตัวเร่งและจุดเปลี่ยน): ดาว{curr_reading['sub_planet']['thai']} ({curr_reading['sub_planet']['symbol']})")
        lines.append(f"• ทักษาจรประจำปี (Annual Thaksa): ดาว{curr_reading['annual_thaksa']['thai']} ({curr_reading['annual_thaksa']['symbol']})")

        rd = curr_reading.get("reading", {})
        macro_ctx = rd.get("macro_detail", {}).get("planetary_context", {})
        sub_ctx = rd.get("sub_detail", {}).get("planetary_context", {})

        # House Lordship Context
        if macro_ctx.get("house_rulership", {}).get("houses"):
            m_houses = [f"เรือน {h['house']} ({h.get('theme', '')})" for h in macro_ctx["house_rulership"]["houses"]]
            lines.append(f"  - ความสัมพันธ์กับภพเดิมของดาวเสวยอายุ: เป็นเจ้าเรือน {', '.join(m_houses)}")
        if sub_ctx.get("house_rulership", {}).get("houses"):
            s_houses = [f"เรือน {h['house']} ({h.get('theme', '')})" for h in sub_ctx["house_rulership"]["houses"]]
            lines.append(f"  - ความสัมพันธ์กับภพเดิมของดาวแทรก: เป็นเจ้าเรือน {', '.join(s_houses)}")

        # Natal Thaksa Context
        if macro_ctx.get("natal_thaksa"):
            mt = macro_ctx["natal_thaksa"]
            lines.append(f"  - ตำแหน่งมหาทักษาเดิมของดาวเสวยอายุ: {mt['role_thai']} ({mt['role_desc']})")
        if sub_ctx.get("natal_thaksa"):
            st = sub_ctx["natal_thaksa"]
            lines.append(f"  - ตำแหน่งมหาทักษาเดิมของดาวแทรก: {st['role_thai']} ({st['role_desc']})")

        # Pairing Dynamic between Major and Sub Ruler
        if rd.get("sub_detail", {}).get("pair_type"):
            lines.append(f"  - พลวัตคู่ดาวเสวยอายุ + ดาวแทรก: {rd['sub_detail']['pair_type']} ({rd['sub_detail'].get('pair_desc', '')})")

        if rd.get("macro_detail"):
            lines.append(f"  - ธีมหลักของยุค: {rd['macro_detail']['epoch_theme']}")
        if rd.get("action_plan"):
            lines.append(f"  - เข็มทิศชี้นำการตัดสินใจ: {rd['action_plan']['decision_framework']}")

    lines.append("\n--- เสาหลักที่ 3: ดาวจรจริง และ วิถีองศาดาวกระทบฐาน 30 องศา (คำนวณแบบ Astronomically Deterministic) ---")
    sun = chart_data['planets_dict']['Sun']
    lines.append(f"• แกนดวงอาทิตย์กำเนิด: ลองจิจูด {sun.get('longitude')}° ({sun.get('sign_thai')} {sun.get('formatted_dms')})")
    sun_aspects = [a for a in chart_data.get('aspects', []) if a.get('body1') == 'Sun' or a.get('body2') == 'Sun']
    lines.append("มุมสัมพันธ์สู่อาทิตย์ทั้งหมดจากเครื่องคำนวณ: " + json.dumps(sun_aspects, ensure_ascii=False))
    lines.append("\n=== วิถีองศาดาวกระทบฐาน 30°: ข้อมูลตามสูตร แยกจากดาวจรจริง ===")
    lines.append("(องศาดาวกำเนิด − องศาอาทิตย์กำเนิด) mod 30; วนรอบ 30 ปี; ค่า 0 เริ่มรอบ 30 ปี; exact_age เป็นอายุทศนิยม ส่วน rounded_age คือช่องปีที่ปัดค่าด้วย Python round ไม่ใช่วันเกิดเหตุการณ์")
    lines.append(json.dumps(timeline_data.get('degree_triggers_catalog', []), ensure_ascii=False))
    lines.append("• วิถีองศาดาวกระทบฐาน 30° ในช่องอายุนี้:")
    degree_triggers = curr_reading.get("degree_triggers", []) if curr_reading else []
    if degree_triggers:
        lines.append(json.dumps(degree_triggers, ensure_ascii=False))
    else:
        lines.append("ไม่มีจุดกระตุ้นในช่องอายุนี้")

    if bazi_data:
        pillars = bazi_data.get("four_pillars", {})
        dm = bazi_data.get("day_master", {})
        elem_pct = bazi_data.get("five_elements_percent", {})
        f_elems = ", ".join(dm.get("favorable_elements", []))
        lines.append(f"\n--- ระบบสี่เสาชะตาชีวิตปาจื่อ (Bazi Four Pillars Context) ---")
        lines.append(f"เวลาสุริยคติแท้ (True Solar Time): {bazi_data.get('true_solar_time')}")
        lines.append(f"เสาปี: {pillars.get('year', {}).get('stem', {}).get('chinese')}{pillars.get('year', {}).get('branch', {}).get('chinese')} ({pillars.get('year', {}).get('stem', {}).get('thai')}/{pillars.get('year', {}).get('branch', {}).get('thai')})")
        lines.append(f"เสาเดือน: {pillars.get('month', {}).get('stem', {}).get('chinese')}{pillars.get('month', {}).get('branch', {}).get('chinese')} [{pillars.get('month', {}).get('ten_god', {}).get('chinese')}]")
        lines.append(f"เสาวัน (Day Master): {dm.get('stem', {}).get('chinese')} ({dm.get('stem', {}).get('thai')}) - สภาพ: {dm.get('strength')}")
        lines.append(f"เสายาม: {pillars.get('hour', {}).get('stem', {}).get('chinese')}{pillars.get('hour', {}).get('branch', {}).get('chinese')} [{pillars.get('hour', {}).get('ten_god', {}).get('chinese')}]")
        lines.append(f"สมดุลห้าธาตุ: ไม้ {elem_pct.get('Wood')}%, ไฟ {elem_pct.get('Fire')}%, ดิน {elem_pct.get('Earth')}%, ทอง {elem_pct.get('Metal')}%, น้ำ {elem_pct.get('Water')}%")
        lines.append(f"ธาตุปรับสมดุล/ส่งเสริม (Favorable): {f_elems}")

    lines.append("\n================================================================================")
    lines.append("คำสั่งแก่ AI: ร้อยเรียงคำทำนายจากข้อ 1, 2 และ 3 ออกมาโดยสังเคราะห์จากภาพใหญ่ไปหาภาพเล็ก")
    lines.append("================================================================================")
    return "\n".join(lines)


def call_openrouter_api(
    prompt: str,
    system_prompt: str = SYSTEM_COACH_PERSONA,
    api_key: Optional[str] = None,
    model: str = "google/gemini-2.5-flash"
) -> Optional[str]:
    """
    Calls the OpenRouter unified API (https://openrouter.ai/api/v1/chat/completions)
    Supports any OpenRouter model, defaulting to google/gemini-2.5-flash or anthropic/claude-3.5-sonnet.
    """
    key = api_key or os.environ.get("OPENROUTER_API_KEY")
    if not key:
        return None

    url = "https://openrouter.ai/api/v1/chat/completions"
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7,
        "max_tokens": 2048
    }

    try:
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {key}",
                "HTTP-Referer": "https://solarian.app",
                "X-Title": "Solarian Astrology & Life Strategy"
            },
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            choice = data["choices"][0]["message"]["content"]
            return choice
    except Exception as e:
        print(f"OpenRouter API invocation error: {e}")
        return None


def call_gemini_api(prompt: str, system_prompt: str = SYSTEM_COACH_PERSONA, api_key: Optional[str] = None) -> Optional[str]:
    key = api_key or os.environ.get("GEMINI_API_KEY")
    if not key:
        return None

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={key}"
    payload = {
        "system_instruction": {
            "parts": [{"text": system_prompt}]
        },
        "contents": [
            {
                "role": "user",
                "parts": [{"text": prompt}]
            }
        ],
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 2048,
        }
    }

    try:
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=20) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            text = data["candidates"][0]["content"]["parts"][0]["text"]
            return text
    except Exception as e:
        print(f"Gemini API invocation error: {e}")
        return None


def call_ai_counselor_api(
    prompt: str,
    system_prompt: str = SYSTEM_COACH_PERSONA,
    api_key: Optional[str] = None,
    preferred_provider: Optional[str] = None,
    model: Optional[str] = None
) -> Dict[str, Any]:
    """
    Unified AI router:
    1. If user key or env has OPENROUTER_API_KEY (or key starts with 'sk-or-'), uses OpenRouter.
    2. Otherwise, if GEMINI_API_KEY is present, uses Google Gemini.
    3. Falls back gracefully between providers before returning None.
    """
    # Detect OpenRouter key
    is_openrouter_key = (api_key and "sk-or-" in api_key) or os.environ.get("OPENROUTER_API_KEY")

    if is_openrouter_key or preferred_provider == "openrouter":
        or_key = api_key if (api_key and "sk-or-" in api_key) else os.environ.get("OPENROUTER_API_KEY")
        selected_model = model or "google/gemini-2.5-flash"
        text = call_openrouter_api(prompt, system_prompt=system_prompt, api_key=or_key, model=selected_model)
        if text:
            return {"success": True, "text": text, "provider": "openrouter", "model": selected_model}

    # Try Gemini API
    gemini_key = api_key if (api_key and "sk-or-" not in api_key) else os.environ.get("GEMINI_API_KEY")
    if gemini_key:
        text = call_gemini_api(prompt, system_prompt=system_prompt, api_key=gemini_key)
        if text:
            return {"success": True, "text": text, "provider": "gemini", "model": "gemini-2.5-flash"}

    # Fallback to OpenRouter with default key if gemini failed
    if os.environ.get("OPENROUTER_API_KEY"):
        text = call_openrouter_api(prompt, system_prompt=system_prompt, api_key=os.environ.get("OPENROUTER_API_KEY"))
        if text:
            return {"success": True, "text": text, "provider": "openrouter", "model": "google/gemini-2.5-flash"}

    return {"success": False, "text": None, "provider": None}


def generate_structured_fallback_reading(chart_data: Dict[str, Any], bazi_data: Optional[Dict[str, Any]] = None) -> str:
    name = chart_data.get("metadata", {}).get("name", "เจ้าชะตา")
    sun_sign = chart_data["planets_dict"]["Sun"]["sign_thai"]
    moon_sign = chart_data["planets_dict"]["Moon"]["sign_thai"]
    asc_sign = chart_data["angles"]["Ascendant"]["sign_thai"]
    dm_char = bazi_data["day_master"]["stem"]["chinese"] if bazi_data else "壬"
    dm_thai = bazi_data["day_master"]["stem"]["thai"] if bazi_data else "ธาตุน้ำหยาง"
    dm_strength = bazi_data["day_master"]["strength"] if bazi_data else "แข็งแรง"

    return f"""# 🌟 บทวิเคราะห์และพิมพ์เขียวกลยุทธ์ชีวิต (Solarian Executive Life Blueprint)
**จัดทำเป็นพิเศษสำหรับ:** {name}
**การผสาน 3 เสาหลัก:** สากลพลาซิดัส ({sun_sign}/{asc_sign}) • มหาทักษา 108 ปี • ปาจื่อ ({dm_char} {dm_thai})

---

### 1. ถอดรหัสแก่นแท้แห่งตัวตนและพลังงานจิตวิญญาณ (Core Archetype & Energy Matrix)
* **พิมพ์เขียวพลังงานหลัก:** ลัคนาสถิตราศี**{asc_sign}** ขับเคลื่อนด้วยดวงอาทิตย์ในราศี**{sun_sign}** และดวงจันทร์ราศี**{moon_sign}** ทำให้คุณเป็นผู้ที่มีทั้งวิสัยทัศน์ที่กว้างไกลและความสามารถในการสังเกตการณ์ที่ลึกซึ้ง
* **มิติปาจื่อ (Day Master {dm_char}):** คุณครองธาตุ **{dm_thai}** สภาพพลังงาน **{dm_strength}** สะท้อนถึงสัญชาตญาณความยืดหยุ่น การปรับตัวต่อสภาพแวดล้อมที่เปลี่ยนแปลงได้ดีดั่งสายน้ำ มีความลึกซึ้งในเชิงความคิด และมีพลังขับเคลื่อนที่สะสมไว้ภายในอย่างมหาศาล
* **จุดแข็งที่ไร้เทียมทาน:** ความสามารถในการเชื่อมโยงข้อมูลหลายมิติ การวางแผนระยะยาวที่รัดกุม และการเป็นที่พึ่งพาทางความคิดให้กับผู้อื่น

---

### 2. วิเคราะห์จังหวะชีวิต ยุคสมัย และการบริหารเอนโทรปี (Current Chapter & Entropy Management)
* **สภาวะแวดล้อมปัจจุบัน:** คุณกำลังอยู่ในรอบชีวิตที่ต้องจัดระบบระเบียบ การเปลี่ยนผ่านพลังงานเรียกร้องให้ลดทอนสิ่งที่ไม่จำเป็น (De-cluttering Entropy) และมุ่งสร้างความเข้มแข็งให้กับสินทรัพย์หลัก
* **กับดักที่ต้องหลีกเลี่ยง (Blindspot):** ระวังการแบกรับภาระหรือความรับผิดชอบแทนผู้อื่นมากเกินไปจนเกิดความอ่อนล้าทางความคิด (Cognitive Overload) รวมถึงการลังเลในการตัดสินใจเมื่อมีทางเลือกมากเกินไป
* **กฎทองการตัดสินใจ:** มุ่งเลือกเส้นทางที่สร้าง "ผลลัพธ์สะสมระยะยาว (Compounding Value)" มากกว่าผลตอบแทนฉาบฉวยที่มาพร้อมภาระผูกพัน

---

### 3. สามเสาหลักแห่งความสำเร็จ (The 3 Strategic Domains)
* 💼 **การงานและธุรกิจ (Career Mastery):** ทิศทางที่เติบโตได้ดีที่สุด คืองานที่ผสมผสานความเชี่ยวชาญเฉพาะทาง การวางระบบโครงสร้าง หรือการเป็นที่ปรึกษาเชิงยุทธศาสตร์ ควรสร้างผลงานที่กลายเป็นทรัพย์สินทางปัญญา (IP / System Assets)
* 💰 **การเงินและความมั่งคั่ง (Wealth Accumulation):** สไตล์ความมั่งคั่งของคุณมาจากการวางแผนอย่างรอบคอบ ไม่เหมาะกับการเก็งกำไรระยะสั้นที่มีความเสี่ยงสูง แต่เหมาะกับการสะสมสินทรัพย์คุณภาพสูงและกระจายการลงทุนอย่างมีระเบียบ
* ❤️ **ความสัมพันธ์และพันธมิตร (Synergy & Relationships):** คุณต้องการคู่คิดและมิตรแท้ที่เข้าใจในโลกส่วนตัว สามารถแลกเปลี่ยนมุมมองทางปัญญาได้อย่างเท่าเทียม และเคารพในพื้นที่ของกันและกัน

---

### 4. แผนปฏิบัติการเชิงรุก 90 วัน (Immediate 90-Day Action Roadmap)
1. **จัดระบบงานและการเงิน:** ทบทวนรายจ่าย สัญญา และข้อตกลงทางธุรกิจให้อยู่ในสถานะที่รัดกุมและคล่องตัวสูงสุด
2. **ขยายพันธมิตรคุณภาพ:** เชื่อมโยงและกระชับความสัมพันธ์กับบุคคลที่มีความเชี่ยวชาญเสริมจุดแข็งของคุณ
3. **กำหนดขอบเขตเวลาและพลังงาน:** ปฏิเสธสิ่งที่ไม่สอดคล้องกับเป้าหมายหลัก เพื่อรักษาโฟกัสสูงสุดในโครงการสำคัญที่สุด
"""


def generate_structured_fallback_chat(question: str, chart_data: Dict[str, Any], bazi_data: Optional[Dict[str, Any]] = None) -> str:
    name = chart_data.get("metadata", {}).get("name", "คุณ")
    sun_sign = chart_data["planets_dict"]["Sun"]["sign_thai"]
    asc_sign = chart_data["angles"]["Ascendant"]["sign_thai"]
    dm_char = bazi_data["day_master"]["stem"]["chinese"] if bazi_data else "壬"
    dm_elem = bazi_data["day_master"]["stem"]["thai"] if bazi_data else "ธาตุน้ำ"

    q_lower = question.lower()
    if any(k in q_lower for k in ["งาน", "อาชีพ", "ธุรกิจ", "ย้าย", "เปลี่ยนงาน"]):
        return f"""จากพิมพ์เขียวดวงชะตาของ {name} (ลัคนา{asc_sign}, อาทิตย์{sun_sign}, Day Master {dm_char}):
- **เชิงกลยุทธ์การงาน:** คุณเป็นคนที่มีพลังแห่งการวางแผนและสร้างระบบ (Architect/Strategist) จังหวะดวงดาวบ่งชี้ว่าการเปลี่ยนแปลงที่ได้ผลลัพธ์สูงสุดต้องเกิดจากการเตรียมการล่วงหน้าและมีฐานรองรับที่ชัดเจน
- **ข้อแนะนำ:** หากจะริเริ่มโครงการใหม่หรือเปลี่ยนงาน ควรมุ่งเน้นตำแหน่งหรือธุรกิจที่คุณมีอำนาจตัดสินใจเชิงนโยบาย หรือได้ใช้ความเชี่ยวชาญเฉพาะทาง หลีกเลี่ยงบทบาทที่เน้นการทำงานรูทีนซ้ำซากโดยไร้อิสระทางความคิดครับ"""
    elif any(k in q_lower for k in ["เงิน", "ลงทุน", "รวย", "หนี้", "โชค"]):
        return f"""ในมิติการเงินและความมั่งคั่งตามพื้นดวงของ {name}:
- **กระแสเงินและสินทรัพย์:** ด้วยธาตุ {dm_elem} และเรือนการเงินที่สัมพันธ์กับโครงสร้างระยะยาว คุณจะสร้างความมั่งคั่งได้มั่นคงที่สุดจากการสะสมสินทรัพย์ที่จับต้องได้และการสร้างกระแสเงินสดต่อเนื่อง
- **ข้อควรระวัง:** ระวังความใจกว้างในการค้ำประกันหรือการร่วมลงทุนที่ขาดความโปร่งใสในเอกสารสัญญา ควรแยกเงินสำรองฉุกเฉินและเน้นการลงทุนที่คุณเข้าใจอย่างถ่องแท้เสมอครับ"""
    elif any(k in q_lower for k in ["รัก", "คู่", "แฟน", "แต่ง", "เลิก"]):
        return f"""ในมิติความสัมพันธ์และคู่ครอง (ปัตนิ):
- **สไตล์ความสัมพันธ์:** พื้นดวงต้องการคู่ครองที่เปรียบเสมือน "เพื่อนคู่คิด (Intellectual Partner)" ที่มีวุฒิภาวะทางอารมณ์สูง และเคารพในโลกส่วนตัวของกันและกัน
- **หัวใจสำคัญ:** การสื่อสารอย่างตรงไปตรงมาแต่เปี่ยมด้วยความเห็นอกเห็นใจ (Compassionate Candor) จะช่วยคลี่คลายปัญหาได้ดีที่สุด หลีกเลี่ยงการเก็บงำความรู้สึกหรือคาดหวังให้อีกฝ่ายเดาใจครับ"""
    else:
        return f"""สำหรับคำถาม: \"{question}\"
เมื่อพิจารณาจากตำแหน่งดาวในระบบพลาซิดัสร่วมกับธาตุเจ้าชะตา {dm_char} ({dm_elem}):
- พลังงานหลักของคุณสนับสนุนการตัดสินใจที่มีเป้าหมายชัดเจนและการมองภาพรวมระยะยาว
- ในช่วงเวลานี้ การรักษาจุดยืนที่มั่นคงแต่ปรับเปลี่ยนวิธีการได้อย่างยืดหยุ่น (Firm Principles, Flexible Tactics) คือกลยุทธ์ที่สร้างความได้เปรียบสูงสุดให้คุณครับ"""
