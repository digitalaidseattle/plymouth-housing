-- Delete all rows from the Volunteers table
DELETE FROM Volunteers;
GO

-- Insert dummy data into the Volunteers table with PIN as a suffix to the name
INSERT INTO Volunteers (name, email, PIN, last_signed_in, active) VALUES
('John Doe 1234', 'john.doe@example.com', '1234', '2023-10-01 10:00:00', 1),
('Jane Smith 5678', 'jane.smith@example.com', '5678', '2023-10-02 11:00:00', 1),
('Alice Johnson 9101', 'alice.johnson@example.com', '9101', '2023-10-03 12:00:00', 1),
('Bob Brown 1121', 'bob.brown@example.com', '1121', '2023-10-04 13:00:00', 1),
('Charlie Davis 3141', 'charlie.davis@example.com', '3141', '2023-10-05 14:00:00', 1),
('Diana Evans 5161', 'diana.evans@example.com', '5161', '2023-10-06 15:00:00', 1),
('Ethan Harris 7181', 'ethan.harris@example.com', '7181', '2023-10-07 16:00:00', 1),
('Fiona Green 9202', 'fiona.green@example.com', '9202', '2023-10-08 17:00:00', 1),
('George Hill 1222', 'george.hill@example.com', '1222', '2023-10-09 18:00:00', 1),
('Hannah King 3242', 'hannah.king@example.com', '3242', '2023-10-10 19:00:00', 1);
GO