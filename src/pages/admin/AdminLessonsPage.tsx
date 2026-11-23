import React, { useEffect, useState } from 'react';
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  X,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Clock,
  Layers,
} from 'lucide-react';
import { AdminService, type LessonRow } from '../../services/admin.service';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

interface ModuleOption {
  id: string;
  title: string;
  subject: string;
  pathway: string;
}

interface SkillOption {
  id: string;
  name: string;
  subject: string;
  pathway: string;
}

interface LessonFormData {
  title: string;
  summary: string;
  subject: 'math' | 'reading_writing';
  pathway: 'foundation' | 'pre_sat';
  module_id: string;
  skill_id: string;
  estimated_duration_minutes: number;
  difficulty: 'easy' | 'medium' | 'hard';
  order_index: number;
}

const emptyFormData: LessonFormData = {
  title: '',
  summary: '',
  subject: 'math',
  pathway: 'foundation',
  module_id: '',
  skill_id: '',
  estimated_duration_minutes: 25,
  difficulty: 'medium',
  order_index: 1,
};

export const AdminLessonsPage: React.FC = () => {
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [modules, setModules] = useState<ModuleOption[]>([]);
  const [skills, setSkills] = useState<SkillOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<'all' | 'math' | 'reading_writing'>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<LessonRow | null>(null);
  const [deletingLesson, setDeletingLesson] = useState<LessonRow | null>(null);

  const [formData, setFormData] = useState<LessonFormData>(emptyFormData);
  const [submitting, setSubmitting] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [lessonsList, meta] = await Promise.all([
        AdminService.getAllLessons(),
        AdminService.getModulesAndSkills(),
      ]);
      setLessons(lessonsList);
      setModules(meta.modules);
      setSkills(meta.skills);
    } catch (e: any) {
      setError(e.message || 'Failed to load lessons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Open Add Modal
  const handleOpenAdd = () => {
    const nextOrder = lessons.length > 0 ? Math.max(...lessons.map((l) => l.order_index || 0)) + 1 : 1;
    const defaultMod = modules.find((m) => m.subject === 'math');
    const defaultSkill = skills.find((s) => s.subject === 'math');

    setFormData({
      ...emptyFormData,
      module_id: defaultMod?.id || '',
      skill_id: defaultSkill?.id || '',
      order_index: nextOrder,
    });
    setIsAddOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (lesson: LessonRow) => {
    setEditingLesson(lesson);
    setFormData({
      title: lesson.title,
      summary: lesson.summary || '',
      subject: (lesson.subject as any) || 'math',
      pathway: (lesson.pathway as any) || 'foundation',
      module_id: lesson.module_id || '',
      skill_id: lesson.skill_id || '',
      estimated_duration_minutes: lesson.estimated_duration_minutes || 25,
      difficulty: (lesson.difficulty as any) || 'medium',
      order_index: lesson.order_index || 1,
    });
  };

  // Submit Add
  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please provide a lesson title.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await AdminService.createLesson({
        title: formData.title.trim(),
        summary: formData.summary.trim(),
        subject: formData.subject,
        pathway: formData.pathway,
        module_id: formData.module_id || undefined,
        skill_id: formData.skill_id || undefined,
        estimated_duration_minutes: formData.estimated_duration_minutes,
        difficulty: formData.difficulty,
        order_index: formData.order_index,
      });

      // Populate module title for UI display
      const matchedMod = modules.find((m) => m.id === created.module_id);
      const enriched: LessonRow = {
        ...created,
        module_title: matchedMod?.title || null,
      };

      setLessons((prev) => [...prev, enriched].sort((a, b) => a.order_index - b.order_index));
      setIsAddOpen(false);
      showToast(`Lesson "${formData.title}" created successfully!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to create lesson', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLesson || !formData.title.trim()) return;

    setSubmitting(true);
    try {
      await AdminService.updateLesson(editingLesson.id, {
        title: formData.title.trim(),
        summary: formData.summary.trim(),
        subject: formData.subject,
        pathway: formData.pathway,
        module_id: formData.module_id || null,
        skill_id: formData.skill_id || null,
        estimated_duration_minutes: formData.estimated_duration_minutes,
        difficulty: formData.difficulty,
        order_index: formData.order_index,
      });

      const matchedMod = modules.find((m) => m.id === formData.module_id);

      setLessons((prev) =>
        prev
          .map((l) =>
            l.id === editingLesson.id
              ? {
                  ...l,
                  title: formData.title.trim(),
                  summary: formData.summary.trim(),
                  subject: formData.subject,
                  pathway: formData.pathway,
                  module_id: formData.module_id || null,
                  module_title: matchedMod?.title || null,
                  skill_id: formData.skill_id || null,
                  estimated_duration_minutes: formData.estimated_duration_minutes,
                  difficulty: formData.difficulty,
                  order_index: formData.order_index,
                }
              : l
          )
          .sort((a, b) => a.order_index - b.order_index)
      );

      setEditingLesson(null);
      showToast(`Lesson updated successfully!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update lesson', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Delete
  const handleConfirmDelete = async () => {
    if (!deletingLesson) return;

    setSubmitting(true);
    try {
      await AdminService.deleteLesson(deletingLesson.id);
      setLessons((prev) => prev.filter((l) => l.id !== deletingLesson.id));
      showToast(`Lesson "${deletingLesson.title}" deleted.`, 'success');
      setDeletingLesson(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete lesson', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter lessons
  const filtered = lessons.filter((l) => {
    const q = search.toLowerCase();
    const matchSearch =
      l.title.toLowerCase().includes(q) ||
      (l.summary && l.summary.toLowerCase().includes(q)) ||
      (l.module_title && l.module_title.toLowerCase().includes(q));

    const matchSubject = subjectFilter === 'all' || l.subject === subjectFilter;
    const matchDiff = difficultyFilter === 'all' || l.difficulty === difficultyFilter;

    return matchSearch && matchSubject && matchDiff;
  });

  const mathCount = lessons.filter((l) => l.subject === 'math').length;
  const rwCount = lessons.filter((l) => l.subject === 'reading_writing').length;

  const difficultyBadge: Record<string, string> = {
    easy: 'bg-emerald-900/40 text-emerald-300 border-emerald-700/50',
    medium: 'bg-amber-900/40 text-amber-300 border-amber-700/50',
    hard: 'bg-rose-900/40 text-rose-300 border-rose-700/50',
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast alert */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border text-sm font-medium animate-in slide-in-from-top-2 ${
            toast.type === 'success'
              ? 'bg-emerald-950 text-emerald-200 border-emerald-800'
              : 'bg-rose-950 text-rose-200 border-rose-800'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-indigo-400" />
            Lessons Management (SAT Curriculum)
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Total {lessons.length} lessons: <span className="text-indigo-400 font-semibold">{mathCount} Math</span>,{' '}
            <span className="text-violet-400 font-semibold">{rwCount} Reading & Writing</span>
          </p>
        </div>

        {/* Action: Add Lesson */}
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium text-sm rounded-xl transition shadow-sm hover:shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4" />
          Add Lesson
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-900 p-4 border border-slate-800 rounded-2xl">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or topic..."
            className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Subject Filter */}
        <div>
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value as any)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Subjects</option>
            <option value="math">📐 Math</option>
            <option value="reading_writing">📖 Reading & Writing</option>
          </select>
        </div>

        {/* Difficulty Filter */}
        <div>
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value as any)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
            <LoadingSpinner size="lg" />
            <p className="text-sm">Loading lessons...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-400">Error loading lessons: {error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider bg-slate-950/60">
                  <th className="px-4 py-3.5 text-left w-12 font-medium">#</th>
                  <th className="px-4 py-3.5 text-left font-medium">Lesson Title</th>
                  <th className="px-4 py-3.5 text-left font-medium">Module / Unit</th>
                  <th className="px-4 py-3.5 text-left font-medium">Subject</th>
                  <th className="px-4 py-3.5 text-left font-medium">Duration</th>
                  <th className="px-4 py-3.5 text-left font-medium">Difficulty</th>
                  <th className="px-4 py-3.5 text-right font-medium pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filtered.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-800/40 transition-colors group">
                    <td className="px-4 py-3.5 text-slate-500 font-mono text-xs">{l.order_index}</td>
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-white">{l.title}</div>
                      {l.summary && (
                        <div className="text-xs text-slate-400 line-clamp-1 max-w-md mt-0.5">{l.summary}</div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-slate-400 text-xs">
                      {l.module_title ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/80 text-slate-300 rounded-lg">
                          <Layers className="w-3 h-3 text-slate-400" />
                          {l.module_title}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium capitalize ${
                          l.subject === 'math'
                            ? 'bg-blue-900/30 text-blue-300 border border-blue-800/40'
                            : 'bg-violet-900/30 text-violet-300 border border-violet-800/40'
                        }`}
                      >
                        {l.subject === 'math' ? 'Math' : 'R & W'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-300 text-xs">
                      <span className="inline-flex items-center gap-1 text-slate-400">
                        <Clock className="w-3 h-3" />
                        {l.estimated_duration_minutes} min
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-lg text-xs font-medium border capitalize ${
                          difficultyBadge[l.difficulty] || 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {l.difficulty}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right pr-6">
                      <div className="inline-flex items-center gap-1.5 opacity-90 group-hover:opacity-100">
                        <button
                          onClick={() => handleOpenEdit(l)}
                          title="Edit Lesson"
                          className="p-1.5 bg-slate-800 hover:bg-indigo-600 rounded-lg text-slate-300 hover:text-white transition"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingLesson(l)}
                          title="Delete Lesson"
                          className="p-1.5 bg-slate-800 hover:bg-rose-600 rounded-lg text-slate-300 hover:text-white transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="text-center py-16 text-slate-500">No lessons found matching the filters.</div>
            )}
          </div>
        )}
      </div>

      {/* Modal: Add Lesson */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl p-6 my-8 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-400" />
                Create New Lesson
              </h2>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="space-y-4 mt-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Lesson Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g.: Quadratic Formula & Discriminant Analysis"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Summary / Overview
                </label>
                <textarea
                  rows={2}
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="What this lesson covers and its key Digital SAT takeaways..."
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Subject
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => {
                      const sub = e.target.value as any;
                      const nextMod = modules.find((m) => m.subject === sub);
                      const nextSkill = skills.find((s) => s.subject === sub);
                      setFormData({
                        ...formData,
                        subject: sub,
                        module_id: nextMod?.id || '',
                        skill_id: nextSkill?.id || '',
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="math">📐 Math</option>
                    <option value="reading_writing">📖 Reading & Writing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Difficulty
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Curriculum Module / Unit
                </label>
                <select
                  value={formData.module_id}
                  onChange={(e) => setFormData({ ...formData, module_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">(Automatic Selection)</option>
                  {modules
                    .filter((m) => m.subject === formData.subject)
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.title}
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={120}
                    value={formData.estimated_duration_minutes}
                    onChange={(e) =>
                      setFormData({ ...formData, estimated_duration_minutes: Number(e.target.value) || 25 })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Order Index (#)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.order_index}
                    onChange={(e) => setFormData({ ...formData, order_index: Number(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Create Lesson'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Lesson */}
      {editingLesson && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl p-6 my-8 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-400" />
                Edit Lesson
              </h2>
              <button onClick={() => setEditingLesson(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 mt-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Lesson Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Summary / Overview
                </label>
                <textarea
                  rows={2}
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Subject
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="math">📐 Math</option>
                    <option value="reading_writing">📖 Reading & Writing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Difficulty
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Curriculum Module / Unit
                </label>
                <select
                  value={formData.module_id}
                  onChange={(e) => setFormData({ ...formData, module_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">(No module linked)</option>
                  {modules
                    .filter((m) => m.subject === formData.subject)
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.title}
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={120}
                    value={formData.estimated_duration_minutes}
                    onChange={(e) =>
                      setFormData({ ...formData, estimated_duration_minutes: Number(e.target.value) || 25 })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Order Index (#)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.order_index}
                    onChange={(e) => setFormData({ ...formData, order_index: Number(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingLesson(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirm Delete */}
      {deletingLesson && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-900/60 rounded-2xl w-full max-w-md shadow-2xl p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-rose-900/40 border border-rose-700/60 flex items-center justify-center text-rose-400 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white">Delete this lesson?</h3>
                <p className="text-sm text-slate-300 mt-1.5">
                  Are you sure you want to permanently delete:
                </p>
                <p className="text-sm font-semibold text-rose-300 mt-1 p-2 bg-slate-950 rounded-lg border border-slate-800">
                  {deletingLesson.title}
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  This action will permanently delete the lesson from the Supabase database and curriculum roadmap.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeletingLesson(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-medium transition disabled:opacity-50"
              >
                {submitting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
