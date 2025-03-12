DROP TABLE IF EXISTS [dbo].[TransactionItems];
GO

CREATE TABLE TransactionItems (
    id INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    transaction_id INT NOT NULL,
    item_id INT NOT NULL,
    quantity INT NOT NULL,
);

GO