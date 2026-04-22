import time

from selenium.webdriver import ActionChains
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.common.by import By

from selenium.common.exceptions import (
    TimeoutException,
    NoSuchElementException,
    StaleElementReferenceException
)

from tests.pages.base_page import BasePage
from tests.utilities.locators import LoginPageLocators


class LoginPage(BasePage):
    LOGIN_WAIT_TIMEOUT = 240

    def __init__(self, driver):
        super().__init__(driver)
        self.locators = LoginPageLocators

        self.wait = WebDriverWait(
            driver,
            timeout=120,  #  increased from 60 → 120 (cold start safe)
            poll_frequency=1,
            ignored_exceptions=[
                NoSuchElementException,
                StaleElementReferenceException
            ]
        )

    # ---------------------------------------------------
    # Microsoft Login
    # ---------------------------------------------------

    def enter_username(self, username):
        self.send_keys(self.locators.USERNAME_INPUT, username)

    def enter_password(self, password):
        self.send_keys(self.locators.PASSWORD_INPUT, password)

    def click_next_button(self):
        self.click(self.locators.NEXT_BUTTON)

    def click_sign_in_button(self):
        self.click(self.locators.SIGN_IN_BUTTON)

    # ---------------------------------------------------
    # Stay Signed In
    # ---------------------------------------------------

    def handle_stay_signed_in(self):
        try:
            WebDriverWait(self.driver, 5).until(
                EC.presence_of_element_located(
                    (By.XPATH, "//*[contains(text(),'Stay signed in')]")
                )
            )
            self.click((By.ID, "idSIButton9"))

        except TimeoutException:
            pass

    # ---------------------------------------------------
    # Database Ready
    # ---------------------------------------------------

    def wait_for_database_ready(self):
        print("Checking for database warmup popup...")

        WebDriverWait(self.driver, 15).until(
            lambda d: len(d.find_elements(*self.locators.DATABASE_POPUP_TEXT)) == 0
        )

        print("Database is ready")

    # ---------------------------------------------------
    # Volunteer Selection (STABLE VERSION)
    # ---------------------------------------------------

    def select_volunteer(self, name="John Doe 1234"):
        print("Waiting for volunteer field...")

        #  cold start safe wait (API can be very slow)
        WebDriverWait(self.driver, LoginPage.LOGIN_WAIT_TIMEOUT, poll_frequency=1).until(
            lambda d: d.find_element(*self.locators.USER_PERSON).is_enabled()
        )

        # Always re-locate (React safe)
        input_el = self.wait.until(
            EC.visibility_of_element_located(self.locators.USER_PERSON)
        )

        input_el.click()
        input_el.clear()

        # Trigger dropdown
        input_el.send_keys(name[:2])

        # Wait for matching option
        option = self.wait.until(
            lambda d: next(
                (
                    el for el in d.find_elements(*self.locators.NAME_OPTIONS)
                    if el.is_displayed()
                    and el.text.strip()
                    and name.lower() in el.text.lower()
                ),
                False
            )
        )

        # JS click (overlay safe)
        self.driver.execute_script("arguments[0].click();", option)

        #  Re-find after React update
        input_el = self.wait.until(
            EC.presence_of_element_located(self.locators.USER_PERSON)
        )

        # Blur to commit value
        self.driver.execute_script("arguments[0].blur();", input_el)

        # Verify selection
        self.wait.until(
            lambda d: name.lower() in d.find_element(
                *self.locators.USER_PERSON
            ).get_attribute("value").lower()
        )

        print("Volunteer selected successfully")

    def click_continue_button(self):
        btn = self.wait.until(
            EC.element_to_be_clickable(self.locators.CONTINUE_BUTTON)
        )
        btn.click()

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
        return self.is_visible(self.locators.DATABASE_POPUP_TEXT, timeout=3)

    def click_person(self):
        self.select_volunteer()