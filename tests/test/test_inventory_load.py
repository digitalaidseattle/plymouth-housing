import pytest


@pytest.mark.smoke
def test_inventory_page_load(login_with_volunteer, inventory_page):

    inventory_page.click_on_inventory()
    inventory_page.wait_for_inventory_loaded()

    qty = inventory_page.get_inventory_quantity("Body soap")

    assert qty is not None