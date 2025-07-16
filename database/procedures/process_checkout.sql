DROP PROCEDURE IF EXISTS [dbo].[ProcessCheckout];
GO

CREATE PROCEDURE ProcessCheckout
    @user_id INT,
    @items NVARCHAR(MAX),
    @message NVARCHAR(MAX) = NULL OUTPUT,
    @resident_id INT
AS
BEGIN
    SET NOCOUNT ON;

    print @user_id
    print @items

    -- Validate JSON
    IF ISJSON(@items) = 0
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
    FROM OPENJSON(@items, '$')

    -- Check if the cart exceeds the item limit
    BEGIN TRY
        EXEC CheckCartItemLimit @CartItems;
    END TRY
    BEGIN CATCH
        print 'Error in cart item limit'
        SELECT 
            'Error' AS Status,
            ERROR_MESSAGE() AS message;
        RETURN;
    END CATCH

    -- ****************************************
    -- Commented out because we are not using this procedure.
    -- It happens frequently that the inventory is off. 
    -- Rejecting the checkout does not make much sence, 
    -- when a customer arrives with an article that, according to inventory, is not available.
    -- ****************************************
    --
    -- Check if we have sufficient inventory for all items
    -- BEGIN TRY
    --     EXEC CheckInsufficientInventory @CartItems;
    -- END TRY
    -- BEGIN CATCH
    --     SELECT 
    --         'Error' AS Status,
    --         ERROR_MESSAGE() AS message;
    --     RETURN;
    -- END CATCH

    -- Check if there is no violation of the max per category
    BEGIN TRY
        EXEC CheckCategoryCheckoutLimit @CartItems;
    END TRY
    BEGIN CATCH
        SELECT 
            'Error' AS Status,
            ERROR_MESSAGE() AS message;
        RETURN;
    END CATCH
    
    BEGIN TRANSACTION
    
    BEGIN TRY
        -- Update inventory
        UPDATE i
        SET i.quantity = i.quantity - ci.Quantity
        FROM Items i
        JOIN @CartItems ci ON i.id = ci.ItemId
        
        -- Log each item in the transaction
        DECLARE @CurrentItemId INT
        DECLARE @CurrentQuantity INT
        DECLARE @CurrentAdditionalNotes NVARCHAR(255)
        
        DECLARE item_cursor CURSOR FOR
        SELECT ItemId, Quantity, AdditionalNotes FROM @CartItems
        
        OPEN item_cursor
        FETCH NEXT FROM item_cursor INTO @CurrentItemId, @CurrentQuantity, @CurrentAdditionalNotes
        
        DECLARE @new_transaction_id UNIQUEIDENTIFIER;

        EXEC LogTransaction
            @user_id = @user_id,
            @transaction_type = 1,
            @resident_id = @resident_id,
            @new_transaction_id = @new_transaction_id OUTPUT;

        WHILE @@FETCH_STATUS = 0
        BEGIN
            EXEC LogTransactionItem
                @transaction_id = @new_transaction_id,
                @item_id = @CurrentItemId,
                @quantity = @CurrentQuantity,
                @additional_notes = @CurrentAdditionalNotes;
                
            FETCH NEXT FROM item_cursor INTO @CurrentItemId, @CurrentQuantity, @CurrentAdditionalNotes
            
        END
        
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