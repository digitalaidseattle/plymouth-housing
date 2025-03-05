print 'test get recent transactions';

declare @building_code VARCHAR(7)
declare @building_id INT
declare @unit_number VARCHAR(50)
declare @item_id INT
declare @months INT
declare @transaction_id UNIQUEIDENTIFIER = NEWID()

set @item_id = (select id from items where name = 'Microwave')
set @building_id = (select id from buildings where code = 'ALM')

-- checking out a microwave
-- TODO: modify Checkout or LogTransaction to include unit_number
INSERT INTO Transactions (
    user_id,
    transaction_id,
    item_id,
    transaction_type,
    quantity,
    building_id,
    unit_number
)
VALUES (
    1,
    @transaction_id,
    @item_id,
    'checkout',
    1,
    @building_id,
    '101'
);


-- get the most recent transaction of a microwave
-- for unit 101 in building ALM
exec GetRecentTransactions 
    @building_code = 'ALM',
    @unit_number = '101',
    @item_id = @item_id,
    @months = 1;

