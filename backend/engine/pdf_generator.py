"""
Solarian Astrology Engine - PDF Report Generator
Generates high-resolution, multi-page astrological reports using ReportLab with Thai font support.
"""

from __future__ import annotations
import os
import io
from typing import Dict, List, Any
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.graphics.shapes import Drawing, Circle, Line, String, Rect, Polygon
import math

# Register Thai font
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
FONT_PATH = os.path.join(CURRENT_DIR, "..", "fonts", "NotoSansThai.ttf")

if os.path.exists(FONT_PATH):
    pdfmetrics.registerFont(TTFont("NotoSansThai", FONT_PATH))
    FONT_NAME = "NotoSansThai"
else:
    FONT_NAME = "Helvetica"


ZODIAC_SIGNS = [
    {"name": "Aries", "abbr": "ARI", "thai": "เมษ", "element": "fire", "bg": "#fee2e2", "border": "#f87171"},
    {"name": "Taurus", "abbr": "TAU", "thai": "พฤษภ", "element": "earth", "bg": "#dcfce7", "border": "#4ade80"},
    {"name": "Gemini", "abbr": "GEM", "thai": "เมถุน", "element": "air", "bg": "#e0f2fe", "border": "#38bdf8"},
    {"name": "Cancer", "abbr": "CAN", "thai": "กรกฎ", "element": "water", "bg": "#ede9fe", "border": "#818cf8"},
    {"name": "Leo", "abbr": "LEO", "thai": "สิงห์", "element": "fire", "bg": "#fee2e2", "border": "#f87171"},
    {"name": "Virgo", "abbr": "VIR", "thai": "กันย์", "element": "earth", "bg": "#dcfce7", "border": "#4ade80"},
    {"name": "Libra", "abbr": "LIB", "thai": "ตุลย์", "element": "air", "bg": "#e0f2fe", "border": "#38bdf8"},
    {"name": "Scorpio", "abbr": "SCO", "thai": "พิจิก", "element": "water", "bg": "#ede9fe", "border": "#818cf8"},
    {"name": "Sagittarius", "abbr": "SAG", "thai": "ธนู", "element": "fire", "bg": "#fee2e2", "border": "#f87171"},
    {"name": "Capricorn", "abbr": "CAP", "thai": "มังกร", "element": "earth", "bg": "#dcfce7", "border": "#4ade80"},
    {"name": "Aquarius", "abbr": "AQU", "thai": "กุมภ์", "element": "air", "bg": "#e0f2fe", "border": "#38bdf8"},
    {"name": "Pisces", "abbr": "PIS", "thai": "มีน", "element": "water", "bg": "#ede9fe", "border": "#818cf8"},
]

PLANET_COLORS = {
    "Sun": "#d97706",
    "Moon": "#475569",
    "Mercury": "#059669",
    "Venus": "#0891b2",
    "Mars": "#dc2626",
    "Jupiter": "#7c3aed",
    "Saturn": "#b45309",
    "Uranus": "#0284c7",
    "Neptune": "#4f46e5",
    "Pluto": "#7e22ce",
    "True Node": "#334155",
    "Mean Node": "#64748b",
    "Chiron": "#0d9488"
}

PLANET_SAFE_ABBRS = {
    "Sun": "Sun",
    "Moon": "Moon",
    "Mercury": "Mer",
    "Venus": "Ven",
    "Mars": "Mars",
    "Jupiter": "Jup",
    "Saturn": "Sat",
    "Uranus": "Ura",
    "Neptune": "Nep",
    "Pluto": "Plu",
    "True Node": "Node",
    "Mean Node": "MNode",
    "Chiron": "Chi"
}


def draw_chart_wheel(chart_data: Dict[str, Any], width: float = 500, height: float = 330) -> Drawing:
    """
    Renders an executive publication-grade vector Placidus natal chart wheel.
    Features:
    - 12 Zodiac sign sectors with traditional element fills and labels
    - 12 Placidus house divider lines oriented with Ascendant at 9 o'clock (Left) and MC at 12 o'clock (Top)
    - AC, MC, DC, IC bold axis markers
    - Bold house numbers 1-12 centered in each house sector
    - Exact planet placements with degree notations and smart multi-tier radial staggering for conjunctions
    - Central aspect web with color-coded harmonizing and tension chords
    """
    d = Drawing(width, height)
    cx, cy = width / 2.0, height / 2.0

    r_outer = 140.0
    r_zodiac = 116.0
    r_planets_max = 110.0
    r_houses = 76.0
    r_aspects = 48.0
    r_center = 15.0

    asc_deg = chart_data["angles"]["Ascendant"]["longitude"]

    def lon_to_wheel_angle(lon: float) -> float:
        """Converts ecliptic longitude into wheel angle where Ascendant is at 9 o'clock (180 deg)."""
        return (180.0 + (lon - asc_deg)) % 360.0

    def polar_to_xy(r: float, angle_deg: float):
        rad = math.radians(angle_deg)
        return cx + r * math.cos(rad), cy + r * math.sin(rad)

    # 1. Outer background disc
    d.add(Circle(cx, cy, r_outer, strokeColor=colors.HexColor("#cbd5e1"), fillColor=colors.HexColor("#f8fafc"), strokeWidth=1.0))

    # 2. Draw 12 Zodiac segments
    for i, sign in enumerate(ZODIAC_SIGNS):
        lon_start = i * 30.0
        lon_end = (i + 1) * 30.0

        ang_start = lon_to_wheel_angle(lon_start)
        ang_end = lon_to_wheel_angle(lon_end)

        points = []
        steps = 6
        span = (ang_end - ang_start) % 360.0
        if span <= 0: span += 360.0
        for s in range(steps + 1):
            a = ang_start + (span * s / steps)
            x, y = polar_to_xy(r_outer, a)
            points.extend([x, y])
        for s in range(steps, -1, -1):
            a = ang_start + (span * s / steps)
            x, y = polar_to_xy(r_zodiac, a)
            points.extend([x, y])

        d.add(Polygon(points, strokeColor=colors.HexColor(sign["border"]), fillColor=colors.HexColor(sign["bg"]), strokeWidth=0.5))

        # Zodiac label at midpoint
        mid_ang = (ang_start + span / 2.0) % 360.0
        lx, ly = polar_to_xy((r_outer + r_zodiac) / 2.0, mid_ang)
        d.add(String(lx, ly - 3, sign["abbr"], fontName="Helvetica-Bold", fontSize=7, fillColor=colors.HexColor("#0f172a"), textAnchor="middle"))

    # Boundary ring between Zodiac and Houses
    d.add(Circle(cx, cy, r_zodiac, strokeColor=colors.HexColor("#94a3b8"), fillColor=colors.transparent, strokeWidth=1.0))

    # Middle disc (Houses area)
    d.add(Circle(cx, cy, r_zodiac, strokeColor=colors.HexColor("#cbd5e1"), fillColor=colors.HexColor("#ffffff"), strokeWidth=0.8))

    # Central aspect web disc
    d.add(Circle(cx, cy, r_aspects, strokeColor=colors.HexColor("#94a3b8"), fillColor=colors.HexColor("#f8fafc"), strokeWidth=1.0))

    # 3. Draw Aspect Web inside center disc
    aspects = chart_data.get("aspects", [])
    planets_dict = chart_data.get("planets_dict", {})
    drawn_pairs = set()

    for asp in aspects[:24]:
        b1, b2 = asp["body1"], asp["body2"]
        pair_key = frozenset([b1, b2])
        if pair_key in drawn_pairs: continue
        drawn_pairs.add(pair_key)

        p1 = planets_dict.get(b1)
        p2 = planets_dict.get(b2)
        if not p1 or not p2: continue

        a1 = lon_to_wheel_angle(p1["longitude"])
        a2 = lon_to_wheel_angle(p2["longitude"])
        x1, y1 = polar_to_xy(r_aspects, a1)
        x2, y2 = polar_to_xy(r_aspects, a2)

        asp_name = asp.get("aspect_name", "")
        if asp_name in ["Trine", "Sextile"]:
            line_color = colors.HexColor("#10b981") if asp_name == "Trine" else colors.HexColor("#0ea5e9")
            line_w = 0.9 if asp["orb"] <= 2.0 else 0.5
        elif asp_name in ["Square", "Opposition"]:
            line_color = colors.HexColor("#ef4444") if asp_name == "Square" else colors.HexColor("#8b5cf6")
            line_w = 0.9 if asp["orb"] <= 2.0 else 0.5
        elif asp_name == "Conjunction":
            line_color = colors.HexColor("#f59e0b")
            line_w = 1.0
        else:
            line_color = colors.HexColor("#cbd5e1")
            line_w = 0.4

        d.add(Line(x1, y1, x2, y2, strokeColor=line_color, strokeWidth=line_w))

    # Center Hub
    d.add(Circle(cx, cy, r_center, strokeColor=colors.HexColor("#64748b"), fillColor=colors.HexColor("#1e293b"), strokeWidth=1.0))
    d.add(String(cx, cy - 2, "SOLARIAN", fontName="Helvetica-Bold", fontSize=4.5, fillColor=colors.HexColor("#f8fafc"), textAnchor="middle"))

    # 4. Draw 12 Placidus House Divider Lines & House Numbers
    houses = chart_data.get("houses", [])
    for i, h in enumerate(houses):
        h_deg = h["longitude"]
        ang = lon_to_wheel_angle(h_deg)

        h_num = h["house"]
        is_axis = h_num in [1, 4, 7, 10]
        line_color = colors.HexColor("#0284c7") if is_axis else colors.HexColor("#cbd5e1")
        line_w = 1.6 if is_axis else 0.6

        x1, y1 = polar_to_xy(r_aspects, ang)
        x2, y2 = polar_to_xy(r_outer, ang)
        d.add(Line(x1, y1, x2, y2, strokeColor=line_color, strokeWidth=line_w))

        # House number (positioned in inner house ring)
        next_h = houses[(i + 1) % 12]
        next_ang = lon_to_wheel_angle(next_h["longitude"])
        h_span = (next_ang - ang) % 360.0
        if h_span <= 0: h_span += 360.0
        h_mid_ang = (ang + h_span / 2.0) % 360.0

        hx, hy = polar_to_xy((r_houses + r_aspects) / 2.0 + 2, h_mid_ang)
        d.add(String(hx, hy - 3, str(h_num), fontName="Helvetica-Bold", fontSize=7.5, fillColor=colors.HexColor("#475569"), textAnchor="middle"))

    # Axis Labels (AC, DC, MC, IC) with clean pill badges
    d.add(String(cx - r_outer - 18, cy - 4, "AC", fontName="Helvetica-Bold", fontSize=9, fillColor=colors.HexColor("#0284c7")))
    d.add(String(cx + r_outer + 6, cy - 4, "DC", fontName="Helvetica-Bold", fontSize=9, fillColor=colors.HexColor("#0284c7")))

    mc_deg = chart_data["angles"]["Midheaven"]["longitude"]
    mc_ang = lon_to_wheel_angle(mc_deg)
    mc_x, mc_y = polar_to_xy(r_outer + 12, mc_ang)
    d.add(String(mc_x, mc_y - 4, "MC", fontName="Helvetica-Bold", fontSize=9, fillColor=colors.HexColor("#0284c7"), textAnchor="middle"))

    ic_angle_data = chart_data["angles"].get("ImumCoeli") or chart_data["angles"].get("Imum Coeli")
    if ic_angle_data:
        ic_deg = ic_angle_data["longitude"]
        ic_ang = lon_to_wheel_angle(ic_deg)
        ic_x, ic_y = polar_to_xy(r_outer + 12, ic_ang)
        d.add(String(ic_x, ic_y - 4, "IC", fontName="Helvetica-Bold", fontSize=9, fillColor=colors.HexColor("#0284c7"), textAnchor="middle"))

    # 5. Smart Multi-Tier Planet Anti-Collision Plotting
    planets = chart_data.get("planets", [])
    sorted_planets = []
    for p in planets:
        ang = lon_to_wheel_angle(p["longitude"])
        sorted_planets.append({"ang": ang, "data": p})
    sorted_planets.sort(key=lambda x: x["ang"])

    # Assign non-overlapping radial tiers (Tier 0: r=104, Tier 1: r=91, Tier 2: r=79)
    tiers = [104.0, 91.0, 79.0]
    n_p = len(sorted_planets)

    for i in range(n_p):
        curr = sorted_planets[i]
        tier_idx = 0
        for back_i in range(1, 3):
            if i - back_i >= 0:
                prev = sorted_planets[i - back_i]
                raw_diff = abs(curr["ang"] - prev["ang"])
                diff = min(raw_diff, 360.0 - raw_diff)
                if diff < 10.0 and prev.get("tier") == tier_idx:
                    tier_idx = (tier_idx + 1) % len(tiers)
        curr["tier"] = tier_idx

    # Draw planets
    for p_entry in sorted_planets:
        ang = p_entry["ang"]
        p = p_entry["data"]
        tier_r = tiers[p_entry["tier"]]

        dot_x, dot_y = polar_to_xy(r_zodiac - 2, ang)
        px, py = polar_to_xy(tier_r, ang)

        p_color = colors.HexColor(PLANET_COLORS.get(p["name"], "#0284c7"))

        d.add(Line(dot_x, dot_y, px, py, strokeColor=p_color, strokeWidth=0.4))
        d.add(Circle(px, py, 2.5, strokeColor=colors.white, fillColor=p_color, strokeWidth=0.6))

        abbr = PLANET_SAFE_ABBRS.get(p["name"], p["name"][:3])
        rx_mark = " Rx" if p.get("is_retrograde") else ""
        p_text = f"{abbr} {p['degrees']}°{rx_mark}"

        tx, ty = polar_to_xy(tier_r + 6.5, ang)
        d.add(String(tx, ty - 2.5, p_text, fontName="Helvetica-Bold", fontSize=5.0, fillColor=colors.HexColor("#0f172a"), textAnchor="middle"))

    return d


def generate_astrology_pdf(
    person_name: str,
    chart_data: Dict[str, Any],
    day_res: Dict[str, Any],
    thaksa_matrix: List[Dict[str, Any]],
    timeline_data: Dict[str, Any],
    trinity_data: Dict[str, Any],
    location_name: str = "Bangkok, Thailand",
    aspect_dynamics: Optional[List[Dict[str, Any]]] = None
) -> bytes:
    """
    Generates a professional multi-page PDF document.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "ReportTitle",
        fontName=FONT_NAME,
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#0f172a"),
        alignment=1
    )
    subtitle_style = ParagraphStyle(
        "ReportSubtitle",
        fontName=FONT_NAME,
        fontSize=11,
        leading=15,
        textColor=colors.HexColor("#475569"),
        alignment=1
    )
    h2_style = ParagraphStyle(
        "Heading2Custom",
        fontName=FONT_NAME,
        fontSize=13,
        leading=17,
        textColor=colors.HexColor("#1e293b"),
        spaceBefore=10,
        spaceAfter=6,
        keepWithNext=True
    )
    body_style = ParagraphStyle(
        "BodyCustom",
        fontName=FONT_NAME,
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#334155")
    )
    bold_body_style = ParagraphStyle(
        "BoldBodyCustom",
        fontName=FONT_NAME,
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#0f172a")
    )
    caption_style = ParagraphStyle(
        "CaptionCustom",
        fontName=FONT_NAME,
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#64748b")
    )

    story = []

    # 1. Header
    story.append(Paragraph("<b>SOLARIAN NATAL ASTROLOGY REPORT</b>", title_style))
    story.append(Paragraph(f"รายงานผูกดวงชะตาและแผนที่ชีวิตมหาทักษา 108 ปี: <b>{person_name}</b>", subtitle_style))
    story.append(Spacer(1, 10))

    meta = chart_data["metadata"]
    meta_table_data = [
        [
            Paragraph(f"<b>วันเดือนปีเกิด:</b> {meta['birth_date']}", body_style),
            Paragraph(f"<b>เวลาเกิดท้องถิ่น:</b> {meta['birth_time']} น.", body_style),
            Paragraph(f"<b>สถานที่เกิด:</b> {location_name}", body_style)
        ],
        [
            Paragraph(f"<b>พิกัด:</b> {meta['latitude']:.2f}°N, {meta['longitude']:.2f}°E", body_style),
            Paragraph(f"<b>Sidereal Time:</b> {meta['sidereal_time']}", body_style),
            Paragraph(f"<b>Julian Day:</b> {meta['julian_day_tt']:.4f} TT", body_style)
        ],
        [
            Paragraph(f"<b>เวลาพระอาทิตย์ขึ้น:</b> {meta['sunrise_local']} น.", body_style),
            Paragraph(f"<b>วันเกิดทางโหราศาสตร์:</b> {day_res['day_name']}", body_style),
            Paragraph(f"<b>ดาวเสวยอายุปฐมวัย:</b> ดาว{day_res['planet_thai']} ({day_res['period_years']} ปี)", body_style)
        ]
    ]
    meta_table = Table(meta_table_data, colWidths=[175, 175, 175])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#cbd5e1")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 12))

    # 2. Personality Trinity (อาทิตย์ / ลัคนา / จันทร์)
    story.append(Paragraph("<b>1. การวิเคราะห์ภาพรวมตัวตน (Core Personality Trinity)</b>", h2_style))
    trin = trinity_data["personality_trinity"]
    trinity_table_data = [
        [
            Paragraph(f"<b>{trin['sun']['title']}</b><br/><font color='#64748b'>{trin['sun']['subtitle']}</font><br/><br/>{trin['sun']['core_nature']}<br/><br/><i>{trin['sun']['house_theme']}</i>", body_style),
            Paragraph(f"<b>{trin['ascendant']['title']}</b><br/><font color='#64748b'>{trin['ascendant']['subtitle']}</font><br/><br/>{trin['ascendant']['outward_persona']}<br/><br/><i>{trin['ascendant']['ruler_placement']}</i>", body_style),
            Paragraph(f"<b>{trin['moon']['title']}</b><br/><font color='#64748b'>{trin['moon']['subtitle']}</font><br/><br/>{trin['moon']['emotional_instinct']}<br/><br/><i>{trin['moon']['house_theme']}</i>", body_style)
        ]
    ]
    trinity_table = Table(trinity_table_data, colWidths=[175, 175, 175])
    trinity_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, 0), colors.HexColor("#fef2f2")),
        ('BACKGROUND', (1, 0), (1, 0), colors.HexColor("#eff6ff")),
        ('BACKGROUND', (2, 0), (2, 0), colors.HexColor("#fefce8")),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#cbd5e1")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(trinity_table)
    story.append(Spacer(1, 12))

    # 3. Planet Positions Table
    story.append(Paragraph("<b>2. ตำแหน่งดาวเคราะห์และจุดสำคัญในดวงชะตา (Planet Positions Table)</b>", h2_style))
    planet_rows = [["ดาวเคราะห์", "ราศี", "องศาละเอียด", "เรือน", "ความเร็ว/วัน", "พักร์ (R)", "Declination"]]
    for p in chart_data["planets"]:
        r_str = "R" if p["is_retrograde"] else ""
        planet_rows.append([
            f"{p['symbol']} {p['thai']} ({p['name']})",
            f"{p['sign_symbol']} {p['sign_thai']}",
            p["formatted_dms"],
            str(p["house"]),
            p["speed_str"],
            r_str,
            p["declination_str"]
        ])

    p_table = Table(planet_rows, colWidths=[105, 80, 85, 45, 75, 50, 85])
    p_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1e293b")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, -1), FONT_NAME),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(p_table)

    story.append(PageBreak())

    # Page 2: Placidus Houses & Aspects
    story.append(Paragraph("<b>3. ขอบเรือนชะตา (Placidus House Cusps)</b>", h2_style))
    house_rows = [["เรือนชะตา", "ความหมาย", "ราศี", "องศาลิปดา", "Declination"]]
    for h in chart_data["houses"]:
        house_rows.append([
            f"เรือน {h['house']}",
            h["name_thai"].split(" - ")[1].replace(")", "") if " - " in h["name_thai"] else "",
            f"{h['sign_symbol']} {h['sign_thai']}",
            h["formatted_dms"],
            h["declination_str"]
        ])
    h_table = Table(house_rows, colWidths=[65, 175, 95, 100, 90])
    h_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#334155")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, -1), FONT_NAME),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('ALIGN', (1, 0), (1, -1), 'LEFT'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(h_table)
    story.append(Spacer(1, 12))

    # Thaksa Birth Matrix
    story.append(Paragraph("<b>4. ภูมิทักษาเดิมกำเนิด (Birth Thaksa Matrix)</b>", h2_style))
    thaksa_rows = [["ภูมิทักษา", "ดาวครองภูมิ", "กำลังดาว (ปี)", "ความหมายและอิทธิพลในพื้นดวง"]]
    for tm in thaksa_matrix:
        thaksa_rows.append([
            tm["role_thai"],
            f"{tm['planet_symbol']} {tm['planet_thai']}",
            f"{tm['period_years']} ปี",
            tm["role_desc"]
        ])
    t_table = Table(thaksa_rows, colWidths=[80, 95, 75, 275])
    t_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#475569")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, -1), FONT_NAME),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('ALIGN', (0, 0), (2, -1), 'CENTER'),
        ('ALIGN', (3, 0), (3, -1), 'LEFT'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(t_table)
    story.append(Spacer(1, 12))

    # Page 3: Aspects Table & Dynamics
    story.append(PageBreak())
    story.append(Paragraph("<b>5. มุมสัมพันธ์สำคัญระหว่างดาวเคราะห์ (Major Aspects)</b>", h2_style))
    aspect_rows = [["ดาวที่ 1", "มุมสัมพันธ์", "ดาวที่ 2", "Orb", "สภาพมุม"]]
    for a in chart_data["aspects"][:14]:
        nature_str = "ส่งเสริม" if a["aspect_name"] in ["Trine", "Sextile"] else ("ท้าทาย/ขัดแย้ง" if a["aspect_name"] in ["Square", "Opposition"] else "เข้มข้น")
        aspect_rows.append([
            f"{a['body1_symbol']} {a['body1_thai']}",
            f"{a['aspect_symbol']} {a['aspect_thai']} ({int(a['aspect_angle'])}°)",
            f"{a['body2_symbol']} {a['body2_thai']}",
            a["orb_str"],
            nature_str
        ])
    asp_table = Table(aspect_rows, colWidths=[105, 115, 105, 80, 120])
    asp_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#334155")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, -1), FONT_NAME),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(asp_table)

    # Top Aspect Dynamics Synthesis
    if aspect_dynamics:
        story.append(Spacer(1, 10))
        story.append(Paragraph("<b>การวิเคราะห์คู่ดาวและองศาผลกระทบที่ทรงอิทธิพลสูงสุด (Top Aspect Dynamics)</b>", h2_style))
        for ad in aspect_dynamics[:3]:
            pair_badge = f" [{ad['thai_pair_info']['type']}]" if ad.get('thai_pair_info') else ""
            asp_text = (
                f"<b>• {ad['body1_symbol']} {ad['body1_thai']} {ad['aspect_symbol']} {ad['aspect_thai']} {ad['body2_symbol']} {ad['body2_thai']}</b> "
                f"({ad['orb_str']} | {ad['potency_level']}{pair_badge}):<br/>"
                f"&nbsp;&nbsp;<b>พลวัตหลัก:</b> {ad['core_dynamic']}<br/>"
                f"&nbsp;&nbsp;<b>การงาน/ความสำเร็จ:</b> {ad['career']}<br/>"
                f"&nbsp;&nbsp;<b>กลยุทธ์เสริมมงคล:</b> {ad['empowerment']}"
            )
            story.append(Paragraph(asp_text, body_style))
            story.append(Spacer(1, 4))

    story.append(PageBreak())

    # Page 3: 108-Year Maha Thaksa Timeline
    story.append(Paragraph("<b>6. แผนที่วงจรชีวิต 108 ปี มหาทักษาเสวยอายุ (108-Year Maha Thaksa Lifecycle)</b>", h2_style))
    story.append(Paragraph("หลักการวิเคราะห์: ดาวเสวยอายุ (Major Period) เป็นผู้กำหนดสภาวะแวดล้อมและธีมหลักของชีวิตในแต่ละช่วงวัย โดยมีดาวแทรกอายุ (Sub-period) เป็นตัวเร่งและขับเคลื่อนเหตุการณ์ย่อยตามอัตราส่วนกำลังดาว", caption_style))
    story.append(Spacer(1, 8))

    lifecycle_rows = [["ลำดับ", "ดาวเสวยอายุ", "ช่วงอายุ (ปี)", "ระยะเวลา", "ช่วงปี ค.ศ.", "ดาวแทรกอายุในรอบ"]]
    for mp in timeline_data["major_periods"]:
        sub_names = ", ".join([f"{sp['planet_thai']} ({sp['duration_str']})" for sp in mp["sub_periods"][:4]]) + " ..."
        start_year = int(meta["birth_date"].split("-")[0]) + int(mp["start_age"])
        end_year = int(meta["birth_date"].split("-")[0]) + int(mp["end_age"])
        lifecycle_rows.append([
            str(mp["period_index"]),
            f"{mp['planet_symbol']} ดาว{mp['planet_thai']}",
            f"{mp['start_age']} - {mp['end_age']} ปี",
            f"{mp['duration_years']} ปี",
            f"{start_year} - {end_year}",
            sub_names
        ])

    life_table = Table(lifecycle_rows, colWidths=[35, 85, 75, 55, 75, 200])
    life_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1e293b")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, -1), FONT_NAME),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('ALIGN', (5, 0), (5, -1), 'LEFT'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(life_table)

    # 30-Degree Harmonic Progression Triggers Table in PDF
    degree_catalog = timeline_data.get("degree_triggers_catalog", [])
    if degree_catalog:
        story.append(Spacer(1, 10))
        sun_spd = timeline_data.get("sun_speed", 1.0)
        speed_note = f" คำนวณตามอัตราความเร็วดวงอาทิตย์จริง (True Solar Arc: {sun_spd:.4f}°/ปี)" if sun_spd != 1.0 else ""
        story.append(Paragraph(f"หลักการ: (องศาดาวกำเนิด − องศาอาทิตย์กำเนิด) mod 30{speed_note} แปลงเป็นอายุเชิงสัญลักษณ์แล้ววนรอบละ 30 ปี ใช้ดาวเสวยอายุเป็นภาพใหญ่ ไม่ใช่ดาวจรจริงหรือการรับรองเหตุการณ์", caption_style))
        story.append(Spacer(1, 6))

        trigger_rows = [["ดาวเคราะห์", "สถิตราศี", "องศาในราศี", "ระยะจากอาทิตย์ (ฐาน 30°)", "อายุตามสูตร → ช่องปีที่ปัดค่า"]]
        for dt in degree_catalog:
            ages_str = ", ".join([f"{a['exact_age']:.2f}→{a['rounded_age']}" for a in dt["impact_ages"]])
            trigger_rows.append([
                f"{dt['planet_symbol']} ดาว{dt['planet_thai']}",
                dt["sign_thai"],
                f"{dt['in_sign_degree']}°",
                f"{dt['distance_deg']}° ({dt['timing_detail']})",
                ages_str
            ])

        trig_table = Table(trigger_rows, colWidths=[90, 80, 75, 120, 160])
        trig_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#be123c")),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, -1), FONT_NAME),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#fff1f2")]),
            ('TOPPADDING', (0, 0), (-1, -1), 3),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ]))
        story.append(trig_table)

    # Page 4: Dedicated Placidus Natal Chart Wheel
    story.append(PageBreak())
    story.append(Paragraph("<b>7. แผนผังวงล้อจักรราศี พลาซิดัส (Placidus Natal Chart Wheel)</b>", h2_style))
    story.append(Paragraph(
        "แผนผังเวกเตอร์ความละเอียดสูงแสดงตำแหน่งดาวเคราะห์ 10 ดวง ลัคนา (AC) เมอริเดียน (MC) "
        "ระบบเรือนชะตาพลาซิดัส 12 เรือน และโครงข่ายองศาทำมุมสัมพันธ์ (Aspect Web) ตามพิกัดดาราศาสตร์สากล DE431",
        caption_style
    ))
    story.append(Spacer(1, 14))

    chart_drawing = draw_chart_wheel(chart_data, width=520, height=360)
    story.append(chart_drawing)
    story.append(Spacer(1, 16))

    # Legend table below wheel
    legend_data = [
        [
            "แกนระนาบสำคัญ",
            "AC (ลัคนา - 9 นาฬิกา) | MC (เมอริเดียน - 12 นาฬิกา) | DC (ภพที่ 7 - 3 นาฬิกา) | IC (ภพที่ 4 - 6 นาฬิกา)"
        ],
        [
            "สัญลักษณ์ธาตุจักรราศี",
            "สีแดง = ธาตุไฟ (ARI, LEO, SAG) | สีส้มอมน้ำตาล = ธาตุดิน (TAU, VIR, CAP)\nสีฟ้า = ธาตุลม (GEM, LIB, AQU) | สีน้ำเงินคราม = ธาตุน้ำ (CAN, SCO, PIS)"
        ],
        [
            "โครงข่ายทำมุม (Aspects)",
            "เขียว/ฟ้า = ตรีโกณ 120° / โยค 60° (ส่งเสริม/เกื้อหนุน) | แดง/ม่วง = ฉาก 90° / เล็ง 180° (ท้าทาย/เร่งพัฒนา)\nส้ม = กุม 0° (ผนึกกำลัง)"
        ]
    ]
    legend_table = Table(legend_data, colWidths=[130, 390])
    legend_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor("#f1f5f9")),
        ('FONTNAME', (0, 0), (-1, -1), FONT_NAME),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor("#334155")),
        ('TEXTCOLOR', (1, 0), (1, -1), colors.HexColor("#475569")),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(legend_table)

    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
