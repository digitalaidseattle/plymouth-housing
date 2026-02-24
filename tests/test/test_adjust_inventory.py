import pytest
from tests.pages.inventory_page import InventoryPage


@pytest.fixture(scope="function")
def inventory_page(driver):
    return InventoryPage(driver)


@pytest.mark.regression
@pytest.mark.serial
class TestAdjustInventory:

    def test_adjust_inventory(self, login_with_volunteer, inventory_page):

        inventory_page.click_on_inventory()
        inventory_page.click_status()
        inventory_page.select_status("Out of Stock")

        rows = inventory_page.get_filtered_rows("Out of Stock")

        assert len(rows) > 0, "No Out of Stock items found"
