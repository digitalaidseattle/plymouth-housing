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

        self.wait_for_visibility(self.locators.HISTORY_HEADER)

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

        self.get_wait(15).until(
            lambda d: (
                len(d.find_elements(*self.locators.RECORD_COUNT_TEXT)) > 0
                or len(d.find_elements(*self.locators.NO_TRANSACTIONS_MESSAGE)) > 0
            )
        )

    # ---------------------------------------------------
    # Safe logging helpers
    # ---------------------------------------------------

    def log_safe_card_found(self):
        """
        Do not print full card text.

        History cards may contain resident names, building/unit information,
        timestamps, and transaction details. Since this is a public/open-source
        project, test logs should avoid exposing resident-related data.
        """
        print("[MATCHED CARD] Matching history card found")

    def log_safe_quantity_found(self, quantity):
        """
        Log only the extracted quantity, not the full card text.
        """
        print(f"[MATCHED QUANTITY] Quantity found: {quantity}")

    def log_safe_card_count(self, count):
        """
        Log only card count, not card contents.
        """
        print(f"[DEBUG] Visible history cards found: {count}")

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

    def get_record_count(self):
        return self.get_record_count_number()

    def wait_for_record_count_to_increase(self, initial_count, timeout=30):
        """
        Wait until the history record count increases.

        This is safer for checkout tests because the History page may not
        update immediately after checkout. It retries and refreshes the
        History page before failing.
        """
        end_time = time.time() + timeout
        last_count = self.get_record_count_number()

        while time.time() < end_time:
            current_count = self.get_record_count_number()

            if current_count > initial_count:
                print(f"Record count increased: {initial_count} → {current_count}")
                return current_count

            last_count = current_count
            time.sleep(1)

            try:
                self.refresh_history()
            except Exception as e:
                print(f"[WARN] History refresh retry failed: {e}")

        raise AssertionError(
            f"Record count did not increase. "
            f"Before: {initial_count}, After: {last_count}"
        )

    def wait_for_record_count_to_be(self, expected_count, timeout=30):
        """
        Wait until the history record count is at least the expected count.
        """
        end_time = time.time() + timeout
        last_count = self.get_record_count_number()

        while time.time() < end_time:
            current_count = self.get_record_count_number()

            if current_count >= expected_count:
                print(f"Record count reached expected value: {current_count}")
                return current_count

            last_count = current_count
            time.sleep(1)

            try:
                self.refresh_history()
            except Exception as e:
                print(f"[WARN] History refresh retry failed: {e}")

        raise AssertionError(
            f"Record count did not reach expected value. "
            f"Expected at least: {expected_count}, Actual: {last_count}"
        )

    def verify_record_count_increased(self, before_count, timeout=30):
        after = self.wait_for_record_count_to_increase(before_count, timeout)

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
        visible_cards = [card for card in cards if card.is_displayed()]

        self.log_safe_card_count(len(visible_cards))

        return visible_cards

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

        self.driver.execute_script(
            "arguments[0].scrollIntoView({block:'center'});", card
        )

        self.driver.execute_script("arguments[0].click();", card)

        self.wait_for_visibility(self.locators.TRANSACTION_DETAILS_DIALOG)

        print("Latest transaction details opened")

    def get_card_matching(self, resident_name=None, item_name=None):
        """
        Find a visible history card by resident name and/or item name.

        Do not print the matched card text because it may contain resident
        names, housing/building information, unit numbers, and timestamps.
        """
        cards = self.get_history_cards()

        for card in cards:
            text = card.text

            resident_matches = (
                resident_name is None
                or resident_name.lower() in text.lower()
            )

            item_matches = (
                item_name is None
                or item_name.lower() in text.lower()
            )

            if resident_matches and item_matches:
                self.log_safe_card_found()
                return card

        raise AssertionError(
            "No matching history card found"
        )

    def open_transaction_matching(self, resident_name=None, item_name=None):
        """
        Open a specific transaction card instead of blindly opening latest.

        Do not log resident_name or item_name because these values may contain
        sensitive resident-related data.
        """
        card = self.get_card_matching(
            resident_name=resident_name,
            item_name=item_name
        )

        self.driver.execute_script(
            "arguments[0].scrollIntoView({block:'center'});", card
        )

        self.driver.execute_script("arguments[0].click();", card)

        self.wait_for_visibility(self.locators.TRANSACTION_DETAILS_DIALOG)

        print("Transaction details opened for matching history card")

    # ---------------------------------------------------
    # Transaction Details Modal
    # ---------------------------------------------------

    def click_edit_transaction(self):
        self.wait_for_visibility(self.locators.TRANSACTION_DETAILS_DIALOG)

        edit_btn = self.wait_for_clickable(self.locators.EDIT_BUTTON)

        self.driver.execute_script(
            "arguments[0].scrollIntoView({block:'center'});", edit_btn
        )

        self.driver.execute_script("arguments[0].click();", edit_btn)

        print("Edit transaction button clicked")

    def close_transaction_details(self):
        self.wait_for_visibility(self.locators.TRANSACTION_DETAILS_DIALOG)

        close_btn = self.wait_for_clickable(self.locators.DIALOG_CLOSE_BUTTON)

        self.driver.execute_script("arguments[0].click();", close_btn)

        print("Transaction details modal closed")

    def expand_history_accordion(self):
        self.wait_for_visibility(self.locators.TRANSACTION_DETAILS_DIALOG)

        accordion = self.wait_for_clickable(self.locators.HISTORY_ACCORDION)

        self.driver.execute_script("arguments[0].click();", accordion)

        print("History accordion expanded")

    # ---------------------------------------------------
    # Quantity Validation
    # ---------------------------------------------------

    def extract_quantity_from_text(self, text):
        """
        Extract quantity from text like '1 / 10' or '2 / 10'.
        """
        match = re.search(r"(\d+)\s*/\s*\d+", text)

        if not match:
            raise AssertionError("Quantity not found in history card text")

        return int(match.group(1))

    def get_latest_quantity(self):
        card = self.get_latest_card()

        assert card, "No latest transaction card found"

        quantity = self.extract_quantity_from_text(card.text)

        self.log_safe_quantity_found(quantity)

        return quantity

    def wait_for_latest_quantity(self, expected_qty, timeout=15):
        """
        Wait until latest history card shows the expected quantity.
        Refreshes History while waiting to reduce flaky failures.
        """
        last_qty = None

        for _ in range(timeout):
            try:
                qty = self.get_latest_quantity()
                last_qty = qty

                if qty == expected_qty:
                    print(f"Latest quantity matched expected value: {expected_qty}")
                    return qty

            except Exception as e:
                print(f"[WARN] Latest quantity retry failed: {e}")

            time.sleep(1)

            try:
                self.refresh_history()
            except Exception as e:
                print(f"[WARN] History refresh retry failed: {e}")

        raise AssertionError(
            f"Updated quantity not reflected in latest history card. "
            f"Expected: {expected_qty}, Last seen: {last_qty}"
        )

    def get_quantity_from_card_matching(self, resident_name=None, item_name=None):
        """
        Get quantity from a specific history card matching resident/item.

        Do not print full card text because it may contain resident-related data.
        """
        card = self.get_card_matching(
            resident_name=resident_name,
            item_name=item_name
        )

        quantity = self.extract_quantity_from_text(card.text)

        self.log_safe_quantity_found(quantity)

        return quantity

    def wait_for_quantity_from_card_matching(
        self,
        resident_name=None,
        item_name=None,
        expected_qty=None,
        timeout=30
    ):
        """
        Wait until a matching history card shows the expected quantity.

        Use this for edit-flow tests where relying on the first/latest card
        can be flaky because multiple transactions may exist.
        """
        assert expected_qty is not None, "expected_qty is required"

        end_time = time.time() + timeout
        last_qty = None

        while time.time() < end_time:
            try:
                qty = self.get_quantity_from_card_matching(
                    resident_name=resident_name,
                    item_name=item_name
                )

                last_qty = qty

                if qty == expected_qty:
                    print(f"Matched card quantity updated: {expected_qty}")
                    return qty

            except Exception as e:
                print(f"[WARN] Matching card quantity retry failed: {e}")

            time.sleep(1)

            try:
                self.refresh_history()
            except Exception as e:
                print(f"[WARN] History refresh failed: {e}")

        raise AssertionError(
            f"Updated quantity not reflected for matching history card. "
            f"Expected: {expected_qty}, Last seen: {last_qty}"
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
        """
        Safe debug output only.

        Do not print card text because history cards may contain resident names,
        building/unit information, timestamps, and transaction details.
        """
        cards = self.get_history_cards()

        print(f"[DEBUG] Total visible cards: {len(cards)}")

        for i, card in enumerate(cards):
            is_visible = card.is_displayed()
            has_text = bool(card.text.strip())

            print(
                f"[CARD {i}] "
                f"visible={is_visible}, "
                f"has_text={has_text}"
            )
