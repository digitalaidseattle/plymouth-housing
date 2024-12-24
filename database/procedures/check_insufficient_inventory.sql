DROP PROCEDURE IF EXISTS [dbo].[CheckInsufficientInventory];
GO

CREATE PROCEDURE CheckInsufficientInventory
    @CartItems CartItemsType READONLY
AS
BEGIN
    SET NOCOUNT ON;

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

        -- Throw an error with the insufficient inventory details
        THROW 51003, @ErrorMessage, 1;
    END
END;
