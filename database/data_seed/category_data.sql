﻿DELETE FROM [Categories];
GO

SET IDENTITY_INSERT Categories ON;

INSERT INTO Categories (id, Name, Checkout_Limit) VALUES
(1, 'Home Goods', 2),
(2, 'Appliance', 1),
(3, 'Kitchen', 4),
(4, 'Miscellaneous', 2),
(5, 'Bathroom', 4),
(6, 'Food', 3),
(7, 'Harm Reduction', 4),
(8, 'Bedding', 3),
(9, 'Décor', 2),
(10, 'Personal Care', 5),
(11, 'Cleaning', 4),
(12, 'Garments', 2),
(13, 'Jacket', 1),
(14, 'Welcome Basket', 1);


SET IDENTITY_INSERT Categories OFF;
GO
