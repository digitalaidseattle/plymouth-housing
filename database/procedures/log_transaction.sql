DROP PROCEDURE IF EXISTS [dbo].[LogTransaction];
GO


CREATE PROCEDURE LogTransaction
    @user_id INT,
    @transaction_type NVARCHAR(50),
    @resident_id INT,
    @new_transaction_id UNIQUEIDENTIFIER OUTPUT
AS
BEGIN
    DECLARE @id UNIQUEIDENTIFIER = NEWID();
    INSERT INTO Transactions (
        id,
        user_id,
        transaction_type,
        resident_id
    )
    VALUES (
        @id,
        @user_id,
        @transaction_type,
        @resident_id
    );

    SET @new_transaction_id = @id;
END;