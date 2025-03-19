DROP TYPE IF EXISTS [dbo].[CheckCartItemLimit];
GO

DROP TYPE IF EXISTS [dbo].[CartItemsType];
GO

CREATE TYPE CartItemsType AS TABLE (
    ItemId INT,
    Quantity INT,
    AdditionalNotes NVARCHAR(255)
);
GO