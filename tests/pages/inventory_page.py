import pytest
import logging

from selenium.common.exceptions import NoSuchElementException, StaleElementReferenceException, TimeoutException
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

from tests.pages.base_page import BasePage
from tests.utilities.locators import InventoryPageLocators, CommonLocators

logger = logging.getLogger(__name__)


class InventoryPage(BasePage):
    def __init__(self, driver):
        super().__init__(driver)
        self.locators = InventoryPageLocators
        self.common_locators = CommonLocators
        self.wait = WebDriverWait(self.driver, 10)

    # BASIC INVENTORY METHODS
    def get_inventory(self, item: str) -> str:
        return self.get_text(self.locators.get_inventory_locator(item), timeout=90)

    def get_inventory_quantity(self, item: str) -> int:
        """Read only the exact General row; retry stale nodes within 20 seconds."""
        locator = self.locators.get_inventory_locator(item)
        found = {}

        def read_quantity(driver):
            try:
                cell = driver.find_element(*locator)
                if cell.find_elements(By.XPATH, ".//*[local-name()='svg']"):
                    raise AssertionError(f"Inventory value not ready for '{item}' (warning icon shown)")
                text = cell.text.strip()
                if not (text.isascii() and text.isdigit()):
                    return False
                found["quantity"] = int(text)
                return True  # Zero is a valid quantity.
            except (StaleElementReferenceException, NoSuchElementException):
                return False

        self.get_wait(20).until(read_quantity, f"No readable General quantity for {item!r}")
        return found["quantity"]

    # SEARCH METHODS
    @staticmethod
    def _xpath_literal(value):
        if "'" not in value:
            return f"'{value}'"

        if '"' not in value:
            return f'"{value}"'

        parts = value.split("'")
        return "concat(" + ", \"'\", ".join(f"'{part}'" for part in parts) + ")"

    def search_item(self, item_name: str):
        """Replace the React search value and verify the entered query."""
        wait = WebDriverWait(self.driver, 20)
        search_field = wait.until(EC.element_to_be_clickable(self.locators.SEARCH))
        self.driver.execute_script(
            "arguments[0].scrollIntoView({block: 'center'});", search_field
        )
        search_field.click()
        search_field.send_keys(Keys.CONTROL, "a")
        search_field.send_keys(Keys.BACKSPACE)
        wait.until(lambda d: (d.find_element(*self.locators.SEARCH).get_attribute("value") or "") == "")
        self.driver.find_element(*self.locators.SEARCH).send_keys(item_name)
        wait.until(lambda d: d.find_element(*self.locators.SEARCH).get_attribute("value") == item_name)

    def wait_for_search_results(self, item_name: str):
        """Match nested product-name text in the inventory's first column."""
        _, xpath = self.locators.get_inventory_row_locator(item_name)

        def visible_match(driver):
            for row in driver.find_elements(By.XPATH, xpath):
                try:
                    if row.is_displayed():
                        return row
                except StaleElementReferenceException:
                    continue
            return False

        for attempt in range(2):
            try:
                WebDriverWait(self.driver, 10).until(visible_match)
                return
            except TimeoutException:
                if attempt == 0:
                    self.search_item(item_name)

        names = [cell.text.strip() for cell in self.driver.find_elements(
            By.XPATH, "//*[@id='inventory-container']//tr[td]/td[1]"
        ) if cell.is_displayed()]
        raise AssertionError(
            f"{item_name!r} not found in inventory search. Visible results: {names!r}"
        )

    # LOADING HANDLING
    def wait_for_inventory_loaded(self):
        WebDriverWait(self.driver, 10).until(
            EC.invisibility_of_element_located(
                (By.CLASS_NAME, "MuiCircularProgress-root")
            )
        )

    def assert_inventory_page_ready(self):
        """Verify the table structure, including an empty catalogue."""
        self.get_wait(20).until(EC.visibility_of_element_located(
            (By.CSS_SELECTOR, "#inventory-container table")
        ))
        headers = [cell.text.strip() for cell in self.driver.find_elements(
            By.CSS_SELECTOR, "#inventory-container thead th"
        )]
        assert headers == ["Name", "Description", "Type", "Category", "Status", "Quantity", "Adjust"], headers
        self.get_wait(20).until(EC.visibility_of_element_located(
            (By.CSS_SELECTOR, "#inventory-container tbody tr")
        ))

    def select_general_inventory(self):
        """Set the actual type control; /inventory alone does not identify type."""
        self.click((By.CSS_SELECTOR, "#type-button-container > button"))
        self.click((By.XPATH, "//li[@role='menuitem'][normalize-space(.)='General']"))
        # Remove restrictions left over from a previous inventory visit.
        for label in ("Clear Category Filter", "Clear Status Filter"):
            for control in self.driver.find_elements(By.CSS_SELECTOR, f"[aria-label='{label}']"):
                control.click()
        self.search_item("")
        self.wait_for_general_results("")

    def wait_for_general_results(self, query):
        """Require the selected type and a settled, matching rendered snapshot."""
        previous = None
        stable = 0

        def settled(driver):
            nonlocal previous, stable
            try:
                if driver.find_element(By.CSS_SELECTOR, "#type-button-container > button").text.strip() != "General":
                    return False
                if driver.find_element(*self.locators.SEARCH).get_attribute("value") != query:
                    return False
                rows = driver.find_elements(By.CSS_SELECTOR, "#inventory-container tbody tr")
                snapshot = []
                for row in rows:
                    cells = row.find_elements(By.TAG_NAME, "td")
                    if len(cells) == 1 and cells[0].text.strip() == "No items to display":
                        snapshot.append(("empty",))
                    elif len(cells) == 7 and cells[2].text.strip() == "General":
                        values = tuple(cell.text.strip() for cell in cells)
                        if query.lower() not in " ".join(values).lower():
                            return False
                        snapshot.append(values)
                    else:
                        return False
                if not snapshot:
                    return False
                stable = stable + 1 if snapshot == previous else 0
                previous = snapshot
                return stable >= 2
            except (StaleElementReferenceException, NoSuchElementException):
                stable = 0
                return False

        self.get_wait(20).until(settled, "General inventory filter/search results did not settle")

    def select_adjustable_general_item(self, report=None, minimum_quantity=0):
        """Try the requested candidates in order, before starting any mutation."""
        self.select_general_inventory()
        candidates = ("Body soap", "Conditioner", "Can opener")
        self.assert_inventory_page_ready()
        available = {}
        unsuitable = {}
        # Inventory excludes archived items. Search every page before deciding
        # a preferred candidate is absent; never choose a lower priority early.
        while True:
            def read_page(driver):
                # Retry the complete page snapshot when React replaces a row.
                page_available, page_unsuitable = {}, {}
                try:
                    for row in driver.find_elements(By.CSS_SELECTOR, "#inventory-container tbody tr"):
                        cells = row.find_elements(By.TAG_NAME, "td")
                        if len(cells) != 7:
                            continue
                        name = cells[0].text.strip()
                        if name not in candidates:
                            continue
                        # Inspect this cell before parsing text: a warning is not zero.
                        if cells[5].find_elements(By.XPATH, ".//*[local-name()='svg']"):
                            page_unsuitable[name] = (
                                "Item exists, but quantity shows a warning icon; unsuitable for this test."
                            )
                            continue
                        quantity = cells[5].text.strip()
                        buttons = cells[6].find_elements(By.TAG_NAME, "button")
                        if (cells[2].text.strip() == "General"
                                and quantity.isascii() and quantity.isdigit()
                                and int(quantity) >= minimum_quantity
                                and buttons and buttons[0].is_enabled()):
                            page_available[name] = int(quantity)
                        else:
                            page_unsuitable[name] = (
                                f"not General, quantity below {minimum_quantity} or unreadable, or Adjust unavailable"
                            )
                except StaleElementReferenceException:
                    return False
                return page_available, page_unsuitable

            page_available, page_unsuitable = self.get_wait(10).until(read_page)
            available.update(page_available)
            unsuitable.update(page_unsuitable)
            buttons = self.driver.find_elements(
                By.CSS_SELECTOR, "#inventory-container button[aria-label='Go to next page']"
            )
            if not buttons or not buttons[0].is_enabled():
                break
            locator = (By.CSS_SELECTOR, "#inventory-container button[aria-current='page']")
            previous = self.driver.find_element(*locator).text
            buttons[0].click()
            self.get_wait(10).until(lambda d: d.find_element(*locator).text != previous)
        unavailable = []
        for name in candidates:
            if name in available:
                if report:
                    report(candidates[0], name, unavailable)
                return name, available[name]
            reason = unsuitable.get(name, "missing or archived (not in active inventory)")
            unavailable.append({"item": name, "reason": reason})
        if report:
            report(candidates[0], None, unavailable)
        pytest.skip("No suitable active General inventory candidate: " + "; ".join(
            f"{entry['item']}: {entry['reason']}" for entry in unavailable
        ))

    def adjust_quantity(self, item, quantity, comment):
        self.click_adjust(item)
        self.wait_for_adjust_modal()
        self.set_new_quantity(str(quantity))
        self.select_reason("Correction")
        self.enter_comment(comment)
        self.click_submit()
        self.wait_for_adjust_complete(item, quantity)

    # DEFENSIVE SEARCH (STABILIZED)
    def second_search_item(self, item_name: str):
        """Use the same verified search replacement for subsequent queries."""
        self.search_item(item_name)

    # STATUS FILTER METHODS
    def click_status(self):
        status_btn = WebDriverWait(self.driver, 15).until(
            EC.element_to_be_clickable(
                (By.XPATH, "//div[@id='status-button-container']//button")
            )
        )
        status_btn.click()

    def select_status(self, status_text: str):
        option = WebDriverWait(self.driver, 10).until(
            EC.element_to_be_clickable(
                (By.XPATH, f"//li[normalize-space()='{status_text}']")
            )
        )
        option.click()

    def get_filtered_rows(self, status_text: str):
        xpath = f"//tr[td//span[normalize-space()='{status_text}']]"

        WebDriverWait(self.driver, 10).until(
            EC.presence_of_all_elements_located((By.XPATH, xpath))
        )

        return self.driver.find_elements(By.XPATH, xpath)

    def click_adjust(self, item_name: str):
        by, row = self.locators.get_inventory_row_locator(item_name)
        locator = (by, row + "/td[last()]//button")
        self.click(locator)

    def set_new_quantity(self, value: str):
        locator = (By.XPATH, "//input[@type='number']")

        field = self.wait.until(
            EC.element_to_be_clickable(locator)
        )

        #  clear safely (React/MUI friendly)
        field.send_keys(Keys.CONTROL + "a")
        field.send_keys(Keys.DELETE)

        #  enter new value
        field.send_keys(value)

    def select_reason(self, reason="Correction"):
        locator = (By.XPATH, f"//*[normalize-space()='{reason}']")
        self.click(locator)

    def enter_comment(self, text: str):
        locator = (
            By.XPATH,
            "//input[@placeholder='Add a reason or comment']"
        )
        self.send_keys(locator, text)

    def click_submit(self):
        self.click((By.XPATH, "//button[normalize-space()='Submit']"))

    def wait_for_adjust_complete(self, item, new_value):
        wait = self.get_wait(15)

        wait.until(
            EC.invisibility_of_element_located(
                (By.XPATH, "//div[@role='dialog']")
            )
        )

        wait.until(
            lambda d: self.get_inventory_quantity(item) == new_value
        )

    def wait_for_adjust_modal(self):
        wait = self.get_wait(10)

        field = wait.until(
            EC.visibility_of_element_located(
                (By.XPATH, "//input[@placeholder='Enter the updated quantity']")
            )
        )

        wait.until(lambda d: field.is_enabled())

    def wait_for_quantity_update(self, item, expected_value):
        locator = (
            By.XPATH,
            f"//td[normalize-space()='{item}']/following-sibling::td[last()-1]"
        )

        wait = self.get_wait(10)

        wait.until(lambda d: len(d.find_elements(*locator)) > 0)

        def value_updated(d):
            el = d.find_element(*locator)
            text = el.text.strip()
            return text.isdigit() and int(text) == expected_value

        wait.until(value_updated)
