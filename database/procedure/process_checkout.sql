DROP PROCEDURE IF EXISTS [dbo].[ProcessCheckout];
GO

CREATE PROCEDURE ProcessCheckout
--    @basketItems NVARCHAR(MAX)  -- Single parameter to match DAB expectations
    @user_id INT,
    @items NVARCHAR(MAX),
    @return NVARCHAR(MAX) = NULL OUTPUT-- Output parameter for transaction ID
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
    DECLARE @CartItems TABLE (
        ItemId INT,
        Quantity INT
    )
    
    -- Parse the JSON array into our table variable
    INSERT INTO @CartItems (ItemId, Quantity)
    SELECT 
        ItemId = JSON_VALUE([value], '$.id'),
        Quantity = JSON_VALUE([value], '$.quantity')
    FROM OPENJSON(@items, '$')

    -- Generate a single transaction ID for the entire basket
    DECLARE @TransactionId UNIQUEIDENTIFIER = NEWID()
    
    BEGIN TRANSACTION
    
    BEGIN TRY
        -- Check if we have sufficient inventory for all items
        IF EXISTS (
            SELECT 1
            FROM @CartItems ci
            JOIN Items i ON i.id = ci.ItemId
            WHERE i.quantity < ci.Quantity
        )
        BEGIN
            THROW 51000, 'Insufficient inventory for one or more items', 1;
        END
        
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
        
--        SELECT @TransactionId AS transaction_id

        -- Return success status with transaction ID
        SELECT 
            'Success' as Status,
            @TransactionId AS transaction_id
        
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
        
        SET @return = CONCAT(
            'Status: Error, ',
            'ErrorMessage: ', ERROR_MESSAGE(), ', ',
            'ErrorNumber: ', ERROR_NUMBER(), ', ',
            'ErrorState: ', ERROR_STATE()
        );
        -- Return error information
        SELECT 
            'Error' as Status,
            ERROR_MESSAGE() as ErrorMessage,
            ERROR_NUMBER() as ErrorNumber,
            ERROR_STATE() as ErrorState
            
    END CATCH
END