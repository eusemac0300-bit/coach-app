import React from 'react';
import { Download, TrendingUp, TrendingDown, DollarSign, Wallet, CreditCard, ChevronRight } from 'lucide-react';

const FinanceMetric = ({ title, value, type, icon: Icon }: any) => (
  <div className="glass-card p-10 flex flex-col justify-between hover:bg-white/10 transition-colors">
     <div className="flex justify-between items-start mb-12">
       <span className="text-white/40 font-display font-bold text-xs uppercase tracking-widest">{title}</span>
       <div className={`p-4 rounded-3xl ${type === 'income' ? 'bg-neon-green/10 text-neon-green' : type === 'expense' ? 'bg-neon-red/10 text-neon-red' : 'bg-neon-blue/10 text-neon-blue'}`}>
          <Icon size={24} />
       </div>
     </div>
     <div className="flex items-baseline space-x-3">
        <span className="text-white/20 text-3xl font-display font-black leading-none italic uppercase -skew-x-12">$</span>
        <span className="text-5xl md:text-7xl font-display font-black leading-none tracking-tighter">{value}</span>
     </div>
  </div>
);

const TransactionRow = ({ tr }: any) => (
  <div className="flex items-center px-10 py-6 hover:bg-white/5 transition-colors cursor-pointer group">
     <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mr-6 group-hover:scale-110 transition-transform">
        {tr.type === 'income' ? <TrendingUp className="text-neon-green" /> : <TrendingDown className="text-neon-red" />}
     </div>
     <div className="flex-1">
        <p className="font-bold text-xl">{tr.name}</p>
        <span className="text-white/40 text-sm font-display lowercase tracking-tight italic opacity-60 font-medium">#{tr.category}</span>
     </div>
     <div className="flex-1 text-center">
        <p className="text-white/20 font-display font-bold text-xs uppercase tracking-widest leading-none mb-1">Fecha</p>
        <p className="font-display font-black font-medium tracking-tight whitespace-pre">{tr.date}</p>
     </div>
     <div className="text-right">
        <p className={`text-2xl font-display font-black tracking-tight ${tr.type === 'income' ? 'text-neon-green' : 'text-neon-red'}`}>
          {tr.type === 'income' ? '+' : '-'}${tr.amount}
        </p>
        <span className="text-white/20 text-xs font-bold font-display uppercase tracking-widest">USD</span>
     </div>
     <ChevronRight className="ml-8 text-white/5 group-hover:text-white/30 transition-colors" />
  </div>
);

export const Finanzas = () => {
  const transactions = [
    { id: 1, name: "Suscripción Atleta: Carlos", amount: 150, type: "income", category: "mensualidad", date: "MAR 22" },
    { id: 2, name: "Arriendo Gimnasio", amount: 450, type: "expense", category: "costos", date: "MAR 21" },
    { id: 3, name: "Sesión PT: Lucía M.", amount: 45, type: "income", category: "clase-suelta", date: "MAR 21" },
    { id: 4, name: "Suscripción Atleta: Elena", amount: 150, type: "income", category: "mensualidad", date: "MAR 20" },
    { id: 5, name: "Reparación Equipamiento", amount: 80, type: "expense", category: "mantención", date: "MAR 18" },
  ];

  return (
    <div className="space-y-12">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-white/40 text-sm font-display font-bold uppercase tracking-wider mb-2">Ingresos & Gastos</h2>
          <h1 className="text-7xl font-display font-black tracking-tighter uppercase whitespace-pre">FINANZAS</h1>
        </div>
        <button className="btn-secondary group flex items-center space-x-2 border-white/5 hover:bg-white/5">
          <Download size={20} className="text-white/40 group-hover:text-white/80 transition-colors" />
          <span className="font-display font-bold text-sm">DESCARGAR REPORTE</span>
        </button>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <FinanceMetric title="Ingresos Brutos" value="1.850" type="income" icon={Wallet} />
         <FinanceMetric title="Gastos Totales" value="530" type="expense" icon={CreditCard} />
         <FinanceMetric title="Utilidad Neta" value="1.320" type="net" icon={DollarSign} />
      </div>

      {/* Recent Transactions List */}
      <div className="glass-card bg-surface-low border-none overflow-hidden mt-12">
        <div className="bg-surface-high/50 px-10 py-10 border-b border-white/5 flex items-end justify-between">
           <div>
              <h3 className="text-4xl font-display font-black tracking-tighter uppercase leading-none">ÚLTIMOS MOVIMIENTOS</h3>
              <p className="text-white/20 font-display font-bold text-xs uppercase tracking-widest mt-2">{transactions.length} registros este mes</p>
           </div>
           <button className="btn-primary space-x-2 flex items-center py-4 bg-neon-blue from-neon-blue to-cyan-500 rounded-2xl px-8 shadow-[0_0_20px_rgba(0,227,253,0.2)]">
              <span className="font-black italic text-sm">NUEVO REGISTRO</span>
           </button>
        </div>
        <div className="divide-y divide-white/5">
           {transactions.map(tr => <TransactionRow key={tr.id} tr={tr} />)}
        </div>
      </div>
    </div>
  );
};
