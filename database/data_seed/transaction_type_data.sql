DELETE FROM TransactionTypes;
GO

SET IDENTITY_INSERT TransactionTypes ON;

INSERT INTO TransactionTypes (id, transaction_type) VALUES
(1, 'CHECKOUT'),
(2, 'RESTOCK'),
(3, 'CORRECTION'); -- Corrected spelling

SET IDENTITY_INSERT TransactionTypes OFF;
GO
