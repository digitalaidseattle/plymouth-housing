import time
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
        last_error = None

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
                NoSuchElementException,
            ) as err:
                last_error = err

                if attempt == retries - 1:
                    raise TimeoutException(
                        f"Failed to click {locator} "
                        f"after {retries} retries. "
                        f"Last error: {last_error}"
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

    def js_click_element(self, element):
        self.driver.execute_script(
            "arguments[0].scrollIntoView({block:'center'});",
            element
        )
        self.driver.execute_script(
            "arguments[0].click();",
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
    # Stable Autocomplete
    # ---------------------------------------------------

    def select_from_autocomplete(
            self,
            input_locator,
            options_locator,
            timeout=20,
            retries=3
    ):
        """
        Select the first visible option from a MUI autocomplete/dropdown.

        This method intentionally re-fetches the input and option elements on
        every retry. MUI frequently re-renders listbox items, so keeping a saved
        list of WebElements can cause stale element failures.
        """
        wait = self.get_wait(timeout)
        last_error = None

        for attempt in range(retries):
            try:
                input_el = wait.until(
                    EC.element_to_be_clickable(input_locator)
                )

                self.driver.execute_script(
                    "arguments[0].scrollIntoView({block:'center'});",
                    input_el
                )

                input_el.click()

                wait.until(
                    lambda d: (
                        d.find_element(*input_locator)
                        .get_attribute("aria-expanded")
                        == "true"
                    )
                )

                def first_visible_option(driver):
                    elements = driver.find_elements(*options_locator)

                    for el in elements:
                        try:
                            text = el.text.strip()

                            if el.is_displayed() and text:
                                return el

                        except (
                            StaleElementReferenceException,
                            NoSuchElementException,
                        ):
                            continue

                    return False

                # Do not keep an old list of options. Return one fresh element.
                first_option = wait.until(first_visible_option)
                selected_text = first_option.text.strip()

                self.driver.execute_script(
                    "arguments[0].scrollIntoView({block:'center'});",
                    first_option
                )

                self.driver.execute_script(
                    "arguments[0].click();",
                    first_option
                )

                # Re-find the input after the option click because React/MUI can
                # re-render it during selection.
                def selection_finished(driver):
                    try:
                        current_input = driver.find_element(*input_locator)
                        value = (current_input.get_attribute("value") or "").strip()
                        expanded = current_input.get_attribute("aria-expanded")

                        return (
                            value == selected_text
                            or (value != "" and expanded == "false")
                            or expanded == "false"
                        )

                    except (
                        StaleElementReferenceException,
                        NoSuchElementException,
                    ):
                        return False

                wait.until(selection_finished)

                try:
                    current_input = wait.until(
                        EC.presence_of_element_located(input_locator)
                    )
                    self.driver.execute_script(
                        "arguments[0].blur();",
                        current_input
                    )
                except (
                    TimeoutException,
                    StaleElementReferenceException,
                    NoSuchElementException,
                ):
                    # Selection already succeeded; blur is only cleanup.
                    pass

                return selected_text

            except (
                TimeoutException,
                StaleElementReferenceException,
                NoSuchElementException,
                ElementClickInterceptedException,
            ) as err:
                last_error = err
                print(
                    f"[WARN] Autocomplete select failed "
                    f"(attempt {attempt + 1}/{retries}): {err}"
                )
                time.sleep(0.5)

        raise TimeoutException(
            f"Could not select autocomplete option for {input_locator}. "
            f"Last error: {last_error}"
        )

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
