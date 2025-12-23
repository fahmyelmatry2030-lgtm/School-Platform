import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebase';
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
export default function App() {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setLoading(true);
            if (firebaseUser) {
                setUser(firebaseUser);
                // Try to get role from claims first, then firestore
                const token = await firebaseUser.getIdTokenResult();
                let userRole = token.claims.role;
                if (!userRole && db) {
                    try {
                        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                        if (userDoc.exists()) {
                            userRole = userDoc.data().role;
                        }
                    }
                    catch (e) {
                        console.error('Error fetching role:', e);
                    }
                }
                setRole(userRole || 'STUDENT'); // Default to student
            }
            else {
                setUser(null);
                setRole(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center h-full", style: { minHeight: '100vh' }, children: _jsx(LoadingSpinner, { size: "lg" }) }));
    }
    const isAuthPage = location.pathname === '/login' || location.pathname === '/';
    return (_jsxs("div", { className: `app-container ${isAuthPage ? 'auth-layout' : ''}`, children: [!isAuthPage && user && (_jsx(Navbar, { userName: user.displayName || user.email || '', userRole: role || undefined })), _jsxs("div", { className: "app-body", children: [!isAuthPage && role && _jsx(Sidebar, { userRole: role }), _jsx("main", { className: "app-main", children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: user ? _jsx(Navigate, { to: `/${role?.toLowerCase()}`, replace: true }) : _jsx(Home, {}) }), _jsx(Route, { path: "/login", element: user ? _jsx(Navigate, { to: `/${role?.toLowerCase()}`, replace: true }) : _jsx(Login, {}) }), _jsx(Route, { path: "/admin", element: role === 'ADMIN' ? _jsx(DashboardAdmin, {}) : _jsx(Navigate, { to: "/", replace: true }) }), _jsx(Route, { path: "/teacher", element: role === 'TEACHER' ? _jsx(DashboardTeacher, {}) : _jsx(Navigate, { to: "/", replace: true }) }), _jsx(Route, { path: "/teacher/content/:subjectId?/:unitId?/:lessonId?", element: role === 'TEACHER' ? _jsx(TeacherContent, {}) : _jsx(Navigate, { to: "/", replace: true }) }), _jsx(Route, { path: "/teacher/assessments/:subjectId?/:unitId?/:lessonId?", element: role === 'TEACHER' ? _jsx(TeacherAssessments, {}) : _jsx(Navigate, { to: "/", replace: true }) }), _jsx(Route, { path: "/student", element: role === 'STUDENT' ? _jsx(DashboardStudent, {}) : _jsx(Navigate, { to: "/", replace: true }) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] }) })] }), _jsx("style", { children: `
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
      ` })] }));
}
