# Database Setup Scripts

## Doctor Profile Setup

### File: `setup_doctors_profile.sql`

This script sets up the doctors table with proper structure for the profile management system.

### What it does:

1. **Creates/Updates doctors table** with all required columns:
   - Basic info (name, email, phone)
   - Professional details (specialization, qualifications, HPCSA number)
   - Practice details (fee, bio, address)
   - Availability settings (days, hours)
   - Status flags (active, approved)
   - Timestamps (created_at, updated_at)

2. **Adds necessary constraints**:
   - Unique constraint on `user_id` (required for upsert operations)
   - Foreign key to auth.users
   - Unique HPCSA number

3. **Creates indexes** for performance:
   - user_id, hpcsa_number, is_active, is_approved

4. **Sets up Row Level Security (RLS)**:
   - Doctors can manage their own profiles
   - Admins can view all profiles
   - Public can view approved active doctors

5. **Adds sample data** if table is empty

### How to run:

#### Option 1: Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the content of `setup_doctors_profile.sql`
4. Click "Run"

#### Option 2: Command Line (if you have psql access)
```bash
psql -h your-supabase-host -p 5432 -d postgres -U postgres -f sql-scripts/setup_doctors_profile.sql
```

#### Option 3: Supabase CLI
```bash
supabase db reset --linked
# Then apply the migration
```

### After running the script:

The profile page should work correctly with:
- ✅ Proper database schema
- ✅ Unique constraints for upsert operations  
- ✅ Row Level Security policies
- ✅ Automatic updated_at timestamps
- ✅ Sample doctor data

### Troubleshooting:

If you get permissions errors, ensure:
1. You're running as the postgres user or service_role
2. RLS policies allow your operations
3. The user_id in the sample data matches an actual auth user

### Next Steps:

After running this script, the doctor profile page should work without database errors. You can then:
1. Test saving profile updates
2. Add profile photo upload functionality
3. Implement additional features as needed