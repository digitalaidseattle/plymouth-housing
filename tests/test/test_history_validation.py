import pytest


@pytest.mark.usefixtures("login_with_volunteer")
@pytest.mark.serial
@pytest.mark.regression
def test_checkout_updates_history(home_page, checkout_page, history_page,
                                  inventory_page, catalog_selection_report):
    inventory_page.click_on_inventory()
    inventory_page.wait_for_inventory_loaded()
    item, original_qty = inventory_page.select_adjustable_general_item(
        report=catalog_selection_report, minimum_quantity=1
    )
    history_page.open_history()
    previous_ids = history_page.get_history_transaction_ids()
    try:
        home_page.go_to_checkout_general()
        checkout_page.select_first_building_option()
        checkout_page.select_first_unit_number()
        resident = checkout_page.wait_for_resident_autofill()
        checkout_page.click_continue_button()
        checkout_page.search_item(item)
        checkout_page.add_item(item)
        checkout_page.click_proceed_to_checkout()
        checkout_page.click_confirm()
        home_page.wait_for_homepage_loaded()
        history_page.open_history()
        history_page.wait_for_new_transaction(previous_ids, resident, item, expected_qty=1)
    finally:
        inventory_page.driver.refresh()
        inventory_page.click_on_inventory()
        inventory_page.wait_for_inventory_loaded()
        inventory_page.select_general_inventory()
        inventory_page.search_item(item)
        inventory_page.wait_for_general_results(item)
        inventory_page.wait_for_search_results(item)
        inventory_page.adjust_quantity(item, original_qty, "E2E checkout cleanup")
        assert inventory_page.get_inventory_quantity(item) == original_qty
