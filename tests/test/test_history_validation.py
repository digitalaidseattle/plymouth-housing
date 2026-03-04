import pytest


@pytest.mark.usefixtures("login_with_volunteer")
@pytest.mark.serial
@pytest.mark.smoke
def test_checkout_updates_history(home_page, checkout_page, history_page):

    # Get initial history count
    history_page.open_history()
    initial_count = history_page.get_record_count_number()

    # Perform checkout
    home_page.go_to_checkout_general()

    checkout_page.click_building_code()
    checkout_page.select_first_building_option()
    checkout_page.click_unit_number()
    checkout_page.select_first_unit_number()
    checkout_page.click_name_input()
    checkout_page.select_first_unit_number()
    checkout_page.click_continue_button()

    checkout_page.search_item("Curtains")
    checkout_page.add_item("Curtains")
    checkout_page.click_proceed_to_checkout()
    checkout_page.click_confirm()

    # Reopen and refresh History page to ensure UI state updates
    history_page.open_history()
    history_page.driver.refresh()

    history_page.wait_for_record_count_to_be(initial_count + 1)

    # Validate increment
    new_count = history_page.get_record_count_number()

    assert new_count > initial_count, \
        f"History count did not increase. Initial: {initial_count}, New: {new_count}"