from selenium.webdriver.common.by import By
import pytest


@pytest.mark.smoke
@pytest.mark.serial
@pytest.mark.parametrize("item", [
    "Twin-size",
    "Full-size"
])
def test_welcome_basket_over_limit(checkout_page, home_page, item):

    home_page.wait_for_homepage_loaded()
    home_page.verify_volunteer_home_header()

    checkout_page.open_welcome_basket()

    # -------------------------
    # Exceed limit
    # -------------------------
    checkout_page.increase_quantity(6, item)
    checkout_page.click_proceed_to_checkout()

    assert checkout_page.get_wait(10).until(
        lambda d: "over the limit" in d.page_source.lower()
    ), f"❌ Over limit warning not shown for {item}"

    # -------------------------
    # Handle popup + ensure correct state
    # -------------------------
    checkout_page.handle_limit_popup()
    checkout_page.get_wait(10).until(
        lambda d: "welcome basket" in d.page_source.lower()
    )

    checkout_page.decrease_quantity(1, item)

    # -------------------------
    # Final checkout
    # -------------------------
    checkout_page.click_proceed_to_checkout()
    checkout_page.click_confirm()

    # -------------------------
    # Verify redirect
    # -------------------------
    home_page.wait_for_homepage_loaded()
    home_page.verify_volunteer_home_header()

    # -------------------------
    # Verify success
    # -------------------------
    assert home_page.get_wait(10).until(
        lambda d: "checked out" in d.page_source.lower()
    ), f"❌ Checkout failed for {item}"