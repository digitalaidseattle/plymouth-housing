from selenium.webdriver import ActionChains
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
    # CORE AUTOCOMPLETE ENGINE (FINAL FIXED)
    # ---------------------------------------------------

    def _select_autocomplete(self, input_locator, options_locator, trigger_text):
        input_el = self.wait_for_visibility(input_locator)

        self.get_wait(10).until(lambda d: input_el.is_enabled())

        input_el.click()
        input_el.clear()
        input_el.send_keys(trigger_text)

        # wait options
        options = self.get_wait(20).until(
            lambda d: [
                el for el in d.find_elements(*options_locator)
                if el.is_displayed() and el.text.strip()
            ]
        )

        first_option = options[0]

        self.driver.execute_script("arguments[0].scrollIntoView(true);", first_option)
        first_option.click()

        # 🔥 CRITICAL FIX (NO ENTER)
        self.driver.execute_script("arguments[0].blur();", input_el)

        self.get_wait(10).until(
            lambda d: input_el.get_attribute("value") != ""
        )

    # ---------------------------------------------------
    # Dropdown Selections
    # ---------------------------------------------------

    def select_first_building_option(self):
        self.select_from_autocomplete(
            self.locators.BUILDING_CODE,
            self.locators.BUILDING_OPTIONS
        )

        # dependent dropdown hazır mı?
        self.get_wait(20).until(
            lambda d: d.find_element(*self.locators.UNIT_NUMBER).is_enabled()
        )

    def select_first_unit_number(self):
        self.select_from_autocomplete(
            self.locators.UNIT_NUMBER,
            self.locators.UNIT_OPTIONS
        )

    # def select_first_name(self):
    #     self.select_from_autocomplete(
    #         self.locators.NAME_INPUT,
    #         self.locators.NAME_OPTIONS
    #     )

    # ---------------------------------------------------
    # Actions
    # ---------------------------------------------------

    def click_continue_button(self, timeout=20):
        wait = self.get_wait(timeout)

        continue_btn = wait.until(
            EC.presence_of_element_located(self.locators.CONTINUE_BUTTON)
        )

        # ✅ enabled olmasını bekle (CRITICAL)
        wait.until(
            lambda d: "Mui-disabled" not in continue_btn.get_attribute("class")
        )

        # scroll
        self.driver.execute_script(
            "arguments[0].scrollIntoView({block:'center'});",
            continue_btn
        )

        # hover (optional ama güzel)
        ActionChains(self.driver).move_to_element(continue_btn).perform()

        # click
        self.driver.execute_script(
            "arguments[0].click();",
            continue_btn
        )

    def wait_for_resident_autofill(self, timeout=20):
        wait = self.get_wait(timeout)

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