# Architecture Design Document  

## Introduction  

### Purpose  
This document describes the architecture for the business rules of the inventory system. It details the integration of UI components, database structure, and front-end validation logic to enforce business rules such as category checkout limits.  

### Scope  
The architecture includes:  
- Database schema design and stored procedure for data retrieval.  
- Front-end logic for enforcing category-based checkout limits.  

Out of scope:  
- Backend validation logic for business rules.  
- Third-party integrations and advanced analytics.  
- Items table. That is done [here](./inventory-design.md).

### Definitions, Acronyms, and Abbreviations  
- **PK**: Primary Key.  
- **FK**: Foreign Key.  
- **UI**: User Interface.  

### References  
- [Inventory Design](./inventory-design.md) in this repo
- Static Web App (SWA) [here](https://learn.microsoft.com/en-us/azure/static-web-apps/). 
- Azure SQL and the [SWA database connection feature](https://learn.microsoft.com/en-us/azure/static-web-apps/database-overview) 
- [Data API builder](https://learn.microsoft.com/en-us/azure/data-api-builder/).

## System Overview  
The inventory system consists of:  
- A SQL Server database with tables for `items` and `category`.  
- A front-end UI displaying inventory data with category details and enforcing checkout limits. See [Inventory Design](./inventory-design.md) for details. 
- Stored procedures to retrieve data for display in the UI.  

## Architecture Goals and Constraints  

### Goals  
- Provide an efficient query to display inventory with category names.  
- Move business rule validation to the front end for responsiveness.  

### Constraints  
- The database backend must be SQL Server.  
- Front-end validation must handle all business rule checks for category limits.  
- Apart from the checkout limit per category, there is an additional checkout limit of 10 items per visit. 

### Example of limits per Category

| Category         | Checkout Limit |
|------------------|----------------|
| Bathroom         | 4              |
| Bedding          | 2              |
| Cleaning         | 4              |
| Clothing         | 2              |
| Food             | 3              |
| Home goods       | 2              |
| Miscellaneous    | 2              |
| Personal care    | 5              |
| Harm reduction   | 4              |
| Kitchen          | 4              |

## Detailed Design  

### Subsystems and Components  

#### Database  

**Tables:**  
- **Category**:  
  - `id` (PK).  
  - `name`.  
  - `checkout_limit`.  

- **Items**:  
  - `id` (PK).  
  - `name`.  
  - `count`.  
  - `category_id` (FK to `Category`).  
For complete table design see [Inventory Design](./inventory-design.md)

**Stored Procedure Example for UI Query:**  
```sql
CREATE PROCEDURE GetItemsWithCategories  
AS  
BEGIN  
    SELECT i.name AS item_name, i.count, c.name AS category_name, c.checkout_limit  
    FROM items i  
    INNER JOIN category c ON i.category_id = c.id;  
END;  
```
This stored procedure will be called through the DAP layer. 
It needs to be added to the [```staticwebapp.database.config```](../../swa-db-connections/staticwebapp.database.config.json).

#### User Interface  
**Responsibilities:**  
- Fetch data using the `GetItemsWithCategories` stored procedure.  
- Enforce checkout rules based on category limits using front-end logic.  

### Data Flow  

#### Items data
1. User requests inventory data.  
1. The UI invokes the stored procedure via a DAP API.  
1. Data is displayed in the UI, including category names and potentially checkout limits.  

#### Checkout

1. While filling the shopping cart, the front-end checks if the cart quantities are outside the `checkout_limit` for each category.  
1. The front end also checks whether the max total item limit of 10 has been reached. 
1. If so, the user will get a detailed error which items violates the limit. 

**Example Front-End Validation Logic:**  
```javascript
function validateCheckout(cartItems, categories) {
    for (const cartItem of cartItems) {
        const category = categories.find(cat => cat.id === cartItem.category_id);
        if (cartItem.count > category.checkout_limit) {
            return `Cannot checkout more than ${category.checkout_limit} items for ${category.name}`;
        }
    }
    return "Checkout valid";
}
```

## Risk Analysis  
- **Risk**: Front-end bypass for validation.  
  **Mitigation**: Perform backend validation as a fallback if required in the future.  
- **Risk**: Large datasets slowing the UI.  
  **Mitigation**: Implement pagination or lazy loading for inventory data.  
