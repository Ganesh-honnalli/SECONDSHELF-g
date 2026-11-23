-- ====================================================================
-- SECOND SHELF - Stall Owner Registration, Admin Approval & RLS Security Fix
-- Migration: 20261122_stall_registration_and_approval_fix.sql
-- ====================================================================

-- 1. Ensure required columns exist on public.book_stalls
ALTER TABLE IF EXISTS public.book_stalls
  ADD COLUMN IF NOT EXISTS offers_pickup BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS state TEXT DEFAULT 'Karnataka',
  ADD COLUMN IF NOT EXISTS district TEXT DEFAULT 'Dharwad',
  ADD COLUMN IF NOT EXISTS city TEXT DEFAULT 'Hubli';

-- Ensure required columns exist on public.scrap_owners
ALTER TABLE IF EXISTS public.scrap_owners
  ADD COLUMN IF NOT EXISTS state TEXT DEFAULT 'Karnataka',
  ADD COLUMN IF NOT EXISTS district TEXT DEFAULT 'Dharwad',
  ADD COLUMN IF NOT EXISTS city TEXT DEFAULT 'Hubli';

-- 2. Ensure user_id unique constraints exist for idempotent upserts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'book_stalls_user_id_key'
  ) THEN
    ALTER TABLE public.book_stalls ADD CONSTRAINT book_stalls_user_id_key UNIQUE (user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'scrap_owners_user_id_key'
  ) THEN
    ALTER TABLE public.scrap_owners ADD CONSTRAINT scrap_owners_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- 3. Row Level Security Policies for public.book_stalls
ALTER TABLE public.book_stalls ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Stall owners can register" ON public.book_stalls;
DROP POLICY IF EXISTS "Stall owners can register pending stall" ON public.book_stalls;
DROP POLICY IF EXISTS "Anyone can submit pending stall application" ON public.book_stalls;
DROP POLICY IF EXISTS "Public can view approved stalls" ON public.book_stalls;
DROP POLICY IF EXISTS "Owners can view own stall" ON public.book_stalls;
DROP POLICY IF EXISTS "Admin can view all stalls" ON public.book_stalls;
DROP POLICY IF EXISTS "Admin can update book stall approvals" ON public.book_stalls;
DROP POLICY IF EXISTS "Owners can update own approved stall" ON public.book_stalls;

-- (A) INSERT: Allow new applicants (anon or authenticated) to submit ONLY 'pending' applications
CREATE POLICY "Anyone can submit pending stall application" ON public.book_stalls
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    approval_status = 'pending'
  );

-- (B) SELECT: Public can view approved stalls for book purchasing
CREATE POLICY "Public can view approved stalls" ON public.book_stalls
  FOR SELECT TO public
  USING (
    approval_status = 'approved'
  );

-- (C) SELECT: Stall owners can view their own stall (even if pending or rejected)
CREATE POLICY "Owners can view own stall" ON public.book_stalls
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
  );

-- (D) SELECT: Admin can view ALL stalls (pending, approved, rejected, suspended)
CREATE POLICY "Admin can view all stalls" ON public.book_stalls
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
  );

-- (E) UPDATE: Only authorized Administrator can update approval_status (Approve / Reject / Suspend)
CREATE POLICY "Admin can update book stall approvals" ON public.book_stalls
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- (F) UPDATE: Approved stall owners can update their own business profile details (address, phone, etc.)
CREATE POLICY "Owners can update own approved stall" ON public.book_stalls
  FOR UPDATE TO authenticated
  USING (
    auth.uid() = user_id 
    AND approval_status = 'approved'
  )
  WITH CHECK (
    auth.uid() = user_id 
    AND approval_status = 'approved'
  );

-- 4. Row Level Security Policies for public.scrap_owners
ALTER TABLE public.scrap_owners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Scrap owners can register" ON public.scrap_owners;
DROP POLICY IF EXISTS "Anyone can submit pending scrap application" ON public.scrap_owners;
DROP POLICY IF EXISTS "Public can view approved scrap yards" ON public.scrap_owners;
DROP POLICY IF EXISTS "Owners can view own scrap yard" ON public.scrap_owners;
DROP POLICY IF EXISTS "Admin can view all scrap yards" ON public.scrap_owners;
DROP POLICY IF EXISTS "Admin can update scrap owner approvals" ON public.scrap_owners;
DROP POLICY IF EXISTS "Owners can update own approved scrap yard" ON public.scrap_owners;

-- (A) INSERT: Allow new applicants to submit ONLY 'pending' scrap depot applications
CREATE POLICY "Anyone can submit pending scrap application" ON public.scrap_owners
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    approval_status = 'pending'
  );

-- (B) SELECT: Public can view approved scrap depots
CREATE POLICY "Public can view approved scrap yards" ON public.scrap_owners
  FOR SELECT TO public
  USING (
    approval_status = 'approved'
  );

-- (C) SELECT: Scrap owners can view their own depot
CREATE POLICY "Owners can view own scrap yard" ON public.scrap_owners
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
  );

-- (D) SELECT: Admin can view ALL scrap depots
CREATE POLICY "Admin can view all scrap yards" ON public.scrap_owners
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
  );

-- (E) UPDATE: Only Administrator can update approval_status
CREATE POLICY "Admin can update scrap owner approvals" ON public.scrap_owners
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- (F) UPDATE: Approved scrap owners can update their own depot details
CREATE POLICY "Owners can update own approved scrap yard" ON public.scrap_owners
  FOR UPDATE TO authenticated
  USING (
    auth.uid() = user_id 
    AND approval_status = 'approved'
  )
  WITH CHECK (
    auth.uid() = user_id 
    AND approval_status = 'approved'
  );

-- 5. Automated Partner Registration Database Trigger on auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user_partner_registration()
RETURNS TRIGGER AS $$
DECLARE
  v_role TEXT;
  v_btype TEXT;
  v_name TEXT;
  v_phone TEXT;
  v_biz_name TEXT;
  v_address TEXT;
  v_licence TEXT;
BEGIN
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'seller');
  v_btype := NEW.raw_user_meta_data->>'business_type';
  v_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
  v_phone := COALESCE(NEW.raw_user_meta_data->>'phone', '');
  v_address := COALESCE(NEW.raw_user_meta_data->>'address', 'Karnataka');
  v_licence := COALESCE(NEW.raw_user_meta_data->>'licence_number', NEW.raw_user_meta_data->>'licence', 'Pending');

  -- Ensure Profile Exists
  INSERT INTO public.profiles (id, full_name, phone, email, is_verified)
  VALUES (NEW.id, v_name, v_phone, NEW.email, false)
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    email = EXCLUDED.email;

  -- Ensure User Role Exists
  INSERT INTO public.user_roles (user_id, role, is_approved)
  VALUES (NEW.id, v_role, false)
  ON CONFLICT (user_id) DO NOTHING;

  -- Automatically create pending book stall record if business_type is book_stall
  IF v_btype = 'book_stall' OR NEW.raw_user_meta_data ? 'stall_name' THEN
    v_biz_name := COALESCE(NEW.raw_user_meta_data->>'stall_name', v_name || ' Book Stall');
    INSERT INTO public.book_stalls (
      user_id,
      stall_name,
      owner_name,
      phone,
      licence_number,
      address,
      pincode,
      approval_status
    ) VALUES (
      NEW.id,
      v_biz_name,
      v_name,
      v_phone,
      v_licence,
      v_address,
      '580020',
      'pending'
    )
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  -- Automatically create pending scrap depot record if business_type is scrap_depot/raddi_owner
  IF v_btype IN ('raddi_owner', 'scrap_owner', 'scrap_depot') OR NEW.raw_user_meta_data ? 'biz_name' THEN
    v_biz_name := COALESCE(NEW.raw_user_meta_data->>'biz_name', v_name || ' Scrap Depot');
    INSERT INTO public.scrap_owners (
      user_id,
      business_name,
      owner_name,
      phone,
      licence_number,
      address,
      approval_status
    ) VALUES (
      NEW.id,
      v_biz_name,
      v_name,
      v_phone,
      v_licence,
      v_address,
      'pending'
    )
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_handle_new_user_partner ON auth.users;
CREATE TRIGGER trg_handle_new_user_partner
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_partner_registration();
