# Appliance Tracking Design Document

Architecture Design Document

## 1. Introduction
This document outlines the architecture design for the appliance tracking system. The system is designed to track specific line items in the inventory table, including additional details such as the building code, unit number, resident's name, and additional notes.

## 2. System Overview
The system will enhance the existing inventory and transaction tracking capabilities by adding additional fields and functionality to track specific line items. This includes changes to the Items and Transactions tables, as well as the creation of a stored procedure to enforce checkout restrictions.

## 3. Architecture Goals and Constraints
Goals:
- Track specific line items in the inventory.
- Capture additional details during the checkout process.
- Prevent residents from checking out certain line items more than once in a specified period.
Constraints:
- Maintain compatibility with existing database schema.
- Ensure data integrity and security.

## 4. Architectural Representations
The architecture consists of the following components:

- Database Schema: Changes to the Items and Transactions tables.
- Stored Procedure: A procedure to enforce checkout restrictions.

## 5. Data Flow

### Changes to the Items Table
Add a flag to indicate whether an item requires additional tracking.

```sql
ALTER TABLE Items
ADD requires_tracking BIT NOT NULL DEFAULT 0;
```

Changes to the ```Transactions``` Table
Add columns to capture the unit number, resident's name, and additional notes.

```sql
ALTER TABLE Transactions
ADD unit_number VARCHAR(10),
ADD resident_name VARCHAR(50),
ADD additional_notes TEXT;
```

### Stored Procedure
Create a stored procedure to retrieve transactions in the previous x months that contain a building, unit number, and specific line item.

```sql
CREATE PROCEDURE GetRecentTransactions
    @building_code VARCHAR(7),
    @unit_number VARCHAR(50),
    @item_id INT,
    @months INT
AS
BEGIN
    SELECT *
    FROM Transactions t
    JOIN Buildings b ON t.building_id = b.id
    WHERE b.code = @building_code
      AND t.unit_number = @unit_number
      AND t.item_id = @item_id
      AND t.transaction_date >= DATEADD(MONTH, -@months, GETDATE());
END;
```

### UI Logic
When a resident adds an item that requires tracking to the shopping cart, 
an additional dialogue pops up that asks for the following details: 
- building code
- unit number
- resident name
- additional notes

Before allowing confirmation on the transaction, 
the transaction database is queried with the previously mentioned ```GetRecentTransactions``` Stored Procedure. 
If an identical item was already checked out previously, 
a warning message will pop up. 
This message will alert the volunteer of the recent transaction.
It is left up to the discretion of the volunteer to allow or deny the transaction. 
(In other words, the system should not block it.)

When the checkout is processed, the previously mentioned additional details are added to the [```process_checkout```](database\procedures\process_checkout.sql) stored procedure. 
The ```process_checkout``` stored procedure implementation will add these details to the transactions table only for the items that require tracking. 

## 6. Security and Compliance
Authorization: We're using a stored Procedure to limit access to the transaction table

## 7. Performance Considerations
We opted for adding a column to the inventory table for each item, 
to prevent additional roundtrips when a tracking required item is added to the cart. The whole inventory table is cached on the client side. 

For obvious scaling reasons, we can not do the same for the transactions. (The transaction table is going to grow quickly.)
In the future, we might opt to cache only transactions that concern items that require tracking. 