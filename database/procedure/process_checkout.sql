DROP PROCEDURE IF EXISTS [dbo].[ProcessCheckout];
GO

CREATE PROCEDURE ProcessCheckout
    @user_id INT,
    @items NVARCHAR(MAX),
    @message NVARCHAR(MAX) = NULL OUTPUT
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
    INSERT INTO @CartItems (ItemId, Quantity)
    SELECT 
        ItemId = JSON_VALUE([value], '$.id'),
        Quantity = JSON_VALUE([value], '$.quantity')
    FROM OPENJSON(@items, '$')

    -- Check if we have sufficient inventory for all items
    BEGIN TRY
        EXEC CheckInsufficientInventory @CartItems;
    END TRY
    BEGIN CATCH
        SELECT 
            'Error' AS Status,
            CONCAT(
                'Error: ', ERROR_MESSAGE(),
                ', Error Number: ', ERROR_NUMBER(),
                ', State: ', ERROR_STATE()
            ) AS ErrorMessage;
        RETURN;
    END CATCH

    -- Generate a single transaction ID for the entire basket
    DECLARE @TransactionId UNIQUEIDENTIFIER = NEWID()
    
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
        
        DECLARE item_cursor CURSOR FOR
        SELECT ItemId, Quantity FROM @CartItems
        
        OPEN item_cursor
        FETCH NEXT FROM item_cursor INTO @CurrentItemId, @CurrentQuantity
        
        WHILE @@FETCH_STATUS = 0
        BEGIN
            EXEC LogTransaction 
                @user_id = @user_id,
                @transaction_id = @TransactionId,
                @item_id = @CurrentItemId,
                @transaction_type = 'CHECKOUT',
                @quantity = @CurrentQuantity
                
            FETCH NEXT FROM item_cursor INTO @CurrentItemId, @CurrentQuantity
        END
        
        CLOSE item_cursor
        DEALLOCATE item_cursor
        
        COMMIT TRANSACTION
        
        -- Return success status with transaction ID
        SELECT 
            'Success' as Status,
            @TransactionId AS message
        
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
            ) AS ErrorMessage;
            
    END CATCH
END