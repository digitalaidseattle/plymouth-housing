from pytest_bdd import scenarios, given, when, then, parsers
import pytest
import allure

pytestmark = pytest.mark.bdd
# ---------------------------------------------------
# Feature binding
# ---------------------------------------------------

scenarios("../features/checkout.feature")


# ---------------------------------------------------
# SECURITY: shared state (no sensitive data)
# ---------------------------------------------------

@pytest.fixture
def context():
    return {}


# ---------------------------------------------------
# SECURITY: helpers
# ---------------------------------------------------

SENSITIVE_KEYS = ["password", "token", "secret", "auth"]


def sanitize(value):
    """Prevent accidental leakage in logs"""
    if not value:
        return value

    text = str(value).lower()

    if any(k in text for k in SENSITIVE_KEYS):
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
def verify_home(home_page):
    with allure.step("Verify user is on home page"):
        home_page.wait_for_homepage_loaded()
        home_page.verify_volunteer_home_header()


# ---------------------------------------------------
# WHEN
# ---------------------------------------------------

@when(parsers.parse('the user completes checkout with "{item}"'))
def complete_checkout_flow(home_page, history_page, checkout_page, context, item):

    safe_item = sanitize(item)

    with allure.step("Capture initial history record count"):
        history_page.open_history()
        context["before_count"] = history_page.get_record_count()

    with allure.step("Navigate back to home page safely"):
        history_page.go_back_home()

    with allure.step(f"Complete checkout flow for item: {safe_item}"):
        checkout_page.complete_checkout(item)


# ---------------------------------------------------
# THEN
# ---------------------------------------------------

@then("the checkout should be successful")
def verify_checkout_success(home_page):
    with allure.step("Verify checkout success (user returned to home page)"):
        home_page.wait_for_homepage_loaded()


@then("the item should appear in the history")
def verify_item_in_history(history_page):
    with allure.step("Verify latest history record exists"):
        history_page.open_history()
        history_page.verify_latest_record_exists()


@then("the history record count should increase")
def verify_record_count_increase(history_page, context):
    with allure.step("Validate history record count increased"):

        before = context.get("before_count")

        assert before is not None, "Missing initial record count"

        after = history_page.get_record_count()

        assert after > before, (
            f"Record count did not increase. "
            f"Before: {before}, After: {after}"
        )


@then("the user should be redirected to the home page")
def verify_redirect(home_page):
    with allure.step("Verify user is on home page"):
        home_page.verify_volunteer_home_header()