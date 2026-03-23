import React from 'react';
import { Target, Users, TrendingUp, Calendar, Zap } from 'lucide-react';

const StatCard = ({ title, value, unit, icon: Icon, colorClass = "text-neon-green" }: any) => (
  <div className="glass-card p-6 flex flex-col justify-between hover:bg-white/10 transition-colors group">
    <div className="flex justify-between items-start mb-8">
      <span className="text-white/40 font-display font-bold text-xs uppercase tracking-widest">{title}</span>
      <Icon className={colorClass} size={18} />
    </div>
    <div className="flex items-baseline space-x-2">
      <span className="text-5xl font-display font-black leading-none">{value}</span>
      {unit && <span className="text-white/20 text-sm font-bold">{unit}</span>}
    </div>
  </div>
);

export const Dashboard = () => {
  return (
    <div className="space-y-12">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-white/40 text-sm font-display font-bold uppercase tracking-wider mb-2">Resumen General</h2>
          <h1 className="text-7xl font-display font-black tracking-tighter">
            HOLA, <span className="text-neon-green">COACH</span>.
          </h1>
        </div>
        <button className="btn-primary group flex items-center space-x-2">
          <Zap size={20} fill="black" />
          <span>INICIAR SESIÓN</span>
        </button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Atletas Activos" value="24" unit="ATH" icon={Users} />
        <StatCard title="Ingresos Mes" value="2.4" unit="K USD" icon={TrendingUp} colorClass="text-neon-blue" />
        <StatCard title="Sesiones Hoy" value="06" unit="SESS" icon={Calendar} />
        <StatCard title="Promedio Metas" value="88" unit="%" icon={Target} colorClass="text-amber-400" />
      </div>

      {/* Row 2: Recent Activity & Next sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card p-8">
          <h3 className="font-display font-black text-2xl mb-8 flex items-center space-x-3">
            <span className="w-2 h-8 bg-neon-green" />
            <span>RENDIMIENTO SEMANAL</span>
          </h3>
          <div className="h-64 flex items-end space-x-4">
             {/* Simple visual placeholder for chart */}
             {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
               <div key={i} className="flex-1 bg-white/5 rounded-t-lg relative group transition-all hover:bg-neon-green/20">
                 <div 
                    className="absolute bottom-0 left-0 right-0 bg-neon-green rounded-t-lg transition-all" 
                    style={{ height: `${h}%` }}
                 />
               </div>
             ))}
          </div>
          <div className="flex justify-between mt-4 text-white/20 font-display font-bold text-xs">
            <span>LUN</span><span>MAR</span><span>MIE</span><span>JUE</span><span>VIE</span><span>SAB</span><span>DOM</span>
          </div>
        </div>

        <div className="glass-card p-8 flex flex-col">
          <h3 className="font-display font-black text-2xl mb-8 flex items-center space-x-3">
            <span className="w-2 h-8 bg-neon-blue" />
            <span>PRÓXIMAS CITAS</span>
          </h3>
          <div className="space-y-6">
            {[
              { name: "Carlos Perez", time: "18:30", type: "Fuerza Intensa" },
              { name: "Lucía M.", time: "19:45", type: "Cardio HI" },
              { name: "Pedro Gomez", time: "21:00", type: "Evaluación" },
            ].map((sess, i) => (
              <div key={i} className="flex justify-between items-center group cursor-pointer hover:translate-x-2 transition-transform">
                <div>
                  <p className="font-bold text-lg">{sess.name}</p>
                  <p className="text-white/40 text-sm font-display">{sess.type}</p>
                </div>
                <div className="text-right">
                  <p className="font-display font-black text-xl text-neon-blue">{sess.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
