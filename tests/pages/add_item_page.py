from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support.wait import WebDriverWait
from tests.pages.base_page import BasePage
from tests.utilities.locators import CheckoutPageLocators, CommonLocators, InventoryPageLocators


class AddItemPage(BasePage):
    def __init__(self, driver):
        super().__init__(driver)
        self.locators = InventoryPageLocators
        self.common_locators = CommonLocators

    def click_inventory_type(self):
        self.click(self.locators.INVENTORY_TYPE)

    def select_general_option(self):
        self.click(self.locators.SELECT_GENERAL)

    def select_welcome_basket_option(self):
        self.click(self.locators.SELECT_WELCOME_BASKET)

    def click_add_item(self):
        self.click(self.locators.ITEM_NAME)

    def select_add_item(self, value):
        # Click the dropdown to open the list
        self.click(self.locators.ITEM_NAME)

        # Wait for the dropdown options container to appear
        WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "MuiAutocomplete-popper"))
        )

        # Build the locator for the specific item
        locator = self.locators.get_input_by_value(value)
        print(f"[INFO] Waiting to select dropdown item: {value}")

        # Wait for the item to be clickable and click it
        self.wait_for_clickable(locator, timeout=20)
        self.click(locator)

    def click_quantity(self):
        self.click(self.locators.QUANTITY)

    def click_add_button(self):
        self.click(self.locators.ADD_BUTTON)

    def click_cancel_button(self):
        self.click(self.locators.CANCEL)