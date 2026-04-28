import pytest
import logging

from selenium.common.exceptions import NoSuchElementException, TimeoutException
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
        locator = self.locators.get_inventory_locator(item)
        return self.get_text(locator, timeout=90)

    def get_inventory_quantity(self, item: str) -> int:
        """
        Returns numeric inventory quantity for given item.
        Skips test if warning icon is present.
        Raises clean error if value is non-numeric.
        """

        xpath = f"//td[normalize-space()='{item}']/following-sibling::td[5]"

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
    def search_item(self, item_name: str):
        search_field = WebDriverWait(self.driver, 20).until(
            EC.element_to_be_clickable(self.locators.SEARCH)
        )

        self.scroll_into_view(self.locators.SEARCH)
        search_field.clear()
        search_field.send_keys(item_name)

    def wait_for_search_results(self, item_name: str):
        xpath = (
            f"//tr[td[contains(translate(text(),"
            f"'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),"
            f"'{item_name.lower()}')]]"
        )

        for attempt in range(1, 3):
            try:
                logger.info(f"Search attempt {attempt} for '{item_name}'")

                WebDriverWait(self.driver, 5).until(
                    EC.presence_of_element_located((By.XPATH, xpath))
                )
                return

            except TimeoutException:
                logger.warning(
                    f"Search attempt {attempt} failed for '{item_name}' — retrying..."
                )
                self.search_item(item_name)

        raise AssertionError(
            f"'{item_name}' not found in inventory table after retries."
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

        search_field = WebDriverWait(self.driver, 20).until(
            EC.element_to_be_clickable(self.locators.SEARCH)
        )

        # Ensure field in view
        self.driver.execute_script(
            "arguments[0].scrollIntoView({block: 'center'});", search_field
        )

        # Try clear icon
        try:
            clear_icon = WebDriverWait(self.driver, 2).until(
                EC.visibility_of_element_located(self.locators.CLEAR_ICON)
            )
            clear_icon.click()
        except (NoSuchElementException, TimeoutException):
            logger.debug("Clear icon not available — fallback to manual clearing")

        # Defensive clear
        search_field.send_keys(Keys.CONTROL + "a")
        search_field.send_keys(Keys.DELETE)

        if search_field.get_attribute("value").strip() != "":
            search_field.clear()

        search_field.send_keys(item_name)

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
        self.send_keys(locator, value)

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
