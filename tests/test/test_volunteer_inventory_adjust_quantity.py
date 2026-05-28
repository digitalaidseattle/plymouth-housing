import pytest


@pytest.mark.regression
@pytest.mark.serial
def test_inventory_adjust_quantity(login_with_volunteer, inventory_page):

    item = "Body soap"
    new_qty = 800

    inventory_page.click_on_inventory()
    inventory_page.wait_for_inventory_loaded()

    # 🔥 capture original value
    original_qty = inventory_page.get_inventory_quantity(item)

    try:
        # -------------------------
        # Adjust
        # -------------------------
        inventory_page.click_adjust(item)
        inventory_page.wait_for_adjust_modal()

        inventory_page.set_new_quantity(str(new_qty))
        inventory_page.select_reason("Correction")
        inventory_page.enter_comment("E2E test")

        inventory_page.click_submit()
        inventory_page.wait_for_adjust_complete(item, new_qty)

        inventory_page.wait_for_inventory_loaded()

        updated_qty = inventory_page.get_inventory_quantity(item)

        assert updated_qty == new_qty, \
            f"Expected {new_qty}, got {updated_qty}"

    finally:
        # 🔥 CLEANUP (VERY IMPORTANT)
        inventory_page.click_adjust(item)
        inventory_page.wait_for_adjust_modal()

        inventory_page.set_new_quantity(str(original_qty))
        inventory_page.select_reason("Correction")
        inventory_page.enter_comment("Cleanup")

        inventory_page.click_submit()
        inventory_page.wait_for_adjust_complete(item, original_qty)