-- SUPABASE SCHEMA FOR COACH (KINETIC PRECISION)
-- Enable UUID extension first
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Coaches (Profiles)
CREATE TABLE IF NOT EXISTS coaches (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  specialty TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Groups (Escuadras)
CREATE TABLE IF NOT EXISTS groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coach_id UUID REFERENCES coaches(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    training_days TEXT[], -- e.g. ['LUN', 'MIE', 'VIE']
    training_hour TIME,
    fee_per_session NUMERIC DEFAULT 0, -- Tarifa grupal por alumno
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Athletes (Clients)
CREATE TABLE IF NOT EXISTS athletes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id UUID REFERENCES coaches(id) ON DELETE CASCADE,
  group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_hold')),
  avatar_url TEXT,
  goals TEXT[],
  medical_notes TEXT,
  fee_per_session NUMERIC DEFAULT 0, -- Valor individual base
  join_date DATE DEFAULT CURRENT_DATE,
  last_checkin TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Athlete Schedules
-- Múltiples horarios para un mismo atleta si no pertenece a un grupo rígido
CREATE TABLE IF NOT EXISTS athlete_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
  day_of_week TEXT NOT NULL, -- 'LUN', 'MAR', etc.
  training_hour TIME NOT NULL
);

-- 5. Exercises (Library)
CREATE TABLE IF NOT EXISTS exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coach_id UUID REFERENCES coaches(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT, -- e.g., 'Powerlifting', 'Conditioning'
    type TEXT DEFAULT 'REPS', -- 'REPS' or 'TIME'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(coach_id, name)
);

-- 6. Workout Sessions (Agenda & Attendance)
CREATE TABLE IF NOT EXISTS workout_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id UUID REFERENCES coaches(id) ON DELETE CASCADE,
  group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
  athlete_id UUID REFERENCES athletes(id) ON DELETE SET NULL, -- Si es sesión individual
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Session Attendance
CREATE TABLE IF NOT EXISTS session_attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES workout_sessions(id) ON DELETE CASCADE,
  athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'present' CHECK (status IN ('present', 'absent', 'rescheduled')),
  rescheduled_to UUID REFERENCES workout_sessions(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Workout Logs (Vitácora - Sets, Reps, Weights)
CREATE TABLE IF NOT EXISTS workout_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES workout_sessions(id) ON DELETE CASCADE,
  athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id) ON DELETE SET NULL,
  block_number INTEGER NOT NULL,
  set_number INTEGER NOT NULL,
  weight NUMERIC,
  reps INTEGER,
  time_seconds INTEGER,
  rpe NUMERIC, -- Rate of Perceived Exertion
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Financial Records
CREATE TABLE IF NOT EXISTS financial_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id UUID REFERENCES coaches(id) ON DELETE CASCADE,
  athlete_id UUID REFERENCES athletes(id) ON DELETE SET NULL,
  amount NUMERIC(12,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL DEFAULT 'mensualidad', -- 'mensualidad', 'clase_suelta', 'costos', etc.
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'paid' CHECK (status IN ('pending', 'paid', 'refunded')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_records ENABLE ROW LEVEL SECURITY;

-- 11. Athlete Metrics (Body history)
CREATE TABLE IF NOT EXISTS athlete_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
  weight NUMERIC,
  height NUMERIC,
  bmi NUMERIC,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE athlete_metrics DISABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all" ON athlete_metrics FOR ALL USING (true);

-- Disable RLS for local dev or add policies:
-- (Uncomment below for public access during dev, or create proper auth.uid() policies as before)
-- CREATE POLICY "allow_all" ON coaches FOR ALL USING (true);
-- CREATE POLICY "allow_all" ON groups FOR ALL USING (true);
-- CREATE POLICY "allow_all" ON athletes FOR ALL USING (true);
-- ...
