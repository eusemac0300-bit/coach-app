import { useState } from 'react';
import { Check, X, Users, Play, ChevronLeft, Save, Plus, Trash2, Zap } from 'lucide-react';

const EXERCISES = [
  "SENTADILLA (LOW BAR)", "SENTADILLA (HIGH BAR)", "PRESS BANCA", 
  "PESO MUERTO (CONVENCIONAL)", "PESO MUERTO (SUMO)", "PRESS MILITAR",
  "DOMINADAS", "REMO CON BARRA"
];

const SAVED_GROUPS = [
  { 
    id: "g1", 
    name: "Powerlifting Elite AM", 
    members: ["1", "2", "3", "4", "5"],
    days: ["LUN", "MIE", "VIE"],
    hour: "08:00"
  },
  { 
    id: "g2", 
    name: "Cuerpo y Movimiento PM", 
    members: ["4", "5"],
    days: ["MAR", "JUE"],
    hour: "19:00"
  }
];

const MOCK_ATHLETES = [
  { id: "1", name: "Ignacio Valdés", group: "Powerlifting Elite AM" },
  { id: "2", name: "Elena Marín", group: "Powerlifting Elite AM" },
  { id: "3", name: "Roberto Silva", group: "Powerlifting Elite AM" },
  { id: "4", name: "Lucía M.", group: "Multi-Group" },
  { id: "5", name: "Carlos Ruiz", group: "Multi-Group" },
];

export const SesionGrupal = () => {
  const [phase, setPhase] = useState<'attendance' | 'active'>('attendance');
  const [groupName, setGroupName] = useState("");
  const [presentMembers, setPresentMembers] = useState<string[]>([]);
  const [activeAthleteId, setActiveAthleteId] = useState<string>("");
  const [sessionsData, setSessionsData] = useState<Record<string, any>>({});

  const selectGroup = (groupId: string) => {
    const group = SAVED_GROUPS.find(g => g.id === groupId);
    if (group) {
      setGroupName(group.name);
      setPresentMembers(group.members);
    }
  };

  const toggleAttendance = (id: string) => {
    setPresentMembers(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const startSession = () => {
    if (presentMembers.length === 0) return;
    setActiveAthleteId(presentMembers[0]);
    
    // Initialize session data for each present member
    const initialData: Record<string, any> = {};
    presentMembers.forEach(id => {
      initialData[id] = {
        block1: { exercise: "", weight: "", sets: "", reps: "" },
        block2: { exercise: "", weight: "", sets: "", reps: "" },
        block3: { exercise: "", weight: "", sets: "", reps: "" },
      };
    });
    setSessionsData(initialData);
    setPhase('active');
  };

  const updateLog = (athleteId: string, block: string, field: string, value: string) => {
    setSessionsData(prev => ({
      ...prev,
      [athleteId]: {
        ...prev[athleteId],
        [block]: {
          ...prev[athleteId][block],
          [field]: value
        }
      }
    }));
  };

  if (phase === 'attendance') {
    return (
      <div className="max-w-4xl mx-auto space-y-12 py-12">
        <header className="text-center space-y-4">
          <div className="flex justify-center mb-2">
             <Users className="text-neon-green" size={48} />
          </div>
          <h1 className="text-6xl font-display font-black tracking-tighter uppercase italic -skew-x-6">
            PASAR <span className="text-neon-green">LISTA</span>
          </h1>
          <div className="flex flex-col items-center max-w-md mx-auto space-y-4">
            <div className="w-full space-y-2">
              <label className="text-[10px] text-white/60 font-display font-black uppercase tracking-widest block text-center">SELECCIONAR GRUPO GUARDADO</label>
              <select 
                onChange={(e) => selectGroup(e.target.value)}
                className="w-full bg-white/5 border-b border-white/10 py-3 font-display font-black text-xl uppercase text-center focus:border-neon-blue outline-none cursor-pointer appearance-none"
              >
                <option value="">-- PERSONALIZADO --</option>
                {SAVED_GROUPS.map(g => (
                  <option key={g.id} value={g.id}>{g.name} ({g.hour})</option>
                ))}
              </select>
            </div>
            
            <div className="w-full space-y-2">
              <label className="text-[10px] text-white/60 font-display font-black uppercase tracking-widest block text-center">NOMBRE DE LA SESIÓN</label>
              <input 
                type="text" 
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="EJ. ENTRENAMIENTO AM"
                className="bg-transparent border-b border-white/10 py-2 font-display font-black text-3xl uppercase text-center focus:border-neon-green outline-none w-full placeholder:text-white/5"
              />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MOCK_ATHLETES.map(member => {
            const isPresent = presentMembers.includes(member.id);
            return (
              <div 
                key={member.id}
                onClick={() => toggleAttendance(member.id)}
                className={`p-6 glass-card flex items-center justify-between cursor-pointer transition-all border-2 ${
                  isPresent ? 'border-neon-green/50 bg-neon-green/5' : 'border-white/5 opacity-50'
                }`}
              >
                <div className="flex items-center space-x-6">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-display font-black text-xl border-2 ${
                    isPresent ? 'border-neon-green text-neon-green bg-neon-green/10' : 'border-white/20 text-white/50 bg-white/5'
                  }`}>
                    {member.name.charAt(0)}
                  </div>
                  <span className={`text-2xl font-display font-black uppercase ${isPresent ? 'text-white' : 'text-white/60'}`}>
                    {member.name}
                  </span>
                </div>
                <div className={`w-8 h-8 rounded flex items-center justify-center ${isPresent ? 'bg-neon-green text-black' : 'bg-white/5'}`}>
                  {isPresent ? <Check size={20} strokeWidth={3} /> : <X size={20} className="text-white/30" />}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center pt-8">
          <button 
            onClick={startSession}
            disabled={presentMembers.length === 0}
            className={`flex items-center space-x-4 px-12 py-5 font-display font-black text-xl uppercase tracking-tighter transition-all italic -skew-x-12 ${
              presentMembers.length > 0 
                ? 'bg-neon-green text-black hover:scale-105 active:scale-95' 
                : 'bg-white/10 text-white/50 cursor-not-allowed'
            }`}
          >
            <Play size={24} fill="currentColor" />
            <span>INICIAR ENTRENAMIENTO ({presentMembers.length})</span>
          </button>
        </div>
      </div>
    );
  }

  const activeAthlete = MOCK_ATHLETES.find(m => m.id === activeAthleteId);

  return (
    <div className="space-y-12">
      {/* Header with Tabs */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <button onClick={() => setPhase('attendance')} className="flex items-center space-x-2 text-white/60 hover:text-white transition-colors">
            <ChevronLeft size={20} />
            <span className="font-display font-bold uppercase text-[10px] tracking-widest">VOLVER A ASISTENCIA</span>
          </button>
          <div className="flex items-center space-x-3 text-neon-green">
            <span className="font-display font-black italic uppercase -skew-x-12 tracking-tighter text-2xl">
              {activeAthlete?.name}
            </span>
            <span className="text-white/40">|</span>
            <Zap size={20} fill="currentColor" />
            <span className="font-display font-black italic uppercase -skew-x-12 tracking-tighter">SESIÓN EN VIVO</span>
          </div>
        </div>

        {/* Tabs for Active Members */}
        <div className="flex space-x-2 overflow-x-auto pb-2 border-b border-white/5">
          {presentMembers.map(id => {
            const m = MOCK_ATHLETES.find(member => member.id === id);
            const isActive = activeAthleteId === id;
            return (
              <button
                key={id}
                onClick={() => setActiveAthleteId(id)}
                className={`px-8 py-4 font-display font-black text-sm uppercase tracking-tighter transition-all whitespace-nowrap -skew-x-12 ${
                  isActive 
                    ? 'bg-neon-green text-black translate-y-1' 
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                {m?.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Blocks Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map(blockNum => {
          const blockKey = `block${blockNum}`;
          const data = sessionsData[activeAthleteId]?.[blockKey] || {};
          
          return (
            <div key={blockNum} className="glass-card flex flex-col h-full border-t-4 border-neon-blue/30">
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <span className="text-white/60 font-display font-black uppercase text-xs tracking-[0.3em]">BLOQUE {blockNum}</span>
                <span className="w-2 h-2 rounded-full bg-neon-blue shadow-[0_0_10px_#00e3fd]" />
              </div>
              
              <div className="p-8 space-y-8 flex-1">
                <div className="space-y-2">
                  <label className="text-[10px] text-white/60 font-display font-black uppercase tracking-widest">EJERCICIO</label>
                  <select 
                    value={data.exercise}
                    onChange={(e) => updateLog(activeAthleteId, blockKey, 'exercise', e.target.value)}
                    className="w-full bg-black/50 border-b-2 border-white/10 py-2 font-display font-black text-xl lg:text-2xl uppercase focus:border-neon-green transition-colors outline-none text-white appearance-none cursor-pointer" 
                  >
                    <option value="" className="bg-black text-white/20">-- SELECCIONAR --</option>
                    {EXERCISES.map(ex => (
                      <option key={ex} value={ex} className="bg-black text-white">{ex}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] text-white/60 font-display font-black uppercase tracking-widest">PESO (KG)</label>
                    <input 
                      type="text" 
                      placeholder="0.0"
                      value={data.weight}
                      onChange={(e) => updateLog(activeAthleteId, blockKey, 'weight', e.target.value)}
                      className="w-full bg-transparent border-b-2 border-white/10 py-2 font-display font-black text-4xl focus:border-neon-green transition-colors outline-none placeholder:text-white/5" 
                    />
                  </div>
                  <div className="space-y-2 text-right">
                    <label className="text-[10px] text-white/60 font-display font-black uppercase tracking-widest block">SETS X REPS</label>
                    <div className="flex items-center justify-end space-x-2">
                       <input 
                        type="text" 
                        placeholder="0"
                        value={data.sets}
                        onChange={(e) => updateLog(activeAthleteId, blockKey, 'sets', e.target.value)}
                        className="w-12 bg-transparent border-b-2 border-white/10 py-2 font-display font-black text-4xl text-center focus:border-neon-green transition-colors outline-none placeholder:text-white/5" 
                      />
                      <span className="text-white/50 text-3xl font-display font-black">X</span>
                      <input 
                        type="text" 
                        placeholder="0"
                        value={data.reps}
                        onChange={(e) => updateLog(activeAthleteId, blockKey, 'reps', e.target.value)}
                        className="w-12 bg-transparent border-b-2 border-white/10 py-2 font-display font-black text-4xl text-center focus:border-neon-green transition-colors outline-none placeholder:text-white/5" 
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button className="w-full group py-4 border border-dashed border-white/20 hover:border-white/40 transition-all flex items-center justify-center space-x-2 text-white/50 hover:text-white rounded">
                    <Plus size={16} />
                    <span className="text-[10px] font-display font-black uppercase tracking-widest">Añadir Serie</span>
                  </button>
                </div>
              </div>

              <div className="p-4 bg-white/5 flex justify-between items-center group cursor-pointer hover:bg-neon-green/10 transition-colors">
                <span className="text-[10px] font-display font-black uppercase tracking-widest text-white/50 group-hover:text-neon-green">Bloque Completado</span>
                <div className="w-6 h-6 border border-white/10 rounded group-hover:border-neon-green flex items-center justify-center transition-colors">
                   <Check size={14} className="opacity-0 group-hover:opacity-100 text-neon-green" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Actions */}
      <footer className="flex justify-between items-center pt-8 border-t border-white/5">
        <button className="flex items-center space-x-2 text-red-500/50 hover:text-red-500 transition-colors uppercase font-display font-black text-xs tracking-widest">
           <Trash2 size={16} />
           <span>CANCELAR SESIÓN</span>
        </button>
        <button className="flex items-center space-x-4 bg-neon-green text-black px-12 py-5 font-display font-black text-xl uppercase tracking-tighter italic -skew-x-12 hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(156,255,147,0.3)]">
          <Save size={24} />
          <span>GUARDAR entrenamiento</span>
        </button>
      </footer>
    </div>
  );
};
