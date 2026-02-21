from tests.utilities.fixtures import login_with_volunteer
from tests.utilities.fixtures import driver
from tests.pages.add_item_page import AddItemPage
import pytest
from tests.pages.inventory_page import InventoryPage

@pytest.fixture
def inventory_page(driver):
    return InventoryPage(driver)

@pytest.mark.usefixtures('login_with_volunteer')
class TestAddItem:

    @pytest.mark.parametrize('item, quantity', [
        ('Baby Wipes', 5),
    ])
    @pytest.mark.regression
    @pytest.mark.serial
    def test_add_item(self, driver, inventory_page, item, quantity):

        inventory_page.click_on_inventory()
        inventory_page.search_item(item)
        inventory_page.wait_for_search_results(item)
        initial_quantity = inventory_page.get_inventory_quantity(item)
        print(f"Before checkout - '{item} quantity: {initial_quantity}'")

        inventory_page.click_on_add_item(driver)

        add_item_page = AddItemPage(driver)
        add_item_page.click_inventory_type()
        add_item_page.select_general_option()
        add_item_page.click_add_item()

        add_item_page.wait_for_data_load(item)
        add_item_page.select_add_item(item)
        add_item_page.set_quantity(quantity)

        add_item_page.click_submit()

        add_item_page.validate_update_success(item, quantity)
        updated_quantity = inventory_page.get_inventory_quantity(item)
        print(f"After checkout - '{item}' quantity: {updated_quantity}")
        assert initial_quantity + 5 == updated_quantity, (
            f"Unexpected quantity change for '{item}'. "
            f"Expected: {initial_quantity + 5}, Actual: {updated_quantity}"
        )