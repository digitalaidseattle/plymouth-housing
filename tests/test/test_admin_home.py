import pytest
from tests.pages.home_page import HomePage
from tests.utilities.fixtures import driver
from tests.utilities.fixtures import admin_home_page
from tests.utilities.data import ADMIN_USERNAME
from datetime import datetime

@pytest.fixture(scope="function")
def home_page(driver):
    return HomePage(driver)

@pytest.mark.smoke
def test_admin_home_button_text(driver, admin_home_page):
    actual_home_button_text = admin_home_page.get_menu_home_text()
    expected_header = 'Inventory'
    assert actual_home_button_text == expected_header, (
        'Unexpected home button text.\n'
        f'Expected: {expected_header}\n'
        f'Actual: {actual_home_button_text}')

@pytest.mark.smoke
def test_user_email_id(driver, admin_home_page):
    actual_email_id = admin_home_page.get_email_id()
    assert actual_email_id == ADMIN_USERNAME, (
        'Unexpected email ID.\n'
        f'Expected: {ADMIN_USERNAME}\n'
        f'Actual: {actual_email_id}'
    )
