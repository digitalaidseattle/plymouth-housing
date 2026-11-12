import inspect
from unittest.mock import Mock

import pytest
from selenium.common.exceptions import ElementClickInterceptedException, TimeoutException
from selenium.webdriver.common.by import By

from tests.pages.welcome_history_page import WelcomeHistoryPage


def passive_card():
    card = Mock()
    card.find_elements.return_value = []
    return card


def page_with_card():
    driver = Mock()
    driver.current_url = "https://staging.example/history"
    driver.find_elements.return_value = []
    return WelcomeHistoryPage(driver), passive_card()


def test_test_has_no_checkout_or_inventory_fixture_dependency():
    from tests.test.test_volunteer_edit_flow import test_welcome_basket_not_editable as actual
    assert set(inspect.signature(actual).parameters) == {"driver", "login_with_volunteer", "record_property"}


def test_search_uses_all_bounded_date_ranges_before_skip():
    page, _ = page_with_card()
    page.set_date = Mock()
    report = Mock()
    with pytest.raises(pytest.skip.Exception, match="after successful loading for All Buildings"):
        page.find_existing(report)
    assert [call.args[0] for call in page.set_date.call_args_list] == list(page.DATE_PRESETS)
    assert report.call_args.args[0]["selected_record"] is None


def test_loading_failure_never_becomes_no_records_skip():
    page, _ = page_with_card()
    page.set_date = Mock(side_effect=TimeoutException("Loading failed"))
    with pytest.raises(TimeoutException, match="Loading failed"):
        page.find_existing(Mock())


def test_card_selected_by_content_even_if_it_has_interactive_regression():
    page, card = page_with_card()
    heading = Mock()
    page.driver.find_elements.return_value = [heading]
    page.set_date = Mock()
    page.card_details = Mock(return_value=(card, {"heading": "Welcome Basket: Twin-size Sheet Set"}))
    selected, evidence = page.find_existing(Mock())
    assert selected is card
    assert evidence["date_filter"] == "last 30 days"
    assert "role" not in page.HEADINGS[1] and "checkout-card" not in page.HEADINGS[1]
    page.set_date.assert_called_once()


def test_precise_outer_card_and_identifying_details():
    page, card = page_with_card()
    heading = Mock(text="Welcome Basket: Full-size Sheet Set")
    heading.find_element.return_value = card
    building = Mock(text="TEST - Test Building")
    age = Mock(text="2 days ago")
    quantity = Mock(text="1x")
    card.find_elements.side_effect = lambda by, tag: {
        "h3": [heading], "p": [building, age], "span": [quantity]
    }[tag]
    selected, details = page.card_details(heading)
    assert selected is card
    heading.find_element.assert_called_once_with(By.XPATH, "./parent::div/parent::div")
    assert details == {"heading": heading.text, "building": building.text, "displayed_date": age.text, "quantity": "1x"}


def test_broad_container_is_error_not_skip():
    page, card = page_with_card()
    heading = Mock()
    heading.find_element.return_value = card
    card.find_elements.return_value = [Mock(), Mock()]
    with pytest.raises(AssertionError, match="multiple cards"):
        page.card_details(heading)


def test_normal_card_click_completes_observation():
    page, card = page_with_card()
    page.assert_passive(card, observation_seconds=0)
    card.click.assert_called_once()


def test_visible_edit_control_fails_before_click():
    page, card = page_with_card()
    edit = Mock(text="Edit")
    edit.get_attribute.return_value = None
    card.find_elements.return_value = [edit]
    with pytest.raises(AssertionError, match="Edit control"):
        page.assert_passive(card, observation_seconds=0)
    card.click.assert_not_called()


def test_click_failure_is_not_proof_of_non_editability():
    page, card = page_with_card()
    card.click.side_effect = ElementClickInterceptedException()
    with pytest.raises(ElementClickInterceptedException):
        page.assert_passive(card, observation_seconds=0)


def test_dialog_opening_after_click_fails_immediately():
    page, card = page_with_card()
    page.driver.find_elements.side_effect = [[], [Mock()]]
    with pytest.raises(AssertionError, match="opened transaction details"):
        page.assert_passive(card, observation_seconds=0)


def test_edit_navigation_after_click_fails():
    page, card = page_with_card()
    card.click.side_effect = lambda: setattr(page.driver, "current_url", "https://staging.example/checkout?edit=123")
    with pytest.raises(AssertionError, match="navigated away"):
        page.assert_passive(card, observation_seconds=0)


def test_delayed_dialog_is_observed_not_just_immediate_click_result():
    page, card = page_with_card()
    page.driver.find_elements.side_effect = [[], [], [Mock()]]
    with pytest.raises(AssertionError, match="opened transaction details"):
        page.assert_passive(card, observation_seconds=2)


def test_history_error_alert_is_failure():
    page, _ = page_with_card()
    alert = Mock(text="Error fetching history")
    page.driver.find_elements.return_value = [alert]
    with pytest.raises(AssertionError, match="History UI error"):
        page.wait_loaded()
