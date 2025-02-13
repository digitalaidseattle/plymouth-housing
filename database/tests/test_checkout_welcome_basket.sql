-- Simple test file to test transactions. 

print 'Test welcome basket checkout'

declare @transaction_id NVARCHAR(MAX)
declare @mattress_size_id int

set @mattress_size_id = (select id from items where name = 'Twin-size Sheet Set')

exec ProcessWelcomeBasketCheckout 
    @message = @transaction_id OUTPUT,
    @user_id = 1, 
    @building_code = 'ALM', 
    @quantity = 1, 
    @mattress_size = @mattress_size_id

select * from Transactions where transaction_id = '8a89e687-ded4-497a-b1d9-0e69378eb63b'
