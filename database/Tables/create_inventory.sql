DROP TABLE IF EXISTS [dbo].[Items];
GO

CREATE TABLE Items (
    id INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    status AS (
        CASE
            WHEN quantity < 15 THEN 'Low'
            WHEN quantity BETWEEN 16 AND 30 THEN 'Medium'
            ELSE 'High'
        END
    )
);

GO