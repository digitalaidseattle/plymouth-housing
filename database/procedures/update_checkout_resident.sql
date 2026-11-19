DROP PROCEDURE IF EXISTS [dbo].[UpdateCheckoutResident];
GO

CREATE PROCEDURE [dbo].[UpdateCheckoutResident]
    @transaction_id UNIQUEIDENTIFIER,
    @resident_id INT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Verify the original checkout exists.
        IF NOT EXISTS (
            SELECT 1
            FROM dbo.Transactions
            WHERE id = @transaction_id
              AND parent_transaction_id IS NULL
        )
        BEGIN
            THROW 51003, 'Original checkout transaction not found.', 1;
        END;

        -- Update the original checkout and all its direct corrections.
        UPDATE dbo.Transactions
        SET resident_id = @resident_id
        WHERE id = @transaction_id
           OR parent_transaction_id = @transaction_id;

        COMMIT TRANSACTION;

        SELECT 'Success' AS Status;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        THROW;
    END CATCH;
END;
GO