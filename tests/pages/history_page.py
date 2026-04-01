from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.wait import WebDriverWait
from tests.pages.base_page import BasePage
from tests.utilities.locators import HistoryPageLocators, CommonLocators
import re


class HistoryPage(BasePage):

    def __init__(self, driver):
        super().__init__(driver)
        self.locators = HistoryPageLocators
        self.common_locators = CommonLocators
        self.wait = WebDriverWait(driver, 15)

    # ---------- Navigation ----------

    def open_history(self):
        """
        Click History menu and wait until History page fully loads.
        """
        self.click(self.common_locators.HISTORY_MENU_BUTTON)

        self.wait.until(
            EC.text_to_be_present_in_element(
                self.locators.HISTORY_HEADER,
                "History"
            )
        )

        WebDriverWait(self.driver, 10).until(
            lambda d: (
                d.find_elements(*self.locators.RECORD_COUNT_TEXT)
                or d.find_elements(*self.locators.NO_TRANSACTIONS_MESSAGE)
            )
        )

    # ---------- Record Count ----------

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

        # Extract all numeric values (including formatted numbers with commas)
        numbers = re.findall(r"\d[\d,]*", text)

        if not numbers:
            return 0

        # Remove commas and convert to integers
        parsed_numbers = [int(n.replace(",", "")) for n in numbers]

        # Return the largest number (typically the total record count)
        return max(parsed_numbers)

    # ---------- Card Retrieval ----------

    def get_history_cards(self):
        """
        Return only visible history cards
        """
        if self.get_record_count_number() == 0:
            return []

        cards = self.find_all(self.locators.HISTORY_CARDS)
        return [card for card in cards if card.is_displayed()]

    def get_latest_card(self):
        cards = self.get_history_cards()
        return cards[0] if cards else None

    # ---------- Wait Utilities ----------

    def wait_for_record_count_to_increase(self, initial_count, timeout=20):
        """
        Wait until record count increases (CI-safe)
        """
        WebDriverWait(self.driver, timeout).until(
            lambda _: self.get_record_count_number() > initial_count
        )

    def wait_for_record_count_to_be(self, expected_count, timeout=20):
        """
        Wait until record count reaches at least the expected value.
        Final equality should be asserted in the test.
        """
        WebDriverWait(self.driver, timeout).until(
            lambda _: self.get_record_count_number() >= expected_count
        )

    # ---------- Misc ----------

    def is_no_transactions_message_visible(self):
        return self.is_visible(
            self.locators.NO_TRANSACTIONS_MESSAGE,
            timeout=5
        )

    # ---------- Debug (optional) ----------

    def debug_print_cards(self):
        cards = self.get_history_cards()
        print(f"[DEBUG] Total visible cards: {len(cards)}")

        for i, card in enumerate(cards):
            text = card.text.strip()
            preview = text[:30] + "..." if len(text) > 30 else text

            print(f"[CARD {i}] length={len(text)} preview='{preview}'")