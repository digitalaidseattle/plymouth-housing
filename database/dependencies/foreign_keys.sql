-- This is a dedicated file to create the constraints
-- It is to handle circular dependencies between tables during creation
-- Add foreign key constraints

-- TransactionItems -> Items
ALTER TABLE dbo.TransactionItems
ADD CONSTRAINT FK_TransactionItems_ItemId
FOREIGN KEY (item_id) REFERENCES dbo.Items(id);

-- TransactionItems -> Transactions
ALTER TABLE dbo.TransactionItems
ADD CONSTRAINT FK_TransactionItems_TransactionId
FOREIGN KEY (transaction_id) REFERENCES dbo.Transactions(id);

-- Tracking -> Items
ALTER TABLE dbo.Tracking
ADD CONSTRAINT FK_Tracking_ItemId
FOREIGN KEY (item_id) REFERENCES dbo.Items(id);

-- Items -> Categories
ALTER TABLE dbo.Items
ADD CONSTRAINT FK_Items_CategoryId
FOREIGN KEY (category_id) REFERENCES dbo.Categories(id);

-- Transactions -> Users
ALTER TABLE dbo.Transactions
ADD CONSTRAINT FK_Transactions_UserId
FOREIGN KEY (user_id) REFERENCES dbo.Users(id);

-- Transactions -> Buildings
ALTER TABLE dbo.Transactions
ADD CONSTRAINT FK_Transactions_BuildingId
FOREIGN KEY (building_id) REFERENCES dbo.Buildings(id);

--Transactions -> TransactionTypes
ALTER TABLE dbo.Transactions
ADD CONSTRAINT FK_Transactions_TransactionType
FOREIGN KEY (transaction_type) REFERENCES dbo.TransactionTypes(id);