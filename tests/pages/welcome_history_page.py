"""Read-only Welcome Basket History assertions using rendered UI only."""
import json
import re
import time
from urllib.parse import urlsplit

import allure
import pytest
from selenium.common.exceptions import StaleElementReferenceException
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

from tests.pages.base_page import BasePage
from tests.utilities.login_diagnostics import redact, safe_url


class WelcomeHistoryPage(BasePage):
    DATE_PRESETS = ("last 30 days", "this year", "last year")
    HEADINGS = (By.XPATH, "//h3[starts-with(normalize-space(.), 'Welcome Basket:')]")
    COUNT = (By.XPATH, "//p[starts-with(normalize-space(.), 'Showing ') and contains(., 'total')]")

    def wait_loaded(self):
        def ready(driver):
            for alert in driver.find_elements(By.CSS_SELECTOR, "[role='alert']"):
                if alert.is_displayed() and alert.text.strip():
                    raise AssertionError("History UI error: " + redact(alert.text))
            if any(el.is_displayed() for el in driver.find_elements(By.CSS_SELECTOR, "[role='progressbar']")):
                return False
            counts = driver.find_elements(*self.COUNT)
            return next((el for el in counts if el.is_displayed()), False)
        return WebDriverWait(self.driver, 20, ignored_exceptions=(StaleElementReferenceException,)).until(
            ready, "History did not successfully finish loading"
        )

    def open(self):
        self.click(self.common_locators.HISTORY_MENU_BUTTON)
        self.wait_loaded()
        self.click((By.CSS_SELECTOR, "button[value='checkout']"))
        self.get_wait(10).until(lambda d: d.find_element(
            By.CSS_SELECTOR, "button[value='checkout']"
        ).get_attribute("aria-pressed") == "true")
        self.click((By.ID, "select-building"))
        self.click((By.CSS_SELECTOR, "li[role='option'][data-value='all']"))
        self.get_wait(10).until(lambda d: d.find_element(
            By.XPATH, "//*[@id='select-building']/parent::*//input"
        ).get_attribute("value") == "all")
        self.wait_loaded()

    def set_date(self, preset):
        previous_count = self.wait_loaded()
        self.click((By.ID, "select-date"))
        self.click((By.CSS_SELECTOR, f"li[role='option'][data-value='{preset}']"))
        self.get_wait(10).until(lambda d: d.find_element(
            By.XPATH, "//*[@id='select-date']/parent::*//input"
        ).get_attribute("value") == preset)
        # Loading unmounts the old count even if the fetch finishes between polls.
        self.get_wait(20).until(EC.staleness_of(previous_count), "History date filter did not reload results")
        self.wait_loaded()

    def card_details(self, heading):
        assert heading.is_displayed(), "Selected Welcome Basket heading is not visible"
        # Exactly the two parent divs rendered by WelcomeBasketCard/HistoryCard.
        card = heading.find_element(By.XPATH, "./parent::div/parent::div")
        assert card.is_displayed(), "Selected Welcome Basket card is not visible"
        assert len(card.find_elements(By.TAG_NAME, "h3")) == 1, "Welcome Basket locator includes multiple cards"
        title = heading.text.strip()
        assert title.startswith("Welcome Basket:"), "Selected card is not a Welcome Basket transaction"
        paragraphs = card.find_elements(By.TAG_NAME, "p")
        assert len(paragraphs) == 2, "Unexpected Welcome Basket details container"
        quantities = {el.text.strip() for el in card.find_elements(By.TAG_NAME, "span")
                      if re.fullmatch(r"\d+x", el.text.strip())}
        assert len(quantities) == 1, "Welcome Basket quantity chip is missing or ambiguous"
        return card, {"heading": title, "building": paragraphs[0].text.strip(),
                      "displayed_date": paragraphs[1].text.strip(), "quantity": quantities.pop()}

    def find_existing(self, report):
        searched = []
        for preset in self.DATE_PRESETS:
            self.set_date(preset)
            searched.append(preset)
            # Content-only selection: interactive regressions must still be selected.
            headings = self.driver.find_elements(*self.HEADINGS)
            if headings:
                card, details = self.card_details(headings[0])
                details.update(date_filter=preset, building_filter="All Buildings", searched_ranges=searched)
                report(details)
                return card, details
        report({"selected_record": None, "building_filter": "All Buildings", "searched_ranges": searched})
        pytest.skip("No Welcome Basket History card found after successful loading for All Buildings in: "
                    + ", ".join(searched))

    def assert_no_edit_control(self, card):
        for control in card.find_elements(By.XPATH, ".//*[self::button or self::a or @role='button' or @aria-label or @title]"):
            label = " ".join([control.text, control.get_attribute("aria-label") or "", control.get_attribute("title") or ""])
            assert not (control.is_displayed() and re.search(r"\bedit\b", label, re.I)), (
                "Welcome Basket card exposes an Edit control"
            )

    def assert_passive(self, card, observation_seconds=2):
        original_location = urlsplit(self.driver.current_url)
        assert original_location.path.rstrip("/") == "/history", "Expected History before card click"

        def assert_unchanged():
            self.assert_no_edit_control(card)
            current = urlsplit(self.driver.current_url)
            assert (current.scheme, current.netloc, current.path, current.query, current.fragment) == (
                original_location.scheme, original_location.netloc, original_location.path, original_location.query, original_location.fragment
            ), "Welcome Basket click navigated away from History: " + safe_url(self.driver.current_url)
            for dialog in self.driver.find_elements(By.CSS_SELECTOR,
                "[data-testid='transaction-details-content'], [data-testid='checkout-summary-dialog'], [data-edit-mode='true']"):
                assert not dialog.is_displayed(), "Welcome Basket click opened transaction details or checkout editing"

        assert_unchanged()
        self.driver.execute_script("arguments[0].scrollIntoView({block:'center'});", card)
        card.click()  # Click failures remain test errors, never evidence of passivity.
        started = time.monotonic()

        def observe(driver):
            assert_unchanged()
            return time.monotonic() - started >= observation_seconds

        WebDriverWait(self.driver, observation_seconds + 1, poll_frequency=0.1).until(
            observe, "Could not finish the Welcome Basket non-editability observation"
        )


def report_history_record(record_property, details):
    payload = json.dumps(details, indent=2)
    record_property("welcome_basket_history_record", payload)
    allure.attach(payload, name="Selected Welcome Basket History record", attachment_type=allure.attachment_type.JSON)
    print("Welcome Basket History evidence: " + payload)
