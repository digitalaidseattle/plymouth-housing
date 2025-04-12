DROP PROCEDURE IF EXISTS [dbo].[GetUnitNumbers];
GO

CREATE PROCEDURE GetUnitNumbers
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
    -- use of trim is to account for empty unit numbers for some buildings
    SELECT * FROM Units WHERE building_id = @building_id AND NULLIF(LTRIM(RTRIM(unit_number)), '') IS NOT NULL

END