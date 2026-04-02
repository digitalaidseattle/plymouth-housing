DELETE FROM TransactionTypes;
GO

SET IDENTITY_INSERT TransactionTypes ON;

INSERT INTO TransactionTypes
    (id, transaction_type)
VALUES
    (1, 'CHECKOUT'),
    (2, 'RESTOCK'),
    -- reset of inventory
    (3, 'CORRECTION'),
    -- checkout that was edited after the fact (e.g. quantity changed, item added/removed)
    (4, 'CHECKOUT_EDIT');

SET IDENTITY_INSERT TransactionTypes OFF;
GO
