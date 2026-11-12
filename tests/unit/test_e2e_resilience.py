from unittest.mock import Mock

import pytest
from selenium.common.exceptions import TimeoutException, StaleElementReferenceException
from selenium.webdriver.common.by import By

from tests.pages.inventory_page import InventoryPage
from tests.pages.history_page import HistoryPage
from tests.test.test_volunteer_inventory_adjust_quantity import test_inventory_adjust_quantity as run_adjustment


def cell(text):
    result = Mock(text=text)
    result.find_elements.return_value = []
    return result


def row(name="Body soap", kind="General", quantity="7", enabled=True):
    cells = [cell(value) for value in [name, "", kind, "", "In Stock", quantity, ""]]
    button = Mock()
    button.is_enabled.return_value = enabled
    cells[6].find_elements.return_value = [button]
    result = Mock()
    result.find_elements.return_value = cells
    return result


def inventory(rows):
    page = InventoryPage(Mock())
    page.assert_inventory_page_ready = Mock()
    page.select_general_inventory = Mock()
    page.driver.find_elements.side_effect = lambda by, selector: rows if selector.endswith("tbody tr") else []
    return page


@pytest.mark.parametrize("bad", [row(kind="Welcome Basket"), row(quantity=""), row(quantity="-1"), row(enabled=False)])
def test_selection_rejects_unsuitable_rows(bad):
    page = inventory([bad, row(quantity="0")])
    assert page.select_adjustable_general_item() == ("Body soap", 0)


def test_missing_item_skips_clearly():
    with pytest.raises(pytest.skip.Exception, match="No suitable active General inventory candidate"):
        inventory([]).select_adjustable_general_item()


def test_selection_searches_next_page():
    page = inventory([])
    button = Mock()
    button.is_enabled.return_value = True
    page.driver.find_elements.side_effect = [[], [button], [row()], []]
    page.get_wait = Mock()
    page.get_wait.return_value.until.side_effect = lambda callback: callback(page.driver)
    assert page.select_adjustable_general_item() == ("Body soap", 7)
    button.click.assert_called_once()


@pytest.mark.parametrize("fails", [False, True])
def test_original_quantity_restored_even_on_assertion_failure(fails):
    page = Mock()
    page.get_inventory_quantity.side_effect = [999 if fails else 8, 7]
    if fails:
        with pytest.raises(AssertionError):
            run_adjustment(("Body soap", 7), page)
    else:
        run_adjustment(("Body soap", 7), page)
    assert [call.args[1] for call in page.adjust_quantity.call_args_list] == [8, 7]
    page.driver.refresh.assert_called_once()


def test_page_load_checks_structure_without_named_items():
    driver = Mock()
    driver.find_elements.return_value = [cell(name) for name in [
        "Name", "Description", "Type", "Category", "Status", "Quantity", "Adjust"
    ]]
    page = InventoryPage(driver)
    page.get_wait = Mock()
    page.assert_inventory_page_ready()
    assert driver.find_elements.call_args.args == (By.CSS_SELECTOR, "#inventory-container thead th")


@pytest.mark.parametrize("rows,selected,unavailable", [
    ([row(name="Can opener"), row(name="Conditioner"), row(name="Body soap")], "Body soap", []),
    ([row(name="Body soap", quantity="-1"), row(name="Conditioner"), row(name="Can opener")], "Conditioner", ["Body soap"]),
    ([row(name="Can opener")], "Can opener", ["Body soap", "Conditioner"]),
])
def test_candidate_priority_and_report(rows, selected, unavailable):
    report = Mock()
    assert inventory(rows).select_adjustable_general_item(report=report) == (selected, 7)
    preferred, actual, missing = report.call_args.args
    assert preferred == "Body soap"
    assert actual == selected
    assert [entry["item"] for entry in missing] == unavailable
    assert all(entry["reason"] for entry in missing)


def test_skip_reports_every_candidate():
    report = Mock()
    with pytest.raises(pytest.skip.Exception):
        inventory([]).select_adjustable_general_item(report=report)
    assert report.call_args.args[1] is None
    assert len(report.call_args.args[2]) == 3


def test_checkout_rejects_zero_stock_before_workflow():
    assert inventory([row(quantity="0"), row(name="Conditioner", quantity="2")]).select_adjustable_general_item(
        minimum_quantity=1
    ) == ("Conditioner", 2)


def test_selection_ui_error_is_not_skipped():
    page = inventory([])
    page.driver.find_elements.side_effect = TimeoutException("UI failed")
    with pytest.raises(TimeoutException, match="UI failed"):
        page.select_adjustable_general_item()


WARNING_REASON = "Item exists, but quantity shows a warning icon; unsuitable for this test."


def warning_row(name):
    result = row(name=name, quantity="")
    result.find_elements.return_value[5].find_elements.return_value = [Mock()]
    return result


def test_quantity_warning_falls_back_with_exact_reason():
    report = Mock()
    assert inventory([warning_row("Body soap"), row(name="Conditioner")]).select_adjustable_general_item(
        report=report
    ) == ("Conditioner", 7)
    assert report.call_args.args[2] == [{"item": "Body soap", "reason": WARNING_REASON}]


def test_all_warning_quantities_skip_with_exact_reasons():
    report = Mock()
    with pytest.raises(pytest.skip.Exception, match="quantity shows a warning icon"):
        inventory([warning_row(name) for name in ["Body soap", "Conditioner", "Can opener"]]).select_adjustable_general_item(report=report)
    assert [entry["reason"] for entry in report.call_args.args[2]] == [WARNING_REASON] * 3


def test_icon_outside_quantity_does_not_disqualify_item():
    candidate = row()
    candidate.find_elements.return_value[0].find_elements.return_value = [Mock()]
    assert inventory([candidate]).select_adjustable_general_item() == ("Body soap", 7)


def test_stale_candidate_snapshot_recovers_without_marking_missing():
    page = inventory([])
    stale = Mock()
    stale.find_elements.side_effect = StaleElementReferenceException()
    page.driver.find_elements.side_effect = [[stale], [row()], []]
    assert page.select_adjustable_general_item() == ("Body soap", 7)



def test_quantity_lookup_recovers_stale_and_preserves_zero():
    driver = Mock()
    quantity = cell("0")
    driver.find_element.side_effect = [StaleElementReferenceException(), quantity]
    page = InventoryPage(driver)
    assert page.get_inventory_quantity("Body soap") == 0
    locator = driver.find_element.call_args.args[1]
    assert "tr[td[1][normalize-space(.)='Body soap']]" in locator
    assert "[td[3][normalize-space(.)='General']]/td[6]" in locator
    assert "following-sibling" not in locator


def test_general_results_reject_welcome_and_wait_for_stable_rows():
    page = InventoryPage(Mock())
    type_button = cell("General")
    search = Mock()
    search.get_attribute.return_value = ""
    page.driver.find_element.side_effect = lambda by, value: search if "input" in value else type_button
    page.driver.find_elements.side_effect = [
        [row(kind="Welcome Basket")], [row()], [row()], [row()]
    ]
    page.wait_for_general_results("")
    assert page.driver.find_elements.call_count == 4


def test_general_filter_is_explicit_and_resets_search():
    page = InventoryPage(Mock())
    page.click = Mock()
    page.search_item = Mock()
    page.wait_for_general_results = Mock()
    page.driver.find_elements.return_value = []
    page.select_general_inventory()
    assert page.click.call_args_list[0].args[0] == (By.CSS_SELECTOR, "#type-button-container > button")
    assert "role='menuitem'" in page.click.call_args_list[1].args[0][1]
    page.search_item.assert_called_once_with("")
    page.wait_for_general_results.assert_called_once_with("")


def test_selection_verifies_general_before_reading_candidates():
    page = inventory([row()])
    page.select_adjustable_general_item()
    page.select_general_inventory.assert_called_once()


@pytest.mark.parametrize("existing,resident,total,item_matches,passes", [
    (False, "Resident", "1 / 10", True, True),
    (True, "Resident", "1 / 10", True, False),
    (False, "Resident Other", "1 / 10", True, False),
    (False, "Resident", "2 / 10", True, False),
    (False, "Resident", "1 / 10", False, False),
])
def test_new_history_requires_new_id_exact_resident_item_and_quantity(existing, resident, total, item_matches, passes):
    driver = Mock()
    card = Mock(text=total)
    card.get_attribute.return_value = "checkout-card-new"
    card.find_elements.return_value = [cell(resident)]
    driver.find_element.return_value = card
    matched = Mock()
    matched.is_displayed.return_value = True
    driver.find_elements.return_value = [matched] if item_matches else []
    page = HistoryPage(driver)
    page.get_history_cards = Mock(return_value=[card])
    page.wait_for_visibility = Mock()
    page.close_transaction_details = Mock()
    page.get_wait = Mock()
    previous = {"checkout-card-new"} if existing else {"checkout-card-old"}
    if passes:
        assert page.wait_for_new_transaction(previous, "Resident", "Body soap", timeout=0) == "checkout-card-new"
        locator = driver.find_elements.call_args.args[1]
        assert "//p[normalize-space(.)='Body soap']/parent::*" in locator
        assert "[normalize-space(.)='1']" in locator
        page.close_transaction_details.assert_called_once()
    else:
        with pytest.raises(AssertionError, match="No newly created history transaction matched"):
            page.wait_for_new_transaction(previous, "Resident", "Body soap", timeout=0)


def test_new_history_details_failure_remains_failure():
    driver = Mock()
    card = Mock(text="1 / 10")
    card.get_attribute.return_value = "checkout-card-new"
    card.find_elements.return_value = [cell("Resident")]
    driver.find_element.return_value = card
    page = HistoryPage(driver)
    page.get_history_cards = Mock(return_value=[card])
    page.wait_for_visibility = Mock(side_effect=TimeoutException("Details failed"))
    with pytest.raises(TimeoutException, match="Details failed"):
        page.wait_for_new_transaction(set(), "Resident", "Body soap", timeout=0)


def test_baseline_waits_for_stable_ids():
    page = HistoryPage(Mock())
    old = Mock()
    old.get_attribute.return_value = "checkout-card-old"
    another = Mock()
    another.get_attribute.return_value = "checkout-card-another"
    page.get_history_cards = Mock(side_effect=[[old], [old, another], [old, another], [old, another]])
    assert page.get_history_transaction_ids() == {"checkout-card-old", "checkout-card-another"}
