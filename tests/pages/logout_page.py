from tests.pages.base_page import BasePage
from tests.utilities.locators import LogoutPageLocators


class LogoutPage(BasePage):
    def __init__(self, driver):
        super().__init__(driver)
        self.driver = driver
        self.locators = LogoutPageLocators

    def get_logout_message(self):
        self.wait_for_visibility(self.locators.AFTER_LOGOUT_MESSAGE)
        return self.find(self.locators.AFTER_LOGOUT_MESSAGE).text
