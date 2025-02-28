# People Page Design Document

## 1. Introduction
### 1.1 Purpose
This document describes the design and architecture of the People Page, which is used for managing and displaying user data. The page allows administrators to view, filter, sort, paginate, and update user information, as well as add new volunteers. It integrates with a back-end API via a custom useUsers hook and leverages Material UI components for the user interface.

### 1.2 Scope
The People Page design includes:

- User List Display: Show a table of users (both volunteers and admins) with essential information.
- Filtering: Allow filtering based on name search, user status (Active/Inactive), and role (admin/volunteer).
- Sorting: Enable sorting by user name (ascending, descending, or original order).
- Pagination: Display a fixed number of records per page (e.g., 10 per page).
- Add Volunteer Modal: Provide an interface to add new volunteers.
- Notification System: Use a Snackbar component to show error or success messages.


### 1.3 Definitions, Acronyms, and Abbreviations
- User: Any system user (admin or volunteer).
- Admin: A user with administrative privileges.
- Volunteer: A user with volunteer role, who may have additional properties (e.g., PIN).
- PIN: A personal identification number used for volunteers.
- useUsers Hook: A custom React hook responsible for fetching and managing user data from the backend.

### 1.4 References
- Architecture Design Template
- Business Rules Design
- Login Design

## 2. System Overview
The People Page provides a user management interface that:

- Retrieves user data from the back-end via the useUsers hook.
- Displays a list of users in a table (UserTable) showing key details such as name, role, status, creation date, and last sign-in date.
- Offers filtering options through a UserFilters component to search and narrow down results by name, status, and role.
- Implements pagination to manage large datasets.
- Allows the addition of new volunteer records through a modal (AddVolunteerModal).
- Provides real-time notifications via SnackbarAlert to indicate success or error messages.

## 3. Architecture Goals and Constraints
### 3.1 Goals
- Readability and Reusability: Build clear, modular components for maintainability and potential reuse in other areas.
- Usability: Design an intuitive interface so administrators can easily search and manage users.
- Responsiveness: Ensure that filtering, sorting, and pagination respond quickly to user actions.
- Security: Limit data modification and access to authorized users, with clear error feedback.
- Scalability: Support a growing number of users through effective pagination and optimized local filtering.

### 3.2 Constraints
- Integration with the existing useUsers API and back-end data source is mandatory.
- The interface must adhere to the Material UI design guidelines.
- The People Page must maintain consistency in data structure and state management with other modules (e.g., Login, Inventory).

## 4. Architectural Representations

### People Page Container
- Responsibility: Coordinates the overall user management page by handling state for search terms, filters, sorting, pagination, and modal visibility. It interacts with the useUsers hook to retrieve user data.

### UserFilters
- Responsibility: Provides UI controls (dropdowns and a search input) for filtering users by name, status, and role.
- Interaction: Sends filter and search change events back to the People Page container for processing.

### UserTable
- Responsibility: Displays the list of users in a table format including details such as name, role, status, creation date, and last sign-in date.
- Interaction: Provides action buttons (e.g., status toggle, display PIN) for each user row, notifying the People Page of any changes.

### AddVolunteerModal
- Responsibility: Displays a modal window to add new volunteer user records.
- Interaction: Submits new user data to the back-end and triggers a refresh of the user list.

### SnackbarAlert
- Responsibility: Shows notifications (success or error messages) in response to user actions.

### Pagination
- Responsibility: Splits the user list into pages and allows navigation between them.
- Interaction: Works with the People Page to update the displayed subset of users based on the current page.

## 5. Detailed Design
### 5.1 Subsystems and Components

#### People Page Container
- Purpose: Centralizes state management for filtering, sorting, pagination, and modal display.
- Inputs: User search queries, filter selections (status and role), sort toggles, and page number changes.
- Outputs: A filtered, sorted, and paginated list of users passed to the UserTable component.
- Structure: Utilizes React hooks (useState, useEffect) for state and side effects, and calls the useUsers hook for data retrieval.

#### UserFilters Component
- Purpose: Allow users to filter the list based on name, status, or role.
- Inputs: User input from a text field (for name search) and selection events from dropdown menus.
- Outputs: Triggers callback functions to update the People Page container’s state.
- Structure: Implements Material UI Button, TextField, Menu, and MenuItem components for a clean UI.

#### UserTable Component
- Purpose: Render a table of users with columns for name, role, status, creation date, and last sign-in date.
- Inputs: A list of user objects that have been filtered, sorted, and paginated.
- Outputs: User actions (e.g., toggling user status, showing a PIN) communicated to the People Page container.
- Structure: Uses Material UI Table components and includes an action menu (via IconButton and Menu) for each row.

#### AddVolunteerModal Component
- Purpose: Provide a modal dialog for adding new volunteer records.
- Inputs: User input for the new volunteer’s data.
- Outputs: Submits data to the back-end and refreshes the user list upon successful addition.
- Structure: Comprises form fields and submission controls, integrated with the People Page state for modal visibility.

#### SnackbarAlert Component
- Purpose: Display immediate feedback to the user regarding successful or failed operations.
- Inputs: Message text, severity (success/warning), and open state.
- Outputs: Visual notification that auto-dismisses after a preset time.
- Structure: Uses Material UI Snackbar component for a consistent user experience.

#### Pagination Component
- Purpose: Break the full list of users into manageable pages.
- Inputs: Total number of filtered users and current page number.
- Outputs: Updates the People Page container’s state with the selected page, causing the UserTable to render the appropriate subset.
- Structure: Uses Material UI Pagination component to render page controls dynamically.

### 5.2 Data Flow
- Data Retrieval: Upon loading, the People Page calls the useUsers hook to fetch the full list of users.
- Filtering/Sorting: User input via the UserFilters component updates state, triggering a filtering and sorting process on the original data.
- Pagination: The filtered and sorted user list is then divided into pages based on the current page number.
- Display: The paginated list is passed to the UserTable component for rendering.
- User Actions: Actions like toggling user status or displaying the PIN invoke callback functions that update both the back-end (via useUsers) and the People Page state.
- Notifications: Success or error messages are displayed using the SnackbarAlert component.

## 6. Security and Compliance
- Access Control: Only authenticated and authorized users (admins) can update user statuses or add new users.
- Input Validation: All user inputs (search, filter, form data) are validated both on the client-side and server-side to prevent injection attacks.

## 7. Performance Considerations
- Efficient Data Handling: Data is retrieved once via the useUsers hook and then processed locally for filtering, sorting, and pagination.
- UI Responsiveness: Pagination and local data processing ensure that the interface remains responsive even with a large number of users.
- State Management: React hooks are used to update only the necessary parts of the UI upon state changes.

## 8. Deployment Considerations
- Integration: The People Page is part of the larger application and must integrate with existing authentication, API, and state management systems.
- Environment Setup: The deployed environment should support the latest versions of React and Material UI.
- Maintenance: Continuous monitoring of user feedback and error logs is required to ensure that any issues with filtering, sorting, or state updates are addressed promptly.

## 9. Risk Analysis
- Data Inconsistency: Errors in filtering, sorting, or pagination could lead to incorrect data display.
- Mitigation: Implement thorough unit and integration tests (e.g., PeoplePage.test.tsx) and conduct regular code reviews.
- Unauthorized Operations: Unauthorized users might attempt to modify user data.
- Mitigation: Enforce strict back-end validation and role-based access controls.
- Performance Bottlenecks: Handling large datasets on the client side may affect performance.
- Mitigation: Use pagination and optimize filtering/sorting algorithms to ensure UI responsiveness.

## 10. Conclusion
The People Page design document outlines a modular, maintainable, and secure architecture for user management. By combining clear component separation with robust state management and integration with the useUsers hook, the People Page ensures that administrators can effectively manage user data. The design prioritizes usability, performance, and security, making it a scalable solution for current and future user management needs.
