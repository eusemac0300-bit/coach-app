import { supabase } from './supabase';
import type { Athlete, Group, Exercise, FinancialRecord, Coach, AthleteMetric } from './types';

// ========================
// COACH PROFILE
// ========================

export async function getCoachProfile(): Promise<Coach> {
  const fallback: Coach = { id: 'temp-id', full_name: 'Coach', email: 'coach@example.com' };
  const { data, error } = await supabase.from('coaches').select('*').limit(1).single();
  if (error) {
    if (error.code === 'PGRST116') {
      // 0 rows, let's create a default coach
      const defaultCoach = { full_name: 'Eusebio M.', email: 'eusebio@editorial.cl' };
      const { data: newCoach, error: insertError } = await supabase.from('coaches').insert([defaultCoach]).select().single();
      if (!insertError) return newCoach as Coach;
      return fallback;
    }
    console.error('Error fetching coach:', error);
    return fallback;
  }
  return data as Coach;
}

export async function updateCoachProfile(id: string, updates: Partial<Coach>): Promise<boolean> {
  const { error } = await supabase.from('coaches').update(updates).eq('id', id);
  if (error) {
    console.error('Error updating coach:', error);
    return false;
  }
  return true;
}

// ========================
// ATHLETES
// ========================
export async function getAthletes(): Promise<Athlete[]> {
  const { data, error } = await supabase
    .from('athletes')
    .select(`
      *,
      groups (*),
      athlete_schedules (*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching athletes:', error);
    return [];
  }
  
  return data as Athlete[];
}

export async function createAthlete(athleteData: Partial<Athlete>, schedules: any[] = []): Promise<Athlete | null> {
  // 1. Insert athlete
  const { data: athlete, error } = await supabase
    .from('athletes')
    .insert([athleteData])
    .select()
    .single();

  if (error) {
    console.error('Error creating athlete:', error);
    return null;
  }

  // 2. Insert schedules if any
  if (schedules.length > 0 && athlete) {
    const schedulesToInsert = schedules.map(s => ({
      athlete_id: athlete.id,
      day_of_week: s.day_of_week,
      training_hour: s.training_hour
    }));
    await supabase.from('athlete_schedules').insert(schedulesToInsert);
  }

  return athlete as Athlete;
}

export async function updateAthlete(id: string, updates: Partial<Athlete>): Promise<boolean> {
  const { error } = await supabase.from('athletes').update(updates).eq('id', id);
  if (error) {
    console.error('Error updating athlete:', error);
    return false;
  }
  return true;
}

export async function deleteAthlete(id: string): Promise<boolean> {
  const { error } = await supabase.from('athletes').delete().eq('id', id);
  if (error) {
    console.error('Error deleting athlete:', error);
    return false;
  }
  return true;
}

// ========================
// METRICS (HISTORY)
// ========================

export async function getAthleteMetrics(athleteId: string): Promise<AthleteMetric[]> {
  const { data, error } = await supabase
    .from('athlete_metrics')
    .select('*')
    .eq('athlete_id', athleteId)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching metrics:', error);
    return [];
  }
  return data as AthleteMetric[];
}

export async function createAthleteMetric(metricData: Partial<AthleteMetric>): Promise<boolean> {
  const { error } = await supabase.from('athlete_metrics').insert([metricData]);
  if (error) {
    console.error('Error creating metric:', error);
    return false;
  }
  return true;
}

export async function deleteAthleteMetric(id: string): Promise<boolean> {
  const { error } = await supabase.from('athlete_metrics').delete().eq('id', id);
  if (error) {
    console.error('Error deleting metric:', error);
    return false;
  }
  return true;
}

// ========================
// GROUPS
// ========================
export async function getGroups(): Promise<Group[]> {
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching groups:', error);
    return [];
  }
  
  return data as Group[];
}

export async function createGroup(groupData: Partial<Group>): Promise<Group | null> {
  const { data, error } = await supabase
    .from('groups')
    .insert([groupData])
    .select()
    .single();

  if (error) {
    console.error('Error creating group:', error);
    return null;
  }
  return data as Group;
}
// ========================
// EXERCISES
// ========================

export async function getExercises(): Promise<Exercise[]> {
  const { data, error } = await supabase.from('exercises').select('*').order('name');
  if (error) {
    console.error('Error fetching exercises:', error);
    return [];
  }
  return data as Exercise[];
}

export async function createExercise(exercise: Partial<Exercise>): Promise<boolean> {
  const { error } = await supabase.from('exercises').insert([exercise]);
  if (error) {
    console.error('Error creating exercise:', error);
    return false;
  }
  return true;
}

export async function updateExercise(id: string, updates: Partial<Exercise>): Promise<boolean> {
  const { error } = await supabase.from('exercises').update(updates).eq('id', id);
  if (error) {
    console.error('Error updating exercise:', error);
    return false;
  }
  return true;
}

export async function deleteExercise(id: string): Promise<boolean> {
  const { error } = await supabase.from('exercises').delete().eq('id', id);
  if (error) {
    console.error('Error deleting exercise:', error);
    return false;
  }
  return true;
}

// ========================
// FINANCIALS
// ========================

export async function getFinancialRecords(): Promise<FinancialRecord[]> {
  const { data, error } = await supabase.from('financial_records').select(`
    *,
    athletes (full_name)
  `).order('date', { ascending: false });
  if (error) {
    console.error('Error fetching financial records:', error);
    return [];
  }
  return data as FinancialRecord[];
}

export async function createFinancialRecord(record: Partial<FinancialRecord>): Promise<boolean> {
  const { error } = await supabase.from('financial_records').insert([record]);
  if (error) {
    console.error('Error creating financial record:', error);
    return false;
  }
  return true;
}

export async function deleteAthleteMonthlyFinancialRecord(athleteId: string, description: string): Promise<boolean> {
  const { error } = await supabase.from('financial_records')
    .delete()
    .eq('athlete_id', athleteId)
    .eq('description', description);
    
  if (error) {
    console.error('Error deleting financial record:', error);
    return false;
  }
  return true;
}

export async function updateFinancialRecord(id: string, updates: Partial<FinancialRecord>): Promise<boolean> {
  const { error } = await supabase.from('financial_records').update(updates).eq('id', id);
  if (error) {
    console.error('Error updating financial record:', error);
    return false;
  }
  return true;
}

export async function deleteFinancialRecord(id: string): Promise<boolean> {
  const { error } = await supabase.from('financial_records').delete().eq('id', id);
  if (error) {
    console.error('Error deleting financial record:', error);
    return false;
  }
  return true;
}
