DROP PROCEDURE IF EXISTS [dbo].[CheckInsufficientInventory];
GO

DROP TYPE IF EXISTS [dbo].[CartItemsType];
GO

CREATE TYPE CartItemsType AS TABLE (
    ItemId INT,
    Quantity INT
);
GO

CREATE PROCEDURE CheckInsufficientInventory
    @CartItems CartItemsType READONLY
AS
BEGIN
    DECLARE @ErrorMessage NVARCHAR(MAX);

    IF EXISTS (
        SELECT 1
        FROM @CartItems ci
        JOIN Items i ON i.id = ci.ItemId
        WHERE i.quantity < ci.Quantity
    )
    BEGIN
        SELECT @ErrorMessage = (
            SELECT 
                'Insufficient inventory' AS Reason,
                i.name AS ItemName,
                ci.Quantity AS Requested,
                i.quantity AS Available
            FROM @CartItems ci
            JOIN Items i ON i.id = ci.ItemId
            WHERE i.quantity < ci.Quantity
            FOR JSON PATH
        );

        -- Return failure status 
        SELECT 
            'Error' as Status,
            @ErrorMessage AS message;

        RETURN;
    END
END;
