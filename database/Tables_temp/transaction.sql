DROP TABLE IF EXISTS [dbo].[Transactions];
GO

CREATE TABLE Transactions (
    id INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    transaction_id UNIQUEIDENTIFIER NOT NULL,
    item_id INT NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    quantity INT NOT NULL,
    transaction_date DATETIME DEFAULT GETDATE() NOT NULL,
);

GO