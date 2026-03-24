import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Dumbbell, Clock, Brackets as Muscle, Activity, Info, X, ChevronRight, Edit2, Loader2 } from 'lucide-react';
import { getExercises, createExercise, updateExercise, deleteExercise } from '../lib/api';
import type { Exercise } from '../lib/types';

const ExerciseCard = ({ exercise, onEdit, onDelete }: { exercise: Exercise, onEdit: (ex: Exercise) => void, onDelete: (id: string) => void }) => (
  <div className="glass-card p-6 flex items-center justify-between group hover:translate-x-3 transition-transform border-none bg-surface-low">
    <div className="flex items-center space-x-6">
      <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-neon-green/30 transition-colors">
        {exercise.type === 'REPS' ? (
          <Dumbbell className="text-neon-green" size={32} />
        ) : (
          <Clock className="text-neon-blue" size={32} />
        )}
      </div>
      <div>
        <div className="flex items-center space-x-3 mb-1">
          <span className={`text-[10px] font-display font-black px-2 py-0.5 rounded tracking-widest uppercase ${
            exercise.type === 'REPS' ? 'bg-neon-green/20 text-neon-green' : 'bg-neon-blue/20 text-neon-blue'
          }`}>
            {exercise.type}
          </span>
          <span className="text-white/60 text-[10px] font-display font-black uppercase tracking-widest italic">{exercise.category}</span>
        </div>
        <h3 className="font-display font-black text-2xl tracking-tighter uppercase italic -skew-x-12">{exercise.name}</h3>
        <p className="text-white/70 text-xs font-medium line-clamp-1">{exercise.description}</p>
      </div>
    </div>

    <div className="flex items-center space-x-4">
       <button 
        onClick={() => onEdit(exercise)}
        className="p-3 bg-white/5 text-white/40 hover:text-neon-blue hover:bg-neon-blue/10 transition-all rounded-xl"
        title="Editar Ejercicio"
      >
        <Edit2 size={20} />
      </button>
       <button 
        onClick={() => onDelete(exercise.id)}
        className="p-3 bg-red-500/10 text-red-500/40 hover:text-red-500 hover:bg-red-500/20 transition-all rounded-xl"
        title="Eliminar Ejercicio"
      >
        <Trash2 size={20} />
      </button>
    </div>
  </div>
);

export const Ejercicios = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const initialExerciseState: Partial<Exercise> = {
    name: "",
    category: "FUERZA",
    type: "REPS",
    description: ""
  };

  const [currentExercise, setCurrentExercise] = useState<Partial<Exercise>>(initialExerciseState);

  const loadData = async () => {
    setIsLoading(true);
    const data = await getExercises();
    setExercises(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentExercise.name) return;
    
    if (isEditMode && currentExercise.id) {
      await updateExercise(currentExercise.id, {
        name: currentExercise.name,
        category: currentExercise.category,
        type: currentExercise.type,
        description: currentExercise.description
      });
    } else {
      await createExercise({
        name: currentExercise.name,
        category: currentExercise.category,
        type: currentExercise.type,
        description: currentExercise.description
      });
    }
    
    await loadData();
    setCurrentExercise(initialExerciseState);
    setIsModalOpen(false);
    setIsEditMode(false);
  };

  const handleEdit = (ex: Exercise) => {
    setCurrentExercise(ex);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Seguro que deseas eliminar este ejercicio?")) {
      await deleteExercise(id);
      await loadData();
    }
  };

  const openNewModal = () => {
    setCurrentExercise(initialExerciseState);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const filteredExercises = exercises.filter(ex => 
    ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ex.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-12 pb-20">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-white/60 text-sm font-display font-bold uppercase tracking-wider mb-2">Biblioteca</h2>
          <h1 className="text-7xl font-display font-black tracking-tighter uppercase">EJERCICIOS</h1>
        </div>
        <button 
          onClick={openNewModal}
          className="btn-primary flex items-center space-x-2 transition-all hover:scale-105 italic -skew-x-12"
        >
          <Plus size={20} fill="black" />
          <span>AÑADIR EJERCICIO</span>
        </button>
      </header>

      {/* Filter Bar */}
      <div className="flex space-x-6 items-center">
        <div className="flex-1 glass-card flex items-center px-6 py-4 space-x-4 border-none bg-surface-high">
          <Search className="text-white/50" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o categoría..." 
            className="bg-transparent border-none outline-none text-xl font-display w-full placeholder:text-white/10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-12 h-12 text-neon-green animate-spin" />
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredExercises.map(ex => (
            <ExerciseCard 
              key={ex.id} 
              exercise={ex} 
              onEdit={handleEdit}
              onDelete={handleDelete} 
            />
          ))}
          {filteredExercises.length === 0 && (
            <div className="py-20 text-center space-y-4 glass-card border-none bg-surface-low">
              <Dumbbell size={48} className="mx-auto text-white/5" />
              <p className="text-white/20 font-display font-black italic text-2xl uppercase tracking-widest">Aún no tienes ejercicios creados</p>
              <p className="text-white/10 font-display font-bold text-xs uppercase">Comienza añadiendo los movimientos principales</p>
            </div>
          )}
        </div>
      )}

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl">
          <div className="glass-card w-full max-w-lg p-10 relative border-none bg-surface-low overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-neon-green/10 blur-[100px] pointer-events-none" />
            
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <h2 className="text-4xl font-display font-black tracking-tighter uppercase italic -skew-x-12 mb-8">
              {isEditMode ? 'EDITAR' : 'NUEVO'} <span className="text-neon-green">MOVIMIENTO</span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] text-white/70 font-display font-black uppercase tracking-widest">Nombre del Ejercicio</label>
                <input 
                  autoFocus
                  required
                  type="text" 
                  placeholder="Ej: Peso Muerto"
                  className="w-full bg-white/5 border-2 border-white/10 p-4 font-display font-black text-xl uppercase focus:border-neon-green outline-none"
                  value={currentExercise.name}
                  onChange={(e) => setCurrentExercise({...currentExercise, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] text-white/70 font-display font-black uppercase tracking-widest">Categoría</label>
                  <select 
                    className="w-full bg-white/5 border-2 border-white/10 p-4 font-display font-black text-sm uppercase focus:border-neon-green outline-none [color-scheme:dark]"
                    value={currentExercise.category}
                    onChange={(e) => setCurrentExercise({...currentExercise, category: e.target.value})}
                  >
                    <option value="FUERZA">FUERZA</option>
                    <option value="CARDIO">CARDIO</option>
                    <option value="CORE">CORE</option>
                    <option value="ESTRUCTURA">ESTRUCTURA</option>
                    <option value="HIPERTROFIA">HIPERTROFIA</option>
                    <option value="RESISTENCIA">RESISTENCIA</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-white/70 font-display font-black uppercase tracking-widest">Modo Registro</label>
                  <div className="flex bg-white/5 rounded-lg p-1 border-2 border-white/10">
                    <button 
                      type="button"
                      onClick={() => setCurrentExercise({...currentExercise, type: 'REPS'})}
                      className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded font-display font-bold text-xs uppercase tracking-wider transition-all ${
                        currentExercise.type === 'REPS' ? 'bg-neon-green text-black' : 'text-white/60 hover:text-white'
                      }`}
                    >
                      <Dumbbell size={14} />
                      <span>Reps</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setCurrentExercise({...currentExercise, type: 'TIME'})}
                      className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded font-display font-bold text-xs uppercase tracking-wider transition-all ${
                        currentExercise.type === 'TIME' ? 'bg-neon-blue text-black' : 'text-white/60 hover:text-white'
                      }`}
                    >
                      <Clock size={14} />
                      <span>Tiempo</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-white/70 font-display font-black uppercase tracking-widest">Breve Descripción</label>
                <textarea 
                  rows={3}
                  className="w-full bg-white/5 border-2 border-white/10 p-4 font-display font-bold text-sm outline-none focus:border-neon-green resize-none"
                  placeholder="Detalles técnicos..."
                  value={currentExercise.description}
                  onChange={(e) => setCurrentExercise({...currentExercise, description: e.target.value})}
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-neon-green text-black py-6 font-display font-black text-xl uppercase italic -skew-x-12 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_20px_40px_rgba(156,255,147,0.2)]"
              >
                {isEditMode ? 'GUARDAR CAMBIOS' : 'REGISTRAR EJERCICIO'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
