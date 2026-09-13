from backend.engine.ephemeris import calculate_chart
from backend.engine.interpretation import analyze_aspect_dynamics


def test_minor_aspects_are_never_mislabeled_conjunctions():
    chart = calculate_chart('2000-02-29', '12:00', 13.75, 100.5167, 7)
    readings = analyze_aspect_dynamics(chart, [])
    minor = [r for r in readings if r['aspect_angle'] not in (0, 60, 90, 120, 180)]
    assert minor
    assert all('มุมกุมสนิท' not in r['core_dynamic'] for r in minor)
