import os
from collections.abc import Generator

import allure
import pytest
from selenium import webdriver
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.webdriver import WebDriver
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

from tests.pages.checkout_page import CheckOutPage
from tests.pages.history_page import HistoryPage
from tests.pages.home_page import HomePage
from tests.pages.inventory_page import InventoryPage
from tests.pages.login_page import LoginPage
from tests.utilities.data import (
    ADMIN_PASSWORD,
    ADMIN_USERNAME,
    URL,
    VOLUNTEER_DISPLAY_NAME,
    VOLUNTEER_PASSWORD,
    VOLUNTEER_PIN,
    VOLUNTEER_USERNAME,
)


# ---------------------------------------------------
# Environment helpers
# ---------------------------------------------------

def is_ci_environment() -> bool:
    return os.getenv("CI", "").strip().lower() == "true"


def require_value(
    value: str | None,
    variable_name: str,
) -> str:
    if value is None or not str(value).strip():
        raise RuntimeError(
            f"Required environment variable is missing: "
            f"{variable_name}"
        )

    return str(value).strip()


def validate_base_url(url: str | None) -> str:
    validated_url = require_value(
        url,
        "URL",
    )

    if not validated_url.startswith(
        ("http://", "https://")
    ):
        raise RuntimeError(
            "URL must begin with http:// or https://"
        )

    return validated_url


# ---------------------------------------------------
# Debug helpers
# ---------------------------------------------------

def sanitize_attachment_name(
    value: str,
) -> str:
    safe_characters = []

    for character in value:
        if character.isalnum() or character in {
            "-",
            "_",
            ".",
        }:
            safe_characters.append(character)
        else:
            safe_characters.append("_")

    return "".join(safe_characters)


def attach_debug_artifacts(
    driver: WebDriver,
    name: str = "debug",
) -> None:
    """
    Attach browser state to Allure without exposing credentials.
    This helps diagnose setup/login failures.
    """
    safe_name = sanitize_attachment_name(name)

    try:
        allure.attach(
            driver.current_url,
            name=f"{safe_name}_current_url",
            attachment_type=allure.attachment_type.TEXT,
        )
    except Exception as exc:
        print(f"[WARN] Could not attach current URL: {exc}")

    try:
        allure.attach(
            driver.title,
            name=f"{safe_name}_page_title",
            attachment_type=allure.attachment_type.TEXT,
        )
    except Exception as exc:
        print(f"[WARN] Could not attach page title: {exc}")

    try:
        allure.attach(
            driver.page_source,
            name=f"{safe_name}_page_source",
            attachment_type=allure.attachment_type.HTML,
        )
    except Exception as exc:
        print(f"[WARN] Could not attach page source: {exc}")

    try:
        allure.attach(
            driver.get_screenshot_as_png(),
            name=f"{safe_name}_screenshot",
            attachment_type=allure.attachment_type.PNG,
        )
    except Exception as exc:
        print(f"[WARN] Could not attach screenshot: {exc}")


def wait_for_password_field(
    driver: WebDriver,
    login_page: LoginPage,
    timeout: int = 30,
):
    """
    Wait for the Microsoft/Azure password field after the username
    is submitted. Attaches debug evidence if it never appears.
    """
    try:
        return WebDriverWait(driver, timeout).until(
            EC.visibility_of_element_located(
                login_page.locators.PASSWORD_INPUT
            )
        )
    except TimeoutException:
        print("[DEBUG] Password field did not appear after clicking Next")
        print("[DEBUG] Current URL:", driver.current_url)
        print("[DEBUG] Page title:", driver.title)
        print("[DEBUG] Page source preview:", driver.page_source[:1000])

        attach_debug_artifacts(driver, "password_field_timeout")
        raise


# ---------------------------------------------------
# Chrome configuration
# ---------------------------------------------------

def build_chrome_options() -> Options:
    options = Options()

    # Do not wait for every background resource.
    options.page_load_strategy = "eager"

    options.add_argument(
        "--disable-notifications"
    )
    options.add_argument(
        "--disable-infobars"
    )

    # Reduce saved-password, credential, and passkey prompts. This avoids
    # Windows Security "Choose a passkey" popups during Microsoft login.
    options.add_argument("--incognito")
    options.add_argument(
        "--disable-save-password-bubble"
    )
    options.add_argument(
        "--disable-popup-blocking"
    )
    options.add_argument(
        "--disable-features="
        "WebAuthenticationConditionalUI"
    )

    options.add_experimental_option(
        "prefs",
        {
            "credentials_enable_service": False,
            "profile.password_manager_enabled": False,
            "profile.default_content_setting_values.notifications": 2,
        },
    )

    if is_ci_environment():
        options.add_argument("--headless=new")
        options.add_argument(
            "--window-size=1920,1080"
        )
        options.add_argument("--disable-gpu")
        options.add_argument("--no-sandbox")
        options.add_argument(
            "--disable-dev-shm-usage"
        )
        options.add_argument(
            "--disable-extensions"
        )
        options.add_argument(
            "--disable-blink-features="
            "AutomationControlled"
        )

    return options


# ---------------------------------------------------
# WebDriver fixture
# ---------------------------------------------------

@pytest.fixture(scope="function")
def driver(request) -> Generator[WebDriver, None, None]:
    base_url = validate_base_url(URL)
    options = build_chrome_options()

    browser = webdriver.Chrome(
        options=options
    )

    browser.set_page_load_timeout(120)
    browser.set_script_timeout(60)

    if not is_ci_environment():
        browser.maximize_window()

    # Publish the browser before the first navigation. If browser.get()
    # fails, the fixture never yields, so "driver" is never registered in
    # item.funcargs and the report hook would have nothing to capture.
    request.node.setup_failure_driver = browser

    try:
        browser.get(base_url)
        yield browser

    except Exception:
        # finally closes the browser before the report hook runs, so the
        # evidence has to be captured here, while the session is still live.
        attach_debug_artifacts(
            browser,
            "driver_setup_failure",
        )

        raise

    finally:
        try:
            browser.quit()
        except Exception as exc:
            print(
                "[WARN] WebDriver shutdown failed: "
                f"{exc}"
            )


# ---------------------------------------------------
# Login page fixture
# ---------------------------------------------------

@pytest.fixture(scope="function")
def login_page(
    driver: WebDriver,
) -> LoginPage:
    return LoginPage(driver)


# ---------------------------------------------------
# Volunteer login fixture
# ---------------------------------------------------

@pytest.fixture(scope="function")
def login_with_volunteer(
    driver: WebDriver,
    login_page: LoginPage,
) -> HomePage:
    volunteer_username = require_value(
        VOLUNTEER_USERNAME,
        "VOLUNTEER_USERNAME",
    )
    volunteer_password = require_value(
        VOLUNTEER_PASSWORD,
        "VOLUNTEER_PASSWORD",
    )
    volunteer_display_name = require_value(
        VOLUNTEER_DISPLAY_NAME,
        "VOLUNTEER_DISPLAY_NAME",
    )
    volunteer_pin = require_value(
        VOLUNTEER_PIN,
        "VOLUNTEER_PIN",
    )

    login_page.click_app_login_button()

    login_page.enter_username(
        volunteer_username
    )
    login_page.click_next_button()

    wait_for_password_field(
        driver,
        login_page,
        timeout=30,
    )

    login_page.enter_password(
        volunteer_password
    )
    login_page.click_sign_in_button()

    login_page.handle_stay_signed_in()

    # Wait until the volunteer-selection route
    # and its autocomplete field are available.
    login_page.wait_for_pick_your_name()

    login_page.select_volunteer(
        volunteer_display_name
    )

    login_page.click_continue_button()

    login_page.enter_pin(
        volunteer_pin
    )
    login_page.click_continue_button()

    home_page = HomePage(driver)
    home_page.wait_for_homepage_loaded()

    return home_page


# ---------------------------------------------------
# Admin login fixture
# ---------------------------------------------------

@pytest.fixture(scope="function")
def admin_home_page(
    driver: WebDriver,
    login_page: LoginPage,
) -> HomePage:
    admin_username = require_value(
        ADMIN_USERNAME,
        "ADMIN_USERNAME",
    )
    admin_password = require_value(
        ADMIN_PASSWORD,
        "ADMIN_PASSWORD",
    )

    login_page.click_app_login_button()

    login_page.enter_username(
        admin_username
    )
    login_page.click_next_button()

    wait_for_password_field(
        driver,
        login_page,
        timeout=30,
    )

    login_page.enter_password(
        admin_password
    )
    login_page.click_sign_in_button()

    login_page.handle_stay_signed_in()

    # Wait for temporary database/loading
    # overlays to disappear.
    login_page.wait_for_database_ready()

    home_page = HomePage(driver)
    home_page.wait_for_homepage_loaded()

    return home_page


# ---------------------------------------------------
# Page fixtures
# ---------------------------------------------------

@pytest.fixture(scope="function")
def history_page(
    driver: WebDriver,
) -> HistoryPage:
    return HistoryPage(driver)


@pytest.fixture(scope="function")
def checkout_page(
    driver: WebDriver,
) -> CheckOutPage:
    return CheckOutPage(driver)


@pytest.fixture(scope="function")
def inventory_page(
    driver: WebDriver,
) -> InventoryPage:
    return InventoryPage(driver)


@pytest.fixture(scope="function")
def home_page(
    driver: WebDriver,
) -> HomePage:
    return HomePage(driver)


@pytest.fixture(scope="function")
def add_item_page(
    driver: WebDriver,
):
    # Local import prevents unnecessary loading
    # when the fixture is not used.
    from tests.pages.add_item_page import (
        AddItemPage,
    )

    return AddItemPage(driver)


# ---------------------------------------------------
# Allure failure evidence
# ---------------------------------------------------

@pytest.hookimpl(hookwrapper=True)
def pytest_runtest_makereport(
    item: pytest.Item,
    call: pytest.CallInfo,
):
    outcome = yield
    report = outcome.get_result()

    # Save evidence for setup and test-call failures. Login fixture
    # failures happen during setup, so that phase matters. Teardown is
    # excluded because the driver may already have been closed.
    if (
        not report.failed
        or report.when not in {"setup", "call"}
    ):
        return

    browser = item.funcargs.get("driver") or getattr(
        item,
        "setup_failure_driver",
        None,
    )

    if browser is None:
        return

    try:
        attach_debug_artifacts(
            browser,
            f"{item.name}_{report.when}_failure",
        )

    except Exception as exc:
        # Never allow debug capture failure to break the test run.
        print(
            "[WARN] Failure artifact capture failed: "
            f"{exc}"
        )
