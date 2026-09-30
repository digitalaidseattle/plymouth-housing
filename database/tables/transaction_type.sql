DROP TABLE IF EXISTS [dbo].[TransactionTypes]; -- Has a Foreign Key constraint on Transactions.
GO

CREATE TABLE TransactionTypes (
    id INT IDENTITY(1,1) PRIMARY KEY,
    transaction_type NVARCHAR(30) NOT NULL
);
GO

CREATE INDEX IX_Transactions_date_type
    ON Transactions (transaction_date, transaction_type) INCLUDE (resident_id, building_id);
GO

CREATE INDEX IX_Transactions_parent
    ON Transactions (parent_transaction_id)
    WHERE parent_transaction_id IS NOT NULL;
GO

CREATE INDEX IX_Transactions_resident
    ON Transactions (resident_id)
    WHERE resident_id IS NOT NULL;
GO
