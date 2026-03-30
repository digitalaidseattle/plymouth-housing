DROP PROCEDURE IF EXISTS [dbo].[GetCheckoutHistory];
GO

CREATE PROCEDURE GetCheckoutHistory
    @start_date DATETIME,
    @end_date DATETIME
AS
BEGIN
    -- Validate date range
    IF @start_date > @end_date
    BEGIN
        RAISERROR('Start date must be before or equal to end date', 16, 1);
        RETURN;
    END

    SELECT
        Transactions.user_id,
        Transactions.id AS transaction_id,
        Transactions.resident_id,
        Residents.name AS resident_name,
        Units.unit_number,
        Buildings.id AS building_id,
        Transactions.transaction_date,
        SUM(ti.quantity) AS total_quantity,
        -- Item IDs 171 (Twin-size Sheet Set) and 172 (Full-size Sheet Set) identify welcome basket transactions
        MAX(CASE WHEN ti.item_id IN (171, 172) THEN ti.item_id ELSE NULL END) AS welcome_basket_item_id,
        MAX(CASE WHEN ti.item_id IN (171, 172) THEN ti.quantity ELSE NULL END) AS welcome_basket_quantity
    FROM Transactions
    INNER JOIN Residents ON Transactions.resident_id = Residents.id
    INNER JOIN Units ON Residents.unit_id = Units.id
    INNER JOIN Buildings ON Units.building_id = Buildings.id
    INNER JOIN TransactionItems ti ON ti.transaction_id = Transactions.id
    WHERE [transaction_date] >= @start_date
        AND [transaction_date] <= @end_date
        AND [transaction_type] IN (SELECT id FROM TransactionTypes WHERE transaction_type IN ('CHECKOUT', 'CHECKOUT_EDIT'))
    GROUP BY
        Transactions.user_id,
        Transactions.id,
        Transactions.resident_id,
        Residents.name,
        Units.unit_number,
        Buildings.id,
        Transactions.transaction_date
    ORDER BY Transactions.transaction_date DESC, Transactions.id;
END;
