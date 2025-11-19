-- Migration script to add new columns for circulation management
-- Run this script on your PostgreSQL database

-- Add columns to loans table
ALTER TABLE loans 
ADD COLUMN IF NOT EXISTS "renewalCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "fineAmount" DECIMAL(10, 2) DEFAULT 0.00;

-- Add columns to members table
ALTER TABLE members 
ADD COLUMN IF NOT EXISTS "fineBalance" DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS "maxBooksLimit" INTEGER NOT NULL DEFAULT 5;

-- Update books table status enum to include new statuses
-- Note: PostgreSQL doesn't support ALTER ENUM easily, so we need to recreate it
-- First, let's check if the enum values exist and add them if needed
DO $$ 
BEGIN
    -- Check if 'Reserved' exists in the enum
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'Reserved' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_books_status')
    ) THEN
        ALTER TYPE enum_books_status ADD VALUE 'Reserved';
    END IF;
    
    -- Check if 'Damaged' exists in the enum
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'Damaged' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_books_status')
    ) THEN
        ALTER TYPE enum_books_status ADD VALUE 'Damaged';
    END IF;
END $$;

-- Create reservations table
CREATE TABLE IF NOT EXISTS reservations (
    id SERIAL PRIMARY KEY,
    "memberId" INTEGER NOT NULL,
    "bookId" INTEGER NOT NULL,
    "reservationDate" DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending',
    "notificationSent" BOOLEAN NOT NULL DEFAULT false,
    "expiryDate" DATE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (status IN ('Pending', 'Available', 'Cancelled', 'Fulfilled'))
);

-- Create fines table
CREATE TABLE IF NOT EXISTS fines (
    id SERIAL PRIMARY KEY,
    "memberId" INTEGER NOT NULL,
    "loanId" INTEGER,
    amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    reason VARCHAR(255) DEFAULT 'Overdue',
    status VARCHAR(20) NOT NULL DEFAULT 'Pending',
    "paidDate" DATE,
    "daysOverdue" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (status IN ('Pending', 'Paid', 'Waived'))
);

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    category VARCHAR(255) NOT NULL UNIQUE,
    data JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reservations_memberId ON reservations("memberId");
CREATE INDEX IF NOT EXISTS idx_reservations_bookId ON reservations("bookId");
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_fines_memberId ON fines("memberId");
CREATE INDEX IF NOT EXISTS idx_fines_loanId ON fines("loanId");
CREATE INDEX IF NOT EXISTS idx_fines_status ON fines(status);

