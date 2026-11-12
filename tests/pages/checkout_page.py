from selenium.common.exceptions import (
    NoSuchElementException,
    StaleElementReferenceException,
    TimeoutException,
)
from selenium.webdriver import ActionChains
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as EC

from tests.pages.base_page import BasePage
from tests.utilities.locators import CheckoutPageLocators, CommonLocators


class CheckOutPage(BasePage):

    def __init__(self, driver):
        super().__init__(driver)
        self.locators = CheckoutPageLocators
        self.common_locators = CommonLocators

    # ---------------------------------------------------
    # Internal helpers
    # ---------------------------------------------------

    @staticmethod
    def _xpath_literal(value):
        if "'" not in value:
            return f"'{value}'"

        if '"' not in value:
            return f'"{value}"'

        parts = value.split("'")
        return "concat(" + ", \"'\", ".join(f"'{part}'" for part in parts) + ")"

    @staticmethod
    def _case_insensitive_contains_xpath(target):
        upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        lower = "abcdefghijklmnopqrstuvwxyz"
        target_lc = target.lower()

        return (
            "contains("
            f"translate(normalize-space(.), '{upper}', '{lower}'), "
            f"{CheckOutPage._xpath_literal(target_lc)}"
            ")"
        )


    def _wait_for_item_action_button(self, item_name, timeout=25):
        """Find only this product's enabled catalogue increase control."""
        locator = (By.XPATH, self.catalogue_row_xpath(item_name)
                   + "//*[@data-testid='checkout-item-increase']")
        try:
            return self.get_wait(timeout).until(EC.element_to_be_clickable(locator))
        except TimeoutException as error:
            rows = self.driver.find_elements(
                By.XPATH,
                "//*[@data-testid='checkout-item-row' and "
                "not(ancestor::*[@role='dialog' or @data-testid='checkout-summary-dialog'])]",
            )
            names = [row.get_attribute("data-item-name") for row in rows if row.is_displayed()]
            raise TimeoutException(
                f"No enabled catalogue add button for {item_name!r}. "
                f"Visible item names: {names!r}. Check the item data and disabled state."
            ) from error

    def catalogue_row_xpath(self, item_name):
        """Exact product row outside all dialogs."""
        return (
            "//*[@data-testid='checkout-item-row'"
            f" and @data-item-name={self._xpath_literal(item_name)}"
            " and not(ancestor::*[@role='dialog' or @data-testid='checkout-summary-dialog'])]"
        )

    # ---------------------------------------------------
    # Navigation
    # ---------------------------------------------------

    def click_checkout(self, flow="general"):
        self.click(self.common_locators.CHECKOUT_MENU_BUTTON)

        if flow == "general":
            self.click(self.common_locators.CHECKOUT_GENERAL_MENU_BUTTON)
        elif flow == "welcome":
            self.click(self.common_locators.CHECKOUT_WELCOME_MENU_BUTTON)
        else:
            raise ValueError("Invalid checkout flow")

        self.wait_for_visibility(self.locators.CHECKOUT_INFO_TEXT, timeout=15)

    # ---------------------------------------------------
    # Dropdown Selections
    # ---------------------------------------------------

    def select_first_building_option(self):
        """Select a building option and verify it remains selected after blur."""
        self.select_from_autocomplete(
            self.locators.BUILDING_CODE,
            self.locators.BUILDING_OPTIONS,
        )

    def select_first_unit_number(self):
        """Select a unit only after a building has been selected."""
        def building_selected(driver):
            try:
                building = driver.find_element(*self.locators.BUILDING_CODE)
                return (
                    bool((building.get_attribute("value") or "").strip())
                    and building.get_attribute("aria-expanded") == "false"
                )
            except (NoSuchElementException, StaleElementReferenceException):
                return False

        self.get_wait(20).until(
            building_selected,
            "Building selection is empty or its popup is still open; "
            "cannot select a unit",
        )
        self.select_from_autocomplete(
            self.locators.UNIT_NUMBER,
            self.locators.UNIT_OPTIONS,
        )

    # ---------------------------------------------------
    # Actions
    # ---------------------------------------------------

    def click_continue_button(self, timeout=20):
        wait = self.get_wait(timeout)

        wait.until(
            lambda d: "Mui-disabled" not in d.find_element(
                *self.locators.CONTINUE_BUTTON
            ).get_attribute("class")
        )

        continue_btn = wait.until(
            EC.element_to_be_clickable(self.locators.CONTINUE_BUTTON)
        )

        self.driver.execute_script(
            "arguments[0].scrollIntoView({block:'center'});",
            continue_btn
        )

        ActionChains(self.driver).move_to_element(continue_btn).perform()

        self.driver.execute_script(
            "arguments[0].click();",
            continue_btn
        )

    def wait_for_resident_autofill(self, timeout=20):
        wait = self.get_wait(timeout)

        def has_plausible_resident_value(driver):
            value = (
                    driver.find_element(
                        *self.locators.NAME_INPUT
                    ).get_attribute("value") or ""
            ).strip()

            if not value:
                return False

            # Reject values like "(((((((" or "12345".
            # Accept single-word residents like "Henry" and multi-word names.
            has_letter = any(ch.isalpha() for ch in value)

            return has_letter and len(value) >= 2

        wait.until(has_plausible_resident_value)

        return (
            self.driver.find_element(
                *self.locators.NAME_INPUT
            ).get_attribute("value") or ""
        ).strip()

    def add_item(self, item_name):
        """
        Add an item from the checkout item list.

        Uses locator strategies plus a JS fallback because the current MUI card
        structure can vary by item/search result. This is especially important
        for multi-word item names such as "Baby Wipes".
        """
        wait = self.get_wait(25)

        add_button = self._wait_for_item_action_button(
            item_name,
            timeout=25
        )

        self.driver.execute_script(
            "arguments[0].scrollIntoView({block:'center'});",
            add_button
        )

        try:
            ActionChains(self.driver).move_to_element(add_button).pause(0.2).perform()
        except Exception:
            pass

        self.driver.execute_script(
            "arguments[0].click();",
            add_button
        )

        # After an item is added, the cart summary should reflect added items.
        wait.until(
            lambda d: "items added" in d.page_source.lower()
        )

    def click_proceed_to_checkout(self):
        proceed_btn = self.wait_for_clickable(self.locators.PROCEED_TO_CHECKOUT)
        self.driver.execute_script("arguments[0].click();", proceed_btn)

    def click_confirm(self):
        confirm_btn = self.wait_for_clickable(self.locators.CONFIRM)
        self.driver.execute_script("arguments[0].click();", confirm_btn)

    # ---------------------------------------------------
    # Search
    # ---------------------------------------------------

    def search_item(self, item_name, timeout=20):
        """Verify the input value and wait for the actual product control."""
        wait = self.get_wait(timeout)
        search_field = wait.until(EC.element_to_be_clickable(self.locators.SEARCH))
        self.driver.execute_script("arguments[0].scrollIntoView({block:'center'});", search_field)
        search_field.click()
        search_field.send_keys(Keys.CONTROL, "a")
        search_field.send_keys(Keys.BACKSPACE)
        wait.until(lambda d: (d.find_element(*self.locators.SEARCH).get_attribute("value") or "") == "")
        self.driver.find_element(*self.locators.SEARCH).send_keys(item_name)
        wait.until(lambda d: d.find_element(*self.locators.SEARCH).get_attribute("value") == item_name)
        self._wait_for_item_action_button(item_name, timeout=timeout)

    # ---------------------------------------------------
    # FULL FLOW
    # ---------------------------------------------------

    def complete_checkout(self, item_name):
        """
        Run the full checkout flow.

        Returns the resident name that was autofilled during checkout, which
        the edit-flow tests use to locate the transaction they just created.
        """
        self.click_checkout()

        self.select_first_building_option()
        self.select_first_unit_number()

        selected_resident_name = self.wait_for_resident_autofill()

        self.click_continue_button()

        self.search_item(item_name)
        self.add_item(item_name)

        self.click_proceed_to_checkout()
        self.click_confirm()

        return selected_resident_name

    def open_welcome_basket(self):
        """Select the building and wait for its dialog to close."""
        self.click_checkout("welcome")
        self.select_first_building_option()
        self.click_continue_button()
        self.get_wait(30).until(EC.invisibility_of_element_located(self.locators.BUILDING_CODE))
        self.get_wait(20).until(EC.visibility_of_element_located((By.ID, "Welcome Basket")))
        self.get_wait(20).until(EC.visibility_of_element_located((
            By.XPATH, "//*[@data-testid='checkout-item-row' and "
            "not(ancestor::*[@role='dialog'])]",
        )))

    def complete_welcome_checkout(self, item_name, quantity=1):
        """Complete a normal basket checkout after open_welcome_basket."""
        self.set_quantity(quantity, item_name)
        self.click_proceed_to_checkout()
        self.wait_for_visibility(self.locators.SUMMARY_HEADER, timeout=15)
        self.click_confirm()

    def handle_limit_popup(self):
        """Return from the limit confirmation to the summary without submitting."""
        button = self.wait_for_clickable((By.ID, "checkout-dialog-return-to-summary-btn"))
        button.click()
        self.wait_for_visibility(self.locators.SUMMARY_HEADER, timeout=15)

    def complete_welcome_basket_checkout(self):
        """Exercise basket limit recovery and complete checkout at quantity five."""
        item = "Twin-size Sheet Set"
        self.open_welcome_basket()
        self.set_quantity(6, item)
        self.click_proceed_to_checkout()
        self.wait_for_visibility(self.locators.SUMMARY_HEADER, timeout=15)
        self.click_confirm()
        self.handle_limit_popup()
        self.set_quantity(5, item)
        self.click_confirm()

    def set_quantity(self, target, item_name):
        """Set an exact quantity in the visible summary or catalogue row."""
        if not isinstance(target, int) or target < 0:
            raise ValueError("Quantity must be a non-negative integer")
        in_summary = any(el.is_displayed() for el in self.driver.find_elements(
            By.CSS_SELECTOR, "[data-testid='checkout-summary-dialog']"
        ))
        row_xpath = self.summary_row_xpath(item_name) if in_summary else self.catalogue_row_xpath(item_name)
        row_locator = (By.XPATH, row_xpath)
        self.get_wait(15).until(EC.visibility_of_element_located(row_locator))

        def read_current(driver):
            try:
                rows = driver.find_elements(*row_locator)
                row = next((row for row in rows if row.is_displayed()), None)
                if row is None:
                    return None
                values = row.find_elements(By.CSS_SELECTOR, "[data-testid='test-id-quantity']")
                if not values:
                    return 0 if not in_summary else None
                text = values[0].text.strip()
                return int(text) if text.isdigit() else None
            except StaleElementReferenceException:
                return None

        found = {}
        def readable(driver):
            value = read_current(driver)
            if value is None:
                return False
            found['value'] = value
            return True

        self.get_wait(15).until(readable)
        current = found['value']
        for _ in range(abs(target - current)):
            direction = 1 if target > current else -1
            hook = 'checkout-item-increase' if direction > 0 else 'checkout-item-decrease'
            button = self.get_wait(15).until(EC.element_to_be_clickable((
                By.XPATH, row_xpath + f"//*[@data-testid='{hook}']"
            )))
            self.driver.execute_script("arguments[0].scrollIntoView({block:'center'});", button)
            button.click()
            expected = current + direction
            if expected == 0 and in_summary:
                self.get_wait(15).until(EC.invisibility_of_element_located(row_locator))
            else:
                self.get_wait(15).until(lambda d: read_current(d) == expected)
            current = expected

    def summary_row_xpath(self, item_name):
        """
        Base XPath for an item's row inside the Checkout Summary.

        The catalogue uses the same card component, so scope to the summary.
        The item name is fixture data exposed as an attribute, not UI text.
        """
        return (
            "//*[@data-testid='checkout-summary-dialog']"
            "//*[@data-testid='checkout-item-row'"
            f" and @data-item-name={self._xpath_literal(item_name)}]"
        )

    def quantity_locator(self, item_name):
        return (
            By.XPATH,
            (
                f"{self.summary_row_xpath(item_name)}"
                "//*[@data-testid='test-id-quantity']"
            )
        )

    def summary_plus_locator(self, item_name):
        """
        The row's "+" control.

        Resolve the control by its hook inside the selected summary row.
        """
        return (
            By.XPATH,
            (
                f"{self.summary_row_xpath(item_name)}"
                "//*[@data-testid='checkout-item-increase']"
            )
        )

    def summary_minus_locator(self, item_name):
        return (
            By.XPATH,
            (
                f"{self.summary_row_xpath(item_name)}"
                "//*[@data-testid='checkout-item-decrease']"
            )
        )

    def click_summary_step_button(self, locator, timeout=15):
        button = self.get_wait(timeout).until(
            EC.presence_of_element_located(locator)
        )

        self.driver.execute_script(
            "arguments[0].scrollIntoView({block:'center'});",
            button
        )

        self.driver.execute_script(
            "arguments[0].click();",
            button
        )

    def read_quantity(self, item_name):
        """
        Current quantity for an item, or None while the summary re-renders.

        Returning None rather than raising lets the waits below poll through
        the brief window where MUI has removed the node but not replaced it.
        """
        for element in self.driver.find_elements(
            *self.quantity_locator(item_name)
        ):
            try:
                text = (element.text or "").strip()
            except StaleElementReferenceException:
                continue

            if text.isdigit():
                return int(text)

        return None

    def wait_for_readable_quantity(self, item_name, timeout=15):
        found = {}

        def is_readable(_driver):
            value = self.read_quantity(item_name)

            if value is None:
                return False

            found["value"] = value
            return True

        self.get_wait(timeout).until(is_readable)

        return found["value"]

    def wait_for_quantity(self, item_name, expected, timeout=15):
        self.get_wait(timeout).until(
            lambda d: self.read_quantity(item_name) == expected
        )

    def increase_quantity(self, amount, item_name):
        """Increase an item's quantity by `amount` (a delta, not a target)."""
        for _ in range(amount):
            before = self.wait_for_readable_quantity(item_name)

            self.click_summary_step_button(
                self.summary_plus_locator(item_name)
            )

            self.wait_for_quantity(item_name, before + 1)

    def decrease_quantity(self, amount, item_name):
        """Decrease an item's quantity by `amount` (a delta, not a target)."""
        for _ in range(amount):
            before = self.wait_for_readable_quantity(item_name)

            self.click_summary_step_button(
                self.summary_minus_locator(item_name)
            )

            self.wait_for_quantity(item_name, before - 1)

    # ---------------------------------------------------
    # Edit mode
    # ---------------------------------------------------

    def is_editing_summary_visible(self, timeout=15):
        """True when the Checkout Summary is open in editing mode."""
        try:
            self.get_wait(timeout).until(
                EC.visibility_of_element_located(
                    self.locators.EDIT_SUMMARY_HEADER
                )
            )

            return True

        except TimeoutException:
            return False

    def get_save_changes_button(self, timeout=15):
        return self.get_wait(timeout).until(
            EC.presence_of_element_located(
                self.locators.SAVE_CHANGES_BUTTON
            )
        )

    def is_save_disabled(self, timeout=15):
        """
        True while the save button is disabled.

        The button reads "No changes" and is disabled until an edit is made,
        at which point it becomes an enabled "Save changes".
        """
        return not self.get_save_changes_button(timeout).is_enabled()

    def save_edit_changes(self, timeout=20):
        """Enable-wait, click save, and wait for the dialog to close."""
        self.get_wait(timeout).until(
            lambda d: self.get_save_changes_button(timeout).is_enabled()
        )

        button = self.get_save_changes_button(timeout)

        self.driver.execute_script(
            "arguments[0].click();",
            button
        )

        self.get_wait(timeout).until(
            EC.invisibility_of_element_located(
                self.locators.EDIT_SUMMARY_HEADER
            )
        )

    def click_cancel(self, timeout=20):
        """
        Discard the edit and wait for the dialog to close.

        Cancelling after a change raises a native browser confirm
        ("You have unsaved changes..."), which must be accepted or every
        later command fails with UnexpectedAlertPresentException. No alert
        appears when nothing was changed, so its absence is not an error.
        """
        button = self.get_wait(timeout).until(
            EC.element_to_be_clickable(
                self.locators.EDIT_CANCEL_BUTTON
            )
        )

        self.driver.execute_script(
            "arguments[0].click();",
            button
        )

        self.accept_discard_changes_alert()

        self.get_wait(timeout).until(
            EC.invisibility_of_element_located(
                self.locators.EDIT_SUMMARY_HEADER
            )
        )

    def accept_discard_changes_alert(self, timeout=5):
        """Accept the unsaved-changes confirm if one is raised."""
        try:
            alert = self.get_wait(timeout).until(
                EC.alert_is_present()
            )

            print(f"Accepting discard-changes alert: {alert.text}")

            alert.accept()

        except TimeoutException:
            # No confirm is raised when nothing was edited.
            return

    def click_plus_button(self, item_name):
        btn = self._wait_for_item_action_button(item_name, timeout=20)

        self.driver.execute_script(
            "arguments[0].scrollIntoView({block:'center'});",
            btn
        )

        try:
            ActionChains(self.driver).move_to_element(btn).pause(0.2).perform()
        except Exception:
            pass

        self.driver.execute_script("arguments[0].click();", btn)

    def click_minus_button(self, item_name):
        """Click the selected catalogue item's decrease control."""
        button = self.get_wait(10).until(EC.element_to_be_clickable((
            By.XPATH, self.catalogue_row_xpath(item_name)
            + "//*[@data-testid='checkout-item-decrease']",
        )))
        self.driver.execute_script("arguments[0].scrollIntoView({block:'center'});", button)
        button.click()
