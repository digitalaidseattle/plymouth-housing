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
    INSERT INTO Transactions (
        id,
        user_id,
        transaction_type,
        resident_id,
        parent_transaction_id
    )
    VALUES (
        @new_transaction_id,
        @user_id,
        @transaction_type,
        @resident_id,
        @parent_transaction_id
    );
END;