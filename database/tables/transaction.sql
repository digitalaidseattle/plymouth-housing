DROP TABLE IF EXISTS [dbo].[TransactionItems]; -- Has a Foreign Key constraint on Transactions.
DROP TABLE IF EXISTS [dbo].[Transactions];
GO

CREATE TABLE Transactions (
    id UNIQUEIDENTIFIER PRIMARY KEY,
    user_id INT NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    transaction_date DATETIME DEFAULT GETDATE() NOT NULL,
    building_id INT NOT NULL,
    unit_number VARCHAR(10),
    resident_name VARCHAR(50),
);

GO