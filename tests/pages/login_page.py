import time
from urllib.parse import urljoin
from selenium.common.exceptions import (
    NoSuchElementException,
    StaleElementReferenceException,
    TimeoutException,
    WebDriverException,
)
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

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
            ignored_exceptions=(
                NoSuchElementException,
                StaleElementReferenceException,
            ),
        )

    # ---------------------------------------------------
    # General helpers
    # ---------------------------------------------------

    def wait_for_login_page(self) -> None:
        WebDriverWait(
            self.driver,
            20,
        ).until(
            lambda driver: (
                "login.microsoftonline.com"
                in driver.current_url.lower()
            )
        )

    def switch_to_new_window_if_needed(
        self,
        original_windows: list[str],
    ) -> None:
        try:
            WebDriverWait(
                self.driver,
                10,
            ).until(
                lambda driver: (
                    len(driver.window_handles)
                    > len(original_windows)
                )
            )

            new_windows = [
                handle
                for handle in self.driver.window_handles
                if handle not in original_windows
            ]

            if new_windows:
                self.driver.switch_to.window(
                    new_windows[-1]
                )

        except TimeoutException:
            # Microsoft login may open in the same window.
            pass

    def save_debug_screenshot(
        self,
        filename: str,
    ) -> None:
        try:
            self.driver.save_screenshot(filename)
        except WebDriverException:
            pass

    # ---------------------------------------------------
    # Microsoft login
    # ---------------------------------------------------

    from urllib.parse import urljoin

    def click_app_login_button(self) -> None:
        wait = WebDriverWait(self.driver, 30)

        login_link = wait.until(
            EC.element_to_be_clickable(
                self.locators.APP_LOGIN_BUTTON
            )
        )

        href = login_link.get_attribute("href")

        if not href:
            raise AssertionError(
                "Log In link was found, but href is empty"
            )

        current_url = self.driver.current_url

        # First attempt: real user-like click
        try:
            login_link.click()

            WebDriverWait(
                self.driver,
                10,
            ).until(
                lambda driver: (
                        driver.current_url != current_url
                        or "login.microsoftonline.com"
                        in driver.current_url.lower()
                        or ".auth/login/aad"
                        in driver.current_url.lower()
                )
            )

            print(
                "Login navigation succeeded with real click"
            )

        except (
                TimeoutException,
                WebDriverException,
                StaleElementReferenceException,
        ):
            # Fallback: navigate directly to the link target
            login_url = urljoin(
                current_url,
                href,
            )

            print(
                "Real click did not redirect. "
                "Opening login URL directly."
            )

            self.driver.get(login_url)

        # Final verification
        WebDriverWait(
            self.driver,
            60,
        ).until(
            lambda driver: (
                    "login.microsoftonline.com"
                    in driver.current_url.lower()
                    or ".auth/login/aad"
                    in driver.current_url.lower()
                    or driver.current_url != current_url
            )
        )

        print("Microsoft login flow opened")

    def enter_username(
        self,
        username: str,
    ) -> None:
        if not username:
            raise ValueError(
                "ADMIN_USERNAME cannot be empty"
            )

        try:
            input_el = self.wait.until(
                EC.element_to_be_clickable(
                    self.locators.USERNAME_INPUT
                )
            )

            input_el.click()
            input_el.send_keys(
                Keys.CONTROL,
                "a",
            )
            input_el.send_keys(
                Keys.DELETE
            )
            input_el.send_keys(username)

            self.wait.until(
                lambda driver: (
                    driver.find_element(
                        *self.locators.USERNAME_INPUT
                    )
                    .get_attribute("value")
                    .strip()
                    != ""
                )
            )

        except TimeoutException as exc:
            self.save_debug_screenshot(
                "username_timeout.png"
            )

            raise AssertionError(
                "Username field was not available."
            ) from exc

    def click_next_button(self) -> None:
        wait = WebDriverWait(
            self.driver,
            30,
        )

        button = wait.until(
            EC.element_to_be_clickable(
                self.locators.NEXT_BUTTON
            )
        )

        try:
            button.click()
        except WebDriverException:
            self.driver.execute_script(
                "arguments[0].click();",
                button,
            )

        wait.until(
            lambda driver: (
                len(
                    driver.find_elements(
                        *self.locators.PASSWORD_INPUT
                    )
                )
                > 0
                or "login.microsoftonline.com"
                not in driver.current_url.lower()
            )
        )

    def enter_password(
        self,
        password: str,
    ) -> None:
        if not password:
            raise ValueError(
                "ADMIN_PASSWORD cannot be empty"
            )

        try:
            input_el = self.wait.until(
                EC.element_to_be_clickable(
                    self.locators.PASSWORD_INPUT
                )
            )

            input_el.click()
            input_el.send_keys(
                Keys.CONTROL,
                "a",
            )
            input_el.send_keys(
                Keys.DELETE
            )
            input_el.send_keys(password)

            self.wait.until(
                lambda driver: (
                    driver.find_element(
                        *self.locators.PASSWORD_INPUT
                    )
                    .get_attribute("value")
                    != ""
                )
            )

        except TimeoutException as exc:
            self.save_debug_screenshot(
                "password_timeout.png"
            )

            raise AssertionError(
                "Password field was not available."
            ) from exc

    def click_sign_in_button(self) -> None:
        wait = WebDriverWait(
            self.driver,
            30,
        )

        button = wait.until(
            EC.element_to_be_clickable(
                self.locators.SIGN_IN_BUTTON
            )
        )

        try:
            button.click()
        except WebDriverException:
            self.driver.execute_script(
                "arguments[0].click();",
                button,
            )

    # ---------------------------------------------------
    # Stay signed in
    # ---------------------------------------------------

    def handle_stay_signed_in(self) -> None:
        try:
            WebDriverWait(
                self.driver,
                8,
            ).until(
                EC.presence_of_element_located(
                    (
                        By.XPATH,
                        "//*[contains("
                        "normalize-space(), "
                        "'Stay signed in'"
                        ")]",
                    )
                )
            )

            button = WebDriverWait(
                self.driver,
                10,
            ).until(
                EC.element_to_be_clickable(
                    (
                        By.ID,
                        "idSIButton9",
                    )
                )
            )

            try:
                button.click()
            except WebDriverException:
                self.driver.execute_script(
                    "arguments[0].click();",
                    button,
                )

        except TimeoutException:
            # This Microsoft screen is optional.
            pass

    # ---------------------------------------------------
    # Database ready
    # ---------------------------------------------------

    def wait_for_database_ready(self) -> None:
        WebDriverWait(
            self.driver,
            30,
            poll_frequency=1,
            ignored_exceptions=(
                NoSuchElementException,
                StaleElementReferenceException,
            ),
        ).until(
            lambda driver: (
                len(
                    driver.find_elements(
                        *self.locators.DATABASE_POPUP_TEXT
                    )
                )
                == 0
            )
        )

    def is_database_popup_visible(self) -> bool:
        return self.is_visible(
            self.locators.DATABASE_POPUP_TEXT,
            timeout=3,
        )

    # ---------------------------------------------------
    # Volunteer selection
    # ---------------------------------------------------

    def wait_for_pick_your_name(self) -> None:
        wait = WebDriverWait(
            self.driver,
            60,
            poll_frequency=1,
            ignored_exceptions=(
                NoSuchElementException,
                StaleElementReferenceException,
                WebDriverException,
            ),
        )

        wait.until(
            lambda driver: (
                "/pick-your-name"
                in driver.current_url.lower()
                and len(
                    driver.find_elements(
                        *self.locators.USER_PERSON
                    )
                )
                > 0
            )
        )

    def select_volunteer(
        self,
        name: str,
    ) -> None:
        if not name or not name.strip():
            raise ValueError(
                "VOLUNTEER_DISPLAY_NAME cannot be empty"
            )

        expected_name = name.strip()

        print("Selecting configured volunteer")

        try:
            input_el = WebDriverWait(
                self.driver,
                self.LOGIN_WAIT_TIMEOUT,
                poll_frequency=1,
                ignored_exceptions=(
                    NoSuchElementException,
                    StaleElementReferenceException,
                ),
            ).until(
                EC.element_to_be_clickable(
                    self.locators.USER_PERSON
                )
            )

            input_el.click()
            input_el.send_keys(
                Keys.CONTROL,
                "a",
            )
            input_el.send_keys(
                Keys.DELETE
            )

            search_text = expected_name[:3]
            input_el.send_keys(search_text)

            self.wait.until(
                lambda driver: (
                    driver.find_element(
                        *self.locators.USER_PERSON
                    )
                    .get_attribute("aria-expanded")
                    == "true"
                )
            )

            self.wait.until(
                lambda driver: (
                    len(
                        driver.find_elements(
                            *self.locators.NAME_OPTIONS
                        )
                    )
                    > 0
                )
            )

            options = self.driver.find_elements(
                *self.locators.NAME_OPTIONS
            )

            visible_options = [
                option
                for option in options
                if option.is_displayed()
                and option.text.strip()
            ]

            exact_match = next(
                (
                    option
                    for option in visible_options
                    if option.text.strip().lower()
                    == expected_name.lower()
                ),
                None,
            )

            partial_match = next(
                (
                    option
                    for option in visible_options
                    if expected_name.lower()
                    in option.text.strip().lower()
                ),
                None,
            )

            option = exact_match or partial_match

            if option is None:
                raise AssertionError(
                    "Configured volunteer option was not found "
                    "in the visible autocomplete results."
                )

            try:
                option.click()
            except (
                WebDriverException,
                StaleElementReferenceException,
            ):
                self.driver.execute_script(
                    "arguments[0].click();",
                    option,
                )

            selected_input = self.wait.until(
                EC.presence_of_element_located(
                    self.locators.USER_PERSON
                )
            )

            self.driver.execute_script(
                "arguments[0].blur();",
                selected_input,
            )

            self.wait.until(
                lambda driver: (
                    expected_name.lower()
                    in (
                        driver.find_element(
                            *self.locators.USER_PERSON
                        )
                        .get_attribute("value")
                        or ""
                    ).lower()
                )
            )

        except TimeoutException as exc:
            self.save_debug_screenshot(
                "volunteer_selection_timeout.png"
            )

            raise AssertionError(
                "Timed out while selecting the configured volunteer."
            ) from exc

        print(
            "Volunteer selected successfully"
        )

    def click_continue_button(self) -> None:
        button = self.wait.until(
            EC.element_to_be_clickable(
                self.locators.CONTINUE_BUTTON
            )
        )

        try:
            button.click()
        except WebDriverException:
            self.driver.execute_script(
                "arguments[0].click();",
                button,
            )

    # ---------------------------------------------------
    # PIN
    # ---------------------------------------------------

    def enter_pin(
        self,
        pin: str,
    ) -> None:
        if (
            not pin
            or len(pin) != 4
            or not pin.isdigit()
        ):
            raise ValueError(
                "VOLUNTEER_PIN must contain "
                "exactly 4 digits"
            )

        fields = [
            self.locators.INPUT_FIELD_1,
            self.locators.INPUT_FIELD_2,
            self.locators.INPUT_FIELD_3,
            self.locators.INPUT_FIELD_4,
        ]

        for locator, digit in zip(
            fields,
            pin,
        ):
            field = self.wait.until(
                EC.element_to_be_clickable(
                    locator
                )
            )

            field.click()
            field.send_keys(digit)

    # ---------------------------------------------------
    # Optional compatibility helper
    # ---------------------------------------------------

    def click_person(
        self,
        name: str,
    ) -> None:
        self.select_volunteer(name)