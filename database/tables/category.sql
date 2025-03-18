DROP TABLE IF EXISTS [dbo].[Categories];
GO

CREATE TABLE Categories (
    id INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    checkout_limit INT NOT NULL
);

GO