DROP PROCEDURE IF EXISTS [dbo].[ProcessInventoryResetQuantity];
GO

CREATE PROCEDURE ProcessInventoryResetQuantity
    @user_id INT,
    @item_id INT,
    @new_quantity INT,
    @additional_notes NVARCHAR(MAX),
    @new_transaction_id UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @ItemId INT;
    DECLARE @Quantity INT;
    DECLARE @AdditionalNotes NVARCHAR(MAX);

    SELECT
        @ItemId = @item_id,
        @Quantity = @new_quantity,
        @AdditionalNotes = @additional_notes;

    BEGIN TRY
        -- Validate inputs
        IF @item_id IS NULL OR @new_quantity IS NULL OR @new_quantity < 0
        BEGIN
        SELECT 'Error' AS Status, 'Invalid item id or quantity (must be non-negative)' AS message;
        RETURN;
    END

        -- Check item exists
        IF NOT EXISTS (
            SELECT 1
    FROM Items
    WHERE id = @item_id
        )
        BEGIN
        SELECT 'Error' AS Status, 'Item not found' AS message;
        RETURN;
    END

        -- Check for duplicate transaction BEFORE starting transaction.
        -- There is theoretically a race condition, but we generate the GUID on the client side so it's extremely unlikely.
        IF EXISTS (
            SELECT 1
    FROM Transactions
    WHERE id = @new_transaction_id
                )
            BEGIN
        SELECT
            'Error' AS Status,
            'DUPLICATE_TRANSACTION' AS ErrorCode,
            'Transaction with this ID already exists.' AS message;
        RETURN;
    END

        -- NOW start the transaction (only after all validations pass)
        BEGIN TRANSACTION;

            -- Update inventory
            UPDATE Items
            SET quantity = @new_quantity
            WHERE id = @item_id;

            -- Verify update succeeded
            IF @@ROWCOUNT <> 1
                BEGIN
        -- Force an error - XACT_ABORT will auto-rollback with error 11 or above
        RAISERROR('Item update failed', 16, 1);
    END

            -- Log the successful change
            EXEC LogTransaction
                @user_id = @user_id,
                @transaction_type = 3,
                @resident_id = NULL,
                @new_transaction_id = @new_transaction_id;

            EXEC LogTransactionItem
                @transaction_id = @new_transaction_id,
                @item_id = @item_id,
                @quantity = @new_quantity,
                @additional_notes = @additional_notes;

        COMMIT TRANSACTION;

        -- Return success
        SELECT
        'Success' AS Status,
        CAST(@new_transaction_id AS NVARCHAR(36)) AS message;

    END TRY
    BEGIN CATCH
        -- DON'T explicitly rollback - XACT_ABORT already did it
        SELECT
        'Error' AS Status,
        CONCAT(
                'Error: ', ERROR_MESSAGE(),
                ', Number: ', ERROR_NUMBER()
            ) AS message;
    END CATCH
END