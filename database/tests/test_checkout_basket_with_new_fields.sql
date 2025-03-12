-- should create an entry in Transactions 
-- then an entry for each item in TransactionItems
PRINT 'Checkout test with two items'
EXEC ProcessCheckout 
    @user_id = 1, 
    @building_code = "HUM", 
    @items = N'[
      {
        "id": 79,
        "quantity": 1
      },
      {
        "id": 46,
        "quantity": 1
      }
    ]', 
    @additional_notes = 'nicos stuff', 
    @resident_name = 'nico', 
    @unit_number = '201'