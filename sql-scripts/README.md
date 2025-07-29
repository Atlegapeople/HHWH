# Supabase Patient Table Update Scripts

This directory contains SQL scripts to update the patients table structure from JSONB columns to individual columns for better performance and easier management.

## ⚠️ IMPORTANT: Run Scripts in Order

**Run these scripts one by one in your Supabase SQL Editor in this exact order:**

## 1. Check Current Structure
**File:** `001_check_current_table_structure.sql`
- **Purpose:** Shows current table structure, indexes, constraints, and RLS policies
- **Safe to run:** ✅ Read-only, no changes made
- **Action:** Review the output to understand current state

## 2. Add Missing Columns
**File:** `002_add_missing_columns.sql`
- **Purpose:** Adds individual columns for address, emergency contact, and document URLs
- **Safe to run:** ✅ Only adds columns, doesn't modify existing data
- **Action:** Adds columns like `street_address`, `city`, `province`, etc.

## 3. Migrate JSONB Data
**File:** `003_migrate_jsonb_data.sql`
- **Purpose:** Copies data from JSONB columns to individual columns
- **Safe to run:** ✅ Preserves existing data, doesn't delete anything
- **Action:** Moves data from `address` JSONB to `street_address`, `city`, etc.

## 4. Clean Up JSONB Columns
**File:** `004_cleanup_jsonb_columns.sql`
- **Purpose:** Removes old JSONB columns after successful migration
- **⚠️ CAUTION:** Contains destructive operations (commented out by default)
- **Action:** Review data migration results before uncommenting DROP statements

## 5. Update RLS Policies
**File:** `005_update_rls_policies.sql`
- **Purpose:** Updates Row Level Security policies to work properly with `user_id`
- **Safe to run:** ✅ Improves security
- **Action:** Creates proper authentication-based access control

## 6. Add Constraints and Indexes
**File:** `006_add_constraints_and_indexes.sql`
- **Purpose:** Adds data validation and performance optimizations
- **Safe to run:** ✅ Improves data quality and query performance
- **Action:** Validates phone numbers, provinces, postal codes, etc.

## 7. Verify Final Structure
**File:** `007_verify_final_structure.sql`
- **Purpose:** Comprehensive verification of the final table structure
- **Safe to run:** ✅ Read-only verification
- **Action:** Shows complete table structure and sample data

## Expected Results

After running all scripts successfully:

### ✅ New Individual Columns:
- `street_address` - Street address
- `city` - City name
- `province` - South African province (validated)
- `postal_code` - 4-digit postal code (validated)
- `country` - Country (defaults to "South Africa")
- `emergency_contact_name` - Emergency contact name
- `emergency_contact_relationship` - Relationship to patient
- `emergency_contact_phone` - Emergency contact phone (validated)
- `id_document_url` - Supabase storage URL for ID document
- `medical_aid_card_url` - Supabase storage URL for medical aid card
- `gender` - Patient gender (optional)

### ✅ Removed JSONB Columns:
- `address` (JSONB) → Individual address columns
- `emergency_contact` (JSONB) → Individual emergency contact columns

### ✅ Security Features:
- Proper RLS policies using `user_id`
- Automatic `user_id` setting via trigger
- User isolation (users can only access their own data)

### ✅ Data Validation:
- South African phone number format
- Valid province names
- 4-digit postal code format
- Emergency contact phone validation

### ✅ Performance Features:
- Indexes on commonly queried fields
- Partial indexes for non-null values
- Optimized RLS policy performance

## Troubleshooting

### If a script fails:
1. **Check the error message** in Supabase SQL Editor
2. **Run the verification script** to see current state
3. **Skip to the next script** if the change was already applied
4. **Contact support** if you encounter unexpected errors

### Common Issues:
- **"Column already exists"** → Skip to next script, change was already applied
- **"Constraint already exists"** → Normal, script will handle this
- **"Invalid phone number format"** → Check existing data with validation queries

### Rollback Strategy:
If you need to rollback:
1. **Restore from backup** (recommended)
2. **Manual cleanup** using reverse operations (advanced users only)

## Post-Migration Steps

After running all scripts:

1. **Update your application code** to use individual columns instead of JSONB
2. **Test patient registration** and profile updates
3. **Verify document uploads** work correctly
4. **Check that RLS policies** prevent unauthorized access

## Support

If you encounter issues:
1. Check the script output for specific error messages
2. Run the verification script to see current state
3. Review the troubleshooting section above
4. Ensure you're running scripts in the correct order