-- ==========================================
-- HECTATE SUPABASE SCHEMA (CLEAN REINSTALL)
-- Run this in your Supabase SQL Editor
-- ==========================================

-- 1. DROP EXISTING TABLES TO AVOID TYPE CONFLICTS (UUID vs TEXT)
-- WARNING: This will delete all data in these tables.
DROP TABLE IF EXISTS public.replies CASCADE;
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.posts CASCADE;
DROP TABLE IF EXISTS public.lawyer_reviews CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.lawyers CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- 2. Create Profiles Table (Using TEXT for custom IDs like 'W001')
CREATE TABLE public.profiles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    handle TEXT UNIQUE NOT NULL,
    city TEXT,
    state TEXT,
    dob DATE,
    aadhaar_ref TEXT,
    avatar_initials TEXT,
    bio TEXT,
    tags TEXT[],
    joined DATE DEFAULT CURRENT_DATE,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Posts Table
CREATE TABLE public.posts (
    id TEXT PRIMARY KEY,
    author_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
    author_name TEXT,
    author_handle TEXT,
    content TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    likes INTEGER DEFAULT 0,
    reposts INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Replies Table (Called 'replies' to match migration script)
CREATE TABLE public.replies (
    id TEXT PRIMARY KEY,
    post_id TEXT REFERENCES public.posts(id) ON DELETE CASCADE,
    author_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
    author_handle TEXT,
    content TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Lawyers Table
CREATE TABLE public.lawyers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    title TEXT,
    college TEXT,
    quals TEXT[],
    specs TEXT[],
    rating NUMERIC(3,2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    experience_years INTEGER,
    location TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create Lawyer Reviews Table
CREATE TABLE public.lawyer_reviews (
    id SERIAL PRIMARY KEY,
    lawyer_id TEXT REFERENCES public.lawyers(id) ON DELETE CASCADE,
    reviewer TEXT,
    stars INTEGER CHECK (stars >= 1 AND stars <= 5),
    date TEXT,
    text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lawyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lawyer_reviews ENABLE ROW LEVEL SECURITY;

-- 8. Set up RLS Policies (Allow everyone to see, and migration script to edit)
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow migration insert/update profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Posts are viewable by everyone" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Allow migration insert/update posts" ON public.posts FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Replies are viewable by everyone" ON public.replies FOR SELECT USING (true);
CREATE POLICY "Allow migration insert/update replies" ON public.replies FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Lawyers are viewable by everyone" ON public.lawyers FOR SELECT USING (true);
CREATE POLICY "Allow migration insert/update lawyers" ON public.lawyers FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Reviews are viewable by everyone" ON public.lawyer_reviews FOR SELECT USING (true);
CREATE POLICY "Allow migration insert/update reviews" ON public.lawyer_reviews FOR ALL USING (true) WITH CHECK (true);
