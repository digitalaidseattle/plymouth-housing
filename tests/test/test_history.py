import pytest
import re
from selenium.webdriver.support.wait import WebDriverWait


def _has_recent_history_timestamp(text):
    """
    Accept both relative timestamps and the current app format.

    The app can render either:
    - Created just now
    - Created 30 sec ago
    - Created 2 min ago
    - Created today at 12:48 AM
    """
    text_lc = text.lower()

    recent_minutes = re.search(r"(\d+)\s*min ago", text_lc)

    return (
        "sec ago" in text_lc
        or "just now" in text_lc
        or "created today at" in text_lc
        or (
            recent_minutes is not None
            and int(recent_minutes.group(1)) <= 5
        )
    )


# ---------------------------------------------------
# TEST 1 — Visible Card Count Increase (CI SAFE)
# ---------------------------------------------------

@pytest.mark.usefixtures("login_with_volunteer")
@pytest.mark.smoke
def test_checkout_increases_history_count(
        checkout_page,
        history_page):

    # ---------------------------------------------------
    # Arrange
    # ---------------------------------------------------
    history_page.open_history()

    initial_count = history_page.get_visible_record_count()
    print(f"[BEFORE] Visible history card count: {initial_count}")

    # ---------------------------------------------------
    # Act
    # ---------------------------------------------------
    checkout_page.complete_checkout("Curtains")

    history_page.open_history()

    # The record-count text can include unrelated numbers such as year/footer
    # values, so this test uses rendered history cards instead.
    history_page.wait_for_visible_record_count_to_increase(initial_count)

    # ---------------------------------------------------
    # Assert
    # ---------------------------------------------------
    new_count = history_page.get_visible_record_count()
    print(f"[AFTER] Visible history card count: {new_count}")

    assert new_count > initial_count, (
        f"History card count did not increase → "
        f"Before: {initial_count}, After: {new_count}"
    )


# ---------------------------------------------------
# TEST 2 — UI VALIDATION (STRONG)
# ---------------------------------------------------

@pytest.mark.usefixtures("login_with_volunteer")
@pytest.mark.serial
def test_checkout_reflected_in_history(
        checkout_page,
        history_page):

    # ---------------------------------------------------
    # Arrange
    # ---------------------------------------------------
    history_page.open_history()

    previous_latest = history_page.get_latest_card()
    previous_text = previous_latest.text.strip() if previous_latest else ""

    # ---------------------------------------------------
    # Act
    # ---------------------------------------------------
    checkout_page.complete_checkout("Curtains")

    history_page.open_history()

    # Wait until a new latest card appears.
    def new_card_loaded(_):
        card = history_page.get_latest_card()

        if card is None:
            return False

        card_text = card.text.strip()

        return (
            card_text != ""
            and card_text != previous_text
        )

    WebDriverWait(history_page.driver, 20).until(new_card_loaded)

    latest_card = history_page.get_latest_card()

    assert latest_card is not None, "Latest history card was not found"

    latest_text = latest_card.text.strip()
    latest_text_lc = latest_text.lower()

    # Do not print the full card text because it can contain resident/building data.
    print("[LATEST CARD] Latest history card loaded")

    # ---------------------------------------------------
    # Assert 1: Card changed
    # ---------------------------------------------------
    assert latest_text != previous_text, (
        "Latest history card did not update after checkout"
    )

    # ---------------------------------------------------
    # Assert 2: Timestamp exists
    # ---------------------------------------------------
    assert "created" in latest_text_lc, (
        "Latest history card is missing a created timestamp"
    )

    # ---------------------------------------------------
    # Assert 3: Recency / Today timestamp
    # ---------------------------------------------------
    assert _has_recent_history_timestamp(latest_text), (
        "Latest history card timestamp was not recent enough"
    )
