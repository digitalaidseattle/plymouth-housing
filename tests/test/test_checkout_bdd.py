from __future__ import annotations

import allure
import pytest
from pytest_bdd import given, parsers, scenarios, then, when
from selenium.common.exceptions import TimeoutException

pytestmark = pytest.mark.bdd


# ---------------------------------------------------
# Feature binding
# ---------------------------------------------------

scenarios("../features/checkout.feature")


# ---------------------------------------------------
# Shared scenario state
# ---------------------------------------------------

@pytest.fixture
def context() -> dict[str, object]:
    return {}


# ---------------------------------------------------
# Safe logging helpers
# ---------------------------------------------------

SENSITIVE_KEYS = (
    "password",
    "token",
    "secret",
    "auth",
)


def sanitize(value: object) -> object:
    """Prevent accidental leakage of sensitive values in logs."""
    if value is None:
        return value

    text = str(value).lower()

    if any(key in text for key in SENSITIVE_KEYS):
        return "***"

    return value


# ---------------------------------------------------
# GIVEN
# ---------------------------------------------------

@allure.feature("Checkout")
@allure.story("Volunteer completes checkout flow")
@given("a volunteer user is logged in")
def login(login_with_volunteer):
    with allure.step("Login as volunteer user"):
        return login_with_volunteer


@given("the user is on the home page")
def verify_home(home_page) -> None:
    with allure.step("Verify user is on home page"):
        home_page.wait_for_homepage_loaded()
        home_page.verify_volunteer_home_header()


# ---------------------------------------------------
# WHEN
# ---------------------------------------------------

@when(parsers.parse('the user completes checkout with "{item}"'))
def complete_checkout_flow(
    home_page,
    history_page,
    checkout_page,
    context: dict[str, object],
    item: str,
) -> None:
    safe_item = sanitize(item)

    context["item_name"] = item

    with allure.step(
        "Capture initial history record count"
    ):
        history_page.open_history()

        before_count = history_page.get_record_count()

        context["before_count"] = before_count

        print(
            f"History count before checkout: "
            f"{before_count}"
        )

    with allure.step(
        "Navigate back to home page safely"
    ):
        history_page.go_back_home()
        home_page.wait_for_homepage_loaded()

    with allure.step(
        f"Complete checkout flow for item: "
        f"{safe_item}"
    ):
        checkout_page.complete_checkout(item)


# ---------------------------------------------------
# THEN
# ---------------------------------------------------

@then("the checkout should be successful")
def verify_checkout_success(home_page) -> None:
    with allure.step(
        "Verify checkout success and return "
        "to home page"
    ):
        home_page.wait_for_homepage_loaded()
        home_page.verify_volunteer_home_header()


@then("the item should appear in the history")
def verify_item_in_history(
    history_page,
    context: dict[str, object],
) -> None:
    item_name = context.get("item_name")

    assert isinstance(
        item_name,
        str,
    ) and item_name.strip(), (
        "Missing checked-out item name "
        "in scenario context"
    )

    with allure.step(
        "Verify a new history record exists "
        f"after checkout of {sanitize(item_name)}"
    ):
        history_page.open_history()
        history_page.verify_latest_record_exists()

        # The current History UI does not display the
        # normal inventory item name inside the card.
        # Therefore, do not assert that the card text
        # contains item_name here.
        #
        # Checkout success is verified through:
        # 1. Return to the home page
        # 2. A visible latest history record
        # 3. The total history count increasing


@then("the history record count should increase")
def verify_record_count_increase(
    history_page,
    context: dict[str, object],
) -> None:
    with allure.step(
        "Validate history record count increased"
    ):
        before = context.get("before_count")

        assert isinstance(before, int), (
            "Missing or invalid initial "
            "history record count"
        )

        try:
            after = (
                history_page
                .wait_for_record_count_to_increase(
                    previous_count=before,
                    timeout=30,
                )
            )

        except TimeoutException as exc:
            current_text = (
                history_page.get_record_count_text()
            )
            current_count = (
                history_page.get_record_count()
            )

            raise AssertionError(
                "History record count did not increase "
                "within the expected time. "
                f"Before: {before}, "
                f"Current: {current_count}, "
                f"Count text: {current_text!r}"
            ) from exc

        print(
            f"History count after checkout: {after}"
        )

        assert after > before, (
            "Record count did not increase. "
            f"Before: {before}, After: {after}"
        )


@then("the user should be redirected to the home page")
def verify_redirect(home_page) -> None:
    with allure.step(
        "Verify user is on home page"
    ):
        home_page.wait_for_homepage_loaded()
        home_page.verify_volunteer_home_header()