-- This is a dedicate file to create the constraints
-- It is to handle circular dependencies between tables during creation
ALTER TABLE TransactionItems
ADD CONSTRAINT FK_TransactionItems_ItemId
FOREIGN KEY (item_id) REFERENCES Items(id);

ALTER TABLE TransactionItems
ADD CONSTRAINT FK_TransactionItems_TransactionId
FOREIGN KEY (transaction_id) REFERENCES Transactions(id);
