DROP TABLE IF EXISTS [dbo].[Users];
GO

CREATE TABLE Users (
    id INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    PIN CHAR(4) NULL,
    last_signed_in DATETIME,
    created_at DATETIME NOT NULL,
    active BIT NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('volunteer', 'admin')),
    -- Role, must be either 'volunteer' or 'admin'
    CHECK (role = 'admin' OR (PIN IS NOT NULL))
    -- Ensure PIN are not NULL for volunteers
);

GO