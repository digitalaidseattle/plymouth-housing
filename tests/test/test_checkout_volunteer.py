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
@pytest.mark.smoke
class TestCheckout:

    @pytest.mark.parametrize("item", ["Curtains"])
    def test_checkout(self, driver, checkout_page, home_page, item):

        # ---------------------------------------------------
        # Step 1: Verify landing
        # ---------------------------------------------------
        home_page.wait_for_homepage_loaded()
        home_page.verify_volunteer_home_header()

        # ---------------------------------------------------
        # Step 2: Go to checkout
        # ---------------------------------------------------
        home_page.go_to_checkout_general()

        # ---------------------------------------------------
        # Step 3: Fill form (DEPENDENT DROPDOWNS)
        # ---------------------------------------------------

        # Building
        checkout_page.select_first_building_option()

        # Unit (must wait after building)
        checkout_page.select_first_unit_number()

        checkout_page.wait_for_resident_autofill()

        # ---------------------------------------------------
        # Step 4: Continue (SAFE)
        # ---------------------------------------------------
        continue_btn = checkout_page.wait_for_clickable(
            checkout_page.locators.CONTINUE_BUTTON
        )

        assert continue_btn.is_enabled(), "❌ Continue button is still disabled"

        continue_btn.click()

        # ---------------------------------------------------
        # Step 5: Add item
        # ---------------------------------------------------
        checkout_page.search_item(item)
        checkout_page.add_item(item)

        checkout_page.click_proceed_to_checkout()
        checkout_page.click_confirm()

        # ---------------------------------------------------
        # Step 6: Wait for navigation back
        # ---------------------------------------------------
        home_page.wait_for_homepage_loaded()

        # ---------------------------------------------------
        # Final assertion
        # ---------------------------------------------------
        home_page.verify_volunteer_home_header()