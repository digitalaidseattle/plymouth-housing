DROP TABLE IF EXISTS [dbo].[Transactions];
GO

CREATE TABLE Transactions (
    id UNIQUEIDENTIFIER PRIMARY KEY,
    user_id INT NOT NULL,
    resident_id INT,
    transaction_type INT NOT NULL,
    transaction_date DATETIME DEFAULT GETDATE() NOT NULL,
    building_id INT,
    parent_transaction_id UNIQUEIDENTIFIER NULL,
);

GO

CREATE INDEX IX_Transactions_date_type
    ON dbo.Transactions (transaction_date, transaction_type) INCLUDE (resident_id, building_id);
GO

CREATE INDEX IX_Transactions_parent
    ON dbo.Transactions (parent_transaction_id)
    WHERE parent_transaction_id IS NOT NULL;
GO

CREATE INDEX IX_Transactions_resident
    ON dbo.Transactions (resident_id)
    WHERE resident_id IS NOT NULL;
GO
