import pytest
from tests.pages.logout_page import LogoutPage
from tests.utilities.fixtures import HomePage

@pytest.fixture(scope="function")
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

@pytest.mark.usefixtures("login_with_volunteer")
def test_header(driver, home_page):
    expected_header = "Volunteer Home"

    assert home_page.is_visible(home_page.locators.VOLUNTEER_HOME_HEADER, timeout=20), (
        f"Volunteer Home header not visible.\n"
        f"URL: {driver.current_url}\n"
        f"Title: {driver.title}"
    )

    actual_header = home_page.get_header().strip()

    assert actual_header == expected_header, (
        f"Unexpected header.\n"
        f"Expected: {expected_header}\n"
        f"Actual: {actual_header}\n"
        f"URL: {driver.current_url}\n"
        f"Title: {driver.title}"
    )