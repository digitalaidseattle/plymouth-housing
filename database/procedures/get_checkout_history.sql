DROP PROCEDURE IF EXISTS [dbo].[GetCheckoutHistory];
GO

CREATE PROCEDURE GetCheckoutHistory
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

    -- Query for the checkout transaction type ID
    DECLARE @CheckoutTransactionType INT;
    SELECT @CheckoutTransactionType = id FROM TransactionTypes WHERE transaction_type = 'CHECKOUT';

    SELECT
        Transactions.user_id,
        Transactions.id AS transaction_id,
        Transactions.resident_id,
        Residents.name AS resident_name,
        Units.unit_number,
        Buildings.id AS building_id,
        Transactions.transaction_date,
        ti.item_id,
        i.name as item_name,
        c.name as category_name,
        ti.quantity
    FROM Transactions
    INNER JOIN Residents ON Transactions.resident_id = Residents.id
    INNER JOIN Units ON Residents.unit_id = Units.id
    INNER JOIN Buildings ON Units.building_id = Buildings.id
    INNER JOIN TransactionItems ti ON ti.transaction_id = Transactions.id
    INNER JOIN Items i ON ti.item_id = i.id
    INNER JOIN Categories c ON i.category_id = c.id
    WHERE [transaction_date] >= CAST(@start_date AS DATETIME)
        AND [transaction_date] < DATEADD(DAY, 1, CAST(@end_date AS DATETIME))
        AND [transaction_type] = @CheckoutTransactionType
    ORDER BY Transactions.transaction_date DESC, Transactions.id, ti.item_id;
END;
