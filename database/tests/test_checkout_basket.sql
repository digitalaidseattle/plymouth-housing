-- Simple test file to test transactions. 

print 'Test insufficient inventory'
exec ProcessCheckout @user_id = 1, @items = N'[
      {
        "id": 2,
        "quantity": 1
      }
    ]'

select * from Transactions
select name, quantity from Items where id = 2


print 'Test more than 10 items in cart'
exec ProcessCheckout @user_id = 1, @items = N'[
      {
        "id": 407,
        "quantity": 0
      },
      {
        "id": 408,
        "quantity": 19
      }
    ]'

