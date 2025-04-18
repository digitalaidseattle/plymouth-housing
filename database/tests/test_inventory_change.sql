-- Simple test file to test inventory change. 
print 'Current inventory'
select * from Transactions
select * from TransactionItems
select name, quantity from Items where id = 2


print 'Test add inventory'
exec ProcessInventoryChange @user_id = 1, @item = N'[
      {
        "id": 2,
        "quantity": 3
      }
    ]'

select * from Transactions
select * from TransactionItems
select name, quantity from Items where id = 2

print 'Test reduce inventory'
exec ProcessInventoryChange @user_id = 1, @item = N'[
      {
        "id": 2,
        "quantity": -3
      }
    ]'

select * from Transactions
select * from TransactionItems
select name, quantity from Items where id = 2
