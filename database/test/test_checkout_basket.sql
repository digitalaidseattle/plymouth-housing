-- Simple test file to test transactions. 

exec ProcessCheckout @user_id = 1, @items = N'[
      {
        "id": 2,
        "quantity": 1
      }
    ]'

select * from Transaction
select name, quantity from Items where id = 2