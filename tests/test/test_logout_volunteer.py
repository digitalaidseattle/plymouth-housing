import pytest
from tests.pages.login_page import LoginPage
from tests.utilities.fixtures import driver
from tests.utilities.data import VOLUNTEER_USERNAME, VOLUNTEER_PASSWORD

@pytest.fixture
def login_page(driver):
    return LoginPage(driver)

def test_logout_volunteer(driver,login_page):
    login_page.enter_username(VOLUNTEER_USERNAME)
    login_page.click_next_button()
    login_page.enter_password(VOLUNTEER_PASSWORD)
    login_page.click_sign_in_button()
    login_page.click_yes_button()
    login_page.click_person()
    login_page.select_first_option()
    login_page.click_continue_button()
    login_page.enter_pin()
    login_page.click_continue_button()
    # TODO  ADD VERIFICATION