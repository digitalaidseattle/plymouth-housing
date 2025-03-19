DROP TABLE IF EXISTS [dbo].[TransactionTypes]; -- Has a Foreign Key constraint on Transactions.
GO

CREATE TABLE TransactionTypes (
    id INT IDENTITY(1,1) PRIMARY KEY,
    transaction_type NVARCHAR(10) NOT NULL
);
GO