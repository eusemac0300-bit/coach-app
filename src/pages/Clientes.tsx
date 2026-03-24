import { useState, useEffect } from 'react';
import { Search, UserPlus, ChevronRight, X, User, Mail, DollarSign, Calendar, Edit2, Trash2, CheckCircle2, AlertCircle, Loader2, Phone, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAthletes, createAthlete, deleteAthlete, getGroups, updateAthlete } from '../lib/api';
import type { Athlete, Group, AthleteSchedule } from '../lib/types';

const AthleteRow = ({ athlete, onEdit, onDelete, isDeleting, onCancelDelete, onConfirmDelete }: any) => {
  // Use athlete_schedules from db, fallback to empty array
  const schedules = athlete.athlete_schedules || [];
  
  return (
    <div className="glass-card hover:translate-x-1 transition-transform cursor-pointer overflow-hidden group">
      <div className="flex items-center justify-between p-4 md:p-6">
        <Link to={`/clientes/${athlete.id}`} className="flex-1 min-w-0">
          {/* Mobile: vertical stack. Desktop: horizontal grid */}
          <div className="flex items-center gap-3 mb-3 md:mb-0">
            <div className="w-10 h-10 shrink-0 bg-white/5 rounded-full flex items-center justify-center font-display font-black text-sm border border-white/10 group-hover:border-neon-green/30 transition-colors">
              {athlete.full_name.charAt(0)}
            </div>
            <div className="min-w-0">
              <h3 className="font-display font-black text-sm tracking-tight uppercase truncate">{athlete.full_name}</h3>
              <p className="text-white/60 text-[10px] font-display font-bold lowercase tracking-wider truncate">{athlete.email}</p>
            </div>
          </div>

          {/* Extra info row - hidden on very small, visible on sm+ */}
          <div className="hidden sm:flex items-center gap-4 mt-2 ml-13">
            <div>
              <p className="text-white/50 text-[9px] font-display font-black uppercase tracking-widest">Ingreso</p>
              <p className="font-display font-bold text-xs">{athlete.join_date}</p>
            </div>
            <div className="ml-auto">
              <p className="text-white/50 text-[9px] font-display font-black uppercase tracking-widest">Valor/Sesión</p>
              <p className="font-display font-black text-sm text-white">${Number(athlete.fee_per_session).toLocaleString('es-CL')}</p>
            </div>
          </div>

          {/* Mobile price badge */}
          <div className="sm:hidden flex items-center justify-between mt-1 ml-13">
            <span className="text-neon-green font-display font-black text-xs">${Number(athlete.fee_per_session).toLocaleString('es-CL')}/sesión</span>
            {schedules.length > 0 && <span className="text-white/40 text-[9px]">{schedules.length} horario{schedules.length>1?'s':''}</span>}
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
    <div className="space-y-12 pb-20">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-white/70 text-sm font-display font-bold uppercase tracking-wider mb-2">Comunidad</h2>
          <h1 className="text-7xl font-display font-black tracking-tighter uppercase">ATLETAS</h1>
        </div>
        <button 
          onClick={() => {
            setIsEditMode(false);
            setCurrentAthlete(initialAthleteState);
            setIsModalOpen(true);
          }}
          className="btn-primary flex items-center space-x-2 transition-all hover:scale-105 active:scale-95 italic -skew-x-12"
        >
          <UserPlus size={20} fill="black" />
          <span>NUEVO ATLETA</span>
        </button>
      </header>

      {/* Filter Bar */}
      <div className="flex space-x-6 items-center">
        <div className="flex-1 glass-card flex items-center px-6 py-4 space-x-4 border-none bg-surface-high">
          <Search className="text-white/40" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nombre, email o status..." 
            className="bg-transparent border-none outline-none text-xl font-display w-full placeholder:text-white/10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2 px-6 py-4 glass-card bg-surface-high cursor-pointer hover:bg-surface-highest transition-colors">
          <span className="text-white/70 font-display font-bold text-xs">FILTRAR:</span>
          <span className="font-display font-black text-neon-green">TODOS</span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-12 h-12 text-neon-green animate-spin" />
        </div>
      ) : (
        <div className="glass-card overflow-hidden border-none bg-surface-low">
          <div className="bg-surface-high/50 px-8 py-4 border-b border-white/5 flex">
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

      {/* New/Edit Athlete Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="glass-card w-full max-w-2xl p-10 relative overflow-hidden my-auto border-none">
            <div className={`absolute inset-0 bg-red-500/10 transition-opacity duration-300 pointer-events-none ${errorStatus ? 'opacity-100' : 'opacity-0'}`} />
            <div className="absolute top-0 right-0 w-32 h-32 bg-neon-green/10 blur-3xl -z-10" />
            
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-white/20 hover:text-white transition-colors z-10"
            >
              <X size={24} />
            </button>

            <header className="mb-6 space-y-2">
              <div className="flex justify-between items-start">
                <h2 className="text-4xl font-display font-black tracking-tighter uppercase italic -skew-x-12">
                  {isEditMode ? 'MODIFICAR' : 'ALTA DE'} <span className="text-neon-green">ATLETA</span>
                </h2>
                {isEditMode && currentAthlete.id && (
                  <Link 
                    to={`/clientes/${currentAthlete.id}`}
                    className="bg-neon-green/20 text-neon-green hover:bg-neon-green hover:text-black transition-all px-4 py-2 rounded-xl flex items-center space-x-2 border border-neon-green/30 shadow-[0_0_15px_rgba(156,255,147,0.1)]"
                    onClick={() => setIsModalOpen(false)}
                  >
                    <Activity size={16} />
                    <span className="font-display font-black text-[10px] uppercase tracking-widest whitespace-nowrap">Historial y Medidas Físicas</span>
                  </Link>
                )}
              </div>
              {errorStatus && (
                <p className="text-red-500 font-display font-bold text-[10px] uppercase tracking-widest animate-pulse">
                  Completa todos los campos requeridos
                </p>
              )}
            </header>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] text-white/70 font-display font-black uppercase tracking-widest">Nombre Completo</label>
                    <div className="flex items-center space-x-4 bg-white/5 border-b-2 border-white/10 p-4 focus-within:bg-white/10 focus-within:border-neon-green transition-all">
                      <User size={18} className="text-white/50" />
                      <input 
                        required
                        type="text" 
                        className="w-full bg-transparent outline-none font-display font-black text-xl uppercase placeholder:text-white/5"
                        value={currentAthlete.full_name}
                        onChange={(e) => setCurrentAthlete({...currentAthlete, full_name: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] text-white/70 font-display font-black uppercase tracking-widest">Email de Contacto</label>
                    <div className="flex items-center space-x-4 bg-white/5 border-b-2 border-white/10 p-4 focus-within:bg-white/10 focus-within:border-neon-blue transition-all">
                      <Mail size={18} className="text-white/50" />
                      <input 
                        required
                        type="email" 
                        className="w-full bg-transparent outline-none font-display font-black text-lg uppercase placeholder:text-white/5"
                        value={currentAthlete.email}
                        onChange={(e) => setCurrentAthlete({...currentAthlete, email: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-white/70 font-display font-black uppercase tracking-widest">Teléfono (WhatsApp)</label>
                    <div className="flex items-center space-x-4 bg-white/5 border-b-2 border-white/10 p-4 focus-within:bg-white/10 focus-within:border-neon-blue transition-all">
                      <Phone size={18} className="text-white/50" />
                      <input 
                        type="tel" 
                        placeholder="+56 9 1234 5678"
                        className="w-full bg-transparent outline-none font-display font-black text-lg placeholder:text-white/5"
                        value={currentAthlete.phone}
                        onChange={(e) => setCurrentAthlete({...currentAthlete, phone: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] text-white/70 font-display font-black uppercase tracking-widest">Lesiones Previas o Cuidados</label>
                    <textarea 
                      placeholder="Ej. Lesión en rodilla derecha..."
                      rows={2}
                      className="w-full bg-white/5 border-b-2 border-white/10 p-4 font-display font-bold text-sm outline-none focus:bg-white/10 focus:border-neon-red placeholder:text-white/20 transition-all custom-scrollbar"
                      value={currentAthlete.medical_notes}
                      onChange={(e) => setCurrentAthlete({...currentAthlete, medical_notes: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] text-white/70 font-display font-black uppercase tracking-widest">Meta a alcanzar</label>
                    <textarea 
                      placeholder="Ej. Bajar porcentaje de grasa y ganar hipertrofia..."
                      rows={2}
                      className="w-full bg-white/5 border-b-2 border-white/10 p-4 font-display font-bold text-sm outline-none focus:bg-white/10 focus:border-neon-green placeholder:text-white/20 transition-all custom-scrollbar"
                      value={currentAthlete.goals}
                      onChange={(e) => setCurrentAthlete({...currentAthlete, goals: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] text-white/70 font-display font-black uppercase tracking-widest text-neon-blue">VALOR PACTADO POR SESIÓN</label>
                    <div className="flex items-center space-x-4 border-b-2 border-neon-blue/30 focus-within:border-neon-blue transition-colors pb-2">
                      <DollarSign size={24} className="text-neon-blue" />
                      <input 
                        type="text" 
                        className="w-full bg-transparent outline-none font-display font-black text-2xl"
                        value={currentAthlete.fee_per_session}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          setCurrentAthlete({...currentAthlete, fee_per_session: val});
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] text-white/70 font-display font-black uppercase tracking-widest">GRUPO DE PERTENENCIA</label>
                    <select 
                      className="w-full bg-white/5 border-2 border-white/10 p-4 font-display font-black text-sm uppercase focus:border-neon-green outline-none [color-scheme:dark]"
                      value={currentAthlete.group_id}
                      onChange={(e) => setCurrentAthlete({...currentAthlete, group_id: e.target.value})}
                    >
                      <option value="NINGUNO">NINGUNO (ENTRENO LIBRE)</option>
                      {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-6">
                  <label className="text-[10px] text-white/70 font-display font-black uppercase tracking-widest">DÍAS Y HORARIOS ESPECIALES</label>
                  <p className="text-[10px] text-white/40 uppercase italic -mt-4">Si pertenece a un grupo, puede heredar su horario.</p>
                  <div className="flex justify-between mb-4">
                    {DAYS.map(day => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`w-9 h-9 font-display font-bold text-[10px] rounded transition-all ${
                          currentAthlete.schedules.find(s => s.day === day)
                            ? 'bg-neon-green text-black scale-110' 
                            : 'bg-white/5 text-white/70 border border-white/5 hover:border-white/20'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-4 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {currentAthlete.schedules.map((s) => (
                      <div key={s.day} className="flex items-center justify-between bg-white/5 p-3 rounded border border-white/5 hover:border-white/20 transition-colors">
                        <span className="font-display font-black text-neon-green uppercase flex items-center">
                          <Calendar size={12} className="mr-2" />
                          {s.day}
                        </span>
                        <input 
                          type="time" 
                          required
                          className="bg-transparent border-b border-white/20 font-display font-bold text-lg outline-none [color-scheme:dark] hover:border-neon-blue transition-colors"
                          value={s.hour}
                          onChange={(e) => updateHourForDay(s.day, e.target.value)}
                        />
                      </div>
                    ))}
                    {currentAthlete.schedules.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-8 text-white/10 space-y-2 border-2 border-dashed border-white/5 rounded">
                        <Calendar size={24} />
                        <p className="text-[10px] font-display font-black uppercase tracking-widest">Selecciona días arriba</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                className={`w-full py-6 font-display font-black text-xl uppercase italic -skew-x-12 transition-all mt-4 flex items-center justify-center space-x-3 ${
                  errorStatus 
                    ? 'bg-red-500 text-white animate-shake' 
                    : 'bg-neon-green text-black hover:scale-[1.02] active:scale-95 shadow-[0_10px_30px_rgba(156,255,147,0.2)]'
                }`}
              >
                {isEditMode ? (
                  <>
                    <CheckCircle2 size={24} />
                    <span>GUARDAR CAMBIOS (N/A)</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={24} fill="black" />
                    <span>REGISTRAR ATLETA</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
