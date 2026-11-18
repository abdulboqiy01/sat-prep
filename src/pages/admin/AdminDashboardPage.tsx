import React, { useEffect, useState } from 'react';
import { Users, BookOpen, CheckCircle, MessageSquare, Bot, Send } from 'lucide-react';
import { AdminService, type AdminStats } from '../../services/admin.service';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, bg }) => (
  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
      <Icon className={`w-6 h-6 ${color}`} />
    </div>
    <div>
      <div className="text-2xl font-bold text-white">{value.toLocaleString()}</div>
      <div className="text-sm text-slate-400">{title}</div>
    </div>
  </div>
);

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    AdminService.getStats()
      .then(setStats)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;
  if (error) return <div className="text-red-400 p-6">Error: {error}</div>;
  if (!stats) return null;

  const cards: StatCardProps[] = [
    { title: 'Total Students', value: stats.totalStudents, icon: Users, color: 'text-blue-400', bg: 'bg-blue-900/40' },
    { title: 'Total Lessons', value: stats.totalLessons, icon: BookOpen, color: 'text-emerald-400', bg: 'bg-emerald-900/40' },
    { title: 'Lessons Completed', value: stats.lessonsCompleted, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-900/40' },
    { title: 'Quizzes Taken', value: stats.quizzesTaken, icon: MessageSquare, color: 'text-purple-400', bg: 'bg-purple-900/40' },
    { title: 'AI Tutor Sessions', value: stats.aiMessages, icon: Bot, color: 'text-amber-400', bg: 'bg-amber-900/40' },
    { title: 'Telegram Connected', value: stats.telegramConnections, icon: Send, color: 'text-sky-400', bg: 'bg-sky-900/40' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-slate-400 mt-1">Platform overview and key metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <StatCard key={c.title} {...c} />
        ))}
      </div>

      {/* Quick links */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'View Students', href: '/admin/students' },
            { label: 'Manage Lessons', href: '/admin/lessons' },
            { label: 'Analytics', href: '/admin/analytics' },
            { label: 'Telegram Logs', href: '/admin/telegram' },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block px-4 py-3 bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white rounded-xl text-sm font-medium text-center transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

