-- 1. Create a `profiles` table to track Recruiter vs Candidate
CREATE TABLE public.profiles (
  id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'candidate' CHECK (role IN ('candidate', 'recruiter')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (id)
);

-- 2. Create `analysis_history` to store past data
CREATE TABLE public.analysis_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_title text,
  candidate_name text, -- extracted from PDF name or custom
  ats_score int,
  match_level text,
  full_results jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Row Level Security (RLS) setup so users only see their own data
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can read own history" ON analysis_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own history" ON analysis_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own history" ON analysis_history FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own history" ON analysis_history FOR DELETE USING (auth.uid() = user_id);
