import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { AdminRoute } from './components/layout/AdminRoute';
import { AdminLayout } from './components/layout/AdminLayout';

// Public pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';

// Onboarding
import { OnboardingPage } from './pages/OnboardingPage';

// Authenticated pages
import { DashboardPage } from './pages/DashboardPage';
import { RoadmapPage } from './pages/RoadmapPage';
import { LearnPage } from './pages/LearnPage';
import { LessonPlayerPage } from './pages/LessonPlayerPage';
import { QuizPage } from './pages/QuizPage';
import { DiagnosticPage } from './pages/DiagnosticPage';
import { TutorPage } from './pages/TutorPage';
import { ProgressPage } from './pages/ProgressPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Vocabulary Module Pages
import { VocabularyDashboardPage } from './pages/vocabulary/VocabularyDashboardPage';
import { LearnWordsPage } from './pages/vocabulary/LearnWordsPage';
import { FlashcardsPage } from './pages/vocabulary/FlashcardsPage';
import { PracticePage } from './pages/vocabulary/PracticePage';
import { ReviewWordsPage } from './pages/vocabulary/ReviewWordsPage';
import { MyVocabularyPage } from './pages/vocabulary/MyVocabularyPage';

// Admin pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminStudentsPage } from './pages/admin/AdminStudentsPage';
import { AdminLessonsPage } from './pages/admin/AdminLessonsPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';
import { AdminTelegramPage } from './pages/admin/AdminTelegramPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public marketing & auth routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Dedicated Onboarding Wizard route */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <OnboardingPage />
              </ProtectedRoute>
            }
          />

          {/* Authenticated Student App Shell */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/roadmap" element={<RoadmapPage />} />
            <Route path="/learn" element={<LearnPage />} />
            <Route path="/learn/:slug" element={<LessonPlayerPage />} />
            <Route path="/learn/id/:lessonId" element={<LessonPlayerPage />} />
            <Route path="/lesson/:slug" element={<LessonPlayerPage />} />
            <Route path="/quiz/:quizId" element={<QuizPage />} />

            {/* Vocabulary Module Routes */}
            <Route path="/vocabulary" element={<VocabularyDashboardPage />} />
            <Route path="/vocabulary/learn" element={<LearnWordsPage />} />
            <Route path="/vocabulary/flashcards" element={<FlashcardsPage />} />
            <Route path="/vocabulary/practice" element={<PracticePage />} />
            <Route path="/vocabulary/review" element={<ReviewWordsPage />} />
            <Route path="/vocabulary/my-vocabulary" element={<MyVocabularyPage />} />

            <Route path="/diagnostic" element={<DiagnosticPage />} />
            <Route path="/tutor" element={<TutorPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Admin Panel */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboardPage />} />
            <Route path="students" element={<AdminStudentsPage />} />
            <Route path="lessons" element={<AdminLessonsPage />} />
            <Route path="analytics" element={<AdminAnalyticsPage />} />
            <Route path="telegram" element={<AdminTelegramPage />} />
          </Route>

          {/* 404 Catch-All */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
