DROP TABLE IF EXISTS [dbo].[Transactions];
GO

CREATE TABLE Transactions (
    id UNIQUEIDENTIFIER PRIMARY KEY,
    user_id INT NOT NULL,
    resident_id INT,
    transaction_type INT NOT NULL,
    transaction_date DATETIME DEFAULT GETDATE() NOT NULL,
    building_id INT,
    original_transaction_id UNIQUEIDENTIFIER NULL,
);

GO