DROP PROCEDURE IF EXISTS [dbo].[GetInventoryHistory];
GO

CREATE PROCEDURE GetInventoryHistory
    @start_date Date,
    @end_date Date
AS
BEGIN
    -- Validate date range
    IF @start_date > @end_date
    BEGIN
        RAISERROR('Start date must be before or equal to end date', 16, 1);
        RETURN;
    END

    -- Query for the inventory transaction type IDs
    DECLARE @RestockTransactionType INT;
    SELECT @RestockTransactionType = id FROM TransactionTypes WHERE transaction_type = 'RESTOCK';

    DECLARE @CorrectionTransactionType INT;
    SELECT @CorrectionTransactionType = id FROM TransactionTypes WHERE transaction_type = 'CORRECTION';

    SELECT
        Transactions.user_id,
        Transactions.id AS transaction_id,
        Transactions.transaction_type,
        Transactions.transaction_date,
        ti.item_id,
        i.name as item_name,
        c.name as category_name,
        ti.quantity
    FROM Transactions
    INNER JOIN TransactionItems ti ON ti.transaction_id = Transactions.id
    INNER JOIN Items i ON ti.item_id = i.id
    INNER JOIN Categories c ON i.category_id = c.id
    WHERE [transaction_date] >= CAST(@start_date AS DATETIME)
        AND [transaction_date] < DATEADD(DAY, 1, CAST(@end_date AS DATETIME))
        AND [transaction_type] IN (@RestockTransactionType, @CorrectionTransactionType)
    ORDER BY Transactions.transaction_date DESC, Transactions.id, ti.item_id;
END;
