DROP PROCEDURE IF EXISTS [dbo].[ProcessWelcomeBasketCheckout];
GO

CREATE PROCEDURE ProcessWelcomeBasketCheckout
    @user_id INT,
    @mattress_size INT,
    @quantity INT,
    @building_code NVARCHAR(50),
    @message NVARCHAR(MAX) = NULL OUTPUT,
    @unit_number NVARCHAR(10),
    @resident_name NVARCHAR(50)
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

    -- Generate a single transaction ID for the entire basket
    DECLARE @new_transaction_id UNIQUEIDENTIFIER;

    BEGIN TRANSACTION

    BEGIN TRY
        -- Update inventory
        UPDATE i
        SET i.quantity = i.quantity - ci.Quantity
        FROM Items i
        JOIN @CartItems ci ON i.id = ci.ItemId;

        EXEC LogTransaction
            @user_id = @user_id,
            @transaction_type = 1,
            @building_id = @building_id,
            @resident_name = @resident_name,
            @unit_number = @unit_number,
            @new_transaction_id = @new_transaction_id OUTPUT;

        -- Log each item in the transaction
        DECLARE @CurrentItemId INT;
        DECLARE @CurrentQuantity INT;
        DECLARE @CurrentAdditionalNotes NVARCHAR(255) = NULL; -- Welcome baskets don't have additional notes

        DECLARE item_cursor CURSOR FOR
        SELECT ItemId, Quantity FROM @CartItems;

        OPEN item_cursor;
        FETCH NEXT FROM item_cursor INTO @CurrentItemId, @CurrentQuantity;

        WHILE @@FETCH_STATUS = 0
        BEGIN
            EXEC LogTransactionItem
                @transaction_id = @new_transaction_id,
                @item_id = @CurrentItemId,
                @quantity = @CurrentQuantity,
                @additional_notes = @CurrentAdditionalNotes;

            FETCH NEXT FROM item_cursor INTO @CurrentItemId, @CurrentQuantity;
        END

        CLOSE item_cursor;
        DEALLOCATE item_cursor;

        COMMIT TRANSACTION;

        -- Return success status with transaction ID
        SELECT 
            'Success' as Status,
            @new_transaction_id AS message;

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
