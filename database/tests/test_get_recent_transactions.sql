print 'test get recent transactions';

declare @building_code VARCHAR(7)
declare @building_id INT
declare @unit_number VARCHAR(50)
declare @item_id INT
declare @months INT
declare @quantity INT
declare @transaction_id UNIQUEIDENTIFIER

set @item_id = (select id from items where name = 'Microwave')
set @building_id = (select id from buildings where code = 'ALM')
set @quantity = 1

-- checking out a microwave
INSERT INTO Transactions (
    user_id,
    transaction_type,
    building_id,
    unit_number
)
VALUES (
    1,
    'checkout',
    @building_id,
    '101'
);

-- get id from the transaction
SELECT TOP 1 @transaction_id = id
FROM [dbo].[Transactions]
ORDER BY id DESC;

INSERT INTO TransactionItems (
    transaction_id,
    item_id,
    quantity
)
VALUES (
    @transaction_id,
    @item_id,
    @quantity
)


-- get the most recent transaction of a microwave
-- for unit 101 in building ALM
exec GetRecentTransactions 
    @building_code = 'ALM',
    @unit_number = '101',
    @item_id = @item_id,
    @months = 1;

