import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Compass,
  ArrowRight,
  Brain,
  TrendingUp,
  Target,
  ShieldCheck,
  Calculator,
  PenTool,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PathwayBadge } from '../components/ui/Badge';
import { Navbar } from '../components/layout/Navbar';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleStartCTA = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/signup');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-brand-100 selection:text-brand-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200/80 text-brand-700 text-xs font-semibold uppercase tracking-wider shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              Engineered for the Digital SAT
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
              Adaptive SAT Prep That Actually Adapts to <span className="text-brand-600 underline decoration-brand-200 underline-offset-8">You</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Master Math and Reading & Writing through precision diagnostic assessments, personalized learning roadmaps, and an empathetic AI Tutor powered by Google Gemini.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Button size="lg" onClick={handleStartCTA} className="w-full sm:w-auto shadow-md">
                Start Learning Free <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate(user ? '/diagnostic' : '/signup')}
                className="w-full sm:w-auto"
              >
                Take Free Diagnostic Test
              </Button>
            </div>

            {/* Pathway highlights */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
              <span className="font-medium text-slate-700">Three Structured Pathways:</span>
              <PathwayBadge pathway="foundation" />
              <PathwayBadge pathway="pre_sat" />
              <PathwayBadge pathway="sat_advanced" />
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Learning Process */}
      <section id="how-it-works" className="py-20 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-2">
              How Antigravity SAT Works
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              A Direct, Three-Step Path to Score Mastery
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <Card className="relative p-8 text-center space-y-4 rounded-3xl border-slate-200/70 shadow-xs hover:shadow-md transition">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 font-bold text-xl flex items-center justify-center mx-auto border border-brand-100">
                1
              </div>
              <h4 className="text-xl font-bold text-slate-900">Pinpoint With Diagnostic</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Take an adaptive placement assessment that pinpoints your strengths and skill gaps across Math and Reading & Writing without generic guesswork.
              </p>
            </Card>

            {/* Step 2 */}
            <Card className="relative p-8 text-center space-y-4 rounded-3xl border-slate-200/70 shadow-xs hover:shadow-md transition">
              <div className="w-14 h-14 rounded-2xl bg-mint-50 text-mint-600 font-bold text-xl flex items-center justify-center mx-auto border border-mint-100">
                2
              </div>
              <h4 className="text-xl font-bold text-slate-900">Follow Your Custom Roadmap</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Receive an AI-synthesized, weekly learning plan fitted deterministically to your schedule, exam date, and target score budget.
              </p>
            </Card>

            {/* Step 3 */}
            <Card className="relative p-8 text-center space-y-4 rounded-3xl border-slate-200/70 shadow-xs hover:shadow-md transition">
              <div className="w-14 h-14 rounded-2xl bg-coral-50 text-coral-500 font-bold text-xl flex items-center justify-center mx-auto border border-coral-100">
                3
              </div>
              <h4 className="text-xl font-bold text-slate-900">Practice with AI Tutor</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Tackle interactive lessons, mini-quizzes, and get step-by-step Socratic hints from the Gemini tutor whenever you get stuck.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-2">
              Platform Features
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Everything You Need to Succeed on Test Day
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card hover className="p-7 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                <Calculator className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Full Math Coverage</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Algebra, Advanced Math, Problem Solving and Data Analysis, and Geometry & Trigonometry with LaTeX equations.
              </p>
            </Card>

            <Card hover className="p-7 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
                <PenTool className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Reading & Writing Mastery</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Information & Ideas, Craft & Structure, Expression of Ideas, and Standard English sentence boundary conventions.
              </p>
            </Card>

            <Card hover className="p-7 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-mint-50 text-mint-600 flex items-center justify-center mb-2">
                <Target className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Authoritative Grading</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Server-side scoring ensures that quizzes and diagnostic results are accurate and protected against tampering.
              </p>
            </Card>

            <Card hover className="p-7 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
                <Brain className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Gemini AI Tutor</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                24/7 Socratic assistant that gives hints before answers and provides pedagogical explanations grounded in lesson materials.
              </p>
            </Card>

            <Card hover className="p-7 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Real Progress Analytics</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Track weekly study hours, accuracy by domain, and active learning streaks calculated from real study session activity.
              </p>
            </Card>

            <Card hover className="p-7 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Safe Resumable Progress</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Step-by-step lesson tracking that remembers exactly where you paused and syncs to your personal roadmap.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="py-20 bg-gradient-to-b from-white to-slate-100 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Ready to Accelerate Your SAT Score?
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto">
            Join students learning with an intelligent, personalized roadmap built for the Digital SAT.
          </p>
          <div className="pt-2">
            <Button size="lg" onClick={handleStartCTA} className="px-8 shadow-md">
              Create Your Account <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-10 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-semibold text-slate-700">
            <Compass className="w-4 h-4 text-brand-600" />
            Antigravity SAT Platform
          </div>
          <div className="text-center md:text-left">
            SAT® is a trademark registered by the College Board, which is not affiliated with, and does not endorse, this product.
          </div>
          <div>
            &copy; {new Date().getFullYear()} Antigravity SAT. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
