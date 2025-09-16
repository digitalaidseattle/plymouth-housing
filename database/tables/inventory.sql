DROP TABLE IF EXISTS [dbo].[Items];

GO

CREATE TABLE Items (
    id INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    type NVARCHAR(255) NOT NULL,
    category_id INT NOT NULL,
    description NVARCHAR(255),
    quantity INT NOT NULL,
    threshold INT NOT NULL,
    items_per_basket INT
    );
GO

CREATE VIEW ItemsWithCategory
AS
    SELECT
        i.id,
        i.name,
        i.type,
        c.name AS category,
        i.description,
        i.quantity,
        CASE
            WHEN i.quantity = 0 THEN 'Out of Stock'
            WHEN i.quantity > 0 AND i.quantity <= i.threshold THEN 'Low Stock'
            WHEN i.quantity < 0 THEN 'Needs Review'
            ELSE 'Normal Stock'
        END AS status
    FROM
        Items i
    LEFT JOIN
        Categories c ON c.id = i.category_id;
GO

CREATE VIEW ItemsByCategory
AS
    SELECT
        Categories.id,
        Categories.checkout_limit,
        Categories.name AS category,
        (
        SELECT
            Items.id,
            Items.name,
            Items.description,
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