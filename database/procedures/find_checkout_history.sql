DROP PROCEDURE IF EXISTS [dbo].[FindCheckoutHistory];
GO

CREATE PROCEDURE FindCheckoutHistory
    @checkout_date Date
AS
BEGIN
    SELECT 
        Transactions.id, 
        user_id,  
        Users.name AS user_name,
        TransactionItems.item_id, 
        TransactionItems.quantity,
        Residents.name AS resident_name, 
        Units.unit_number,
        Buildings.id AS building_id
    FROM Transactions
    INNER JOIN TransactionItems ON Transactions.id = TransactionItems.transaction_id
    INNER JOIN Residents ON Transactions.resident_id = Residents.id
    INNER JOIN Units ON Residents.unit_id = Units.id
    INNER JOIN Buildings ON Units.building_id = Buildings.id
    INNER JOIN Users ON Transactions.user_id = Users.id
    WHERE CONVERT(date, [transaction_date]) = @checkout_date
    AND [transaction_type] = 1;
END;