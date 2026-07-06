from selenium.common.exceptions import TimeoutException, NoSuchElementException
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
        return "concat(" + ', "\\\'", '.join(f"'{part}'" for part in parts) + ")"

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

    def _find_item_action_button_with_js(self, item_name):
        """
        Find an enabled action/add button inside the item card.

        MUI renders item cards with slightly different structures depending on
        search results and item type. This JS fallback starts from the smallest
        visible text/aria-label match, walks up to the nearest card-like root,
        and returns the most likely enabled button.
        """
        script = """
            const target = String(arguments[0] || '').trim().toLowerCase();
            if (!target) return null;

            const isVisible = (el) => {
                if (!el) return false;
                const style = window.getComputedStyle(el);
                const rect = el.getBoundingClientRect();
                return (
                    style.visibility !== 'hidden' &&
                    style.display !== 'none' &&
                    rect.width > 0 &&
                    rect.height > 0
                );
            };

            const getText = (el) => (
                el.getAttribute('aria-label') ||
                el.innerText ||
                el.textContent ||
                ''
            ).trim();

            const candidates = Array.from(
                document.querySelectorAll('[aria-label], p, h1, h2, h3, h4, h5, h6, span, div')
            )
                .filter((el) => isVisible(el))
                .map((el) => ({ el, text: getText(el) }))
                .filter(({ text }) => text && text.toLowerCase().includes(target))
                .sort((a, b) => a.text.length - b.text.length);

            for (const { el } of candidates) {
                let root = el.closest('.MuiCard-root, [class*="MuiCard"], [class*="MuiStack-root"]');

                while (root && root !== document.body) {
                    const buttons = Array.from(root.querySelectorAll('button'))
                        .filter((button) => !button.disabled && isVisible(button));

                    if (buttons.length) {
                        const preferred = buttons.find((button) => {
                            const label = getText(button).toLowerCase();
                            return (
                                label.includes('add') ||
                                label.includes('increase') ||
                                label.includes('plus') ||
                                label.includes('+')
                            );
                        });

                        return preferred || buttons[buttons.length - 1];
                    }

                    root = root.parentElement;
                }
            }

            return null;
        """

        return self.driver.execute_script(script, item_name)

    def _wait_for_item_action_button(self, item_name, timeout=25):
        wait = self.get_wait(timeout)
        target_xpath = self._case_insensitive_contains_xpath(item_name)

        locators = [
            self.locators.get_add_button_locator(item_name),
            (
                By.XPATH,
                (
                    "//*[self::p or self::h6 or self::span or self::div]"
                    f"[{target_xpath} or "
                    f"contains(translate(@aria-label, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), "
                    f"{self._xpath_literal(item_name.lower())})]"
                    "/ancestor::*[contains(@class,'MuiCard') or contains(@class,'MuiCard-root')][1]"
                    "//button[not(@disabled)][last()]"
                )
            ),
            (
                By.XPATH,
                (
                    "//*[self::p or self::h6 or self::span or self::div]"
                    f"[{target_xpath} or "
                    f"contains(translate(@aria-label, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), "
                    f"{self._xpath_literal(item_name.lower())})]"
                    "/ancestor::*[contains(@class,'MuiStack-root')][.//button][1]"
                    "//button[not(@disabled)][last()]"
                )
            ),
        ]

        last_error = None

        for locator in locators:
            try:
                return wait.until(EC.element_to_be_clickable(locator))
            except TimeoutException as err:
                last_error = err
                print(f"[WARN] Add button locator failed: {locator}")

        try:
            button = wait.until(
                lambda d: self._find_item_action_button_with_js(item_name)
            )

            if button:
                return button

        except TimeoutException as err:
            last_error = err

        raise TimeoutException(
            f"Could not find enabled add button for item: {item_name}. "
            f"Last error: {last_error}"
        )

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

    def select_first_building_option(self):
        for attempt in range(2):  # 1 normal + 1 retry
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
                print(f"⚠️ Building options not loaded (attempt {attempt + 1})")

            if attempt == 0:
                print("🔄 Refreshing page and retrying...")
                self.driver.refresh()

                self.get_wait(10).until(
                    lambda d: len(d.find_elements(
                        By.XPATH,
                        "//*[contains(text(),'Provide Details')]"
                    )) > 0
                )

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
        search_field.send_keys(Keys.CONTROL, "a")
        search_field.send_keys(Keys.BACKSPACE)

        wait.until(lambda d: (search_field.get_attribute("value") or "") == "")
        wait.until(lambda d: search_field.is_enabled())

        search_field.send_keys(item_name)

        wait.until(
            lambda d: item_name.lower() in d.page_source.lower()
        )

        # Also wait until the matching item has an enabled action button.
        self._wait_for_item_action_button(item_name, timeout=timeout)

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

        self.click_checkout("welcome")

        self.select_from_autocomplete(
            self.locators.BUILDING_CODE,
            self.locators.BUILDING_OPTIONS
        )

        continue_btn = self.wait_for_clickable(self.locators.CONTINUE_BUTTON)
        self.driver.execute_script("arguments[0].click();", continue_btn)

        self.get_wait(15).until(
            EC.invisibility_of_element_located(self.locators.LOADING_SPINNER)
        )

        plus_locator = (
            By.XPATH,
            (
                f"//p[@aria-label='{item}']"
                "/ancestor::div[contains(@class,'MuiCard')]"
                "//button[last()]"
            )
        )

        self.get_wait(15).until(
            EC.element_to_be_clickable(plus_locator)
        )

        self.set_quantity(6, item)

        proceed_btn = self.wait_for_clickable(self.locators.PROCEED_TO_CHECKOUT)
        self.driver.execute_script("arguments[0].click();", proceed_btn)

        self.get_wait(15).until(
            lambda d: d.find_elements(
                By.XPATH,
                "//*[contains(text(),'Checkout Summary')]"
            )
        )

        if self.is_visible((By.XPATH, "//*[contains(text(),'Over the usual category limit')]")):
            ok_btn = self.wait_for_clickable(
                (By.XPATH, "//button[contains(text(),'Staff Said It Is Ok')]")
            )
            self.driver.execute_script("arguments[0].click();", ok_btn)
            self.get_wait(10).until(
                EC.invisibility_of_element_located(
                    (By.XPATH, "//*[contains(text(),'Over the usual category limit')]")
                )
            )

        self.set_quantity(5, item)

        confirm_btn = self.wait_for_clickable(self.locators.CONFIRM)
        self.driver.execute_script("arguments[0].click();", confirm_btn)

    def set_quantity(self, target, item_name):
        quantity_locator = (
            By.XPATH,
            (
                f"//div[contains(.,'{item_name}')]"
                "/ancestor::div[contains(@class,'MuiCard')]"
                "//p[@data-testid='test-id-quantity']"
            )
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

            self.wait(0.5)

        raise AssertionError(f"❌ Quantity not set. Current: {get_qty()}")

    def increase_quantity(self, item_name):
        quantity_locator = (
            By.XPATH,
            (
                f"//div[contains(.,'{item_name}')]"
                "/ancestor::div[contains(@class,'MuiCard')]"
                "//p[@data-testid='test-id-quantity']"
            )
        )

        self.click_plus_button(item_name)

        self.get_wait(10).until(
            lambda d: len(d.find_elements(*quantity_locator)) > 0
        )

        self.get_wait(10).until(
            lambda d: int(self.get_text(quantity_locator).strip()) >= 1
        )

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
        locator = (
            By.XPATH,
            (
                f"//div[contains(.,'{item_name}')]"
                "/ancestor::div[contains(@class,'MuiCard')]"
                "//button[1]"
            )
        )

        btn = self.get_wait(10).until(
            EC.element_to_be_clickable(locator)
        )

        self.driver.execute_script("arguments[0].click();", btn)
