DROP PROCEDURE IF EXISTS [dbo].[LogTransaction];
GO


CREATE PROCEDURE LogTransaction
    @user_id INT,
    @transaction_type VARCHAR(50),
    @building_id INT,
    @unit_number VARCHAR(10),
    @resident_name VARCHAR(50),
    @new_transaction_id UNIQUEIDENTIFIER OUTPUT
AS
BEGIN
    DECLARE @id UNIQUEIDENTIFIER = NEWID();
    INSERT INTO Transactions (
        id,
        user_id,
        transaction_type,
        building_id,
        unit_number,
        resident_name
    )
    VALUES (
        @id,
        @user_id,
        @transaction_type,
        @building_id,
        @unit_number,
        @resident_name
    );

    SET @new_transaction_id = @id;
END;