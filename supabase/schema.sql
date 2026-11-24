-- ============================================================================
-- Taskflow Supabase Database Schema & Row Level Security (RLS) Policies
-- Run this SQL in your Supabase Dashboard -> SQL Editor
-- ============================================================================

-- 1. Enable pgcrypto / uuid generation if not already active
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create the `tasks` table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CHECK (char_length(trim(title)) > 0 AND char_length(title) <= 200),
  description TEXT DEFAULT '',
  due_date DATE,
  priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('High', 'Medium', 'Low')),
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Helpful indexes for filtering and sorting
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks (status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON public.tasks (priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks (due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON public.tasks (created_at DESC);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 5. RLS Access Policies for Public/Anon Client Workspace
-- These policies allow the frontend anon key to perform full CRUD operations
-- while still enforcing the table's data integrity CHECK constraints.
--
-- NOTE: If you later add Supabase Authentication (multi-user accounts),
-- replace these policies with user-scoped policies checking `auth.uid() = user_id`.

DROP POLICY IF EXISTS "Allow read access to tasks" ON public.tasks;
CREATE POLICY "Allow read access to tasks"
  ON public.tasks
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow insert access to tasks" ON public.tasks;
CREATE POLICY "Allow insert access to tasks"
  ON public.tasks
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(trim(title)) > 0
    AND priority IN ('High', 'Medium', 'Low')
    AND status IN ('Pending', 'Completed')
  );

DROP POLICY IF EXISTS "Allow update access to tasks" ON public.tasks;
CREATE POLICY "Allow update access to tasks"
  ON public.tasks
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (
    char_length(trim(title)) > 0
    AND priority IN ('High', 'Medium', 'Low')
    AND status IN ('Pending', 'Completed')
  );

DROP POLICY IF EXISTS "Allow delete access to tasks" ON public.tasks;
CREATE POLICY "Allow delete access to tasks"
  ON public.tasks
  FOR DELETE
  TO anon, authenticated
  USING (true);
