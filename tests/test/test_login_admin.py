import pytest

from tests.pages.home_page import HomePage
from tests.pages.login_page import LoginPage
from tests.utilities.data import (
    ADMIN_PASSWORD,
    ADMIN_USERNAME,
)


@pytest.fixture(scope="function")
def login_page(driver):
    return LoginPage(driver)


@pytest.mark.serial
@pytest.mark.smoke
def test_login_admin(driver, login_page):

    # --- Open Microsoft Login ---
    login_page.click_app_login_button()

    # --- Microsoft Login ---
    login_page.enter_username(ADMIN_USERNAME)
    login_page.click_next_button()

    login_page.enter_password(ADMIN_PASSWORD)
    login_page.click_sign_in_button()

    # Optional Stay Signed In
    login_page.handle_stay_signed_in()

    # Wait for loading/database overlay if applicable
    login_page.wait_for_database_ready()

    # --- Ensure Home Fully Loaded ---
    home_page = HomePage(driver)
    home_page.wait_for_homepage_loaded()

    actual_text = home_page.get_plymouth_housing_text()

    assert "Plymouth Housing" in actual_text.strip(), (
        "Expected 'Plymouth Housing' in header, "
        f"but got '{actual_text}'"
    )