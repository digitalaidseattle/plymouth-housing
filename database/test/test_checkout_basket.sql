-- DECLARE @basket NVARCHAR(MAX);
-- SET @basket = N'
-- {
--     "user_id": 12,
--     "items": [
--       {
--         "id": 1,
--         "quantity": 1
--       }
--     ]
-- }';

exec ProcessCheckout @user_id = 12, @items = N'[
      {
        "id": 1,
        "quantity": 1
      }
    ]'

--select * from Transactions
--select name, quantity from Items where id = 2
