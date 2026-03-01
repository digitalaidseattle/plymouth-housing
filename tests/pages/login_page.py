from selenium.common import StaleElementReferenceException, TimeoutException
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.common.by import By

from tests.pages.base_page import BasePage
from tests.utilities.locators import LoginPageLocators


class LoginPage(BasePage):
    def __init__(self, driver):
        super().__init__(driver)
        self.driver = driver
        self.locators = LoginPageLocators

    # ---------------------------------------------------
    # Basic Microsoft Login
    # ---------------------------------------------------

    def enter_username(self, username):
        self.send_keys(self.locators.USERNAME_INPUT, username)

    def enter_password(self, password):
        self.send_keys(self.locators.PASSWORD_INPUT, password)

    def click_next_button(self):
        self.click(self.locators.NEXT_BUTTON)

    def click_sign_in_button(self):
        for _ in range(3):
            try:
                self.click(self.locators.SIGN_IN_BUTTON)
                return
            except StaleElementReferenceException:
                continue
        raise Exception("Failed to click the sign-in button due to stale element.")

    # ---------------------------------------------------
    # Handle Microsoft "Stay signed in?" (Optional)
    # ---------------------------------------------------

    def handle_stay_signed_in(self):
        """
        Clicks 'Yes' on the 'Stay signed in?' prompt if it appears.
        Continues silently if it does not.
        """
        try:
            # Ensure we are actually on the Stay Signed In screen
            WebDriverWait(self.driver, 5).until(
                EC.presence_of_element_located(
                    (By.XPATH, "//*[contains(text(),'Stay signed in')]")
                )
            )

            # Click Yes
            WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((By.ID, "idSIButton9"))
            ).click()

        except TimeoutException:
            # Prompt did not appear — continue normally
            pass

    # ---------------------------------------------------
    # Pick Your Name (Async Stabilized)
    # ---------------------------------------------------

    def wait_for_name_dropdown_ready(self):
        """
        Wait until:
        1. Dropdown input is visible
        2. 'Loading...' disappears
        """
        WebDriverWait(self.driver, 60).until(
            EC.visibility_of_element_located(self.locators.USER_PERSON)
        )

        WebDriverWait(self.driver, 60).until(
            lambda d: "Loading..." not in d.page_source
        )

    def click_person(self):
        self.wait_for_name_dropdown_ready()

        WebDriverWait(self.driver, 30).until(
            EC.element_to_be_clickable(self.locators.USER_PERSON)
        ).click()

    def select_first_option(self):
        WebDriverWait(self.driver, 60).until(
            EC.visibility_of_element_located(self.locators.FIRST_OPTION)
        )
        self.click(self.locators.FIRST_OPTION)

    def click_continue_button(self):
        self.click(self.locators.CONTINUE_BUTTON)

    # ---------------------------------------------------
    # PIN
    # ---------------------------------------------------

    def enter_pin(self):
        self.send_keys(self.locators.INPUT_FIELD_1, "1")
        self.send_keys(self.locators.INPUT_FIELD_2, "2")
        self.send_keys(self.locators.INPUT_FIELD_3, "3")
        self.send_keys(self.locators.INPUT_FIELD_4, "4")

    # ---------------------------------------------------
    # Helpers
    # ---------------------------------------------------

    def is_database_popup_visible(self):
        return self.wait_for_visibility(self.locators.DATABASE_POPUP_TEXT)