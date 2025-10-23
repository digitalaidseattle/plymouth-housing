DROP PROCEDURE IF EXISTS [dbo].[LogTransactionItem];
GO

CREATE PROCEDURE LogTransactionItem
    @transaction_id UNIQUEIDENTIFIER,
    @item_id INT,
    @quantity INT,
    @additional_notes NVARCHAR(MAX) = NULL
AS
BEGIN
    INSERT INTO TransactionItems (
        transaction_id,
        item_id,
        quantity,
        additional_notes
    )
    VALUES (
        @transaction_id,
        @item_id,
        @quantity,
        @additional_notes
    );
END;