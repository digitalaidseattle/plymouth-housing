DROP PROCEDURE IF EXISTS [dbo].[CheckPastCheckout];
GO

CREATE PROCEDURE CheckPastCheckout
    @resident_id INT
AS
BEGIN

-- only checks past checkouts of items in the Tracking table!
SELECT * FROM TransactionItems WHERE transaction_id IN 
    (SELECT id FROM Transactions WHERE resident_id = @resident_id)
    AND item_id IN
    (SELECT item_id FROM Tracking)

END;


