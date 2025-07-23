import time

import pytest
from pages.inventory_page import InventoryPage
from pages.checkout_page import CheckOutPage
from test.test_checkout_volunteer import checkout_page
from utilities.fixtures import login_with_volunteer
from utilities.fixtures import driver

@pytest.fixture(scope="function")  # Changed scope for better isolation
def inventory_page(driver):
    return InventoryPage(driver)
@pytest.fixture()
def return_to_home_page(driver, inventory_page):
    yield
    inventory_page.click_on_volunteer_home(driver)

@pytest.mark.usefixtures('login_with_volunteer')
class TestInventory:
    # @pytest.mark.usefixtures('return_to_home_page')
    @pytest.mark.parametrize('item', ['Baby Wipes', 'Body lotion', 'Body soap'])
    def test_inventory(self, driver, inventory_page, item):
        inventory_page.click_on_inventory()
        item_quantity = int(inventory_page.get_inventory(item))
        print(f'Before Test {item} quantity: {item_quantity}')
        checkout_page = CheckOutPage(driver)
        checkout_page.click_checkout()
        checkout_page.click_building_code()
        checkout_page.select_first_building_option()
        checkout_page.add_item(item)
        checkout_page.click_proceed_to_checkout()
        checkout_page.click_confirm()
        checkout_page.click_on_inventory()
        inventory_page = InventoryPage(driver)
        updated_item_quantity = int(inventory_page.get_inventory(item))
        assert item_quantity - 1== updated_item_quantity, (
        f'Unexpected {item} Quantity After checkout'
        f'expected: {item_quantity - 1 }'
        f'actual: {updated_item_quantity}')
        print(f' After Test {item} quantity: {updated_item_quantity}')