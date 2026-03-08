from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.wait import WebDriverWait
from tests.pages.base_page import BasePage
from tests.utilities.locators import HistoryPageLocators, CommonLocators


class HistoryPage(BasePage):

    def __init__(self, driver):
        super().__init__(driver)
        self.locators = HistoryPageLocators
        self.common_locators = CommonLocators
        self.wait = WebDriverWait(driver, 15)

    # ---------- Navigation ----------

    def open_history(self):
        """
        Click History menu and wait until History page loads.
        """
        self.click(self.common_locators.HISTORY_MENU_BUTTON)

        self.wait.until(
            EC.text_to_be_present_in_element(
                self.locators.HISTORY_HEADER,
                "History"
            )
        )

    # ---------- Record Count ----------

    def get_record_count_text(self):
        return self.get_text(self.locators.RECORD_COUNT_TEXT)

    def get_record_count_number(self):
        """
        Extract numeric record count from 'You 10 records'
        """
        if not self.is_visible(self.locators.RECORD_COUNT_TEXT, timeout=5):
            return 0

        text = self.get_record_count_text()
        digits = ''.join(c for c in text if c.isdigit())
        return int(digits) if digits else 0

    # ---------- Card Retrieval ----------

    def get_history_cards(self):
        """
        Return visible history cards.

        Cards are located using the HISTORY_CARDS locator and filtered to include
        only displayed elements to avoid hidden DOM containers.
        """

        if self.get_record_count_number() == 0:
            return []

        cards = self.find_all(self.locators.HISTORY_CARDS)
        return [card for card in cards if card.is_displayed()]

    def get_latest_card(self):
        cards = self.get_history_cards()
        return cards[0] if cards else None

    # ---------- Utilities ----------

    def wait_for_record_count_to_be(self, expected_count, timeout=20):
        WebDriverWait(self.driver, timeout).until(
            lambda _: self.get_record_count_number() >= expected_count
        )

    def is_no_transactions_message_visible(self):
        return self.is_visible(
            self.locators.NO_TRANSACTIONS_MESSAGE,
            timeout=5
        )