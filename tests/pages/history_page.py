import re
import time
from selenium.webdriver.support.wait import WebDriverWait

from tests.pages.base_page import BasePage
from tests.utilities.locators import HistoryPageLocators, CommonLocators


class HistoryPage(BasePage):

    def __init__(self, driver):
        super().__init__(driver)
        self.locators = HistoryPageLocators
        self.common_locators = CommonLocators
        self.wait = WebDriverWait(driver, 15)

    # ---------------------------------------------------
    # Navigation
    # ---------------------------------------------------

    def open_history(self):
        print("Opening history page...")

        self.click(self.common_locators.HISTORY_MENU_BUTTON)

        # Header wait
        self.wait_for_visibility(self.locators.HISTORY_HEADER)

        # Wait for either records OR empty state
        self.get_wait(15).until(
            lambda d: (
                len(d.find_elements(*self.locators.RECORD_COUNT_TEXT)) > 0
                or len(d.find_elements(*self.locators.NO_TRANSACTIONS_MESSAGE)) > 0
            )
        )

        print("History page loaded")

    def go_back_home(self):
        print("Navigating back to home page...")

        self.driver.back()

        from tests.pages.home_page import HomePage
        home_page = HomePage(self.driver)
        home_page.wait_for_homepage_loaded()

    def refresh_history(self):
        self.driver.refresh()
        self.wait_for_visibility(self.locators.HISTORY_HEADER)

    # ---------------------------------------------------
    # Record Count
    # ---------------------------------------------------

    def get_record_count_text(self):
        return self.get_text(self.locators.RECORD_COUNT_TEXT)

    def get_record_count_number(self):
        """
        Extract numeric record count from text such as:
        'You 10 records', '1,234 records', or 'Showing 1-20 of 130'
        """
        if not self.is_visible(self.locators.RECORD_COUNT_TEXT, timeout=5):
            return 0

        text = self.get_record_count_text()

        numbers = re.findall(r"\d[\d,]*", text)
        if not numbers:
            return 0

        parsed_numbers = [int(n.replace(",", "")) for n in numbers]
        return max(parsed_numbers)

    # ✅ BDD-friendly alias (NEW)
    def get_record_count(self):
        return self.get_record_count_number()

    def wait_for_record_count_to_increase(self, initial_count, timeout=20):
        WebDriverWait(self.driver, timeout).until(
            lambda _: self.get_record_count_number() > initial_count
        )

    def wait_for_record_count_to_be(self, expected_count, timeout=20):
        WebDriverWait(self.driver, timeout).until(
            lambda _: self.get_record_count_number() >= expected_count
        )

    # ✅ Strong assertion (NEW - backward compatible)
    def verify_record_count_increased(self, before_count, timeout=20):
        self.wait_for_record_count_to_increase(before_count, timeout)

        after = self.get_record_count_number()

        assert after > before_count, (
            f"Record count did not increase. Before: {before_count}, After: {after}"
        )

        print(f"Record count increased: {before_count} → {after}")

    # ---------------------------------------------------
    # Cards
    # ---------------------------------------------------

    def get_history_cards(self):
        if self.get_record_count_number() == 0:
            return []

        cards = self.find_all(self.locators.HISTORY_CARDS)
        return [card for card in cards if card.is_displayed()]

    def get_latest_card(self):
        cards = self.get_history_cards()
        return cards[0] if cards else None

    def verify_latest_record_exists(self):
        cards = self.get_history_cards()

        assert cards, "No history records found"

        latest = cards[0]
        assert latest.is_displayed(), "Latest record is not visible"

        print("Latest history record is visible")

    def open_latest_transaction(self):
        cards = self.get_history_cards()
        assert cards, "No transactions found"

        card = cards[0]

        # Scroll + click (stable)
        self.driver.execute_script(
            "arguments[0].scrollIntoView({block:'center'});", card
        )
        self.driver.execute_script("arguments[0].click();", card)

    # ---------------------------------------------------
    # Edit Flow
    # ---------------------------------------------------

    def click_edit_transaction(self):
        edit_btn = self.wait_for_clickable(self.locators.EDIT_BUTTON)
        self.safe_click(edit_btn)

    # ---------------------------------------------------
    # Quantity Validation
    # ---------------------------------------------------

    def get_latest_quantity(self):
        card = self.get_latest_card()
        assert card, "No latest transaction card found"

        text = card.text

        print(f"[DEBUG CARD TEXT]\n{text}")

        match = re.search(r"(\d+)\s*/\s*\d+", text)

        if not match:
            raise AssertionError(f"Quantity not found in card text: {text}")

        return int(match.group(1))

    def wait_for_latest_quantity(self, expected_qty, timeout=15):
        """
        CI-safe retry with optional refresh
        """
        for _ in range(timeout):
            try:
                qty = self.get_latest_quantity()
                if qty == expected_qty:
                    return
            except Exception:
                pass

            time.sleep(1)
            self.refresh_history()

        raise AssertionError(
            f"Updated quantity not reflected in history. Expected: {expected_qty}"
        )

    # ---------------------------------------------------
    # States
    # ---------------------------------------------------

    def is_no_transactions_message_visible(self):
        return self.is_visible(
            self.locators.NO_TRANSACTIONS_MESSAGE,
            timeout=5
        )

    # ---------------------------------------------------
    # Debug
    # ---------------------------------------------------

    def debug_print_cards(self):
        cards = self.get_history_cards()
        print(f"[DEBUG] Total visible cards: {len(cards)}")

        for i, card in enumerate(cards):
            text = card.text.strip()
            preview = text[:40] + "..." if len(text) > 40 else text
            print(f"[CARD {i}] length={len(text)} preview='{preview}'")