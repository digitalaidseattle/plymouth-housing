from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.wait import WebDriverWait
from selenium.common.exceptions import TimeoutException

from tests.pages.base_page import BasePage
from tests.utilities.locators import HomePageLocators, CommonLocators


class HomePage(BasePage):

    def __init__(self, driver):
        super().__init__(driver)
        self.locators = HomePageLocators
        self.common_locators = CommonLocators
        self.wait = WebDriverWait(driver, 60)  # CI safe timeout

    # ---------------------------------------------------
    # Page Load Guard (Admin + Volunteer Safe)
    # ---------------------------------------------------

    def wait_for_homepage_loaded(self):
        """
        Wait until either Volunteer or Admin homepage is rendered.
        Cold-start & CI safe.
        """

        self.wait.until(
            lambda d: (
                d.find_elements(*self.locators.VOLUNTEER_HOME_HEADER)
                or d.find_elements(*self.locators.PLYMOUTH_HOUSING_TEXT)
            )
        )

        # Sidebar must exist in both roles
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
    # Volunteer Header
    # ---------------------------------------------------

    def get_header(self):
        self.wait.until(
            EC.visibility_of_element_located(
                self.locators.VOLUNTEER_HOME_HEADER
            )
        )
        return self.get_text(self.locators.VOLUNTEER_HOME_HEADER).strip()

    def verify_volunteer_home_header(self):
        actual_header = self.get_header()
        assert actual_header == "Volunteer Home", \
            f"Expected 'Volunteer Home' but got '{actual_header}'"

    # ---------------------------------------------------
    # Email
    # ---------------------------------------------------

    def get_email_id(self):
        email_el = self.wait.until(
            EC.visibility_of_element_located(self.locators.EMAIL_ID)
        )

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
    # Sidebar Navigation
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