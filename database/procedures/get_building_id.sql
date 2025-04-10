DROP PROCEDURE IF EXISTS [dbo].[GetBuildingId];
GO

CREATE PROCEDURE GetBuildingId
    @building_code NVARCHAR(50)
AS 
BEGIN
    DECLARE @building_id INT;
    SELECT @building_id = id FROM Buildings WHERE code = @building_code;

    IF @building_id IS NULL
    BEGIN
        SELECT 'Error' AS Status, 'Invalid building code' AS message;
        RETURN;
    END
END