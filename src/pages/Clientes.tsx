import { useState, useEffect } from 'react';
import { Search, UserPlus, ChevronRight, X, User, Mail, DollarSign, Calendar, Edit2, Trash2, CheckCircle2, AlertCircle, Loader2, Phone, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAthletes, createAthlete, deleteAthlete, getGroups, updateAthlete } from '../lib/api';
import type { Athlete, Group, AthleteSchedule } from '../lib/types';

const AthleteRow = ({ athlete, onEdit, onDelete, isDeleting, onCancelDelete, onConfirmDelete }: any) => {
  // Use athlete_schedules from db, fallback to empty array
  const schedules = athlete.athlete_schedules || [];
  
  return (
    <div className="glass-card hover:bg-white/5 transition-colors cursor-pointer overflow-hidden group">
      <div className="flex items-center justify-between p-3 md:p-6">
        <Link to={`/clientes/${athlete.id}`} className="flex-1 min-w-0">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 shrink-0 bg-white/5 rounded-full flex items-center justify-center font-display font-black text-xs md:text-sm border border-white/10 group-hover:border-neon-green/30 transition-colors">
              {athlete.full_name.charAt(0)}
            </div>
            <div className="min-w-0">
              <h3 className="font-display font-black text-xs md:text-sm tracking-tight uppercase truncate leading-tight">{athlete.full_name}</h3>
              <p className="text-white/40 text-[9px] md:text-[10px] font-display font-bold lowercase tracking-wider truncate">{athlete.email}</p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2 ml-10 md:ml-13 pr-4">
             <div className="flex items-center gap-2">
               <span className="text-neon-green font-display font-black text-[10px] md:text-xs">
                 ${Number(athlete.fee_per_session).toLocaleString('es-CL')}
               </span>
               <span className="text-white/20 text-[8px] md:text-[9px] font-black uppercase tracking-widest">/ sesion</span>
             </div>
             {schedules.length > 0 && (
               <div className="hidden sm:flex items-center gap-1 text-white/30 text-[9px] font-black tracking-widest uppercase">
                  <Calendar size={10} />
                  <span>{schedules.length} HORARIOS</span>
               </div>
             )}
          </div>
        </Link>

        <div className="flex items-center space-x-2 pl-4 border-l border-white/5">
          {!isDeleting ? (
            <>
              <button 
                onClick={() => onEdit(athlete)}
                className="p-2 hover:bg-neon-blue/10 text-white/50 hover:text-neon-blue transition-colors rounded"
                title="Editar Atleta"
              >
                <Edit2 size={18} />
              </button>
              <button 
                onClick={() => onDelete(athlete.id)}
                className="p-2 hover:bg-red-500/10 text-white/50 hover:text-red-500 transition-colors rounded"
                title="Eliminar Atleta"
              >
                <Trash2 size={18} />
              </button>
            </>
          ) : (
            <div className="flex items-center bg-red-500/10 rounded-lg p-1 border border-red-500/20 animate-in fade-in zoom-in duration-200">
              <button 
                onClick={() => onConfirmDelete(athlete.id)}
                className="px-3 py-1 bg-red-500 text-white text-[10px] font-display font-black uppercase tracking-widest rounded hover:bg-red-600 transition-colors mr-1"
              >
                ELIMINAR
              </button>
              <button 
                onClick={onCancelDelete}
                className="p-1 text-white/70 hover:text-white transition-colors"
                title="Cancelar"
              >
                <X size={16} />
              </button>
            </div>
          )}
          <ChevronRight className="text-white/20 group-hover:text-white transition-colors" size={20} />
        </div>
      </div>
    </div>
  );
};

export const Clientes = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorStatus, setErrorStatus] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const initialAthleteState = { 
    id: null as string | null,
    full_name: "", 
    email: "", 
    phone: "",
    medical_notes: "",
    goals: "",
    group_id: "NINGUNO", 
    schedules: [] as { day: string, hour: string }[], 
    fee_per_session: "15000",
    status: "active"
  };

  const [currentAthlete, setCurrentAthlete] = useState(initialAthleteState);
  const DAYS = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'];

  const loadData = async () => {
    setIsLoading(true);
    const [athData, grpData] = await Promise.all([getAthletes(), getGroups()]);
    setAthletes(athData);
    setGroups(grpData);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleDay = (day: string) => {
    setCurrentAthlete(prev => {
      const exists = prev.schedules.find(s => s.day === day);
      if (exists) {
        return { ...prev, schedules: prev.schedules.filter(s => s.day !== day) };
      }
      return { ...prev, schedules: [...prev.schedules, { day, hour: "10:00" }] };
    });
  };

  const updateHourForDay = (day: string, hour: string) => {
    setCurrentAthlete(prev => ({
      ...prev,
      schedules: prev.schedules.map(s => s.day === day ? { ...s, hour } : s)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentAthlete.full_name || !currentAthlete.email) {
      setErrorStatus(true);
      setTimeout(() => setErrorStatus(false), 2000);
      return;
    }

    const payload: Partial<Athlete> = {
      full_name: currentAthlete.full_name,
      email: currentAthlete.email,
      phone: currentAthlete.phone,
      medical_notes: currentAthlete.medical_notes,
      goals: currentAthlete.goals ? [currentAthlete.goals] : [], // stored as TEXT[] in db
      status: "active",
      group_id: currentAthlete.group_id === 'NINGUNO' ? undefined : currentAthlete.group_id,
      fee_per_session: Number(currentAthlete.fee_per_session) || 0
    };

    const formattedSchedules = currentAthlete.schedules.map(s => ({
      day_of_week: s.day,
      training_hour: s.hour
    }));

    if (isEditMode && currentAthlete.id) {
      // Basic update (name, phone, fee) without complex schedule diffing for now
      const success = await updateAthlete(currentAthlete.id, payload);
      if (success) {
        loadData();
      }
    } else {
      const added = await createAthlete(payload, formattedSchedules);
      if (added) {
        // Optimistic refresh
        loadData();
      }
    }

    setIsModalOpen(false);
    setIsEditMode(false);
    setCurrentAthlete(initialAthleteState);
    setErrorStatus(false);
  };

  const handleEdit = (athlete: any) => {
    setCurrentAthlete({
      ...athlete,
      phone: athlete.phone || "",
      medical_notes: athlete.medical_notes || "",
      goals: athlete.goals && athlete.goals.length > 0 ? athlete.goals[0] : "",
      group_id: athlete.group_id || 'NINGUNO',
      schedules: (athlete.athlete_schedules || []).map((s: any) => ({ day: s.day_of_week, hour: s.training_hour }))
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
  };

  const confirmDelete = async (id: string) => {
    await deleteAthlete(id);
    setAthletes(prev => prev.filter(a => a.id !== id));
    setDeletingId(null);
  };

  const filteredAthletes = athletes.filter(a => 
    a.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.email && a.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 md:space-y-12 pb-20">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-white/60 text-xs md:text-sm font-display font-bold uppercase tracking-wider mb-1 md:mb-2">Comunidad</h2>
          <h1 className="text-4xl md:text-7xl font-display font-black tracking-tighter uppercase leading-none">ATLETAS</h1>
        </div>
        <button 
          onClick={() => {
            setIsEditMode(false);
            setCurrentAthlete(initialAthleteState);
            setIsModalOpen(true);
          }}
          className="btn-primary flex items-center gap-2 px-6 py-3 md:px-8 md:py-4 transition-all hover:scale-105 active:scale-95 italic -skew-x-12 text-sm"
        >
          <UserPlus size={18} fill="black" />
          <span>NUEVO ATLETA</span>
        </button>
      </header>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 glass-card flex items-center px-4 md:px-6 py-3 md:py-4 gap-3 bg-surface-high border-none">
          <Search className="text-white/30" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nombre, email o status..." 
            className="bg-transparent border-none outline-none text-base md:text-xl font-display w-full placeholder:text-white/10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-center gap-2 px-6 py-3 glass-card bg-surface-high cursor-pointer hover:bg-surface-highest transition-colors">
          <span className="text-white/50 font-display font-bold text-[10px] tracking-widest uppercase">FILTRAR:</span>
          <span className="font-display font-black text-xs text-neon-green">TODOS</span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-12 h-12 text-neon-green animate-spin" />
        </div>
      ) : (
        <div className="glass-card overflow-hidden border-none bg-surface-low">
          <div className="hidden md:flex bg-surface-high/50 px-8 py-4 border-b border-white/5">
            <div className="flex-1 grid grid-cols-6 gap-4">
              <span className="col-span-2 text-white/50 font-display font-bold text-[10px] uppercase tracking-widest pl-14">ATLETA/MAIL</span>
              <span className="text-center text-white/50 font-display font-bold text-[10px] uppercase tracking-widest">INGRESO</span>
              <span className="col-span-2 text-white/50 font-display font-bold text-[10px] uppercase tracking-widest pl-8">CRONOGRAMA (DÍA @ HORA)</span>
              <span className="text-right text-white/50 font-display font-bold text-[10px] uppercase tracking-widest pr-14">ACCIONES / VALOR</span>
            </div>
          </div>
          <div className="divide-y divide-white/5">
            {filteredAthletes.map(athlete => (
              <AthleteRow 
                key={athlete.id} 
                athlete={athlete} 
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                isDeleting={deletingId === athlete.id}
                onCancelDelete={() => setDeletingId(null)}
                onConfirmDelete={confirmDelete}
              />
            ))}
            {filteredAthletes.length === 0 && (
              <div className="py-20 text-center space-y-4">
                <AlertCircle size={40} className="mx-auto text-white/30" />
                <p className="text-white/50 font-display font-black italic text-2xl uppercase tracking-widest">Sin resultados</p>
                <p className="text-white/30 font-display font-bold uppercase text-xs">Crea tu primer atleta o cambia el filtro</p>
              </div>
            )}
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md overflow-y-auto">
          <div className="glass-card w-full max-w-2xl p-6 md:p-10 relative overflow-hidden my-auto border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <div className={`absolute inset-0 bg-red-500/5 transition-opacity duration-300 pointer-events-none ${errorStatus ? 'opacity-100' : 'opacity-0'}`} />
            
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 md:top-6 md:right-6 text-white/30 hover:text-white transition-colors z-20 p-2"
            >
              <X size={20} />
            </button>

            <header className="mb-6 space-y-4">
              <div className="flex flex-col gap-3">
                <h2 className="text-2xl md:text-3xl font-display font-black tracking-tighter uppercase italic -skew-x-12 leading-none">
                  {isEditMode ? 'MODIFICAR' : 'ALTA DE'} <span className="text-neon-green">ATLETA</span>
                </h2>
                {isEditMode && currentAthlete.id && (
                  <Link 
                    to={`/clientes/${currentAthlete.id}`}
                    className="bg-neon-green/10 text-neon-green hover:bg-neon-green hover:text-black transition-all px-3 py-1.5 rounded-lg flex items-center gap-2 border border-neon-green/20 w-fit"
                    onClick={() => setIsModalOpen(false)}
                  >
                    <Activity size={12} />
                    <span className="font-display font-black text-[8px] uppercase tracking-widest">VER FICHA COMPLETA</span>
                  </Link>
                )}
              </div>
            </header>

            <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
                {/* Columna Izquierda: Datos Básicos */}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[8px] text-white/40 font-display font-black uppercase tracking-widest ml-1">Nombre Completo</label>
                    <div className="flex items-center gap-2 bg-white/5 border-b border-white/10 px-3 py-2 focus-within:border-neon-green transition-all">
                      <User size={14} className="text-white/30" />
                      <input 
                        required
                        type="text" 
                        className="w-full bg-transparent outline-none font-display font-black text-xs md:text-base uppercase placeholder:text-white/5"
                        value={currentAthlete.full_name}
                        onChange={(e) => setCurrentAthlete({...currentAthlete, full_name: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[8px] text-white/40 font-display font-black uppercase tracking-widest ml-1">Email</label>
                      <div className="flex items-center gap-2 bg-white/5 border-b border-white/10 px-3 py-2 focus-within:border-neon-blue transition-all">
                        <Mail size={14} className="text-white/30" />
                        <input 
                          required
                          type="email" 
                          className="w-full bg-transparent outline-none font-display font-black text-[10px] md:text-xs lowercase truncate"
                          value={currentAthlete.email}
                          onChange={(e) => setCurrentAthlete({...currentAthlete, email: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] text-white/40 font-display font-black uppercase tracking-widest ml-1">Teléfono</label>
                      <div className="flex items-center gap-2 bg-white/5 border-b border-white/10 px-3 py-2 focus-within:border-neon-blue transition-all">
                        <Phone size={14} className="text-white/30" />
                        <input 
                          type="tel" 
                          className="w-full bg-transparent outline-none font-display font-black text-[10px] md:text-xs truncate"
                          value={currentAthlete.phone}
                          onChange={(e) => setCurrentAthlete({...currentAthlete, phone: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[8px] text-neon-blue font-display font-black uppercase tracking-widest ml-1">Valor Sesión</label>
                      <div className="flex items-center gap-2 bg-white/5 border-b border-neon-blue/20 px-3 py-2">
                        <DollarSign size={14} className="text-neon-blue" />
                        <input 
                          type="text" 
                          className="w-full bg-transparent outline-none font-display font-black text-sm md:text-lg"
                          value={currentAthlete.fee_per_session}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            setCurrentAthlete({...currentAthlete, fee_per_session: val});
                          }}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] text-white/40 font-display font-black uppercase tracking-widest ml-1">Grupo</label>
                      <select 
                        className="w-full bg-white/5 border-b border-white/10 px-3 py-2 font-display font-black text-[10px] uppercase outline-none [color-scheme:dark]"
                        value={currentAthlete.group_id}
                        onChange={(e) => setCurrentAthlete({...currentAthlete, group_id: e.target.value})}
                      >
                        <option value="NINGUNO">SIN GRUPO</option>
                        {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Columna Derecha: Objetivos y Horarios */}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[8px] text-white/40 font-display font-black uppercase tracking-widest ml-1">Lesiones / Cuidados</label>
                    <textarea 
                      rows={1}
                      className="w-full bg-white/5 border border-white/10 p-2 font-display font-bold text-[10px] outline-none focus:border-neon-red placeholder:text-white/5 resize-none"
                      placeholder="NINGUNA"
                      value={currentAthlete.medical_notes}
                      onChange={(e) => setCurrentAthlete({...currentAthlete, medical_notes: e.target.value})}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] text-white/40 font-display font-black uppercase tracking-widest ml-1">Meta Principal</label>
                    <textarea 
                      rows={1}
                      className="w-full bg-white/5 border border-white/10 p-2 font-display font-bold text-[10px] outline-none focus:border-neon-green placeholder:text-white/5 resize-none"
                      placeholder="POR DEFINIR"
                      value={currentAthlete.goals}
                      onChange={(e) => setCurrentAthlete({...currentAthlete, goals: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[8px] text-white/40 font-display font-black uppercase tracking-widest ml-1">Horarios Semanales</label>
                    <div className="flex justify-between gap-1">
                      {DAYS.map(day => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDay(day)}
                          className={`flex-1 h-7 md:h-8 font-display font-black text-[8px] rounded transition-all ${
                            currentAthlete.schedules.find(s => s.day === day)
                              ? 'bg-neon-green text-black' 
                              : 'bg-white/5 text-white/30 border border-white/5'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-1 max-h-32 md:max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                      {currentAthlete.schedules.map((s) => (
                        <div key={s.day} className="flex items-center justify-between bg-white/5 p-1.5 rounded border border-white/5">
                          <span className="font-display font-black text-[9px] text-neon-green uppercase flex items-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-neon-green mr-1.5" />
                            {s.day}
                          </span>
                          <input 
                            type="time" 
                            required
                            className="bg-transparent border-none font-display font-black text-[10px] outline-none [color-scheme:dark] px-1"
                            value={s.hour}
                            onChange={(e) => updateHourForDay(s.day, e.target.value)}
                          />
                        </div>
                      ))}
                      {currentAthlete.schedules.length === 0 && (
                        <div className="py-4 text-center border border-dashed border-white/10 rounded">
                          <p className="text-[8px] font-display font-black text-white/20 uppercase tracking-widest italic">Selecciona días arriba</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                className={`w-full py-4 md:py-5 font-display font-black text-base md:text-lg uppercase italic -skew-x-12 transition-all mt-2 flex items-center justify-center gap-3 ${
                  errorStatus 
                    ? 'bg-red-500 text-white animate-shake' 
                    : 'bg-neon-green text-black hover:scale-[1.01] active:scale-95 shadow-[0_4px_20px_rgba(156,255,147,0.2)]'
                }`}
              >
                {isEditMode ? <><CheckCircle2 size={18} /><span>GUARDAR CAMBIOS</span></> : <><UserPlus size={18} fill="black" /><span>REGISTRAR ATLETA</span></>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
