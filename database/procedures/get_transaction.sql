DROP PROCEDURE IF EXISTS [dbo].[GetTransaction];
GO

CREATE PROCEDURE GetTransaction
    @id NVARCHAR(MAX)
AS
BEGIN
    SELECT
        T.id AS transaction_id,
        T.user_id,
        T.transaction_type,
        T.parent_transaction_id,
        T.resident_id,
        R.name AS resident_name,
        U.unit_number,
        B.id AS building_id,
        B.code AS building_code,
        B.name AS building_name,
        T.transaction_date,
        ISNULL((
            SELECT TI.id, TI.item_id, TI.quantity, TI.transaction_id, TI.additional_notes
            FROM TransactionItems TI
            WHERE TI.transaction_id = T.id
            ORDER BY TI.item_id
            FOR JSON PATH
        ), '[]') AS items
    FROM Transactions T
    LEFT JOIN Residents R ON T.resident_id = R.id
    LEFT JOIN Units U ON R.unit_id = U.id
    LEFT JOIN Buildings B ON U.building_id = B.id
    WHERE T.id = @id;
END;
