-- SELECT
--   Items.name,
--   Items.type,
--   (SELECT Categories.name
--   FROM Categories
--   WHERE Categories.id = Items.category) AS category,
--   Items.description,
--   Items.quantity,
--   Items.status
-- FROM
--   Items;

SELECT
  *
FROM
  InventoryWithCategory;