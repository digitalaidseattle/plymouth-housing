from tests.utilities.fixtures import driver
from tests.utilities.fixtures import admin_home_page
from tests.utilities.data import ADMIN_USERNAME
from datetime import datetime


def get_current_date():
    date = datetime.today()
    formatted_date = date.strftime('%A, %B %d').lstrip('0').replace(' 0', ' ')
    return formatted_date

def test_admin_home_button_text(driver, admin_home_page):
    actual_home_button_text = admin_home_page.get_menu_home_text()
    expected_header = 'Admin Home'
    assert actual_home_button_text == expected_header, (
        'Unexpected home button text.\n'
        f'Expected: {expected_header}\n'
        f'Actual: {actual_home_button_text}')

def test_admin_date(driver, admin_home_page):
    actual_date = admin_home_page.get_date()
    expected_date = get_current_date()
    assert actual_date == expected_date, (
        'Unexpected date.\n'
        f'Expected: {expected_date}\n'
        f'Actual: {actual_date}')

def test_user_email_id(driver, admin_home_page):
    actual_email_id = admin_home_page.get_email_id().lower()
    assert actual_email_id == ADMIN_USERNAME, (
        'Unexpected email ID.\n'
        f'Expected: {ADMIN_USERNAME}\n'
        f'Actual: {actual_email_id}')