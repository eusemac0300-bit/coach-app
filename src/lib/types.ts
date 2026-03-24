export interface Coach {
  id: string;
  full_name: string;
  email: string;
  specialty?: string;
  bio?: string;
  avatar_url?: string;
  created_at?: string;
}

export interface Group {
  id: string;
  coach_id?: string;
  name: string;
  training_days: string[];
  training_hour: string;
  fee_per_session: number | string;
  created_at?: string;
  members?: string[] | any[]; // For frontend convenience
}

export interface Athlete {
  id: string;
  coach_id: string;
  group_id?: string | null;
  full_name: string;
  email: string;
  phone?: string;
  status: 'active' | 'inactive' | 'on_hold';
  avatar_url?: string;
  goals?: string[];
  medical_notes?: string;
  fee_per_session: number | string;
  join_date: string;
  last_checkin?: string;
  created_at: string;
  updated_at: string;
  
  // Joins
  groups?: Group | null;
  athlete_schedules?: AthleteSchedule[];
}

export interface AthleteMetric {
  id: string;
  athlete_id: string;
  weight: number;
  height: number;
  bmi: number;
  date: string;
  created_at: string;
}

export interface AthleteSchedule {
  id: string;
  athlete_id: string;
  day_of_week: string;
  training_hour: string;
}

export interface WorkoutSession {
  id: string;
  coach_id?: string;
  group_id?: string;
  athlete_id?: string;
  title: string;
  date: string;
  time?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

export interface Exercise {
  id: string;
  coach_id?: string;
  name: string;
  category: string;
  type: 'REPS' | 'TIME';
  description: string;
  created_at?: string;
}

export interface FinancialRecord {
  id: string;
  coach_id?: string;
  athlete_id?: string | null;
  amount: number | string;
  type: 'income' | 'expense';
  category: string;
  date: string;
  status: 'pending' | 'paid' | 'refunded';
  description?: string;
  created_at?: string;
  // join
  athletes?: Athlete | null;
}
