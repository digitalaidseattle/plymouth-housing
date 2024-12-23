-- Simple test file to test transactions. 

exec ProcessCheckout @user_id = 1, @items = N'[
      {
        "id": 1,
        "quantity": 1
      }
    ]'

select * from Transactions
select name, quantity from Items where id = 1