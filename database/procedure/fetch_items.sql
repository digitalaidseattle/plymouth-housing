DROP PROCEDURE IF EXISTS [dbo].[FetchItems];
GO

CREATE PROCEDURE FetchItems
AS  
BEGIN  
    SELECT i.name, i.type, i.quantity, i.low, i.medium, c.name AS category, c.checkout_limit  
    FROM items i  
    INNER JOIN categories c ON i.category_id = c.id;  
END;  
GO
