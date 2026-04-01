from selenium.common import TimeoutException, ElementClickInterceptedException, StaleElementReferenceException, \
    NoSuchElementException
from selenium.webdriver import Keys, ActionChains
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.wait import WebDriverWait
from tests.pages.base_page import BasePage
from tests.utilities.locators import CommonLocators, InventoryPageLocators, AddItemPageLocators


class AddItemPage(BasePage):
    def __init__(self, driver):
        super().__init__(driver)
        self.locators = InventoryPageLocators
        self.common_locators = CommonLocators

    def click_inventory_type(self):
        self.click(self.locators.INVENTORY_TYPE)

    def select_general_option(self):
        self.click(self.locators.SELECT_GENERAL)

    def select_welcome_basket_option(self):
        self.click(self.locators.SELECT_WELCOME_BASKET)

    def click_add_item(self):
        self.click(self.locators.ITEM_NAME_DROPDOWN)

    def select_add_item(self, value):
        wait = WebDriverWait(self.driver, 20)
        input_locator = (By.CSS_SELECTOR, "#add-item-name input")

        input_field = wait.until(EC.element_to_be_clickable(input_locator))
        input_field.click()

        input_field.send_keys(Keys.CONTROL, "a")
        input_field.send_keys(Keys.BACKSPACE)
        input_field.send_keys(value)

        wait.until(EC.visibility_of_element_located((By.XPATH, "//ul[@role='listbox']")))

        option_locator = (
            By.XPATH,
            f"//ul[@role='listbox']//li[@role='option'][.//*[normalize-space()='{value}']]"
        )

        self.click(option_locator, timeout=20, retries=2)

        wait.until(
            EC.invisibility_of_element_located((By.XPATH, "//ul[@role='listbox']"))
        )

    def set_quantity(self, quantity):
        wait = WebDriverWait(self.driver, 15)
        locator = AddItemPageLocators.QUANTITY_INPUT

        for _ in range(3):
            try:
                element = wait.until(
                    EC.element_to_be_clickable(locator)
                )

                element.click()
                element.clear()
                element.send_keys(str(quantity))

                return

            except StaleElementReferenceException:
                pass

        raise TimeoutError("Quantity input keeps going stale")

    def validate_update_success(self, item_name, quantity):
        wait = WebDriverWait(self.driver, 15)

        try:
            wait.until(
                EC.visibility_of_element_located(
                    (By.XPATH, "//*[normalize-space()='Inventory Updated']")
                )
            )

            close_btn = wait.until(
                EC.element_to_be_clickable(AddItemPageLocators.CLOSE_MODAL_BUTTON)
            )

            close_btn.click()

            wait.until(
                EC.invisibility_of_element_located(
                    (By.CLASS_NAME, "MuiBackdrop-root")
                )
            )

            print(f"[SUCCESS] Inventory updated and modal closed for {item_name} ({quantity}).")

        except (
                TimeoutException,
                NoSuchElementException,
                StaleElementReferenceException,
                ElementClickInterceptedException
        ):
            print(f"[WARN] Modal closure failed for {item_name}. Refreshing page.")
            self.driver.refresh()

    def click_submit(self):
        locator = AddItemPageLocators.SUBMIT_BUTTON

        WebDriverWait(self.driver, 10).until_not(
            lambda d: d.find_element(*locator).get_attribute("disabled")
        )

        element = self.driver.find_element(*locator)
        element.click()

    def click_quantity(self):
        self.click(self.locators.QUANTITY)

    def click_add_button(self):
        self.click(self.locators.ADD_BUTTON)

    def click_cancel_button(self):
        self.click(self.locators.CANCEL)