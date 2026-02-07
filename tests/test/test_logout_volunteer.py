import pytest
from tests.utilities.fixtures import driver
from tests.utilities.fixtures import login_with_volunteer
from tests.pages.logout_page import LogoutPage
from tests.pages.home_page import HomePage

@pytest.fixture(scope="function")
def home_page(driver):
    return HomePage(driver)

@pytest.mark.usefixtures("login_with_volunteer")
@pytest.mark.regression
def test_logout(driver, home_page):
    home_page.click_email_id()
    home_page.click_logout()

    logout_page = LogoutPage(driver)
    logout_message = logout_page.get_logout_message()

    expected_logout_message = "You are logged out. Please click the button to log in."
    assert logout_message == expected_logout_message