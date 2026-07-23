import re
import time

from selenium.common.exceptions import (
    NoSuchElementException,
    StaleElementReferenceException,
    TimeoutException,
)
from selenium.webdriver.support.ui import WebDriverWait

from tests.pages.base_page import BasePage
from tests.utilities.locators import (
    CommonLocators,
    HistoryPageLocators,
)


class HistoryPage(BasePage):

    def __init__(self, driver):
        super().__init__(driver)

        self.locators = HistoryPageLocators
        self.common_locators = CommonLocators
        self.wait = WebDriverWait(
            driver,
            timeout=15,
            poll_frequency=1,
            ignored_exceptions=(
                NoSuchElementException,
                StaleElementReferenceException,
            ),
        )

    # ---------------------------------------------------
    # Navigation
    # ---------------------------------------------------

    def open_history(self) -> None:
        print("Opening history page...")

        self.click(
            self.common_locators.HISTORY_MENU_BUTTON
        )

        self.wait_for_history_page_loaded()

        print("History page loaded")

    def wait_for_history_page_loaded(
        self,
        timeout: int = 20,
    ) -> None:
        wait = WebDriverWait(
            self.driver,
            timeout,
            poll_frequency=1,
            ignored_exceptions=(
                NoSuchElementException,
                StaleElementReferenceException,
            ),
        )

        wait.until(
            lambda driver: (
                len(
                    driver.find_elements(
                        *self.locators.HISTORY_HEADER
                    )
                )
                > 0
            )
        )

        wait.until(
            lambda driver: (
                len(
                    driver.find_elements(
                        *self.locators.RECORD_COUNT_TEXT
                    )
                )
                > 0
                or len(
                    driver.find_elements(
                        *self.locators.NO_TRANSACTIONS_MESSAGE
                    )
                )
                > 0
            )
        )

    def go_back_home(self) -> None:
        print("Navigating back to home page...")

        self.driver.back()

        from tests.pages.home_page import HomePage

        home_page = HomePage(self.driver)
        home_page.wait_for_homepage_loaded()

    def refresh_history(self) -> None:
        self.driver.refresh()
        self.wait_for_history_page_loaded()

    # ---------------------------------------------------
    # Record Count
    # ---------------------------------------------------

    def get_record_count_text(self) -> str:
        return self.get_text(
            self.locators.RECORD_COUNT_TEXT
        ).strip()

    def get_record_count_number(self) -> int:
        """
        Extract the total record count from text such as:

        - Showing 13 records total
        - 1,234 records
        - Showing 1-20 of 130
        """
        if self.is_no_transactions_message_visible():
            return 0

        if not self.is_visible(
            self.locators.RECORD_COUNT_TEXT,
            timeout=10,
        ):
            raise AssertionError(
                "History record count text is not visible"
            )

        text = self.get_record_count_text()

        print(
            f"History record count raw text: {text!r}"
        )

        total_match = re.search(
            r"Showing\s+([\d,]+)\s+records?\s+total",
            text,
            re.IGNORECASE,
        )

        if total_match:
            return int(
                total_match.group(1).replace(",", "")
            )

        range_total_match = re.search(
            r"\bof\s+([\d,]+)\b",
            text,
            re.IGNORECASE,
        )

        if range_total_match:
            return int(
                range_total_match.group(1).replace(
                    ",",
                    "",
                )
            )

        generic_records_match = re.search(
            r"([\d,]+)\s+records?\b",
            text,
            re.IGNORECASE,
        )

        if generic_records_match:
            return int(
                generic_records_match.group(1).replace(
                    ",",
                    "",
                )
            )

        raise AssertionError(
            "Could not parse history record count "
            f"from: {text!r}"
        )

    def get_record_count(self) -> int:
        return self.get_record_count_number()

    def wait_for_record_count_to_increase(
        self,
        previous_count: int,
        timeout: int = 20,
    ) -> int:
        def count_increased(_driver):
            try:
                current_count = (
                    self.get_record_count_number()
                )

                if current_count > previous_count:
                    return current_count

                return False

            except (
                AssertionError,
                NoSuchElementException,
                StaleElementReferenceException,
            ):
                return False

        increased_count = WebDriverWait(
            self.driver,
            timeout,
            poll_frequency=1,
            ignored_exceptions=(
                NoSuchElementException,
                StaleElementReferenceException,
            ),
        ).until(count_increased)

        return int(increased_count)

    def wait_for_record_count_to_be(
        self,
        expected_count: int,
        timeout: int = 20,
    ) -> int:
        def expected_count_reached(_driver):
            try:
                current_count = (
                    self.get_record_count_number()
                )

                if current_count >= expected_count:
                    return current_count

                return False

            except (
                AssertionError,
                NoSuchElementException,
                StaleElementReferenceException,
            ):
                return False

        reached_count = WebDriverWait(
            self.driver,
            timeout,
            poll_frequency=1,
            ignored_exceptions=(
                NoSuchElementException,
                StaleElementReferenceException,
            ),
        ).until(expected_count_reached)

        return int(reached_count)

    def verify_record_count_increased(
        self,
        before_count: int,
        timeout: int = 20,
    ) -> None:
        after_count = (
            self.wait_for_record_count_to_increase(
                previous_count=before_count,
                timeout=timeout,
            )
        )

        assert after_count > before_count, (
            "Record count did not increase. "
            f"Before: {before_count}, "
            f"After: {after_count}"
        )

        print(
            "Record count increased: "
            f"{before_count} -> {after_count}"
        )

    # ---------------------------------------------------
    # Cards
    # ---------------------------------------------------

    def get_history_cards(self):
        if self.get_record_count_number() == 0:
            return []

        cards = self.find_all(
            self.locators.HISTORY_CARDS
        )

        return [
            card
            for card in cards
            if card.is_displayed()
        ]

    def get_latest_card(self):
        cards = self.get_history_cards()

        if not cards:
            return None

        return cards[0]

    def verify_latest_record_exists(self) -> None:
        cards = self.get_history_cards()

        assert cards, "No history records found"

        latest = cards[0]

        assert latest.is_displayed(), (
            "Latest record is not visible"
        )

        print("Latest history record is visible")

    def verify_item_exists(
        self,
        item_name: str,
    ) -> None:
        if not item_name or not item_name.strip():
            raise ValueError(
                "Item name cannot be empty"
            )

        expected_item = item_name.strip().lower()

        cards = self.get_history_cards()

        matching_card = next(
            (
                card
                for card in cards
                if expected_item
                in card.text.strip().lower()
            ),
            None,
        )

        if matching_card is None:
            raise AssertionError(
                "Expected checkout record was not found in the "
                "visible history records"
            )

        print(
            f"History item is visible: {item_name}"
        )

    def open_latest_transaction(self) -> None:
        card = self.get_latest_card()

        assert card is not None, (
            "No transactions found"
        )

        self.driver.execute_script(
            "arguments[0].scrollIntoView("
            "{block: 'center'}"
            ");",
            card,
        )

        try:
            card.click()

        except (
            StaleElementReferenceException,
            NoSuchElementException,
        ):
            card = self.get_latest_card()

            assert card is not None, (
                "Latest transaction disappeared "
                "before it could be opened"
            )

            self.driver.execute_script(
                "arguments[0].click();",
                card,
            )

    # ---------------------------------------------------
    # Edit Flow
    # ---------------------------------------------------

    def click_edit_transaction(self) -> None:
        edit_button = self.wait_for_clickable(
            self.locators.EDIT_BUTTON
        )

        self.safe_click(edit_button)

    # ---------------------------------------------------
    # Quantity Validation
    # ---------------------------------------------------

    def get_latest_quantity(self) -> int:
        card = self.get_latest_card()

        assert card is not None, (
            "No latest transaction card found"
        )

        text = card.text.strip()

        print(
            f"[DEBUG CARD TEXT]\n{text}"
        )

        match = re.search(
            r"(\d+)\s*/\s*\d+",
            text,
        )

        if match is None:
            raise AssertionError(
                "Quantity was not found in "
                f"latest card text: {text!r}"
            )

        return int(match.group(1))

    def wait_for_latest_quantity(
        self,
        expected_qty: int,
        timeout: int = 15,
    ) -> None:
        end_time = time.monotonic() + timeout
        last_quantity = None

        while time.monotonic() < end_time:
            try:
                last_quantity = (
                    self.get_latest_quantity()
                )

                if last_quantity == expected_qty:
                    return

            except (
                AssertionError,
                NoSuchElementException,
                StaleElementReferenceException,
            ):
                pass

            time.sleep(1)
            self.refresh_history()

        raise AssertionError(
            "Updated quantity was not reflected "
            "in history. "
            f"Expected: {expected_qty}, "
            f"Last observed: {last_quantity}"
        )

    # ---------------------------------------------------
    # States
    # ---------------------------------------------------

    def is_no_transactions_message_visible(
        self,
    ) -> bool:
        return self.is_visible(
            self.locators.NO_TRANSACTIONS_MESSAGE,
            timeout=3,
        )

    # ---------------------------------------------------
    # Debug
    # ---------------------------------------------------

    def debug_print_cards(self) -> None:
        cards = self.get_history_cards()

        print(
            f"[DEBUG] Total visible cards: "
            f"{len(cards)}"
        )

        for index, card in enumerate(cards):
            text = card.text.strip()

            preview = (
                f"{text[:40]}..."
                if len(text) > 40
                else text
            )

            print(
                f"[CARD {index}] "
                f"length={len(text)} "
                f"preview={preview!r}"
            )