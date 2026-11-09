import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  Calculator,
  PenTool,
} from 'lucide-react';
import { CurriculumService, type Lesson } from '../services/curriculum.service';
import { Card } from '../components/ui/Card';
import { DifficultyBadge, PathwayBadge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import type { AppSubject, LearningPathway } from '../../types/database.types';

export const LearnPage: React.FC = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [subjectFilter, setSubjectFilter] = useState<AppSubject | 'all'>('all');
  const [pathwayFilter, setPathwayFilter] = useState<LearningPathway | 'all'>('all');

  useEffect(() => {
    async function fetchCurriculum() {
      try {
        setLoading(true);
        const lessonsData = await CurriculumService.getLessons({
          subject: subjectFilter === 'all' ? undefined : subjectFilter,
          pathway: pathwayFilter === 'all' ? undefined : pathwayFilter,
        });
        setLessons(lessonsData);
      } finally {
        setLoading(false);
      }
    }
    fetchCurriculum();
  }, [subjectFilter, pathwayFilter]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Curriculum & Lessons Library
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse structured instructional modules covering all official SAT domains.
          </p>
        </div>
      </div>

      {/* 2. Filter Pills */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
        {/* Subject Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase mr-1">Subject:</span>
          {(['all', 'math', 'reading_writing'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSubjectFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                subjectFilter === s
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s === 'all' ? 'All' : s === 'math' ? 'Math' : 'Reading & Writing'}
            </button>
          ))}
        </div>

        {/* Pathway Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase mr-1">Pathway:</span>
          {(['all', 'foundation', 'pre_sat', 'sat_advanced'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPathwayFilter(p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                pathwayFilter === p
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {p === 'all' ? 'All' : p === 'pre_sat' ? 'Pre-SAT' : p.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Lessons Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-slate-500">Loading lessons catalog...</p>
        </div>
      ) : lessons.length === 0 ? (
        <Card className="p-12 text-center text-slate-500 text-sm">
          No lessons found matching the selected filters.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map((lesson) => {
            const isMath = lesson.subject === 'math';
            const skillName = (lesson as any).skills?.name;

            return (
              <Card
                key={lesson.id}
                hover
                onClick={() => navigate(`/learn/${lesson.slug}`)}
                className="p-6 flex flex-col justify-between space-y-4 cursor-pointer"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="p-1 rounded-lg bg-slate-100 text-slate-700">
                        {isMath ? <Calculator className="w-3.5 h-3.5" /> : <PenTool className="w-3.5 h-3.5" />}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        {isMath ? 'Math' : 'Reading & Writing'}
                      </span>
                    </div>
                    <DifficultyBadge difficulty={lesson.difficulty} />
                  </div>

                  <h3 className="text-base font-bold text-slate-900 tracking-tight leading-snug hover:text-brand-600 transition">
                    {lesson.title}
                  </h3>

                  {skillName && (
                    <p className="text-xs text-brand-600 font-medium">{skillName}</p>
                  )}

                  {lesson.summary && (
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {lesson.summary}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {lesson.estimated_duration_minutes} min
                  </span>
                  <PathwayBadge pathway={lesson.pathway} />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
