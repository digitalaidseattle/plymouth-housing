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

CREATE VIEW InventoryWithCategory 
AS 
    SELECT 
        i.id, 
        i.name, 
        i.type, 
        c.name AS category, 
        i.description, 
        i.quantity, 
        i.status 
    FROM 
        Items i
    LEFT JOIN 
        Categories c ON c.id = i.category_id;
GO

CREATE VIEW ItemsByCategory
AS
    SELECT
        Categories.id,
        Categories.name AS category,
        (
        SELECT
            Items.id,
            Items.name,
            Items.quantity
        FROM
            Items
        WHERE
            Items.category_id = Categories.id
        FOR JSON PATH
    ) AS items
    FROM
        Categories;
GO