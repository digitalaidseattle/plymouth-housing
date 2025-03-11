DROP TABLE IF EXISTS [dbo].[Transactions];
GO

CREATE TABLE TransactionItems (
    id INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    transaction_id UNIQUEIDENTIFIER NOT NULL,
    item_id INT NOT NULL,
    quantity INT NOT NULL,
);

GO