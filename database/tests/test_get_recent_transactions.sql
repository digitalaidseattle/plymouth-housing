print 'test get recent transactions';

declare @building_code VARCHAR(7)
declare @unit_number VARCHAR(50)
declare @item_id INT
declare @months INT

-- set @item_id = (select id from items where name = 'Microwave')

exec GetRecentTransactions 
    @building_code = 'HUM',
    @unit_number = '201',
    @item_id = 79,
    @months = 1;

