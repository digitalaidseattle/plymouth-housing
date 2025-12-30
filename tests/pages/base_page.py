from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from tests.utilities.locators import CommonLocators, InventoryPageLocators
from selenium.common.exceptions import StaleElementReferenceException

class BasePage:
    def __init__(self, driver):
        self.driver = driver
        self.common_locators = CommonLocators
        self.add_locators = InventoryPageLocators

    def find(self, locator, timeout=10):
        try:
            return WebDriverWait(self.driver, timeout).until(
                EC.presence_of_element_located(locator)
            )
        except TimeoutException:
            raise Exception(f"Element not found: {locator}")

    def find_all(self, locator):
        return self.driver.find_elements(locator)

    def click(self, locator, wait_for_clickable=True, retries=2):
        last_exception = None
        for attempt in range(retries + 1):
            try:
                element = self.wait_for_clickable(locator) if wait_for_clickable else self.find(locator)

                # Ensure visibility — avoids “element not clickable at point” errors
                self.driver.execute_script("arguments[0].scrollIntoView({block:'center'});", element)

                element.click()
                return
            except StaleElementReferenceException as e:
                last_exception = e
                print(f"[RETRY {attempt + 1}] Stale element for {locator}: {e}")
            except TimeoutException as e:
                last_exception = e
                print(f"[RETRY {attempt + 1}] Timeout for {locator}: {e}")
            except Exception as e:
                last_exception = e
                print(f"[RETRY {attempt + 1}] Unexpected error for {locator}: {e}")

        raise last_exception

    def send_keys(self, locator, text):
        element = self.find(locator)
        element.clear()
        element.send_keys(text)

    def is_visible(self, locator, timeout=10):
        try:
            return WebDriverWait(self.driver, timeout).until(
                EC.visibility_of_element_located(locator)
            )
        except TimeoutException:
            return False

    def is_element_present(self, locator):
        try:
            self.driver.find_element(locator)
            return True
        except NoSuchElementException:
            return False

    def wait_for_clickable(self, locator, timeout=10):
        return WebDriverWait(self.driver, timeout).until(
            EC.element_to_be_clickable(locator)
        )

    def wait_for_visibility(self, locator, timeout=10):
        return WebDriverWait(self.driver, timeout).until(
            EC.visibility_of_element_located(locator)
        )

    def get_text(self, locator, wait_for_visibility=True, timeout=10):
        if wait_for_visibility:
            self.wait_for_visibility(locator, timeout)
        element = self.find(locator)
        return element.text

    def get_title(self):
        return self.driver.title

    def execute_script(self, script, *args):
        return self.driver.execute_script(script, *args)

    def scroll_into_view(self, locator):
        element = self.find(locator)
        self.driver.execute_script("arguments[0].scrollIntoView(true);", element)

    def click_on_inventory(self):
        # try:
        #     WebDriverWait(self.driver, 10).until(
        #         EC.invisibility_of_element_located((By.CSS_SELECTOR, 'div[role="presentation"].MuiDialog-container'))
        #     )
        # except TimeoutException:
        #     print("Dialog took too long to close or never appeared.")
        # self.scroll_into_view(self.common_locators.INVENTORY_BUTTON)
        self.click(self.common_locators.INVENTORY_BUTTON)
        # return InventoryPage(driver)

    def click_on_volunteer_home(self,driver):
        self.click(self.common_locators.VOLUNTEER_HOME_BUTTON)
        # return HomePage(driver)

    def click_on_checkout(self, driver):
        self.click(self.common_locators.CHECKOUT_BUTTON)
        # return CheckOutPage(driver)

    def click_on_add_item(self, driver):
        self.click(self.add_locators.ADD_BUTTON)

    def wait_for_data_load(self, value, timeout=30):
        locator = (By.XPATH, f"//*[contains(text(), '{value}')]")
        WebDriverWait(self.driver, timeout).until(
            EC.presence_of_element_located(locator)
        )

    def safe_click(self, locator, label=None):
        try:
            element = WebDriverWait(self.driver, 5).until(EC.element_to_be_clickable(locator))
            self.driver.execute_script("arguments[0].scrollIntoView({block:'center'});", element)
            element.click()
        except TimeoutException:
            raise AssertionError(f"[ERROR] Could not click on {label or locator}")


