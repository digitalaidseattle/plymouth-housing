USE Inventory;
GO

DROP TABLE IF EXISTS [dbo].[Items];
GO

CREATE TABLE Items (
    id INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    status VARCHAR(255)
);

GO