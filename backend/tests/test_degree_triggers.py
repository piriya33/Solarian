"""
Unit tests for the 30-Degree Harmonic Progression Triggers (วิถีองศาดาวกระทบฐาน 30).
"""
import pytest
from backend.engine.ephemeris import calculate_chart
from backend.engine.thaksa import (
    determine_astrological_day,
    calculate_thaksa_matrix,
    calculate_108_timeline,
    calculate_degree_triggers_30
)
from backend.engine.transits import build_108_transits_map
from backend.engine.interpretation import synthesize_year_life_reading

def test_calculate_degree_triggers_30_math():
    # Synthetic test: Sun at 15° (in sign), Moon at 5° (in sign)
    synthetic_planets = {
        "Sun": {"longitude": 285.0, "sign": "Capricorn", "formatted_dms": "15°00'00\""},  # 285 % 30 = 15.0
        "Moon": {"longitude": 185.0, "sign": "Libra", "formatted_dms": "5°00'00\"", "thai": "จันทร์", "symbol": "☽"},  # 185 % 30 = 5.0
        "Mars": {"longitude": 20.0, "sign": "Aries", "formatted_dms": "20°00'00\"", "thai": "อังคาร", "symbol": "♂"}    # 20 % 30 = 20.0
    }

    res = calculate_degree_triggers_30(synthetic_planets)
    assert res["sun_in_sign_deg"] == 15.0

    triggers = {t["planet_name"]: t for t in res["planet_triggers"]}

    # Moon: (5 - 15) % 30 = 20 degrees
    assert "Moon" in triggers
    assert triggers["Moon"]["distance_deg"] == 20.0
    moon_ages = [item["rounded_age"] for item in triggers["Moon"]["impact_ages"]]
    assert moon_ages == [20, 50, 80]

    # Mars: (20 - 15) % 30 = 5 degrees
    assert "Mars" in triggers
    assert triggers["Mars"]["distance_deg"] == 5.0
    mars_ages = [item["rounded_age"] for item in triggers["Mars"]["impact_ages"]]
    assert mars_ages == [5, 35, 65, 95]

    # Age trigger map verification
    assert len(res["age_trigger_map"][20]) == 1
    assert res["age_trigger_map"][20][0]["planet_name"] == "Moon"
    assert len(res["age_trigger_map"][5]) == 1
    assert res["age_trigger_map"][5][0]["planet_name"] == "Mars"

def test_full_chart_degree_triggers_and_synthesis():
    chart = calculate_chart('1985-01-13', '09:45', 13.75, 100.516667, 7.0)
    day_res = determine_astrological_day('1985-01-13', '09:45', chart['metadata']['sunrise_local'])
    timeline = calculate_108_timeline('1985-01-13', day_res['thaksa_num'], chart['planets_dict'])
    transits_map = build_108_transits_map(chart)

    assert "degree_triggers_catalog" in timeline
    assert len(timeline["degree_triggers_catalog"]) > 0

    # In 1985 chart, Sun speed is ~1.0188°/day, Chiron distance is 10.84°
    # Under True Solar Arc:
    # Cycle 1: 10.84 / 1.0188 = 10.64 -> round to 11
    # Cycle 2: (10.84 + 30) / 1.0188 = 40.09 -> round to 40
    year_entry_40 = timeline["years_map"][40]
    chiron_hits = [t for t in year_entry_40["degree_triggers"] if t["planet_name"] == "Chiron"]
    assert len(chiron_hits) == 1

    t_data = transits_map[40]
    reading = synthesize_year_life_reading(40, year_entry_40, chart, t_data)

    assert reading["age"] == 40
    assert reading["degree_trigger_detail"] is not None
    assert reading["degree_trigger_detail"]["planet_name"] == "Chiron"
    detail = reading["degree_trigger_details"][0]
    assert detail == reading["degree_trigger_detail"]
    assert detail["exact_age"] == chiron_hits[0]["exact_age"]
    assert "ฐาน 30°" in detail["trigger_narrative"]
    assert "ดวงอาทิตย์จร" not in detail["trigger_narrative"]
    assert detail["planning_question"] and len(detail["practical_actions"]) == 2
    assert reading["harmonic_method"]["cycle_years"] == 30


def test_collision_preserves_every_hit_and_their_source_ages():
    chart = calculate_chart('2000-02-29', '12:00', 13.75, 100.5167, 7.0)
    # Set static Sun speed to 1.0 for predictable exact_age testing
    chart['planets_dict']['Sun']['speed_lon'] = 1.0
    chart['planets_dict']['Moon']['longitude'] = chart['planets_dict']['Sun']['longitude'] + 5.1
    chart['planets_dict']['Mars']['longitude'] = chart['planets_dict']['Sun']['longitude'] + 5.2
    timeline = calculate_108_timeline('2000-02-29', 3, chart['planets_dict'])
    year = timeline['years_map'][5]
    reading = synthesize_year_life_reading(5, year, chart, {})
    details = {d['planet_name']: d for d in reading['degree_trigger_details']}
    assert {'Moon', 'Mars'} <= set(details)
    assert len(details) == len(year['degree_triggers'])
    assert details['Moon']['exact_age'] == 5.1
    assert details['Mars']['exact_age'] == 5.2
    assert 'จันทร์' in reading['overall_advice'] and 'อังคาร' in reading['overall_advice']
    assert all(d['planning_question'] and d['practical_actions'] for d in details.values())


def test_no_hit_does_not_invent_a_trigger_or_promise_an_uneventful_year():
    chart = calculate_chart('2000-02-29', '12:00', 13.75, 100.5167, 7.0)
    timeline = calculate_108_timeline('2000-02-29', 3, chart['planets_dict'])
    year = next(y for y in timeline['years_map'] if not y['degree_triggers'])
    reading = synthesize_year_life_reading(year['age'], year, chart, {})
    assert reading['degree_trigger_details'] == []
    assert reading['degree_trigger_detail'] is None
    assert reading['tone'] == 'neutral'
    assert 'ไม่ได้หมายความว่าปีนั้นจะไม่มีเหตุการณ์สำคัญ' in reading['overall_advice']


def test_unknown_house_is_not_silently_read_as_house_one():
    chart = calculate_chart('2000-02-29', '12:00', 13.75, 100.5167, 7.0)
    timeline = calculate_108_timeline('2000-02-29', 3, chart['planets_dict'])
    year = next(y for y in timeline['years_map'] if y['degree_triggers'])
    planet = year['degree_triggers'][0]['planet_name']
    chart['planets_dict'][planet].pop('house', None)
    reading = synthesize_year_life_reading(year['age'], year, chart, {})
    assert reading['degree_trigger_details'][0]['house_name'] == 'ยังไม่มีข้อมูลเรือน'
