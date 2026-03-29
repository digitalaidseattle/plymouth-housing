DROP TABLE IF EXISTS [dbo].[Residents];
GO

CREATE TABLE Residents
(
    id INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    unit_id INT NOT NULL
);

GO

DROP VIEW IF EXISTS [dbo].[ResidentsByBuilding];  
GO

CREATE VIEW ResidentsByBuilding
AS
    SELECT
        r.id,
        r.name,
        u.id AS unit_id,
        u.unit_number,
        b.id AS building_id,
        b.name AS building_name,
        b.code AS building_code
    FROM
        Residents r
        JOIN Units u ON r.unit_id = u.id
        JOIN Buildings b ON u.building_id = b.id;

GO