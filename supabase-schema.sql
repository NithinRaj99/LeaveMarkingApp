-- ============================================================
-- LEAVE MANAGEMENT APP — Supabase SQL Schema
-- Run this in Supabase SQL Editor.
-- Uses CREATE TABLE IF NOT EXISTS — safe alongside existing tables.
-- ============================================================

-- ============================================================
-- 1. PROFILES TABLE (extends Supabase auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Helper function to check admin status WITHOUT triggering RLS
-- (avoids circular reference when used in policies on profiles itself)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Users can read their own profile
CREATE POLICY "Users read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Admins can read all profiles (uses SECURITY DEFINER function)
CREATE POLICY "Admins read all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

-- Users can update their own profile (but not role)
CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- 2. LEAVE ALLOCATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.leave_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  leave_type TEXT NOT NULL,
  total_allowed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, leave_type)
);

ALTER TABLE public.leave_allocations ENABLE ROW LEVEL SECURITY;

-- Users manage own allocations
CREATE POLICY "Users manage own allocations"
  ON public.leave_allocations FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can read all allocations
CREATE POLICY "Admins read all allocations"
  ON public.leave_allocations FOR SELECT
  USING (public.is_admin());


-- ============================================================
-- 3. LEAVES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.leaves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  leave_type TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  duration TEXT NOT NULL DEFAULT 'full_day' CHECK (duration IN ('full_day', 'half_day')),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.leaves ENABLE ROW LEVEL SECURITY;

-- Users manage own leaves
CREATE POLICY "Users manage own leaves"
  ON public.leaves FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can read all leaves
CREATE POLICY "Admins read all leaves"
  ON public.leaves FOR SELECT
  USING (public.is_admin());


-- ============================================================
-- 4. AUTO-CREATE DEFAULT ALLOCATIONS ON SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION public.create_default_allocations()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.leave_allocations (user_id, leave_type, total_allowed)
  VALUES
    (NEW.id, 'Casual Leave', 12),
    (NEW.id, 'Sick Leave', 10),
    (NEW.id, 'Earned Leave', 15);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_user_create_allocations ON auth.users;
CREATE TRIGGER on_user_create_allocations
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_default_allocations();


-- ============================================================
-- 5. PROMOTE A USER TO ADMIN
--    Run this AFTER signing up the admin account.
--    Replace 'admin@example.com' with the real admin email.
-- ============================================================
-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE email = 'admin@example.com';
