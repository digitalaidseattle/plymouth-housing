DELETE FROM TransactionTypes;
GO

SET IDENTITY_INSERT TransactionTypes ON;

INSERT INTO TransactionTypes
    (id, transaction_type)
VALUES
    (1, 'CHECKOUT'),
    (2, 'RESTOCK'),
    (3, 'CORRECTION'),
    -- reset of inventory
    (4, 'CHECKOUT_EDIT');
-- checkout that was edited after the fact (e.g. quantity changed, item added/removed)

SET IDENTITY_INSERT TransactionTypes OFF;
GO
