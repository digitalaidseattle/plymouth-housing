SELECT * FROM Residents;
-- SELECT * FROM Transactions;
-- SELECT * FROM TransactionItems;

-- Get only Lily Water's items.
-- SELECT * FROM TransactionItems WHERE transaction_id IN 
--     (SELECT id FROM Transactions WHERE resident_id = 1)
--     AND item_id = 159;

EXEC CheckPastCheckout
    @ResidentId = 1,
    @ItemId = 166