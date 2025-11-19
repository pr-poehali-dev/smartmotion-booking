-- Таблица для хранения броней залов SmartMotion
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    room_name VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    time_slot TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(room_name, date, time_slot)
);

-- Индекс для быстрого поиска броней по залу и дате
CREATE INDEX idx_bookings_room_date ON bookings(room_name, date);
