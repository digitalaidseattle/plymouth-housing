DROP PROCEDURE IF EXISTS [dbo].[GetUnitCodes];
GO

CREATE PROCEDURE GetUnitCodes
    @building_code NVARCHAR(50)
AS 
BEGIN
    --  Get building id given the building code
    DECLARE @building_id INT;
    SELECT @building_id = id FROM Buildings WHERE code = @building_code;

    IF @building_id IS NULL
    BEGIN
        SELECT 'Error' AS Status, 'Invalid building code' AS message;
        RETURN;
    END

    -- Return unit codes that match the building id
    SELECT * FROM Units WHERE building_id = @building_id;
END