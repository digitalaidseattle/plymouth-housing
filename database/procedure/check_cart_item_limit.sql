DROP PROCEDURE IF EXISTS [dbo].[CheckCartItemLimit];
GO

CREATE PROCEDURE CheckCartItemLimit
    @CartItems CartItemsType READONLY
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @TotalItems INT;

    SELECT @TotalItems = SUM(Quantity) FROM @CartItems;
    print 'Total Items: ' + CAST(@TotalItems AS NVARCHAR(10));

    IF @TotalItems > 10
    BEGIN
        THROW 51004, 'The cart exceeds the maximum limit of 10 items.', 1;
    END
END;
