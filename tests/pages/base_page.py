from selenium.webdriver.common.keys import Keys
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

    # ---------------------------------------------------
    # Wait Factory
    # ---------------------------------------------------

    def get_wait(self, timeout=None):
        return WebDriverWait(self.driver, timeout or self.DEFAULT_TIMEOUT)

    # ---------------------------------------------------
    # Page Ready (GLOBAL)
    # ---------------------------------------------------

    def wait_for_page_ready(self):
        self.get_wait().until(
            lambda d: d.execute_script("return document.readyState") == "complete"
        )

    # ---------------------------------------------------
    # Core Finders
    # ---------------------------------------------------

    def find(self, locator, timeout=None):
        return self.get_wait(timeout).until(
            EC.presence_of_element_located(locator)
        )

    def find_all(self, locator):
        return self.driver.find_elements(*locator)

    # ---------------------------------------------------
    # Visibility / Clickable Waits
    # ---------------------------------------------------

    def wait_for_visibility(self, locator, timeout=None):
        return self.get_wait(timeout).until(
            EC.visibility_of_element_located(locator)
        )

    def wait_for_clickable(self, locator, timeout=None):
        return self.get_wait(timeout).until(
            EC.element_to_be_clickable(locator)
        )

    # ---------------------------------------------------
    # Click (RETRY + SCROLL + JS FALLBACK)
    # ---------------------------------------------------

    def click(self, locator, timeout=None, retries=3):
        timeout = timeout or self.DEFAULT_TIMEOUT

        for attempt in range(retries):
            try:
                element = self.wait_for_visibility(locator, timeout)

                self.driver.execute_script(
                    "arguments[0].scrollIntoView({block:'center'});", element
                )

                try:
                    element.click()
                except ElementClickInterceptedException:
                    self.driver.execute_script("arguments[0].click();", element)

                return

            except (StaleElementReferenceException, TimeoutException) as err:
                if attempt == retries - 1:
                    raise TimeoutException(
                        f"Failed to click {locator} after {retries} retries"
                    ) from err

    # ---------------------------------------------------
    # Input
    # ---------------------------------------------------

    def send_keys(self, locator, text, timeout=None):
        element = self.wait_for_visibility(locator, timeout)
        element.clear()
        element.send_keys(text)

    # ---------------------------------------------------
    # State Checks
    # ---------------------------------------------------

    def is_visible(self, locator, timeout=None):
        try:
            self.wait_for_visibility(locator, timeout)
            return True
        except TimeoutException:
            return False

    def is_element_present(self, locator):
        return len(self.driver.find_elements(*locator)) > 0

    # ---------------------------------------------------
    # Text & Title
    # ---------------------------------------------------

    def get_text(self, locator, timeout=None):
        element = self.wait_for_visibility(locator, timeout)
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
    # Data Wait (STATE-BASED)
    # ---------------------------------------------------

    def wait_for_data_load(self, value, timeout=30):
        locator = (By.XPATH, f"//*[contains(text(), '{value}')]")
        self.get_wait(timeout).until(
            lambda d: len(d.find_elements(*locator)) > 0
        )

    def select_from_autocomplete(
            self,
            input_locator,
            options_locator,
            timeout=20
    ):
        wait = self.get_wait(timeout)

        input_el = wait.until(
            EC.element_to_be_clickable(input_locator)
        )

        # scroll + click (dropdown aç)
        self.driver.execute_script(
            "arguments[0].scrollIntoView({block:'center'});",
            input_el
        )

        input_el.click()

        # 🔥 MUI dropdown açılması için küçük bekleme
        wait.until(
            lambda d: input_el.get_attribute("aria-expanded") == "true"
        )

        # options bekle
        options = wait.until(
            lambda d: [
                el for el in d.find_elements(*options_locator)
                if el.is_displayed() and el.text.strip()
            ]
        )

        if not options:
            raise TimeoutException(
                f"No visible options found for autocomplete {input_locator}"
            )

        first_option = options[0]

        first_option = options[0]
        selected_text = first_option.text.strip()

        # 🔥 garanti click
        self.driver.execute_script(
            "arguments[0].click();",
            first_option
        )

        # blur (React commit)
        self.driver.execute_script("arguments[0].blur();", input_el)

        # ✅ GERÇEK selection bekle
        wait.until(
            lambda d: input_el.get_attribute("value") == selected_text
        )

        # dropdown kapandı mı
        wait.until(
            lambda d: input_el.get_attribute("aria-expanded") != "true"
        )

        return selected_text