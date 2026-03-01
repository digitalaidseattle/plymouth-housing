from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.common.by import By

from tests.pages.base_page import BasePage
from tests.utilities.locators import HomePageLocators, CommonLocators


class HomePage(BasePage):

    def __init__(self, driver):
        super().__init__(driver)
        self.locators = HomePageLocators
        self.common_locators = CommonLocators
        self.wait = WebDriverWait(driver, 20)

    # ---------------------------------------------------
    # Page Load Guard
    # ---------------------------------------------------

    def wait_for_homepage_loaded(self):
        """
        Ensure Volunteer Home page is fully rendered.
        """
        self.wait.until(
            EC.visibility_of_element_located(
                self.locators.VOLUNTEER_HOME_HEADER
            )
        )

        # Ensure sidebar loaded
        self.wait.until(
            EC.visibility_of_element_located(
                self.common_locators.CHECKOUT_MENU_BUTTON
            )
        )

    # ---------------------------------------------------
    # Common / Admin Methods
    # ---------------------------------------------------

    def get_menu_home_text(self):
        self.wait.until(
            EC.visibility_of_element_located(
                self.locators.ADMIN_HOME_MENU_BUTTON
            )
        )
        return self.get_text(self.locators.ADMIN_HOME_MENU_BUTTON).strip()

    def get_plymouth_housing_text(self):
        self.wait.until(
            EC.visibility_of_element_located(
                self.locators.PLYMOUTH_HOUSING_TEXT
            )
        )
        return self.get_text(self.locators.PLYMOUTH_HOUSING_TEXT).strip()

    # ---------------------------------------------------
    # Volunteer Header & Info
    # ---------------------------------------------------

    def get_header(self):
        self.wait.until(
            EC.visibility_of_element_located(
                self.locators.VOLUNTEER_HOME_HEADER
            )
        )
        return self.get_text(self.locators.VOLUNTEER_HOME_HEADER).strip()

    def verify_volunteer_home_header(self):
        expected_header = "Volunteer Home"
        actual_header = self.get_header()

        assert actual_header == expected_header, \
            f"Expected '{expected_header}' but got '{actual_header}'"

    def get_email_id(self):
        email_el = self.wait.until(
            EC.visibility_of_element_located(self.locators.EMAIL_ID)
        )

        # Prevent race condition where email renders as "null"
        self.wait.until(
            lambda d: email_el.text and email_el.text.strip().lower() != "null"
        )

        return email_el.text.strip()

    # ---------------------------------------------------
    # Logout
    # ---------------------------------------------------

    def click_email_id(self):
        self.wait.until(
            EC.element_to_be_clickable(self.locators.EMAIL_ID)
        ).click()

    def click_logout(self):
        self.wait.until(
            EC.element_to_be_clickable(self.locators.LOGOUT_BUTTON)
        ).click()

    def logout(self):
        self.click_email_id()
        self.click_logout()

    # ---------------------------------------------------
    # Sidebar Navigation (Checkout Menu)
    # ---------------------------------------------------

    def go_to_checkout_general(self):
        self.wait.until(
            EC.element_to_be_clickable(
                self.common_locators.CHECKOUT_MENU_BUTTON
            )
        ).click()

        self.wait.until(
            EC.element_to_be_clickable(
                self.common_locators.GENERAL_MENU_BUTTON
            )
        ).click()

    def go_to_checkout_welcome(self):
        self.wait.until(
            EC.element_to_be_clickable(
                self.common_locators.CHECKOUT_MENU_BUTTON
            )
        ).click()

        self.wait.until(
            EC.element_to_be_clickable(
                self.common_locators.WELCOME_MENU_BUTTON
            )
        ).click()

    # ---------------------------------------------------
    # Volunteer Dashboard CTA
    # ---------------------------------------------------

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

    # ---------------------------------------------------
    # Section Visibility
    # ---------------------------------------------------

    def verify_checkout_section(self):
        assert self.is_visible(
            self.locators.CHECKOUT_SECTION
        ), "Checkout section not visible"

    def verify_stock_section(self):
        assert self.is_visible(
            self.locators.STOCK_SECTION
        ), "Stock section not visible"