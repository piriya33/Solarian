from backend.engine.ai_counselor import build_astrology_prompt_context
from backend.engine.ephemeris import calculate_chart
from backend.engine.thaksa import calculate_108_timeline, determine_astrological_day


def test_context_retains_all_solar_aspects_and_all_harmonic_catalog_entries():
    chart = calculate_chart('2000-02-29', '12:00', 13.75, 100.5167, 7)
    day = determine_astrological_day('2000-02-29', '12:00', chart['metadata']['sunrise_local'])
    timeline = calculate_108_timeline('2000-02-29', day['thaksa_num'], chart['planets_dict'])
    context = build_astrology_prompt_context(chart, day, [], timeline, {})
    import json
    for aspect in chart['aspects']:
        if 'Sun' in (aspect['body1'], aspect['body2']):
            assert json.dumps(aspect, ensure_ascii=False) in context
    for entry in timeline['degree_triggers_catalog']:
        assert json.dumps(entry, ensure_ascii=False) in context
    assert 'แยกจากดาวจรจริง' in context
    assert 'rounded_age' in context
