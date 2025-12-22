import React, { useState } from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import DashboardAdmin from './pages/DashboardAdmin';
import DashboardTeacher from './pages/DashboardTeacher';
import DashboardStudent from './pages/DashboardStudent';
import TeacherContent from './pages/TeacherContent';
import TeacherAssessments from './pages/TeacherAssessments';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT' | null;

// نسخة تجريبية للمعاينة بدون Firebase
export default function App() {
  const [demoMode, setDemoMode] = useState<{ active: boolean; role: UserRole }>({
    active: false,
    role: null,
  });

  const location = useLocation();

  if (!demoMode.active && location.pathname !== '/login') {
    return (
      <div className="demo-selection-container">
        <div className="card demo-card">
          <div className="card-content">
            <h1 className="demo-title">
              🎓 School Platform Demo
            </h1>
            <p className="demo-subtitle">
              اختر دوراً لمعاينة الصفحات المختلفة
            </p>

            <div className="demo-buttons">
              <button
                className="btn-primary demo-btn"
                onClick={() => setDemoMode({ active: true, role: 'ADMIN' })}
              >
                🔑 معاينة كمدير (Admin)
              </button>

              <button
                className="btn-primary demo-btn"
                onClick={() => setDemoMode({ active: true, role: 'TEACHER' })}
              >
                👨‍🏫 معاينة كمعلم (Teacher)
              </button>

              <button
                className="btn-primary demo-btn"
                onClick={() => setDemoMode({ active: true, role: 'STUDENT' })}
              >
                🎒 معاينة كطالب (Student)
              </button>

              <hr className="demo-divider" />

              <Link to="/login" className="no-underline">
                <button
                  className="btn-outline w-full p-md"
                >
                  📱 عرض صفحة Login
                </button>
              </Link>
            </div>

            <div className="alert alert-info demo-note">
              <strong>ملاحظة:</strong> هذا وضع معاينة فقط. لن تعمل وظائف Firebase (حفظ البيانات) حتى يتم إعداد Firebase.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // عرض التطبيق مع الدور المختار
  return (
    <div className={`app-container ${location.pathname === '/login' ? 'login-layout' : ''}`}>
      {location.pathname !== '/login' && (
        <Navbar
          userName="demo@school.local"
          userRole={demoMode.role || undefined}
        />
      )}

      <div className="app-body">
        {demoMode.role && location.pathname !== '/login' && <Sidebar userRole={demoMode.role} />}

        <main className="app-main">
          <Routes>
            <Route path="/" element={<Navigate to={`/${demoMode.role?.toLowerCase() || 'login'}`} replace />} />
            <Route path="/login" element={<Login />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<DashboardAdmin />} />

            {/* Teacher Routes */}
            <Route path="/teacher" element={<DashboardTeacher />} />
            <Route path="/teacher/content" element={<TeacherContent />} />
            <Route path="/teacher/assessments" element={<TeacherAssessments />} />

            {/* Student Routes */}
            <Route path="/student" element={<DashboardStudent />} />

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
