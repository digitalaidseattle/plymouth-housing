-- should create an entry in Transactions 
-- then an entry for each item in TransactionItems
PRINT 'Checkout test with two items'
EXEC ProcessCheckout 
    @user_id = 1, 
    @building_code = "HUM", 
    --TODO: Add additional notes to each item in the stored procedure
    @items = N'[
      {
        "id": 79,
        "quantity": 1,
        "additional_notes": "waffle maker"
      },
      {
        "id": 46,
        "quantity": 1,
        "additional_notes": ""
      }
    ]', 
    @resident_name = 'nico', 
    @unit_number = '201'