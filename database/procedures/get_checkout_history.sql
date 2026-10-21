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
        Transactions.transaction_type,
        Transactions.parent_transaction_id,
        Transactions.resident_id,
        Residents.name AS resident_name,
        Units.unit_number,
        Buildings.id AS building_id,
        Buildings.code AS building_code,
        Buildings.name AS building_name,
        Transactions.transaction_date,
        (
            SELECT ISNULL(SUM(net_qty), 0)
            FROM (
                SELECT ti2.item_id, SUM(ISNULL(ti2.quantity, 0)) AS net_qty
                FROM TransactionItems ti2
                WHERE ti2.transaction_id = Transactions.id
                  OR ti2.transaction_id IN (
                      SELECT corrections.id FROM Transactions AS corrections
                      WHERE corrections.parent_transaction_id = Transactions.id
                  )
                GROUP BY ti2.item_id
                HAVING SUM(ISNULL(ti2.quantity, 0)) > 0
            ) AS per_item_sums
        ) AS total_quantity,
        -- Item IDs 171 (Twin-size Sheet Set) and 172 (Full-size Sheet Set) identify welcome basket transactions
        MAX(CASE WHEN ti.item_id IN (171, 172) THEN ti.item_id ELSE NULL END) AS welcome_basket_item_id,
        MAX(CASE WHEN ti.item_id IN (171, 172) THEN ti.quantity ELSE NULL END) AS welcome_basket_quantity
    FROM Transactions
    INNER JOIN Residents ON Transactions.resident_id = Residents.id
    INNER JOIN Units ON Residents.unit_id = Units.id
    INNER JOIN Buildings ON Units.building_id = Buildings.id
    LEFT JOIN TransactionItems ti ON ti.transaction_id = Transactions.id
    WHERE [transaction_date] >= @start_date
        AND [transaction_date] <= @end_date
        AND [transaction_type] IN (SELECT id FROM TransactionTypes WHERE transaction_type IN ('CHECKOUT', 'CHECKOUT_EDIT'))
    GROUP BY
        Transactions.user_id,
        Transactions.id,
        Transactions.transaction_type,
        Transactions.parent_transaction_id,
        Transactions.resident_id,
        Residents.name,
        Units.unit_number,
        Buildings.id,
        Buildings.code,
        Buildings.name,
        Transactions.transaction_date
    ORDER BY Transactions.transaction_date DESC, Transactions.id;
END;
