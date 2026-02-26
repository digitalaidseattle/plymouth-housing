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

    def open_history(self):
        self.click(self.common_locators.HISTORY_MENU_BUTTON)


    def verify_history_header(self):
        assert self.is_visible(
            self.locators.HISTORY_HEADER
        ), "History header not visible"

    def get_record_count_text(self):
        return self.get_text(self.locators.RECORD_COUNT_TEXT)

    def get_record_count_number(self):
        text = self.get_record_count_text()
        digits = ''.join(c for c in text if c.isdigit())
        if not digits:
            raise AssertionError(f"Record count text had no digits: '{text}'")
        return int(digits)

    def get_history_cards(self):
        return self.wait.until(
            EC.presence_of_all_elements_located(
                self.locators.HISTORY_CARDS
            )
        )

    def get_latest_card(self):
        cards = self.get_history_cards()
        return cards[0] if cards else None

    def wait_for_record_count_change(self, old_count, timeout=10):
        WebDriverWait(self.driver, timeout).until(
            lambda d: self.get_record_count_number() != old_count
        )