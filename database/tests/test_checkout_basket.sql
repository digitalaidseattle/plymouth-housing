-- Simple test file to test transactions. 

print 'Test insufficient inventory'
exec ProcessCheckout @user_id = 1, @building_code = "ALM", @items = N'[
      {
        "id": 3,
        "quantity": 4
      }
    ]'

select * from Transactions
select name, quantity from Items where id = 2


print 'Test more than 10 items in cart'
exec ProcessCheckout @user_id = 1, @building_code = "ALM", @items = N'[
      {
        "id": 407,
        "quantity": 0
      },
      {
        "id": 408,
        "quantity": 19
      }
    ]'

print 'Test Category violation'
exec ProcessCheckout @user_id = 1, @building_code = "ALM", @items = N'[
      {
        "id": 10,
        "quantity": 1
      },
      {
        "id": 11,
        "quantity": 1
      },
      {
        "id": 12,
        "quantity": 1
      }
    ]'

select * from items where category_id = 2

