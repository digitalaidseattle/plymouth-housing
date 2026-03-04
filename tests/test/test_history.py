import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait


@pytest.mark.usefixtures("login_with_volunteer")
@pytest.mark.smoke
def test_checkout_increases_history_count(
        checkout_page,
        history_page):

    # --- Arrange ---
    history_page.open_history()

    # Ensure count is readable before proceeding
    initial_count = history_page.get_record_count_number()

    # --- Act ---
    checkout_page.complete_checkout("Curtains")

    history_page.open_history()

    # Deterministic wait for exact expected value
    expected_count = initial_count + 1
    history_page.wait_for_record_count_to_be(expected_count)

    # --- Assert ---
    new_count = history_page.get_record_count_number()

    assert new_count == expected_count, (
        f"Expected history count to increase by 1. "
        f"Before: {initial_count}, After: {new_count}"
    )


@pytest.mark.usefixtures("login_with_volunteer")
@pytest.mark.serial
def test_checkout_reflected_in_history(
        checkout_page,
        history_page):

    # --- Arrange ---
    history_page.open_history()

    previous_latest = history_page.get_latest_card()
    previous_text = previous_latest.text if previous_latest else ""

    # --- Act ---
    checkout_page.complete_checkout("Curtains")
    history_page.open_history()

    # Wait until latest card changes
    WebDriverWait(history_page.driver, 10).until(
        lambda d: (
            history_page.get_latest_card() is not None and
            history_page.get_latest_card().text != previous_text
        )
    )

    latest_card = history_page.get_latest_card()
    latest_text = latest_card.text

    # --- Assert 1: Latest card changed ---
    assert latest_text != previous_text, (
        "Latest history card did not change after checkout"
    )

    # --- Assert 2: Timestamp is fresh ---
    assert "Created" in latest_text and "ago" in latest_text, (
        f"Latest history card missing timestamp. Text: {latest_text}"
    )

    assert "0 min ago" in latest_text or "1 min ago" in latest_text, (
        f"Latest entry does not look recent. Text: {latest_text}"
    )