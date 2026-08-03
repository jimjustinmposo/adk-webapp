-- Alpha Delta Kennel database schema
-- Run this once against your Railway Postgres database.

CREATE TABLE IF NOT EXISTS logintb (
    id            SERIAL PRIMARY KEY,
    fullname      VARCHAR(150) NOT NULL,
    nickname      VARCHAR(100) NOT NULL,
    designation   VARCHAR(100),
    username      VARCHAR(100) UNIQUE NOT NULL,
    password      TEXT NOT NULL,          -- bcrypt hash, never plain text
    adminrights   BOOLEAN NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dogtb (
    dogid         SERIAL PRIMARY KEY,
    breed         VARCHAR(100),
    dogname       VARCHAR(100),
    nickname      VARCHAR(100),
    gender        VARCHAR(10),
    dob           DATE,
    microchip     VARCHAR(50),
    father        VARCHAR(100),
    mother        VARCHAR(100),
    comment       TEXT,
    status        VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active' or 'deceased'
    created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Note: I added a `status` column to dogtb (active/deceased) since the
-- dashboard needs it for the "Active Dogs" / "Deceased Dogs" cards and it
-- wasn't in your original table screenshot.
