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

    before_count = history_page.get_record_count()

    # ---------------------------------------------------
    # Act
    # ---------------------------------------------------
    selected_resident_name = checkout_page.complete_checkout("Curtains")

    history_page.open_history()

    # ---------------------------------------------------
    # Assert
    # ---------------------------------------------------
    history_page.verify_record_count_increased(
        before_count=before_count,
        timeout=30
    )

    matching_card = history_page.get_card_matching(
        resident_name=selected_resident_name,
        item_name=None
    )

    assert matching_card is not None, \
        f"History card should exist for resident: {selected_resident_name}"

    assert matching_card.is_displayed(), \
        f"History card should be visible for resident: {selected_resident_name}"
