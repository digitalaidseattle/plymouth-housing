DROP TABLE IF EXISTS [dbo].[Items];
DROP TABLE IF EXISTS [dbo].[Categories];
DROP VIEW IF EXISTS InventoryWithCategory;
DROP VIEW IF EXISTS ItemsByCategory;
GO

CREATE TABLE Categories
(
    id INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    checkout_limit INT NOT NULL
);

CREATE TABLE Items
(
    id INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    type VARCHAR(255) NOT NULL,
    category_id INT NOT NULL,
    description VARCHAR(255) NOT NULL DEFAULT '',
    quantity INT NOT NULL,
    status AS (
        CASE
            WHEN quantity < 15 THEN 'Low'
            WHEN quantity BETWEEN 16 AND 30 THEN 'Medium'
            ELSE 'High'
        END
    ),
    CONSTRAINT FK_Items_Category FOREIGN KEY (category_id) REFERENCES Categories(id)
);

GO

CREATE VIEW InventoryWithCategory
AS
    SELECT
        Items.id,
        Items.name,
        Items.type,
        (SELECT Categories.name
        FROM Categories
        WHERE Categories.id = Items.category_id) AS category,
        Items.description,
        Items.quantity,
        Items.status
    FROM
        Items;

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