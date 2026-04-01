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

        home_page.verify_volunteer_home_header()

        home_page.go_to_checkout_general()

        checkout_page.click_building_code()
        checkout_page.select_first_building_option()
        checkout_page.click_unit_number()
        checkout_page.select_first_unit_number()
        checkout_page.click_name_input()
        checkout_page.select_first_unit_number()
        checkout_page.click_continue_button()
        checkout_page.search_item(item)
        checkout_page.add_item(item)
        checkout_page.click_proceed_to_checkout()
        checkout_page.click_confirm()

        home_page.verify_volunteer_home_header()



