from backend.models import BirthProfile


def test_partial_saved_profile_is_not_silently_treated_as_confirmed_birth_data():
    profile = BirthProfile(name='Incomplete', user_id=1)
    profile.set_data({'birth_date': '2000-01-01'})
    assert profile.get_data()['birth_data_complete'] is False
    round_trip = profile.get_data()
    round_trip['notes'] = 'Updated note only'
    profile.set_data(round_trip)
    assert profile.get_data()['birth_data_complete'] is False


def test_zero_coordinates_and_offset_are_valid_complete_values():
    profile = BirthProfile(name='Equator', user_id=1)
    profile.set_data({
        'birth_date': '2000-01-01', 'birth_time': '00:00',
        'latitude': 0, 'longitude': 0, 'tz_offset': 0,
        'location_name': 'Equator',
    })
    assert profile.get_data()['birth_data_complete'] is True
