from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.wait import WebDriverWait

from tests.pages.base_page import BasePage
from tests.utilities.locators import HomePageLocators, CommonLocators


class HomePage(BasePage):

    def __init__(self, driver):
        super().__init__(driver)
        self.locators = HomePageLocators
        self.common_locators = CommonLocators
        self.wait = WebDriverWait(driver, 15)

    # Common / Admin Methods
    def get_menu_home_text(self):
        return self.get_text(self.locators.ADMIN_HOME_MENU_BUTTON).strip()

    def get_plymouth_housing_text(self):
        return self.get_text(self.locators.PLYMOUTH_HOUSING_TEXT).strip()

    # Volunteer Header & Info
    def get_header(self):
        return self.get_text(self.locators.VOLUNTEER_HOME_HEADER, timeout=20).strip()

    def verify_volunteer_home_header(self):
        expected_header = "Volunteer Home"

        assert self.is_visible(
            self.locators.VOLUNTEER_HOME_HEADER, timeout=20
        ), "Volunteer Home header not visible"

        actual_header = self.get_header()

        assert actual_header == expected_header, \
            f"Expected '{expected_header}' but got '{actual_header}'"

    def get_email_id(self):
        email_el = self.wait.until(
            EC.visibility_of_element_located(self.locators.EMAIL_ID)
        )

        self.wait.until(
            lambda _d: email_el.text and email_el.text.strip().lower() != "null"
        )

        return email_el.text.strip()

    # Logout
    def click_email_id(self):
        self.click(self.locators.EMAIL_ID)

    def click_logout(self):
        self.click(self.locators.LOGOUT_BUTTON)

    def logout(self):
        self.click_email_id()
        self.click_logout()

    # Sidebar Navigation (Checkout Menu)
    def go_to_checkout_general(self):
        self.click(self.common_locators.CHECKOUT_MENU_BUTTON)
        self.click(self.common_locators.GENERAL_MENU_BUTTON)

    def go_to_checkout_welcome(self):
        self.click(self.common_locators.CHECKOUT_MENU_BUTTON)
        self.click(self.common_locators.WELCOME_MENU_BUTTON)

    # Volunteer Home CTA Navigation (Dashboard)
    def click_checkout_general_inventory(self):
        self.wait.until(
            EC.element_to_be_clickable(
                self.locators.CHECKOUT_GENERAL_INVENTORY
            )
        ).click()

    def is_stock_general_inventory_visible(self):
        return self.is_visible(
            self.locators.STOCK_GENERAL_INVENTORY
        )

    # Volunteer Section Visibility
    def verify_checkout_section(self):
        assert self.is_visible(
            self.locators.CHECKOUT_SECTION
        ), "Checkout section not visible"

    def verify_stock_section(self):
        assert self.is_visible(
            self.locators.STOCK_SECTION
        ), "Stock section not visible"