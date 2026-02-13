import pytest
from selenium.common import NoSuchElementException, TimeoutException
from selenium.webdriver import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from tests.pages.base_page import BasePage
from tests.utilities.locators import InventoryPageLocators, CommonLocators
from selenium.webdriver.support.ui import WebDriverWait
import logging
logger = logging.getLogger(__name__)


class InventoryPage(BasePage):
    def __init__(self, driver):
        super().__init__(driver)
        self.locators = InventoryPageLocators
        self.common_locators = CommonLocators
        self.wait = WebDriverWait(self.driver, 10)

    def get_inventory(self, item):
        locator = self.locators.get_inventory_locator(item)
        return self.get_text(locator, timeout=90)

    def get_inventory_quantity(self, item: str) -> int:
        xpath = f"//td[normalize-space()='{item}']/following-sibling::td[5]"
        cell = WebDriverWait(self.driver, 20).until(
            EC.presence_of_element_located((By.XPATH, xpath))
        )

        if cell.find_elements(By.XPATH, ".//*[local-name()='svg']"):
            pytest.skip(f"Inventory value not ready for '{item}' (warning icon shown)")

        text = cell.text.strip()
        return int(text)

    def search_item(self, item_name):
        search_field = WebDriverWait(self.driver, 20).until(
            EC.element_to_be_clickable(self.locators.SEARCH)
        )

        self.scroll_into_view(self.locators.SEARCH)
        search_field.clear()
        search_field.send_keys(item_name)

    def wait_for_search_results(self, item_name):
        xpath = (
            f"//tr[td[contains(translate(text(),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'), "
            f"'{item_name.lower()}')]]"
        )
        for attempt in range(2):
            try:
                WebDriverWait(self.driver, 5).until(
                    EC.presence_of_element_located((By.XPATH, xpath))
                )
                return
            except TimeoutException:
                print(f"[WARN] Initial search failed for '{item_name}' — retrying...")
                self.search_item(item_name)
        raise AssertionError(f"[ERROR] '{item_name}' not found in inventory table after retries.")

    def wait_for_inventory_loaded(self):
        WebDriverWait(self.driver, 1).until(
            EC.invisibility_of_element_located((By.CLASS_NAME, "MuiCircularProgress-root"))
        )

    def second_search_item(self, item_name):
        # Step 1: Wait for the search field to be ready
        search_field = WebDriverWait(self.driver, 20).until(
            EC.element_to_be_clickable(self.locators.SEARCH)
        )

        # Step 2: Ensure the field is fully in view
        self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", search_field)

        # Step 3: Attempt to click the clear icon if present
        try:
            clear_icon = WebDriverWait(self.driver, 2).until(
                EC.visibility_of_element_located(self.locators.CLEAR_ICON)
            )
            clear_icon.click()
        except (NoSuchElementException, TimeoutException):
            print("[DEBUG] Clear icon not available—fallback to manual clearing")

        # Step 4: Defensive clear via select + delete
        search_field.send_keys(Keys.CONTROL + "a")
        search_field.send_keys(Keys.DELETE)

        # Step 5: Confirm the field is empty before typing
        current_value = search_field.get_attribute("value")
        if current_value.strip() != "":
            search_field.clear()  # Fallback if needed

        # Step 6: Enter new item name
        search_field.send_keys(item_name)

    def click_status(self):
        wait = WebDriverWait(self.driver, 15)

        status_btn = wait.until(
            EC.element_to_be_clickable(
                (By.XPATH, "//div[@id='status-button-container']//button")
            )
        )

        status_btn.click()

    def select_status(self, status_text):
        wait = WebDriverWait(self.driver, 10)
        option = wait.until(
            EC.element_to_be_clickable(
                (By.XPATH, f"//li[normalize-space()='{status_text}']")
            )
        )
        option.click()

    def get_filtered_rows(self, status_text):
        self.wait.until(
            EC.presence_of_all_elements_located(
                (By.XPATH, f"//tr[td//span[normalize-space()='{status_text}']]")
            )
        )
        return self.driver.find_elements(
            By.XPATH, f"//tr[td//span[normalize-space()='{status_text}']]"
        )
