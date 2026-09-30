/*
Creates transaction-history indexes on an existing database.

This script is safe to rerun. It must not drop or recreate tables.
The matching canonical index definitions are also present in
database/tables/transaction.sql and transaction_item.sql.
*/

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = N'IX_Transactions_date_type'
      AND object_id = OBJECT_ID(N'dbo.Transactions')
)
BEGIN
    CREATE INDEX IX_Transactions_date_type
        ON dbo.Transactions (transaction_date, transaction_type) INCLUDE (resident_id, building_id);
END;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = N'IX_Transactions_parent'
      AND object_id = OBJECT_ID(N'dbo.Transactions')
)
BEGIN
    CREATE INDEX IX_Transactions_parent
        ON dbo.Transactions (parent_transaction_id)
        WHERE parent_transaction_id IS NOT NULL;
END;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = N'IX_Transactions_resident'
      AND object_id = OBJECT_ID(N'dbo.Transactions')
)
BEGIN
    CREATE INDEX IX_Transactions_resident
        ON dbo.Transactions (resident_id)
        WHERE resident_id IS NOT NULL;
END;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = N'IX_TransactionItems_transaction_id'
      AND object_id = OBJECT_ID(N'dbo.TransactionItems')
)
BEGIN
    CREATE INDEX IX_TransactionItems_transaction_id
        ON dbo.TransactionItems (transaction_id) INCLUDE (item_id, quantity);
END;
GO
