from selenium.common.exceptions import (
    TimeoutException,
    NoSuchElementException,
    StaleElementReferenceException
)
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from tests.pages.base_page import BasePage
from tests.utilities.locators import CheckoutPageLocators, CommonLocators
from selenium.webdriver.common.keys import Keys

class CheckOutPage(BasePage):

    def __init__(self, driver):
        super().__init__(driver)
        self.locators = CheckoutPageLocators
        self.common_locators = CommonLocators

    # ---------------------------------------------------
    # Navigation
    # ---------------------------------------------------

    def click_checkout(self, flow="general"):
        self.click(self.common_locators.CHECKOUT_MENU_BUTTON)

        if flow == "general":
            self.click(self.common_locators.GENERAL_MENU_BUTTON)
        elif flow == "welcome":
            self.click(self.common_locators.WELCOME_MENU_BUTTON)
        else:
            raise ValueError("Invalid checkout flow")

        self.wait_for_visibility(self.locators.CHECKOUT_INFO_TEXT, timeout=15)

    # ---------------------------------------------------
    # Stable click helpers
    # ---------------------------------------------------

    def click_plus_button(self, item_name):
        wait = self.get_wait(15)
        locator = self.locators.get_add_button_locator(item_name)

        for _ in range(3):
            try:
                btn = wait.until(lambda d: d.find_element(*locator))
                self.driver.execute_script(
                    "arguments[0].scrollIntoView({block:'center'});", btn
                )
                self.driver.execute_script("arguments[0].click();", btn)
                return
            except StaleElementReferenceException:
                self.wait(0.5)

        raise Exception(f"❌ Could not click plus button for {item_name}")

    def click_minus_button(self, item_name):
        wait = self.get_wait(15)
        locator = self.locators.get_minus_button_locator(item_name)

        for _ in range(3):
            try:
                btn = wait.until(lambda d: d.find_element(*locator))
                self.driver.execute_script("arguments[0].click();", btn)
                return
            except StaleElementReferenceException:
                self.wait(0.5)

        raise Exception(f"❌ Could not click minus button for {item_name}")

    # ---------------------------------------------------
    # Quantity (FINAL - deterministic)
    # ---------------------------------------------------

    def increase_quantity(self, amount, item_name):
        for _ in range(amount):
            self.click_plus_button(item_name)
            self.wait(0.3)

    def decrease_quantity(self, amount, item_name):
        for _ in range(amount):
            self.click_minus_button(item_name)
            self.wait(0.3)

    # ---------------------------------------------------
    # Dropdowns
    # ---------------------------------------------------

    def select_first_building_option(self):
        for attempt in range(2):
            try:
                self.click(self.locators.BUILDING_CODE)

                options = self.get_wait(10).until(
                    lambda d: [
                        el for el in d.find_elements(*self.locators.BUILDING_OPTIONS)
                        if el.is_displayed() and el.text.strip()
                    ]
                )

                if options:
                    self.driver.execute_script("arguments[0].click();", options[0])
                    return

            except TimeoutException:
                print(f"⚠️ Building load failed (attempt {attempt + 1})")

            if attempt == 0:
                self.driver.refresh()

        raise Exception("❌ Building selection failed")

    def select_first_unit_number(self):
        self.select_from_autocomplete(
            self.locators.UNIT_NUMBER,
            self.locators.UNIT_OPTIONS
        )

    # ---------------------------------------------------
    # Form actions
    # ---------------------------------------------------

    def click_continue_button(self):
        wait = self.get_wait(20)

        wait.until(
            lambda d: "Mui-disabled" not in d.find_element(
                *self.locators.CONTINUE_BUTTON
            ).get_attribute("class")
        )

        btn = wait.until(EC.element_to_be_clickable(self.locators.CONTINUE_BUTTON))

        self.driver.execute_script("arguments[0].scrollIntoView({block:'center'});", btn)
        self.driver.execute_script("arguments[0].click();", btn)

    def wait_for_resident_autofill(self):
        self.get_wait(15).until(
            lambda d: self.driver.find_element(
                *self.locators.NAME_INPUT
            ).get_attribute("value") not in ("", None)
        )

    # ---------------------------------------------------
    # Search
    # ---------------------------------------------------

    def search_item(self, item_name):
        wait = self.get_wait(15)

        field = wait.until(EC.element_to_be_clickable(self.locators.SEARCH))

        self.driver.execute_script(
            "arguments[0].scrollIntoView({block:'center'});",
            field
        )

        field.click()
        field.clear()

        # Ensure input is cleared
        wait.until(lambda d: field.get_attribute("value") == "")

        #  CRITICAL: allow UI debounce/reset
        self.wait(1)

        field.send_keys(item_name)
        field.send_keys(Keys.ENTER)

        wait.until(lambda d: item_name.lower() in d.page_source.lower())

    # ---------------------------------------------------
    # Item actions
    # ---------------------------------------------------

    def add_item(self, item_name, quantity=1):
        self.increase_quantity(quantity, item_name)

    # ---------------------------------------------------
    # Button actions
    # ---------------------------------------------------

    def click_proceed_to_checkout(self):
        wait = self.get_wait(20)
        locator = self.locators.PROCEED_TO_CHECKOUT

        def enabled_button(d):
            btn = d.find_element(*locator)
            classes = btn.get_attribute("class") or ""
            aria_disabled = btn.get_attribute("aria-disabled")

            if (
                    btn.is_displayed()
                    and btn.is_enabled()
                    and "Mui-disabled" not in classes
                    and aria_disabled != "true"
            ):
                return btn

            return False

        btn = wait.until(enabled_button)

        self.driver.execute_script(
            "arguments[0].scrollIntoView({block:'center'});", btn
        )
        self.driver.execute_script("arguments[0].click();", btn)

    def click_confirm(self):
        btn = self.wait_for_clickable(self.locators.CONFIRM)
        self.driver.execute_script("arguments[0].click();", btn)

    # ---------------------------------------------------
    # FLOWS
    # ---------------------------------------------------

    def complete_checkout(self, item_name):
        self.click_checkout()

        self.select_first_building_option()
        self.select_first_unit_number()

        self.wait_for_resident_autofill()
        self.click_continue_button()

        self.search_item(item_name)
        self.add_item(item_name)

        self.click_proceed_to_checkout()
        self.click_confirm()

    def open_welcome_basket(self):
        self.click_checkout("welcome")

        self.select_from_autocomplete(
            self.locators.BUILDING_CODE,
            self.locators.BUILDING_OPTIONS
        )

        self.click_continue_button()

        self.get_wait(15).until(
            lambda d: not d.find_elements(*self.locators.LOADING_SPINNER)
        )

    def complete_welcome_checkout(self, item_name, quantity=1):
        self.add_item(item_name, quantity)
        self.click_proceed_to_checkout()
        self.click_confirm()

    def handle_limit_popup(self):
        try:
            return_btn = (
                By.XPATH,
                "//button[contains(., 'Return to Checkout Summary')]"
            )

            if self.is_visible(return_btn):
                self.click(return_btn)
                return

            ok_btn = (
                By.XPATH,
                "//button[contains(., 'Staff said it is ok')]"
            )

            if self.is_visible(ok_btn):
                self.click(ok_btn)

        except Exception:
            # popup yoksa devam et (non-blocking)
            pass