-- SELECT * FROM Transactions;
-- SELECT * FROM TransactionItems;
-- SELECT * FROM Buildings;

-- SELECT * FROM Items;
-- SELECT id FROM Items WHERE category_id = 2;

-- SELECT * FROM Tracking;

EXEC CheckPastCheckout
    @resident_id = 1;