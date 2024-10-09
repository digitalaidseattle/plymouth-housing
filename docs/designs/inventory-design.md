# Inventory Design Document

## 1. Introduction

### 1.1 Purpose
This document outlines the design for the inventory page for PH volunteers and admins. The page includes a catalog of PH's inventory, with filtering options and the ability to add new items via a modal interface. The goal of this document is to create an intuitive and effective way to manage and navigate the inventory.

### 1.2 Scope
In Scope:
- Table of inventory items pulling from supabase database. Includes pagination. <!-- This will change to Azure DB -->
- Dropdown buttons for filtering table based on category, type, and status.
- Search input to filter for specific terms
- Add button and popup modal to create new items in list
Out of Scope:
- Edit feature
Define the scope of the architecture, including what is included and what is out of scope.

### 1.3 Definitions, Acronyms, and Abbreviations
N/A

### 1.4 References
- [Supabase API Docs](https://supabase.com/dashboard/project/vjbckrdjaasagtermgpy/api)
- [Material UI Table](https://mui.com/material-ui/react-table/)


## 2. System Overview
This system provides an interface for managing and viewing inventory data pulled from Supabase. Upon initialization, the useEffect hook retrieves the inventory data and stores it in state. The table is then populated with items, including details like type, category, status, and quantity.

The filter container provides four filtering options:

- Type, Category, and Status: Each of these filters uses a dropdown menu, allowing users to search through the array by matching text based on the selected filter.
- Search Bar: This allows for more flexible searching, enabling users to search for specific terms across all fields.

Clicking the Add button opens a modal for adding new items or editing existing ones. The modal allows users to create new items or search for existing items to modify their quantities.

Finally, pagination is implemented to display additional data from the database in manageable portions, improving user experience when dealing with large datasets.

## 3. Architecture Goals and Constraints

### 3.1 Goals
- Readability/Reusability: Develop components and functions that are easy to read and can be reused across different user interactions.
- Usability: Create an intuitive interface for PH volunteers and admins which allows for easy access to inventory items and smooth navigation through features .
- Flexibility: Provide robust filtering options to accommodate various use cases for tracking and managing inventory.
- Scalability: Ensure the system can handle an increasing volume of inventory data efficiently, including filtering and pagination mechanisms that support large datasets.
- Security: Ensure that users can only access and modify data based on their permissions.

### 3.2 Constraints
- The database host may switch from Supabase to Microsoft Azure Database
- Adding/editing item workflow has not been finalized

## 4. Architectural Representations

### 4.1 High-Level Architecture Diagram
The high-level architecture includes the following components:
Inventory Table: Displays all items in the PH inventory, including fields such as item name, type, category, status, and quantity.

- **Filter DropDown/Search**: Allows users to filter the table by item type, category, status, or search specific terms. This enables efficient navigation and quick retrieval of relevant items.

- **Pagination**: Divides the list of items into pages, making it easier to navigate large inventories and ensuring a clean, organized view.

- **Add Item Modal**: Provides a user interface for creating new items or editing existing ones in the inventory. This modal interacts with the database to add new records or modify existing entries.

- **Database (Supabase)**: Stores and manages all inventory data, including item details such as type, category, status, and quantity. The system fetches data from the database on initialization and updates it as users add or modify items.

### 4.2 Component Descriptions
- **Inventory Table**
  - Responsibility: Displaying a list of all items in the inventory, including item-specific details such as type, category, status, and quantity
  - Interactions: Receives data from the state that is populated by fetching data from Supabase. Interacts with the filtering and search components to display relevant data based on user input

- **Filter DropDwon/Search**:
  - Responsibility: Allow users to narrow down the displayed items in the inventory table based on specific criteria.
  - Interactions: Triggers filtering functions that search through the state data for items that match the criteria. The search bar enables broader searching. Updates the inventory table dynamically.

- **Pagination**
  - Responsibility: Breaks the inventory list into smaller, more manageable sections, improving both performance and user experience.
  - Interactions: Slices the data array into smaller sections. Works in conjunction with the filter and search components to ensure that filtered results are also paginated correctly.

- **Add Item Modal**
  - Responsibility: Allows users to either create new inventory items or update existing items.
  - Interactions: Sends requests to the database to add new items or update existing ones. Updates the state with the newly added or modified items.

- **Database**
  - Responsibility: Stores all inventory information, including name, type, category, status, and quanitty.
  - Interactions: System fetches data from Supabase
  - Adding/editing items sends API requests to Supabase

## 5. Detailed Design

### 5.1 Subsystems and Components
**Inventory Table**
Purpose: Display component that lists all items currently stored in the inventory. Its role is to show item details such as name, type category, status and quantity, and to respond dynamically to filters/sesarches.
Input: Data from database and user input in the form of filters, search terms, or pagination actions.
Output: Dynamically populated table displaying relevant items based on current filtering and search criteria.
Internal Structure: Table structure using JSX. Table rows dynamically generated based on state data. Listeners to respond to changes in filters, search terms, or pagination controls.
Dependencies: Supabase database for fetching data. Filtering, search, and pagination components. State management to manage data flow.

**Filter DropDown/Search**
Purpose: Allows users to filter the inventory based on predefined fields or perform open-ended searches.
Input: User selection in dropdown or text input for search.
Output: Filtered subset of items that meet criteria. Updated inventory table.
Internal Structure: Dropdown menus for each filter. Search bar with an input field. Filter fuction that searches through the state and matches each filtered option.
Dependencies: State management to fetch and hold inventory data. Inventory table for displaying filtered results. User input via dropdown/search.

**Pagination**
Purpose: Divides the list of inventory items into pages to present manageable amounts of data at a time.
Input: Current state of the filtered/unfiltered inventory data. User actions on page selection.
Output: Subset of items to be displayed. Pagination control update to reflect current page.
Internal Structure: Page buttons and controls rendered dynamically based on number of items.
Dependencies: Inventory table to display correct set of items. State management to store and update current page. Filter/search components to update displayed page accordingly.

**Add Item Modal**
Purpose: Allows users to create new inventory entries or edit existing ones.
Input: User input for new or updated item details. Existing inventory data in case of edits.
Output: API calls to the database to create new items or update. Update inventory state with new/update items.
Internal Structure: Form inputs for item name, type, category, and quantity. Submission button to trigger API call.
Dependencies: Supabase API for updating/adding. Inventory table for displaying updated data. State management for holding new or edited item data.

**Database**
Purpose: Store all inventory-related data. Central repository for system's data.
Input: API requests from the frontend to fetch, add, or modify data.
Output: Inventory data.
Internal Structure: Relational database structure with tables for storing inventory details. APIs that handle CRUD
Dependencies: Frontend components for sending API requests.

### 5.2 Data Flow
The page initializes with a useEffect making an API request to Supabase and pulls an array of objects. Each object in the array contains key-value pairs related to the item name, category, type, quantity, and status. The array gets placed into a state, which is then sliced and mapped for the table to display each object as a row. When a filtered or searched term is applied, the array is filtered for strings that include the filtered options, and updates the state, which is then mapped/sliced again.

Adding/editing makes another API call to Supabase to create a new row in the SQL table or by updating existing row. The application then makes another GET request to update the data state and display the new array.

## 6. Security and Compliance

### 6.1 Security Considerations
Authorization is based on the user's account level, which is determined with their Azure OAuth. Access to read/edit Supabase requires users to have an anon-key provided by Supabase and pre-approved by admin level users.

Currently, the anon-key is input on the .env-local file, which is served to the client upon access. This may be changed later via server-side encryption to prevent exposure.

### 6.2 Compliance Requirements
- Ensure compliance with GDPR for handling volunteer data.
  - **Data Minimization**: Only collect data that is necessary for the operation of the system. For example, storing name, email, and PIN is necessary for authentication.

## 7. Performance Considerations

### 7.1 Performance Requirements
Fetching data and populating the inventory page upon initialization should be quick. Filter responses are set to 300ms so as to not continuously make filter requests when typing in the search input. Adding/updating the inventory page is optimized for fast response time, with 'status' column being updated on the database side.


### 7.2 Scalability
- The architecture should support adding more items and scaling up the database as needed.
- The system should handle increased traffic during peak volunteer sign-in times.

## 8. Deployment Considerations

### 8.1 Deployment Strategy
- Deploy the web application on a cloud platform (e.g., Azure Web Services).
- Integrate Azure OAuth configurations for authentication.
- Ensure database backups and failover strategies are in place.

### 8.2 Maintenance
- Regularly update and patch the OAuth integration for security.
- Monitor the database for performance and maintain data integrity.

## 9. Risk Analysis
Anon-key exposure on the client side could lead to unwanted read/edit access. Mitigation for this would be to reset the anon-key and rollback affected data. Alternatively, would be to create a server side for application so that it can be hidden.
Identify potential risks in the architecture and provide mitigation strategies.

## 10. Database Schema

### Inventory
| Column Name      | Data Type | Description                          |
|------------------|-----------|--------------------------------------|
| `id`             | INT       | Primary key, auto-increment.         |
| `name`     | VARCHAR   | Item's name.              |
| `type`  | VARCHAR   | Donation Type (donation or welcome basket)  |
| `category`            | VARCHAR   | Category of item    |
| `quantity` | INT  | Amount of item       |
 |`status`	 | VARCHAR |	If <20, "Low". 21-50 "Medium". 51+ "High" |

## 10. Conclusion
The architecture of the inventory management tracker has been carefully designed to meet the goals of scalability, usability, flexibility, reusability, and security. The system effectively balances these objectives through a modular and maintainable structure that ensures consistent performance across various use cases.
