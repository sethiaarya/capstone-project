-- ===========================
--      TRAVEL PORTAL SCHEMA
-- ===========================

-- If tables already exist, drop them (prevents duplication on re-run)
DROP TABLE IF EXISTS trips;
DROP TABLE IF EXISTS wishlist;

-- ---------------------------
-- WISHLIST TABLE
-- ---------------------------
CREATE TABLE wishlist (
    id SERIAL PRIMARY KEY,
    destination TEXT NOT NULL,
    added_at TIMESTAMP DEFAULT NOW()
);

-- ---------------------------
-- TRIPS TABLE
-- ---------------------------
CREATE TABLE trips (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    destination TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    budget NUMERIC(10,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
