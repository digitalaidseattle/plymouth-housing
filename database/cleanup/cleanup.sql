DROP VIEW IF EXISTS ItemsWithCategory;
DROP VIEW IF EXISTS ItemsByCategory;

DROP PROCEDURE IF EXISTS ProcessCheckout;
DROP PROCEDURE IF EXISTS CheckCategoryCheckoutLimit;
DROP PROCEDURE IF EXISTS CheckInsufficientInventory
DROP PROCEDURE IF EXISTS CheckCartItemLimit;

DROP TYPE IF EXISTS CartItemsType;

DROP TABLE IF EXISTS Transactions; -- Has a Foreign Key constraint on Items.
DROP TABLE IF EXISTS Items;
DROP TABLE IF EXISTS Categories;
DROP TABLE IF EXISTS Volunteers;
DROP TABLE IF EXISTS Users;
