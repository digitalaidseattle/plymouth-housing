DELETE FROM [Transactions];
GO

DECLARE @new_transaction_id UNIQUEIDENTIFIER = NEWID();

-- Execute the stored procedure with test data
EXEC LogTransaction
    @user_id = 1,
    @transaction_id = @new_transaction_id,
    @item_id = 2,
    @transaction_type = 'add',
    @quantity = 10,
    @building_id = 1;
