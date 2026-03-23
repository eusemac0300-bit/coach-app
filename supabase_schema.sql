-- 
-- SUPABASE SCHEMA FOR COACH (KINETIC PRECISION)
-- 

-- 1. Coaches (Profiles)
CREATE TABLE coaches (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  specialty TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Athletes (Clients)
CREATE TABLE athletes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID REFERENCES coaches(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_hold')),
  avatar_url TEXT,
  goals TEXT[],
  medical_notes TEXT,
  last_checkin TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Workout Sessions
CREATE TABLE workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
  coach_id UUID REFERENCES coaches(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME,
  duration_mins INTEGER,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Financial Records (Incomes/Expenses)
CREATE TABLE financial_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID REFERENCES coaches(id) ON DELETE CASCADE,
  athlete_id UUID REFERENCES athletes(id) ON DELETE SET NULL,
  amount DECIMAL(12,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL DEFAULT 'subscription', -- 'subscription', 'single_session', 'gear', 'rent', etc.
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'paid' CHECK (status IN ('pending', 'paid', 'refunded')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Coach Settings (Metadata)
CREATE TABLE coach_settings (
  coach_id UUID PRIMARY KEY REFERENCES coaches(id) ON DELETE CASCADE,
  currency TEXT DEFAULT 'USD',
  working_hours JSONB, -- { "Mon": { "start": "08:00", "end": "18:00" }, ... }
  notifications_enabled BOOLEAN DEFAULT true,
  theme_preference TEXT DEFAULT 'dark'
);

-- Enable Row Level Security (RLS)
ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_settings ENABLE ROW LEVEL SECURITY;

-- Basic Policies (Simplified for now - usually coach sees only their data)
CREATE POLICY "Coach sees their own profile" ON coaches FOR ALL USING (auth.uid() = id);
CREATE POLICY "Coach sees their athletes" ON athletes FOR ALL USING (auth.uid() = coach_id);
CREATE POLICY "Coach sees their sessions" ON workout_sessions FOR ALL USING (auth.uid() = coach_id);
CREATE POLICY "Coach sees their finances" ON financial_records FOR ALL USING (auth.uid() = coach_id);
CREATE POLICY "Coach sees their settings" ON coach_settings FOR ALL USING (auth.uid() = coach_id);
