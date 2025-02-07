DROP PROCEDURE IF EXISTS [dbo].[LogTransaction];
GO

CREATE PROCEDURE LogTransaction
    @user_id INT,
    @transaction_id UNIQUEIDENTIFIER,
    @item_id INT,
    @transaction_type VARCHAR(50),
    @quantity INT,
    @building_id INT
AS
BEGIN
    INSERT INTO Transactions (
        user_id,
        transaction_id,
        item_id,
        transaction_type,
        quantity,
        building_id
    )
    VALUES (
        @user_id,
        @transaction_id,
        @item_id,
        @transaction_type,
        @quantity,
        @building_id
    );
END;