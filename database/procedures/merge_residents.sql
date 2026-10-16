
DROP PROCEDURE IF EXISTS [dbo].[MergeResidents];
GO

CREATE PROCEDURE [dbo].[MergeResidents]
    @source_resident_id INT,
    @target_resident_id INT,
    @target_name NVARCHAR(255),
    @target_unit_id INT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- The source and target must be different residents.
        IF @source_resident_id = @target_resident_id
        BEGIN
            THROW 51003, 'Source and target residents must be different.', 1;
        END;

        -- The requested name must not be empty.
        IF NULLIF(LTRIM(RTRIM(@target_name)), '') IS NULL
        BEGIN
            THROW 51006, 'Target resident name cannot be empty.', 1;
        END;

        -- Verify that the source resident exists.
        IF NOT EXISTS (
            SELECT 1
            FROM dbo.Residents
            WHERE id = @source_resident_id
        )
        BEGIN
            THROW 51004, 'Source resident does not exist.', 1;
        END;

        -- Verify that the target resident exists.
        IF NOT EXISTS (
            SELECT 1
            FROM dbo.Residents
            WHERE id = @target_resident_id
        )
        BEGIN
            THROW 51005, 'Target resident does not exist.', 1;
        END;

        -- Verify that the selected target matches the requested name.
        IF NOT EXISTS (
            SELECT 1
            FROM dbo.Residents
            WHERE id = @target_resident_id
              AND LTRIM(RTRIM(name)) = LTRIM(RTRIM(@target_name))
        )
        BEGIN
            THROW 51008, 'Target resident does not match the requested name.', 1;
        END;

        -- Verify that the requested unit exists.
        IF NOT EXISTS (
            SELECT 1
            FROM dbo.Units
            WHERE id = @target_unit_id
        )
        BEGIN
            THROW 51007, 'Target unit does not exist.', 1;
        END;

        -- Reassign transactions without changing their historical
        -- unit_id or building_id snapshots.
        UPDATE dbo.Transactions
        SET resident_id = @target_resident_id
        WHERE resident_id = @source_resident_id;

        -- Update the surviving resident's current profile.
        UPDATE dbo.Residents
        SET
            name = @target_name,
            unit_id = @target_unit_id
        WHERE id = @target_resident_id;

        -- Remove the duplicate source resident.
        DELETE FROM dbo.Residents
        WHERE id = @source_resident_id;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF XACT_STATE() <> 0
            ROLLBACK TRANSACTION;

        THROW;
    END CATCH;
END;
GO