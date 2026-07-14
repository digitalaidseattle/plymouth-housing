import os
import allure
import pytest
from selenium import webdriver
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from tests.pages.checkout_page import CheckOutPage
from tests.pages.history_page import HistoryPage
from tests.pages.home_page import HomePage
from tests.pages.inventory_page import InventoryPage
from tests.pages.login_page import LoginPage
from tests.utilities.data import (
    URL,
    ADMIN_USERNAME,
    ADMIN_PASSWORD,
    VOLUNTEER_USERNAME,
    VOLUNTEER_PASSWORD,
)

# ---------------------------------------------------
# Debug Helpers
# ---------------------------------------------------

def _safe_name(name):
    """Sanitize test/debug names for attachments."""
    return (
        name.replace("/", "_")
        .replace("\\", "_")
        .replace(" ", "_")
        .replace(":", "_")
    )

def _attach_debug_artifacts(driver, name="debug"):
    """
    Attach useful browser state to Allure without exposing credentials.
    This helps diagnose setup/login failures.
    """
    safe_name = _safe_name(name)

    try:
        allure.attach(
            driver.current_url,
            name=f"{safe_name}_current_url",
            attachment_type=allure.attachment_type.TEXT,
        )
    except Exception as e:
        print(f"[WARN] Could not attach current URL: {e}")

    try:
        allure.attach(
            driver.title,
            name=f"{safe_name}_page_title",
            attachment_type=allure.attachment_type.TEXT,
        )
    except Exception as e:
        print(f"[WARN] Could not attach page title: {e}")

    try:
        allure.attach(
            driver.page_source,
            name=f"{safe_name}_page_source",
            attachment_type=allure.attachment_type.HTML,
        )
    except Exception as e:
        print(f"[WARN] Could not attach page source: {e}")

    try:
        screenshot = driver.get_screenshot_as_png()
        allure.attach(
            screenshot,
            name=f"{safe_name}_screenshot",
            attachment_type=allure.attachment_type.PNG,
        )
    except Exception as e:
        print(f"[WARN] Could not attach screenshot: {e}")


def _wait_for_password_field(driver, login_page, timeout=20):
    """
    Wait for Microsoft/Azure password field after username submit.
    Adds debug output if the login flow does not reach the password screen.
    """
    try:
        return WebDriverWait(driver, timeout).until(
            EC.visibility_of_element_located(login_page.locators.PASSWORD_INPUT)
        )
    except TimeoutException:
        print("[DEBUG] Password field did not appear after clicking Next")
        print("[DEBUG] Current URL:", driver.current_url)
        print("[DEBUG] Page title:", driver.title)
        print("[DEBUG] Page source preview:", driver.page_source[:1000])

        _attach_debug_artifacts(driver, "password_field_timeout")
        raise

# ---------------------------------------------------
# WebDriver Fixture (Stable + CI-ready)
# ---------------------------------------------------

@pytest.fixture(scope="function")
def driver():
    options = Options()

    # Reduce saved-password, credential, notification, and passkey prompts.
    # This helps avoid Windows Security "Choose a passkey" popups during Microsoft login.
    options.add_argument("--incognito")
    options.add_argument("--disable-save-password-bubble")
    options.add_argument("--disable-notifications")
    options.add_argument("--disable-popup-blocking")
    options.add_argument("--disable-features=WebAuthenticationConditionalUI")

    prefs = {
        "credentials_enable_service": False,
        "profile.password_manager_enabled": False,
        "profile.default_content_setting_values.notifications": 2,
    }
    options.add_experimental_option("prefs", prefs)

    if os.getenv("CI") == "true":
        options.add_argument("--headless=new")
        options.add_argument("--window-size=1920,1080")
        options.add_argument("--disable-gpu")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--disable-extensions")
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
    _wait_for_password_field(driver, login_page, timeout=20)

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

    # Enter username (never log credentials)
    login_page.enter_username(ADMIN_USERNAME)
    login_page.click_next_button()

    # Wait for password field to be visible
    _wait_for_password_field(driver, login_page, timeout=20)

    # Enter password (never log this)
    login_page.enter_password(ADMIN_PASSWORD)
    login_page.click_sign_in_button()

    # Handle "Stay signed in"
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


@pytest.fixture(scope="function")
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

    # Capture failures from setup and test execution.
    # This is important because login fixture failures happen during setup.
    if not rep.failed or rep.when not in ("setup", "call"):
        return

    driver = item.funcargs.get("driver", None)

    # Exit safely if driver is not available
    if not driver:
        return

    try:
        debug_name = f"{item.name}_{rep.when}_failure"
        _attach_debug_artifacts(driver, debug_name)

    except Exception as e:
        # Never allow debug capture failure to break the test run
        print(f"[WARN] Failure artifact capture failed: {e}")