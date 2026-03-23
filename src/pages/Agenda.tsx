import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

const SessionItem = ({ session }: any) => {
  const isNow = session.time === "17:30"; // Simulating current time in Chile
  return (
    <div className={`relative flex items-start space-x-6 p-6 group transition-all ${isNow ? 'bg-neon-green/10 border-l-4 border-neon-green' : 'hover:bg-white/5 border-l-4 border-transparent'}`}>
      <div className="w-24 text-right">
        <p className={`font-display font-black text-2xl leading-none ${isNow ? 'text-neon-green animate-pulse' : 'text-white/40'}`}>
          {session.time}
        </p>
        <span className="text-white/20 text-xs font-bold font-display uppercase tracking-widest leading-none">PM</span>
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-2xl mb-1">{session.athlete}</h4>
        <div className="flex items-center space-x-4">
           <div className="flex items-center space-x-1 text-white/40 text-sm font-display lowercase bg-white/5 px-3 py-1 rounded-full">
              <Clock size={12} />
              <span>{session.duration} MIN</span>
           </div>
           <span className="text-xs font-display font-black uppercase tracking-widest text-neon-blue">{session.type}</span>
        </div>
      </div>
      <div className="text-right">
        <div className="text-white/20 text-xs font-display font-bold uppercase tracking-widest mb-2">Estado</div>
        <p className={`font-display font-black tracking-tight ${session.status === 'completed' ? 'text-white/40' : 'text-neon-green'}`}>
          {session.status === 'completed' ? 'FINALIZADO' : 'PROGRAMADO'}
        </p>
      </div>
    </div>
  );
};

export const Agenda = () => {
  const [selectedDay, setSelectedDay] = useState(23); // MAR 23 (Current)
  
  const days = [
    { name: "LUN", num: 22, active: false },
    { name: "MAR", num: 23, active: true },
    { name: "MIE", num: 24, active: false },
    { name: "JUE", num: 25, active: false },
    { name: "VIE", num: 26, active: false },
    { name: "SAB", num: 27, active: false },
    { name: "DOM", num: 28, active: false },
  ];

  const sessions = [
    { id: 1, time: "09:00", athlete: "Matias J.", duration: 60, type: "Powerlifting", status: "completed" },
    { id: 2, time: "10:30", athlete: "Daniela Ruiz", duration: 45, type: "Cardio HI", status: "completed" },
    { id: 3, time: "16:00", athlete: "Ignacio Valdés", duration: 60, type: "Fuerza Intensa", status: "completed" },
    { id: 4, time: "17:30", athlete: "Lucía M.", duration: 45, type: "Evaluación", status: "scheduled" },
    { id: 5, time: "19:00", athlete: "Roberto Silva", duration: 90, type: "Endurance", status: "scheduled" },
    { id: 6, time: "20:30", athlete: "Elena Marín", duration: 60, type: "Flexibilidad", status: "scheduled" },
  ];

  return (
    <div className="space-y-12">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-white/40 text-sm font-display font-bold uppercase tracking-wider mb-2">Cronograma</h2>
          <h1 className="text-7xl font-display font-black tracking-tighter uppercase whitespace-pre">MARZO 2026</h1>
        </div>
        <div className="flex items-center space-x-6">
           <div className="flex space-x-2 border border-white/10 rounded-full p-2">
             <button className="p-2 hover:bg-white/5 rounded-full"><ChevronLeft size={20} /></button>
             <button className="p-2 hover:bg-white/5 rounded-full"><ChevronRight size={20} /></button>
           </div>
           <button className="btn-primary group flex items-center space-x-2">
             <Plus size={20} fill="black" />
             <span>PROGRAMAR</span>
           </button>
        </div>
      </header>

      {/* Week Selector */}
      <div className="grid grid-cols-7 gap-4">
        {days.map(day => (
           <div 
             key={day.num} 
             onClick={() => setSelectedDay(day.num)}
             className={`p-6 cursor-pointer rounded-2xl transition-all border-none ${day.num === selectedDay ? 'bg-neon-green text-black scale-105 shadow-[0_0_30px_rgba(156,255,147,0.3)]' : 'bg-surface-high text-white hover:bg-surface-highest hover:translate-y-[-4px]'}`}
           >
             <p className={`font-display font-bold text-xs uppercase tracking-widest mb-2 ${day.num === selectedDay ? 'text-black/60' : 'text-white/20'}`}>{day.name}</p>
             <p className="text-4xl font-display font-black italic transform -skew-x-12">{day.num}</p>
           </div>
        ))}
      </div>

      {/* Daily Sessions List */}
      <div className="glass-card bg-surface-low border-none overflow-hidden">
        <div className="bg-surface-high/50 px-8 py-10 border-b border-white/5 flex items-center justify-between">
           <div className="flex items-baseline space-x-4">
              <span className="text-6xl font-display font-black tracking-tighter">MARTES 23</span>
              <span className="text-neon-green font-display font-bold uppercase tracking-widest text-sm">— HOY —</span>
           </div>
           <div className="flex items-center space-x-2 text-white/40 font-display font-bold text-xs uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full">
              <CalendarIcon size={14} />
              <span>{sessions.length} SESIONES</span>
           </div>
        </div>
        <div className="divide-y divide-white/5">
          {sessions.map(sess => <SessionItem key={sess.id} session={sess} />)}
        </div>
      </div>
    </div>
  );
};
