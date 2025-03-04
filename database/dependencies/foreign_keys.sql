-- This is a dedicate file to create the constraints
-- It is to handle circular dependencies between tables during creation
ALTER TABLE Transactions
ADD CONSTRAINT FK_Transactions_Items
FOREIGN KEY (item_id) REFERENCES Items(id);

-- Add boolean value to Items to determine if it requires tracking
ALTER TABLE Items
ADD requires_tracking BIT NOT NULL DEFAULT 0;

-- Add unit number, resident name, and additional notes to Transactions
ALTER TABLE Transactions
ADD unit_number VARCHAR(10),
resident_name VARCHAR(50),
additional_notes TEXT;