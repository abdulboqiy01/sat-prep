import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Home, BookOpen } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-6">
      <div className="w-16 h-16 rounded-3xl bg-brand-50 text-brand-600 flex items-center justify-center shadow-inner">
        <BookOpen className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h1 className="text-6xl font-extrabold text-slate-900 tracking-tight">404</h1>
        <h2 className="text-xl font-bold text-slate-800">Page Not Found</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          The page you are looking for does not exist or may have been moved.
        </p>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Link to="/dashboard">
          <Button variant="primary" size="md">
            <Home className="w-4 h-4 mr-2" />
            Go to Dashboard
          </Button>
        </Link>
        <Link to="/">
          <Button variant="outline" size="md">
            Home Page
          </Button>
        </Link>
      </div>
    </div>
  );
};
export default NotFoundPage;
