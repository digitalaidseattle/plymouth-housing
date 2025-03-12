-- should create an entry in Transactions 
-- then an entry for each item in TransactionItems
PRINT 'Checkout test with two items'
EXEC ProcessCheckout 
    @user_id = 1, 
    @building_code = "ALM", 
    @items = N'[
      {
        "id": 13,
        "quantity": 1
      },
      {
        "id": 14,
        "quantity": 2
      },
      {
        "id": 100,
        "quantity": 1
      }
    ]', 
    @additional_notes = 'martins stuff', 
    @resident_name = 'martin', 
    @unit_number = '301'