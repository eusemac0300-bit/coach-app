import React from 'react';
import { Camera, Mail, Phone, MapPin, Globe, CreditCard, Shield, Bell, ChevronRight, Zap } from 'lucide-react';

const ConfigItem = ({ icon: Icon, title, desc, active = false }: any) => (
  <div className="flex items-center px-10 py-6 hover:bg-white/5 transition-colors cursor-pointer group">
     <div className={`p-4 rounded-2xl mr-6 bg-white/5 ${active ? 'text-neon-green' : 'text-white/40'}`}>
        <Icon size={20} />
     </div>
     <div className="flex-1">
        <h4 className="font-bold text-xl">{title}</h4>
        <p className="text-white/20 text-sm font-display lowercase tracking-tight italic">{desc}</p>
     </div>
     <ChevronRight className="text-white/5 group-hover:text-white/30 transition-colors" />
  </div>
);

export const Perfil = () => {
  return (
    <div className="space-y-12">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-white/40 text-sm font-display font-bold uppercase tracking-wider mb-2">Mi Perfil</h2>
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
                  <span className="text-white/20 text-6xl font-black italic">EM</span>
               </div>
               <div className="absolute inset-0 bg-neon-green/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl">
                  <Camera className="text-black" size={32} />
               </div>
            </div>
            <h3 className="text-3xl font-display font-black tracking-tighter leading-none mb-2 text-center uppercase">Eusebio M.</h3>
            <p className="text-neon-green font-display font-bold text-xs uppercase tracking-widest mb-8">Personal Trainer</p>
            <div className="w-full space-y-4 pt-8 border-t border-white/5">
               <div className="flex items-center space-x-3 text-white/40 text-sm font-medium">
                  <Mail size={16} /><span className="truncate">eusebio@editorial.cl</span>
               </div>
               <div className="flex items-center space-x-3 text-white/40 text-sm font-medium">
                  <Phone size={16} /><span>+56 9 1234 5678</span>
               </div>
               <div className="flex items-center space-x-3 text-white/40 text-sm font-medium">
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
               <button className="flex-1 btn-secondary border-none bg-surface-high hover:bg-surface-highest transition-all py-5 font-black uppercase text-xs italic tracking-widest text-center">
                  EDITAR BIOGRAFÍA
               </button>
               <button className="flex-1 btn-secondary border-none bg-red-500/10 text-neon-red hover:bg-red-500/20 transition-all py-5 font-black uppercase text-xs italic tracking-widest text-center">
                  DESACTIVAR CUENTA
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};
