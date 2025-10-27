import pytest
from tests.pages.checkout_page import CheckOutPage
from tests.utilities.fixtures import login_with_volunteer
from tests.utilities.fixtures import driver


@pytest.fixture(scope="function")
def checkout_page(driver):
    return CheckOutPage(driver)

@pytest.mark.usefixtures('login_with_volunteer')
def test_checkout(driver, checkout_page):
    checkout_page.click_checkout()
    checkout_page.click_building_code()
    checkout_page.select_first_building_option()
    checkout_page.add_item('Baby Wipes')
    checkout_page.click_proceed_to_checkout()
    checkout_page.click_confirm()


