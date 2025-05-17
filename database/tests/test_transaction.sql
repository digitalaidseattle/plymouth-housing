DELETE FROM [Transactions];
GO

-- Execute the stored procedure with test data
DECLARE @new_transaction_id UNIQUEIDENTIFIER;

EXEC LogTransaction
    @user_id = 1,
    @transaction_type = 1,
    @resident_id = 1,
    @new_transaction_id = @new_transaction_id OUTPUT;