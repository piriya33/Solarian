from datetime import datetime
from zoneinfo import ZoneInfo

from fastapi.testclient import TestClient

from backend.main import ChartRequest, app
from backend.engine.ephemeris import calculate_chart
from backend.engine.transits import calculate_transits_for_date


def test_daily_fast_planets_are_opt_in_and_use_requested_date():
    chart = calculate_chart('2000-02-29', '12:00', 13.75, 100.5167, 7)
    annual = calculate_transits_for_date('2026-09-13', 5, chart)
    daily = calculate_transits_for_date('2026-09-13', 5, chart, include_fast_bodies=True)
    assert daily['date'] == '2026-09-13'
    assert len(annual['transit_positions']) == 6
    assert len(daily['transit_positions']) == 11
    assert {'Sun', 'Moon', 'Mercury', 'Venus', 'Mars'} <= {
        p['name'] for p in daily['transit_positions']
    }
    tomorrow = calculate_transits_for_date('2026-09-14', 5, chart, include_fast_bodies=True)
    moon_today = next(p['longitude'] for p in daily['transit_positions'] if p['name'] == 'Moon')
    moon_tomorrow = next(p['longitude'] for p in tomorrow['transit_positions'] if p['name'] == 'Moon')
    assert moon_today != moon_tomorrow


def test_guidance_reference_date_defaults_to_bangkok_today_and_rejects_bad_date():
    assert ChartRequest().reference_date == datetime.now(ZoneInfo('Asia/Bangkok')).date()
    response = TestClient(app).post('/api/chart/calculate', json={'reference_date': '2026-02-30'})
    assert response.status_code == 422


def test_connected_guidance_uses_requested_day_instead_of_birth_anniversary():
    response = TestClient(app).post('/api/chart/calculate', json={
        'name': 'Practical QA', 'birth_date': '2000-02-29', 'birth_time': '12:00',
        'latitude': 13.75, 'longitude': 100.5167, 'tz_offset': 7,
        'location_name': 'Bangkok', 'reference_date': '2026-09-13',
    })
    assert response.status_code == 200
    guidance = response.json()['guidance']
    assert guidance['reference_date'] == '2026-09-13'
    assert set(guidance['periods']) == {'today', 'period', 'year', 'identity'}
    for card in guidance['periods'].values():
        assert card['title'] and card['summary'] and card['sources']
        assert 1 <= len(card['do']) <= 3
        assert 1 <= len(card['avoid']) <= 3
