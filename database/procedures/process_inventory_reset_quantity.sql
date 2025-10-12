DROP PROCEDURE IF EXISTS [dbo].[ProcessInventoryResetQuantity];
GO

CREATE PROCEDURE ProcessInventoryResetQuantity
    @user_id INT,
    @item NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    -- Validate JSON
    IF ISJSON(@item) = 0
    BEGIN
        THROW 51002, 'Invalid JSON format', 1;
    END

    DECLARE @ItemId INT;
    DECLARE @Quantity INT;
    DECLARE @AdditionalNotes NVARCHAR(MAX);

      -- Expect exactly one element in the array; extract typed values from index 0
    SELECT
        @ItemId = TRY_CONVERT(INT, JSON_VALUE(@item, '$[0].id')),
        @Quantity = TRY_CONVERT(INT, JSON_VALUE(@item, '$[0].quantity')),
        @AdditionalNotes = JSON_VALUE(@item, '$[0].additional_notes');

    IF @ItemId IS NULL OR @Quantity IS NULL OR @Quantity < 0
        THROW 51003, 'Invalid item id or quantity (must be a non-negative integer).', 1;
    
    BEGIN TRANSACTION
    
    BEGIN TRY            
        DECLARE @new_transaction_id UNIQUEIDENTIFIER;

        EXEC LogTransaction
            @user_id = @user_id,
            @transaction_type = 3, -- 3: TransactionTypes.CORRECTION
            @resident_id = NULL,
            @new_transaction_id = @new_transaction_id OUTPUT;
        
        BEGIN
            EXEC LogTransactionItem
                @transaction_id = @new_transaction_id,
                @item_id = @ItemId,
                @quantity = @Quantity,
                @additional_notes = @AdditionalNotes;
    
        END

        -- Update inventory
        UPDATE i
        SET i.quantity = @Quantity
        FROM dbo.Items AS i
        WHERE i.id = @ItemId;

        IF @@ROWCOUNT <> 1
            THROW 51004, 'No item updated. Invalid item id or concurrent change.', 1;
        
        COMMIT TRANSACTION
        
        -- Return success status with transaction ID
        SELECT 
            'Success' as Status,
            @new_transaction_id AS message
        
    END TRY
    BEGIN CATCH
        -- Rollback transaction if any error occurs
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION
        
        SELECT 
            'Error' AS Status,
            CONCAT(
                'Error: ', ERROR_MESSAGE(),
                ', Error Number: ', ERROR_NUMBER(),
                ', State: ', ERROR_STATE()
            ) AS message;

    END CATCH
END