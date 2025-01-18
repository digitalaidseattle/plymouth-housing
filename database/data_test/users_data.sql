-- Delete all rows from the Users table
DELETE FROM [dbo].[Users];
GO

-- Insert dummy data into the Users table with PIN as a suffix to the name
INSERT INTO [dbo].[Users] (name, email, PIN, last_signed_in, created_at, active, role) VALUES
('John Doe 1234', 'john.doe@example.com', '1234', '2023-10-01 10:00:00', '2023-09-01 10:00:00', 1, 'volunteer'),
('Jane Smith 5678', 'jane.smith@example.com', '5678', '2023-10-02 11:00:00', '2023-09-02 11:00:00', 1, 'volunteer'),
('Alice Johnson 9101', 'alice.johnson@example.com', '9101', '2023-10-03 12:00:00', '2023-09-03 12:00:00', 1, 'volunteer'),
('Bob Brown 1121', 'bob.brown@example.com', '1121', '2023-10-04 13:00:00', '2023-09-04 13:00:00', 1, 'volunteer'),
('Charlie Davis 3141', 'charlie.davis@example.com', '3141', '2023-10-05 14:00:00', '2023-09-05 14:00:00', 0, 'volunteer'),
('Diana Evans 5161', 'diana.evans@example.com', '5161', '2023-10-06 15:00:00', '2023-09-06 15:00:00', 1, 'volunteer'),
('Ethan Harris 7181', 'ethan.harris@example.com', '7181', '2023-10-07 16:00:00', '2023-09-07 16:00:00', 1, 'volunteer'),
('Fiona Green 9202', 'fiona.green@example.com', '9202', '2023-10-08 17:00:00', '2023-09-08 17:00:00', 0, 'volunteer'),
('George Hill 1222', 'george.hill@example.com', '1222', '2023-10-09 18:00:00', '2023-09-09 18:00:00', 1, 'volunteer'),
('Hannah King 3242', 'hannah.king@example.com', '3242', '2023-10-10 19:00:00', '2023-09-10 19:00:00', 1, 'volunteer'),
('Isabella Lee 1235', 'isabella.lee@example.com', '1235', '2023-10-11 10:00:00', '2023-09-11 10:00:00', 1, 'volunteer'),
('Jack Wilson 5679', 'jack.wilson@example.com', '5679', '2023-10-12 11:00:00', '2023-09-12 11:00:00', 0, 'volunteer'),
('Karen Martinez 9102', 'karen.martinez@example.com', '9102', '2023-10-13 12:00:00', '2023-09-13 12:00:00', 1, 'volunteer'),
('Liam Anderson 1122', 'liam.anderson@example.com', '1122', '2023-10-14 13:00:00', '2023-09-14 13:00:00', 1, 'volunteer'),
('Mia Thomas 3142', 'mia.thomas@example.com', '3142', '2023-10-15 14:00:00', '2023-09-15 14:00:00', 0, 'volunteer'),
('Noah Jackson 5162', 'noah.jackson@example.com', '5162', '2023-10-16 15:00:00', '2023-09-16 15:00:00', 1, 'volunteer'),
('Olivia White 7182', 'olivia.white@example.com', '7182', '2023-10-17 16:00:00', '2023-09-17 16:00:00', 1, 'volunteer'),
('Paul Harris 9203', 'paul.harris@example.com', '9203', '2023-10-18 17:00:00', '2023-09-18 17:00:00', 0, 'volunteer'),
('Quinn Clark 1223', 'quinn.clark@example.com', '1223', '2023-10-19 18:00:00', '2023-09-19 18:00:00', 1, 'volunteer'),
('Rachel Lewis 3243', 'rachel.lewis@example.com', '3243', '2023-10-20 19:00:00', '2023-09-20 19:00:00', 1, 'volunteer');
GO