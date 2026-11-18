import React, { useEffect, useState } from 'react';
import { AdminService, type WeeklyActivity } from '../../services/admin.service';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export const AdminAnalyticsPage: React.FC = () => {
  const [activity, setActivity] = useState<WeeklyActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    AdminService.getWeeklyActivity()
      .then(setActivity)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const maxSessions = Math.max(...activity.map((a) => a.sessions), 1);
  const maxMinutes = Math.max(...activity.map((a) => a.minutes), 1);

  const totalSessions = activity.reduce((s, a) => s + a.sessions, 0);
  const totalMinutes = activity.reduce((s, a) => s + a.minutes, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-slate-400 mt-1">Student activity over the last 7 days</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : error ? (
        <div className="text-red-400 p-6">Error: {error}</div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Sessions (7d)', value: totalSessions },
              { label: 'Total Minutes (7d)', value: totalMinutes },
              { label: 'Active Days', value: activity.length },
              { label: 'Avg Sessions/Day', value: activity.length ? Math.round(totalSessions / activity.length) : 0 },
            ].map((s) => (
              <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <div className="text-2xl font-bold text-white">{s.value}</div>
                <div className="text-xs text-slate-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Bar chart – sessions */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-6">Daily Study Sessions</h2>
            {activity.length === 0 ? (
              <div className="text-center py-10 text-slate-500">No activity data yet.</div>
            ) : (
              <div className="flex items-end gap-3 h-48">
                {activity.map((a) => {
                  const height = Math.max(4, Math.round((a.sessions / maxSessions) * 100));
                  return (
                    <div key={a.date} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs text-slate-400 font-medium">{a.sessions}</span>
                      <div
                        className="w-full bg-indigo-600 rounded-t-md transition-all"
                        style={{ height: `${height}%` }}
                      />
                      <span className="text-xs text-slate-500 truncate w-full text-center">
                        {new Date(a.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bar chart – minutes */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-6">Daily Study Minutes</h2>
            {activity.length === 0 ? (
              <div className="text-center py-10 text-slate-500">No activity data yet.</div>
            ) : (
              <div className="flex items-end gap-3 h-48">
                {activity.map((a) => {
                  const height = Math.max(4, Math.round((a.minutes / maxMinutes) * 100));
                  return (
                    <div key={a.date} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs text-slate-400 font-medium">{a.minutes}</span>
                      <div
                        className="w-full bg-emerald-600 rounded-t-md transition-all"
                        style={{ height: `${height}%` }}
                      />
                      <span className="text-xs text-slate-500 truncate w-full text-center">
                        {new Date(a.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Raw table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800">
              <h2 className="text-lg font-semibold text-white">Activity Table</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Sessions</th>
                  <th className="px-4 py-3 text-left">Minutes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {activity.map((a) => (
                  <tr key={a.date} className="hover:bg-slate-800/40">
                    <td className="px-4 py-3 text-white">{a.date}</td>
                    <td className="px-4 py-3 text-slate-300">{a.sessions}</td>
                    <td className="px-4 py-3 text-slate-300">{a.minutes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

