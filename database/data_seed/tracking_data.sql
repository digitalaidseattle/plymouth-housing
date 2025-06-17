DELETE FROM Tracking;
GO

-- add all appliances + rug to Tracking table
INSERT INTO Tracking (item_id)
SELECT id FROM Items
WHERE category_id = 2 
OR name = 'Rug'; 

-- set notes_required to true for just appliance miscellaneous
UPDATE Tracking
SET notes_required = 1
WHERE item_id = '166';

GO