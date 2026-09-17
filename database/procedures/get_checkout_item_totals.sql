DROP PROCEDURE IF EXISTS [dbo].[GetCheckoutItemTotals];
GO

CREATE PROCEDURE GetCheckoutItemTotals
    @start_date DATETIME,
    @end_date DATETIME,
    @building_id INT = NULL
AS
BEGIN
    -- Validate date range
    IF @start_date > @end_date
    BEGIN
        RAISERROR('Start date must be before or equal to end date', 16, 1);
        RETURN;
    END

    SELECT
        net_items.item_id,
        i.name AS item_name,
        SUM(net_items.net_quantity) AS total_quantity,
        COUNT(DISTINCT net_items.checkout_id) AS checkout_count
    FROM (
        -- Corrections fold into their parent checkout; fully returned items net to zero and drop out
        SELECT
            COALESCE(txn.parent_transaction_id, txn.id) AS checkout_id,
            ti.item_id,
            SUM(ISNULL(ti.quantity, 0)) AS net_quantity
        FROM TransactionItems ti
        INNER JOIN Transactions txn ON txn.id = ti.transaction_id
        WHERE txn.transaction_type IN (SELECT id FROM TransactionTypes
                                       WHERE transaction_type IN ('CHECKOUT', 'CHECKOUT_EDIT'))
        GROUP BY COALESCE(txn.parent_transaction_id, txn.id), ti.item_id
        HAVING SUM(ISNULL(ti.quantity, 0)) > 0
    ) AS net_items
    -- Filtering on the parent checkout's date keeps a later edit in the original checkout's month.
    -- The Residents/Units/Buildings chain mirrors GetCheckoutHistory so both agree on which rows exist.
    INNER JOIN Transactions checkouts ON checkouts.id = net_items.checkout_id
    INNER JOIN Residents r ON checkouts.resident_id = r.id
    INNER JOIN Units u ON r.unit_id = u.id
    INNER JOIN Buildings b ON u.building_id = b.id
    INNER JOIN Items i ON i.id = net_items.item_id
    WHERE checkouts.transaction_date >= @start_date
        AND checkouts.transaction_date <= @end_date
        AND (@building_id IS NULL OR b.id = @building_id)
    GROUP BY net_items.item_id, i.name
    ORDER BY total_quantity DESC, item_name;
END;
GO
