import pytest


@pytest.mark.usefixtures("login_with_volunteer")
@pytest.mark.smoke
def test_logout_smoke(home_page):

    home_page.click_email_id()
    home_page.click_logout()

    # Just check whether the logout was successful.
    assert "login" in home_page.driver.current_url.lower()