from copy import deepcopy

import pytest

from backend.engine.ephemeris import calculate_chart
from backend.engine.interpretation import build_planetary_context, synthesize_year_life_reading
from backend.engine.practical_guidance import build_practical_guidance
from backend.engine.thaksa import calculate_108_timeline, determine_astrological_day


@pytest.fixture(scope="module")
def chart_and_timeline():
    chart = calculate_chart("1985-01-13", "09:45", 13.75, 100.516667, 7.0)
    day = determine_astrological_day(
        "1985-01-13", "09:45", chart["metadata"]["sunrise_local"]
    )
    timeline = calculate_108_timeline(
        "1985-01-13", day["thaksa_num"], chart["planets_dict"]
    )
    return chart, timeline


def _quiet_transits(date_str, utc_hours, chart, include_fast_bodies=False):
    return {
        "date": date_str,
        "transit_positions": [],
        "active_aspects": [],
        "milestones": [],
        "test_utc_hours": utc_hours,
        "test_fast_bodies": include_fast_bodies,
    }


def test_guidance_uses_explicit_reference_date_and_exact_subperiod(
    monkeypatch, chart_and_timeline
):
    chart, timeline = chart_and_timeline
    calls = []

    def capture(date_str, utc_hours, chart_arg, include_fast_bodies=False):
        calls.append((date_str, utc_hours, chart_arg, include_fast_bodies))
        return _quiet_transits(date_str, utc_hours, chart_arg, include_fast_bodies)

    monkeypatch.setattr(
        "backend.engine.practical_guidance.calculate_transits_for_date", capture
    )
    result = build_practical_guidance(chart, timeline, "2026-09-13")

    assert calls == [("2026-09-13", 5.0, chart, True)]
    assert result["reference_date"] == "2026-09-13"
    assert result["periods"]["today"]["date_label"] == "13 ก.ย. 2569 · 12:00 น. กรุงเทพฯ"

    expected_major = next(
        period for period in timeline["major_periods"]
        if period["start_date"] <= "2026-09-13" < period["end_date"]
    )
    expected_sub = next(
        period for period in expected_major["sub_periods"]
        if period["start_date"] <= "2026-09-13" < period["end_date"]
    )
    period_card = result["periods"]["period"]
    assert period_card["start_date"] == expected_major["start_date"]
    assert period_card["end_date"] == expected_major["end_date"]
    assert period_card["sub_start_date"] == expected_sub["start_date"]
    assert period_card["sub_end_date"] == expected_sub["end_date"]
    assert period_card["evidence"]["major_period"]["planet_name"] == expected_major["planet_name"]
    assert period_card["evidence"]["sub_period"]["planet_name"] == expected_sub["planet_name"]

    for card in result["periods"].values():
        assert 1 <= len(card["do"]) <= 3
        assert 1 <= len(card["avoid"]) <= 3
        assert all(key in card for key in ("title", "summary", "sources", "time_scope"))
        visible = card["title"] + " " + card["summary"]
        assert not any(term in visible for term in ("ราศี", "เรือน", "orb", "30°", "ดาวจร"))


def test_harmonic_collisions_keep_every_hit_with_relationships_and_rulership(monkeypatch):
    monkeypatch.setattr(
        "backend.engine.practical_guidance.calculate_transits_for_date", _quiet_transits
    )
    chart = calculate_chart("2000-02-29", "12:00", 13.75, 100.5167, 7.0)
    chart["planets_dict"]["Moon"]["longitude"] = chart["planets_dict"]["Sun"]["longitude"] + 5.1
    chart["planets_dict"]["Mars"]["longitude"] = chart["planets_dict"]["Sun"]["longitude"] + 5.2
    timeline = calculate_108_timeline("2000-02-29", 3, chart["planets_dict"])

    result = build_practical_guidance(chart, timeline, "2005-03-01")
    year = result["periods"]["year"]
    hits = year["evidence"]["harmonic_hits"]
    assert {item["planet_name"] for item in hits} >= {"Moon", "Mars"}
    for item in hits:
        context = item["planetary_context"]
        assert context["placement"]["status"] == "known"
        assert context["house_rulership"]["status"] == "known"
        assert context["sign_dispositor"]["status"] in {"known", "unknown"}
        assert context["occupied_house_ruler"]["status"] in {"known", "unknown"}
        assert any(rel["with_planet"] == "Sun" for rel in context["relationships"])
    assert len(year["do"]) <= 3 and len(year["avoid"]) <= 3
    assert "ไม่ใช่คำพยากรณ์ต่อเนื่องทั้งปี" in year["summary"]


def test_context_uses_actual_cusps_dispositors_and_both_aspect_directions(chart_and_timeline):
    original, _ = chart_and_timeline
    chart = deepcopy(original)
    for house in chart["houses"]:
        house["sign"] = "Aries"
        house["sign_thai"] = "ราศีเมษ"
    chart["planets_dict"]["Mars"]["sign"] = "Aries"
    chart["planets_dict"]["Mars"]["sign_thai"] = "ราศีเมษ"
    chart["aspects"] = [{
        "body1": "Sun", "body2": "Mars", "aspect_name": "Trine",
        "aspect_thai": "ตรีโกณ", "orb": 1.25, "is_applying": True,
    }]

    context = build_planetary_context(chart, "Mars", ["Sun"])
    assert [item["house"] for item in context["house_rulership"]["houses"]] == list(range(1, 13))
    assert context["sign_dispositor"]["ruler_planet"] == "Mars"
    assert context["sign_dispositor"]["relationship_to_planet"]["type"] == "self_ruler"
    assert context["occupied_house_ruler"]["ruler_planet"] == "Mars"
    assert context["natal_aspects"] == [{
        "with_planet": "Sun", "aspect_name": "Trine", "aspect_thai": "ตรีโกณ",
        "aspect_nature": None, "aspect_angle": None,
        "orb": 1.25, "is_applying": True,
    }]

    chart["houses"][4].pop("sign")
    incomplete = build_planetary_context(chart, "Mars", ["Sun"])
    assert incomplete["house_rulership"]["status"] == "unknown"
    assert incomplete["house_rulership"]["missing_cusp_houses"] == [5]

    self_context = build_planetary_context(chart, "Mars", ["Mars", "Sun"])
    assert self_context["relationships"][0]["status"] == "known"
    assert self_context["relationships"][0]["type"] == "same_planet"


def test_pair_relationship_changes_visible_period_advice(monkeypatch):
    monkeypatch.setattr(
        "backend.engine.practical_guidance.calculate_transits_for_date", _quiet_transits
    )
    chart = calculate_chart("2000-01-01", "12:00", 13.75, 100.5167, 7.0)
    timeline = calculate_108_timeline("2000-01-01", 1, chart["planets_dict"])

    tense = build_practical_guidance(chart, timeline, "2001-06-01")["periods"]["period"]
    assert tense["evidence"]["relationship"]["nature"] == "negative"
    assert any("ทวนขอบเขต" in item for item in tense["do"])

    changed_chart = deepcopy(chart)
    changed_chart["planets_dict"]["Mars"]["thaksa_num"] = 5
    cooperative = build_practical_guidance(
        changed_chart, timeline, "2001-06-01"
    )["periods"]["period"]
    assert cooperative["evidence"]["relationship"]["nature"] == "positive"
    assert tense["summary"] != cooperative["summary"]
    assert tense["do"] != cooperative["do"]


def test_existing_harmonic_detail_reuses_full_planetary_context(chart_and_timeline):
    chart, timeline = chart_and_timeline
    year = next(row for row in timeline["years_map"] if row["degree_triggers"])
    reading = synthesize_year_life_reading(year["age"], year, chart, {})

    assert "planetary_context" in reading["macro_detail"]
    assert "planetary_context" in reading["sub_detail"]
    detail = reading["degree_trigger_details"][0]
    assert detail["planetary_context"]["house_rulership"]["status"] == "known"
    assert "sign_dispositor" in detail["planetary_context"]
    assert "occupied_house_ruler" in detail["planetary_context"]


def test_actual_natal_aspect_changes_visible_harmonic_action(monkeypatch):
    monkeypatch.setattr(
        "backend.engine.practical_guidance.calculate_transits_for_date", _quiet_transits
    )
    chart = calculate_chart("2000-02-29", "12:00", 13.75, 100.5167, 7.0)
    chart["planets_dict"]["Moon"]["longitude"] = chart["planets_dict"]["Sun"]["longitude"] + 5.1
    timeline = calculate_108_timeline("2000-02-29", 3, chart["planets_dict"])
    baseline = build_practical_guidance(chart, timeline, "2005-03-01")["periods"]["year"]["do"]

    changed = deepcopy(chart)
    changed["aspects"].append({
        "body1": "Sun", "body2": "Moon", "aspect_name": "Square",
        "aspect_thai": "ฉาก", "orb": 0.5, "is_applying": True,
    })
    revised = build_practical_guidance(changed, timeline, "2005-03-01")["periods"]["year"]["do"]
    assert revised != baseline
    assert any("ทวนขอบเขต" in item for item in revised)
