# Architecture Design Document for Transaction History Page

## Introduction  

### Purpose  
This document outlines the architecture for implementing a Transaction History feature in the Plymouth House inventory system.
It details the design of 
- The database schema for tracking and logging transaction activities.
- The API endpoints for CRUD operations on transaction data.
- The front-end logic for displaying transaction history to admin users only.

### Scope  
The architecture includes:  
- Database schema design and stored procedure for transaction history.  
- API endpoints for recording and retrieving transactions data.
- Front-end components for displaying transaction history to admins.  

Out of scope:  
- Authentication and authorization mechanisms.  
- Detailed UI/UX design.

## System Overview  
The Transaction History system consists of:  
- A SQL Server table for storing transaction records.
- API endpoints for CRUD transaction data.
- A front-end page for displaying transaction history to admin users.
- user_id references the Users table.

## Architecture Goals and Constraints

### Goals
1. Ensure transaction history is recorded with:
    - Primary key for each transaction.
    - User ID.
    - Transaction GUID.
    - Item ID.
    - Transaction type (e.g., Add, Checkout).
    - Total amount.
    - Transaction date.
2. Provide API endpoints for recording and retrieving transaction data only for admin users.

### Constraints
- Admin role management will control access to the transaction history data.
- Transaction data must be logged in real-time during any item addition or checkout.
- The transaction history page should be able to display all transactions for a specific user.
- The transaction history page should be able to display detailed information for each transaction.
- The transaction history page should be able to filter and search transactions based on various criteria.
- The Transactions table references user_id from Users.

## Detailed Design  

### Database Schema

#### Database  

**Tables:**  
- **Transactions**:  
  - `id` (Primary Key) - Unique identifier for each transaction record.
  - `user_id` (Foreign Key) - References the `Users` table to identify the user (admin or volunteer) associated with the transaction.
  - `transaction_id`- Unique identifier for each transaction session (UUID or GUID). Used to correlate multiple entries for the same transaction (e.g., for the same user checking out several items within one transaction, or tracking all the items in a welcome basket).
  - `item_id` (Foreign Key): References the `Items` table to identify the item associated with the transaction.
  - `transaction_type`: VARCHAR(50), Type of transaction (e.g., Add, Checkout).
  - `quantity`: Total number of items with `item_id` in this transaction.
  - `transaction_date`: DATETIME, Date and time when the transaction occurred.

**SQL Schema:**
```sql
CREATE TABLE Transactions (
    id INT NOT NULL IDENTITY(1,1) PRIMARY KEY,       
    user_id INT NOT NULL,                                        
    transaction_id UNIQUEIDENTIFIER NOT NULL,                  
    item_id INT NOT NULL,                                         
    transaction_type VARCHAR(50) NOT NULL,                          
    quantity INT NOT NULL,                         
    transaction_date DATETIME DEFAULT GETDATE() NOT NULL,         
    
    -- Define foreign key constraints
    FOREIGN KEY (user_id) REFERENCES Users(id),      
    FOREIGN KEY (item_id) REFERENCES Items(id)       
);

-- Optionally, we may want to create an index for faster searching by transaction_id, user_id, and transaction_date
CREATE INDEX IX_TransactionHistory_TransactionId ON Transactions(transaction_id);
CREATE INDEX IX_TransactionHistory_UserId ON Transactions(user_id);
CREATE INDEX IX_TransactionHistory_TransactionDate ON Transactions(transaction_date);
```

**Stored Procedures:**
- **RecordTransaction**:  
  - Inserts a new transaction record into the `Transactions` table.
  - Parameters: `user_id`, `transaction_id`, `item_id`, `transaction_type`, `quantity`.
  
```sql
CREATE PROCEDURE LogTransaction
    @user_id INT,                     
    @transaction_id UNIQUEIDENTIFIER, 
    @item_id INT,                   
    @transaction_type VARCHAR(50),     
    @quantity INT       
AS
BEGIN
    -- Insert a new record into the Transactions table
    INSERT INTO Transactions (
        user_id,
        transaction_id,
        item_id,
        transaction_type,
        quantity,
    )
    VALUES (
        @user_id,                     
        @transaction_id,           
        @item_id,                   
        @transaction_type,             
        @quantity,                             
    );
END;
```

- **GetTransactionHistory**:
- Retrieves all transactions associated with a specific `user_id`(admin user only).

```sql
CREATE PROCEDURE GetTransactionHistory
    @AdminUserID INT                 -- The ID of the admin requesting transaction history
AS
BEGIN
    -- Check if the requesting user is an admin
    IF EXISTS (SELECT 1 FROM Users WHERE user_id = @AdminUserID AND IsAdmin = 1)
    BEGIN
        -- Retrieve all transaction history records
        SELECT 
            th.TransactionID,
            th.user_id,
            th.TransactionGUID,
            th.item_id,
            th.transaction_type,
            th.TotalAmount,
            th.transaction_date
        FROM 
            Transactions th
        INNER JOIN 
            Items i ON th.item_id = i.item_id
        ORDER BY 
            th.transaction_date DESC;      -- Optionally order by transaction date or any other field
    END
    ELSE
    BEGIN
        -- If not an admin, return an error message
        THROW 50000, 'Access Denied. Only admins can access transaction history.', 1;
    END
END;
```

### API Endpoints

**Record Transaction**
- **Endpoint:** POST /api/transactions
- **Request Body:**  
  ```json
  {
    "userID": 123,
    "transactionGUID": "abc123",
    "totalAmount": 100.00,
    "transactionType": "Add",
    "transactionDate": "2021-10-01T12:00:00",
    "itemID": 456
  }
  ```
- **Response:**  
  ```json
  {
    "transactionID": 789
  }
  ```
  
**Get Transaction History**
- **Endpoint:** GET /api/transactions?userID=123
- **Response:**  
  ```json
  [
    {
      "transactionID": 789,
      "userID": 123,
      "transactionGUID": "abc123",
      "totalAmount": 100.00,
      "transactionType": "Add",
      "transactionDate": "2021-10-01T12:00:00",
      "itemID": 456
    }
  ]
  ```

### Data Flow
#### When a transaction occurs (items added or checked out):
- Front-end sends transaction details to the backend.
- The backend calls a stored procedure to generate a `transaction_id`, update the inventory, and log the transaction in the Transactions table.
- The backend returns the `transaction_id` for the front-end to confirm that transaction was successfully logged in the backend.

#### When an admin views the Transaction History page:
- Front-end sends a GET request to the `/api/transactions` endpoint with the `userID` parameter.
- The API retrieves all transactions associated with the `user_id` from the `Transactions` table.
- The API returns the transaction history to the front-end for display.
- The front-end groups the results by the TransactionGUID and renders the grouped data in a table with expandable rows for items details.
- Admins can view, filter, and search for transactions based on various criteria.
- Admins can click on a transaction to view detailed information.

This design allows for multiple items to be associated with a single TransactionGUID and provides a clear audit trail of all transactions.

## Risk Analysis
- **Risk**: Unauthorized Access
  **Mitigation**: Role-based access control ensures that only admin users can access transaction history.
- **Risk**: Data Integrity Issues 
  **Mitigation**: All transaction data will be logged with unique GUIDs and linked to the user performing the action. The `Transactions` table will ensure that all actions are logged with accurate timestamps.  
- **Risk**: Query Performance
    **Mitigation**: Use indexes on frequently queried columns (e.g., `user_id`, `transaction_date`, `TransactionGUID`) to improve query performance for large transaction datasets.
- **Risk**: Front-end Validation Failure
    **Mitigation**: Ensure proper validation on the frontend to prevent unauthorized access and ensure that all data inputs are sanitized before sending to the backend.

