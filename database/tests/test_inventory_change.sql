-- Simple test file to test inventory change. 
print 'Current inventory'
select *
from Transactions
select *
from TransactionItems
select name, quantity
from Items
where id = 2


print 'Test add inventory'
DECLARE @new_transaction_id UNIQUEIDENTIFIER;
exec ProcessInventoryChange @user_id = 1, @item = N'[
      {
        "id": 2,
        "quantity": 3
      }
    ]', @new_transaction_id = @new_transaction_id

select *
from Transactions
select *
from TransactionItems
select name, quantity
from Items
where id = 2

print 'Test reduce inventory'
exec ProcessInventoryChange @user_id = 1, @item = N'[
      {
        "id": 2,
        "quantity": -3
      }
    ]', @new_transaction_id = @new_transaction_id

select *
from Transactions
select *
from TransactionItems
select name, quantity
from Items
where id = 2


print 'Test adjust inventory'
exec ProcessInventoryResetQuantity @user_id = 1, @item_id = 111, @new_quantity = 12, @additional_notes = N'[
    {\"comments\":\"\",\"howYouKnow\":\"estimated\"}    
  ]'

select name, quantity
from Items
where id = 111
