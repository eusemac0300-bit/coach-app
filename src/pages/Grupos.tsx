import { useState, useEffect } from 'react';
import { Users2, Plus, Search, ChevronRight, Clock, Calendar as CalendarIcon, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getGroups, createGroup } from '../lib/api';
import type { Athlete, Group } from '../lib/types';
import { updateAthlete, getAthletes } from '../lib/api';

export const Grupos = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [availableAthletes, setAvailableAthletes] = useState<Athlete[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState<string | null>(null); // Group ID
  const [searchTerm, setSearchTerm] = useState("");
  const [newGroup, setNewGroup] = useState({
    name: "",
    training_days: [] as string[],
    training_hour: "08:00",
    fee_per_session: "",
    // temporary mock for members
    members: [] as string[]
  });

  const loadData = async () => {
    setIsLoading(true);
    const [grpData, athData] = await Promise.all([getGroups(), getAthletes()]);
    // The query in getGroups doesn't automatically join athletes right now,
    // so let's map the members manually based on the athletes data doing a quick join in memory:
    const groupsWithMembers = grpData.map(g => ({
      ...g,
      members: athData.filter(a => a.group_id === g.id).map(a => a.full_name)
    }));
    setGroups(groupsWithMembers);
    setAvailableAthletes(athData);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const DAYS = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'];

  const toggleDay = (day: string) => {
    if (newGroup.training_days.includes(day)) {
      setNewGroup({...newGroup, training_days: newGroup.training_days.filter(d => d !== day)});
    } else {
      setNewGroup({...newGroup, training_days: [...newGroup.training_days, day]});
    }
  };

  const handleAddGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // We expect fee_per_session to be converted to number for Postgres DB logic
    const groupToCreate = {
      name: newGroup.name,
      training_days: newGroup.training_days,
      training_hour: newGroup.training_hour,
      fee_per_session: Number(newGroup.fee_per_session) || 0
    };

    const inserted = await createGroup(groupToCreate);
    if (inserted) {
      setGroups([{...inserted, members: []}, ...groups]);
      setNewGroup({ name: "", training_days: [], training_hour: "08:00", fee_per_session: "", members: [] });
      setIsModalOpen(false);
    } else {
      alert("Error al crear el grupo.");
    }
  };

  const handleAddMember = async (groupId: string, athleteId: string) => {
    await updateAthlete(athleteId, { group_id: groupId });
    loadData(); // Reload groups and athletes
    setIsAddingMember(null);
    setSearchTerm("");
  };

  const handleRemoveMember = async (groupId: string, memberName: string) => {
    // Find athlete by name
    const athlete = availableAthletes.find(a => a.full_name === memberName && a.group_id === groupId);
    if (athlete) {
      await updateAthlete(athlete.id, { group_id: null });
      loadData();
    }
  };



  return (
    <div className="space-y-6 md:space-y-12 pb-20">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 md:gap-4">
        <div>
          <h2 className="text-3xl md:text-5xl font-display font-black tracking-tighter italic -skew-x-12 bg-gradient-to-r from-neon-green to-neon-blue bg-clip-text text-transparent leading-none">
            GRUPOS DE ENTRENAMIENTO
          </h2>
          <p className="text-white/40 text-[10px] md:text-xs font-display font-bold uppercase tracking-widest mt-2">Escuadras y Horarios Colectivos</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-neon-green text-black px-6 py-3 md:px-8 md:py-4 font-display font-black text-xs md:text-sm uppercase tracking-tighter italic -skew-x-12 hover:scale-105 transition-all shadow-[0_4px_20px_rgba(156,255,147,0.3)] flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span>NUEVO GRUPO</span>
        </button>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-12 h-12 text-neon-green animate-spin" />
        </div>
      ) : groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 bg-white/5 rounded-2xl border border-dashed border-white/20">
          <Users2 className="w-16 h-16 text-white/20 mb-6" />
          <h3 className="text-3xl font-display font-black tracking-tighter uppercase mb-2">SIN GRUPOS CREADOS</h3>
          <p className="text-white/50 font-bold uppercase tracking-widest text-xs mb-8">Da el primer paso para organizar tus entrenamientos colectivos</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-neon-blue text-black px-8 py-4 font-display font-black text-sm uppercase tracking-tighter italic hover:scale-105 transition-all"
          >
            CREAR MI PRIMER GRUPO
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {groups.map((group, index) => (
          <motion.div
            key={group.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:border-neon-green/30 transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-neon-green/5 blur-3xl -z-10 group-hover:bg-neon-green/10 transition-all" />
            
            <div className="flex justify-between items-start mb-4 md:mb-6">
              <div>
                <h3 className="text-lg md:text-2xl font-display font-black italic tracking-tighter group-hover:text-neon-green transition-colors uppercase leading-tight">
                  {group.name}
                </h3>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center text-white/40 text-[8px] md:text-[10px] font-bold uppercase tracking-widest">
                    <Clock className="w-2.5 h-2.5 mr-1 text-neon-blue" />
                    {group.training_hour}
                  </div>
                  <div className="flex items-center text-white/40 text-[8px] md:text-[10px] font-bold uppercase tracking-widest">
                    <CalendarIcon className="w-2.5 h-2.5 mr-1 text-neon-green" />
                    {group.training_days.join(' ')}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="bg-white/5 px-2 py-0.5 rounded text-right border border-white/5">
                  <p className="font-display font-black text-xs md:text-lg leading-none">${Number(group.fee_per_session).toLocaleString('es-CL')}</p>
                </div>
                <div className="bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                  <span className="text-neon-blue font-display font-bold text-[8px] md:text-[10px] tracking-widest uppercase">{group.members?.length || 0} ATLETAS</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] text-white/60 font-black uppercase tracking-widest">INTEGRANTES DEL GRUPO</p>
              <div className="flex flex-wrap gap-2">
                {(group.members || []).map((member: any) => (
                  <div key={member} className="group/member relative">
                    <span className="bg-white/5 border border-white/5 px-3 py-1.5 rounded-lg text-[10px] font-display font-bold text-white/60 flex items-center space-x-2">
                      <span>{member}</span>
                      <button 
                        onClick={() => handleRemoveMember(group.id, member)}
                        className="p-0.5 hover:bg-neon-red/20 hover:text-neon-red rounded transition-colors"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  </div>
                ))}
                <button 
                  onClick={() => setIsAddingMember(group.id)}
                  className="bg-neon-green/10 border border-neon-green/20 px-3 py-1.5 rounded-lg text-[10px] font-display font-bold text-neon-green hover:bg-neon-green hover:text-black transition-all"
                >
                  + AGREGAR
                </button>
              </div>

            </div>


            <button className="absolute bottom-4 right-4 text-white/20 hover:text-white transition-colors">
              <ChevronRight className="w-6 h-6" />
            </button>
          </motion.div>
        ))}
      </div>
      )}

      {/* Modal Nuevo Grupo */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-surface border border-white/10 p-8 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-3xl font-display font-black italic -skew-x-12 tracking-tighter text-neon-green">ALTA DE GRUPO</h3>
                  <p className="text-white/60 text-[10px] font-display font-bold uppercase tracking-widest">Configura una escuadra de entrenamiento</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-white/20 hover:text-white transition-colors">
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>

              <form onSubmit={handleAddGroup} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] text-white/70 font-display font-black uppercase tracking-widest">NOMBRE DEL GRUPO</label>
                  <div className="flex items-center space-x-3 bg-white/5 border border-white/10 p-4 focus-within:border-neon-green transition-all">
                    <Users2 className="w-5 h-5 text-neon-green" />
                    <input 
                      type="text" 
                      placeholder="EJ. POWERLIFTING MAÑANA"
                      className="bg-transparent border-none outline-none w-full font-display font-black text-sm uppercase"
                      value={newGroup.name}
                      onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] text-white/70 font-display font-black uppercase tracking-widest">HORARIO FIJO</label>
                    <input 
                      type="time" 
                      className="w-full bg-white/5 border border-white/10 p-4 font-display font-black text-xl focus:border-neon-green outline-none [color-scheme:dark]"
                      value={newGroup.training_hour}
                      onChange={(e) => setNewGroup({...newGroup, training_hour: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-white/70 font-display font-black uppercase tracking-widest text-neon-blue">VALOR REBAJADO POR SESIÓN</label>
                    <div className="flex bg-white/5 border border-white/10 focus-within:border-neon-blue transition-all">
                      <span className="p-4 font-display font-black text-xl text-white/50">$</span>
                      <input 
                        type="text" 
                        placeholder="10000"
                        className="bg-transparent border-none outline-none w-full font-display font-black text-xl"
                        value={newGroup.fee_per_session}
                        onChange={(e) => setNewGroup({...newGroup, fee_per_session: e.target.value.replace(/\D/g, "")})}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] text-white/40 font-display font-black uppercase tracking-widest text-neon-blue">DÍAS DE SEMANA</label>
                  <div className="flex justify-between">
                    {DAYS.map(day => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`w-10 h-10 font-display font-bold text-[10px] rounded transition-all ${
                          newGroup.training_days.includes(day) 
                            ? 'bg-neon-blue text-black scale-110 shadow-[0_0_15px_rgba(0,210,255,0.4)]' 
                            : 'bg-white/5 text-white/40 border border-white/5'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-neon-green text-black py-6 font-display font-black text-xl uppercase tracking-tighter italic -skew-x-12 hover:scale-[1.02] active:scale-95 transition-all mt-4 shadow-[0_0_30px_rgba(156,255,147,0.2)]"
                >
                  CREAR GRUPO
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Selector de Atletas */}
      <AnimatePresence>
        {isAddingMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingMember(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-surface border border-white/10 p-8 rounded-3xl"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-display font-black italic -skew-x-12 tracking-tighter text-neon-blue">AÑADIR ATLETA AL GRUPO</h3>
                  <p className="text-white/70 text-[10px] font-display font-bold uppercase tracking-widest">Busca y selecciona un atleta</p>
                </div>
                <button onClick={() => setIsAddingMember(null)} className="text-white/20 hover:text-white transition-colors">
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input 
                    type="text" 
                    placeholder="BUSCAR ATLETA..."
                    className="w-full bg-white/5 border border-white/10 p-4 pl-12 font-display font-black text-xs outline-none focus:border-neon-blue transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {availableAthletes
                    .filter(a => a.full_name.toLowerCase().includes(searchTerm.toLowerCase()) && a.group_id !== isAddingMember)
                    .map(athlete => (
                    <button
                      key={athlete.id}
                      onClick={() => handleAddMember(isAddingMember, athlete.id)}
                      className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-neon-blue/10 border border-white/5 hover:border-neon-blue/30 transition-all rounded-xl group"
                    >
                      <div>
                        <span className="font-display font-bold text-xs text-white/80 group-hover:text-white uppercase block text-left">{athlete.full_name}</span>
                        {athlete.group_id && <span className="text-[9px] text-white/40 block text-left mt-1">Actualmente en otro grupo</span>}
                      </div>
                      <Plus className="w-4 h-4 text-neon-blue opacity-0 group-hover:opacity-100 transition-all" />
                    </button>
                  ))}
                  {availableAthletes.filter(a => a.full_name.toLowerCase().includes(searchTerm.toLowerCase()) && a.group_id !== isAddingMember).length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-white/20 font-display font-bold text-xs italic">No hay más atletas disponibles</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

