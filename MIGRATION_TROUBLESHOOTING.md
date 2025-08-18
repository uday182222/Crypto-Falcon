# Migration Troubleshooting Guide

## Problem Description

The backend deployment is failing with the error:
```
ERROR [alembic.util.messaging] Multiple head revisions are present for given argument 'head'; please specify a specific target revision, '<branchname>@head' to narrow to a specific head, or 'heads' for all heads
```

This happens when Alembic has multiple migration branches that haven't been properly merged.

## Root Cause

The database has multiple migration heads due to:
1. Conflicting migration branches
2. Incomplete merge operations
3. Database state inconsistency

## Solutions

### Solution 1: Automatic Fix (Recommended)

The updated `fix_migrations.py` script will automatically:
1. Detect multiple heads
2. Attempt to merge them
3. If merging fails, stamp to the latest revision
4. Run migrations from that point

### Solution 2: Manual Reset (If Automatic Fails)

If the automatic fix fails, use `reset_migrations.py`:
```bash
python reset_migrations.py
```

This script will:
1. Reset migration state to base
2. Run all migrations from scratch
3. Recreate the database schema

### Solution 3: Manual Intervention (Last Resort)

If both automatic solutions fail, use `manual_migration_fix.py`:
```bash
python manual_migration_fix.py
```

This interactive script allows you to:
1. View current migration state
2. Choose specific actions
3. Manually resolve conflicts

## Current Migration Files

The following migration files exist:
- `080547417010_dummy_patch.py` - Dummy patch
- `4b21ee4b95d9_create_users_table.py` - Create users table
- `2e2cd2f8b62c_add_profile_fields.py` - Add profile fields
- `7b574d379658_add_wallet_transactions_table.py` - Add wallet transactions
- `daabe742f126_add_xp_columns_only.py` - Add XP columns
- `d6f48f3131ea_fix_trades_table_schema_mismatch.py` - Fix trades table
- `23f382e180c8_merge_dummy_patch_and_main_head.py` - Merge attempt
- `fix_purchases_table.py` - Fix purchases table
- `update_trades_table.py` - Update trades table
- `reset_and_create_all_tables.py` - Complete reset migration

## Deployment Steps

### 1. Update the Scripts
The migration scripts have been updated to handle multiple heads automatically.

### 2. Redeploy
The `REDEPLOY_TRIGGER` has been updated to `migration-fix-v4` to trigger a new deployment.

### 3. Monitor Logs
Watch the deployment logs for:
- Migration state detection
- Head merging attempts
- Successful migration completion

## Expected Behavior

After the fix, the deployment should:
1. Successfully detect and merge multiple heads
2. Complete database migrations
3. Start the application normally

## Fallback Procedures

If the automatic fix still fails:

1. **Check Database State**: Connect to the database and check the `alembic_version` table
2. **Manual Reset**: Drop the `alembic_version` table and let migrations recreate it
3. **Schema Validation**: Ensure all tables exist and have correct structure

## Database Commands for Manual Fix

```sql
-- Check current migration state
SELECT * FROM alembic_version;

-- If needed, reset migration state
DROP TABLE IF EXISTS alembic_version;

-- Check table existence
\dt

-- Check specific table structure
\d table_name
```

## Prevention

To prevent this issue in the future:
1. Always test migrations locally before deploying
2. Use feature branches for database changes
3. Merge migration branches before production deployment
4. Keep migration history clean and linear

## Support

If issues persist:
1. Check the migration logs in detail
2. Use the manual migration fix script
3. Consider a complete database reset if data loss is acceptable
4. Review migration dependencies and ensure they're properly ordered
