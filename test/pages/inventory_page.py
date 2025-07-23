from pages.base_page import BasePage
from utilities.locators import InventoryPageLocators, CommonLocators

class InventoryPage(BasePage):  # ✅ Inherits correctly now
    def __init__(self, driver):
        super().__init__(driver)
        self.locators = InventoryPageLocators
        self.common_locators = CommonLocators

    def get_inventory(self, item):
        locator = self.locators.get_inventory_locator(item)
        return self.get_text(locator, timeout=90)


