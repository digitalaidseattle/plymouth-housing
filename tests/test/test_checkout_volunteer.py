import pytest
from tests.pages.home_page import HomePage
from tests.pages.checkout_page import CheckOutPage


@pytest.fixture(scope="function")
def home_page(driver):
    return HomePage(driver)


@pytest.fixture(scope="function")
def checkout_page(driver):
    return CheckOutPage(driver)


@pytest.mark.usefixtures("login_with_volunteer")
@pytest.mark.serial
@pytest.mark.regression
class TestCheckout:

    @pytest.mark.parametrize("item", [
        "Curtains",
        "Baby Wipes",
        "Fan"
    ])
    def test_checkout(self, checkout_page, home_page, item):

        # ---------------------------------------------------
        # Step 1: Verify landing
        # ---------------------------------------------------
        home_page.wait_for_homepage_loaded()
        home_page.verify_volunteer_home_header()

        # ---------------------------------------------------
        # Step 2: Navigate to Checkout
        # ---------------------------------------------------
        home_page.go_to_checkout_general()

        # ---------------------------------------------------
        # Step 3: Fill required form fields
        # ---------------------------------------------------
        checkout_page.select_first_building_option()
        checkout_page.select_first_unit_number()
        checkout_page.wait_for_resident_autofill()

        # ---------------------------------------------------
        # Step 4: Continue to item selection
        # ---------------------------------------------------
        checkout_page.click_continue_button()

        # ---------------------------------------------------
        # Step 5: Search and add item
        # ---------------------------------------------------
        checkout_page.search_item(item)
        checkout_page.add_item(item)

        #  Assert item interaction happened (basic safety)
        assert item.lower() in checkout_page.driver.page_source.lower(), \
            f"❌ Item '{item}' not found after search"

        # ---------------------------------------------------
        # Step 6: Complete checkout
        # ---------------------------------------------------
        checkout_page.click_proceed_to_checkout()
        checkout_page.click_confirm()

        # ---------------------------------------------------
        # Step 7: Verify redirect to home
        # ---------------------------------------------------
        home_page.wait_for_homepage_loaded()
        home_page.verify_volunteer_home_header()