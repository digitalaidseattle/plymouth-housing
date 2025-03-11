DROP PROCEDURE IF EXISTS [dbo].[LogTransactionItem];
GO

CREATE PROCEDURE LogTransactionItem
    @transaction_id UNIQUEIDENTIFIER,
    @item_id INT,
    @quantity INT
AS
BEGIN
    INSERT INTO TransactionItems (
        transaction_id,
        item_id,
        quantity,
    )
    VALUES (
        @transaction_id,
        @item_id,
        @quantity,
    );
END;