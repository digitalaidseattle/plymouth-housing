import pytest
from selenium.webdriver.common.by import By


@pytest.mark.regression
@pytest.mark.serial
def test_admin_checkout_no_user_not_found_error(admin_home_page, checkout_page):

    # Step 1 → Navigate to checkout
    admin_home_page.go_to_checkout_general()

    # Step 2 → Fill required fields
    checkout_page.select_first_building_option()
    checkout_page.select_first_unit_number()
    checkout_page.wait_for_resident_autofill()

    # Step 3 → Click Continue (JS click for MUI stability)
    continue_btn = checkout_page.wait_for_clickable(
        checkout_page.locators.CONTINUE_BUTTON
    )
    checkout_page.driver.execute_script("arguments[0].click();", continue_btn)

    # 🔥 CRITICAL → Wait until modal completely disappears
    checkout_page.get_wait(10).until(
        lambda d: len(d.find_elements(
            By.XPATH, "//*[contains(text(),'Provide Details')]"
        )) == 0
    )

    # 🔥 NEW → wait for real page ready
    checkout_page.get_wait(10).until(
        lambda d: len(d.find_elements(
            By.XPATH, "//input[contains(@placeholder,'Search')]"
        )) > 0
    )
    # Step 4 → Add item
    checkout_page.search_item("Curtains")
    checkout_page.add_item("Curtains")

    # Step 5 → Proceed to checkout
    checkout_page.click_proceed_to_checkout()

    # Step 6 → Confirm checkout
    checkout_page.click_confirm()

    # ✅ HARD ASSERT (MAIN BUG VALIDATION)
    assert not checkout_page.is_visible(
        (By.XPATH, "//*[contains(text(),'user not found')]")
    ), "❌ 'User not found' error appeared!"

    # 🔍 SOFT CHECK (non-blocking UI validation)
    success_visible = False

    try:
        checkout_page.get_wait(5).until(
            lambda d: len(d.find_elements(
                By.XPATH, "//*[contains(text(),'checked out')]"
            )) > 0
        )
        success_visible = True
    except:
        print("⚠️ Success message not visible (non-blocking)")

    print(f"ℹ️ Success toast visible: {success_visible}")