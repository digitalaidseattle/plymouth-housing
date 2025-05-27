DROP PROCEDURE IF EXISTS [dbo].[CheckPastCheckout];
GO

CREATE PROCEDURE CheckPastCheckout
    @resident_id INT,
    @item_id INT
AS
BEGIN

SELECT * FROM TransactionItems WHERE transaction_id IN 
    (SELECT id FROM Transactions WHERE resident_id = @resident_id)
    AND item_id = @item_id;


END;

