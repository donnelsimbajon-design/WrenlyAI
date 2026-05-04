# Supabase Storage Setup

## Required Configuration for Material Uploads

### 1. Create Storage Buckets

You need to create a **'materials'** bucket in Supabase Storage:

**Steps:**
1. Go to Supabase Dashboard → Your Project
2. Navigate to **Storage** (left sidebar)
3. Click **Create a new bucket**
4. Name it: `materials`
5. Set visibility to **Private**
6. Click **Create bucket**

### 2. Enable Real-time (Optional but Recommended)

For real-time updates on materials and announcements:

```sql
-- Run in Supabase SQL Editor
ALTER PUBLICATION supabase_realtime ADD TABLE materials;
ALTER PUBLICATION supabase_realtime ADD TABLE announcements;
ALTER PUBLICATION supabase_realtime ADD TABLE enrollments;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
```

### 3. Configure Storage RLS Policies

Set up Row Level Security (RLS) policies for the **materials** bucket:

**Policy 1: Allow authenticated users to upload their own files**
```sql
-- Bucket: materials
-- Target roles: Authenticated users
-- Allowed operation: INSERT

(auth.uid() = (storage.foldername()[1])::uuid)
```

**Policy 2: Allow authenticated users to read files**
```sql
-- Bucket: materials
-- Target roles: Authenticated users
-- Allowed operation: SELECT

true
```

**Policy 3: Allow authenticated users to delete their own files**
```sql
-- Bucket: materials
-- Target roles: Authenticated users
-- Allowed operation: DELETE

(auth.uid() = (storage.foldername()[1])::uuid)
```

### 4. Database Tables Required

Make sure these tables exist in your Supabase database:

```sql
CREATE TABLE IF NOT EXISTS materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  classroom_id UUID REFERENCES classrooms(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  file_type TEXT,
  storage_path TEXT NOT NULL,
  processing_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  classroom_id UUID REFERENCES classrooms(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  classroom_id UUID REFERENCES classrooms(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(classroom_id, student_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  classroom_id UUID REFERENCES classrooms(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'text',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 5. Environment Variables

Ensure your `.env` file has these variables:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Troubleshooting Upload Errors

### Error: 400 Bad Request

**Possible causes:**
1. ❌ Bucket 'materials' doesn't exist → Create it in Storage
2. ❌ User not authenticated → Check auth session
3. ❌ RLS policy blocking uploads → Add ALLOW INSERT policy
4. ❌ File too large (>150MB) → Check file size limit
5. ❌ CORS issues → Usually not a problem with proper Supabase setup

**Solution:**
- Check Supabase logs: Dashboard → Project Settings → Logs
- Verify bucket exists and is named 'materials'
- Verify RLS policies are correct
- Ensure user is authenticated before upload

### Error: 403 Forbidden

**Cause:** RLS policy is denying access

**Solution:** Add the INSERT policy shown above

### Error: Missing Bucket

**Cause:** Bucket hasn't been created yet

**Solution:** Create 'materials' bucket in Storage section

## Testing File Upload

1. Open app
2. Go to Teacher Dashboard → Upload
3. Click "Browse Files"
4. Select a test PDF/PowerPoint
5. Check browser console for any errors
6. If successful, file appears in:
   - Supabase Dashboard → Storage → materials → [user-id]/

## Debugging Steps

1. **Check authentication:**
   ```typescript
   const { data } = await supabase.auth.getSession();
   console.log('Session:', data.session);
   ```

2. **Check bucket exists:**
   - Open Supabase Dashboard
   - Go to Storage
   - Look for 'materials' bucket

3. **Check RLS policies:**
   - Click 'materials' bucket
   - Check "Policies" tab
   - Should see 3 policies (INSERT, SELECT, DELETE)

4. **Monitor real-time:**
   - Enable real-time on materials table
   - Upload file
   - Check if real-time event fires

5. **Check logs:**
   - Supabase Dashboard → Project Settings → Logs
   - Look for storage errors

## Success Indicators

✅ File uploads successfully  
✅ Progress bar reaches 100%  
✅ Material appears in "Recent Materials" list  
✅ File exists in Supabase Storage  
✅ Material record created in database  
✅ Real-time notification appears to students  

## Next Steps

1. Create the 'materials' bucket
2. Set up RLS policies
3. Verify environment variables
4. Test file upload
5. Check Supabase logs if errors persist
