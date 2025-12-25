import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db, isConfigured } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import Home from './pages/Home';
import Login from './pages/Login';
import DashboardAdmin from './pages/DashboardAdmin';
import DashboardTeacher from './pages/DashboardTeacher';
import DashboardStudent from './pages/DashboardStudent';
import TeacherContent from './pages/TeacherContent';
import TeacherAssessments from './pages/TeacherAssessments';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import LoadingSpinner from './components/LoadingSpinner';

type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT' | null;

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    if (!auth || !isConfigured) {
      console.log('App: Firebase not configured. Checking for demo session.');
      // Check local storage for demo session
      const demoRole = localStorage.getItem('demo_role') as UserRole;
      const demoEmail = localStorage.getItem('demo_email');
      const demoName = localStorage.getItem('demo_name');

      if (demoRole && demoEmail) {
        setUser({
          email: demoEmail,
          uid: 'demo-' + demoRole.toLowerCase(),
          displayName: demoName || 'Demo ' + demoRole
        } as User);
        setRole(demoRole);
      }
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        // Try to get role from claims first, then firestore
        const token = await firebaseUser.getIdTokenResult();
        let userRole = token.claims.role as UserRole;

        if (!userRole && db) {
          try {
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (userDoc.exists()) {
              userRole = userDoc.data().role as UserRole;
            }
          } catch (e) {
            console.error('Error fetching role:', e);
          }
        }
        setRole(userRole || 'STUDENT'); // Default to student
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '100vh', width: '100%' }}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const isLoginPage = location.pathname === '/login';
  const isHomePage = location.pathname === '/';

  return (
    <div className={`app-container ${isLoginPage ? 'login-layout' : ''}`}>
      {!isLoginPage && (
        <Navbar
          userName={user?.displayName || user?.email || ''}
          userRole={role || undefined}
        />
      )}

      <div className="app-body">
        {!isLoginPage && !isHomePage && role && <Sidebar userRole={role} />}

        <main className="app-main">
          <Routes>
            <Route path="/" element={user ? <Navigate to={`/${role?.toLowerCase()}`} replace /> : <Home />} />
            <Route path="/login" element={user ? <Navigate to={`/${role?.toLowerCase()}`} replace /> : <Login />} />

            {/* Admin Routes */}
            <Route path="/admin" element={role === 'ADMIN' ? <DashboardAdmin /> : <Navigate to="/" replace />} />

            {/* Teacher Routes */}
            <Route path="/teacher" element={role === 'TEACHER' ? <DashboardTeacher /> : <Navigate to="/" replace />} />
            <Route path="/teacher/content/:subjectId?/:unitId?/:lessonId?" element={role === 'TEACHER' ? <TeacherContent /> : <Navigate to="/" replace />} />
            <Route path="/teacher/assessments/:subjectId?/:unitId?/:lessonId?" element={role === 'TEACHER' ? <TeacherAssessments /> : <Navigate to="/" replace />} />

            {/* Student Routes */}
            <Route path="/student" element={role === 'STUDENT' ? <DashboardStudent /> : <Navigate to="/" replace />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      <style>{`
        .app-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .app-body {
          display: flex;
          flex: 1;
        }

        .app-main {
          flex: 1;
          padding: var(--spacing-lg);
          overflow-y: auto;
          background-color: var(--bg-secondary);
        }

        .login-layout .app-main {
          padding: 0;
          background-color: transparent;
        }

        @media (max-width: 768px) {
          .app-main {
            padding: var(--spacing-md);
          }
        }

        /* Demo Selection Styles */
        .demo-selection-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-800) 100%);
          padding: var(--spacing-lg);
        }

        .demo-card {
          max-width: 500px;
          width: 100%;
          text-align: center;
        }

        .demo-card .card-content {
          padding: var(--spacing-2xl);
        }

        .demo-title {
          font-size: var(--font-size-3xl);
          margin-bottom: var(--spacing-md);
        }

        .demo-subtitle {
          color: var(--text-secondary);
          margin-bottom: var(--spacing-xl);
        }

        .demo-buttons {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .demo-btn {
          padding: var(--spacing-md);
          font-size: var(--font-size-lg);
        }

        .demo-divider {
          margin: var(--spacing-lg) 0;
          border-color: var(--divider-color);
        }

        .no-underline {
          text-decoration: none;
        }

        .demo-note {
          margin-top: var(--spacing-xl);
          text-align: right;
        }
      `}</style>
    </div>
  );
}
