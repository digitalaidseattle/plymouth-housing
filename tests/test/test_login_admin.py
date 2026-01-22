import pytest
from tests.pages.login_page import LoginPage
from tests.utilities.fixtures import driver
from tests.utilities.data import ADMIN_USERNAME
from tests.utilities.data import ADMIN_PASSWORD
from tests.pages.home_page import HomePage

@pytest.fixture(scope="function")
def login_page(driver):
    return LoginPage(driver)

def test_login_admin(driver, login_page):
    login_page.enter_username(ADMIN_USERNAME)
    login_page.click_next_button()
    login_page.enter_password(ADMIN_PASSWORD)
    login_page.click_sign_in_button()
    login_page.click_yes_button()
    home_page = HomePage(driver)
    actual_plymouth_housing_text = home_page.get_plymouth_housing_text()
    expected_plymouth_housing_text = 'Plymouth Housing'
    assert actual_plymouth_housing_text == expected_plymouth_housing_text, (
        'Unexpected Plymouth Housing text in home page'
        f'expected: {expected_plymouth_housing_text}'
        f'actual: {actual_plymouth_housing_text}')


