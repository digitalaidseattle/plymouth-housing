DROP TABLE IF EXISTS [dbo].[TransactionItems];
GO

CREATE TABLE TransactionItems (
    id INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    transaction_id UNIQUEIDENTIFIER NOT NULL,
    item_id INT NOT NULL,
    quantity INT NOT NULL,
    additional_notes NVARCHAR(MAX)
);

GO

CREATE INDEX IX_TransactionItems_transaction_id
    ON TransactionItems (transaction_id) INCLUDE (item_id, quantity);
GO