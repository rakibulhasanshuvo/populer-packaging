-- =========================================================================
-- SQL Migration Script: User Profiles & Account Metadata Schema
-- Target Platform: Supabase / PostgreSQL (Execute in Supabase SQL Editor)
-- =========================================================================

-- 1. Create Profiles Table (Linked to auth.users via cascade deletion)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    avatar_initials VARCHAR(10) DEFAULT 'US',
    role VARCHAR(100) DEFAULT 'Operations Administrator',
    theme_preference VARCHAR(20) DEFAULT 'dark',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Enable Row-Level Security (RLS) on Profiles Table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Establish RLS Access Control Policies
-- Allow authenticated users to view profile details
CREATE POLICY "Allow public read access to profiles" 
    ON public.profiles 
    FOR SELECT 
    USING (true);

-- Allow authenticated users to edit only their own profile details
CREATE POLICY "Allow users to update their own profile" 
    ON public.profiles 
    FOR UPDATE 
    USING (auth.uid() = id);

-- 4. Create Sync Trigger Function from auth.users (Supabase Signups)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_name VARCHAR;
    first_char VARCHAR;
    second_char VARCHAR;
    initials VARCHAR;
BEGIN
    -- Extract name from raw metadata metadata or fallback to email local-part
    user_name := COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1));
    
    -- Generate 2-character initials
    first_char := upper(substring(user_name from 1 for 1));
    second_char := upper(substring(split_part(user_name, ' ', 2) from 1 for 1));
    
    IF second_char = '' THEN
        initials := upper(substring(user_name from 1 for 2));
    ELSE
        initials := first_char || second_char;
    END IF;

    INSERT INTO public.profiles (id, name, email, phone, avatar_initials, role, theme_preference)
    VALUES (
        new.id,
        user_name,
        new.email,
        new.phone,
        COALESCE(nullif(initials, ''), 'US'),
        'Operations Administrator',
        'dark'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Attach the Signup Sync Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_new_user();
