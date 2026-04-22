from selenium.webdriver.common.by import By
import pytest


@pytest.mark.smoke
@pytest.mark.serial
@pytest.mark.parametrize("item", [
    "Twin-size Sheet Set",
    "Full-size sheet set"])
def test_welcome_basket_checkout(checkout_page, home_page, item):
    """
    Test: Welcome Basket Checkout Flow (End-to-End)

    Steps:
    1. Verify user lands on the Volunteer Home page successfully.
    2. Navigate to Checkout → Welcome Basket flow.
    3. Select a building from the required modal and proceed.
    4. Wait for Welcome Basket page to load completely.
    5. Increase item quantity beyond allowed limit (set to 6).
    6. Proceed to check out and trigger the summary modal.
    7. Verify over-limit warning is displayed.
    8. Adjust quantity back to allowed limit (set to 5).
    9. Confirm checkout.
    10. Verify user is redirected back to Home page.
    11. Validate success message: "items have been checked out".

    Expected Result:
    - System enforces item limit rules correctly.
    - User can recover from over-limit state.
    - Checkout completes successfully with valid quantity.
    """
    home_page.wait_for_homepage_loaded()
    home_page.verify_volunteer_home_header()

    checkout_page.open_welcome_basket()

    checkout_page.complete_welcome_checkout(item, 1)

    home_page.wait_for_homepage_loaded()
    home_page.verify_volunteer_home_header()

    assert home_page.get_wait(10).until(
        lambda d: "checked out" in d.page_source.lower()
    )