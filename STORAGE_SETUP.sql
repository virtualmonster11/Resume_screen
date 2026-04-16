-- ==========================================
-- 1. Create Private Storage Bucket for Resumes
-- ==========================================
-- (Note: Running bucket creation via SQL works in Supabase securely)
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;

-- Enforce RLS on the bucket so only the file owner can read/write their PDFs
CREATE POLICY "Users can upload their own resumes" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1] );

CREATE POLICY "Users can view their own resumes" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1] );

-- ==========================================
-- 2. Create Job Campaigns Table
-- ==========================================
CREATE TABLE public.job_campaigns (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_name text NOT NULL,
  job_description text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, job_name) -- Prevents duplicate job names for the same user
);

ALTER TABLE public.job_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own campaigns" ON job_campaigns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own campaigns" ON job_campaigns FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own campaigns" ON job_campaigns FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own campaigns" ON job_campaigns FOR DELETE USING (auth.uid() = user_id);

-- ==========================================
-- 3. Update Analysis History to link Candidates to Campaigns & Files
-- ==========================================
ALTER TABLE public.analysis_history 
  ADD COLUMN IF NOT EXISTS campaign_id uuid REFERENCES public.job_campaigns(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS resume_url text; 

-- Allow reading the new columns automatically since RLS is already set up on analysis_history
