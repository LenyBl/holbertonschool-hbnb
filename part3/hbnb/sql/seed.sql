-- ============================================
-- HBnB Initial Data
-- ============================================

-- ============================================
-- Insert Admin User
-- ============================================
-- Password: admin1234 (hashed with bcrypt)
INSERT INTO users (id, first_name, last_name, email, password, is_admin)
VALUES (
    '36c9050e-ddd3-4c3b-9731-9f487208bbc1',
    'Admin',
    'HBnB',
    'admin@hbnb.io',
    '$2b$12$gXlEffNNRnO321oHU1QUI.x0xKuK6lRWV8PjPQHjGF3aaI1Jk4bbu',
    TRUE
);

-- ============================================
-- Insert Initial Amenities
-- ============================================
INSERT INTO amenities (id, name)
VALUES
    ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'WiFi'),
    ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Swimming Pool'),
    ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'Air Conditioning');
