DROP PROCEDURE IF EXISTS [dbo].[GetRecentTransactions];
GO

CREATE PROCEDURE GetRecentTransactions
    @resident_id INT,
    @item_id INT,
    @months INT
AS
BEGIN
    SELECT *
    FROM Transactions t
    JOIN TransactionItems ti ON t.id = ti.transaction_id
    WHERE t.resident_id = @resident_id
      AND ti.item_id = @item_id
      AND t.transaction_date >= DATEADD(MONTH, -@months, GETDATE());
END;