DROP PROCEDURE IF EXISTS CheckCategoryCheckoutLimit;
GO

CREATE PROCEDURE CheckCategoryCheckoutLimit
    @CartItems CartItemsType READONLY
AS
BEGIN
    SET NOCOUNT ON;

    -- Check if the sum of items in the same category exceeds the checkout limit
    DECLARE @ErrorDetails NVARCHAR(MAX);

    WITH CategoryTotals AS (
        SELECT 
            c.name AS CategoryName,
            SUM(ci.Quantity) AS TotalRequested,
            c.checkout_limit AS CheckoutLimit
        FROM @CartItems ci
        JOIN Items i ON ci.ItemId = i.id
        JOIN Categories c ON i.category_id = c.id
        GROUP BY c.name, c.checkout_limit
    )
    SELECT @ErrorDetails = STRING_AGG(
        CONCAT(
            'Category: ', CategoryName,
            ', Total Requested: ', TotalRequested,
            ', Checkout Limit: ', CheckoutLimit
        ), '; '
    )
    FROM CategoryTotals
    WHERE TotalRequested > CheckoutLimit;

    IF @ErrorDetails IS NOT NULL
    BEGIN
        -- Throw an error with detailed information
        DECLARE @ErrorMessage NVARCHAR(MAX) = CONCAT('Checkout limit exceeded for the following categories: ', @ErrorDetails);
        THROW 51002, @ErrorMessage, 1;
    END
END;
GO
