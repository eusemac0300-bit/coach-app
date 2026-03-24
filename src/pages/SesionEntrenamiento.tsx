import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Plus, CheckCircle2, Play, Pause, 
  Trash2, Search, Users, ArrowLeft, 
  Dumbbell, Clock, Check, X, Maximize2
} from 'lucide-react';

interface AthleteInSession {
  id: number;
  name: string;
  attended: boolean;
  exercises: SessionExercise[];
}

interface SessionExercise {
  id: string;
  name: string;
  type: 'REPS' | 'TIME';
  sets: SessionSet[];
}

interface SessionSet {
  weight?: string;
  reps?: string;
  time?: number; // seconds
  multiplier: number; // For grouping e.g. 3x10
  completed: boolean;
}

export const SesionEntrenamiento = () => {
  const { type, id } = useParams(); // type: 'grupo' | 'atleta'
  const navigate = useNavigate();
  
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [countdownMsg, setCountdownMsg] = useState<string | null>(null);

  // Mock Athletes in Session
  const [athletes, setAthletes] = useState<AthleteInSession[]>([
    { id: 1, name: "Ignacio Valdés", attended: true, exercises: [] },
    { id: 2, name: "Elena Marín", attended: true, exercises: [] },
    { id: 3, name: "Lucía M.", attended: false, exercises: [] },
    { id: 10, name: "Maria Paz", attended: true, exercises: [] },
  ]);

  const [activeTab, setActiveTab] = useState<number | 'global'>(type === 'grupo' ? 'global' : Number(id));

  // Exercise Library for Selector
  const EXERCISE_LIBRARY = [
    { name: "SENTADILLA BARRA OLY", type: "REPS" },
    { name: "BENCH PRESS", type: "REPS" },
    { name: "PLANK ABDOMINAL", type: "TIME" },
    { name: "ASSAULT BIKE SPRINT", type: "TIME" },
    { name: "PESO MUERTO RUMANO", type: "REPS" },
  ];

  useEffect(() => {
    // If athlete ID is from URL and not in mock list, add Maria Paz as fallback
    const athleteId = Number(id);
    if (type === 'atleta' && id && !athletes.find(a => a.id === athleteId)) {
       setAthletes(prev => [...prev, { id: athleteId, name: "Maria Paz", attended: true, exercises: [] }]);
    }
  }, [type, id]);

  useEffect(() => {
    let interval: any;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const addExercise = (exerciseName: string, typeEx: string, target: number | 'global') => {
    const newEx: SessionExercise = {
      id: Math.random().toString(36).substr(2, 9),
      name: exerciseName,
      type: typeEx as any,
      sets: typeEx === 'REPS' ? [{ weight: "", reps: "", multiplier: 1, completed: false }] : [{ time: 60, multiplier: 1, completed: false }]
    };

    if (target === 'global') {
      setAthletes(prev => prev.map(a => ({
        ...a,
        exercises: [...a.exercises, { ...newEx, id: Math.random().toString(36).substr(2, 9) }]
      })));
    } else {
      setAthletes(prev => prev.map(a => a.id === target ? {
        ...a,
        exercises: [...(a.exercises || []), newEx]
      } : a));
    }
    setIsSearchOpen(false);
  };

  const updateSet = (athleteId: number, exerciseId: string, setIndex: number, data: Partial<SessionSet>) => {
    setAthletes(prev => prev.map(a => a.id === athleteId ? {
      ...a,
      exercises: a.exercises.map(ex => ex.id === exerciseId ? {
        ...ex,
        sets: ex.sets.map((s, i) => i === setIndex ? { ...s, ...data } : s)
      } : ex)
    } : a));
  };

  const addSet = (athleteId: number, exerciseId: string) => {
    setAthletes(prev => prev.map(a => a.id === athleteId ? {
      ...a,
      exercises: a.exercises.map(ex => ex.id === exerciseId ? {
        ...ex,
        sets: [...ex.sets, ex.type === 'REPS' ? { weight: "", reps: "", multiplier: 1, completed: false } : { time: 60, multiplier: 1, completed: false }]
      } : ex)
    } : a));
  };

  const removeSet = (athleteId: number, exerciseId: string, setIndex: number) => {
    setAthletes(prev => prev.map(a => a.id === athleteId ? {
      ...a,
      exercises: a.exercises.map(ex => ex.id === exerciseId ? {
        ...ex,
        sets: ex.sets.filter((_, i) => i !== setIndex)
      } : ex)
    } : a));
  };

  const playBeep = (freq = 440, duration = 0.1) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.error("Audio not supported");
    }
  };

  const expandSet = (athleteId: number, exerciseId: string, setIndex: number) => {
    setAthletes(prev => prev.map(a => a.id === athleteId ? {
      ...a,
      exercises: a.exercises.map(ex => ex.id === exerciseId ? {
        ...ex,
        sets: [
          ...ex.sets.slice(0, setIndex),
          ...Array(ex.sets[setIndex].multiplier).fill(null).map(() => ({ 
            ...ex.sets[setIndex], 
            multiplier: 1, 
            id: Math.random().toString(36).substr(2, 5) // small ID for sets
          })),
          ...ex.sets.slice(setIndex + 1)
        ]
      } : ex)
    } : a));
  };

  const startTimer = (seconds: number) => {
    setCountdownMsg("¡PREPARADOS!");
    playBeep(200, 0.4);
    
    setTimeout(() => {
      setCountdownMsg("3...");
      playBeep(440, 0.1);
      setTimeout(() => {
        setCountdownMsg("2...");
        playBeep(440, 0.1);
        setTimeout(() => {
          setCountdownMsg("1...");
          playBeep(440, 0.1);
          setTimeout(() => {
            setCountdownMsg("¡DALE!");
            playBeep(880, 0.3);
            setTimeLeft(seconds);
            setTimerActive(true);
            setTimeout(() => setCountdownMsg(null), 1000);
          }, 1000);
        }, 1000);
      }, 1000);
    }, 1000);
  };

  useEffect(() => {
    if (timeLeft === 0 && timerActive) {
      setCountdownMsg("¡TIEMPO COMPLETO!");
      playBeep(880, 0.5);
      setTimeout(() => setCountdownMsg(null), 3000);
    }
  }, [timeLeft, timerActive]);

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Dynamic Header */}
      <header className="fixed top-0 left-64 right-0 bg-black/80 backdrop-blur-md border-b border-white/5 p-6 z-40 flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <button onClick={() => navigate('/agenda')} className="p-2 hover:bg-white/5 rounded-full">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-display font-black tracking-tighter uppercase italic -skew-x-12">
              SESIÓN: <span className="text-neon-green">{type === 'grupo' ? 'GRUPO ELITE' : 'INDIVIDUAL'}</span>
            </h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="bg-white/5 rounded-2xl px-6 py-2 border border-white/10 flex items-center space-x-4">
             <Clock className="text-neon-blue" size={20} />
             <span className="text-3xl font-display font-black tracking-widest tabular-nums">
               {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
             </span>
             {timerActive ? (
               <button onClick={() => setTimerActive(false)} className="p-2 bg-neon-red/20 text-neon-red rounded-lg"><Pause size={20} /></button>
             ) : (
               <button onClick={() => setTimerActive(true)} className="p-2 bg-neon-green/20 text-neon-green rounded-lg"><Play size={20} /></button>
             )}
          </div>
          <button 
            onClick={() => setIsFinished(true)}
            className="bg-neon-green text-black px-8 py-3 rounded-xl font-display font-black uppercase italic -skew-x-12 shadow-lg shadow-neon-green/20 hover:scale-105 transition-all"
          >
            FINALIZAR
          </button>
        </div>
      </header>

      {/* Timer Overlay / Big Message */}
      {countdownMsg && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none">
          <div className="bg-neon-green/90 text-black px-20 py-10 rounded-[40px] shadow-[0_0_100px_rgba(156,255,147,0.5)] animate-in zoom-in duration-300">
             <h2 className="text-9xl font-display font-black tracking-tighter uppercase italic -skew-x-12 whitespace-nowrap">
               {countdownMsg}
             </h2>
          </div>
        </div>
      )}

      {isFinished && (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-6 animate-in fade-in duration-500">
           <div className="text-center space-y-8 max-w-md">
              <div className="w-32 h-32 bg-neon-green/20 rounded-full flex items-center justify-center mx-auto border-2 border-neon-green shadow-[0_0_50px_rgba(156,255,147,0.3)]">
                <CheckCircle2 size={64} className="text-neon-green animate-bounce" />
              </div>
              <h2 className="text-6xl font-display font-black tracking-tighter uppercase italic -skew-x-12">ENTRENO FINALIZADO</h2>
              <p className="text-white/60 font-display font-bold uppercase tracking-widest text-sm">Los datos han sido registrados en la vitácora individual de cada atleta.</p>
              <button 
                onClick={() => navigate('/agenda')}
                className="w-full bg-white text-black py-6 font-display font-black text-xl uppercase italic -skew-x-12 hover:scale-105 transition-all"
              >
                VOLVER A LA AGENDA
              </button>
           </div>
        </div>
      )}

      <div className="mt-32 max-w-7xl mx-auto px-6">
        {/* Navigation Tabs for Group */}
        {type === 'grupo' && (
          <div className="flex space-x-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
            <button 
              onClick={() => setActiveTab('global')}
              className={`px-8 py-4 font-display font-black text-xs tracking-widest uppercase transition-all rounded-xl border-2 flex items-center space-x-2 shrink-0 ${
                activeTab === 'global' ? 'bg-white text-black border-white' : 'bg-white/10 text-white/60 border-transparent hover:border-white/20'
              }`}
            >
              <Users size={16} />
              <span>GRUPO COMPLETO</span>
            </button>
            {athletes.map(a => (
              <button 
                key={a.id}
                onClick={() => setActiveTab(a.id)}
                className={`px-8 py-4 font-display font-black text-xs tracking-widest uppercase transition-all rounded-xl border-2 flex items-center space-x-2 shrink-0 ${
                  activeTab === a.id ? 'bg-neon-green text-black border-neon-green' : 'bg-white/10 text-white/60 border-transparent hover:border-white/20'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${a.attended ? 'bg-neon-green' : 'bg-red-500'}`} />
                <span>{a.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Global Controls */}
        {activeTab === 'global' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="glass-card p-12 text-center border-dashed border-2 border-white/10 bg-white/5 rounded-[40px] space-y-6">
              <Plus size={48} className="mx-auto text-white/10" />
              <h3 className="text-3xl font-display font-black uppercase italic -skew-x-12">Programar ejercicio grupal</h3>
              <p className="text-white/40 max-w-sm mx-auto">Esta acción añade el ejercicio y las cargas iniciales a todos los integrantes presentes en la sesión.</p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto pt-6">
                {EXERCISE_LIBRARY.map(ex => (
                  <button 
                    key={ex.name}
                    onClick={() => addExercise(ex.name, ex.type, 'global')}
                    className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-neon-green transition-all group text-left"
                  >
                    <div className="flex justify-between items-start mb-4">
                      {ex.type === 'REPS' ? <Dumbbell className="text-neon-green" size={24} /> : <Clock className="text-neon-blue" size={24} />}
                      <Plus className="text-white/10 group-hover:text-white" size={20} />
                    </div>
                    <span className="font-display font-black text-sm block uppercase leading-tight line-clamp-2">{ex.name}</span>
                  </button>
                ))}
            </div>
            </div>
          </div>
        )}

        {/* Athlete Individual View */}
        {typeof activeTab === 'number' && (
          <div className="grid grid-cols-1 gap-8 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-between mb-4">
               <div>
                 <h2 className="text-5xl font-display font-black tracking-tighter uppercase italic -skew-x-12 text-neon-green">
                   {athletes.find(a => a.id === activeTab)?.name || "Atleta Desconocido"}
                 </h2>
                 <p className="text-white/50 font-display font-bold tracking-widest text-xs mt-2 uppercase">CONTROL INDIVIDUAL DE CARGAS</p>
               </div>
               <button 
                onClick={() => setIsSearchOpen(true)}
                className="btn-primary-small flex items-center space-x-2 bg-white text-black font-black italic -skew-x-12 px-6 py-3"
               >
                 <Plus size={18} />
                 <span>AÑADIR EJERCICIO</span>
               </button>
            </div>

            <div className="space-y-6">
              {athletes.find(a => a.id === activeTab)?.exercises?.map((ex) => (
                <div key={ex.id} className="glass-card overflow-hidden bg-surface-low border-none">
                  <div className="p-6 bg-white/5 flex items-center justify-between border-b border-white/5">
                    <div className="flex items-center space-x-4">
                      {ex.type === 'REPS' ? <Dumbbell className="text-neon-green" size={24} /> : <Clock className="text-neon-blue" size={24} />}
                      <h4 className="font-display font-black text-xl uppercase italic -skew-x-12">{ex.name}</h4>
                    </div>
                    <button className="text-white/20 hover:text-red-500 transition-colors"><Trash2 size={20} /></button>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-[10px] font-display font-black text-white/50 uppercase tracking-[0.2em]">
                          <th className="pb-4 pl-4 w-16 text-center">SERIE</th>
                          {ex.type === 'REPS' ? (
                            <>
                              <th className="pb-4 text-center">CARGA (KG)</th>
                              <th className="pb-4 text-center">REPS</th>
                              <th className="pb-4 text-center">CANT. SERIES</th>
                            </>
                          ) : (
                            <>
                              <th className="pb-4 text-center">TIEMPO (SEG)</th>
                              <th className="pb-4 text-center">CANT. SERIES</th>
                            </>
                          )}
                          <th className="pb-4 pr-4 text-right">ESTADO</th>
                        </tr>
                      </thead>
                      <tbody className="space-y-2">
                        {ex.sets.map((s, idx) => (
                          <tr key={idx} className={`group transition-colors ${s.completed ? 'bg-neon-green/5' : ''}`}>
                            <td className="py-4 pl-4">
                              <span className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center font-display font-black text-white/80">
                                {idx + 1}
                              </span>
                            </td>
                            {ex.type === 'REPS' ? (
                              <>
                                <td className="py-2">
                                  <input 
                                    type="text" 
                                    placeholder="0"
                                    className="bg-white/5 border border-white/10 w-32 p-3 rounded-xl font-display font-black text-2xl text-neon-blue outline-none focus:border-neon-blue text-center"
                                    value={s.weight}
                                    onChange={(e) => updateSet(activeTab as number, ex.id, idx, { weight: e.target.value })}
                                  />
                                </td>
                                <td className="py-2 text-center">
                                  <input 
                                    type="text" 
                                    placeholder="0"
                                    className="bg-white/5 border border-white/10 w-24 p-3 rounded-xl font-display font-black text-2xl outline-none focus:border-neon-green text-center"
                                    value={s.reps}
                                    onChange={(e) => updateSet(activeTab as number, ex.id, idx, { reps: e.target.value })}
                                  />
                                </td>
                                <td className="py-2 text-center">
                                  <div className="flex items-center justify-center space-x-2">
                                    <span className="text-white/50 text-xs font-black">x</span>
                                    <input 
                                      type="number" 
                                      className="bg-white/5 border border-white/10 w-16 p-3 rounded-xl font-display font-black text-xl text-neon-green outline-none focus:border-neon-green text-center"
                                      value={s.multiplier}
                                      min={1}
                                      onChange={(e) => updateSet(activeTab as number, ex.id, idx, { multiplier: parseInt(e.target.value) || 1 })}
                                    />
                                    {s.multiplier > 1 && (
                                      <button 
                                        onClick={() => expandSet(activeTab as number, ex.id, idx)}
                                        className="p-2 text-white/40 hover:text-neon-green transition-colors"
                                        title="Desglosar en series individuales"
                                      >
                                        <Maximize2 size={14} />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </>
                            ) : (
                              <td className="py-2">
                                <div className="flex items-center justify-center space-x-4">
                                  <input 
                                    type="number" 
                                    className="bg-white/5 border border-white/10 w-24 p-3 rounded-xl font-display font-black text-2xl outline-none focus:border-neon-blue text-center"
                                    value={s.time}
                                    onChange={(e) => updateSet(activeTab as number, ex.id, idx, { time: parseInt(e.target.value) })}
                                  />
                                  <div className="flex items-center space-x-2">
                                     <span className="text-white/50 text-xs font-black">x</span>
                                     <input 
                                       type="number" 
                                       className="bg-white/5 border border-white/10 w-20 p-3 rounded-xl font-display font-black text-2xl text-neon-blue outline-none focus:border-neon-blue text-center"
                                       value={s.multiplier}
                                       min={1}
                                       onChange={(e) => updateSet(activeTab as number, ex.id, idx, { multiplier: parseInt(e.target.value) || 1 })}
                                     />
                                  </div>
                                  {s.multiplier > 1 && (
                                      <button 
                                        onClick={() => expandSet(activeTab as number, ex.id, idx)}
                                        className="p-2 text-white/20 hover:text-neon-blue transition-colors"
                                        title="Desglosar en series individuales"
                                      >
                                        <Maximize2 size={14} />
                                      </button>
                                  )}
                                  <button 
                                    onClick={() => startTimer(s.time || 60)}
                                    className="p-3 bg-neon-blue/20 text-neon-blue rounded-xl hover:bg-neon-blue text-black transition-all"
                                  >
                                    <Play size={20} />
                                  </button>
                                </div>
                              </td>
                            )}
                            <td className="py-4 pr-4 text-right">
                              <button 
                                onClick={() => updateSet(activeTab as number, ex.id, idx, { completed: !s.completed })}
                                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                                  s.completed ? 'bg-neon-green text-black scale-110' : 'bg-white/5 text-white/10 hover:border-white/20 border border-white/10'
                                }`}
                              >
                                {s.completed ? <Check size={24} /> : <div className="w-4 h-4 rounded-full border-2 border-current opacity-20" />}
                              </button>
                            </td>
                            <td className="py-4 pr-4 text-right">
                              {ex.sets.length > 1 && (
                                <button 
                                  onClick={() => removeSet(activeTab as number, ex.id, idx)}
                                  className="p-2 text-white/10 hover:text-neon-red transition-all"
                                  title="Eliminar serie"
                                >
                                  <Trash2 size={18} />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <button 
                      onClick={() => addSet(activeTab as number, ex.id)}
                      className="w-full py-4 border-2 border-dashed border-white/20 rounded-2xl font-display font-black text-xs text-white/50 hover:text-white hover:border-white/40 transition-all flex items-center justify-center space-x-2"
                    >
                      <Plus size={16} />
                      <span>AÑADIR SERIE</span>
                    </button>
                  </div>
                </div>
              ))}
              
              {(athletes.find(a => a.id === activeTab)?.exercises?.length || 0) === 0 && (
                <div className="py-24 text-center glass-card border-dashed border-2 border-white/5">
                  <Dumbbell size={48} className="mx-auto text-white/5 mb-6" />
                  <p className="font-display font-black text-2xl text-white/10 uppercase italic">Sin ejercicios individuales asignados</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quick Add Modal Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl">
          <div className="w-full max-w-2xl space-y-8">
            <div className="flex justify-between items-center text-white">
               <h2 className="text-4xl font-display font-black italic -skew-x-12 uppercase tracking-tighter">Buscar Ejercicio</h2>
               <button onClick={() => setIsSearchOpen(false)}><X size={32} /></button>
            </div>
            <div className="glass-card flex items-center px-8 py-6 space-x-6 border-none bg-surface-high rounded-3xl">
              <Search className="text-white/20" size={28} />
              <input 
                autoFocus
                placeholder="Nombre del básico o movimiento..." 
                className="bg-transparent border-none outline-none text-3xl font-display w-full placeholder:text-white/10 italic"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 max-h-[50vh] overflow-y-auto pr-4 custom-scrollbar">
               {EXERCISE_LIBRARY.map(ex => (
                 <button 
                  key={ex.name}
                  onClick={() => addExercise(ex.name, ex.type, activeTab as number)}
                  className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-neon-green hover:text-black transition-all group"
                 >
                   <div className="flex items-center space-x-4">
                     {ex.type === 'REPS' ? <Dumbbell size={24} /> : <Clock size={24} />}
                     <span className="font-display font-black text-xl uppercase italic -skew-x-12">{ex.name}</span>
                   </div>
                   <Plus size={24} />
                 </button>
               ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
