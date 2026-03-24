import { useState, useEffect } from 'react';
import { Target, Users, TrendingUp, Calendar, Zap, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAthletes, getFinancialRecords, getCoachProfile } from '../lib/api';
import { supabase } from '../lib/supabase';
import type { Athlete, FinancialRecord, Coach } from '../lib/types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { es } from 'date-fns/locale';

const StatCard = ({ title, value, unit, icon: Icon, colorClass = "text-neon-green" }: any) => (
  <div className="glass-card p-4 md:p-6 flex flex-col justify-between hover:bg-white/10 transition-all hover:scale-105 duration-300 group relative overflow-hidden">
    <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-20 -z-10 bg-current ${colorClass}`} />
    <div className="flex justify-between items-start mb-4 md:mb-8">
      <span className="text-white/70 font-display font-bold text-[10px] uppercase tracking-widest">{title}</span>
      <Icon className={colorClass} size={16} />
    </div>
    <div className="flex items-baseline space-x-2 relative z-10">
      <span className="text-3xl md:text-5xl font-display font-black leading-none tracking-tighter">{value}</span>
      {unit && <span className="text-white/50 text-xs md:text-sm font-bold">{unit}</span>}
    </div>
  </div>
);

export const Dashboard = () => {
  const [coachName, setCoachName] = useState("COACH");
  const [activeAthletes, setActiveAthletes] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = async () => {
    setIsLoading(true);
    const [athData, finData, coachData] = await Promise.all([
      getAthletes(),
      getFinancialRecords(),
      getCoachProfile()
    ]);
    
    if (coachData) {
      setCoachName(coachData.full_name.split(' ')[0]);
    }
    
    setActiveAthletes(athData.length);
    
    const incomeThisMonth = finData.filter(f => f.type === 'income').reduce((sum, item) => sum + Number(item.amount), 0);
    setMonthlyIncome(incomeThisMonth);
    
    // Generar datos para el gráfico (últimos 7 días)
    const last7Days = Array.from({length: 7}).map((_, i) => {
       const d = subDays(new Date(), 6 - i);
       return d;
    });

    const start = startOfDay(last7Days[0]);
    const end = endOfDay(last7Days[6]);

    const { data: attendanceData } = await supabase.from('session_attendance')
        .select('created_at, status')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString());

    const chartData = last7Days.map(date => {
       const strDate = date.toISOString().split('T')[0];
       const count = (attendanceData || []).filter(a => a.created_at.startsWith(strDate) && a.status === 'present').length;
       return {
         name: format(date, 'EEE', { locale: es }).toUpperCase(),
         dateStr: strDate,
         asistencias: count
       };
    });

    setPerformanceData(chartData);
    setIsLoading(false);
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-40">
        <Loader2 className="w-12 h-12 text-neon-green animate-spin" />
      </div>
    );
  }

  const incomeFormatted = monthlyIncome >= 1000000 
    ? (monthlyIncome / 1000000).toFixed(1)
    : monthlyIncome > 0 ? (monthlyIncome / 1000).toFixed(0) : "0";
    
  const incomeUnit = monthlyIncome >= 1000000 ? "M CLP" : "K CLP";

  const totalAsistenciasSemana = performanceData.reduce((sum, d) => sum + d.asistencias, 0);

  return (
    <div className="space-y-8 md:space-y-12 pb-20">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-white/60 text-sm font-display font-bold uppercase tracking-wider mb-2">Panel Central</h2>
          <h1 className="text-4xl md:text-7xl font-display font-black tracking-tighter">
            HOLA, <span className="text-neon-green uppercase italic -skew-x-12">{coachName}</span>.
          </h1>
        </div>
        <Link to="/agenda" className="btn-primary group flex items-center space-x-2 italic -skew-x-12 shadow-[0_0_30px_rgba(156,255,147,0.2)] text-sm md:text-base">
          <Calendar size={18} fill="black" />
          <span>IR A LA AGENDA</span>
        </Link>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard title="Atletas Vinculados" value={activeAthletes} unit="ACTIVOS" icon={Users} />
        <StatCard title="Ingresos del Mes" value={incomeFormatted} unit={incomeUnit} icon={TrendingUp} colorClass="text-neon-blue" />
        <StatCard title="Asistencias Semanales" value={totalAsistenciasSemana} unit="SESIONES" icon={Zap} colorClass="text-amber-400" />
        <StatCard title="Promedio Metas" value="--" unit="%" icon={Target} colorClass="text-neon-red" />
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 glass-card p-5 md:p-8 bg-surface-low border-none relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-neon-green/5 blur-[100px] -z-10 rounded-full" />
          
          <div className="flex justify-between items-center mb-8">
             <h3 className="font-display font-black text-2xl flex items-center space-x-3">
               <span className="w-2 h-8 bg-neon-green" />
               <span className="italic -skew-x-12">RendIMIENTO TRáfico (7 Días)</span>
             </h3>
             <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-[10px] font-display font-bold uppercase tracking-widest text-white/50 flex items-center">
                <span className="w-2 h-2 rounded-full bg-neon-green mr-2 shadow-[0_0_10px_rgba(156,255,147,1)]" /> EN VIVO
             </div>
          </div>
          
          <div className="h-[300px] w-full mt-4">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                   <defs>
                      <linearGradient id="colorAsistencias" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#9cff93" stopOpacity={0.8}/>
                         <stop offset="95%" stopColor="#9cff93" stopOpacity={0}/>
                      </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                   <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{fontFamily: 'Outfit', fontWeight: 800, fontSize: 10}} axisLine={false} tickLine={false} />
                   <YAxis stroke="rgba(255,255,255,0.3)" tick={{fontFamily: 'Outfit', fontWeight: 800, fontSize: 10}} axisLine={false} tickLine={false} allowDecimals={false} />
                   <Tooltip 
                     contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(156,255,147,0.3)', borderRadius: '12px', fontFamily: 'Outfit' }}
                     itemStyle={{ color: '#fff', fontWeight: 900 }}
                     labelStyle={{ color: '#9cff93', fontWeight: 900, textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.1em' }}
                   />
                   <Area 
                     type="monotone" 
                     dataKey="asistencias" 
                     name="Visitas"
                     stroke="#9cff93" 
                     strokeWidth={3}
                     fillOpacity={1} 
                     fill="url(#colorAsistencias)" 
                     animationDuration={1500}
                     animationEasing="ease-in-out"
                   />
                </AreaChart>
             </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-8 flex flex-col bg-surface-low border-none relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-neon-blue/10 blur-[50px] -z-10 rounded-full" />
          
          <h3 className="font-display font-black text-2xl mb-8 flex items-center space-x-3">
            <span className="w-2 h-8 bg-neon-blue" />
            <span className="italic -skew-x-12">ACCESOS RÁPIDOS</span>
          </h3>
          
          <div className="space-y-4 flex-1 flex flex-col justify-center">
             <Link to="/clientes" className="flex items-center space-x-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-neon-blue/10 text-neon-blue flex items-center justify-center group-hover:scale-110 transition-transform">
                   <Users size={20} />
                </div>
                <div>
                   <p className="font-display font-black text-white uppercase tracking-tight">Atletas</p>
                   <p className="text-[10px] text-white/50 uppercase font-bold">Ver Perfiles y Fichas Médicas</p>
                </div>
             </Link>

             <Link to="/cierre-mes" className="flex items-center space-x-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-neon-green/10 text-neon-green flex items-center justify-center group-hover:scale-110 transition-transform">
                   <Target size={20} />
                </div>
                <div>
                   <p className="font-display font-black text-white uppercase tracking-tight">Cierre de Mes</p>
                   <p className="text-[10px] text-white/50 uppercase font-bold">Automatizar Cobros y WhatsApp</p>
                </div>
             </Link>
             
             <Link to="/finanzas" className="flex items-center space-x-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                   <TrendingUp size={20} />
                </div>
                <div>
                   <p className="font-display font-black text-white uppercase tracking-tight">Finanzas</p>
                   <p className="text-[10px] text-white/50 uppercase font-bold">Resumen Económico y Gastos</p>
                </div>
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
