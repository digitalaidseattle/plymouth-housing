import pytest
import logging

from selenium.common.exceptions import NoSuchElementException, StaleElementReferenceException, TimeoutException
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

from tests.pages.base_page import BasePage
from tests.utilities.locators import InventoryPageLocators, CommonLocators

logger = logging.getLogger(__name__)


class InventoryPage(BasePage):
    def __init__(self, driver):
        super().__init__(driver)
        self.locators = InventoryPageLocators
        self.common_locators = CommonLocators
        self.wait = WebDriverWait(self.driver, 10)

    # BASIC INVENTORY METHODS
    def get_inventory(self, item: str) -> str:
        locator = (By.XPATH, "//*[@id='inventory-container']//tr[td[1][normalize-space(.)="
                   + self._xpath_literal(item) + "]] /td[6]")
        return self.get_text(locator, timeout=90)

    def get_inventory_quantity(self, item: str) -> int:
        """
        Returns numeric inventory quantity for given item.
        Skips test if warning icon is present.
        Raises clean error if value is non-numeric.
        """

        xpath = ("//*[@id='inventory-container']//tr[td[1][normalize-space(.)="
                 + self._xpath_literal(item) + "]]/td[6]")

        try:
            # Wait for cell presence
            cell = WebDriverWait(self.driver, 20).until(
                EC.presence_of_element_located((By.XPATH, xpath))
            )

            # Skip if warning icon present
            if cell.find_elements(By.XPATH, ".//*[local-name()='svg']"):
                pytest.skip(
                    f"Inventory value not ready for '{item}' (warning icon shown)"
                )

            # Wait until text becomes numeric
            WebDriverWait(self.driver, 20).until(
                lambda d: d.find_element(By.XPATH, xpath).text.strip().isdigit()
            )

            text = self.driver.find_element(By.XPATH, xpath).text.strip()

            if not text.isdigit():
                raise ValueError(
                    f"Inventory value for '{item}' is not numeric: '{text}'"
                )

            return int(text)

        except TimeoutException:
            raise TimeoutException(
                f"Timeout while retrieving inventory quantity for '{item}'"
            )

    # SEARCH METHODS
    @staticmethod
    def _xpath_literal(value):
        if "'" not in value:
            return f"'{value}'"

        if '"' not in value:
            return f'"{value}"'

        parts = value.split("'")
        return "concat(" + ", \"'\", ".join(f"'{part}'" for part in parts) + ")"

    def search_item(self, item_name: str):
        """Replace the React search value and verify the entered query."""
        wait = WebDriverWait(self.driver, 20)
        search_field = wait.until(EC.element_to_be_clickable(self.locators.SEARCH))
        self.driver.execute_script(
            "arguments[0].scrollIntoView({block: 'center'});", search_field
        )
        search_field.click()
        search_field.send_keys(Keys.CONTROL, "a")
        search_field.send_keys(Keys.BACKSPACE)
        wait.until(lambda d: (d.find_element(*self.locators.SEARCH).get_attribute("value") or "") == "")
        self.driver.find_element(*self.locators.SEARCH).send_keys(item_name)
        wait.until(lambda d: d.find_element(*self.locators.SEARCH).get_attribute("value") == item_name)

    def wait_for_search_results(self, item_name: str):
        """Match nested product-name text in the inventory's first column."""
        xpath = (
            "//*[@id='inventory-container']//tr[td[1][contains("
            "translate(normalize-space(.), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', "
            "'abcdefghijklmnopqrstuvwxyz'), "
            f"{self._xpath_literal(item_name.lower())})]]"
        )

        def visible_match(driver):
            for row in driver.find_elements(By.XPATH, xpath):
                try:
                    if row.is_displayed():
                        return row
                except StaleElementReferenceException:
                    continue
            return False

        for attempt in range(2):
            try:
                WebDriverWait(self.driver, 10).until(visible_match)
                return
            except TimeoutException:
                if attempt == 0:
                    self.search_item(item_name)

        names = [cell.text.strip() for cell in self.driver.find_elements(
            By.XPATH, "//*[@id='inventory-container']//tr[td]/td[1]"
        ) if cell.is_displayed()]
        raise AssertionError(
            f"{item_name!r} not found in inventory search. Visible results: {names!r}"
        )

    # LOADING HANDLING
    def wait_for_inventory_loaded(self):
        WebDriverWait(self.driver, 10).until(
            EC.invisibility_of_element_located(
                (By.CLASS_NAME, "MuiCircularProgress-root")
            )
        )

    # DEFENSIVE SEARCH (STABILIZED)
    def second_search_item(self, item_name: str):
        """Use the same verified search replacement for subsequent queries."""
        self.search_item(item_name)

    # STATUS FILTER METHODS
    def click_status(self):
        status_btn = WebDriverWait(self.driver, 15).until(
            EC.element_to_be_clickable(
                (By.XPATH, "//div[@id='status-button-container']//button")
            )
        )
        status_btn.click()

    def select_status(self, status_text: str):
        option = WebDriverWait(self.driver, 10).until(
            EC.element_to_be_clickable(
                (By.XPATH, f"//li[normalize-space()='{status_text}']")
            )
        )
        option.click()

    def get_filtered_rows(self, status_text: str):
        xpath = f"//tr[td//span[normalize-space()='{status_text}']]"

        WebDriverWait(self.driver, 10).until(
            EC.presence_of_all_elements_located((By.XPATH, xpath))
        )

        return self.driver.find_elements(By.XPATH, xpath)

    def click_adjust(self, item_name: str):
        locator = (
            By.XPATH,
            f"//td[normalize-space()='{item_name}']/following-sibling::td[last()]//button"
        )
        self.click(locator)

    def set_new_quantity(self, value: str):
        locator = (By.XPATH, "//input[@type='number']")

        field = self.wait.until(
            EC.element_to_be_clickable(locator)
        )

        #  clear safely (React/MUI friendly)
        field.send_keys(Keys.CONTROL + "a")
        field.send_keys(Keys.DELETE)

        #  enter new value
        field.send_keys(value)

    def select_reason(self, reason="Correction"):
        locator = (By.XPATH, f"//*[normalize-space()='{reason}']")
        self.click(locator)

    def enter_comment(self, text: str):
        locator = (
            By.XPATH,
            "//input[@placeholder='Add a reason or comment']"
        )
        self.send_keys(locator, text)

    def click_submit(self):
        self.click((By.XPATH, "//button[normalize-space()='Submit']"))

    def wait_for_adjust_complete(self, item, new_value):
        wait = self.get_wait(15)

        wait.until(
            EC.invisibility_of_element_located(
                (By.XPATH, "//div[@role='dialog']")
            )
        )

        wait.until(
            lambda d: self.get_inventory_quantity(item) == new_value
        )

    def wait_for_adjust_modal(self):
        wait = self.get_wait(10)

        field = wait.until(
            EC.visibility_of_element_located(
                (By.XPATH, "//input[@placeholder='Enter the updated quantity']")
            )
        )

        wait.until(lambda d: field.is_enabled())

    def wait_for_quantity_update(self, item, expected_value):
        locator = (
            By.XPATH,
            f"//td[normalize-space()='{item}']/following-sibling::td[last()-1]"
        )

        wait = self.get_wait(10)

        wait.until(lambda d: len(d.find_elements(*locator)) > 0)

        def value_updated(d):
            el = d.find_element(*locator)
            text = el.text.strip()
            return text.isdigit() and int(text) == expected_value

        wait.until(value_updated)