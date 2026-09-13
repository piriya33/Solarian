"""
Unit tests for Astrological Day of Week Calculation (Sunrise/Sunset Cutoff, Rahu Wednesday Night)
and Astrological Reference Tables.
"""

import pytest
from backend.engine.thaksa import determine_astrological_day, get_astrology_reference_tables


def test_monday_2am_counts_as_sunday():
    """
    User specification:
    'ดังนั้น คนที่เกิดวันจันทร์ ตีสอง นับเป็นวันอาทิตย์ เพราะพระอาทิตย์ยังไม่ขึ้น'
    """
    # 2024-05-13 is Monday. At 02:00, before sunrise 06:00 -> Sunday (1)
    res = determine_astrological_day("2024-05-13", "02:00", "06:00:00", "18:30:00")
    assert res["thaksa_num"] == 1
    assert res["day_name"] == "วันอาทิตย์"
    assert res["is_before_sunrise"] is True
    assert res["effective_date"] == "2024-05-12"
    assert "ก่อนเวลาพระอาทิตย์ขึ้น" in res["reason"]


def test_thursday_2am_counts_as_rahu_wednesday_night():
    """
    User specification:
    'ราหูนับตั้งแต่พระอาทิตย์ตก จบที่พระอาทิตย์ขึ้นวันต่อไป'
    Thursday 02:00 AM is before Thursday sunrise -> Belongs to Wednesday night (Rahu 8).
    """
    # 2024-05-16 is Thursday. At 02:00, before sunrise 05:50 -> Wednesday night (Rahu 8)
    res = determine_astrological_day("2024-05-16", "02:00", "05:50:00", "18:35:00")
    assert res["thaksa_num"] == 8
    assert res["day_name"] == "วันพุธกลางคืน (ราหู)"
    assert res["is_before_sunrise"] is True
    assert res["is_rahu_night"] is True
    assert res["effective_date"] == "2024-05-15"
    assert "วันพุธกลางคืน (พระราหู ๘)" in res["reason"]


def test_wednesday_night_after_sunset_counts_as_rahu():
    """
    Wednesday 20:00 (8 PM) is after sunset 18:30 -> Rahu 8.
    """
    # 2024-05-15 is Wednesday.
    res = determine_astrological_day("2024-05-15", "20:00", "05:50:00", "18:35:00")
    assert res["thaksa_num"] == 8
    assert res["day_name"] == "วันพุธกลางคืน (ราหู)"
    assert res["is_before_sunrise"] is False
    assert res["is_rahu_night"] is True
    assert res["effective_date"] == "2024-05-15"
    assert "หลังเวลาพระอาทิตย์ตก" in res["reason"]


def test_wednesday_daytime_counts_as_mercury():
    """
    Wednesday 10:00 AM (between sunrise 05:50 and sunset 18:35) -> Mercury 4.
    """
    res = determine_astrological_day("2024-05-15", "10:00", "05:50:00", "18:35:00")
    assert res["thaksa_num"] == 4
    assert res["day_name"] == "วันพุธ (กลางวัน)"
    assert res["is_before_sunrise"] is False
    assert res["is_rahu_night"] is False
    assert res["effective_date"] == "2024-05-15"


def test_thursday_morning_after_sunrise():
    """
    Thursday 08:00 AM after sunrise -> Thursday / Jupiter (5).
    """
    res = determine_astrological_day("2024-05-16", "08:00", "05:50:00", "18:35:00")
    assert res["thaksa_num"] == 5
    assert res["day_name"] == "วันพฤหัสบดี"
    assert res["is_before_sunrise"] is False
    assert res["is_rahu_night"] is False


def test_astrology_reference_tables():
    """Verifies complete reference tables: 12 zodiacs, 4 pairing groups, 8 thaksa roles."""
    tables = get_astrology_reference_tables()
    assert "zodiac_signs" in tables
    assert "planetary_pairs" in tables
    assert "thaksa_roles" in tables

    # 12 zodiac signs
    assert len(tables["zodiac_signs"]) == 12
    aries = tables["zodiac_signs"][0]
    assert aries["sign_en"] == "Aries"
    assert aries["sign_thai"] == "เมษ"
    assert aries["traditional_ruler"]["name"] == "Mars"
    assert aries["exaltation"]["name"] == "Sun"

    # 4 planetary pair groups
    pairs = tables["planetary_pairs"]
    assert "friends" in pairs
    assert "enemies" in pairs
    assert "sompol" in pairs
    assert "elements" in pairs

    # Check classical verses
    assert "อาทิตย์เป็นมิตรกับครู" in pairs["friends"]["verse"]
    assert "อาทิตย์ผิดกับอังคาร" in pairs["enemies"]["verse"]
    assert "คู่ธาตุ" in pairs["elements"]["title"]

    # 8 Thaksa roles
    assert len(tables["thaksa_roles"]) == 8
    assert tables["thaksa_roles"][0]["thai"] == "บริวาร"
    assert tables["thaksa_roles"][7]["thai"] == "กาลกิณี"
