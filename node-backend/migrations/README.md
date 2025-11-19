# Database Migrations

## Running Migrations

If you encounter errors about missing columns, you can run the migration script manually.

### Option 1: Using psql command line

```bash
psql -U your_username -d your_database -f migrations/add_circulation_columns.sql
```

### Option 2: Using pgAdmin or another PostgreSQL client

1. Open the SQL script: `migrations/add_circulation_columns.sql`
2. Copy and paste the contents into your SQL query editor
3. Execute the script

### Option 3: Automatic Migration (Development)

The database.js file is configured to automatically add missing columns when the server starts (if `DB_ALTER` is not set to `false`).

To disable automatic migrations in production, set:
```
DB_ALTER=false
```

## What the Migration Does

1. Adds `renewalCount` and `fineAmount` columns to the `loans` table
2. Adds `fineBalance` and `maxBooksLimit` columns to the `members` table
3. Adds `Reserved` and `Damaged` status values to the books status enum
4. Creates the `reservations` table
5. Creates the `fines` table
6. Adds indexes for better query performance

