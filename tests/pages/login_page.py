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
        self.wait = WebDriverWait(driver, 60)

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
    # Microsoft "Stay signed in?" (Optional)
    # ---------------------------------------------------

    def handle_stay_signed_in(self):
        try:
            WebDriverWait(self.driver, 5).until(
                EC.presence_of_element_located(
                    (By.XPATH, "//*[contains(text(),'Stay signed in')]")
                )
            )

            WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((By.ID, "idSIButton9"))
            ).click()

        except TimeoutException:
            pass

    # ---------------------------------------------------
    # Cold Start Handling
    # ---------------------------------------------------

    def wait_for_database_ready(self):
        """
        If warmup popup appears, wait until it disappears.
        """
        try:
            WebDriverWait(self.driver, 10).until(
                EC.visibility_of_element_located(self.locators.DATABASE_POPUP_TEXT)
            )

            WebDriverWait(self.driver, 180).until_not(
                EC.visibility_of_element_located(self.locators.DATABASE_POPUP_TEXT)
            )

        except TimeoutException:
            pass

    def wait_for_volunteer_ready(self):
        """
        Wait until volunteer dropdown is rendered & clickable.
        Only for volunteer flow.
        """
        self.wait_for_database_ready()

        self.wait.until(
            EC.visibility_of_element_located(self.locators.USER_PERSON)
        )

        self.wait.until(
            EC.element_to_be_clickable(self.locators.USER_PERSON)
        )

    # ---------------------------------------------------
    # Volunteer Selection
    # ---------------------------------------------------

    def click_person(self):
        self.wait_for_volunteer_ready()
        self.click(self.locators.USER_PERSON)

    def select_first_option(self):
        self.wait.until(
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
        try:
            return self.wait_for_visibility(self.locators.DATABASE_POPUP_TEXT)
        except TimeoutException:
            return False