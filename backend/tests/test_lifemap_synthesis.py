"""
Unit tests for the enhanced 108-Year LifeMap interpretation engine.
"""
import pytest
from backend.engine.ephemeris import calculate_chart
from backend.engine.thaksa import determine_astrological_day, calculate_thaksa_matrix, calculate_108_timeline
from backend.engine.transits import build_108_transits_map
from backend.engine.interpretation import synthesize_year_life_reading

@pytest.fixture(scope='module')
def full_chart_and_timeline():
    chart = calculate_chart('1985-01-13', '09:45', 13.75, 100.516667, 7.0)
    day_res = determine_astrological_day('1985-01-13', '09:45', chart['metadata']['sunrise_local'])
    matrix = calculate_thaksa_matrix(day_res['thaksa_num'])
    timeline = calculate_108_timeline('1985-01-13', day_res['thaksa_num'], chart['planets_dict'])
    transits_map = build_108_transits_map(chart)
    return chart, timeline, transits_map

def test_lifemap_synthesis_age_41(full_chart_and_timeline):
    chart, timeline, transits_map = full_chart_and_timeline
    year_entry = timeline['years_map'][41]
    t_data = transits_map[41]
    reading = synthesize_year_life_reading(41, year_entry, chart, t_data)

    assert reading['age'] == 41
    assert reading['calendar_year'] == 2026
    assert 'macro_detail' in reading
    assert 'sub_detail' in reading
    assert 'action_plan' in reading

    md = reading['macro_detail']
    assert 'พุธ' in md['house_sign_label']
    assert 'มังกร' in md['house_sign_label']
    assert '10' in md['house_sign_label']
    assert len(md['epoch_theme']) > 50
    assert len(md['strategic_focus']) > 50
    assert len(md['entropy_risk']) > 30

    sd = reading['sub_detail']
    assert 'ศุกร์' in sd['catalyst_role']
    assert 'มีน' in sd['catalyst_role']
    assert '12' in sd['catalyst_role']
    assert sd['pair_type'] == 'คู่ธาตุน้ำ'
    assert len(sd['synergy_dynamic']) > 30

    ap = reading['action_plan']
    assert len(ap['strategic_moves']) == 3
    assert len(ap['risk_mitigation']) == 2
    assert len(ap['decision_framework']) > 30

def test_lifemap_synthesis_all_108_years(full_chart_and_timeline):
    chart, timeline, transits_map = full_chart_and_timeline
    for age in range(109):
        year_entry = timeline['years_map'][age]
        t_data = transits_map[age] if age < len(transits_map) else {}
        reading = synthesize_year_life_reading(age, year_entry, chart, t_data)
        assert reading['age'] == age
        assert reading['macro_detail']['epoch_title'] != ''
        assert len(reading['action_plan']['strategic_moves']) == 3
