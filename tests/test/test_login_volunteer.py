import pytest
from tests.pages.login_page import LoginPage
from tests.utilities.fixtures import driver
from tests.utilities.data import VOLUNTEER_PASSWORD
from tests.utilities.data import VOLUNTEER_USERNAME

@pytest.fixture(scope="function")
def login_page(driver):
    return LoginPage(driver)

@pytest.mark.serial
@pytest.mark.smoke
def test_login_volunteer(driver, login_page):
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

    assert login_page.get_title() == "Plymouth Housing"
