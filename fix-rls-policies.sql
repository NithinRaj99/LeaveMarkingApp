-- ============================================================
-- FIX: Circular RLS policy on profiles table
-- Run this in Supabase SQL Editor to fix 500 errors.
-- ============================================================

-- Step 1: Create a SECURITY DEFINER function that bypasses RLS
-- to check if the current user is an admin.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Step 2: Drop the broken admin policies (they had circular references)
DROP POLICY IF EXISTS "Admins read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins read all allocations" ON public.leave_allocations;
DROP POLICY IF EXISTS "Admins read all leaves" ON public.leaves;

-- Step 3: Recreate them using the SECURITY DEFINER function
CREATE POLICY "Admins read all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins read all allocations"
  ON public.leave_allocations FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins read all leaves"
  ON public.leaves FOR SELECT
  USING (public.is_admin());
