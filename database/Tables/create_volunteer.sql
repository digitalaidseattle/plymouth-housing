DROP TABLE IF EXISTS [dbo].[Volunteers];
GO

CREATE TABLE Volunteers (
    id INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    PIN CHAR(4) NOT NULL,
    last_signed_in DATETIME,
    created_at DATETIME NOT NULL,
    active BIT NOT NULL
);

GO