import pytest

from tests.pages.home_page import HomePage
from tests.pages.login_page import LoginPage
from tests.utilities.data import (
    VOLUNTEER_DISPLAY_NAME,
    VOLUNTEER_PASSWORD,
    VOLUNTEER_PIN,
    VOLUNTEER_USERNAME,
)


@pytest.fixture(scope="function")
def login_page(driver):
    return LoginPage(driver)


@pytest.mark.serial
@pytest.mark.smoke
def test_login_volunteer(driver, login_page):

    # --- Open Microsoft Login ---
    login_page.click_app_login_button()

    # --- Microsoft Login ---
    login_page.enter_username(
        VOLUNTEER_USERNAME
    )
    login_page.click_next_button()

    login_page.enter_password(
        VOLUNTEER_PASSWORD
    )
    login_page.click_sign_in_button()

    # Optional Stay Signed In
    login_page.handle_stay_signed_in()

    # --- Pick Volunteer Name ---
    login_page.wait_for_pick_your_name()

    login_page.select_volunteer(
        VOLUNTEER_DISPLAY_NAME
    )
    login_page.click_continue_button()

    # --- PIN ---
    login_page.enter_pin(
        VOLUNTEER_PIN
    )
    login_page.click_continue_button()

    # --- Verify Home Loaded ---
    home_page = HomePage(driver)
    home_page.wait_for_homepage_loaded()

    actual_text = (
        home_page.get_plymouth_housing_text()
    )

    assert "Plymouth Housing" in actual_text.strip(), (
        "Expected 'Plymouth Housing' in header, "
        f"but got '{actual_text}'"
    )