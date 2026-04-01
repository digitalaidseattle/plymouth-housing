DROP TABLE IF EXISTS [dbo].[TransactionTypes]; -- Has a Foreign Key constraint on Transactions.
GO

CREATE TABLE TransactionTypes (
    id INT IDENTITY(1,1) PRIMARY KEY,
    transaction_type NVARCHAR(30) NOT NULL
);
GO

SET IDENTITY_INSERT TransactionTypes ON;

IF NOT EXISTS (SELECT 1 FROM TransactionTypes WHERE id = 4)
INSERT INTO TransactionTypes (id, transaction_type) VALUES (4, 'CHECKOUT_EDIT');

SET IDENTITY_INSERT TransactionTypes OFF;
GO
