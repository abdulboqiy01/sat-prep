import React, { useEffect, useState } from 'react';
import { AdminService } from '../../services/admin.service';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

interface TelegramConnection {
  id: string;
  user_id: string;
  telegram_username: string | null;
  connected_at: string | null;
  is_active: boolean;
}

interface NotificationLog {
  id: string;
  user_id: string;
  notification_type: string | null;
  status: string | null;
  sent_at: string | null;
}

export const AdminTelegramPage: React.FC = () => {
  const [connections, setConnections] = useState<TelegramConnection[]>([]);
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    AdminService.getTelegramStats()
      .then(({ connections: c, logs: l }) => {
        setConnections(c as TelegramConnection[]);
        setLogs(l as NotificationLog[]);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const activeCount = connections.filter((c) => c.is_active).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Telegram Integration</h1>
        <p className="text-slate-400 mt-1">Bot connections and notification history</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : error ? (
        <div className="text-red-400 p-6">Error: {error}</div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: 'Total Connections', value: connections.length },
              { label: 'Active Connections', value: activeCount },
              { label: 'Notifications Sent', value: logs.length },
            ].map((s) => (
              <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="text-2xl font-bold text-white">{s.value}</div>
                <div className="text-xs text-slate-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Connections table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800">
              <h2 className="text-lg font-semibold text-white">Connected Accounts</h2>
            </div>
            {connections.length === 0 ? (
              <div className="text-center py-10 text-slate-500">No Telegram connections yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                      <th className="px-4 py-3 text-left">User ID</th>
                      <th className="px-4 py-3 text-left">Telegram</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Connected</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {connections.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-800/40">
                        <td className="px-4 py-3 text-slate-400 font-mono text-xs">{c.user_id.slice(0, 12)}…</td>
                        <td className="px-4 py-3 text-white">
                          {c.telegram_username ? `@${c.telegram_username}` : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-lg text-xs font-medium ${
                            c.is_active ? 'bg-green-900/40 text-green-400' : 'bg-slate-800 text-slate-500'
                          }`}>
                            {c.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400 text-xs">
                          {c.connected_at ? new Date(c.connected_at).toLocaleDateString() : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Notification Logs */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800">
              <h2 className="text-lg font-semibold text-white">Recent Notification Logs</h2>
            </div>
            {logs.length === 0 ? (
              <div className="text-center py-10 text-slate-500">No notifications sent yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                      <th className="px-4 py-3 text-left">User ID</th>
                      <th className="px-4 py-3 text-left">Type</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Sent At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {logs.map((l) => (
                      <tr key={l.id} className="hover:bg-slate-800/40">
                        <td className="px-4 py-3 text-slate-400 font-mono text-xs">{l.user_id.slice(0, 12)}…</td>
                        <td className="px-4 py-3 text-slate-300">{l.notification_type || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-lg text-xs font-medium ${
                            l.status === 'sent' ? 'bg-green-900/40 text-green-400'
                            : l.status === 'failed' ? 'bg-red-900/40 text-red-400'
                            : 'bg-slate-800 text-slate-400'
                          }`}>
                            {l.status || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400 text-xs">
                          {l.sent_at ? new Date(l.sent_at).toLocaleString() : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

