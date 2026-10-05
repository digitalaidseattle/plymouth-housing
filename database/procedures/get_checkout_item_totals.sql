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

    DECLARE @checkout_type INT = (SELECT id FROM TransactionTypes WHERE transaction_type = 'CHECKOUT');
    DECLARE @checkout_edit_type INT = (SELECT id FROM TransactionTypes WHERE transaction_type = 'CHECKOUT_EDIT');

    ;WITH filtered_checkouts AS (
        SELECT checkouts.id
        FROM Transactions checkouts
        INNER JOIN Residents r ON checkouts.resident_id = r.id
        INNER JOIN Units u ON r.unit_id = u.id
        INNER JOIN Buildings b ON u.building_id = b.id
        WHERE checkouts.transaction_type = @checkout_type
            AND checkouts.parent_transaction_id IS NULL
            AND checkouts.transaction_date >= @start_date
            AND checkouts.transaction_date <= @end_date
            AND (@building_id IS NULL OR b.id = @building_id)
    ),
    net_items AS (
        SELECT
            fc.id AS checkout_id,
            ti.item_id,
            SUM(ISNULL(ti.quantity, 0)) AS net_quantity
        FROM filtered_checkouts fc
        INNER JOIN Transactions src
            ON src.id = fc.id
            OR (src.parent_transaction_id = fc.id AND src.transaction_type = @checkout_edit_type)
        INNER JOIN TransactionItems ti ON ti.transaction_id = src.id
        GROUP BY fc.id, ti.item_id
        HAVING SUM(ISNULL(ti.quantity, 0)) > 0
    )
    SELECT
        net_items.item_id,
        i.name AS item_name,
        SUM(net_items.net_quantity) AS total_quantity,
        COUNT(DISTINCT net_items.checkout_id) AS checkout_count
    FROM net_items
    INNER JOIN Items i ON i.id = net_items.item_id
    GROUP BY net_items.item_id, i.name
    ORDER BY total_quantity DESC, item_name;
END;
GO
