import pytest


# =====================================================
# Test Data
# =====================================================

ITEM_NAME = "Curtains"


# =====================================================
# Helpers
# =====================================================

def create_editable_checkout(checkout_page, item_name=ITEM_NAME):
    """
    Create a fresh editable checkout transaction and return
    the resident name selected/autofilled during checkout.
    """
    selected_resident_name = checkout_page.complete_checkout(item_name)

    assert selected_resident_name, \
        "Checkout did not return selected resident name"

    return selected_resident_name


def open_editable_transaction(
    history_page,
    selected_resident_name
):
    """
    Open the transaction that matches the actual resident selected
    during checkout and click Edit.

    History cards do not always show item names, so we match by resident.
    """
    history_page.open_history()

    history_page.open_transaction_matching(
        resident_name=selected_resident_name,
        item_name=None
    )

    history_page.click_edit_transaction()


def get_matching_quantity(
    history_page,
    selected_resident_name
):
    """
    Get quantity from the history card that matches the actual
    checkout resident.
    """
    return history_page.get_quantity_from_card_matching(
        resident_name=selected_resident_name,
        item_name=None
    )


# =====================================================
# SMOKE TEST
# =====================================================

@pytest.mark.smoke
@pytest.mark.edit_feature
def test_edit_prefills_data(
    driver,
    login_with_volunteer,
    checkout_page,
    history_page
):
    """
    Validate edit opens with prefilled transaction data.
    """

    selected_resident_name = create_editable_checkout(checkout_page)

    open_editable_transaction(
        history_page=history_page,
        selected_resident_name=selected_resident_name
    )

    page_text = driver.page_source

    assert "Checkout Summary (Editing)" in page_text, \
        "Edit checkout summary should be visible"

    assert ITEM_NAME in page_text, \
        f"Prefilled item should be visible in edit mode: {ITEM_NAME}"

    assert selected_resident_name in page_text, \
        f"Prefilled resident should be visible in edit mode: {selected_resident_name}"


# =====================================================
# REGRESSION TESTS
# =====================================================

@pytest.mark.regression
@pytest.mark.serial
@pytest.mark.edit_feature
def test_edit_transaction_flow(
    driver,
    login_with_volunteer,
    checkout_page,
    history_page
):
    """
    Full E2E edit transaction flow.
    """

    selected_resident_name = create_editable_checkout(checkout_page)

    history_page.open_history()

    assert not history_page.is_no_transactions_message_visible(), \
        "No transactions found after checkout"

    initial_qty = get_matching_quantity(
        history_page=history_page,
        selected_resident_name=selected_resident_name
    )

    history_page.open_transaction_matching(
        resident_name=selected_resident_name,
        item_name=None
    )

    history_page.click_edit_transaction()

    assert ITEM_NAME in driver.page_source, \
        f"Expected item should be visible before editing: {ITEM_NAME}"

    checkout_page.increase_quantity(1, ITEM_NAME)

    checkout_page.save_edit_changes()

    history_page.open_history()

    expected_qty = initial_qty + 1

    history_page.wait_for_quantity_from_card_matching(
        resident_name=selected_resident_name,
        item_name=None,
        expected_qty=expected_qty,
        timeout=30
    )

    final_qty = get_matching_quantity(
        history_page=history_page,
        selected_resident_name=selected_resident_name
    )

    assert final_qty == expected_qty, \
        f"Expected {expected_qty}, got {final_qty}"


# -----------------------------------------------------

@pytest.mark.regression
@pytest.mark.edit_feature
def test_edit_without_changes_save_disabled(
    driver,
    login_with_volunteer,
    checkout_page,
    history_page
):
    """
    Save button should be disabled if no changes are made.
    """

    selected_resident_name = create_editable_checkout(checkout_page)

    open_editable_transaction(
        history_page=history_page,
        selected_resident_name=selected_resident_name
    )

    assert checkout_page.is_save_disabled(), \
        "Save button should be disabled when no changes are made"


# -----------------------------------------------------

@pytest.mark.regression
@pytest.mark.edit_feature
def test_cancel_edit_discards_changes(
    driver,
    login_with_volunteer,
    checkout_page,
    history_page
):
    """
    Cancel should discard changes.
    """

    selected_resident_name = create_editable_checkout(checkout_page)

    history_page.open_history()

    initial_qty = get_matching_quantity(
        history_page=history_page,
        selected_resident_name=selected_resident_name
    )

    history_page.open_transaction_matching(
        resident_name=selected_resident_name,
        item_name=None
    )

    history_page.click_edit_transaction()

    assert ITEM_NAME in driver.page_source, \
        f"Expected item should be visible before editing: {ITEM_NAME}"

    checkout_page.increase_quantity(1, ITEM_NAME)
    checkout_page.click_cancel()

    history_page.open_history()

    final_qty = get_matching_quantity(
        history_page=history_page,
        selected_resident_name=selected_resident_name
    )

    assert final_qty == initial_qty, \
        "Changes should not persist after cancel"


# -----------------------------------------------------

@pytest.mark.regression
@pytest.mark.edit_feature
def test_welcome_basket_not_editable(
    driver,
    login_with_volunteer,
    history_page
):
    """
    Welcome Basket transactions should not show Edit button.
    """

    history_page.open_history()

    cards = history_page.get_history_cards()

    welcome_basket_card = None

    for card in cards:
        if "Welcome Basket" in card.text:
            welcome_basket_card = card
            break

    if welcome_basket_card is None:
        pytest.skip("No Welcome Basket transaction found in history")

    history_page.driver.execute_script(
        "arguments[0].scrollIntoView({block:'center'});",
        welcome_basket_card
    )

    history_page.driver.execute_script(
        "arguments[0].click();",
        welcome_basket_card
    )

    history_page.wait_for_visibility(
        history_page.locators.TRANSACTION_DETAILS_DIALOG
    )

    assert not history_page.is_visible(
        history_page.locators.EDIT_BUTTON,
        timeout=3
    ), "Welcome Basket transactions should not show Edit button"
