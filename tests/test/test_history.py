import pytest

@pytest.mark.usefixtures("login_with_volunteer")
@pytest.mark.smoke
def test_history_page_load(driver, history_page):

    history_page.open_history()
    history_page.verify_history_header()

    cards = history_page.get_history_cards()
    assert len(cards) > 0, "No history records found"


@pytest.mark.usefixtures("login_with_volunteer")
@pytest.mark.serial
def test_checkout_reflected_in_history(
        home_page,
        checkout_page,
        history_page):

    history_page.open_history()
    initial_count = history_page.get_record_count_number()

    checkout_page.complete_checkout("Curtains")

    history_page.open_history()
    history_page.wait_for_record_count_change(initial_count)

    new_count = history_page.get_record_count_number()

    assert new_count == initial_count + 1