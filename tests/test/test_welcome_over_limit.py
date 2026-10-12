import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC


@pytest.mark.regression
@pytest.mark.serial
@pytest.mark.parametrize("item", ["Twin-size Sheet Set", "Full-size sheet set"])
def test_welcome_basket_over_limit(login_with_volunteer, checkout_page, home_page, item):
    """Recover from the basket limit confirmation without an override."""
    home_page.wait_for_homepage_loaded()
    home_page.verify_volunteer_home_header()
    checkout_page.open_welcome_basket()

    checkout_page.set_quantity(6, item)
    checkout_page.click_proceed_to_checkout()
    checkout_page.wait_for_readable_quantity(item)
    assert checkout_page.read_quantity(item) == 6
    assert checkout_page.get_wait(10).until(EC.visibility_of_element_located((
        By.XPATH,
        "//*[@data-testid='checkout-summary-dialog']"
        "//*[@role='alert'][contains(normalize-space(.), 'over the limit')]",
    ))), f"Over-limit warning not shown for {item}"

    checkout_page.click_confirm()
    assert checkout_page.get_wait(10).until(EC.visibility_of_element_located((
        By.ID, "checkout-dialog-return-to-summary-btn",
    ))), "Limit confirmation not shown"
    checkout_page.handle_limit_popup()
    checkout_page.decrease_quantity(1, item)
    assert checkout_page.read_quantity(item) == 5
    checkout_page.get_wait(10).until(EC.invisibility_of_element_located((
        By.XPATH,
        "//*[@data-testid='checkout-summary-dialog']"
        "//*[@role='alert'][contains(normalize-space(.), 'over the limit')]",
    )))
    checkout_page.click_confirm()

    home_page.wait_for_homepage_loaded()
    home_page.verify_volunteer_home_header()
    assert home_page.get_wait(10).until(
        lambda d: "checked out" in d.page_source.lower()
    ), f"Checkout failed for {item}"
