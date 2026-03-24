import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Plus, Users, CheckCircle2, Play, UserCheck, Calendar, X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAthletes } from '../lib/api';
import { supabase } from '../lib/supabase';
import type { Athlete, AthleteSchedule } from '../lib/types';

const SessionItem = ({ session, onStart, selectedDate, dbAttendances, setDbAttendances }: any) => {
  const isNow = session.time === "08:00" || session.time === "10:00"; // Simulating current sessions
  const [isReprogramming, setIsReprogramming] = useState(false);
  const [newTime, setNewTime] = useState(session.time);
  const [newDay, setNewDay] = useState("MAR");
  const [isUpdating, setIsUpdating] = useState(false);

  // Check if each attendee is present in the DB for this day
  const getIsAttending = (athleteId: string) => {
    return dbAttendances.some((a: any) => a.athlete_id === athleteId && a.status === 'present');
  };

  const toggleAttendance = async (athlete: {name: string, id: string}) => {
    setIsUpdating(true);
    const currentlyAttending = getIsAttending(athlete.id);
    
    // Rango del día seleccionado
    const start = new Date(selectedDate);
    start.setHours(0,0,0,0);
    const end = new Date(selectedDate);
    end.setHours(23,59,59,999);

    if (currentlyAttending) {
      // Remover
      await supabase.from('session_attendance').delete()
          .eq('athlete_id', athlete.id)
          .gte('created_at', start.toISOString())
          .lte('created_at', end.toISOString());
          
      // update local
      setDbAttendances((prev: any) => prev.filter((a: any) => !(a.athlete_id === athlete.id && new Date(a.created_at) >= start && new Date(a.created_at) <= end)));
    } else {
      // Añadir
      const { data } = await supabase.from('session_attendance').insert({
         athlete_id: athlete.id,
         status: 'present',
         notes: session.group || 'Individual',
         created_at: start.toISOString() // Usamos el inicio del día del calendario como marca de tiempo
      }).select().single();
      
      if (data) {
        setDbAttendances((prev: any) => [...prev, data]);
      }
    }
    setIsUpdating(false);
  };

  const handleReprogram = () => {
    // In a real app, this would update the backend/state
    alert(`Sesión de ${session.athlete} reprogramada para el ${newDay} a las ${newTime}`);
    setIsReprogramming(false);
  };

  return (
    <div className={`relative flex flex-col group transition-all border-l-4 ${isNow ? 'bg-neon-green/5 border-neon-green' : 'hover:bg-white/5 border-transparent'}`}>
      <div className="flex items-start gap-3 p-4 md:p-8">
        {/* Hora */}
        <div className="w-14 md:w-24 text-right shrink-0">
          <p className={`font-display font-black text-xl md:text-3xl leading-none ${isNow ? 'text-neon-green animate-pulse' : 'text-white/40'}`}>
            {session.time}
          </p>
          <span className="text-white/40 text-[9px] font-bold font-display uppercase tracking-widest">
            {parseInt(session.time.split(':')[0]) < 12 ? 'AM' : 'PM'}
          </span>
        </div>

        {/* Contenido principal */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h4 className="font-display font-black text-base md:text-3xl uppercase tracking-tighter italic -skew-x-12 truncate">{session.athlete}</h4>
            {session.group && (
              <span className="bg-neon-blue/10 text-neon-blue text-[9px] font-display font-black px-2 py-0.5 rounded-full border border-neon-blue/20 uppercase tracking-widest flex items-center">
                <Users size={10} className="mr-1" />{session.group}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 text-white/40 text-[9px] font-display font-black uppercase tracking-widest bg-white/5 px-2 py-1 rounded-full">
              <Clock size={10} />
              <span>{session.duration} MIN</span>
            </div>
            <span className="text-[9px] font-display font-black uppercase tracking-widest text-neon-blue/60">{session.type}</span>
          </div>
        </div>

        {/* Acciones - stacked on mobile */}
        <div className="flex flex-col md:flex-row items-end md:items-center gap-2 shrink-0">
          <button 
            onClick={() => setIsReprogramming(true)}
            className="p-2 md:p-4 bg-white/10 text-white/60 rounded-xl hover:bg-white/20 hover:text-white transition-all flex flex-col items-center"
            title="Reprogramar"
          >
            <CalendarIcon size={14} />
            <span className="text-[7px] font-black uppercase tracking-widest hidden md:block">Mover</span>
          </button>
          <button 
            onClick={() => onStart(session.id, session.group ? 'grupo' : 'atleta')}
            className={`flex items-center gap-1 px-3 md:px-8 py-2 md:py-4 font-display font-black text-xs uppercase italic -skew-x-12 transition-all ${
              isNow 
              ? 'bg-neon-green text-black hover:scale-110 shadow-[0_10px_30px_rgba(156,255,147,0.3)]' 
              : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
            }`}
          >
            <Play size={14} fill={isNow ? "black" : "currentColor"} />
            <span>ENTRAR</span>
          </button>
        </div>
      </div>

      {session.attendees.length > 0 && (
        <div className="px-4 md:px-32 pb-4 md:pb-8 flex flex-col space-y-3">
          <div className="flex items-center space-x-2">
            <UserCheck size={14} className="text-white/30" />
            <span className="text-[9px] font-display font-black text-white/50 uppercase tracking-widest">Asistencia:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {session.attendees.map((a: any) => {
              const isPresent = getIsAttending(a.id);
              return (
                <button 
                  key={a.id} 
                  disabled={isUpdating}
                  onClick={() => toggleAttendance(a)}
                  className={`flex items-center gap-2 px-3 md:px-6 py-2 md:py-3 rounded-xl font-display font-black text-[9px] uppercase tracking-wider border-2 transition-all ${
                    isPresent 
                    ? 'bg-neon-green text-black border-neon-green shadow-[0_0_20px_rgba(156,255,147,0.3)]' 
                    : 'bg-white/10 border-white/10 text-white/50 hover:border-white/30'
                  } ${isUpdating ? 'opacity-50 cursor-wait' : ''}`}
                >
                  {isPresent ? <CheckCircle2 size={12} /> : <div className="w-3 h-3 rounded-full border border-current opacity-20" />}
                  <span>{a.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Reprogramming Modal */}
      {isReprogramming && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-6">
          <div className="bg-surface-high border border-white/10 p-12 rounded-[40px] max-w-lg w-full space-y-8 animate-in zoom-in duration-300">
             <div className="flex justify-between items-center">
               <h3 className="text-4xl font-display font-black italic -skew-x-12 uppercase">Reprogramar</h3>
               <button onClick={() => setIsReprogramming(false)} className="text-white/40 hover:text-white"><X size={24} /></button>
             </div>

             <div className="space-y-6">
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">Nuevo Día</label>
                 <div className="grid grid-cols-4 gap-2">
                    {["LUN", "MAR", "MIE", "JUE", "VIE", "SAB"].map(d => (
                      <button 
                        key={d}
                        onClick={() => setNewDay(d)}
                        className={`py-3 rounded-xl font-display font-black text-sm uppercase border-2 transition-all ${newDay === d ? 'bg-neon-blue text-black border-neon-blue' : 'bg-white/5 border-transparent text-white/20 hover:border-white/10'}`}
                      >
                        {d}
                      </button>
                    ))}
                 </div>
               </div>

               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">Nueva Hora</label>
                 <input 
                   type="time" 
                   value={newTime}
                   onChange={(e) => setNewTime(e.target.value)}
                   className="w-full bg-white/5 border-2 border-white/5 rounded-2xl p-6 font-display font-black text-3xl text-neon-blue outline-none focus:border-neon-blue" 
                 />
               </div>
             </div>

             <button 
               onClick={handleReprogram}
               className="w-full bg-neon-blue text-black py-6 rounded-2xl font-display font-black text-xl uppercase italic -skew-x-12 hover:scale-105 transition-all shadow-[0_10px_40px_rgba(0,243,255,0.2)]"
             >
               CONFIRMAR CAMBIO
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const Agenda = () => {
  const navigate = useNavigate();
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [selectedDateISO, setSelectedDateISO] = useState(today.toISOString());
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [dbAttendances, setDbAttendances] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const days = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const dayNames = ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'];
    return {
      dateObj: d,
      name: dayNames[d.getDay()],
      num: d.getDate(),
      iso: d.toISOString()
    };
  });

  const selectedDayObj = days.find(d => d.iso === selectedDateISO) || days[0];
  const selectedDayName = selectedDayObj.name;
  const isToday = selectedDayObj.iso === today.toISOString();

  const monthNames = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];
  const currentMonthStr = `${monthNames[selectedDayObj.dateObj.getMonth()]} ${selectedDayObj.dateObj.getFullYear()}`;

  const loadData = async () => {
    setIsLoading(true);
    const data = await getAthletes();
    setAthletes(data);
    await loadAttendances(selectedDateISO);
    setIsLoading(false);
  };

  const loadAttendances = async (isoDate: string) => {
    const start = new Date(isoDate); start.setHours(0,0,0,0);
    const end = new Date(isoDate); end.setHours(23,59,59,999);
    
    const { data } = await supabase.from('session_attendance')
      .select('*')
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString());
    
    setDbAttendances(data || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!isLoading) {
       loadAttendances(selectedDateISO);
    }
  }, [selectedDateISO]);

  const sessionsByDay = athletes.reduce((acc: any[], athlete) => {
    const schedules = athlete.athlete_schedules || [];
    const dailySchedule = schedules.find((s: AthleteSchedule) => s.day_of_week === selectedDayName);
    
    if (dailySchedule) {
      const groupName = athlete.groups?.name || "";
      const existing = acc.find(s => 
        s.time === dailySchedule.training_hour && 
        ((s.group && s.group === groupName) || (!s.group && !groupName && s.athlete === athlete.full_name))
      );
      
      if (existing) {
        if (!existing.attendees.find((a: any) => a.id === athlete.id)) {
          existing.attendees.push({ name: athlete.full_name, id: athlete.id });
        }
      } else {
        const isGroup = !!groupName;
        // Check if there are other athletes in this group with this schedule (only relevant for naming)
        const peerCount = isGroup ? athletes.filter(a => a.group_id === athlete.group_id).length : 0;
        
        acc.push({
          id: athlete.id.toString(),
          time: dailySchedule.training_hour,
          group: groupName,
          athlete: (isGroup && peerCount > 1) ? groupName : athlete.full_name,
          attendees: [{ name: athlete.full_name, id: athlete.id }],
          duration: 60,
          type: isGroup ? "Entrenamiento Grupal" : "Personalizado",
          status: "scheduled"
        });
      }
    }
    return acc;
  }, [])
  .sort((a, b) => a.time.localeCompare(b.time));

  const handleStartSession = (id: string, type: string) => {
    navigate(`/entrenamiento/${type}/${id}`);
  };

  return (
    <div className="space-y-6 md:space-y-12 pb-20">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
        <div>
          <h2 className="text-white/60 text-xs font-display font-bold uppercase tracking-wider mb-1">Cronograma</h2>
          <h1 className="text-3xl md:text-7xl font-display font-black tracking-tighter uppercase">{currentMonthStr}</h1>
        </div>
        <button className="btn-primary group flex items-center space-x-2 italic -skew-x-12 text-sm">
          <Plus size={16} fill="black" />
          <span>PROGRAMAR</span>
        </button>
      </header>

      {/* Date Selector — scrollable on mobile */}
      <div className="flex overflow-x-auto gap-2 pb-2 md:grid md:grid-cols-7 md:gap-4 scrollbar-hide">
        {days.map(day => (
           <div 
             key={day.iso} 
             onClick={() => setSelectedDateISO(day.iso)}
             className={`shrink-0 w-14 md:w-auto p-3 md:p-6 cursor-pointer rounded-xl md:rounded-2xl transition-all border-none text-center ${
               day.iso === selectedDateISO 
               ? 'bg-neon-green text-black scale-105 shadow-[0_0_20px_rgba(156,255,147,0.3)]' 
               : 'bg-surface-high text-white hover:bg-surface-highest'
             }`}
           >
             <p className={`font-display font-bold text-[9px] uppercase tracking-widest mb-1 ${day.iso === selectedDateISO ? 'text-black/60' : 'text-white/50'}`}>{day.name}</p>
             <p className="text-xl md:text-4xl font-display font-black italic -skew-x-12">{day.num}</p>
           </div>
        ))}
      </div>

      {/* Daily Sessions List */}
      <div className="glass-card bg-surface-low border-none overflow-hidden">
          <div className="bg-surface-high/50 px-4 md:px-8 py-5 md:py-10 border-b border-white/5 flex items-center justify-between gap-2">
           <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-2xl md:text-6xl font-display font-black tracking-tighter uppercase">{selectedDayName} {selectedDayObj.num}</span>
              {isToday && <span className="text-neon-green font-display font-bold uppercase tracking-widest text-xs">HOY</span>}
           </div>
            <div className="flex items-center gap-1 text-white/60 font-display font-bold text-[10px] uppercase tracking-wider bg-white/10 px-3 py-1.5 rounded-full shrink-0">
              <CalendarIcon size={12} />
              <span>{sessionsByDay.length} SES.</span>
           </div>
        </div>
        <div className="divide-y divide-white/5">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-12 h-12 text-neon-green animate-spin" />
            </div>
          ) : sessionsByDay.length > 0 ? (
            sessionsByDay.map(sess => (
              <SessionItem key={sess.id} session={sess} onStart={handleStartSession} selectedDate={selectedDateISO} dbAttendances={dbAttendances} setDbAttendances={setDbAttendances} />
            ))
          ) : (
            <div className="py-24 text-center space-y-4">
              <Clock size={48} className="mx-auto text-white/5" />
              <p className="text-white/20 font-display font-black italic text-2xl uppercase tracking-widest">Sin entrenamientos para este día</p>
              <p className="text-white/10 font-display font-bold text-xs uppercase">({selectedDayName} {selectedDayObj.num} de {monthNames[selectedDayObj.dateObj.getMonth()]})</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
