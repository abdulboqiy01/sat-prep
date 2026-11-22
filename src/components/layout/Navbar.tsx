import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { BrandLogo } from '../ui/BrandLogo';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="group">
          <BrandLogo size="md" />
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
              onClick={() => navigate(profile?.role === 'admin' ? '/admin' : '/dashboard')}
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" /> {profile?.role === 'admin' ? 'Go to Admin Panel' : 'Go to Dashboard'}
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
