-- ====================================================================
-- SECOND SHELF - Secure Admin Provisioning Script (PostgreSQL / Supabase)
-- Single Permanent Administrator Provisioning: ganeshhonnalli07@gmail.com
-- Run this in your Supabase SQL Editor
-- ====================================================================

DO $$
DECLARE
  v_admin_email TEXT := 'ganeshhonnalli07@gmail.com';
  v_admin_user_id UUID;
  v_existing_admin_count INT;
BEGIN
  -- Look up Ganesh's account from auth.users
  SELECT id INTO v_admin_user_id
  FROM auth.users
  WHERE email = v_admin_email
  LIMIT 1;

  IF v_admin_user_id IS NOT NULL THEN
    -- Demote all other accounts
    UPDATE public.user_roles
    SET role = 'seller'
    WHERE role = 'admin' AND user_id <> v_admin_user_id;

    -- Ensure Ganesh has admin role
    INSERT INTO public.user_roles (user_id, role, is_approved)
    VALUES (v_admin_user_id, 'admin', true)
    ON CONFLICT (user_id) DO UPDATE SET
      role = 'admin',
      is_approved = true;

    UPDATE public.profiles
    SET 
      full_name = 'Ganesh Honnalli (Admin)',
      is_verified = true
    WHERE id = v_admin_user_id;

    RAISE NOTICE 'Admin access granted exclusively to % (UUID: %)', v_admin_email, v_admin_user_id;
  ELSE
    RAISE NOTICE 'Please ensure % registers on SECOND SHELF first.', v_admin_email;
  END IF;
END $$;
