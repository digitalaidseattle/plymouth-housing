DROP PROCEDURE IF EXISTS [dbo].[ProcessInventoryReplaceQuantity];
GO

CREATE PROCEDURE ProcessInventoryReplaceQuantity
    @user_id INT,
    @item NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    -- Validate JSON
    IF ISJSON(@item) = 0
    BEGIN
        THROW 51002, 'Invalid JSON format', 1;
    END

    DECLARE @ItemId INT;
    DECLARE @Quantity INT;
    DECLARE @AdditionalNotes NVARCHAR(MAX);

    SELECT 
        @ItemId = JSON_VALUE([value], '$.id'),
        @Quantity = JSON_VALUE([value], '$.quantity'),
        @AdditionalNotes = JSON_VALUE([value], '$.additional_notes')
    FROM OPENJSON(@item, '$')
    
    BEGIN TRANSACTION
    
    BEGIN TRY            
        -- First, create the transaction ID
        DECLARE @new_transaction_id UNIQUEIDENTIFIER;

        -- Log to Transaction Table 
        -- Transaction type of '3' to differentiate from a regular inventory update
        EXEC LogTransaction
            @user_id = @user_id,
            @transaction_type = 3,
            @resident_id = NULL,
            @new_transaction_id = @new_transaction_id OUTPUT;
        
        -- Log to Transaction Item Table
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
        FROM Items i
        WHERE i.id = @ItemId
        
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