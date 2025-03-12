print 'Test checkout'
exec ProcessCheckout 
    @user_id = 1, 
    @building_code = "ALM", 
    @items = N'[
      {
        "id": 3,
        "quantity": 4
      },
      {
        "id": 4,
        "quantity": 2
      }
    ]', 
    @additional_notes = 'Test notes', 
    @resident_name = 'John Doe', 
    @unit_number = '101'