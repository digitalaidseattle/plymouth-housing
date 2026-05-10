import time
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

from tests.utilities.locators import (
    CommonLocators,
    InventoryPageLocators,
)


class BasePage:
    DEFAULT_TIMEOUT = 20

    def __init__(self, driver):
        self.driver = driver
        self.common_locators = CommonLocators
        self.add_locators = InventoryPageLocators

    # ---------------------------------------------------
    # Generic Wait
    # ---------------------------------------------------

    def wait(self, seconds):
        time.sleep(seconds)

    def get_wait(self, timeout=None):
        return WebDriverWait(
            self.driver,
            timeout or self.DEFAULT_TIMEOUT
        )

    # ---------------------------------------------------
    # Page Ready
    # ---------------------------------------------------

    def wait_for_page_ready(self):
        self.get_wait().until(
            lambda d: (
                d.execute_script(
                    "return document.readyState"
                ) == "complete"
            )
        )

    # ---------------------------------------------------
    # Finders
    # ---------------------------------------------------

    def find(self, locator, timeout=None):
        return self.get_wait(timeout).until(
            EC.presence_of_element_located(locator)
        )

    def find_all(self, locator):
        return self.driver.find_elements(*locator)

    # ---------------------------------------------------
    # Visibility / Clickable
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
    # Safe Click
    # ---------------------------------------------------

    def click(self, locator, timeout=None, retries=3):
        timeout = timeout or self.DEFAULT_TIMEOUT

        for attempt in range(retries):

            try:
                element = self.wait_for_clickable(
                    locator,
                    timeout
                )

                self.driver.execute_script(
                    "arguments[0].scrollIntoView({block:'center'});",
                    element
                )

                try:
                    element.click()

                except ElementClickInterceptedException:
                    self.driver.execute_script(
                        "arguments[0].click();",
                        element
                    )

                return

            except (
                StaleElementReferenceException,
                TimeoutException,
            ) as err:

                if attempt == retries - 1:
                    raise TimeoutException(
                        f"Failed to click {locator} "
                        f"after {retries} retries"
                    ) from err

                time.sleep(1)

    # ---------------------------------------------------
    # Inputs
    # ---------------------------------------------------

    def send_keys(self, locator, text, timeout=None):
        element = self.wait_for_visibility(
            locator,
            timeout
        )

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
        return len(
            self.driver.find_elements(*locator)
        ) > 0

    # ---------------------------------------------------
    # Text / Title
    # ---------------------------------------------------

    def get_text(self, locator, timeout=None):
        element = self.wait_for_visibility(
            locator,
            timeout
        )

        return element.text.strip()

    def get_title(self):
        return self.driver.title

    # ---------------------------------------------------
    # JS Helpers
    # ---------------------------------------------------

    def execute_script(self, script, *args):
        return self.driver.execute_script(
            script,
            *args
        )

    def scroll_into_view(self, locator):
        element = self.find(locator)

        self.driver.execute_script(
            "arguments[0].scrollIntoView({block:'center'});",
            element
        )

    # ---------------------------------------------------
    # Navigation
    # ---------------------------------------------------

    def click_on_inventory(self):
        self.click(
            self.common_locators.INVENTORY_BUTTON
        )

    def click_on_volunteer_home(self):
        self.click(
            self.common_locators.VOLUNTEER_HOME_BUTTON
        )

    def click_on_checkout(self):
        self.click(
            self.common_locators.CHECKOUT_MENU_BUTTON
        )

    def click_on_add_item(self):
        self.click(
            self.add_locators.ADD_BUTTON
        )

    # ---------------------------------------------------
    # Data Wait
    # ---------------------------------------------------

    def wait_for_data_load(self, value, timeout=30):

        def _xpath_literal(s):
            if "'" not in s:
                return f"'{s}'"

            if '"' not in s:
                return f'"{s}"'

            # Mixed quotes -> use concat()
            parts = s.split("'")
            return "concat(" + ", \"'\", ".join(f"'{p}'" for p in parts) + ")"

        locator = (
            By.XPATH,
            f"//*[contains(text(), {_xpath_literal(value)})]",
        )

        self.get_wait(timeout).until(
            lambda d: (
                    len(d.find_elements(*locator)) > 0
            )
        )

    # ---------------------------------------------------
    # STABLE AUTOCOMPLETE
    # ---------------------------------------------------

    def select_from_autocomplete(
            self,
            input_locator,
            options_locator,
            timeout=20
    ):

        wait = self.get_wait(timeout)

        # ---------------------------------------------------
        # Locate input safely
        # ---------------------------------------------------

        input_el = wait.until(
            EC.element_to_be_clickable(
                input_locator
            )
        )

        self.driver.execute_script(
            "arguments[0].scrollIntoView({block:'center'});",
            input_el
        )

        input_el.click()

        # ---------------------------------------------------
        # Wait dropdown open
        # ---------------------------------------------------

        wait.until(
            lambda d: (
                d.find_element(*input_locator)
                .get_attribute("aria-expanded")
                == "true"
            )
        )

        # ---------------------------------------------------
        # Safe option collector
        # ---------------------------------------------------

        def visible_options(driver):

            valid_options = []

            elements = driver.find_elements(
                *options_locator
            )

            for el in elements:

                try:
                    if (
                        el.is_displayed()
                        and el.text.strip()
                    ):
                        valid_options.append(el)

                except (
                    StaleElementReferenceException,
                    NoSuchElementException,
                ):
                    continue

            return (
                valid_options
                if valid_options
                else False
            )

        options = wait.until(
            visible_options
        )

        if not options:
            raise TimeoutException(
                f"No visible options found "
                f"for autocomplete {input_locator}"
            )

        # ---------------------------------------------------
        # Select first option safely
        # ---------------------------------------------------

        try:
            first_option = options[0]

            selected_text = (
                first_option.text.strip()
            )

        except StaleElementReferenceException as err:

            options = visible_options(
                self.driver
            )

            if not options:
                raise TimeoutException(
                    "Autocomplete options "
                    "became stale"
                ) from err

            first_option = options[0]

            selected_text = (
                first_option.text.strip()
            )

        # ---------------------------------------------------
        # Click option
        # ---------------------------------------------------

        self.driver.execute_script(
            "arguments[0].click();",
            first_option
        )

        # ---------------------------------------------------
        # Re-find input after selection
        # ---------------------------------------------------

        input_el = wait.until(
            EC.presence_of_element_located(
                input_locator
            )
        )

        # blur field
        self.driver.execute_script(
            "arguments[0].blur();",
            input_el
        )

        # ---------------------------------------------------
        # Verify selected value
        # ---------------------------------------------------

        wait.until(
            lambda d: (
                d.find_element(*input_locator)
                .get_attribute("value")
                .strip()
                == selected_text
            )
        )

        # ---------------------------------------------------
        # Wait dropdown closed
        # ---------------------------------------------------

        wait.until(
            lambda d: (
                d.find_element(*input_locator)
                .get_attribute("aria-expanded")
                != "true"
            )
        )

        return selected_text

    # ---------------------------------------------------
    # Invisibility
    # ---------------------------------------------------

    def wait_for_invisibility_of_element(
            self,
            locator,
            timeout=20
    ):

        wait = self.get_wait(timeout)

        return wait.until(
            EC.invisibility_of_element_located(
                locator
            )
        )