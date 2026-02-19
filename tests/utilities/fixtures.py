import os
import pytest
from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.chrome.options import Options

from tests.pages.home_page import HomePage
from tests.pages.login_page import LoginPage
from tests.utilities.data import (
    URL,
    ADMIN_USERNAME,
    ADMIN_PASSWORD,
    VOLUNTEER_USERNAME,
    VOLUNTEER_PASSWORD,
)

# =====================================================
# WebDriver Fixture
# =====================================================
@pytest.fixture(scope="function")
def driver():
    options = Options()

    # -----------------------
    # Headless for CI
    # -----------------------
    if os.getenv("CI") == "true":
        options.add_argument("--headless=new")
        options.add_argument("--window-size=1920,1080")
        options.add_argument("--disable-gpu")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")

    driver = webdriver.Chrome(options=options)

    # Local only (not CI)
    if os.getenv("CI") != "true":
        driver.maximize_window()

    driver.implicitly_wait(10)
    driver.wait = WebDriverWait(driver, 15)
    driver.get(URL)

    yield driver
    driver.quit()


# =====================================================
# Volunteer Login Fixture
# =====================================================
@pytest.fixture(scope="function")
def login_with_volunteer(driver):
    login_page = LoginPage(driver)

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

    return HomePage(driver)


# =====================================================
# Admin Login Fixture
# =====================================================
@pytest.fixture(scope="function")
def admin_home_page(driver):
    login_page = LoginPage(driver)

    login_page.enter_username(ADMIN_USERNAME)
    login_page.click_next_button()

    login_page.enter_password(ADMIN_PASSWORD)
    login_page.click_sign_in_button()
    login_page.click_yes_button()

    return HomePage(driver)

