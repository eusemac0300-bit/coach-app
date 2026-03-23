import React, { useState } from 'react';
import { Search, UserPlus, FileText, ChevronRight } from 'lucide-react';

const AthleteRow = ({ athlete }: any) => (
  <div className="flex items-center px-8 py-6 group hover:bg-white/5 transition-all cursor-pointer">
    <div className="flex-1 flex items-center space-x-4">
      <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10 flex items-center justify-center">
        {athlete.avatar_url ? <img src={athlete.avatar_url} alt={athlete.full_name} className="w-full h-full object-cover" /> : <div className="text-white/20 text-lg font-black">{athlete.full_name[0]}</div>}
      </div>
      <div>
        <h4 className="font-bold text-xl">{athlete.full_name}</h4>
        <span className="text-white/40 text-sm font-display lowercase">{athlete.email || 'sin-email@coach.io'}</span>
      </div>
    </div>
    <div className="flex-1 text-center">
      <span className={`px-4 py-1 rounded-full text-xs font-display font-black uppercase tracking-widest ${athlete.status === 'active' ? 'bg-neon-green/20 text-neon-green' : 'bg-red-500/20 text-neon-red'}`}>
         {athlete.status}
      </span>
    </div>
    <div className="flex-1 text-center">
      <p className="text-white/40 text-xs font-display font-bold uppercase tracking-widest mb-1">Última Sesión</p>
      <p className="font-display font-black text-lg">{athlete.last_checkin || '---'}</p>
    </div>
    <div className="flex items-center space-x-4">
       <button className="p-3 bg-white/5 hover:bg-neon-blue/20 hover:text-neon-blue rounded-xl transition-all"><FileText size={18} /></button>
       <ChevronRight className="text-white/10 group-hover:text-neon-green transition-colors" />
    </div>
  </div>
);

export const Clientes = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const athletes = [
    { id: 1, full_name: "Ignacio Valdés", email: "nacho.v@gmail.com", status: "active", last_checkin: "MAR 22" },
    { id: 2, full_name: "Elena Marín", email: "elmar@outlook.com", status: "active", last_checkin: "MAR 21" },
    { id: 3, full_name: "Roberto Silva", email: "robertt@live.cl", status: "inactive", last_checkin: "FEB 28" },
    { id: 4, full_name: "Daniela Ruiz", email: "dani.ruiz@uandes.cl", status: "active", last_checkin: "HOY 10:00" },
    { id: 5, full_name: "Matias J.", email: "mat.j@icloud.com", status: "active", last_checkin: "AYER" },
  ];

  return (
    <div className="space-y-12">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-white/40 text-sm font-display font-bold uppercase tracking-wider mb-2">Comunidad</h2>
          <h1 className="text-7xl font-display font-black tracking-tighter uppercase">ATLETAS</h1>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <UserPlus size={20} fill="black" />
          <span>NUEVO ATLETA</span>
        </button>
      </header>

      {/* Filter Bar */}
      <div className="flex space-x-6 items-center">
        <div className="flex-1 glass-card flex items-center px-6 py-4 space-x-4 border-none bg-surface-high">
          <Search className="text-white/20" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nombre, email o status..." 
            className="bg-transparent border-none outline-none text-xl font-display w-full placeholder:text-white/10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2 px-6 py-4 glass-card bg-surface-high cursor-pointer hover:bg-surface-highest transition-colors">
          <span className="text-white/40 font-display font-bold text-xs">FILTRAR:</span>
          <span className="font-display font-black text-neon-green">TODOS</span>
        </div>
      </div>

      {/* Athletes List */}
      <div className="glass-card overflow-hidden border-none bg-surface-low">
        <div className="bg-surface-high/50 px-8 py-4 border-b border-white/5 flex">
          <span className="flex-1 text-white/20 font-display font-bold text-xs uppercase tracking-widest">ATLETA</span>
          <span className="flex-1 text-center text-white/20 font-display font-bold text-xs uppercase tracking-widest">ESTADO</span>
          <span className="flex-1 text-center text-white/20 font-display font-bold text-xs uppercase tracking-widest">RANGO</span>
          <span className="w-24"></span>
        </div>
        <div className="divide-y divide-white/5">
          {athletes.map(athlete => <AthleteRow key={athlete.id} athlete={athlete} />)}
        </div>
      </div>
    </div>
  );
};
