DELETE FROM [Categories];
GO

-- Items table has a hard depencency on the ID column. 
-- For that reason we explicitly set the IDENTITY_INSERT to ON
SET IDENTITY_INSERT Categories ON;

INSERT INTO Categories (id, Name, Checkout_Limit) VALUES
(1, 'Bathroom', 4),
(2, 'Bedding', 2),
(3, 'Cleaning', 4),
(4, 'Clothing', 2),
(5, 'Food', 3),
(6, 'Home goods', 2),
(7, 'Miscellaneous', 2),
(8, 'Personal care', 5),
(9, 'Harm reduction', 4),
(10, 'Kitchen', 4),
(11, 'Welcome Basket', 1);

SET IDENTITY_INSERT Categories OFF;
GO