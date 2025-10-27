import pytest
from tests.pages.inventory_page import InventoryPage
from tests.pages.checkout_page import CheckOutPage
from tests.pages.add_item_page import AddItemPage
from tests.utilities.fixtures import login_with_volunteer
from tests.utilities.fixtures import driver
from tests.utilities.data import URL, ADMIN_PASSWORD, VOLUNTEER_PASSWORD


@pytest.fixture(scope="function")  # Changed scope for better isolation
def inventory_page(driver):
    return InventoryPage(driver)
@pytest.fixture()
def return_to_home_page(driver, inventory_page):
    yield
    inventory_page.click_on_volunteer_home(driver)

@pytest.mark.usefixtures('login_with_volunteer')
class TestInventory:
    @pytest.mark.parametrize('item', ['Clothing Rack'])
    def test_inventory(self, driver, inventory_page, item):
        # Step 1: Access inventory and search for item
        inventory_page.click_on_inventory()
        inventory_page.search_item(item)
        inventory_page.wait_for_search_results(item)        # Step 2: Get original inventory quantity
        initial_quantity = inventory_page.get_quantity(item)
        print(f"Before checkout - '{item}' quantity: {initial_quantity}")# Step 3: Perform checkout flow
        checkout_page = CheckOutPage(driver)
        checkout_page.click_checkout()
        checkout_page.click_building_code()
        checkout_page.select_first_building_option()
        checkout_page.click_unit_number()
        checkout_page.select_first_unit_number()
        checkout_page.click_name_input()
        checkout_page.select_first_unit_number()  # Possibly redundant?
        checkout_page.click_continue_button()
        checkout_page.search_item(item)
        checkout_page.add_item(item)
        3#checkout_page.items_added(item)
        checkout_page.click_proceed_to_checkout()
        checkout_page.click_confirm()        # Step 4: Reopen inventory and verify quantity change
        checkout_page.click_on_inventory()
        inventory_page.wait_for_inventory_loaded()
        inventory_page.second_search_item(item)
        inventory_page.wait_for_search_results(item)        # Reinstate the page object
        updated_quantity = inventory_page.get_quantity(item)
        print(f"After checkout - '{item}' quantity: {updated_quantity}")
        assert initial_quantity - 1 == updated_quantity, (
            f"Unexpected quantity change for '{item}'. "
            f"Expected: {initial_quantity - 1}, Actual: {updated_quantity}"
        )


@pytest.mark.usefixtures('login_with_volunteer')
class TestAddItem:
    @pytest.mark.parametrize('value', ['Baby Wipes'])
    def test_add_item(self, driver, inventory_page, value):
        inventory_page.click_on_inventory()
        inventory_page.click_on_add_item(driver)
        add_item_page = AddItemPage(driver)
        add_item_page.click_inventory_type()
        add_item_page.select_general_option()
        add_item_page.click_add_item()
        add_item_page.wait_for_data_load(value)
        add_item_page.select_add_item(value)
        pass