import os
import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from tests.pages.checkout_page import CheckOutPage
from tests.pages.inventory_page import InventoryPage
from tests.pages.home_page import HomePage
from tests.pages.login_page import LoginPage
from tests.pages.history_page import HistoryPage

from tests.utilities.data import (
    URL,
    ADMIN_USERNAME,
    ADMIN_PASSWORD,
    VOLUNTEER_USERNAME,
    VOLUNTEER_PASSWORD,
)

# ---------------------------------------------------
# WebDriver Fixture (STABLE + FAST)
# ---------------------------------------------------

@pytest.fixture(scope="function")
def driver():
    options = Options()

    if os.getenv("CI") == "true":
        options.add_argument("--headless=new")
        options.add_argument("--window-size=1920,1080")
        options.add_argument("--disable-gpu")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--disable-extensions")
        options.add_argument("--disable-notifications")
        options.add_argument("--disable-infobars")
        options.add_argument("--disable-blink-features=AutomationControlled")

    options.page_load_strategy = "eager"

    driver = webdriver.Chrome(options=options)

    if os.getenv("CI") != "true":
        driver.maximize_window()

    driver.get(URL)

    yield driver

    driver.quit()


# ---------------------------------------------------
# Volunteer Login Fixture (HARDENED)
# ---------------------------------------------------

@pytest.fixture(scope="function")
def login_with_volunteer(driver):
    login_page = LoginPage(driver)

    # Username
    login_page.enter_username(VOLUNTEER_USERNAME)
    login_page.click_next_button()

    #  WAIT PASSWORD PAGE (CRITICAL FIX)
    WebDriverWait(driver, 20).until(
        EC.visibility_of_element_located(login_page.locators.PASSWORD_INPUT)
    )

    # Password
    login_page.enter_password(VOLUNTEER_PASSWORD)
    login_page.click_sign_in_button()

    # Stay signed in
    login_page.handle_stay_signed_in()

    # Volunteer select (stable now)
    login_page.select_volunteer("John Doe 1234")

    login_page.click_continue_button()

    # PIN
    login_page.enter_pin()
    login_page.click_continue_button()

    # Final landing
    home_page = HomePage(driver)
    home_page.wait_for_homepage_loaded()

    return home_page


# ---------------------------------------------------
# Admin Login Fixture (STABLE)
# ---------------------------------------------------

@pytest.fixture(scope="function")
def admin_home_page(driver):
    login_page = LoginPage(driver)

    login_page.enter_username(ADMIN_USERNAME)
    login_page.click_next_button()

    #  WAIT PASSWORD PAGE
    WebDriverWait(driver, 20).until(
        EC.visibility_of_element_located(login_page.locators.PASSWORD_INPUT)
    )

    login_page.enter_password(ADMIN_PASSWORD)
    login_page.click_sign_in_button()

    login_page.handle_stay_signed_in()

    login_page.wait_for_database_ready()

    home_page = HomePage(driver)
    home_page.wait_for_homepage_loaded()

    return home_page


# ---------------------------------------------------
# Page Fixtures
# ---------------------------------------------------

@pytest.fixture(scope="function")
def history_page(driver):
    return HistoryPage(driver)


@pytest.fixture(scope="function")
def checkout_page(driver):
    return CheckOutPage(driver)


@pytest.fixture(scope="function")
def inventory_page(driver):
    return InventoryPage(driver)


@pytest.fixture(scope="function")
def home_page(login_with_volunteer):
    return login_with_volunteer


@pytest.fixture
def add_item_page(driver):
    from tests.pages.add_item_page import AddItemPage
    return AddItemPage(driver)