DELETE FROM [Transactions];
GO

-- Execute the stored procedure with test data
EXEC LogTransaction
    @user_id = 1,
    @transaction_type = 1,
    @building_id = 1,
    @unit_number = '101',
    @resident_name = 'John Doe';
