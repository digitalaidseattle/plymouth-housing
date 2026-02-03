DROP PROCEDURE IF EXISTS [dbo].[FindUserTransactionHistory];
GO

CREATE PROCEDURE FindUserTransactionHistory
    @start_date Date,
    @end_date Date,
    @history_type NVARCHAR(10)
AS
BEGIN
    -- Add validation at the start of the procedure:                                                          
    IF @start_date > @end_date                                                                                
    BEGIN                                                                                                     
        RAISERROR('Start date must be before or equal to end date', 16, 1);                                   
        RETURN;                                                                                               
    END                                                                                                       
                                                                                                            
    IF @history_type NOT IN ('checkout', 'inventory')                                                         
    BEGIN                                                                                                     
        RAISERROR('Invalid history type. Must be checkout or inventory', 16, 1);                              
        RETURN;                                                                                               
    END 
    IF @history_type = 'checkout'
    BEGIN
        SELECT 
            Transactions.user_id,
            Transactions.id AS transaction_id,
            Transactions.resident_id,
            Residents.name AS resident_name, 
            Units.unit_number,
            Buildings.id AS building_id,
            Transactions.transaction_date,
            (
                SELECT 
                    ti.item_id,
                    i.name as item_name,
                    c.name as category_name,
                    ti.quantity
                FROM TransactionItems ti
                INNER JOIN Items i ON ti.item_id = i.id
                INNER JOIN Categories c ON i.category_id = c.id
                WHERE transaction_id = Transactions.id
                FOR JSON PATH
            ) AS items
        FROM Transactions
        INNER JOIN Residents ON Transactions.resident_id = Residents.id
        INNER JOIN Units ON Residents.unit_id = Units.id
        INNER JOIN Buildings ON Units.building_id = Buildings.id
        WHERE CONVERT(date, [transaction_date]) >= @start_date 
            AND CONVERT(date, [transaction_date]) <= @end_date
            AND [transaction_type] = 1  -- CHECKOUT
        ORDER BY Transactions.transaction_date DESC;
    END;

    IF @history_type = 'inventory'
    BEGIN
        SELECT 
            Transactions.user_id,
            Transactions.id AS transaction_id,
            Transactions.transaction_type,
            Transactions.transaction_date,
            (
                SELECT 
                    ti.item_id,
                    i.name as item_name,
                    c.name as category_name,
                    ti.quantity
                FROM TransactionItems ti
                INNER JOIN Items i ON ti.item_id = i.id
                INNER JOIN Categories c ON i.category_id = c.id
                WHERE transaction_id = Transactions.id
                FOR JSON PATH
            ) AS items
        FROM Transactions
        WHERE CONVERT(date, [transaction_date]) >= @start_date 
            AND CONVERT(date, [transaction_date]) <= @end_date
            AND [transaction_type] IN (2, 3) -- RESTOCK and CORRECTION respectively
        ORDER BY Transactions.transaction_date DESC;
    END;
END;