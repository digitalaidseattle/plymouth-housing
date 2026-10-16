DROP PROCEDURE IF EXISTS [dbo].[LogTransaction];
GO


CREATE PROCEDURE LogTransaction
    @user_id INT,
    @transaction_type NVARCHAR(50),
    @resident_id INT,
    @new_transaction_id UNIQUEIDENTIFIER,
    @parent_transaction_id UNIQUEIDENTIFIER = NULL
AS
BEGIN
    DECLARE @unit_id INT;
    DECLARE @building_id INT;
    IF @resident_id IS NOT NULL
    BEGIN
        SELECT
            @unit_id = R.unit_id,
            @building_id = U.building_id
        FROM dbo.Residents R
        LEFT JOIN dbo.Units U ON R.unit_id = U.id
        WHERE R.id = @resident_id;
    END;
    INSERT INTO Transactions (
        id,
        user_id,
        transaction_type,
        resident_id,
        unit_id,
        building_id,
        parent_transaction_id
    )
    VALUES (
        @new_transaction_id,
        @user_id,
        @transaction_type,
        @resident_id,
        @unit_id,
        @building_id,
        @parent_transaction_id
    );
END;