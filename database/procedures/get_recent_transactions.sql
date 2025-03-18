DROP PROCEDURE IF EXISTS [dbo].[GetRecentTransactions];
GO

CREATE PROCEDURE GetRecentTransactions
    @building_code NVARCHAR(7),
    @unit_number NVARCHAR(50),
    @item_id INT,
    @months INT
AS
BEGIN
    SELECT *
    FROM Transactions t
    JOIN TransactionItems ti ON t.id = ti.transaction_id
    JOIN Buildings b ON t.building_id = b.id
    WHERE b.code = @building_code
      AND t.unit_number = @unit_number
      AND ti.item_id = @item_id
      AND t.transaction_date >= DATEADD(MONTH, -@months, GETDATE());
END;