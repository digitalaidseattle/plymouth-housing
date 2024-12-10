DROP TABLE IF EXISTS [dbo].[Items];
GO

CREATE TABLE Items (
    id INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    category_id INT NOT NULL,
    quantity INT NOT NULL,
    low INT NOT NULL,
    medium INT NOT NULL,
);

GO