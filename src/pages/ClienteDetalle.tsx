import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Activity, TrendingUp, Clock, Users, FileText, Target, Crosshair, Plus, Ruler, Weight, Scale, X, CheckCircle2, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { getAthletes, getAthleteMetrics, createAthleteMetric, deleteAthleteMetric } from '../lib/api';
import type { Athlete, AthleteMetric } from '../lib/types';

export const ClienteDetalle = () => {
  const { id } = useParams();
  
  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [metrics, setMetrics] = useState<AthleteMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMetric, setNewMetric] = useState({ weight: '', height: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    const athletes = await getAthletes();
    const found = athletes.find(a => a.id === id);
    if (found) {
      setAthlete(found);
      const m = await getAthleteMetrics(found.id);
      setMetrics(m);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleSaveMetric = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!athlete) return;
    
    setIsSaving(true);
    const weightVal = parseFloat(newMetric.weight.replace(',', '.'));
    let heightVal = parseFloat(newMetric.height.replace(',', '.')); // meters
    
    // Auto-fix if they enter cm instead of meters (e.g. 175 instead of 1.75)
    if (heightVal > 3) {
      heightVal = heightVal / 100;
    }

    let bmiVal = 0;
    if (weightVal > 0 && heightVal > 0) {
      bmiVal = weightVal / (heightVal * heightVal);
    }

    const metricData = {
      athlete_id: athlete.id,
      weight: weightVal || 0,
      height: heightVal || 0,
      bmi: parseFloat(bmiVal.toFixed(2)),
      date: new Date().toISOString().split('T')[0]
    };

    const success = await createAthleteMetric(metricData);
    if (success) {
      await loadData();
      setIsModalOpen(false);
      setNewMetric({ weight: '', height: '' });
      toast.success('¡Control Físico Registrado con Éxito!');
    } else {
      toast.error('Hubo un error al registrar el control');
    }
    setIsSaving(false);
  };

  const handleDeleteMetric = async (metricId: string) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta medida de la historia del paciente?')) return;
    setDeletingId(metricId);
    const success = await deleteAthleteMetric(metricId);
    if (success) {
      toast.success('Control eliminado');
      await loadData();
    } else {
      toast.error('Error al eliminar control');
    }
    setDeletingId(null);
  };

  if (isLoading) {
    return <div className="flex justify-center py-40"><Loader2 className="w-12 h-12 text-neon-green animate-spin" /></div>;
  }

  if (!athlete) {
    return <div className="text-white text-center py-20 font-display text-2xl uppercase">Atleta no encontrado</div>;
  }

  const sessionsPerWeek = athlete.athlete_schedules?.length || (athlete.groups?.training_days?.length || 0);
  const isIndividual = !athlete.group_id;
  const applicableFee = (athlete.groups && athlete.groups.fee_per_session) ? athlete.groups.fee_per_session : athlete.fee_per_session;
  
  // Use group fee strictly if in group, otherwise use individual fee
  let calculateRate = Number(athlete.fee_per_session) || 0;
  if (!isIndividual && athlete.groups && Number(athlete.groups.fee_per_session) > 0) {
     calculateRate = Number(athlete.groups.fee_per_session);
  }
  const estimatedMonthly = calculateRate * sessionsPerWeek * 4;

  const getBmiStatus = (bmi: number) => {
    if (bmi < 18.5) return { text: 'BAJO PESO', color: 'text-blue-500' };
    if (bmi >= 18.5 && bmi < 25) return { text: 'NORMAL', color: 'text-neon-green' };
    if (bmi >= 25 && bmi < 30) return { text: 'SOBREPESO', color: 'text-yellow-500' };
    return { text: 'OBESIDAD', color: 'text-neon-red' };
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Header & Back */}
      <div className="flex flex-col space-y-4">
        <Link to="/clientes" className="flex items-center space-x-2 text-white/60 hover:text-white transition-colors w-fit">
          <ChevronLeft size={20} />
          <span className="font-display font-bold uppercase text-xs tracking-widest">VOLVER A ATLETAS</span>
        </Link>
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-7xl font-display font-black tracking-tighter uppercase line-clamp-1 italic -skew-x-12">{athlete.full_name}</h1>
            <div className="flex space-x-4 mt-2">
              <span className={`px-3 py-1 text-[10px] font-display font-black tracking-widest uppercase rounded ${athlete.status === 'active' ? 'bg-neon-green/10 text-neon-green' : 'bg-red-500/10 text-red-500'}`}>
                {athlete.status === 'active' ? 'Socio Activo' : 'Inactivo'}
              </span>
              <span className={`px-3 py-1 text-[10px] font-display font-black tracking-widest uppercase rounded italic flex items-center ${isIndividual ? 'bg-neon-blue/10 text-neon-blue' : 'bg-white/10 text-white/70'}`}>
                <Users size={12} className="mr-2" />
                {isIndividual ? 'Individual' : athlete.groups?.name}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
         {/* Left Column: Admin and Schedule */}
         <div className="space-y-8">
            <div className="glass-card bg-surface-low border-none overflow-hidden">
              <div className="bg-surface-high/50 p-6 border-b border-white/5 flex items-center space-x-3">
                 <Activity className="text-neon-green" size={20} />
                 <span className="text-sm font-display font-black tracking-widest uppercase">Ficha Administrativa</span>
              </div>
              
              <div className="p-8 space-y-8">
                <div>
                  <label className="text-[10px] text-white/50 font-display font-black uppercase tracking-widest block mb-2">Email</label>
                  <p className="text-lg font-display font-bold text-white/80 lowercase italic underline decoration-neon-blue decoration-2 underline-offset-4">{athlete.email}</p>
                </div>
                {athlete.phone && (
                   <div>
                     <label className="text-[10px] text-white/50 font-display font-black uppercase tracking-widest block mb-2">Teléfono</label>
                     <p className="text-lg font-display font-bold text-white/80">{athlete.phone}</p>
                   </div>
                )}
                <div>
                  <label className="text-[10px] text-white/50 font-display font-black uppercase tracking-widest block mb-2">Fecha Ingreso</label>
                  <p className="text-xl font-display font-bold">{athlete.join_date}</p>
                </div>

                <div className="pt-4 border-t border-white/5 space-y-4">
                  <div>
                    <label className="text-[10px] text-white/50 font-display font-black uppercase tracking-widest block mb-1">Tarifa Plan ({isIndividual ? 'Individual' : 'Grupal'})</label>
                    <div className="flex items-baseline space-x-2">
                       <span className="text-2xl font-display font-black text-white">${calculateRate.toLocaleString('es-CL')}</span>
                       <span className="text-white/50 font-display font-bold text-[10px] uppercase tracking-widest">/ sesión</span>
                    </div>
                  </div>

                  <div className="bg-neon-green/10 border border-neon-green/20 p-4 rounded-xl mt-4">
                     <label className="text-[10px] text-neon-green font-display font-black uppercase tracking-widest block mb-1">Proyección Mensual (4 Sem)</label>
                     <div className="flex flex-col">
                        <span className="text-4xl font-display font-black text-white">${estimatedMonthly.toLocaleString('es-CL')}</span>
                        <span className="text-white/50 font-display font-bold text-[10px] uppercase tracking-widest mt-1">
                          {sessionsPerWeek} sesiones/semana
                        </span>
                     </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card bg-surface-low border-none overflow-hidden">
               <div className="bg-surface-high/50 p-6 border-b border-white/5 flex items-center space-x-3">
                 <Clock className="text-neon-blue" size={20} />
                 <span className="text-sm font-display font-black tracking-widest uppercase">Cronograma Semanal</span>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {athlete.athlete_schedules && athlete.athlete_schedules.length > 0 ? (
                    athlete.athlete_schedules.map((s, i) => (
                      <div key={i} className="flex items-center justify-between bg-white/5 p-4 rounded border border-white/5">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-neon-blue text-black flex items-center justify-center font-display font-black text-xs rounded">
                            {s.day_of_week}
                          </div>
                          <span className="font-display font-black text-2xl tracking-tighter italic">{s.training_hour}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                     <div className="text-white/40 font-display font-bold text-xs uppercase text-center py-6">
                        Sin horarios definidos o hereda grupo
                     </div>
                  )}
                </div>
              </div>
            </div>
         </div>

         {/* Middle & Right Col: History and Progress */}
         <div className="xl:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {/* Health / Goals */}
               <div className="glass-card bg-surface-low border-none p-8 flex flex-col items-center justify-center text-center space-y-4">
                 <FileText size={32} className="text-neon-red" />
                 <div>
                    <h3 className="text-white/50 font-display font-bold text-[10px] uppercase tracking-widest mb-1">Lesiones / Cuidados Previos</h3>
                    <p className="font-display font-black text-lg text-white">
                      {athlete.medical_notes ? athlete.medical_notes : <span className="text-white/30 italic font-medium">Ninguno registrado</span>}
                    </p>
                 </div>
               </div>

               <div className="glass-card bg-surface-low border-none p-8 flex flex-col items-center justify-center text-center space-y-4">
                 <Target size={32} className="text-neon-blue" />
                 <div>
                    <h3 className="text-white/50 font-display font-bold text-[10px] uppercase tracking-widest mb-1">Meta Principal a Alcanzar</h3>
                    <p className="font-display font-black text-lg text-white">
                      {athlete.goals && athlete.goals.length > 0 ? athlete.goals[0] : <span className="text-white/30 italic font-medium">Sin meta definida</span>}
                    </p>
                 </div>
               </div>
            </div>

            {/* Metrics History */}
            <div className="glass-card bg-surface-low border-none overflow-hidden">
               <div className="bg-surface-high/50 p-6 border-b border-white/5 flex items-center justify-between">
                 <div className="flex items-center space-x-3">
                   <TrendingUp className="text-neon-green" size={20} />
                   <span className="text-sm font-display font-black tracking-widest uppercase">Evolución Física</span>
                 </div>
                 <button 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-white/10 hover:bg-neon-green hover:text-black transition-all text-white/70 px-4 py-2 rounded flex items-center space-x-2 text-[10px] font-display font-black uppercase tracking-widest"
                 >
                   <Plus size={14} />
                   <span>Nuevo Control</span>
                 </button>
              </div>

               <div className="p-8">
                 {metrics.length === 0 ? (
                    <div className="text-center py-16 space-y-4 border-2 border-dashed border-white/5 rounded-2xl">
                       <Crosshair size={40} className="mx-auto text-white/20" />
                       <p className="text-white/40 font-display font-black italic text-xl uppercase tracking-widest">Sin medidas registradas</p>
                       <p className="text-white/20 font-display font-bold uppercase text-xs">Realiza el pesaje y medida inicial del cliente</p>
                    </div>
                 ) : (
                    <div className="space-y-4">
                       {/* Table Header */}
                       <div className="flex font-display font-bold text-[10px] text-white/40 uppercase tracking-widest pb-2 border-b border-white/5 px-4">
                          <div className="w-1/4">Fecha</div>
                          <div className="w-1/4 text-center">Peso</div>
                          <div className="w-1/4 text-center">Estatura</div>
                          <div className="w-1/4 text-right">IMC</div>
                       </div>
                       
                       {/* Table Rows */}
                       {metrics.map((m, i) => {
                          const status = getBmiStatus(m.bmi);
                          const isLatest = i === 0;

                          return (
                            <div key={m.id} className={`flex items-center px-4 py-5 rounded-xl transition-all ${isLatest ? 'bg-white/5 border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.02)]' : 'hover:bg-white/5'}`}>
                               <div className="w-1/4 font-display font-black text-sm">
                                  {m.date}
                                  {isLatest && <span className="ml-2 px-2 py-0.5 bg-neon-green/20 text-neon-green text-[8px] uppercase tracking-widest rounded-full">Actual</span>}
                               </div>
                               <div className="w-1/4 text-center">
                                  <span className="font-display font-black text-xl">{m.weight}</span>
                                  <span className="text-[10px] text-white/50 ml-1">kg</span>
                               </div>
                               <div className="w-1/4 text-center">
                                  <span className="font-display font-black text-xl">{m.height}</span>
                                  <span className="text-[10px] text-white/50 ml-1">m</span>
                               </div>
                               <div className="w-1/4 flex items-center justify-end space-x-3">
                                  <div className="flex flex-col items-end">
                                    <span className={`font-display font-black text-2xl ${status.color}`}>{m.bmi}</span>
                                    <span className={`text-[8px] uppercase tracking-widest ${status.color} opacity-70`}>{status.text}</span>
                                  </div>
                                  <button onClick={() => handleDeleteMetric(m.id)} disabled={deletingId === m.id} className="p-2 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded transition-all">
                                    {deletingId === m.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                  </button>
                               </div>
                            </div>
                          );
                       })}
                    </div>
                 )}
               </div>
            </div>
         </div>
      </div>

      {/* New Metric Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md p-10 relative border-none overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="absolute top-0 right-0 w-32 h-32 bg-neon-green/10 blur-3xl -z-10" />
            
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-white/20 hover:text-white transition-colors z-10"
            >
              <X size={24} />
            </button>

            <header className="mb-8 space-y-2">
              <h2 className="text-3xl font-display font-black tracking-tighter uppercase italic -skew-x-12">
                NUEVO <span className="text-neon-green">CONTROL</span>
              </h2>
              <p className="text-[10px] uppercase text-white/40 tracking-widest font-bold">Registra el avance físico</p>
            </header>

            <form onSubmit={handleSaveMetric} className="space-y-6">
              <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-[10px] text-white/70 font-display font-black uppercase tracking-widest">Peso Actual (Kg)</label>
                    <div className="flex items-center space-x-4 bg-white/5 border-b-2 border-white/10 p-4 focus-within:bg-white/10 focus-within:border-neon-green transition-all">
                      <Scale size={18} className="text-white/50" />
                      <input 
                        required
                        type="number"
                        step="0.1" 
                        placeholder="Ej. 75.5"
                        className="w-full bg-transparent outline-none font-display font-black text-2xl placeholder:text-white/10"
                        value={newMetric.weight}
                        onChange={(e) => setNewMetric({...newMetric, weight: e.target.value})}
                      />
                      <span className="font-display font-bold text-white/30 text-xs">KG</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] text-white/70 font-display font-black uppercase tracking-widest">Estatura (Metros)</label>
                    <div className="flex items-center space-x-4 bg-white/5 border-b-2 border-white/10 p-4 focus-within:bg-white/10 focus-within:border-neon-blue transition-all">
                      <Ruler size={18} className="text-white/50" />
                      <input 
                        required
                        type="number" 
                        step="0.01"
                        placeholder="Ej. 1.75"
                        className="w-full bg-transparent outline-none font-display font-black text-2xl placeholder:text-white/10"
                        value={newMetric.height}
                        onChange={(e) => setNewMetric({...newMetric, height: e.target.value})}
                      />
                      <span className="font-display font-bold text-white/30 text-xs">M</span>
                    </div>
                  </div>
              </div>
              
              {/* Dynamic BMI Preview */}
              {(() => {
                 const w = parseFloat(newMetric.weight.replace(',', '.'));
                 let h = parseFloat(newMetric.height.replace(',', '.'));
                 if (h > 3) h = h / 100; // auto-fix cm
                 
                 if (w > 0 && h > 0) {
                   return (
                     <div className="bg-surface p-4 rounded-xl border border-white/10 flex justify-between items-center shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
                        <span className="text-[10px] text-white/50 font-display font-black uppercase tracking-widest leading-tight">
                           Índice de Masa Corporal<br/>
                           <span className="text-[8px] text-neon-green">Generado Automáticamente</span>
                        </span>
                        <span className="text-4xl font-display font-black text-neon-green">
                           {(w / (h * h)).toFixed(2)}
                        </span>
                     </div>
                   );
                 }
                 return null;
              })()}

              <button 
                type="submit"
                disabled={isSaving}
                className="w-full py-6 bg-neon-green text-black font-display font-black text-xl uppercase italic -skew-x-12 hover:scale-[1.02] active:scale-95 shadow-[0_10px_30px_rgba(156,255,147,0.2)] transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
              >
                {isSaving ? <Loader2 size={24} className="animate-spin" /> : <CheckCircle2 size={24} />}
                <span>GUARDAR CONTROL</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
