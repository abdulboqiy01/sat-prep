import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  BarChart3,
  MessageSquare,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../ui/BrandLogo';
import { cn } from '../../utils/cn';

interface NavItem {
  name: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
}

const adminNavItems: NavItem[] = [
  { name: 'Dashboard', to: '/admin', icon: LayoutDashboard },
  { name: 'Students', to: '/admin/students', icon: Users },
  { name: 'Lessons', to: '/admin/lessons', icon: BookOpen },
  { name: 'Analytics', to: '/admin/analytics', icon: BarChart3 },
  { name: 'Telegram', to: '/admin/telegram', icon: MessageSquare },
];

export const AdminLayout: React.FC = () => {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Admin';

  const SidebarContent = () => (
    <div className="flex flex-col h-full justify-between">
      <div className="space-y-6">
        {/* Brand + Admin badge */}
        <div className="px-2">
          <BrandLogo size="md" />
          <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold">
            <ShieldCheck className="w-3 h-3" />
            Admin Panel
          </div>
        </div>

        {/* Admin info */}
        <div className="p-3.5 bg-slate-800 border border-slate-700 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-semibold text-white truncate">{displayName}</div>
              <div className="text-xs text-slate-400 truncate">{user?.email}</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="space-y-1">
          {adminNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin'}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150',
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                )
              }
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom */}
      <div className="pt-4 border-t border-slate-700 space-y-2">
        <NavLink
          to="/dashboard"
          className="flex items-center gap-2.5 px-3.5 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
        >
          ← Back to App
        </NavLink>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-900/20 rounded-xl transition"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-40 bg-slate-900 border-b border-slate-800 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BrandLogo size="sm" />
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Admin</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg text-slate-400 hover:bg-slate-800"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex">
          <div className="w-4/5 max-w-xs bg-slate-900 h-full p-5 shadow-2xl">
            <SidebarContent />
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 p-5 shrink-0 min-h-screen sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-950">
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

