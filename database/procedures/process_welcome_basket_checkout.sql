DROP PROCEDURE IF EXISTS [dbo].[ProcessWelcomeBasketCheckout];
GO

CREATE PROCEDURE ProcessWelcomeBasketCheckout
    @user_id INT,
    @mattress_size INT,
    @quantity INT,
    @building_code NVARCHAR(50),
    @message NVARCHAR(MAX) = NULL OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    -- Get the building_id from the building_code
    DECLARE @building_id INT;
    SELECT @building_id = id FROM Buildings WHERE code = @building_code;

    IF @building_id IS NULL
    BEGIN
        SELECT 'Error' AS Status, 'Invalid building code' AS message;
        RETURN;
    END

    -- Create a table variable to hold welcome basket items
    DECLARE @CartItems CartItemsType;
    
    -- Insert welcome basket items into the table variable
    INSERT INTO @CartItems (ItemId, Quantity)
    SELECT 
        id AS ItemId,
        @quantity * items_per_basket AS Quantity
    FROM Items
    WHERE type = 'Welcome Basket' 
    AND items_per_basket > 0; --This will omit the sheet sets. 

    -- Insert the right mattress size sheet set into the table variable
    INSERT INTO @CartItems (ItemId, Quantity)
    SELECT 
        @mattress_size as ItemId,
        @quantity AS Quantity

    -- Check if we have sufficient inventory for all items
    BEGIN TRY
        EXEC CheckInsufficientInventory @CartItems;
    END TRY
    BEGIN CATCH
        SELECT 
            'Error' AS Status,
            ERROR_MESSAGE() AS message;
        RETURN;
    END CATCH

    -- Generate a single transaction ID for the entire basket
    DECLARE @TransactionId UNIQUEIDENTIFIER = NEWID();

    BEGIN TRANSACTION

    BEGIN TRY
        -- Update inventory
        UPDATE i
        SET i.quantity = i.quantity - ci.Quantity
        FROM Items i
        JOIN @CartItems ci ON i.id = ci.ItemId;

        -- Log each item in the transaction
        DECLARE @CurrentItemId INT;
        DECLARE @CurrentQuantity INT;

        DECLARE item_cursor CURSOR FOR
        SELECT ItemId, Quantity FROM @CartItems;

        OPEN item_cursor;
        FETCH NEXT FROM item_cursor INTO @CurrentItemId, @CurrentQuantity;

        WHILE @@FETCH_STATUS = 0
        BEGIN
            EXEC LogTransaction 
                @user_id = @user_id,
                @transaction_id = @TransactionId,
                @item_id = @CurrentItemId,
                @transaction_type = 'CHECKOUT',
                @quantity = @CurrentQuantity,
                @building_id = @building_id;

            FETCH NEXT FROM item_cursor INTO @CurrentItemId, @CurrentQuantity;
        END

        CLOSE item_cursor;
        DEALLOCATE item_cursor;

        COMMIT TRANSACTION;

        -- Return success status with transaction ID
        SELECT 
            'Success' as Status,
            @TransactionId AS message;

    END TRY
    BEGIN CATCH
        -- Rollback transaction if any error occurs
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        -- Clean up cursor if still open
        IF CURSOR_STATUS('local', 'item_cursor') >= 0
        BEGIN
            CLOSE item_cursor;
            DEALLOCATE item_cursor;
        END

        SELECT 
            'Error' AS Status,
            CONCAT(
                'Error: ', ERROR_MESSAGE(),
                ', Error Number: ', ERROR_NUMBER(),
                ', State: ', ERROR_STATE()
            ) AS message;
    END CATCH
END;
GO
