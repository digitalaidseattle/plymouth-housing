DROP TABLE IF EXISTS [dbo].[Residents];
GO

CREATE TABLE Residents (
    id INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    -- building_id INT NOT NULL,
    -- unit_number NVARCHAR(10),
    unit_id INT NOT NULL,
);

GO