DROP TABLE IF EXISTS [dbo].[Tracking];
GO

CREATE TABLE Tracking (
    id INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    item_id INT NOT NULL,
    notes_required BIT NOT NULL DEFAULT 0
);

GO