from asyncio import timeout

from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait
from pages.base_page import BasePage
from utilities.locators import HomePageLocators


class HomePage(BasePage):
    def __init__(self, driver):
        super().__init__(driver)
        self.driver = driver
        self.locators = HomePageLocators

    def click_email_id(self):
       self.click(self.locators.EMAIL_ID)

    def click_logout(self):
        self.click(self.locators.LOGOUT_BUTTON)

    def get_menu_home_text(self):
        return self.get_text(self.locators.ADMIN_HOME_MENU_BUTTON)

    def get_plymouth_housing_text(self):
        return self.get_text(self.locators.PLYMOUTH_HOUSING_TEXT)

    def get_header(self):
        return self.get_text(self.locators.ADMIN_HOME_HEADER)

    def get_date(self):
        return self.get_text(self.locators.DATE, timeout=90)

    def get_email_id(self):
        return self.get_text(self.locators.EMAIL_ID)




