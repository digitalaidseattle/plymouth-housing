DROP TABLE IF EXISTS [dbo].[Buildings];
GO

CREATE TABLE Buildings (
    id INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    code VARCHAR(7)  NOT NULL UNIQUE
);

GO