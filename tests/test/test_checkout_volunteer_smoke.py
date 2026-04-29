import pytest


@pytest.mark.smoke
@pytest.mark.serial
def test_checkout_smoke(checkout_page, home_page):

    item = "Curtains"

    home_page.wait_for_homepage_loaded()
    home_page.go_to_checkout_general()

    checkout_page.select_first_building_option()
    checkout_page.select_first_unit_number()
    checkout_page.wait_for_resident_autofill()

    checkout_page.click_continue_button()

    checkout_page.search_item(item)
    checkout_page.add_item(item)

    checkout_page.click_proceed_to_checkout()
    checkout_page.click_confirm()

    home_page.wait_for_homepage_loaded()