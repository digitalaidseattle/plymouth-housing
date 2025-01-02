-- Simple test file to test transactions. 

print 'Test welcome basket checkout'

select id from items where name = 'Twin-size Sheet Set'
exec ProcessWelcomeBasketCheckout @user_id = 1, @quantity = 1, @mattress_size = 3242

select * from Transactions where transaction_id='4a10ea1f-c79f-4b75-a86e-af1d2444a4e3'
select * from Items where type='Welcome Basket'
