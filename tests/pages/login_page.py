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

    def __init__(self, driver):
        super().__init__(driver)
        self.locators = LoginPageLocators

        self.wait = WebDriverWait(
            driver,
            timeout=60,
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

    def wait_for_volunteer_ready(self):
        print("Waiting for volunteer field to be ready...")

        # 1. Ensure the input is visible
        input_field = self.wait.until(
            EC.visibility_of_element_located(LoginPageLocators.USER_PERSON)
        )

        # 2. aria-expanded should be false → dropdown is closed and stable
        self.wait.until(lambda d: input_field.get_attribute("aria-expanded") in ["false", None])

        # 3. small stabilization delay (very important for your app)
        time.sleep(1)

        # 4. re-locate the element (React re-render fix)
        input_field = self.driver.find_element(*LoginPageLocators.USER_PERSON)

        # 5. use safe condition instead of clickable
        self.wait.until(
            lambda d: (
                          el := d.find_element(*LoginPageLocators.USER_PERSON)
                      ).get_attribute("aria-expanded") in ["false", None]
        )

        print("Volunteer field is ready")

    # ---------------------------------------------------
    # Application Readiness
    # ---------------------------------------------------

    def wait_for_full_app_ready(self):
        WebDriverWait(self.driver, 60).until(
            lambda d: (
                "Loading, please wait" not in d.page_source
                and len(d.find_elements(*self.locators.DATABASE_POPUP_TEXT)) == 0
            )
        )

    # ---------------------------------------------------
    # Volunteer Selection (Autocomplete)
    # ---------------------------------------------------

    def select_volunteer(self, name="John Doe 1234"):
        input_el = self.wait.until(
            EC.visibility_of_element_located(self.locators.USER_PERSON)
        )

        self.wait.until(lambda d: input_el.is_enabled())

        input_el.click()
        input_el.clear()

        # Trigger dropdown
        input_el.send_keys(name[:2])

        # Wait for the matching option
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

        # Click option (JS safer)
        self.driver.execute_script("arguments[0].click();", option)

        # RE-FIND input after selection (CRITICAL FIX)
        input_el = self.wait.until(
            EC.presence_of_element_located(self.locators.USER_PERSON)
        )

        # Blur fresh element
        self.driver.execute_script("arguments[0].blur();", input_el)

        # Verify selection using fresh lookup (NO stale risk)
        self.wait.until(
            lambda d: name.lower() in d.find_element(
                *self.locators.USER_PERSON
            ).get_attribute("value").lower()
        )

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