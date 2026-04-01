import pytest
from tests.pages.login_page import LoginPage
from tests.pages.home_page import HomePage
from tests.utilities.data import ADMIN_USERNAME, ADMIN_PASSWORD


@pytest.fixture(scope="function")
def login_page(driver):
    return LoginPage(driver)


@pytest.mark.serial
@pytest.mark.smoke
def test_login_admin(driver, login_page):

    # --- Microsoft Login ---
    login_page.enter_username(ADMIN_USERNAME)
    login_page.click_next_button()

    login_page.enter_password(ADMIN_PASSWORD)
    login_page.click_sign_in_button()

    # Optional Stay Signed In
    login_page.handle_stay_signed_in()

    # --- Ensure Home Fully Loaded (role-aware) ---
    home_page = HomePage(driver)
    home_page.wait_for_homepage_loaded()

    actual_text = home_page.get_plymouth_housing_text()

    assert "Plymouth Housing" in actual_text.strip(), \
        f"Expected 'Plymouth Housing' in header, but got '{actual_text}'"