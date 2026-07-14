import pytest
from tests.pages.inventory_page import InventoryPage
from tests.pages.checkout_page import CheckOutPage


@pytest.fixture(scope="function")
def inventory_page(driver):
    return InventoryPage(driver)


@pytest.fixture()
def return_to_home_page(driver, inventory_page):
    yield
    inventory_page.click_on_volunteer_home()


@pytest.mark.usefixtures('login_with_volunteer')
@pytest.mark.regression
@pytest.mark.serial
class TestInventory:

    @pytest.mark.parametrize('item', ['Clothing Rack'])
    def test_inventory(self, driver, inventory_page, item):
        """
                Verify that the inventory quantity decreases by one after a successful checkout.

                Given:
                    - The user is logged into the application
                    - The user is on the main page

                When:
                    - The user navigates to the Inventory page
                    - The user searches for a specific item
                    - The current quantity of the item is recorded
                    - The user initiates the checkout process
                    - The user selects:
                        - A building code
                        - A unit number
                        - A name
                    - The user adds the item to the checkout
                    - The user completes and confirms the checkout
                    - The user returns to the Inventory page
                    - The user searches for the same item again

                Then:
                    - The inventory quantity of the item should be reduced by one

                """

        # ---------------------------------------------------
        # Step 1: Go to Inventory & get initial quantity
        # ---------------------------------------------------
        inventory_page.click_on_inventory()

        inventory_page.search_item(item)
        inventory_page.wait_for_search_results(item)

        initial_quantity = inventory_page.get_inventory_quantity(item)
        print(f"[BEFORE] '{item}' quantity: {initial_quantity}")

        # ---------------------------------------------------
        # Step 2: Checkout Flow
        # ---------------------------------------------------
        checkout_page = CheckOutPage(driver)

        checkout_page.click_checkout()

        # Building
        checkout_page.select_first_building_option()

        # Unit (dependent dropdown → MUST WAIT)
        checkout_page.select_first_unit_number()

        # Name
        checkout_page.wait_for_resident_autofill()

        # Continue (state-based safe)
        checkout_page.click_continue_button()

        # ---------------------------------------------------
        # Step 3: Add item
        # ---------------------------------------------------
        checkout_page.search_item(item)
        checkout_page.add_item(item)

        checkout_page.click_proceed_to_checkout()
        checkout_page.click_confirm()

        # ---------------------------------------------------
        # Step 4: Verify inventory decreased
        # ---------------------------------------------------
        checkout_page.click_on_inventory()

        inventory_page.wait_for_inventory_loaded()

        inventory_page.second_search_item(item)
        inventory_page.wait_for_search_results(item)

        updated_quantity = inventory_page.get_inventory_quantity(item)

        print(f"[AFTER] '{item}' quantity: {updated_quantity}")

        # ---------------------------------------------------
        # Assertion
        # ---------------------------------------------------
        assert initial_quantity - 1 == updated_quantity, (
            f"Inventory mismatch for '{item}' → "
            f"Expected: {initial_quantity - 1}, Got: {updated_quantity}"
        )