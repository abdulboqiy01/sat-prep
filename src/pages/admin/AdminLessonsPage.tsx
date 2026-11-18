import React, { useEffect, useState } from 'react';
import { Search, Edit2, Check, X } from 'lucide-react';
import { AdminService, type LessonRow } from '../../services/admin.service';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export const AdminLessonsPage: React.FC = () => {
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ title: string; estimated_duration_minutes: string }>({
    title: '',
    estimated_duration_minutes: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    AdminService.getAllLessons()
      .then(setLessons)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const startEdit = (lesson: LessonRow) => {
    setEditId(lesson.id);
    setEditValues({
      title: lesson.title,
      estimated_duration_minutes: String(lesson.estimated_duration_minutes ?? ''),
    });
  };

  const cancelEdit = () => {
    setEditId(null);
  };

  const saveEdit = async (lessonId: string) => {
    setSaving(true);
    try {
      const updates: { title?: string; estimated_duration_minutes?: number } = {};
      if (editValues.title) updates.title = editValues.title;
      if (editValues.estimated_duration_minutes) updates.estimated_duration_minutes = Number(editValues.estimated_duration_minutes);
      await AdminService.updateLesson(lessonId, updates);
      setLessons((prev) =>
        prev.map((l) =>
          l.id === lessonId
            ? {
                ...l,
                title: updates.title ?? l.title,
                estimated_duration_minutes: updates.estimated_duration_minutes ?? l.estimated_duration_minutes,
              }
            : l
        )
      );
      setEditId(null);
    } catch (e: unknown) {
      alert('Save failed: ' + (e instanceof Error ? e.message : 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const filtered = lessons.filter((l) => {
    const q = search.toLowerCase();
    return l.title.toLowerCase().includes(q) || l.module_title?.toLowerCase().includes(q);
  });

  const difficultyColor: Record<string, string> = {
    easy: 'bg-green-900/40 text-green-300',
    medium: 'bg-yellow-900/40 text-yellow-300',
    hard: 'bg-red-900/40 text-red-300',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Lessons</h1>
          <p className="text-slate-400 mt-1">{lessons.length} lessons total</p>
        </div>
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search lessons…"
            className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

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
                  <th className="px-4 py-3 text-left w-8">#</th>
                  <th className="px-4 py-3 text-left">Title</th>
                  <th className="px-4 py-3 text-left">Module</th>
                  <th className="px-4 py-3 text-left">Subject</th>
                  <th className="px-4 py-3 text-left">Pathway</th>
                  <th className="px-4 py-3 text-left">Minutes</th>
                  <th className="px-4 py-3 text-left">Difficulty</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 text-slate-500 text-xs">{l.order_index}</td>
                    <td className="px-4 py-3">
                      {editId === l.id ? (
                        <input
                          value={editValues.title}
                          onChange={(e) => setEditValues((v) => ({ ...v, title: e.target.value }))}
                          className="w-full bg-slate-800 border border-indigo-500 rounded-lg px-2 py-1 text-white text-sm focus:outline-none"
                        />
                      ) : (
                        <span className="font-medium text-white">{l.title}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-400">{l.module_title || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded-lg text-xs capitalize">
                        {l.subject || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-slate-800 text-indigo-300 rounded-lg text-xs capitalize">
                        {l.pathway || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {editId === l.id ? (
                        <input
                          type="number"
                          value={editValues.estimated_duration_minutes}
                          onChange={(e) => setEditValues((v) => ({ ...v, estimated_duration_minutes: e.target.value }))}
                          className="w-16 bg-slate-800 border border-indigo-500 rounded-lg px-2 py-1 text-white text-sm focus:outline-none"
                        />
                      ) : (
                        <span className="text-slate-300">{l.estimated_duration_minutes ?? '—'}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {l.difficulty ? (
                        <span className={`px-2 py-0.5 rounded-lg text-xs font-medium capitalize ${difficultyColor[l.difficulty] || 'bg-slate-800 text-slate-300'}`}>
                          {l.difficulty}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editId === l.id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveEdit(l.id)}
                            disabled={saving}
                            className="p-1.5 bg-green-700 hover:bg-green-600 rounded-lg text-white transition disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(l)}
                          className="p-1.5 bg-slate-800 hover:bg-indigo-600 rounded-lg text-slate-400 hover:text-white transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-16 text-slate-500">No lessons found.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
