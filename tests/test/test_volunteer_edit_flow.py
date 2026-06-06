import pytest


# =====================================================
# 🔥 SMOKE TEST (core behavior)
# =====================================================

@pytest.mark.smoke
@pytest.mark.edit_feature
@pytest.mark.skip(reason="Edit transaction feature not deployed yet")
def test_edit_prefills_data(
    driver,
    login_with_volunteer,
    checkout_page,
    history_page
):
    """
    Validate edit opens with prefilled data
    """

    history_page.open_history()
    history_page.open_latest_transaction()
    history_page.click_edit_transaction()

    # basic sanity check (prefill exists)
    qty = checkout_page.get_quantity()
    assert qty > 0, "Prefilled quantity should be greater than 0"


# =====================================================
# 🔁 REGRESSION TESTS
# =====================================================

@pytest.mark.regression
@pytest.mark.serial
@pytest.mark.edit_feature
@pytest.mark.skip(reason="Edit transaction feature not deployed yet")
def test_edit_transaction_flow(
    driver,
    login_with_volunteer,
    checkout_page,
    history_page
):
    """
    Full E2E edit transaction flow
    """

    item_name = "Curtains"

    # STEP 1: Create checkout
    checkout_page.complete_checkout(item_name)

    # STEP 2: Go to history
    history_page.open_history()

    assert not history_page.is_no_transactions_message_visible(), \
        "No transactions found after checkout"

    # STEP 3: Get initial quantity
    initial_qty = history_page.get_latest_quantity()

    # STEP 4: Edit
    history_page.open_latest_transaction()
    history_page.click_edit_transaction()

    # STEP 5: Modify
    checkout_page.increase_quantity(1, item_name)

    # STEP 6: Save
    checkout_page.click_proceed_to_checkout()
    checkout_page.click_confirm()

    # STEP 7: Verify
    history_page.open_history()

    expected_qty = initial_qty + 1
    history_page.wait_for_latest_quantity(expected_qty)

    final_qty = history_page.get_latest_quantity()

    assert final_qty == expected_qty, \
        f"Expected {expected_qty}, got {final_qty}"


# -----------------------------------------------------

@pytest.mark.regression
@pytest.mark.edit_feature
@pytest.mark.skip(reason="Edit transaction feature not deployed yet")
def test_edit_without_changes_save_disabled(
    checkout_page,
    history_page
):
    """
    Save button should be disabled if no changes made
    """

    history_page.open_history()
    history_page.open_latest_transaction()
    history_page.click_edit_transaction()

    assert checkout_page.is_save_disabled(), \
        "Save button should be disabled when no changes are made"


# -----------------------------------------------------

@pytest.mark.regression
@pytest.mark.edit_feature
@pytest.mark.skip(reason="Edit transaction feature not deployed yet")
def test_cancel_edit_discards_changes(
    checkout_page,
    history_page
):
    """
    Cancel should discard changes
    """

    item_name = "Curtains"

    history_page.open_history()
    history_page.open_latest_transaction()

    initial_qty = history_page.get_latest_quantity()

    history_page.click_edit_transaction()

    checkout_page.increase_quantity(1, item_name)

    checkout_page.click_cancel()

    history_page.open_history()

    final_qty = history_page.get_latest_quantity()

    assert final_qty == initial_qty, \
        "Changes should not persist after cancel"


# -----------------------------------------------------

@pytest.mark.regression
@pytest.mark.edit_feature
@pytest.mark.skip(reason="Edit transaction feature not deployed yet")
def test_welcome_basket_not_editable(
    history_page
):
    """
    Welcome Basket transactions should not be editable
    """

    history_page.open_history()

    cards = history_page.get_history_cards()

    for card in cards:
        if "Welcome Basket" in card.text:
            # No click here
            assert not card.is_enabled(), \
                "Welcome Basket transactions should not be editable"