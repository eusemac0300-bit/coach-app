import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Calendar, ChevronRight, CheckCircle2, DollarSign, Users, Tag, Smartphone, Loader2, RotateCcw } from 'lucide-react';
import { createFinancialRecord, deleteAthleteMonthlyFinancialRecord } from '../lib/api';
import { toast } from 'sonner';
import type { Athlete, Group } from '../lib/types';

interface CierreRow {
  athlete: Athlete;
  groupName: string;
  baseFee: number;
  assistedDaysCalc: number;
  calculatedTotal: number;
}

export const CierreMes = () => {
  const [rows, setRows] = useState<CierreRow[]>([]);
  const [manualDays, setManualDays] = useState<Record<string, number>>({});
  const [notifiedState, setNotifiedState] = useState<Set<string>>(new Set());
  const [closedState, setClosedState] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isClosingAll, setIsClosingAll] = useState(false);

  // Generamos el texto del mes actual
  const monthNames = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthName = `${monthNames[currentMonth]} ${currentYear}`;

  const loadData = async () => {
    setIsLoading(true);
    
    // 1. Traer todos los atletas con sus grupos (para ver si tienen rebaja grupal o tarifa personal)
    // El frontend ya asume que pueden tener tarifa propia. La lógica de rebaja priorizará la tarifa de grupo si el grupo cobra menos o es lo definido?
    // Usaremos: if group has fee, and athlete fee is default/empty, use group fee. Otherwise athlete fee.
    // actually just read both and we'll use athlete.fee_per_session as default, but if group has fee_per_session we use it. 
    // The user said: "agregar en la sección grupo el precio por sesión con rebaja... pero cuando asiste solo debe mantener el valor de contrato de grupo"
    // So if the athlete has a group, we should use the group's fee! Let's do that.
    const { data: athletesData } = await supabase.from('athletes').select('*, groups(*)').order('full_name');
    
    // 2. Traer asistencias del mes actual
    // Select from session_attendance where created_at is this month
    const firstDay = new Date(currentYear, currentMonth, 1).toISOString();
    const lastDay = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59).toISOString();
    
    const { data: attendanceData } = await supabase
      .from('session_attendance')
      .select('*')
      .eq('status', 'present')
      .gte('created_at', firstDay)
      .lte('created_at', lastDay);

    const attendances = attendanceData || [];

    if (athletesData) {
      const computedRows: CierreRow[] = athletesData.map((a: any) => {
        // Find group
        const group: Group | null = a.groups;
        
        const individualFee = Number(a.fee_per_session) || 0;
        // BaseFee fallback (assume full capacity of 4 as average if needed, or 1 to avoid zero, mostly for reference)
        const dummyParticipantsCount = group ? (athletesData.filter((ath: any) => ath.group_id === group.id).length || 1) : 1;
        const baseFee = (group && Number(group.fee_per_session) > 0) 
            ? Number(group.fee_per_session) / dummyParticipantsCount 
            : individualFee;

        // Count assistances for this athlete
        const myAttendances = attendances.filter(att => att.athlete_id === a.id);
        const totalAssistances = myAttendances.length;

        // Calcular costo mixto exacto y DINÁMICO por sesión
        let exactTotal = 0;
        myAttendances.forEach(att => {
           const isExplicitlyIndividual = att.notes === 'Individual';
           
           if (group && Number(group.fee_per_session) > 0 && !isExplicitlyIndividual) {
              // Sesión del grupo: dividir entre los que asistieron ese día
              const dateIso = att.created_at.split('T')[0];
              
              // Contar cuántos atletas del mismo grupo asistieron ese día
              const groupAttendeesThatDay = attendances.filter((allAtt: any) => {
                 const allAthData = athletesData.find((aData: any) => aData.id === allAtt.athlete_id);
                 return allAthData?.group_id === group.id && allAtt.created_at.startsWith(dateIso);
              }).length || 1;
              
              exactTotal += Number(group.fee_per_session) / groupAttendeesThatDay;
           } else {
              // Individual o sin grupo: tarifa personal
              exactTotal += individualFee;
           }
        });

        return {
          athlete: a,
          groupName: group ? group.name : 'Individual',
          baseFee: baseFee,
          assistedDaysCalc: totalAssistances,
          calculatedTotal: exactTotal
        };
      });

      setRows(computedRows);
    }
    
    // Load notified state from localStorage for current month
    const savedNotified = localStorage.getItem(`notified_cierre_${currentYear}_${currentMonth}`);
    if (savedNotified) {
      setNotifiedState(new Set(JSON.parse(savedNotified)));
    }

    const savedClosed = localStorage.getItem(`closed_cierre_${currentYear}_${currentMonth}`);
    if (savedClosed) {
      setClosedState(new Set(JSON.parse(savedClosed)));
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleManualDayChange = (athleteId: string, days: string) => {
    const val = parseInt(days.replace(/\D/g, ''), 10);
    setManualDays(prev => ({
      ...prev,
      [athleteId]: isNaN(val) ? 0 : val
    }));
  };

  const generateWhatsappLink = (row: CierreRow, activeDays: number, total: number) => {
    const formattedTotal = total.toLocaleString('es-CL');
    const msg = `Hola ${row.athlete.full_name.split(' ')[0]}!\n\nDejo acá el detalle por tu mes de entrenamiento (${monthName}):\n- Días asistidos: ${activeDays} días\n*TOTAL A PAGAR: $${formattedTotal}*\n\n¡Gracias por tu tremendo esfuerzo! 🔥`;
    
    const phone = row.athlete.phone ? row.athlete.phone.replace(/\D/g, '') : '';
    return phone.length > 8 
      ? `https://wa.me/56${phone}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;
  };

  const handleNotifyAction = (athleteId: string, url: string) => {
    // Open WA in new tab
    window.open(url, '_blank', 'noopener,noreferrer');
    
    // Save to state and localStorage
    setNotifiedState(prev => {
      const next = new Set(prev);
      next.add(athleteId);
      localStorage.setItem(`notified_cierre_${currentYear}_${currentMonth}`, JSON.stringify([...next]));
      return next;
    });
  };

  const handleCloseClient = async (row: CierreRow, activeDays: number, total: number) => {
    if (closedState.has(row.athlete.id)) return;
    if (total <= 0) {
      toast.error('Este atleta tiene total 0. No requiere registro financiero.');
      return;
    }
    const success = await createFinancialRecord({
       type: 'income',
       amount: total,
       date: new Date().toISOString().split('T')[0],
       description: `Cobro ${monthName} - ${row.athlete.full_name.split(' ')[0]}`,
       athlete_id: row.athlete.id
    });
    
    if (success) {
      setClosedState(prev => {
        const next = new Set(prev);
        next.add(row.athlete.id);
        localStorage.setItem(`closed_cierre_${currentYear}_${currentMonth}`, JSON.stringify([...next]));
        return next;
      });
      toast.success(`Cierre financiero guardado para ${row.athlete.full_name}`);
    } else {
      toast.error('Error al registrar transacción');
    }
  };

  const handleRevertClose = async (row: CierreRow) => {
    if (!window.confirm(`¿Seguro que deseas ANULAR el cierre contable de ${row.athlete.full_name}? Esto eliminará el ingreso de Finanzas.`)) return;
    
    const desc = `Cobro ${monthName} - ${row.athlete.full_name.split(' ')[0]}`;
    const success = await deleteAthleteMonthlyFinancialRecord(row.athlete.id, desc);
    
    if (success) {
      setClosedState(prev => {
        const next = new Set(prev);
        next.delete(row.athlete.id);
        localStorage.setItem(`closed_cierre_${currentYear}_${currentMonth}`, JSON.stringify([...next]));
        return next;
      });
      toast.success('Cierre contable anulado correctamente.');
    } else {
      toast.error('Error al anular transacción.');
    }
  };

  const handleCloseAll = async () => {
    if (!window.confirm('¿Confirmas el CIERRE GLOBAL? Esto creará transacciones financieras de ingreso de todos los atletas que no estén cerrados en la tabla de Finanzas.')) return;
    setIsClosingAll(true);
    let count = 0;
    
    for (const row of rows) {
      if (!closedState.has(row.athlete.id)) {
        const hasManual = manualDays[row.athlete.id] !== undefined;
        const activeDays = hasManual ? manualDays[row.athlete.id] : row.assistedDaysCalc;
        const total = hasManual ? activeDays * row.baseFee : row.calculatedTotal;
        
        if (total > 0) {
           const success = await createFinancialRecord({
             type: 'income',
             amount: total,
             date: new Date().toISOString().split('T')[0],
             description: `Cobro ${monthName} - ${row.athlete.full_name.split(' ')[0]}`,
             athlete_id: row.athlete.id
           });
           
           if (success) {
               setClosedState(prev => {
                  const next = new Set(prev);
                  next.add(row.athlete.id);
                  localStorage.setItem(`closed_cierre_${currentYear}_${currentMonth}`, JSON.stringify([...next]));
                  return next;
               });
               count++;
           }
        }
      }
    }
    
    setIsClosingAll(false);
    if (count > 0) toast.success(`¡Cierre global finalizado! ${count} transacciones creadas en Finanzas.`);
    else toast.info(`Todo estaba cerrado o con total 0.`);
  };

  return (
    <div className="space-y-12 pb-20">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-white/60 text-sm font-display font-bold uppercase tracking-wider mb-2">Administración</h2>
          <h1 className="text-4xl md:text-7xl font-display font-black tracking-tighter uppercase leading-none">CIERRE<br/><span className="text-neon-green italic -skew-x-12 inline-block">{monthNames[currentMonth]}</span></h1>
        </div>
        <button 
          onClick={handleCloseAll} 
          disabled={isClosingAll} 
          className="flex items-center space-x-3 bg-neon-green/20 hover:bg-neon-green text-neon-green hover:text-black transition-all px-5 py-4 rounded-xl shadow-[0_0_20px_rgba(156,255,147,0.1)] border border-neon-green/30 active:scale-95 shrink-0"
        >
          {isClosingAll ? <Loader2 size={22} className="animate-spin" /> : <DollarSign size={22} />}
          <div className="font-display font-black uppercase text-sm leading-none flex flex-col text-left">
            <span>CERRAR TODOS</span>
            <span className="text-[10px] opacity-70">Sincronizar a Finanzas</span>
          </div>
        </button>
      </header>

      <div className="glass-card bg-surface-low border-none mt-12 overflow-hidden">
        <div className="bg-surface-high/50 px-10 py-8 border-b border-white/5 flex items-end justify-between">
           <div>
              <h3 className="text-4xl font-display font-black tracking-tighter uppercase leading-none italic -skew-x-12">ESTADO DE CUENTA CLIENTES</h3>
              <p className="text-white/60 font-display font-bold text-xs uppercase tracking-widest mt-2">Envía rápidamente el resumen vía WhatsApp</p>
           </div>
        </div>
        
        {/* Desktop column headers - hidden on mobile */}
        <div className="hidden md:flex bg-surface-high/30 px-10 py-4 border-b border-white/5 text-white/50 font-display font-bold text-[10px] uppercase tracking-widest">
           <div className="w-1/4">Atleta / Tipo</div>
           <div className="w-1/5 text-center">Valor Base Contrato</div>
           <div className="w-1/5 text-center">Días Asistidos (Calculado / Manual)</div>
           <div className="w-1/5 text-right">Monto Total Mensual</div>
           <div className="flex-1 text-right">Acción</div>
        </div>

        <div className="divide-y divide-white/5">
          {isLoading ? (
            <div className="flex justify-center py-20">
               <Loader2 className="w-12 h-12 text-neon-green animate-spin" />
            </div>
          ) : rows.length > 0 ? (
            rows.map(row => {
              // Priority: Manual override, else DB calc
              const hasManual = manualDays[row.athlete.id] !== undefined;
              const activeDays = hasManual ? manualDays[row.athlete.id] : row.assistedDaysCalc;
              const total = hasManual ? activeDays * row.baseFee : row.calculatedTotal;
              
              // To show mixed rate nicely if calculatedTotal is weird
              const displayRate = activeDays > 0 && !hasManual ? (total / activeDays) : row.baseFee;

              return (
                <div key={row.athlete.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                   {/* Desktop row */}
                   <div className="hidden md:flex items-center px-10 py-6">
                     <div className="w-1/4">
                        <p className="font-bold text-xl uppercase tracking-tighter italic -skew-x-12">{row.athlete.full_name}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          {row.groupName === 'Individual' ? (
                            <span className="text-neon-blue font-display font-bold text-[9px] uppercase tracking-widest bg-neon-blue/10 px-2 py-0.5 rounded">Personalizado</span>
                          ) : (
                            <span className="text-neon-green font-display font-bold text-[9px] uppercase tracking-widest bg-neon-green/10 px-2 py-0.5 rounded flex items-center"><Users size={10} className="mr-1"/>{row.groupName}</span>
                          )}
                        </div>
                     </div>
                     <div className="w-1/5 text-center flex flex-col items-center">
                        <div className="flex items-center space-x-1 text-white/80">
                           <Tag size={12} className="text-neon-blue" />
                           <span className="font-display font-black text-lg">${displayRate.toLocaleString('es-CL', {maximumFractionDigits: 0})}</span>
                        </div>
                        <span className="text-[9px] font-display text-white/30 uppercase tracking-widest">por sesión (promedio)</span>
                     </div>
                     <div className="w-1/5 flex flex-col items-center justify-center">
                        <input 
                          type="number" min="0"
                          className="w-20 bg-white/5 border border-white/10 rounded-lg text-center font-display font-black text-2xl py-2 outline-none focus:border-neon-green focus:bg-white/10 transition-colors"
                          value={activeDays}
                          onChange={(e) => handleManualDayChange(row.athlete.id, e.target.value)}
                        />
                        <span className="text-[9px] font-display text-white/30 uppercase tracking-widest mt-1">{hasManual ? 'Ajuste Manual' : 'Calculado Auto'}</span>
                     </div>
                     <div className="w-1/5 text-right">
                        <p className="text-3xl font-display font-black tracking-tighter text-neon-green">${total.toLocaleString('es-CL')}</p>
                        <span className="text-[9px] font-display text-neon-green/50 uppercase tracking-widest leading-none">Total Cobro</span>
                     </div>
                     <div className="flex-1 flex justify-end space-x-3">
                       {/* Cobrar */}
                       {closedState.has(row.athlete.id) ? (
                         <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-2 text-neon-green/50 bg-neon-green/5 px-2 py-2 rounded border border-neon-green/10">
                               <DollarSign size={16} />
                               <span className="font-display font-black uppercase text-[10px] tracking-widest">Pagado</span>
                            </div>
                            <button onClick={() => handleRevertClose(row)} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-black rounded-lg transition-all" title="Revertir"><RotateCcw size={14} strokeWidth={3} /></button>
                         </div>
                       ) : (
                         <button onClick={() => handleCloseClient(row, activeDays, total)} className="p-3 bg-neon-green/10 text-neon-green hover:bg-neon-green hover:text-black transition-all rounded-xl" title="Cerrar"><DollarSign size={18} /></button>
                       )}
                       {/* Notificar */}
                       {notifiedState.has(row.athlete.id) ? (
                         <div className="flex items-center space-x-1 bg-neon-green/20 text-neon-green px-3 py-2 rounded-xl border border-neon-green/40">
                            <CheckCircle2 size={16} strokeWidth={2.5} />
                            <span className="font-display font-black uppercase text-[9px] tracking-widest">ENVIADO</span>
                            <button onClick={() => handleNotifyAction(row.athlete.id, generateWhatsappLink(row, activeDays, total))} className="ml-1 text-neon-green/50 hover:text-white" title="Reenviar"><Smartphone size={12} /></button>
                         </div>
                       ) : (
                         <button onClick={() => handleNotifyAction(row.athlete.id, generateWhatsappLink(row, activeDays, total))} className="p-3 bg-white/5 text-white/50 hover:bg-white hover:text-black transition-all rounded-xl flex items-center space-x-2" title="WhatsApp">
                           <Smartphone size={18} />
                           <span className="font-display font-black uppercase text-xs tracking-wider">Notificar</span>
                         </button>
                       )}
                     </div>
                   </div>

                   {/* Mobile card */}
                   <div className="md:hidden p-4 space-y-3">
                     <div className="flex items-start justify-between">
                       <div>
                         <p className="font-bold text-base uppercase tracking-tighter italic -skew-x-12">{row.athlete.full_name}</p>
                         {row.groupName !== 'Individual' ? (
                           <span className="text-neon-green font-display font-bold text-[9px] uppercase tracking-widest bg-neon-green/10 px-2 py-0.5 rounded">{row.groupName}</span>
                         ) : (
                           <span className="text-neon-blue font-display font-bold text-[9px] uppercase tracking-widest bg-neon-blue/10 px-2 py-0.5 rounded">Individual</span>
                         )}
                       </div>
                       <p className="text-xl font-display font-black text-neon-green">${total.toLocaleString('es-CL')}</p>
                     </div>
                     <div className="flex items-center gap-3">
                       <div className="flex-1">
                         <p className="text-[9px] text-white/40 uppercase font-black tracking-widest mb-1">Días Asistidos</p>
                         <input 
                           type="number" min="0"
                           className="w-full bg-white/5 border border-white/10 rounded-lg text-center font-display font-black text-xl py-2 outline-none focus:border-neon-green"
                           value={activeDays}
                           onChange={(e) => handleManualDayChange(row.athlete.id, e.target.value)}
                         />
                         <p className="text-[9px] text-white/30 text-center mt-1">{hasManual ? 'Manual' : 'Auto'}</p>
                       </div>
                       <div className="flex flex-col gap-2">
                         {closedState.has(row.athlete.id) ? (
                           <button onClick={() => handleRevertClose(row)} className="p-2 bg-red-500/10 text-red-500 rounded-lg" title="Revertir"><RotateCcw size={16} /></button>
                         ) : (
                           <button onClick={() => handleCloseClient(row, activeDays, total)} className="p-2 bg-neon-green/10 text-neon-green rounded-lg" title="Cerrar"><DollarSign size={18} /></button>
                         )}
                         <button onClick={() => handleNotifyAction(row.athlete.id, generateWhatsappLink(row, activeDays, total))} className={`p-2 rounded-lg ${notifiedState.has(row.athlete.id) ? 'bg-neon-green/20 text-neon-green' : 'bg-white/5 text-white/50'}`} title="WhatsApp"><Smartphone size={18} /></button>
                       </div>
                     </div>
                   </div>
                </div>
              );
            })
          ) : (
          ) : (
             <div className="py-24 text-center space-y-4">
              <DollarSign size={48} className="mx-auto text-white/5" />
              <p className="text-white/20 font-display font-black italic text-2xl uppercase tracking-widest">Sin atletas registrados</p>
              <p className="text-white/10 font-display font-bold text-xs uppercase">Para emitir cobros debes crear atletas primero</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
