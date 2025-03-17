-- This is a dedicate file to create the constraints
-- It is to handle circular dependencies between tables during creation
-- Add foreign key constraints
ALTER TABLE dbo.TransactionItems
ADD CONSTRAINT FK_TransactionItems_ItemId
FOREIGN KEY (item_id) REFERENCES dbo.Items(id);

ALTER TABLE dbo.TransactionItems
ADD CONSTRAINT FK_TransactionItems_TransactionId
FOREIGN KEY (transaction_id) REFERENCES dbo.Transactions(id);

ALTER TABLE dbo.Tracking
ADD CONSTRAINT FK_Tracking_ItemId
FOREIGN KEY (item_id) REFERENCES dbo.Items(id);