import pytest


@pytest.fixture
def adjustable_general_item(login_with_volunteer, inventory_page, catalog_selection_report):
    inventory_page.click_on_inventory()
    inventory_page.wait_for_inventory_loaded()
    return inventory_page.select_adjustable_general_item(report=catalog_selection_report)


@pytest.mark.regression
@pytest.mark.serial
def test_inventory_adjust_quantity(adjustable_general_item, inventory_page):
    item, original_qty = adjustable_general_item
    new_qty = original_qty + 1
    inventory_page.search_item(item)
    inventory_page.wait_for_general_results(item)
    inventory_page.wait_for_search_results(item)
    try:
        inventory_page.adjust_quantity(item, new_qty, "E2E quantity adjustment")
        assert inventory_page.get_inventory_quantity(item) == new_qty
    finally:
        # Dismiss any failed submission dialog and locate the item after page resets.
        inventory_page.driver.refresh()
        inventory_page.wait_for_inventory_loaded()
        inventory_page.select_general_inventory()
        inventory_page.search_item(item)
        inventory_page.wait_for_general_results(item)
        inventory_page.wait_for_search_results(item)
        inventory_page.adjust_quantity(item, original_qty, "E2E cleanup")
        assert inventory_page.get_inventory_quantity(item) == original_qty
