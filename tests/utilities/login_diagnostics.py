"""Sanitized Microsoft login evidence; never persist HTML, cookies or storage."""
import json
import os
from pathlib import Path
import re
from urllib.parse import urlsplit, urlunsplit
from uuid import uuid4

import allure
from selenium.webdriver.common.by import By


CONTROLS = {
    "username": "input[name='loginfmt']",
    "password": "input[name='passwd']",
    "account_picker": "#tilesHolder, #otherTile, [data-test-id='accountList']",
    "error_message": "#usernameError, #passwordError, #errorText, #errorDescription, #service_exception_message, .alert-error, [role='alert']",
    "consent": "#idDiv_Consent, #consentDescription, #idBtn_Accept, #idDiv_ConsentContent, #idConvergedConsentDescription, [data-testid='consent-page']",
    "mfa_prompt": "#idDiv_SAOTCS_Proofs, #idDiv_SAOTCC_Description, #idDiv_SAOTCAS_Description, #idTxtBx_SAOTCC_OTC, #idRichContext_DisplaySign, input[name='otc'], #idDiv_RemoteNGC_PollingDescription, #idDiv_FidoDescription",
}


def secret_values():
    return [os.environ[key] for key in (
        "ADMIN_USERNAME", "ADMIN_PASSWORD", "VOLUNTEER_USERNAME", "VOLUNTEER_PASSWORD",
        "VOLUNTEER_DISPLAY_NAME", "VOLUNTEER_PIN",
    ) if os.environ.get(key)]


def safe_url(value):
    try:
        parts = urlsplit(value)
        # Strip userinfo, all query parameters and fragments, not just known tokens.
        return urlunsplit((parts.scheme, parts.hostname or "", parts.path, "", ""))
    except ValueError:
        return "[unavailable URL]"


def redact(value):
    text = str(value)
    for secret in sorted(secret_values(), key=len, reverse=True):
        text = re.sub(re.escape(secret), "[redacted]", text, flags=re.I)
    text = re.sub(r"https?://[^\s<>\"']+", lambda m: safe_url(m[0]), text)
    text = re.sub(r"[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}", "[redacted email]", text)
    text = re.sub(r"(?i)\b(password|token|code|cookie|secret|assertion)\s*[:=]\s*[^\s,;]+", r"\1=[redacted]", text)
    text = re.sub(r"[A-Za-z0-9_+/=-]{32,}(?:\.[A-Za-z0-9_+/=-]+)*", "[redacted opaque value]", text)
    return text[:4000]


def visible_controls(driver):
    result = {}
    for name, selector in CONTROLS.items():
        # A replaced node is retried on the next bounded wait poll.
        result[name] = any(element.is_displayed() and (name != "error_message" or element.text.strip())
                           for element in driver.find_elements(By.CSS_SELECTOR, selector))
    return result


def capture_login_diagnostics(driver, name="login_transition"):
    evidence = {"visible_controls": {}, "microsoft_errors": []}
    for key, read in (("url", lambda: redact(safe_url(driver.current_url))),
                      ("title", lambda: redact(driver.title)),
                      ("visible_controls", lambda: visible_controls(driver))):
        try:
            evidence[key] = read()
        except Exception as error:
            evidence[key + "_capture_error"] = type(error).__name__
    try:
        evidence["microsoft_errors"] = list(dict.fromkeys(
            redact(element.text) for element in driver.find_elements(By.CSS_SELECTOR, CONTROLS["error_message"])
            if element.is_displayed() and element.text.strip()
        ))
    except Exception as error:
        evidence["error_capture_error"] = type(error).__name__
    states = getattr(driver, "_login_observed_states", [])
    evidence["observed_states"] = states if isinstance(states, list) else []
    folder = Path("artifacts/login-diagnostics")
    folder.mkdir(parents=True, exist_ok=True)
    label = re.sub(r"[^a-zA-Z0-9_-]", "_", name)[:80] + "-" + uuid4().hex
    screenshot = None
    try:
        # Redact visible text and conceal inputs/QR codes only while capturing.
        # Originals stay in browser memory and are restored in finally.
        driver.execute_script(r"""
          const secrets = arguments[0];
          const escape = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const clean = s => {
            for (const secret of secrets) s = s.replace(new RegExp(escape(secret), 'gi'), '[redacted]');
            return s.replace(/https?:\/\/[^\s<>"']+/g, v => {
              try { const u = new URL(v); return u.origin + u.pathname; } catch { return '[URL]'; }
            }).replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, '[redacted email]')
              .replace(/\b(password|token|code|cookie|secret|assertion)\s*[:=]\s*[^\s,;]+/gi, '$1=[redacted]')
              .replace(/[A-Za-z0-9_+/=-]{32,}(?:\.[A-Za-z0-9_+/=-]+)*/g, '[redacted opaque value]')
              .replace(/\b\d{4,8}\b/g, '[redacted number]');
          };
          window.__loginRedactions = [];
          const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
          while (walk.nextNode()) {
            const n = walk.currentNode;
            if (/^(SCRIPT|STYLE|NOSCRIPT)$/.test(n.parentElement.tagName)) continue;
            const safe = clean(n.textContent);
            if (safe !== n.textContent) {
              window.__loginRedactions.push([n, n.textContent]); n.textContent = safe;
            }
          }
          window.__loginHidden = [];
          for (const el of document.querySelectorAll(
              'input:not([type=button]):not([type=submit]),textarea,img,canvas,svg')) {
            window.__loginHidden.push([el, el.style.getPropertyValue('visibility'), el.style.getPropertyPriority('visibility')]);
            el.style.setProperty('visibility', 'hidden', 'important');
            if (getComputedStyle(el).visibility !== 'hidden') throw new Error('Input redaction failed');
          }
        """, secret_values())
        screenshot = driver.get_screenshot_as_png()
    except Exception as error:
        evidence["screenshot_capture_error"] = type(error).__name__
    finally:
        try:
            driver.execute_script("""
              for (const [node, text] of (window.__loginRedactions || [])) node.textContent = text;
              delete window.__loginRedactions;
              for (const [el, value, priority] of (window.__loginHidden || [])) {
                if (value) el.style.setProperty('visibility', value, priority);
                else el.style.removeProperty('visibility');
              }
              delete window.__loginHidden;
            """)
        except Exception:
            evidence["redaction_restore_error"] = True
    payload = json.dumps(evidence, indent=2)
    (folder / (label + ".json")).write_text(payload, encoding="utf-8")
    allure.attach(payload, name=label, attachment_type=allure.attachment_type.JSON)
    if screenshot is not None:
        (folder / (label + ".png")).write_bytes(screenshot)
        allure.attach(screenshot, name=label, attachment_type=allure.attachment_type.PNG)
    print("Microsoft login diagnostics: " + payload)
    return evidence
