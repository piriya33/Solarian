from datetime import date

from backend.engine.ephemeris import calculate_chart
from backend.engine.transits import build_108_transits_map


def test_leap_birthday_has_valid_samples_through_108_years():
    chart = calculate_chart('2000-02-29', '12:00', 13.75, 100.5167, 7.0)
    samples = build_108_transits_map(chart)
    assert len(samples) == 109
    assert samples[0]['target_date'] == '2000-02-29'
    assert samples[1]['target_date'] == '2001-02-28'
    assert samples[4]['target_date'] == '2004-02-29'
    assert samples[100]['target_date'] == '2100-02-28'
    assert samples[108]['target_date'] == '2108-02-29'
    for age, sample in enumerate(samples):
        assert sample['age'] == age
        assert date.fromisoformat(sample['target_date']).year == 2000 + age
