import { useState, useEffect } from 'react';
import { Download, TrendingUp, TrendingDown, DollarSign, Wallet, CreditCard, ChevronRight, Plus, X, Loader2, Trash2 } from 'lucide-react';
import { getFinancialRecords, createFinancialRecord, deleteFinancialRecord } from '../lib/api';
import type { FinancialRecord } from '../lib/types';

const FinanceMetric = ({ title, value, type, icon: Icon }: any) => (
  <div className="glass-card p-10 flex flex-col justify-between hover:bg-white/10 transition-colors">
     <div className="flex justify-between items-start mb-12">
       <span className="text-white/70 font-display font-bold text-xs uppercase tracking-widest">{title}</span>
       <div className={`p-4 rounded-3xl ${type === 'income' ? 'bg-neon-green/10 text-neon-green' : type === 'expense' ? 'bg-neon-red/10 text-neon-red' : 'bg-neon-blue/10 text-neon-blue'}`}>
          <Icon size={24} />
       </div>
     </div>
     <div className="flex items-baseline space-x-3">
        <span className="text-white/50 text-3xl font-display font-black leading-none italic uppercase -skew-x-12">$</span>
        <span className="text-5xl md:text-7xl font-display font-black leading-none tracking-tighter">{value}</span>
     </div>
  </div>
);

const TransactionRow = ({ tr, onDelete }: { tr: FinancialRecord, onDelete: (id: string) => void }) => {
  const displayAmount = Number(tr.amount).toLocaleString('es-CL');
  const dateObj = new Date(tr.date);
  const formattedDate = `${dateObj.getDate()} ${dateObj.toLocaleString('es-CL', { month: 'short' }).toUpperCase()}`;
  const title = tr.description || (tr.athletes ? `Pago: ${tr.athletes.full_name}` : "Transacción sin nombre");

  return (
    <div className="flex items-center px-10 py-6 hover:bg-white/5 transition-colors group relative overflow-hidden">
       <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mr-6 group-hover:scale-110 transition-transform">
          {tr.type === 'income' ? <TrendingUp className="text-neon-green" /> : <TrendingDown className="text-neon-red" />}
       </div>
       <div className="flex-1">
          <p className="font-bold text-xl uppercase tracking-tighter italic -skew-x-12">{title}</p>
          <span className="text-white/60 text-sm font-display lowercase tracking-tight italic font-medium">#{tr.category}</span>
       </div>
       <div className="flex-1 text-center">
          <p className="text-white/60 font-display font-bold text-xs uppercase tracking-widest leading-none mb-1">Fecha</p>
          <p className="font-display font-black font-medium tracking-tight whitespace-pre">{formattedDate}</p>
       </div>
       <div className="text-right pr-12">
          <p className={`text-2xl font-display font-black tracking-tight ${tr.type === 'income' ? 'text-neon-green' : 'text-neon-red'}`}>
            {tr.type === 'income' ? '+' : '-'}${displayAmount}
          </p>
          <span className="text-white/60 text-xs font-bold font-display uppercase tracking-widest leading-none">CLP</span>
       </div>
       
       <button 
         onClick={() => onDelete(tr.id)}
         className="absolute right-6 p-3 bg-red-500/10 text-red-500/40 hover:text-red-500 hover:bg-red-500/20 transition-all rounded-xl opacity-0 group-hover:opacity-100"
         title="Eliminar Transacción"
       >
         <Trash2 size={20} />
       </button>
    </div>
  );
};

export const Finanzas = () => {
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newTx, setNewTx] = useState<Partial<FinancialRecord>>({
    type: 'income',
    category: 'mensualidad',
    amount: "0",
    date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    description: "",
    status: 'paid'
  });

  const loadData = async () => {
    setIsLoading(true);
    const data = await getFinancialRecords();
    setRecords(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTx.amount || Number(newTx.amount) <= 0) return;

    await createFinancialRecord({
      type: newTx.type,
      category: newTx.category,
      amount: Number(newTx.amount),
      date: newTx.date,
      description: newTx.description || "Ingreso manual",
      status: 'paid'
    });

    setNewTx({
      type: 'income',
      category: 'mensualidad',
      amount: "0",
      date: new Date().toISOString().split('T')[0],
      description: "",
      status: 'paid'
    });
    setIsModalOpen(false);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este movimiento?")) {
      await deleteFinancialRecord(id);
      loadData();
    }
  };

  // Compute metrics
  const totalIncome = records.filter(r => r.type === 'income').reduce((sum, r) => sum + Number(r.amount), 0);
  const totalExpense = records.filter(r => r.type === 'expense').reduce((sum, r) => sum + Number(r.amount), 0);
  const netUtility = totalIncome - totalExpense;

  return (
    <div className="space-y-12 pb-20">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-white/60 text-sm font-display font-bold uppercase tracking-wider mb-2">Ingresos & Gastos</h2>
          <h1 className="text-7xl font-display font-black tracking-tighter uppercase whitespace-pre">FINANZAS</h1>
        </div>
        <button className="btn-secondary group flex items-center space-x-2 border-white/5 hover:bg-white/5">
          <Download size={20} className="text-white/70 group-hover:text-white transition-colors" />
          <span className="font-display font-bold text-sm text-white/50">DESCARGAR REPORTE</span>
        </button>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <FinanceMetric title="Ingresos Brutos" value={totalIncome.toLocaleString('es-CL')} type="income" icon={Wallet} />
         <FinanceMetric title="Gastos Totales" value={totalExpense.toLocaleString('es-CL')} type="expense" icon={CreditCard} />
         <FinanceMetric title="Utilidad Neta" value={netUtility.toLocaleString('es-CL')} type="net" icon={DollarSign} />
      </div>

      {/* Recent Transactions List */}
      <div className="glass-card bg-surface-low border-none mt-12 overflow-hidden">
        <div className="bg-surface-high/50 px-10 py-10 border-b border-white/5 flex items-end justify-between">
           <div>
              <h3 className="text-4xl font-display font-black tracking-tighter uppercase leading-none italic -skew-x-12">ÚLTIMOS MOVIMIENTOS</h3>
              <p className="text-white/60 font-display font-bold text-xs uppercase tracking-widest mt-2">{records.length} registros cargados</p>
           </div>
           <button 
             onClick={() => setIsModalOpen(true)}
             className="btn-primary space-x-2 flex items-center py-4 bg-neon-blue from-neon-blue to-cyan-500 rounded-2xl px-8 shadow-[0_0_20px_rgba(0,227,253,0.2)] hover:scale-105 transition-transform"
           >
              <Plus size={20} />
              <span className="font-black italic text-sm">NUEVO REGISTRO</span>
           </button>
        </div>
        
        <div className="divide-y divide-white/5">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-12 h-12 text-neon-blue animate-spin" />
            </div>
          ) : records.length > 0 ? (
            records.map(tr => <TransactionRow key={tr.id} tr={tr} onDelete={handleDelete} />)
          ) : (
             <div className="py-24 text-center space-y-4">
              <Wallet size={48} className="mx-auto text-white/5" />
              <p className="text-white/20 font-display font-black italic text-2xl uppercase tracking-widest">Sin registros financieros</p>
              <p className="text-white/10 font-display font-bold text-xs uppercase">Crea un ingreso o gasto para empezar tu contabilidad</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="glass-card w-full max-w-lg p-10 relative border-none bg-surface-low overflow-hidden zoom-in duration-300">
            <div className={`absolute top-0 right-0 w-32 h-32 blur-[100px] pointer-events-none ${newTx.type === 'income' ? 'bg-neon-green/20' : 'bg-neon-red/20'}`} />
            
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-10"
            >
              <X size={24} />
            </button>

            <h2 className="text-4xl font-display font-black tracking-tighter uppercase italic -skew-x-12 mb-8">
              AÑADIR <span className={newTx.type === 'income' ? 'text-neon-green' : 'text-neon-red'}>TRANSACCIÓN</span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="flex bg-white/5 rounded-lg p-1 border-2 border-white/10">
                <button 
                  type="button"
                  onClick={() => setNewTx({...newTx, type: 'income'})}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded font-display font-bold text-sm uppercase tracking-wider transition-all ${
                    newTx.type === 'income' ? 'bg-neon-green text-black shadow-[0_5px_20px_rgba(156,255,147,0.2)]' : 'text-white/60 hover:text-white'
                  }`}
                >
                  <TrendingUp size={16} />
                  <span>Ingreso (+)</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setNewTx({...newTx, type: 'expense'})}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded font-display font-bold text-sm uppercase tracking-wider transition-all ${
                    newTx.type === 'expense' ? 'bg-neon-red text-white shadow-[0_5px_20px_rgba(255,71,87,0.2)]' : 'text-white/60 hover:text-white'
                  }`}
                >
                  <TrendingDown size={16} />
                  <span>Gasto (-)</span>
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-white/70 font-display font-black uppercase tracking-widest text-neon-blue">MONTO (CLP)</label>
                <div className="flex items-center space-x-4 border-b-2 border-neon-blue/30 focus-within:border-neon-blue transition-colors pb-2">
                  <DollarSign size={24} className="text-neon-blue" />
                  <input 
                    type="text" 
                    required
                    className="w-full bg-transparent outline-none font-display font-black text-3xl"
                    value={newTx.amount === "0" ? "" : newTx.amount}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setNewTx({...newTx, amount: val});
                    }}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] text-white/70 font-display font-black uppercase tracking-widest">FECHA</label>
                  <input 
                    type="date"
                    required
                    className="w-full bg-white/5 border-2 border-white/10 p-4 font-display font-black text-sm uppercase focus:border-neon-blue outline-none [color-scheme:dark]"
                    value={newTx.date}
                    onChange={(e) => setNewTx({...newTx, date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-white/70 font-display font-black uppercase tracking-widest">CATEGORÍA</label>
                  <select 
                    className="w-full bg-white/5 border-2 border-white/10 p-4 font-display font-black text-sm uppercase focus:border-neon-blue outline-none [color-scheme:dark]"
                    value={newTx.category}
                    onChange={(e) => setNewTx({...newTx, category: e.target.value})}
                  >
                    {newTx.type === 'income' ? (
                      <>
                        <option value="mensualidad">MENSUALIDAD</option>
                        <option value="clase_suelta">CLASE SUELTA</option>
                        <option value="producto">PRODUCTO</option>
                        <option value="otros">OTROS</option>
                      </>
                    ) : (
                      <>
                        <option value="arriendo">ARRIENDO</option>
                        <option value="equipamiento">EQUIPAMIENTO</option>
                        <option value="sueldos">SUELDOS</option>
                        <option value="servicios">SERVICIOS BS.</option>
                        <option value="otros">OTROS</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-white/70 font-display font-black uppercase tracking-widest">DETALLE O REFERENCIA</label>
                <input
                  type="text"
                  required
                  placeholder={newTx.type === 'income' ? 'Ej: Mensualidad Juan' : 'Ej: Discos Bumper'}
                  className="w-full bg-white/5 border-2 border-white/10 p-4 font-display font-black text-lg uppercase outline-none focus:border-neon-blue"
                  value={newTx.description}
                  onChange={(e) => setNewTx({...newTx, description: e.target.value})}
                />
              </div>

              <button 
                type="submit"
                className={`w-full py-6 font-display font-black text-xl uppercase italic -skew-x-12 hover:scale-[1.02] active:scale-95 transition-all mt-4 ${
                  newTx.type === 'income' 
                    ? 'bg-neon-green text-black shadow-[0_10px_30px_rgba(156,255,147,0.2)]' 
                    : 'bg-neon-red text-white shadow-[0_10px_30px_rgba(255,71,87,0.2)]'
                }`}
              >
                REGISTRAR {newTx.type === 'income' ? 'INGRESO' : 'GASTO'}
              </button>
            </form>

          </div>
        </div>
      )}
    </div>
  );
};
