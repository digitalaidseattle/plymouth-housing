import time

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
            timeout=120,
            poll_frequency=1,
            ignored_exceptions=[
                NoSuchElementException,
                StaleElementReferenceException
            ]
        )

    # ---------------------------------------------------
    # Helpers
    # ---------------------------------------------------

    def wait_for_login_page(self):
        WebDriverWait(self.driver, 20).until(
            lambda d: "login.microsoftonline.com" in d.current_url.lower()
        )

    # ---------------------------------------------------
    # Microsoft Login
    # ---------------------------------------------------

    def enter_username(self, username):
        input_el = self.wait.until(
            EC.visibility_of_element_located(self.locators.USERNAME_INPUT)
        )

        input_el.clear()
        input_el.send_keys(username)

        # ensure value typed
        self.wait.until(lambda d: input_el.get_attribute("value") != "")

    def click_next_button(self):
        wait = WebDriverWait(self.driver, 20)

        button = wait.until(
            EC.presence_of_element_located(self.locators.NEXT_BUTTON)
        )

        # wait until enabled
        wait.until(lambda d: button.is_enabled())

        # JS click (Azure safe)
        self.driver.execute_script("arguments[0].click();", button)

        # wait for next screen (password OR redirect)
        WebDriverWait(self.driver, 20).until(
            lambda d: (
                len(d.find_elements(*self.locators.PASSWORD_INPUT)) > 0
                or "login" not in d.current_url.lower()
            )
        )

    def enter_password(self, password):
        input_el = self.wait.until(
            EC.visibility_of_element_located(self.locators.PASSWORD_INPUT)
        )

        input_el.clear()
        input_el.send_keys(password)

        self.wait.until(lambda d: input_el.get_attribute("value") != "")

    def click_sign_in_button(self):
        wait = WebDriverWait(self.driver, 20)

        button = wait.until(
            EC.presence_of_element_located(self.locators.SIGN_IN_BUTTON)
        )

        wait.until(lambda d: button.is_enabled())

        self.driver.execute_script("arguments[0].click();", button)

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

            btn = self.driver.find_element(By.ID, "idSIButton9")
            self.driver.execute_script("arguments[0].click();", btn)

        except TimeoutException:
            pass

    # ---------------------------------------------------
    # Database Ready
    # ---------------------------------------------------

    def wait_for_database_ready(self):
        WebDriverWait(self.driver, 15).until(
            lambda d: len(d.find_elements(*self.locators.DATABASE_POPUP_TEXT)) == 0
        )

    # ---------------------------------------------------
    # Volunteer Selection (FULLY STABLE)
    # ---------------------------------------------------

    def select_volunteer(self, name="John Doe 1234"):
        print("Waiting for volunteer field...")

        input_el = WebDriverWait(self.driver, LoginPage.LOGIN_WAIT_TIMEOUT).until(
            EC.presence_of_element_located(self.locators.USER_PERSON)
        )

        input_el = self.wait.until(
            EC.element_to_be_clickable(self.locators.USER_PERSON)
        )

        input_el.click()
        input_el.clear()

        input_el.send_keys(name[:3])

        # dropdown opened
        self.wait.until(
            lambda d: input_el.get_attribute("aria-expanded") == "true"
        )

        # options loaded
        self.wait.until(
            lambda d: len(d.find_elements(*self.locators.NAME_OPTIONS)) > 0
        )

        options = self.driver.find_elements(*self.locators.NAME_OPTIONS)

        option = next(
            (
                el for el in options
                if el.is_displayed()
                and el.text.strip()
                and name.lower() in el.text.lower()
            ),
            None
        )

        if not option:
            raise Exception(f"Volunteer option not found: {name}")

        self.driver.execute_script("arguments[0].click();", option)

        input_el = self.wait.until(
            EC.presence_of_element_located(self.locators.USER_PERSON)
        )

        self.driver.execute_script("arguments[0].blur();", input_el)

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