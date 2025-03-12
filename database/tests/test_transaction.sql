DELETE FROM [Transactions];
GO

DECLARE @new_transaction_id UNIQUEIDENTIFIER = NEWID();

-- Execute the stored procedure with test data
EXEC LogTransaction
    @user_id = 1,
    @transaction_type = 'add',
    @building_id = 1,
    @unit_number = '101',
    @resident_name = 'John Doe';
