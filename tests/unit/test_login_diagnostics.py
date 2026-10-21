import json
from unittest.mock import Mock

import pytest
from selenium.common.exceptions import StaleElementReferenceException, TimeoutException

from tests.pages.login_page import LoginPage
from tests.utilities.login_diagnostics import CONTROLS, capture_login_diagnostics, redact, safe_url


def login_driver(states):
    driver = Mock()
    index = {"value": -1}
    def elements(by, selector):
        if selector == CONTROLS["username"]:
            index["value"] = min(index["value"] + 1, len(states) - 1)
        active = states[max(index["value"], 0)]
        if active == "stale":
            raise StaleElementReferenceException()
        visible = Mock(text="AADSTS50034: Account does not exist")
        visible.is_displayed.return_value = True
        return [visible] if selector == CONTROLS.get(active) else []
    driver.find_elements.side_effect = elements
    return driver


def test_username_transition_waits_for_visible_password():
    driver = login_driver(["username", "password"])
    assert LoginPage(driver).wait_for_password_transition(timeout=1) is driver.find_element.return_value
    assert driver._login_observed_states == [["username"], ["password"]]


@pytest.mark.parametrize("state", ["account_picker", "error_message", "consent", "mfa_prompt"])
def test_unexpected_login_state_fails_immediately_and_is_recorded(state):
    driver = login_driver([state])
    with pytest.raises(AssertionError, match=state):
        LoginPage(driver).wait_for_password_transition(timeout=0)
    assert driver._login_observed_states == [[state]]


def test_hidden_or_absent_password_does_not_count_as_success():
    driver = login_driver(["username"])
    with pytest.raises(TimeoutException):
        LoginPage(driver).wait_for_password_transition(timeout=0)


def test_transition_recovers_from_stale_controls():
    driver = login_driver(["stale", "password"])
    LoginPage(driver).wait_for_password_transition(timeout=1)


def test_sanitization_removes_credentials_url_parameters_and_tokens(monkeypatch):
    monkeypatch.setenv("VOLUNTEER_PASSWORD", "SuperPrivatePassword!")
    raw = "AADSTS50034 user@example.com SuperPrivatePassword! token=private https://login.microsoftonline.com/tenant/oauth2?code=secret&state=private#token"
    safe = redact(raw)
    for secret in ["user@example.com", "SuperPrivatePassword!", "token=private", "code=secret", "state=private"]:
        assert secret not in safe
    assert "AADSTS50034" in safe
    assert safe_url("https://user:pass@host/login?token=secret#secret") == "https://host/login"


def test_capture_persists_sanitized_evidence_and_restores_after_screenshot_failure(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    monkeypatch.setenv("VOLUNTEER_USERNAME", "private@example.com")
    driver = login_driver(["error_message"])
    driver.current_url = "https://login.microsoftonline.com/tenant/login?code=never-log-this#token"
    driver.title = "Sign in private@example.com"
    driver.get_screenshot_as_png.side_effect = RuntimeError("private error details")
    evidence = capture_login_diagnostics(driver)
    payload = next((tmp_path / "artifacts/login-diagnostics").glob("*.json")).read_text()
    assert "private@example.com" not in payload
    assert "never-log-this" not in payload
    assert "private error details" not in payload
    assert evidence["screenshot_capture_error"] == "RuntimeError"
    assert "__loginRedactions" in driver.execute_script.call_args.args[0]
    assert "AADSTS50034" in json.loads(payload)["microsoft_errors"][0]


def test_capture_saves_screenshot_and_does_not_read_html(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    driver = login_driver(["username"])
    driver.current_url = "https://login.microsoftonline.com/login?token=secret"
    driver.title = "Sign in"
    driver.get_screenshot_as_png.return_value = b"sanitized PNG"
    capture_login_diagnostics(driver)
    assert next((tmp_path / "artifacts/login-diagnostics").glob("*.png")).read_bytes() == b"sanitized PNG"
    assert "setProperty('visibility', 'hidden'" in driver.execute_script.call_args_list[0].args[0]


def test_submission_failure_is_inside_diagnostic_boundary(monkeypatch):
    from tests import conftest
    page = Mock()
    page.click_next_button.side_effect = TimeoutException("sensitive raw Selenium error")
    capture = Mock()
    monkeypatch.setattr(conftest, "attach_debug_artifacts", capture)
    driver = Mock()
    driver._login_observed_states = []
    with pytest.raises(AssertionError, match="username transition failed") as error:
        conftest.submit_username_and_wait_for_password(driver, page)
    assert "sensitive raw Selenium error" not in str(error.value)
    capture.assert_called_once_with(driver, "microsoft_username_transition_failure")


def test_hidden_password_is_not_a_valid_transition():
    driver = Mock()
    hidden = Mock()
    hidden.is_displayed.return_value = False
    driver.find_elements.side_effect = lambda by, selector: [hidden] if selector == CONTROLS["password"] else []
    with pytest.raises(TimeoutException):
        LoginPage(driver).wait_for_password_transition(timeout=0)


def test_failed_redaction_never_saves_an_unmasked_screenshot(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    driver = login_driver(["username"])
    driver.current_url = "https://login.microsoftonline.com/login"
    driver.title = "Sign in"
    driver.execute_script.side_effect = [RuntimeError("cannot redact"), None]
    capture_login_diagnostics(driver)
    driver.get_screenshot_as_png.assert_not_called()
    assert not list((tmp_path / "artifacts/login-diagnostics").glob("*.png"))
