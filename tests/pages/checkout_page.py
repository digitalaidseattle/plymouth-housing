from selenium.common.exceptions import (
    TimeoutException,
    StaleElementReferenceException, NoAlertPresentException
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
                self.driver.execute_script(
                    "arguments[0].scrollIntoView({block:'center'});", btn
                )
                self.driver.execute_script("arguments[0].click();", btn)
                return
            except StaleElementReferenceException:
                self.wait(0.5)

        raise Exception(f"❌ Could not click minus button for {item_name}")

    def click_button_if_present(self, locator, timeout=5):
        """
        Click a button/element only if it appears.
        Returns True if clicked, False otherwise.
        """
        try:
            btn = self.wait_for_clickable(locator, timeout=timeout)
            self.driver.execute_script(
                "arguments[0].scrollIntoView({block:'center'});", btn
            )
            self.driver.execute_script("arguments[0].click();", btn)
            return True
        except Exception:
            return False

    # ---------------------------------------------------
    # Quantity
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
    # Dropdowns / Resident
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

    def wait_for_resident_autofill(self):
        self.get_wait(15).until(
            lambda d: self.driver.find_element(
                *self.locators.NAME_INPUT
            ).get_attribute("value") not in ("", None)
        )

    def get_selected_resident_name(self):
        """
        Return the resident name currently selected/autofilled in checkout.

        This allows tests to verify History against the actual resident used
        during checkout instead of hardcoding a resident name.
        """
        field = self.wait_for_visibility(self.locators.NAME_INPUT, timeout=10)

        value = field.get_attribute("value")

        assert value, "Resident name was not selected or autofilled"

        selected_resident_name = value.strip()

        print(f"Selected resident name: {selected_resident_name}")

        return selected_resident_name

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

        self.driver.execute_script(
            "arguments[0].scrollIntoView({block:'center'});", btn
        )
        self.driver.execute_script("arguments[0].click();", btn)

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

        wait.until(lambda d: field.get_attribute("value") == "")

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
    # Normal checkout button actions
    # ---------------------------------------------------

    def click_proceed_to_checkout(self):
        wait = self.get_wait(20)
        locator = self.locators.PROCEED_TO_CHECKOUT

        def enabled_button(d):
            buttons = d.find_elements(*locator)

            for btn in buttons:
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
            "arguments[0].scrollIntoView({block:'center', inline:'nearest'});",
            btn
        )

        self.wait(0.5)

        self.driver.execute_script("arguments[0].click();", btn)

        print("Proceed to Checkout button clicked")

    def click_confirm(self):
        btn = self.wait_for_clickable(self.locators.CONFIRM)
        self.driver.execute_script(
            "arguments[0].scrollIntoView({block:'center'});", btn
        )
        self.driver.execute_script("arguments[0].click();", btn)

        print("Confirm button clicked")

    def click_confirm_if_present(self, timeout=5):
        """
        Click confirm if the normal confirmation modal appears.

        Edit flow may either:
        1. open the same confirm modal as checkout, or
        2. save directly without showing confirm.
        """
        try:
            btn = self.wait_for_clickable(self.locators.CONFIRM, timeout=timeout)
            self.driver.execute_script(
                "arguments[0].scrollIntoView({block:'center'});", btn
            )
            self.driver.execute_script("arguments[0].click();", btn)
            print("Confirm button clicked")
            return True
        except Exception:
            print("Confirm button not shown; continuing")
            return False

    # ---------------------------------------------------
    # Edit flow helpers
    # ---------------------------------------------------

    def is_editing_summary_visible(self):
        return "Checkout Summary (Editing)" in self.driver.page_source

    def is_save_disabled(self):
        """
        Return True if the Save Changes button is disabled in edit mode.
        """
        save_locator = (By.ID, "checkout-dialog-save-btn")

        try:
            button = self.find(save_locator)

            classes = button.get_attribute("class") or ""
            disabled_attr = button.get_attribute("disabled")
            aria_disabled = button.get_attribute("aria-disabled")

            return (
                disabled_attr is not None
                or aria_disabled == "true"
                or "Mui-disabled" in classes
                or "disabled" in classes.lower()
                or not button.is_enabled()
            )

        except Exception as e:
            print(f"[WARN] Could not determine Save Changes disabled state: {e}")
            return False

    def click_edit_save_button(self):
        """
        Click Save Changes button in edit checkout modal.

        Edit flow uses a dedicated button:
        id='checkout-dialog-save-btn'
        """
        save_locator = (By.ID, "checkout-dialog-save-btn")

        save_btn = self.wait_for_clickable(save_locator, timeout=15)

        self.driver.execute_script(
            "arguments[0].scrollIntoView({block:'center', inline:'nearest'});",
            save_btn
        )

        self.wait(0.5)

        self.driver.execute_script("arguments[0].click();", save_btn)

        print("Save Changes button clicked")

    def click_cancel(self):
        """
        Click Cancel in edit checkout flow and accept the unsaved changes alert
        if it appears.
        """
        cancel_locator = (By.ID, "checkout-dialog-cancel-edit-btn")

        cancel_btn = self.wait_for_clickable(cancel_locator, timeout=10)

        self.driver.execute_script(
            "arguments[0].scrollIntoView({block:'center'});",
            cancel_btn
        )

        self.wait(0.3)

        self.driver.execute_script("arguments[0].click();", cancel_btn)

        print("Cancel button clicked")

        try:
            alert = self.get_wait(5).until(EC.alert_is_present())
            alert_text = alert.text
            print(f"Alert appeared after cancel: {alert_text}")
            alert.accept()
            print("Cancel alert accepted")
        except TimeoutException:
            print("No cancel alert appeared")
        except NoAlertPresentException:
            print("No cancel alert present")

    def save_edit_changes(self):
        """
        Save edit changes from the edit checkout modal.

        Important:
        Do not use click_proceed_to_checkout() here because edit mode has
        a dedicated Save Changes button inside the modal.
        """
        try:
            save_btn = self.driver.find_element(By.ID, "checkout-dialog-save-btn")

            self.driver.execute_script(
                "arguments[0].scrollIntoView({block:'center', inline:'nearest'});",
                save_btn
            )

            self.wait(0.5)

        except Exception as e:
            print(f"[WARN] Could not scroll Save Changes button into view: {e}")

        self.click_edit_save_button()

        # Edit flow does not always show confirm modal.
        self.click_confirm_if_present(timeout=3)

    # ---------------------------------------------------
    # FLOWS
    # ---------------------------------------------------

    def complete_checkout(self, item_name):
        """
        Complete a general checkout flow and return the selected resident name.

        Returning the selected resident makes downstream tests more stable,
        because they can assert against the exact resident used in the checkout.
        """
        self.click_checkout()

        self.select_first_building_option()
        self.select_first_unit_number()

        self.wait_for_resident_autofill()

        selected_resident_name = self.get_selected_resident_name()

        self.click_continue_button()

        self.search_item(item_name)
        self.add_item(item_name)

        self.click_proceed_to_checkout()
        self.click_confirm()

        return selected_resident_name

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
            pass
