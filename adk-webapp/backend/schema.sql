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
    photo         TEXT,
    created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Kept separately so a dog's usual record stays independent of a sale or adoption.
CREATE TABLE IF NOT EXISTS dog_status_details (
    dogid               INTEGER PRIMARY KEY REFERENCES dogtb(dogid) ON DELETE CASCADE,
    disposition_type    VARCHAR(20) NOT NULL CHECK (disposition_type IN ('sold', 'adopted')),
    disposition_date    DATE NOT NULL,
    contact_name        VARCHAR(150) NOT NULL,
    contact_address     TEXT NOT NULL,
    contact_details     TEXT NOT NULL,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Supports databases created with an earlier version of this schema.
ALTER TABLE dogtb ADD COLUMN IF NOT EXISTS photo TEXT;
