import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, Wallet, UserCircle, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

export const Sidebar = () => {
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Users, label: 'Clientes', path: '/clientes' },
    { icon: Calendar, label: 'Agenda', path: '/agenda' },
    { icon: Wallet, label: 'Finanzas', path: '/finanzas' },
    { icon: UserCircle, label: 'Perfil', path: '/perfil' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-surface-low border-r border-white/5 flex flex-col p-6 z-50">
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

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex bg-surface min-h-screen">
      <Sidebar />
      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 ml-64 p-8 relative overflow-hidden"
      >
        {/* Background Decorative Element */}
        <div className="absolute top-0 right-0 w-[50vh] h-[50vh] bg-neon-green/5 blur-[120px] -z-10 rounded-full transalte-x-1/2 -translate-y-1/2" />
        {children}
      </motion.main>
    </div>
  );
};
