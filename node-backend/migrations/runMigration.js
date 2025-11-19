// Migration script to add new columns for circulation management
// Run with: node migrations/runMigration.js

require('dotenv').config();
const { sequelize } = require('../database');

const runMigration = async () => {
  try {
    console.log('Starting migration...');
    
    // Add columns to loans table
    console.log('Adding columns to loans table...');
    await sequelize.query(`
      ALTER TABLE loans 
      ADD COLUMN IF NOT EXISTS "renewalCount" INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "fineAmount" DECIMAL(10, 2) DEFAULT 0.00;
    `);
    console.log('✓ Loans table updated');
    
    // Add columns to members table
    console.log('Adding columns to members table...');
    await sequelize.query(`
      ALTER TABLE members 
      ADD COLUMN IF NOT EXISTS "fineBalance" DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
      ADD COLUMN IF NOT EXISTS "maxBooksLimit" INTEGER NOT NULL DEFAULT 5;
    `);
    console.log('✓ Members table updated');
    
    // Update books status enum
    console.log('Updating books status enum...');
    try {
      await sequelize.query(`
        DO $$ 
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_enum 
                WHERE enumlabel = 'Reserved' 
                AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_books_status')
            ) THEN
                ALTER TYPE enum_books_status ADD VALUE 'Reserved';
            END IF;
            
            IF NOT EXISTS (
                SELECT 1 FROM pg_enum 
                WHERE enumlabel = 'Damaged' 
                AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_books_status')
            ) THEN
                ALTER TYPE enum_books_status ADD VALUE 'Damaged';
            END IF;
        END $$;
      `);
      console.log('✓ Books status enum updated');
    } catch (error) {
      console.log('⚠ Could not update enum (may already exist):', error.message);
    }
    
    // Create reservations table
    console.log('Creating reservations table...');
    await sequelize.query(`
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
    `);
    console.log('✓ Reservations table created');
    
    // Create fines table
    console.log('Creating fines table...');
    await sequelize.query(`
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
    `);
    console.log('✓ Fines table created');
    
    // Add indexes
    console.log('Adding indexes...');
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_reservations_memberId ON reservations("memberId");
      CREATE INDEX IF NOT EXISTS idx_reservations_bookId ON reservations("bookId");
      CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
      CREATE INDEX IF NOT EXISTS idx_fines_memberId ON fines("memberId");
      CREATE INDEX IF NOT EXISTS idx_fines_loanId ON fines("loanId");
      CREATE INDEX IF NOT EXISTS idx_fines_status ON fines(status);
    `);
    console.log('✓ Indexes created');
    
    // Create settings table
    console.log('Creating settings table...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS settings (
          id SERIAL PRIMARY KEY,
          category VARCHAR(255) NOT NULL UNIQUE,
          data JSONB NOT NULL DEFAULT '{}',
          "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Settings table created');
    
    console.log('\n✅ Migration completed successfully!');
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
    await sequelize.close();
    process.exit(1);
  }
};

// Run migration
runMigration();

