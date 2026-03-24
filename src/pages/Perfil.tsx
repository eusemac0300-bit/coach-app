import { useState, useEffect } from 'react';
import { Camera, Mail, Phone, MapPin, Globe, CreditCard, Shield, Bell, ChevronRight, Zap, CheckCircle2, Loader2, X } from 'lucide-react';
import { getCoachProfile, updateCoachProfile } from '../lib/api';
import type { Coach } from '../lib/types';

const ConfigItem = ({ icon: Icon, title, desc, active = false }: any) => (
  <div className="flex items-center px-10 py-6 hover:bg-white/5 transition-colors cursor-pointer group">
     <div className={`p-4 rounded-2xl mr-6 bg-white/5 ${active ? 'text-neon-green' : 'text-white/60'}`}>
        <Icon size={20} />
     </div>
     <div className="flex-1">
        <h4 className="font-bold text-xl">{title}</h4>
        <p className="text-white/50 text-sm font-display lowercase tracking-tight italic">{desc}</p>
     </div>
     <ChevronRight className="text-white/20 group-hover:text-white/60 transition-colors" />
  </div>
);

export const Perfil = () => {
  const [coach, setCoach] = useState<Coach | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Coach>>({});

  const loadProfile = async () => {
    setIsLoading(true);
    const data = await getCoachProfile();
    setCoach(data);
    if (data) {
      setEditForm({
        full_name: data.full_name,
        email: data.email,
        specialty: data.specialty || 'Personal Trainer',
        bio: data.bio || ''
      });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (coach?.id && editForm.full_name) {
      const success = await updateCoachProfile(coach.id, editForm);
      if (success) {
        setCoach({ ...coach, ...editForm });
        setIsEditMode(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-40">
        <Loader2 className="w-12 h-12 text-neon-green animate-spin" />
      </div>
    );
  }

  if (!coach) return <div className="p-10 text-center">Error al cargar perfil.</div>;

  return (
    <div className="space-y-12 pb-20">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-white/60 text-sm font-display font-bold uppercase tracking-wider mb-2">Mi Perfil</h2>
          <h1 className="text-7xl font-display font-black tracking-tighter uppercase whitespace-pre">CONFIGURACIÓN</h1>
        </div>
        <button className="btn-primary group flex items-center space-x-2 bg-neon-blue from-neon-blue to-cyan-500 shadow-[0_0_20px_rgba(0,227,253,0.2)]">
          <Zap size={20} fill="black" />
          <span>ESTADO: ACTIVO</span>
        </button>
      </header>

      {/* Main Profile Info */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         <div className="lg:col-span-1 glass-card p-10 flex flex-col items-center">
            <div className="relative group w-40 h-40 mb-8 cursor-pointer">
               <div className="w-full h-full rounded-3xl bg-white/10 flex items-center justify-center overflow-hidden">
                  <span className="text-white/50 text-6xl font-black italic">{coach.full_name?.charAt(0)?.toUpperCase() || 'E'}</span>
               </div>
               <div className="absolute inset-0 bg-neon-green/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl">
                  <Camera className="text-black" size={32} />
               </div>
            </div>
            <h3 className="text-3xl font-display font-black tracking-tighter leading-none mb-2 text-center uppercase">{coach.full_name}</h3>
            <p className="text-neon-green font-display font-bold text-xs uppercase tracking-widest mb-8">{editForm.specialty}</p>
            <div className="w-full space-y-4 pt-8 border-t border-white/5">
               <div className="flex items-center space-x-3 text-white/70 text-sm font-medium">
                  <Mail size={16} /><span className="truncate">{coach.email}</span>
               </div>
               <div className="flex items-center space-x-3 text-white/70 text-sm font-medium">
                  <Phone size={16} /><span>{coach.bio ? coach.bio : '+56 X XXXX XXXX'}</span>
               </div>
               <div className="flex items-center space-x-3 text-white/70 text-sm font-medium">
                  <MapPin size={16} /><span>Santiago, Chile</span>
               </div>
            </div>
         </div>

         <div className="lg:col-span-3 space-y-8">
            <div className="glass-card bg-surface-low border-none overflow-hidden">
               <div className="px-10 py-8 border-b border-white/5 bg-surface-high/50">
                  <h3 className="text-2xl font-display font-black tracking-tight uppercase italic -skew-x-12">SISTEMA & PREFERENCIAS</h3>
               </div>
               <div className="divide-y divide-white/5">
                  <ConfigItem icon={CreditCard} title="Métodos de Pago" desc="Gestiona tus cuentas y facturación" />
                  <ConfigItem icon={Globe} title="Suscripción Coach" desc="Plan Pro (Anual) - Vence en JUL 2026" />
                  <ConfigItem icon={Shield} title="Seguridad & Privacidad" desc="Autenticación de dos pasos activada" />
                  <ConfigItem icon={Bell} title="Notificaciones" desc="Configura alertas de sistema y sesiones" active />
               </div>
            </div>

            <div className="flex space-x-4">
               <button 
                 onClick={() => setIsEditMode(true)}
                 className="flex-1 btn-secondary border-none bg-surface-high hover:bg-surface-highest transition-all py-5 font-black uppercase text-xs italic tracking-widest text-center focus:outline-none"
               >
                  EDITAR PERFIL
               </button>
               <button className="flex-1 btn-secondary border-none bg-red-500/10 text-neon-red hover:bg-red-500/20 transition-all py-5 font-black uppercase text-xs italic tracking-widest text-center focus:outline-none">
                  DESACTIVAR CUENTA
               </button>
            </div>
         </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in zoom-in duration-200">
          <div className="glass-card w-full max-w-lg p-10 relative border-none bg-surface-low overflow-hidden">
            <button 
              onClick={() => setIsEditMode(false)}
              className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-10"
            >
              <X size={24} />
            </button>

            <h2 className="text-4xl font-display font-black tracking-tighter uppercase italic -skew-x-12 mb-8">
              EDITAR <span className="text-neon-blue">PERFIL</span>
            </h2>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] text-white/70 font-display font-black uppercase tracking-widest">Nombre del Coach</label>
                <input 
                  autoFocus
                  required
                  type="text" 
                  className="w-full bg-white/5 border-2 border-white/10 p-4 font-display font-black text-xl uppercase focus:border-neon-blue outline-none"
                  value={editForm.full_name}
                  onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-white/70 font-display font-black uppercase tracking-widest">Especialidad</label>
                <input 
                  type="text" 
                  className="w-full bg-white/5 border-2 border-white/10 p-4 font-display font-black text-sm uppercase focus:border-neon-blue outline-none"
                  value={editForm.specialty}
                  onChange={(e) => setEditForm({...editForm, specialty: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] text-white/70 font-display font-black uppercase tracking-widest">Email (No modificable desde aquí)</label>
                <input 
                  type="email" 
                  disabled
                  className="w-full bg-white/5 border-2 border-transparent p-4 font-display font-black text-sm uppercase outline-none text-white/30"
                  value={editForm.email}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] text-white/70 font-display font-black uppercase tracking-widest">Biografía o Teléfono (Opcional)</label>
                <textarea 
                  rows={2}
                  className="w-full bg-white/5 border-2 border-white/10 p-4 font-display font-bold text-sm outline-none focus:border-neon-blue resize-none"
                  value={editForm.bio}
                  onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-neon-blue text-black py-6 font-display font-black text-xl uppercase italic -skew-x-12 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_20px_40px_rgba(0,227,253,0.2)] flex items-center justify-center space-x-2"
              >
                <CheckCircle2 size={24} />
                <span>GUARDAR CAMBIOS</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
