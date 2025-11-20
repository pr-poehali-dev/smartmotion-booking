ALTER TABLE t_p27962896_smartmotion_booking.bookings 
ADD COLUMN first_name VARCHAR(50) NOT NULL DEFAULT '',
ADD COLUMN last_name VARCHAR(50) NOT NULL DEFAULT '';

COMMENT ON COLUMN t_p27962896_smartmotion_booking.bookings.first_name IS 'First name of person who made the booking';
COMMENT ON COLUMN t_p27962896_smartmotion_booking.bookings.last_name IS 'Last name of person who made the booking';