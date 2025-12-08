DROP TABLE IF EXISTS [dbo].[Residents];
GO

CREATE TABLE Residents (
    id INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    unit_id INT NOT NULL
);

GO

CREATE VIEW ResidentsWithUnits
AS
    SELECT
        r.id,
        r.name,
        r.unit_id,
        u.unit_number,
        u.building_id,
        b.code AS building_code,
        b.name AS building_name
    FROM
        Residents r
    LEFT JOIN
        Units u ON r.unit_id = u.id
    LEFT JOIN
        Buildings b ON u.building_id = b.id;
GO