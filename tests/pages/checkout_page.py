import time

from selenium.common import TimeoutException, NoSuchElementException, StaleElementReferenceException, \
    InvalidSelectorException
from selenium.webdriver import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from pages.base_page import BasePage
from utilities.locators import CheckoutPageLocators, CommonLocators


class CheckOutPage(BasePage):
    def __init__(self, driver):
        super().__init__(driver)
        self.locators = CheckoutPageLocators
        self.common_locators = CommonLocators

    def click_checkout(self):
        self.safe_click(self.common_locators.CHECKOUT_BUTTON, label="Checkout")

    def click_building_code(self):
        self.click(self.locators.BUILDING_CODE)

    def click_unit_number(self):
        self.click(self.locators.UNIT_NUMBER)

    def click_name_input(self):
        self.click(self.locators.NAME_INPUT)

    def click_continue_button(self):
        self.click(self.locators.CONTINUE_BUTTON)

    def select_first_unit_number(self):
        self.click(self.locators.FIRST_LIST_ITEM)

    def select_first_building_option(self):
        self.click(self.locators.FIRST_LIST_ITEM)

    def add_item(self, item_name):
        locator = self.locators.get_add_button_locator(item_name)
        try:
            WebDriverWait(self.driver, 10).until(EC.element_to_be_clickable(locator)).click()
        except StaleElementReferenceException:
            print(f"[RETRY] Stale element encountered for: {item_name}, refreshing locator.")
            locator = self.locators.get_add_button_locator(item_name)  # Re-fetch
            WebDriverWait(self.driver, 10).until(EC.element_to_be_clickable(locator)).click()
        except InvalidSelectorException as e:
            raise Exception(f"[ERROR] Invalid XPath selector for item '{item_name}': {e}")

    def items_added(self, item_name):
        """
        Returns the number of items with the specified name that have been added to the cart.

        Args:
            item_name (str): The name of the item to search for.

        Returns:
            int: Number of matching items found.
        """
        try:
            # Normalize item name for case-insensitive search
            xpath = (
                f"//tr[td[contains(translate(text(),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'), "
                f"'{item_name.lower()}')]]"
            )
            elements = self.driver.find_elements(By.XPATH, xpath)
            return len(elements)
        except TimeoutException:
            print(f"Timeout while searching for items: {item_name}")
            return 0
        except Exception as e:
            print(f"Unexpected error: {e}")
            return 0

    def click_proceed_to_checkout(self):
        self.click(self.locators.PROCEED_TO_CHECKOUT)

    def click_confirm(self):
        self.click(self.locators.CONFIRM)

    # def search_item(self, item_name):
    #     search_field = self.driver.find_element(self.locators.SEARCH)
    #     search_field.clear()
    #     search_field.send_keys(item_name)

    def wait_for_search_results(self, item_name):
        WebDriverWait(self.driver, 10).until(
            EC.text_to_be_present_in_element((By.CSS_SELECTOR, '.search-results'), item_name)
        )

    def search_item(self, item_name):
        search_field = WebDriverWait(self.driver, 20).until(
            EC.element_to_be_clickable(self.locators.SEARCH)
        )

        self.scroll_into_view(self.locators.SEARCH)
        search_field.clear()
        time.sleep(1)
        search_field.send_keys(item_name)






