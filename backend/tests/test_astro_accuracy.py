"""
Solarian Astrology Engine - Precision Verification Test Suite
Verifies 100% calculation accuracy against AstroDienst (Swiss Ephemeris ground truth).
"""

import pytest
from backend.engine.ephemeris import calculate_chart, deg_to_dms, format_dms
from backend.engine.thaksa import determine_astrological_day, calculate_thaksa_matrix, calculate_108_timeline
from backend.engine.dignities import evaluate_dignity, evaluate_relationship
from backend.engine.transits import build_108_transits_map

# Ground Truth from AstroDienst Data Sheet (astro_w2gw_piriya_s.31195.1117630.pdf)
# Piriya S, born Su., 13 January 1985, 9:45 a.m., Bangkok THAI (100e31, 13n45)
BIRTH_DATE = "1985-01-13"
BIRTH_TIME = "09:45"
LATITUDE = 13.75          # 13n45
LONGITUDE = 100.516667    # 100e31
TZ_OFFSET = 7.0

ASTRODIENST_PLANETS = {
    "Sun": {"sign": "Capricorn", "deg": 22, "min": 51, "sec": 39, "house": 11},
    "Moon": {"sign": "Libra", "deg": 11, "min": 33, "sec": 11, "house": 7},
    "Mercury": {"sign": "Capricorn", "deg": 1, "min": 46, "sec": 29, "house": 10},
    "Venus": {"sign": "Pisces", "deg": 9, "min": 39, "sec": 18, "house": 12},
    "Mars": {"sign": "Pisces", "deg": 14, "min": 22, "sec": 53, "house": 1},
    "Jupiter": {"sign": "Capricorn", "deg": 24, "min": 17, "sec": 6, "house": 11},
    "Saturn": {"sign": "Scorpio", "deg": 25, "min": 48, "sec": 23, "house": 9},
    "Uranus": {"sign": "Sagittarius", "deg": 16, "min": 1, "sec": 39, "house": 10},
    "Neptune": {"sign": "Capricorn", "deg": 1, "min": 55, "sec": 51, "house": 10},
    "Pluto": {"sign": "Scorpio", "deg": 4, "min": 34, "sec": 34, "house": 8},
    "True Node": {"sign": "Taurus", "deg": 25, "min": 40, "sec": 54, "house": 3},
    "Mean Node": {"sign": "Taurus", "deg": 24, "min": 30, "sec": 24, "house": 3},
    "Chiron": {"sign": "Gemini", "deg": 3, "min": 42, "sec": 4, "house": 3}
}

ASTRODIENST_HOUSES = {
    1: {"sign": "Pisces", "deg": 10, "min": 59, "sec": 41},
    2: {"sign": "Aries", "deg": 16, "min": 40, "sec": 44},
    3: {"sign": "Taurus", "deg": 18, "min": 12, "sec": 36},
    4: {"sign": "Gemini", "deg": 15, "min": 32, "sec": 7},
    5: {"sign": "Cancer", "deg": 11, "min": 19, "sec": 24},
    6: {"sign": "Leo", "deg": 8, "min": 48, "sec": 53},
    7: {"sign": "Virgo", "deg": 10, "min": 59, "sec": 41},
    8: {"sign": "Libra", "deg": 16, "min": 40, "sec": 44},
    9: {"sign": "Scorpio", "deg": 18, "min": 12, "sec": 36},
    10: {"sign": "Sagittarius", "deg": 15, "min": 32, "sec": 7},
    11: {"sign": "Capricorn", "deg": 11, "min": 19, "sec": 24},
    12: {"sign": "Aquarius", "deg": 8, "min": 48, "sec": 53}
}


@pytest.fixture(scope="module")
def piriya_chart():
    return calculate_chart(BIRTH_DATE, BIRTH_TIME, LATITUDE, LONGITUDE, TZ_OFFSET)


def test_sidereal_time_and_julian_day(piriya_chart):
    meta = piriya_chart["metadata"]
    # AstroDienst: Sid. Time: 16:57:11
    assert meta["sidereal_time"] == "16:57:11"
    # AstroDienst: Jul.Day 2446078.615213 TT, dT 54.4 sec
    assert round(meta["julian_day_tt"], 5) == 2446078.61521
    assert round(meta["delta_t_sec"], 1) == 54.4


def test_planet_positions_accuracy(piriya_chart):
    """Verifies all planets match AstroDienst within 1 arcsecond (0.0003 deg)."""
    planets = piriya_chart["planets_dict"]
    for p_name, expected in ASTRODIENST_PLANETS.items():
        actual = planets[p_name]
        assert actual["sign"] == expected["sign"], f"{p_name} sign mismatch: {actual['sign']} != {expected['sign']}"
        assert actual["degrees"] == expected["deg"], f"{p_name} degrees mismatch"
        assert actual["minutes"] == expected["min"], f"{p_name} minutes mismatch"
        # Seconds within 1 arcsecond
        sec_diff = abs(actual["seconds"] - expected["sec"])
        assert sec_diff <= 1, f"{p_name} seconds diff {sec_diff} > 1 arcsec: {actual['seconds']} vs {expected['sec']}"
        # House placement
        assert actual["house"] == expected["house"], f"{p_name} house mismatch: {actual['house']} != {expected['house']}"


def test_placidus_houses_accuracy(piriya_chart):
    """Verifies all 12 Placidus house cusps match AstroDienst within 1 arcsecond."""
    houses = {h["house"]: h for h in piriya_chart["houses"]}
    for h_num, expected in ASTRODIENST_HOUSES.items():
        actual = houses[h_num]
        assert actual["sign"] == expected["sign"], f"House {h_num} sign mismatch"
        assert actual["degrees"] == expected["deg"], f"House {h_num} deg mismatch"
        assert actual["minutes"] == expected["min"], f"House {h_num} min mismatch"
        sec_diff = abs(actual["seconds"] - expected["sec"])
        assert sec_diff <= 1, f"House {h_num} sec diff {sec_diff} > 1 arcsec"


def test_sunrise_cutoff_and_astrological_day(piriya_chart):
    """Verifies local sunrise is accurately computed and Sunday is assigned."""
    meta = piriya_chart["metadata"]
    assert meta["sunrise_local"] == "06:44:44"
    assert meta["is_after_sunrise"] is True

    day_res = determine_astrological_day(BIRTH_DATE, BIRTH_TIME, meta["sunrise_local"])
    assert day_res["thaksa_num"] == 1  # Sunday
    assert day_res["day_name"] == "วันอาทิตย์"
    assert day_res["period_years"] == 6

    # Test before sunrise (e.g. 04:00 AM on Sunday Jan 13 -> Saturday)
    night_res = determine_astrological_day(BIRTH_DATE, "04:00", meta["sunrise_local"])
    assert night_res["thaksa_num"] == 7  # Saturday
    assert night_res["is_before_sunrise"] is True


def test_thaksa_108_lifecycle():
    """Verifies 108-year cycle structure and sub-period duration proportions."""
    timeline = calculate_108_timeline(BIRTH_DATE, 1)  # Born Sunday
    major_periods = timeline["major_periods"]

    assert len(major_periods) == 8
    # Sum of major periods must equal 108
    tot_years = sum(mp["duration_years"] for mp in major_periods)
    assert tot_years == 108

    # Check order starting from Sunday (1)
    # 1 (6y) -> 2 (15y) -> 3 (8y) -> 4 (17y) -> 7 (10y) -> 5 (19y) -> 8 (12y) -> 6 (21y)
    expected_order = [
        (1, 6), (2, 15), (3, 8), (4, 17), (7, 10), (5, 19), (8, 12), (6, 21)
    ]
    for i, (p_num, dur) in enumerate(expected_order):
        mp = major_periods[i]
        assert mp["planet_num"] == p_num
        assert mp["duration_years"] == dur
        # Verify sub-periods sum to major period
        sub_sum = sum(sp["duration_years"] for sp in mp["sub_periods"])
        assert abs(sub_sum - dur) < 0.001


def test_transits_detection(piriya_chart):
    """Verifies that Saturn Return (at age ~29) and Jupiter Returns are detected."""
    transits_map = build_108_transits_map(piriya_chart)
    assert len(transits_map) == 109

    # Age 29 Saturn return
    age_29 = transits_map[29]
    saturn_return_found = any("Saturn Return" in m["title"] for m in age_29["milestones"])
    assert saturn_return_found is True

    # Age 12, 24, 36 Jupiter return
    for age in [12, 24, 36, 48]:
        jr_found = any("Jupiter Return" in m["title"] for m in transits_map[age]["milestones"])
        assert jr_found is True, f"Jupiter return not found at age {age}"


def test_aspect_dynamics_potency(piriya_chart):
    """Verifies that analyze_aspect_dynamics correctly computes potency, Thai pairs, and synthesis."""
    from backend.engine.interpretation import analyze_aspect_dynamics

    dynamics = analyze_aspect_dynamics(piriya_chart)
    assert len(dynamics) > 0

    # Highest potency aspect should have score >= 90
    top_aspect = dynamics[0]
    assert top_aspect["potency_score"] >= 90

    # Find Mercury-Neptune conjunction (orb ~0°09', should be exact)
    merc_nep = next((a for a in dynamics if set([a["body1"], a["body2"]]) == {"Mercury", "Neptune"}), None)
    assert merc_nep is not None
    assert merc_nep["potency_badge"] == "exact"
    assert merc_nep["potency_score"] >= 98
    assert "ญาณทัศน์" in merc_nep["pair_title"]

    # Find Sun-Jupiter conjunction (1-5 คู่มิตร)
    sun_jup = next((a for a in dynamics if set([a["body1"], a["body2"]]) == {"Sun", "Jupiter"}), None)
    assert sun_jup is not None
    assert sun_jup["thai_pair_info"]["type"] == "คู่มิตร"
    assert "คู่มิตรใหญ่" in sun_jup["pair_title"]
