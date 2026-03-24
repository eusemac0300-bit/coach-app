import { NavLink } from 'react-router-dom';
import { Toaster } from 'sonner';
import { LayoutDashboard, Users, Calendar, Wallet, UserCircle, LogOut, Users2, Dumbbell, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Users, label: 'Clientes', path: '/clientes' },
  { icon: Users2, label: 'Grupos', path: '/grupos' },
  { icon: Calendar, label: 'Agenda', path: '/agenda' },
  { icon: Dumbbell, label: 'Ejercicios', path: '/ejercicios' },
  { icon: DollarSign, label: 'Cierre', path: '/cierre-mes' },
  { icon: Wallet, label: 'Finanzas', path: '/finanzas' },
  { icon: UserCircle, label: 'Perfil', path: '/perfil' },
];

export const Sidebar = () => {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-surface-low border-r border-white/5 flex flex-col p-6 z-50 hidden md:flex">
      <div className="mb-12">
        <h1 className="text-3xl font-display font-black italic bg-gradient-to-r from-neon-green to-neon-blue bg-clip-text text-transparent transform -skew-x-12 px-2">
          COACH.
        </h1>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-display tracking-tight",
                isActive ? "bg-neon-green text-black" : "text-white/40 hover:text-white/80 hover:bg-white/5"
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-bold">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="pt-6 border-t border-white/5">
        <button className="w-full flex items-center space-x-3 px-4 py-3 text-white/40 hover:text-neon-red transition-all cursor-pointer">
          <LogOut className="w-5 h-5" />
          <span className="font-display font-bold">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};

// Mobile Bottom Navigation
export const MobileNav = () => {
  // Show only the most important 5 items on mobile
  const mobileItems = [
    { icon: LayoutDashboard, label: 'Inicio', path: '/' },
    { icon: Users, label: 'Clientes', path: '/clientes' },
    { icon: Calendar, label: 'Agenda', path: '/agenda' },
    { icon: DollarSign, label: 'Cierre', path: '/cierre-mes' },
    { icon: Wallet, label: 'Finanzas', path: '/finanzas' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-surface-low border-t border-white/10 flex items-stretch">
      {mobileItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            cn(
              "flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-all",
              isActive ? "text-neon-green" : "text-white/30"
            )
          }
        >
          {({ isActive }) => (
            <>
              <item.icon className={cn("w-5 h-5", isActive && "drop-shadow-[0_0_8px_rgba(156,255,147,0.8)]")} />
              <span className="text-[9px] font-display font-black uppercase tracking-widest">{item.label}</span>
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-neon-green rounded-full shadow-[0_0_8px_rgba(156,255,147,0.8)]" />
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
};

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex bg-surface min-h-screen">
      <Toaster 
        theme="dark" 
        position="top-center"
        toastOptions={{
          style: {
            background: '#0a0a0a',
            border: '1px solid rgba(156,255,147,0.2)',
            color: '#fff',
            fontFamily: 'system-ui, sans-serif'
          }
        }}
      />
      <Sidebar />
      <MobileNav />
      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 md:ml-64 p-4 md:p-8 pb-24 md:pb-8 relative overflow-hidden"
      >
        {/* Background Decorative Element */}
        <div className="absolute top-0 right-0 w-[50vh] h-[50vh] bg-neon-green/5 blur-[120px] -z-10 rounded-full -translate-y-1/2" />
        {children}
      </motion.main>
    </div>
  );
};
