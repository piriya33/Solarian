"""
Unit tests for Bazi Engine (Four Pillars of Destiny).
"""

import pytest
from backend.engine.bazi import calculate_bazi, STEMS, BRANCHES


def test_bazi_calculation_1985():
    res = calculate_bazi(
        birth_date="1985-01-13",
        birth_time="09:45",
        latitude=13.75,
        longitude=100.5167,
        tz_offset=7.0,
        gender="m"
    )

    assert "four_pillars" in res
    pillars = res["four_pillars"]

    # 1. Year Pillar: Before Li Chun (Feb 4), belongs to 1984 (Jia Zi - 甲子)
    assert pillars["year"]["stem"]["chinese"] == "甲"
    assert pillars["year"]["branch"]["chinese"] == "子"

    # 2. Month Pillar: Xiao Han to Li Chun is Chou (Ox - 丑), Five Tigers gives 丁丑
    assert pillars["month"]["stem"]["chinese"] == "丁"
    assert pillars["month"]["branch"]["chinese"] == "丑"

    # 3. Day Pillar: 1985-01-13 is Ren Zi (壬子)
    assert pillars["day"]["stem"]["chinese"] == "壬"
    assert pillars["day"]["branch"]["chinese"] == "子"
    assert pillars["day"]["is_day_master"] is True

    # 4. Hour Pillar: Bangkok 09:45 with True Solar Time (~09:18) is Si (Snake - 巳), Five Rats gives 乙巳
    assert pillars["hour"]["stem"]["chinese"] == "乙"
    assert pillars["hour"]["branch"]["chinese"] == "巳"

    # 5. Day Master
    assert res["day_master"]["stem"]["chinese"] == "壬"
    assert "interpretation" in res
    interp = res["interpretation"]
    assert interp is not None
    assert "macro_summary" in interp
    assert "four_pillars_meaning" in interp
    assert "career_wealth" in interp
    assert "feng_shui" in interp
    assert "da_yun_guidance" in interp
    assert "壬" in interp["macro_summary"]["day_master_title"]
    assert len(interp["feng_shui"]["lucky_colors"]) > 0


def test_bazi_calculation_recent_benchmark():
    # 2024-02-10 (Chinese New Year 2024, after Li Chun, Jia Chen year)
    res = calculate_bazi(
        birth_date="2024-02-10",
        birth_time="12:00",
        latitude=13.75,
        longitude=100.5167,
        tz_offset=7.0
    )
    pillars = res["four_pillars"]
    assert pillars["year"]["stem"]["chinese"] == "甲"
    assert pillars["year"]["branch"]["chinese"] == "辰"
