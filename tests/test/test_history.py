import pytest
from selenium.webdriver.support.wait import WebDriverWait


# ---------------------------------------------------
# TEST 1 — Count Increase (CI SAFE)
# ---------------------------------------------------

@pytest.mark.usefixtures("login_with_volunteer")
@pytest.mark.regression
def test_checkout_increases_history_count(
        checkout_page,
        history_page):

    # ---------------------------------------------------
    # Arrange
    # ---------------------------------------------------
    history_page.open_history()

    initial_count = history_page.get_record_count_number()
    print(f"[BEFORE] History count: {initial_count}")

    # ---------------------------------------------------
    # Act
    # ---------------------------------------------------
    checkout_page.complete_checkout("Curtains")

    history_page.open_history()

    #  deterministic wait (NO +1 assumption)
    history_page.wait_for_record_count_to_increase(initial_count)

    # ---------------------------------------------------
    # Assert
    # ---------------------------------------------------
    new_count = history_page.get_record_count_number()
    print(f"[AFTER] History count: {new_count}")

    assert new_count > initial_count, (
        f"History did not increase → Before: {initial_count}, After: {new_count}"
    )


# ---------------------------------------------------
# TEST 2 — UI VALIDATION (STRONG)
# ---------------------------------------------------

@pytest.mark.usefixtures("login_with_volunteer")
@pytest.mark.regression
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

    #  wait until NEW card appears (robust)
    def new_card_loaded(_):
        card = history_page.get_latest_card()
        return (
            card is not None and
            card.text.strip() != "" and
            card.text.strip() != previous_text
        )

    WebDriverWait(history_page.driver, 20).until(new_card_loaded)

    latest_card = history_page.get_latest_card()
    latest_text = latest_card.text.strip()
    latest_text_lc = latest_text.lower()

    print(f"[LATEST CARD]\n{latest_text}")

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
        f"Missing 'created' timestamp → {latest_text}"
    )

    # ---------------------------------------------------
    # Assert 3: Recency (CI SAFE)
    # formatTransactionDate always produces "Created today at HH:MM AM/PM"
    # for same-day transactions — never relative "sec ago" / "min ago"
    # ---------------------------------------------------
    assert "created today at" in latest_text_lc, (
        f"History entry not from today → {latest_text}"
    )