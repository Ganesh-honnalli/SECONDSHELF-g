-- ====================================================================
-- SECOND SHELF - Admin Security, Owner Approval & Location Integration
-- Migration: 20261110_admin_and_location.sql
-- ====================================================================

-- 1. Ensure columns for State, District, City, Location exist
ALTER TABLE IF EXISTS public.book_stalls 
  ADD COLUMN IF NOT EXISTS state TEXT DEFAULT 'Karnataka',
  ADD COLUMN IF NOT EXISTS district TEXT DEFAULT 'Dharwad',
  ADD COLUMN IF NOT EXISTS city TEXT DEFAULT 'Hubli',
  ADD COLUMN IF NOT EXISTS location TEXT;

ALTER TABLE IF EXISTS public.scrap_owners 
  ADD COLUMN IF NOT EXISTS state TEXT DEFAULT 'Karnataka',
  ADD COLUMN IF NOT EXISTS district TEXT DEFAULT 'Dharwad',
  ADD COLUMN IF NOT EXISTS city TEXT DEFAULT 'Hubli',
  ADD COLUMN IF NOT EXISTS location TEXT;

ALTER TABLE IF EXISTS public.profiles
  ADD COLUMN IF NOT EXISTS state TEXT DEFAULT 'Karnataka',
  ADD COLUMN IF NOT EXISTS district TEXT DEFAULT 'Dharwad',
  ADD COLUMN IF NOT EXISTS city TEXT DEFAULT 'Hubli',
  ADD COLUMN IF NOT EXISTS location TEXT;

-- 2. Configure exactly ONE permanent Administrator: ganeshhonnalli07@gmail.com
DO $$
DECLARE
  v_admin_email TEXT := 'ganeshhonnalli07@gmail.com';
  v_admin_user_id UUID;
BEGIN
  -- Look up user ID from auth.users or profiles
  SELECT id INTO v_admin_user_id
  FROM auth.users
  WHERE email = v_admin_email
  LIMIT 1;

  IF v_admin_user_id IS NOT NULL THEN
    -- Demote any other accounts that might have had the admin role
    UPDATE public.user_roles
    SET role = 'seller'
    WHERE role = 'admin' AND user_id <> v_admin_user_id;

    -- Ensure ganeshhonnalli07@gmail.com has the admin role
    INSERT INTO public.user_roles (user_id, role, is_approved)
    VALUES (v_admin_user_id, 'admin', true)
    ON CONFLICT (user_id) DO UPDATE SET
      role = 'admin',
      is_approved = true;

    -- Update profile
    UPDATE public.profiles
    SET 
      full_name = COALESCE(NULLIF(full_name, ''), 'Ganesh Honnalli (Admin)'),
      is_verified = true
    WHERE id = v_admin_user_id;

    RAISE NOTICE 'Administrator successfully configured for % (UUID %)', v_admin_email, v_admin_user_id;
  ELSE
    RAISE NOTICE 'User % not found in auth.users yet. Please register this account first.', v_admin_email;
  END IF;
END $$;

-- 3. Update is_admin() function to strictly verify email + role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM auth.users u
    JOIN public.user_roles r ON r.user_id = u.id
    WHERE u.id = auth.uid()
      AND u.email = 'ganeshhonnalli07@gmail.com'
      AND r.role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Trigger to prevent users from escalating to admin role
CREATE OR REPLACE FUNCTION public.prevent_unauthorized_admin_escalation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'admin' THEN
    IF NOT EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = NEW.user_id AND email = 'ganeshhonnalli07@gmail.com'
    ) THEN
      RAISE EXCEPTION 'Security Violation: Only ganeshhonnalli07@gmail.com is permitted as administrator.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_unauthorized_admin ON public.user_roles;
CREATE TRIGGER trg_prevent_unauthorized_admin
BEFORE INSERT OR UPDATE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.prevent_unauthorized_admin_escalation();

-- 5. RLS Policies for Business Approvals
-- Allow anonymous / authenticated users to submit pending registrations
DROP POLICY IF EXISTS "Stall owners can register" ON public.book_stalls;
CREATE POLICY "Stall owners can register" ON public.book_stalls
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = user_id 
    AND approval_status = 'pending'
  );

DROP POLICY IF EXISTS "Scrap owners can register" ON public.scrap_owners;
CREATE POLICY "Scrap owners can register" ON public.scrap_owners
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = user_id 
    AND approval_status = 'pending'
  );

-- Only Admin can update approval status (Approve / Reject)
DROP POLICY IF EXISTS "Admin can update book stall approvals" ON public.book_stalls;
CREATE POLICY "Admin can update book stall approvals" ON public.book_stalls
  FOR UPDATE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admin can update scrap owner approvals" ON public.scrap_owners;
CREATE POLICY "Admin can update scrap owner approvals" ON public.scrap_owners
  FOR UPDATE TO authenticated USING (public.is_admin());

-- Approved owners can view and update their own business details
DROP POLICY IF EXISTS "Owners can update own approved stall" ON public.book_stalls;
CREATE POLICY "Owners can update own approved stall" ON public.book_stalls
  FOR UPDATE TO authenticated USING (auth.uid() = user_id AND approval_status = 'approved');

DROP POLICY IF EXISTS "Owners can update own approved scrap yard" ON public.scrap_owners;
CREATE POLICY "Owners can update own approved scrap yard" ON public.scrap_owners
  FOR UPDATE TO authenticated USING (auth.uid() = user_id AND approval_status = 'approved');
