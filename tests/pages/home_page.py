from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.wait import WebDriverWait

from tests.pages.base_page import BasePage
from tests.utilities.locators import HomePageLocators, CommonLocators


class HomePage(BasePage):
    def __init__(self, driver):
        super().__init__(driver)
        self.locators = HomePageLocators
        self.wait = WebDriverWait(driver, 15)
        self.common_locators = CommonLocators

    def click_email_id(self):
       self.click(self.locators.EMAIL_ID)

    def click_logout(self):
        self.click(self.locators.LOGOUT_BUTTON)

    def get_menu_home_text(self):
        return self.get_text(self.locators.ADMIN_HOME_MENU_BUTTON)

    def get_plymouth_housing_text(self):
        return self.get_text(self.locators.PLYMOUTH_HOUSING_TEXT)

    def get_header(self):
        return self.get_text(self.locators.VOLUNTEER_HOME_HEADER, timeout=20).strip()

    def get_date(self):
        return self.get_text(self.locators.DATE, timeout=90)

    def get_email_id(self):
        email_el = self.wait.until(EC.visibility_of_element_located(self.locators.EMAIL_ID))
        self.wait.until(lambda _d: email_el.text and email_el.text.strip().lower() != "null")
        return email_el.text.strip()

    def verify_volunteer_home_header(self):
        expected_header = "Volunteer Home"

        assert self.is_visible(
            self.locators.VOLUNTEER_HOME_HEADER, timeout=20
        ), "Volunteer Home header not visible"

        actual_header = self.get_header().strip()
        assert actual_header == expected_header

    def go_to_checkout(self, flow="general"):

        # open checkout group
        self.click(self.common_locators.CHECKOUT_MENU_BUTTON)

        if flow == "general":
            self.click(self.common_locators.GENERAL_MENU_BUTTON)
        elif flow == "welcome":
            self.click(self.common_locators.WELCOME_MENU_BUTTON)
        else:
            raise ValueError("Invalid checkout flow")







