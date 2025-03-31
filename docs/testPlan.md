# Plymouth Housing Test Plan

## Overview
The DAS Plymouth Housing App is an internal app designed to simplify the planning of the internal Inventory Management System. The app provides tools for managing the inventory of Plymouth Housing.

## Test Plan for Inventory Management System

### 1. Objective
The purpose of this test plan is to validate the UI functionality of the inventory management system, ensuring that all components work as expected, the user experience is smooth, and workflows are free of errors. The focus is on performing UI end-to-end (E2E) testing for core features.

### 2. Scope
**Included:**
- Home page: Add and checkout inventory functionality.
- Inventory page: Filtering and displaying inventory.
- Checkout page: Adding items to checkout and cart management.

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
#### Home Page
- Verify the "+" button’s visibility and functionality.
- Test the new window for proper rendering of fields: inventory type, item name, quantity, "Cancel," and "Add" buttons.
- Validate field input rules (e.g., quantity accepts only numbers).
- Confirm "Add" button functionality adds inventory successfully.

#### Inventory Page
- Test inventory items’ display accuracy.
- Verify type, category, and status filters (individually and combined).
- Test scenarios with no matching results for applied filters.

#### Checkout Page
- Ensure "+" button adds items to the cart.
- Validate the 10-item limit for the cart.
- Test edge cases, such as removing items and exceeding the limit.

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
