DROP PROCEDURE IF EXISTS CheckCategoryCheckoutLimit;
GO

CREATE PROCEDURE CheckCategoryCheckoutLimit
    @CartItems CartItemsType READONLY
AS
BEGIN
    SET NOCOUNT ON;

    -- Check if any item in the cart exceeds the checkout limit for its category
    DECLARE @ErrorDetails NVARCHAR(MAX);

    SELECT @ErrorDetails = STRING_AGG(
        CONCAT(
            'Category: ', c.name,
            ', Item ID: ', ci.ItemId,
            ', Requested: ', ci.Quantity,
            ', Checkout Limit: ', c.checkout_limit
        ), '; '
    )
    FROM @CartItems ci
    JOIN Items i ON ci.ItemId = i.id
    JOIN Categories c ON i.category_id = c.id
    WHERE ci.Quantity > c.checkout_limit;

    IF @ErrorDetails IS NOT NULL
    BEGIN
        -- Throw an error with detailed information
        DECLARE @ErrorMessage NVARCHAR(MAX) = CONCAT('Checkout limit exceeded for the following items: ', @ErrorDetails);
        THROW 51002, @ErrorMessage, 1;
    END
END;
GO
