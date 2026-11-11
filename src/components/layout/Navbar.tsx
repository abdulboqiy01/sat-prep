import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
              <span className="text-brand-600 font-extrabold">SATPrep</span>
            </span>
          </div>
        </Link>

        {/* Public Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a href="#features" className="hover:text-brand-600 transition">Features</a>
          <a href="#how-it-works" className="hover:text-brand-600 transition">How It Works</a>
          <a href="#diagnostic" className="hover:text-brand-600 transition">Diagnostic Test</a>
          <a href="#ai-tutor" className="hover:text-brand-600 transition">AI Tutor</a>
        </nav>

        {/* CTA Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" /> Go to Dashboard
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/login')}
              >
                Log In
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/signup')}
              >
                Start Learning Free
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
