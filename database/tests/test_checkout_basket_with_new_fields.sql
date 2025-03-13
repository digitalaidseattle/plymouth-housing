-- should create an entry in Transactions 
-- then an entry for each item in TransactionItems
PRINT 'Checkout test with two items'
EXEC ProcessCheckout 
    @user_id = 3, 
    @building_code = "ALM", 
    @items = N'[
      {
        "id": 101,
        "quantity": 1,
        "additional_notes": "has description"
      },
      {
        "id": 102,
        "quantity": 1,
        "additional_notes": ""
      }
    ]', 
    @resident_name = 'Yuki', 
    @unit_number = '205'