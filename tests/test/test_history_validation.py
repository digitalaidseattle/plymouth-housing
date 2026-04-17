import pytest


@pytest.mark.usefixtures("login_with_volunteer")
@pytest.mark.serial
@pytest.mark.smoke
def test_checkout_updates_history(home_page, checkout_page, history_page):

    # ---------------------------------------------------
    # Arrange
    # ---------------------------------------------------
    history_page.open_history()
    initial_count = history_page.get_record_count_number()

    # ---------------------------------------------------
    # Act
    # ---------------------------------------------------
    home_page.go_to_checkout_general()

    checkout_page.select_first_building_option()
    checkout_page.select_first_unit_number()
    checkout_page.wait_for_resident_autofill()

    checkout_page.click_continue_button()

    checkout_page.search_item("Curtains")
    checkout_page.add_item("Curtains")

    checkout_page.click_proceed_to_checkout()
    checkout_page.click_confirm()

    # ---------------------------------------------------
    # Assert (🔥 FIXED)
    # ---------------------------------------------------

    # 🔥 CRITICAL: force UI refresh
    history_page.open_history()
    history_page.driver.refresh()

    # 🔥 ensure page ready
    history_page.wait_for_page_ready()

    expected = initial_count + 1

    # deterministic wait
    history_page.wait_for_record_count_to_be(expected)

    new_count = history_page.get_record_count_number()

    assert new_count == expected, (
        f"History count did not increase correctly. "
        f"Expected: {expected}, Actual: {new_count}"
    )