-- ====================================================================
-- SECOND SHELF - Complete Notification System Repair & RLS Clearance
-- Migration: 20261127_fix_notifications_complete.sql
-- ====================================================================

-- 1. Ensure public.notifications table exists with all required columns
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

-- 2. Index for rapid real-time lookup by recipient and read status
CREATE INDEX IF NOT EXISTS idx_notifications_user_lookup 
  ON public.notifications(user_id, is_read, created_at DESC);

-- 3. Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 4. Clean up all previous restrictive policies
DROP POLICY IF EXISTS "User views own notifications" ON public.notifications;
DROP POLICY IF EXISTS "User updates own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow authenticated users to insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Anyone can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Service role full access on notifications" ON public.notifications;

-- 5. Policies:
-- (A) Authenticated users can view their own notifications (and platform admin sees all)
CREATE POLICY "User views own notifications" ON public.notifications
  FOR SELECT TO authenticated 
  USING (user_id = auth.uid() OR public.is_admin());

-- (B) Authenticated users can update (mark as read) their own notifications
CREATE POLICY "User updates own notifications" ON public.notifications
  FOR UPDATE TO authenticated 
  USING (user_id = auth.uid() OR public.is_admin());

-- (C) Allow ANY authenticated or anon user to INSERT notifications for partners, admins, or sellers
-- This allows:
--  - Textbook sellers to notify stall owners
--  - Scrap sellers to notify scrap depots (>= 10 kg)
--  - Stall owners to notify sellers of offers/counter-offers
--  - Registering partners to notify the admin console
--  - Admin to notify partners of approvals/rejections
CREATE POLICY "Anyone can insert notifications" ON public.notifications
  FOR INSERT TO anon, authenticated 
  WITH CHECK (true);

-- (D) Service role has full unrestricted access
CREATE POLICY "Service role full access on notifications" ON public.notifications
  FOR ALL TO service_role 
  USING (true) 
  WITH CHECK (true);

-- 6. Add public.notifications to Supabase Realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END $$;
