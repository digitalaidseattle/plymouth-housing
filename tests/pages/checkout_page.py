from selenium.common import TimeoutException, NoSuchElementException
from selenium.webdriver import ActionChains
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from tests.pages.base_page import BasePage
from tests.utilities.locators import CheckoutPageLocators, CommonLocators


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
    # Dropdown Selections
    # ---------------------------------------------------

    from selenium.common.exceptions import TimeoutException

    def select_first_building_option(self):

        for attempt in range(2):  # 1 normal + 1 retry
            try:
                # open dropdown
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
                print(f"⚠️ Building options not loaded (attempt {attempt + 1})")

            #  fallback → refresh + retry
            if attempt == 0:
                print("🔄 Refreshing page and retrying...")
                self.driver.refresh()

                #  wait page ready after refresh
                self.get_wait(10).until(
                    lambda d: len(d.find_elements(
                        By.XPATH, "//*[contains(text(),'Provide Details')]"
                    )) > 0
                )

        # ❌ after retry → fail
        raise Exception("❌ Building options could not be loaded after retry")

    def select_first_unit_number(self):
        self.select_from_autocomplete(
            self.locators.UNIT_NUMBER,
            self.locators.UNIT_OPTIONS
        )

    # ---------------------------------------------------
    # Actions
    # ---------------------------------------------------

    def click_continue_button(self, timeout=20):
        wait = self.get_wait(timeout)

        # Wait until button is enabled (fresh lookup to avoid stale element)
        wait.until(
            lambda d: "Mui-disabled" not in d.find_element(
                *self.locators.CONTINUE_BUTTON
            ).get_attribute("class")
        )

        # Re-fetch element after state change (React re-render safe)
        continue_btn = wait.until(
            EC.element_to_be_clickable(self.locators.CONTINUE_BUTTON)
        )

        # Scroll into view
        self.driver.execute_script(
            "arguments[0].scrollIntoView({block:'center'});",
            continue_btn
        )

        # Hover (optional)
        ActionChains(self.driver).move_to_element(continue_btn).perform()

        # Click using JS for stability
        self.driver.execute_script(
            "arguments[0].click();",
            continue_btn
        )

    def wait_for_resident_autofill(self, timeout=20):
        wait = self.get_wait(timeout)

        # Wait until resident field is auto-populated
        wait.until(
            lambda d: self.driver.find_element(
                *self.locators.NAME_INPUT
            ).get_attribute("value") not in ("", None)
        )

    def add_item(self, item_name):
        locator = self.locators.get_add_button_locator(item_name)

        self.get_wait(15).until(
            EC.visibility_of_element_located(locator)
        )

        self.click(locator)

    def click_proceed_to_checkout(self):
        self.click(self.locators.PROCEED_TO_CHECKOUT)

    def click_confirm(self):
        self.click(self.locators.CONFIRM)

    # ---------------------------------------------------
    # Search
    # ---------------------------------------------------

    def search_item(self, item_name, timeout=20):
        wait = self.get_wait(timeout)

        search_field = wait.until(
            EC.visibility_of_element_located(self.locators.SEARCH)
        )

        wait.until(
            EC.element_to_be_clickable(self.locators.SEARCH)
        )

        self.driver.execute_script(
            "arguments[0].scrollIntoView({block:'center'});",
            search_field
        )

        search_field.click()
        search_field.clear()

        # Ensure the input field is fully cleared before typing
        wait.until(lambda d: search_field.get_attribute("value") == "")

        # Ensure the field is ready for input
        wait.until(lambda d: search_field.is_enabled())

        search_field.send_keys(item_name)

    # ---------------------------------------------------
    # FULL FLOW
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

    def complete_welcome_basket_checkout(self):

        item = "Twin-size Sheet Set"

        # Step 1
        self.click_checkout("welcome")

        # Step 2
        self.select_from_autocomplete(
            self.locators.BUILDING_CODE,
            self.locators.BUILDING_OPTIONS
        )

        # Step 3 → Continue (JS click)
        continue_btn = self.wait_for_clickable(self.locators.CONTINUE_BUTTON)
        self.driver.execute_script("arguments[0].click();", continue_btn)

        # Step 4 → WAIT FOR LOADING SPINNER TO DISAPPEAR
        self.get_wait(15).until(
            EC.invisibility_of_element_located(self.locators.LOADING_SPINNER)
        )

        # Step 5 → WAIT FOR ITEM-SPECIFIC PLUS BUTTON
        plus_locator = (
            By.XPATH,
            f"//p[@aria-label='{item}']/ancestor::div[contains(@class,'MuiCard')]//button[last()]"
        )

        self.get_wait(15).until(
            EC.element_to_be_clickable(plus_locator)
        )

        # Step 7 → Over-limit test
        self.set_quantity(6, item)

        # Step 8
        proceed_btn = self.wait_for_clickable(self.locators.PROCEED_TO_CHECKOUT)
        self.driver.execute_script("arguments[0].click();", proceed_btn)

        # Step 9 → Summary
        self.get_wait(15).until(
            lambda d: d.find_elements(By.XPATH, "//*[contains(text(),'Checkout Summary')]")
        )

        # Step 10 → Handle over-limit popup
        if self.is_visible((By.XPATH, "//*[contains(text(),'Over the usual category limit')]")):
            ok_btn = self.wait_for_clickable(
                (By.XPATH, "//button[contains(text(),'Staff Said It Is Ok')]")
            )
            self.driver.execute_script("arguments[0].click();", ok_btn)

        # Step 11 → Fix quantity
        self.set_quantity(5, item)

        # Step 12 → Confirm
        confirm_btn = self.wait_for_clickable(self.locators.CONFIRM)
        self.driver.execute_script("arguments[0].click();", confirm_btn)

    def set_quantity(self, target, item_name):

        quantity_locator = (
            By.XPATH,
            f"//div[contains(.,'{item_name}')]/ancestor::div[contains(@class,'MuiCard')]//p[@data-testid='test-id-quantity']"
        )

        def get_qty():
            try:
                el = self.driver.find_element(*quantity_locator)
                return int(el.text.strip())
            except (NoSuchElementException, ValueError):
                return 0

        for _ in range(10):

            current = get_qty()
            print("🔥 Current qty:", current)

            if current == target:
                return

            if current < target:
                self.click_plus_button(item_name)
            else:
                self.click_minus_button(item_name)

            # small wait for UI update
            self.wait(0.5)

        raise AssertionError(f"❌ Quantity not set. Current: {get_qty()}")

    def increase_quantity(self, item_name):

        quantity_locator = (
            By.XPATH,
            f"//div[contains(.,'{item_name}')]/ancestor::div[contains(@class,'MuiCard')]//p[@data-testid='test-id-quantity']"
        )

        # click plus button
        self.click_plus_button(item_name)

        # wait for quantity element to appear
        self.get_wait(10).until(
            lambda d: len(d.find_elements(*quantity_locator)) > 0
        )

        # wait until value increases
        self.get_wait(10).until(
            lambda d: int(self.get_text(quantity_locator).strip()) >= 1
        )

    def click_plus_button(self, item_name):

        locator = (
            By.XPATH,
            f"//p[@aria-label='{item_name}']/ancestor::div[contains(@class,'MuiCard')]//button[last()]"
        )

        btn = self.get_wait(15).until(lambda d: d.find_element(*locator))

        self.driver.execute_script(
            "arguments[0].scrollIntoView({block:'center'});",
            btn
        )

        ActionChains(self.driver).move_to_element(btn).pause(0.2).perform()

        self.driver.execute_script("arguments[0].click();", btn)

    def click_minus_button(self, item_name):

        locator = (
            By.XPATH,
            f"//div[contains(.,'{item_name}')]/ancestor::div[contains(@class,'MuiCard')]//button[1]"
        )

        btn = self.get_wait(10).until(lambda d: d.find_element(*locator))

        self.driver.execute_script("arguments[0].click();", btn)