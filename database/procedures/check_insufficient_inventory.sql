DROP PROCEDURE IF EXISTS [dbo].[CheckInsufficientInventory];
GO

CREATE PROCEDURE CheckInsufficientInventory
    @CartItems CartItemsType READONLY
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ErrorDetails NVARCHAR(MAX);

    SELECT @ErrorDetails = STRING_AGG(
        CONCAT(
            'Item: ', i.name,
            ', Requested: ', ci.Quantity,
            ', Available: ', i.quantity
        ), '; '
    )
    FROM @CartItems ci
    JOIN Items i ON i.id = ci.ItemId
    WHERE i.quantity < ci.Quantity;

    IF @ErrorDetails IS NOT NULL
    BEGIN
        DECLARE @ErrorMessage NVARCHAR(MAX) = CONCAT('Insufficient inventory for the following items: ', @ErrorDetails);
        THROW 51003, @ErrorMessage, 1;
    END
END;
GO
