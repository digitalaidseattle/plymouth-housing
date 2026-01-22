import pytest
from tests.pages.checkout_page import CheckOutPage
from tests.utilities.fixtures import login_with_volunteer
from tests.utilities.fixtures import driver


@pytest.fixture(scope="function")
def checkout_page(driver):
    return CheckOutPage(driver)

@pytest.mark.usefixtures("login_with_volunteer")
class TestCheckout:

    @pytest.mark.parametrize("item", ["Clothing Rack"])
    def test_checkout(self, driver, checkout_page, item):
        checkout_page.click_checkout()
        checkout_page.click_building_code()
        checkout_page.select_first_building_option()
        checkout_page.click_unit_number()
        checkout_page.select_first_unit_number()
        checkout_page.click_name_input()
        checkout_page.select_first_unit_number()
        checkout_page.click_continue_button()
        checkout_page.search_item(item)
        checkout_page.add_item(item)
        # TODO ADD VERIFICATION

