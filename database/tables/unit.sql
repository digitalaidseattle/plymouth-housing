DROP TABLE IF EXISTS [dbo].[Units];
GO

CREATE TABLE Units(
    id INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    building_id INT,
    unit_number VARCHAR(50) NOT NULL
);

GO