DROP TABLE IF EXISTS [dbo].[Transactions];
GO

CREATE TABLE Transactions (
    id UNIQUEIDENTIFIER PRIMARY KEY,
    user_id INT NOT NULL,
    transaction_type INT NOT NULL,
    transaction_date DATETIME DEFAULT GETDATE() NOT NULL,
    building_id INT,
    unit_number NVARCHAR(10),
    resident_name NVARCHAR(50),
);

GO