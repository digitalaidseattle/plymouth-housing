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

## Detailed Design  

### Database Schema

#### Database  

**Tables:**  
- **TransactionHistory**:  
  - `TransactionID` (Primary Key) - Unique identifier for each transaction record (UUID or GUID).
  - `UserID` (Foreign Key) - References the `Users` table to identify the admin user associated with the transaction.
  - `TransactionGUID`- Unique identifier for each transaction session (UUID or GUID). Used to correlate multiple entries for the same transaction (e.g., for the same user interacting multiple times within one session).
  - `ItemID` (Foreign Key): References the `Items` table to identify the item associated with the transaction.
  - `TransactionType`: VARCHAR(50), Type of transaction (e.g., Add, Checkout).
  - `TotalAmount`: DECIMAL(10, 2), Total amount of the transaction.
  - `TransactionDate`: DATETIME, Date and time when the transaction occurred.

**SQL Schema:**
```sql
CREATE TABLE TransactionHistory (
    TransactionID UNIQUEIDENTIFIER PRIMARY KEY,       
    UserID INT,                                        
    TransactionGUID UNIQUEIDENTIFIER,                  
    ItemID INT,                                         
    TransactionType VARCHAR(50),                          
    TotalAmount DECIMAL(10, 2),                         
    TransactionDate DATETIME DEFAULT GETDATE(),         
    
    -- Define foreign key constraints
    FOREIGN KEY (UserID) REFERENCES Users(UserID),      
    FOREIGN KEY (ItemID) REFERENCES Items(ItemID)       
);

-- Optionally, we may want to create an index for faster searching by TransactionGUID, UserID, and TransactionDate
CREATE INDEX IX_TransactionHistory_TransactionGUID ON TransactionHistory(TransactionGUID);
CREATE INDEX IX_TransactionHistory_UserID ON TransactionHistory(UserID);
CREATE INDEX IX_TransactionHistory_TransactionDate ON TransactionHistory(TransactionDate);
```

**Stored Procedures:**
- **RecordTransaction**:  
  - Inserts a new transaction record into the `TransactionHistory` table.
  - Parameters: `UserID`, `TransactionGUID`, `ItemID`, `TransactionType`, `TotalAmount`.
  
```sql
CREATE PROCEDURE LogTransaction
    @UserID INT,                     
    @TransactionGUID UNIQUEIDENTIFIER, 
    @ItemID INT,                   
    @TransactionType VARCHAR(50),     
    @TotalAmount DECIMAL(10, 2)       
AS
BEGIN
    -- Insert a new record into the TransactionHistory table
    INSERT INTO TransactionHistory (
        TransactionID,
        UserID,
        TransactionGUID,
        ItemID,
        TransactionType,
        TotalAmount,
        TransactionDate
    )
    VALUES (
        NEWID(),                     -- Generate a new GUID for the TransactionID
        @UserID,                     
        @TransactionGUID,           
        @ItemID,                   
        @TransactionType,             
        @TotalAmount,               
        GETDATE()                 
    );
END;
```

- **GetTransactionHistory**:
- Retrieves all transactions associated with a specific `UserID`(admin user only).

```sql
CREATE PROCEDURE GetTransactionHistory
    @AdminUserID INT                 -- The ID of the admin requesting transaction history
AS
BEGIN
    -- Check if the requesting user is an admin
    IF EXISTS (SELECT 1 FROM Users WHERE UserID = @AdminUserID AND IsAdmin = 1)
    BEGIN
        -- Retrieve all transaction history records
        SELECT 
            th.TransactionID,
            th.UserID,
            th.TransactionGUID,
            th.ItemID,
            th.TransactionType,
            th.TotalAmount,
            th.TransactionDate
        FROM 
            TransactionHistory th
        INNER JOIN 
            Items i ON th.ItemID = i.ItemID
        ORDER BY 
            th.TransactionDate DESC;      -- Optionally order by transaction date or any other field
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
- Front-end sends a POST request to the `/api/transactions` endpoint with transaction details and generates a TransactionGUID for the transaction.
- For each item in the transaction, the front-end sends item details along with the TransactionGUID to the API.
- The API records each item as a separate entry in the `TransactionHistory` table with the same TransactionGUID.
- The API returns the TransactionID for the transaction to the front-end.

#### When an admin views the Transaction History page:
- Front-end sends a GET request to the `/api/transactions` endpoint with the `userID` parameter.
- The API retrieves all transactions associated with the `UserID` from the `TransactionHistory` table.
- The API returns the transaction history to the front-end for display.
- The front-end groups the results by the TransactionGUID and renders the grouped data in a table with expandable rows for items details.
- Admins can view, filter, and search for transactions based on various criteria.
- Admins can click on a transaction to view detailed information.

This design allows for multiple items to be associated with a single TransactionGUID and provides a clear audit trail of all transactions.

## Risk Analysis
- **Risk**: Unauthorized Access
  **Mitigation**: Role-based access control ensures that only admin users can access transaction history.
- **Risk**: Data Integrity Issues 
  **Mitigation**: All transaction data will be logged with unique GUIDs and linked to the user performing the action. The `TransactionHistory` table will ensure that all actions are logged with accurate timestamps.  
- **Risk**: Query Performance
    **Mitigation**: Use indexes on frequently queried columns (e.g., `UserID`, `TransactionDate`, `TransactionGUID`) to improve query performance for large transaction datasets.
- **Risk**: Front-end Validation Failure
    **Mitigation**: Ensure proper validation on the frontend to prevent unauthorized access and ensure that all data inputs are sanitized before sending to the backend.

