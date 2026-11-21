-- ====================================================================
-- SECOND SHELF - Supabase Notifications Row Level Security (RLS) Fix
-- Migration: 20261121_fix_notifications_rls.sql
-- ====================================================================

-- 1. Ensure table public.notifications exists with all required columns
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT NOT NULL,
  reference_id UUID,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Index for fast notification lookups
CREATE INDEX IF NOT EXISTS idx_notifications_user_lookup 
  ON public.notifications(user_id, is_read, created_at DESC);

-- 3. Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 4. Drop old conflicting policies if present
DROP POLICY IF EXISTS "User views own notifications" ON public.notifications;
DROP POLICY IF EXISTS "User updates own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow authenticated users to insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Service role full access on notifications" ON public.notifications;

-- 5. Policies:
-- (A) Authenticated users can view their own notifications
CREATE POLICY "User views own notifications" ON public.notifications
  FOR SELECT TO authenticated 
  USING (user_id = auth.uid());

-- (B) Authenticated users can update (mark as read) their own notifications
CREATE POLICY "User updates own notifications" ON public.notifications
  FOR UPDATE TO authenticated 
  USING (user_id = auth.uid());

-- (C) Authenticated users can insert notifications for stall owners, scrap owners, and admins
CREATE POLICY "Authenticated users can insert notifications" ON public.notifications
  FOR INSERT TO authenticated 
  WITH CHECK (true);

-- (D) Service role has unrestricted access (used by server.js backend endpoints)
CREATE POLICY "Service role full access on notifications" ON public.notifications
  FOR ALL TO service_role 
  USING (true) 
  WITH CHECK (true);

-- 6. Enable Realtime replication for public.notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
