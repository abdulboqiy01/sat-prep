import React, { useEffect, useState, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, ShieldCheck, User as UserIcon } from 'lucide-react';
import { AdminService, type StudentRow } from '../../services/admin.service';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

const PAGE_SIZE = 20;

export const AdminStudentsPage: React.FC = () => {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await AdminService.getAllStudents(p, PAGE_SIZE);
      setStudents(result.data);
      setTotal(result.total);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(page); }, [load, page]);

  const handleRoleToggle = async (student: StudentRow) => {
    const newRole = student.role === 'admin' ? 'student' : 'admin';
    setUpdatingId(student.id);
    try {
      await AdminService.updateStudentRole(student.id, newRole);
      setStudents((prev) => prev.map((s) => s.id === student.id ? { ...s, role: newRole } : s));
    } catch (e: unknown) {
      alert('Failed to update role: ' + (e instanceof Error ? e.message : 'Unknown error'));
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.full_name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.starting_level?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const levelColor: Record<string, string> = {
    foundation: 'bg-orange-900/40 text-orange-300',
    intermediate: 'bg-blue-900/40 text-blue-300',
    advanced: 'bg-purple-900/40 text-purple-300',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Students</h1>
          <p className="text-slate-400 mt-1">{total} registered users</p>
        </div>
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
        ) : error ? (
          <div className="text-red-400 p-6">Error: {error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 text-left">Student</th>
                  <th className="px-4 py-3 text-left">Level</th>
                  <th className="px-4 py-3 text-left">Lessons</th>
                  <th className="px-4 py-3 text-left">Telegram</th>
                  <th className="px-4 py-3 text-left">Last Active</th>
                  <th className="px-4 py-3 text-left">Role</th>
                  <th className="px-4 py-3 text-left">Joined</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {(s.full_name || s.email || '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-white">{s.full_name || '—'}</div>
                          <div className="text-xs text-slate-500">{s.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {s.starting_level ? (
                        <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${levelColor[s.starting_level] || 'bg-slate-700 text-slate-300'}`}>
                          {s.starting_level}
                        </span>
                      ) : <span className="text-slate-600">—</span>}
                    </td>
                    <td className="px-4 py-3 text-white font-medium">{s.lessons_completed}</td>
                    <td className="px-4 py-3">
                      {s.telegram_connected ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-900/40 text-green-400 rounded-lg text-xs font-medium">
                          ✓ Connected
                        </span>
                      ) : (
                        <span className="text-slate-600 text-xs">Not connected</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {s.last_activity ? new Date(s.last_activity).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium ${
                        s.role === 'admin' ? 'bg-indigo-900/50 text-indigo-300' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {s.role === 'admin' ? <ShieldCheck className="w-3 h-3" /> : <UserIcon className="w-3 h-3" />}
                        {s.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {new Date(s.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleRoleToggle(s)}
                        disabled={updatingId === s.id}
                        className="px-3 py-1 text-xs font-medium bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white rounded-lg transition-colors disabled:opacity-50"
                      >
                        {updatingId === s.id ? '…' : s.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-16 text-slate-500">No students found.</div>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">
            Page {page + 1} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-40 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

