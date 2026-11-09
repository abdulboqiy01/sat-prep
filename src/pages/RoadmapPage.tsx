import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  Calendar,
  ArrowRight,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { RoadmapService, type ActiveRoadmapWithItems } from '../services/roadmap.service';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge, PathwayBadge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { cn } from '../utils/cn';

export const RoadmapPage: React.FC = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [roadmapData, setRoadmapData] = useState<ActiveRoadmapWithItems | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenerateModalOpen, setRegenerateModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchRoadmap = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const data = await RoadmapService.getActiveRoadmap();
      setRoadmapData(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load your learning roadmap.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const handleRegenerate = async () => {
    try {
      setIsRegenerating(true);
      setErrorMsg(null);
      await RoadmapService.generateRoadmap({ force_regenerate: true });
      setRegenerateModalOpen(false);
      await fetchRoadmap();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate new roadmap.');
    } finally {
      setIsRegenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-sm font-medium text-slate-500">Loading your learning roadmap...</p>
      </div>
    );
  }

  const roadmap = roadmapData?.roadmap;
  const items = roadmapData?.items || [];
  const progressPercent = roadmapData?.progressPercentage || 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              My Learning Roadmap
            </h1>
            {roadmap && <PathwayBadge pathway={roadmap.pathway} />}
          </div>
          <p className="text-sm text-slate-500">
            {roadmap?.title || 'Personalized sequential SAT curriculum tailored to your goals'}
          </p>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRegenerateModalOpen(true)}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4 text-slate-500" />
            Regenerate Roadmap
          </Button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 2. Overall Progress Card */}
      {roadmap && (
        <Card className="p-6 bg-white border-slate-200/80 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Roadmap Completion (Version {roadmap.version})
              </span>
              <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
                {progressPercent}% Complete
              </div>
            </div>
            <div className="text-xs text-slate-500 sm:text-right">
              <div>Target weekly pace: <span className="font-semibold text-slate-700">{roadmap.weekly_study_budget_hours} hrs/week</span></div>
              {roadmap.target_exam_date && (
                <div className="text-brand-600 font-medium">Exam Date: {roadmap.target_exam_date}</div>
              )}
            </div>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-brand-600 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </Card>
      )}

      {/* 3. Empty State if No Active Roadmap */}
      {!roadmap || items.length === 0 ? (
        <Card className="p-12 text-center space-y-4 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">No Active Roadmap Generated Yet</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Generate your first personalized learning plan based on your diagnostic results and available weekly study time.
          </p>
          <div className="pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={handleRegenerate}
              isLoading={isRegenerating}
              className="gap-2 shadow-md"
            >
              <Sparkles className="w-4 h-4" /> Generate Learning Roadmap
            </Button>
          </div>
        </Card>
      ) : (
        /* 4. Sequential Roadmap Milestones List */
        <div className="space-y-4 relative before:absolute before:inset-0 before:left-6 before:w-0.5 before:bg-slate-200/70 before:hidden sm:before:block">
          {items.map((item, index) => {
            const isCompleted = item.status === 'completed';
            const isLesson = item.item_type === 'lesson';
            const isQuiz = item.item_type === 'quiz';
            const lessonSlug = (item as any).lessons?.slug;
            const quizId = item.quiz_id;

            return (
              <div
                key={item.id}
                className="relative sm:pl-14 transition-all duration-150"
              >
                {/* Node Milestone Circle */}
                <div
                  className={cn(
                    'hidden sm:flex absolute left-4.5 -translate-x-1/2 top-6 w-8 h-8 rounded-full border-2 items-center justify-center text-xs font-bold transition-all shadow-xs z-10',
                    isCompleted
                      ? 'bg-mint-500 border-mint-500 text-white'
                      : 'bg-white border-brand-500 text-brand-600'
                  )}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                </div>

                {/* Card Item */}
                <Card
                  hover
                  className={cn(
                    'p-5 sm:p-6 transition-all',
                    isCompleted && 'bg-slate-50/60 border-slate-200'
                  )}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant={isCompleted ? 'mint' : isQuiz ? 'coral' : 'indigo'}
                          size="sm"
                        >
                          {item.item_type.replace('_', ' ')}
                        </Badge>
                        {item.scheduled_date && (
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {item.scheduled_date}
                          </span>
                        )}
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {item.estimated_duration_minutes}m
                        </span>
                      </div>

                      <h4 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                        {item.title}
                      </h4>
                      {item.description && (
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="shrink-0 flex items-center gap-2">
                      {isCompleted ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (isLesson && lessonSlug) {
                              navigate(`/learn/${lessonSlug}`);
                            } else if (isQuiz && quizId) {
                              navigate(`/quiz/${quizId}`);
                            }
                          }}
                          className="gap-1.5 text-slate-600"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Review
                        </Button>
                      ) : (
                        <Button
                          variant={index === 0 ? 'mint' : 'primary'}
                          size="sm"
                          onClick={() => {
                            if (isLesson && lessonSlug) {
                              navigate(`/learn/${lessonSlug}`);
                            } else if (isQuiz && quizId) {
                              navigate(`/quiz/${quizId}`);
                            }
                          }}
                          className="gap-1.5"
                        >
                          Start <ArrowRight className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      )}

      {/* Regeneration Modal */}
      <Modal
        isOpen={regenerateModalOpen}
        onClose={() => setRegenerateModalOpen(false)}
        title="Regenerate Learning Roadmap?"
        description="Your previous roadmap history and completed learning records will remain safely archived."
      >
        <div className="space-y-4 pt-2">
          <div className="p-3.5 bg-brand-50 border border-brand-200 rounded-xl text-brand-900 text-xs leading-relaxed">
            Our AI will synthesize a fresh sequential curriculum incorporating your latest diagnostic scores and updated study availability.
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              size="md"
              onClick={() => setRegenerateModalOpen(false)}
              disabled={isRegenerating}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleRegenerate}
              isLoading={isRegenerating}
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" /> Yes, Regenerate
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
