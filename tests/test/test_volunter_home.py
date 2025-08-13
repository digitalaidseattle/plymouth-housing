import pytest
from pages.home_page import HomePage
from pages.logout_page import LogoutPage
from utilities.fixtures import login_with_volunteer
from utilities.fixtures import driver

@pytest.fixture(scope="function")  # Changed scope for better isolation
def home_page(driver):
    return HomePage(driver)

@pytest.mark.usefixtures('login_with_volunteer')
def test_logout(driver, home_page):
    home_page.click_email_id()
    home_page.click_logout()
    logout_page = LogoutPage(driver)
    logout_message = logout_page.get_logout_message()
    expected_logout_message = "You are logged out. Please click the button to log in."

    assert logout_message == expected_logout_message, f"Expected logout message '{expected_logout_message}', but got '{logout_message}'."

@pytest.mark.usefixtures('login_with_volunteer')
def test_header(driver, home_page):
    actual_header = home_page.get_header()
    expected_header = 'Volunteer Home'
    assert actual_header == expected_header, (
        'Unexpected header'
        f'expected: {expected_header}'
        f'actual: {actual_header}')