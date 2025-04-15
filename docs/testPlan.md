# Plymouth Housing Test Plan

## Overview
The DAS Plymouth Housing App is an internal app designed to simplify the planning of the internal Inventory Management System. The app provides tools for managing the inventory of Plymouth Housing.

## Test Plan for Inventory Management System

### 1. Objective
The purpose of this test plan is to validate the UI functionality of the inventory management system, ensuring that all components work as expected, the user experience is smooth, and workflows are free of errors. The focus is on performing UI end-to-end (E2E) testing for core features.

### 2. Scope
**Included:**
- Login page: Admins and Volunteers can log in, recover their passwords/PIN codes.
- Home page: Add and checkout inventory functionality.
- Navigation Bar (for admins): Links to "Home Page", "Inventory", "Checkout", and "People/History" pages on the side; includes a 'Logout' button in the top-right corner.
- Navigation Bar (for volunteers): Links to "Home Page", "Inventory", and "Checkout" pages on the side; includes "Change Volunteer" and "Logout" buttons in the top-right corner.
- People Page (Admin Only): Adding new volunteers, managing roles, viewing PINs, and analyzing history logs.
- Add Item Menu: Fuzzy search for item names, quantity handling, Welcome Basket vs. normal item distinction, user actions tracking, and storing in a table.
- Inventory page: Filtering and displaying inventory.
- Checkout page: Adding items to checkout and cart management.
- Volunteer Selector Page: Adding new volunteers, viewing roles, deactivating volunteers, and verifying the "Add" functionality.
- Volunteer Switching: Validating the workflow for switching volunteers between roles.

**Excluded:**
- Integration testing with backend services.
- Performance testing and non-functional requirements.

### 3. Testing Approach
Testing will include:
- **Manual Testing:** For visual and design validation.
- **Automated Testing:** For repetitive E2E scenarios using tools like Selenium.

### 4. Test Deliverables
- Test cases.
- Bug reports with steps to reproduce and screenshots.
- Final test summary report.

### 5. Roles and Responsibilities

| Role       | Responsibility                    |
|------------|------------------------------------|
| Tester     | Execute test cases and log defects. |
| Developer  | Resolve bugs identified.          |

### 6. Test Environment
- **Browsers:** Chrome, Firefox, and Edge (latest versions).
- **Devices:** Desktop and mobile (responsive testing).
- **Test Data:** Realistic inventory dataset with various types, categories, and statuses.

### 7. Test Cases
#### Login Page
- Verify the login form is rendered properly for Admins and Volunteers.
- Test successful login for Admins and Volunteers.
- Validate functionality for recovering passwords and PIN codes.
- Ensure error messages display appropriately for invalid credentials.

#### Home Page
- Verify the "+" button’s visibility and functionality.
- Test the new window for proper rendering of fields: inventory type, item name, quantity, "Cancel," and "Add" buttons.
- Validate field input rules (e.g., quantity accepts only numbers).
- Confirm "Add" button functionality adds inventory successfully.

#### Navigation Bar (for Admins)
- Verify links to "Home Page", "Inventory", "Checkout", and "People/History" pages are visible and functional.
- Test navigation to each linked page and confirm the correct content is displayed.
- Validate the 'Logout' button functionality and confirm it redirects to the login screen.

#### Navigation Bar (for Volunteers)
- Verify links to "Home Page", "Inventory", and "Checkout" pages are visible and functional.
- Test the "Change Volunteer" button to ensure it redirects to the appropriate page or screen.
- Validate the 'Logout' button functionality and confirm it redirects to the login screen.

#### People Page (Admin Only)
- Test adding new volunteers successfully and verifying their roles.
- Validate management of roles, including activation and deactivation.
- Confirm the PIN functionality displays securely and accurately.
- Analyze and validate history logs for any role-related actions or updates.

#### Add Item Menu
- Verify fuzzy search functionality for item names and ensure accurate results for existing items.
- Test quantity handling for different item types.
- Distinguish between "Welcome Basket" items and normal items.
- Track all user actions related to item interactions and store them in a table for review.
- Validate table integrity and ensure all actions are logged accurately.

#### Inventory Page
- Test inventory items’ display accuracy.
- Verify type, category, and status filters (individually and combined).
- Test scenarios with no matching results for applied filters.

#### Checkout Page
- Ensure "+" button adds items to the cart.
- Validate the 10-item limit for the cart.
- Test edge cases, such as removing items and exceeding the limit.

#### Volunteer Selector Page
- Verify the form for adding new volunteers is rendered correctly and validates input fields.
- Test successful submission of new volunteers.
- Validate functionality for deactivating volunteer roles.
- Ensure roles are accurately displayed and updated in the system.
- Confirm the "Add" functionality works as expected.

#### Volunteer Switching
- Verify the workflow for switching volunteers between roles is seamless and error-free.
- Validate that updated roles reflect accurately across the system.

### 8. Schedule

| Phase                        | Timeline       |
|------------------------------|----------------|
| App Requirement for Testing  | 4 days         |
| Test Case Development        | 4 days         |
| Test Environment Setup       | 3 days         |
| Test Execution               | 6 days         |
| Bug Fixing and Retest        | 4 days         |

### 9. Risk and Mitigation

| Risk                              | Mitigation                            |
|-----------------------------------|---------------------------------------|
| Ambiguous requirements            | Clarify with the team.                |
| Testing delays due to environment setup | Use pre-configured environments where possible. |

### 10. Success Criteria
- All critical workflows are bug-free.
- 100% test case execution with no major issues.
- All identified bugs resolved or deferred with approval.

