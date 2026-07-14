DROP VIEW IF EXISTS [dbo].[ResidentsByBuilding];  
GO

CREATE VIEW [dbo].[ResidentsByBuilding]
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