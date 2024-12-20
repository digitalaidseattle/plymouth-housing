DELETE FROM [Transactions];
GO

-- Execute the stored procedure with test data
EXEC LogTransaction
    @user_id = 1,
    @transaction_id = NEWID(),
    @item_id = 2,
    @transaction_type = 'add',
    @quantity = 10;