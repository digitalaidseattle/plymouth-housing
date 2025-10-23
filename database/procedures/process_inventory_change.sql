DROP PROCEDURE IF EXISTS [dbo].[ProcessInventoryChange];
GO

CREATE PROCEDURE ProcessInventoryChange
    @user_id INT,
    @item NVARCHAR(MAX),
    @new_transaction_id UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    -- Check if the transaction ID already exists
    IF EXISTS (SELECT 1 FROM Transactions WHERE id = @new_transaction_id)
    BEGIN
        SELECT 
            'Error' AS Status,
            'DUPLICATE_TRANSACTION' AS ErrorCode,
            'Transaction with this ID already exists.' AS message;
        RETURN;
    END

    -- Validate JSON
    IF ISJSON(@item) = 0
    BEGIN
        THROW 51002, 'Invalid JSON format', 1;
    END
    
    -- Create a table variable to hold our parsed JSON items
    DECLARE @CartItems CartItemsType

    -- Parse the JSON array into our table variable
    INSERT INTO @CartItems (ItemId, Quantity, AdditionalNotes)
    SELECT 
        ItemId = JSON_VALUE([value], '$.id'),
        Quantity = JSON_VALUE([value], '$.quantity'),
        AdditionalNotes = JSON_VALUE([value], '$.additional_notes')
    FROM OPENJSON(@item, '$')
    
    BEGIN TRANSACTION
    
    BEGIN TRY            
        -- After transaction ID is obtained, set up cursor
        DECLARE @CurrentItemId INT
        DECLARE @CurrentQuantity INT
        DECLARE @CurrentAdditionalNotes NVARCHAR(255)
        
        DECLARE item_cursor CURSOR FOR
        SELECT ItemId, Quantity, AdditionalNotes FROM @CartItems
        
        OPEN item_cursor
        FETCH NEXT FROM item_cursor INTO @CurrentItemId, @CurrentQuantity, @CurrentAdditionalNotes
        
        -- Log to Transaction Table 
        EXEC LogTransaction
            @user_id = @user_id,
            @transaction_type = 2,
            @resident_id = NULL,
            @new_transaction_id = @new_transaction_id;
        
        -- Log to Transaction Item Table
        WHILE @@FETCH_STATUS = 0
        BEGIN
            EXEC LogTransactionItem
                @transaction_id = @new_transaction_id,
                @item_id = @CurrentItemId,
                @quantity = @CurrentQuantity,
                @additional_notes = @CurrentAdditionalNotes;
                
            FETCH NEXT FROM item_cursor INTO @CurrentItemId, @CurrentQuantity, @CurrentAdditionalNotes
        END

        -- Update inventory
        UPDATE i
        SET i.quantity = i.quantity + ci.Quantity
        FROM Items i
        JOIN @CartItems ci ON i.id = ci.ItemId
        
        CLOSE item_cursor
        DEALLOCATE item_cursor
        
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
            
        -- Clean up cursor if still open
        IF CURSOR_STATUS('local', 'item_cursor') >= 0
        BEGIN
            CLOSE item_cursor
            DEALLOCATE item_cursor
        END
        
        SELECT 
            'Error' AS Status,
            CONCAT(
                'Error: ', ERROR_MESSAGE(),
                ', Error Number: ', ERROR_NUMBER(),
                ', State: ', ERROR_STATE()
            ) AS message;
            
    END CATCH
END