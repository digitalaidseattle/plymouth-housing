from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import (
    TimeoutException,
    NoSuchElementException,
    StaleElementReferenceException,
    ElementClickInterceptedException,
)

from tests.utilities.locators import CommonLocators, InventoryPageLocators


class BasePage:

    DEFAULT_TIMEOUT = 20

    def __init__(self, driver):
        self.driver = driver
        self.common_locators = CommonLocators
        self.add_locators = InventoryPageLocators
        self.wait = WebDriverWait(driver, self.DEFAULT_TIMEOUT)

    # ---------------------------------------------------
    # Core Finders
    # ---------------------------------------------------

    def find(self, locator, timeout=None):
        timeout = timeout or self.DEFAULT_TIMEOUT
        return WebDriverWait(self.driver, timeout).until(
            EC.visibility_of_element_located(locator)
        )

    def find_all(self, locator):
        return self.driver.find_elements(*locator)

    # ---------------------------------------------------
    # Click (Retry + Scroll Safe)
    # ---------------------------------------------------

    def click(self, locator, timeout=None, retries=3):
        if retries < 1:
            raise ValueError("retries must be >= 1")

        timeout = timeout or self.DEFAULT_TIMEOUT
        last_exception = None

        for _ in range(retries):
            try:
                element = WebDriverWait(
                    self.driver,
                    timeout,
                    ignored_exceptions=(StaleElementReferenceException,),
                ).until(EC.element_to_be_clickable(locator))

                self.driver.execute_script(
                    "arguments[0].scrollIntoView({block:'center'});", element
                )

                try:
                    element.click()
                except ElementClickInterceptedException:
                    self.driver.execute_script("arguments[0].click();", element)

                return

            except (StaleElementReferenceException, TimeoutException) as e:
                last_exception = e

        raise last_exception

    # ---------------------------------------------------
    # Input
    # ---------------------------------------------------

    def send_keys(self, locator, text):
        element = self.find(locator)
        element.clear()
        element.send_keys(text)

    # ---------------------------------------------------
    # State Checks
    # ---------------------------------------------------

    def is_visible(self, locator, timeout=None):
        timeout = timeout or self.DEFAULT_TIMEOUT
        try:
            WebDriverWait(self.driver, timeout).until(
                EC.visibility_of_element_located(locator)
            )
            return True
        except TimeoutException:
            return False

    def is_element_present(self, locator):
        try:
            self.driver.find_element(*locator)
            return True
        except NoSuchElementException:
            return False

    # ---------------------------------------------------
    # Wait Helpers
    # ---------------------------------------------------

    def wait_for_clickable(self, locator, timeout=None):
        timeout = timeout or self.DEFAULT_TIMEOUT
        return WebDriverWait(self.driver, timeout).until(
            EC.element_to_be_clickable(locator)
        )

    def wait_for_visibility(self, locator, timeout=None):
        timeout = timeout or self.DEFAULT_TIMEOUT
        return WebDriverWait(self.driver, timeout).until(
            EC.visibility_of_element_located(locator)
        )

    # ---------------------------------------------------
    # Text & Title
    # ---------------------------------------------------

    def get_text(self, locator, timeout=None):
        element = self.find(locator, timeout)
        return element.text.strip()

    def get_title(self):
        return self.driver.title

    # ---------------------------------------------------
    # Utility
    # ---------------------------------------------------

    def execute_script(self, script, *args):
        return self.driver.execute_script(script, *args)

    def scroll_into_view(self, locator):
        element = self.find(locator)
        self.driver.execute_script(
            "arguments[0].scrollIntoView({block:'center'});", element
        )

    # ---------------------------------------------------
    # Navigation Helpers
    # ---------------------------------------------------

    def click_on_inventory(self):
        self.click(self.common_locators.INVENTORY_BUTTON)

    def click_on_volunteer_home(self):
        self.click(self.common_locators.VOLUNTEER_HOME_BUTTON)

    def click_on_checkout(self):
        self.click(self.common_locators.CHECKOUT_MENU_BUTTON)

    def click_on_add_item(self):
        self.click(self.add_locators.ADD_BUTTON)

    # ---------------------------------------------------
    # Data Wait
    # ---------------------------------------------------

    def wait_for_data_load(self, value, timeout=30):
        locator = (By.XPATH, f"//*[contains(text(), '{value}')]")
        WebDriverWait(self.driver, timeout).until(
            EC.presence_of_element_located(locator)
        )

    # ---------------------------------------------------
    # Safe Click (Assertion Level)
    # ---------------------------------------------------

    def safe_click(self, locator, label=None):
        try:
            element = self.wait_for_clickable(locator)
            self.driver.execute_script(
                "arguments[0].scrollIntoView({block:'center'});", element
            )
            element.click()
        except TimeoutException:
            raise AssertionError(
                f"[ERROR] Could not click on {label or locator}"
            )