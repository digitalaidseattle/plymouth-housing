from pages.base_page import BasePage
from utilities.locators import CheckoutPageLocators, CommonLocators


class CheckOutPage(BasePage):
    def __init__(self, driver):
        super().__init__(driver)
        self.locators = CheckoutPageLocators
        self.common_locators = CommonLocators

    def click_checkout(self):
            self.scroll_into_view(self.common_locators.CHECKOUT_BUTTON)
            self.wait_for_clickable(self.common_locators.CHECKOUT_BUTTON)
            self.click(self.common_locators.CHECKOUT_BUTTON)

    def click_building_code(self):
        self.click(self.locators.BUILDING_CODE)

    def select_first_building_option(self):
        self.click(self.locators.FIRST_BUILDING)

    def add_item(self, item_name):  # TODO: ADD SCROLL
        locator = self.locators.get_add_button_locator(item_name)
        self.click(locator)

    def click_proceed_to_checkout(self):
        self.click(self.locators.PROCEED_TO_CHECKOUT)

    def click_confirm(self):
        self.click(self.locators.CONFIRM)






