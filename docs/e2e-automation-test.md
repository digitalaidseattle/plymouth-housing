# E2E Automation Tests (Python / Selenium)

This document explains how to set up, run, and maintain the end-to-end (E2E) UI automation test suite.

The framework is designed for:
- Local smoke testing
- Headless execution on Linux VMs (Azure DevOps / CI)
- Parallel execution with controlled serial tests

---

## Tech Stack

- **Python 3.10+**
- **Pytest**
- **Selenium WebDriver**
- **Google Chrome / Chromium**
- **pytest-xdist** (parallel execution)
- **python-dotenv** (environment configuration)

---

## Test Types & Markers

Tests are grouped using Pytest markers:

- `@pytest.mark.smoke`  
  Critical user flows, fast feedback, suitable for PR validation

- `@pytest.mark.regression`  
  Full UI regression coverage (inventory, checkout, role-based flows)

- `@pytest.mark.serial`  
  Tests that **must not run in parallel** due to shared state (e.g. inventory updates)

Marker definitions live in `pytest.ini`.

---

## Test Structure

```text
tests/
├── pages/              # Page Object Model (POM)
├── test/               # Test cases (test_*.py)
│   ├── test_login_admin.py
│   ├── test_login_volunteer.py
│   ├── test_checkout_volunteer.py
│   ├── test_volunteer_inventory.py
│   └── ...
├── utilities/
│   ├── fixtures.py     # All pytest fixtures
│   ├── locators.py
│   └── data.py

```
### Naming Convention
All test files must follow test_*.py and live under tests/test/.

### Prerequisites

- Python 3.x  
  https://www.python.org

- Google Chrome installed locally
- ChromeDriver compatible with your Chrome version

In CI environments, Chromium runs in headless mode automatically.

## Setup
### Create Virtual Environment (Recommended)
Create and activate a virtual environment to isolate dependencies.

```powershell
# Windows (PowerShell)
python -m venv venv
venv\Scripts\Activate.ps1
```
```bash
# Linux / macOS
python3 -m venv venv
source venv/bin/activate
```
Deactivate the virtual environment when done:

```bash
deactivate
```
### Install Dependencies


All required Python dependencies are already listed in a single file:
```text
tests/requirements.txt
```
⚠️ **Important:**  
You do NOT need to install these packages one by one.

When you run the command below, pip automatically reads the file and installs all listed dependencies in one step, including the correct versions.

Install all dependencies:
```bash
pip install -r tests/requirements.txt
```
This command will automatically install:

- Pytest
- Selenium
- pytest-xdist (parallel execution)
- webdriver-manager
- dotenv support
- reporting tools (HTML / Allure)
- and other listed dependencies defined in the file

You do not need to manually search for or install any of these packages individually.
Dependencies are defined in tests/requirements.txt using flexible version ranges:
```text
pytest~=8.3
selenium~=4.27
python-dotenv~=1.1
allure-pytest~=2.14
requests~=2.32
pytest-html~=4.1
webdriver-manager~=4.0
pytest-xdist~=3.8
```
#### Configuration (.env)

Environment-specific values are managed using an .env file.

Create an .env file at the project root:

```dotenv
URL=https://your-test-environment-url.com

ADMIN_USERNAME=admin_test@example.com
ADMIN_PASSWORD=admin_test_password
VOLUNTEER_USERNAME=volunteer_test@example.com
VOLUNTEER_PASSWORD=volunteer_test_password
VOLUNTEER_DISPLAY_NAME=John Doe 1234
VOLUNTEER_PIN=<4 digits>
```
⚠️ **Do not commit real or production credentials**  
Ensure `.env` is included in `.gitignore`.

> **Point the suite at a non-production environment.** The accounts used here
> carry the `test` role, which the app **blocks from logging into production**
> (see [deployment-guide.md](deployment-guide.md#preventing-test-access-to-production)).
> Set `URL` to dev/staging, not prod.

## Running Tests

> **Set `CI=true` unless you specifically want to watch the browser.**
> Chrome runs headed by default, which requires a working desktop session.
> On WSL, headless servers, and most containers, headed Chrome fails to
> start and every test errors during setup with:
>
> ```text
> SessionNotCreatedException: Chrome instance exited.
> ```
>
> This happens in the `driver` fixture before any test code runs, so the
> whole suite fails identically regardless of credentials or environment.

### Run All Tests
```bash
CI=true pytest
```
#### Run Smoke Tests Only
```bash
CI=true pytest -m smoke
```
#### Run Regression Tests
```bash
CI=true pytest -m regression
```
#### Parallel Execution (Exclude Serial Tests)
```bash
CI=true pytest -n auto -m "not serial"
```
#### Run Serial Tests Only
```bash
CI=true pytest -m serial
```

To export it once for the whole shell session instead of prefixing each command:

```bash
export CI=true
```

### Headless Execution (CI / Azure DevOps)

Headless mode is enabled automatically when the `CI` environment variable is
set to `true`. Alongside headless, this also applies the CI-only Chrome flags
(`--no-sandbox`, `--disable-dev-shm-usage`, a fixed 1920x1080 window) that keep
Chrome stable in containers and on WSL.

GitHub Actions sets `CI=true` on its own, and `.github/workflows/e2e-tests.yml`
sets it explicitly, so no extra flags are needed there.

#### Running headed (optional)

Leave `CI` unset to watch the browser. This needs a real display, so on WSL it
requires WSLg — and note that headed Chrome is known to crash on some WSL
setups even when WSLg is available, in which case use `CI=true`.

```bash
pytest -m smoke
```
### Notes & Best Practices

- Page Object Model (POM) is enforced
- UI tests validate user behavior, not implementation details
- Inventory and checkout flows are stateful and should be marked `@serial`
- Smoke tests should remain fast and stable
- UI automation complements unit and API tests; it does not replace them
- No additional flags are required for CI execution.
- Serial tests protect shared state such as inventory and checkout flows.
- Smoke tests are recommended for PR validation, while regression tests should be run before production releases.
