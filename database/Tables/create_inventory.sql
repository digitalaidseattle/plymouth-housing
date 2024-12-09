DROP TABLE IF EXISTS [dbo].[Items];
DROP TABLE IF EXISTS [dbo].[Categories];
GO

CREATE TABLE Categories (
    id INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    checkout_limit INT NOT NULL
);

CREATE TABLE Items (
    id INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    type VARCHAR(255) NOT NULL,
    category INT NOT NULL,
    description VARCHAR(255) NOT NULL DEFAULT '',
    quantity INT NOT NULL,
    status AS (
        CASE
            WHEN quantity < 15 THEN 'Low'
            WHEN quantity BETWEEN 16 AND 30 THEN 'Medium'
            ELSE 'High'
        END
    ),
    CONSTRAINT FK_Items_Category FOREIGN KEY (category) REFERENCES Categories(id)
);

GO