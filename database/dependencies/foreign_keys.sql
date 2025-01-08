-- This is a dedicate file to create the constraints
-- It is to handle circular dependencies between tables during creation
ALTER TABLE Transactions
ADD CONSTRAINT FK_Transactions_Items
FOREIGN KEY (item_id) REFERENCES Items(id);