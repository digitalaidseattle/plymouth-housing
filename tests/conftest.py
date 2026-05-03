import os
import allure
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
# WebDriver Fixture (Stable + CI-ready)
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

    # Faster page loading strategy
    options.page_load_strategy = "eager"

    driver = webdriver.Chrome(options=options)

    if os.getenv("CI") != "true":
        driver.maximize_window()

    driver.get(URL)

    yield driver

    driver.quit()


# ---------------------------------------------------
# Volunteer Login Fixture (Hardened)
# ---------------------------------------------------

@pytest.fixture(scope="function")
def login_with_volunteer(driver):
    login_page = LoginPage(driver)

    # Enter username (never log credentials)
    login_page.enter_username(VOLUNTEER_USERNAME)
    login_page.click_next_button()

    # Wait for password field to be visible
    WebDriverWait(driver, 20).until(
        EC.visibility_of_element_located(login_page.locators.PASSWORD_INPUT)
    )

    # Enter password (never log this)
    login_page.enter_password(VOLUNTEER_PASSWORD)
    login_page.click_sign_in_button()

    # Handle "Stay signed in"
    login_page.handle_stay_signed_in()

    # Select volunteer user (stable flow)
    login_page.select_volunteer("John Doe 1234")

    login_page.click_continue_button()

    # Enter PIN (masked in UI)
    login_page.enter_pin()
    login_page.click_continue_button()

    # Ensure home page is fully loaded
    home_page = HomePage(driver)
    home_page.wait_for_homepage_loaded()

    return home_page


# ---------------------------------------------------
# Admin Login Fixture (Stable)
# ---------------------------------------------------

@pytest.fixture(scope="function")
def admin_home_page(driver):
    login_page = LoginPage(driver)

    login_page.enter_username(ADMIN_USERNAME)
    login_page.click_next_button()

    WebDriverWait(driver, 20).until(
        EC.visibility_of_element_located(login_page.locators.PASSWORD_INPUT)
    )

    login_page.enter_password(ADMIN_PASSWORD)
    login_page.click_sign_in_button()

    login_page.handle_stay_signed_in()

    # Wait until backend / DB is ready
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
def home_page(driver):
    return HomePage(driver)


@pytest.fixture
def add_item_page(driver):
    from tests.pages.add_item_page import AddItemPage
    return AddItemPage(driver)


# ---------------------------------------------------
# Allure Screenshot Hook (Secure + Hardened)
# ---------------------------------------------------

@pytest.hookimpl(hookwrapper=True)
def pytest_runtest_makereport(item, call):
    outcome = yield
    rep = outcome.get_result()

    # Run only during test execution phase and on failure
    if rep.when != "call" or not rep.failed:
        return

    driver = item.funcargs.get("driver", None)

    # Exit safely if driver is not available
    if not driver:
        return

    try:
        screenshot = driver.get_screenshot_as_png()

        # Sanitize test name to avoid unsafe characters
        test_name = item.name.replace("/", "_").replace(" ", "_")

        allure.attach(
            screenshot,
            name=f"{test_name}_failure",
            attachment_type=allure.attachment_type.PNG
        )

    except Exception as e:
        # Never allow screenshot failure to break the test run
        print(f"[WARN] Screenshot capture failed: {e}")