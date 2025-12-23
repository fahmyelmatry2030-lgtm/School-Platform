import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
export default function Login() {
    const { t, i18n } = useTranslation();
    const [email, setEmail] = useState('admin@school.local');
    const [password, setPassword] = useState('Admin123!');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        document.documentElement.setAttribute('dir', lng === 'ar' ? 'rtl' : 'ltr');
    };
    const validateForm = () => {
        if (!email.trim()) {
            setError(t('required'));
            return false;
        }
        if (!email.includes('@')) {
            setError(t('invalidEmail'));
            return false;
        }
        if (!password || password.length < 6) {
            setError(t('passwordTooShort'));
            return false;
        }
        return true;
    };
    const loginWithGoogle = async () => {
        setError(null);
        setLoading(true);
        try {
            const cred = await signInWithPopup(auth, googleProvider);
            const token = await cred.user.getIdTokenResult();
            const role = token.claims.role;
            // Default to student if no role is set yet
            if (role === 'ADMIN')
                navigate('/admin');
            else if (role === 'TEACHER')
                navigate('/teacher');
            else
                navigate('/student');
        }
        catch (e) {
            console.error('Google Login Error:', e);
            setError(t('loginError'));
        }
        finally {
            setLoading(false);
        }
    };
    const submit = async (e) => {
        e.preventDefault();
        setError(null);
        if (!validateForm())
            return;
        setLoading(true);
        try {
            const cred = await signInWithEmailAndPassword(auth, email, password);
            const token = await cred.user.getIdTokenResult();
            const role = token.claims.role;
            if (role === 'ADMIN')
                navigate('/admin');
            else if (role === 'TEACHER')
                navigate('/teacher');
            else
                navigate('/student');
        }
        catch (e) {
            setError(t('loginError'));
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "login-container", children: [_jsxs("div", { className: "login-content", children: [_jsxs("div", { className: "language-switcher", children: [_jsx("button", { onClick: () => changeLanguage('en'), className: i18n.language === 'en' ? 'btn-primary' : 'btn-secondary', children: "EN" }), _jsx("button", { onClick: () => changeLanguage('tr'), className: i18n.language === 'tr' ? 'btn-primary' : 'btn-secondary', children: "TR" }), _jsx("button", { onClick: () => changeLanguage('ar'), className: i18n.language === 'ar' ? 'btn-primary' : 'btn-secondary', children: "AR" })] }), _jsx(Card, { className: "login-card", children: _jsxs(CardContent, { children: [_jsxs("div", { className: "login-header", children: [_jsxs(Link, { to: "/", className: "back-link", children: ["\u2190 ", t('backToHome') || 'العودة للرئيسية'] }), _jsx("div", { className: "login-icon", children: "\uD83C\uDF93" }), _jsx("h1", { className: "login-title", children: t('schoolPlatform') }), _jsx("p", { className: "login-subtitle", children: t('welcome') })] }), _jsxs("form", { onSubmit: submit, className: "login-form", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "email", children: t('email') }), _jsx("input", { id: "email", type: "email", placeholder: t('email'), value: email, onChange: (e) => setEmail(e.target.value), disabled: loading, autoComplete: "email" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "password", children: t('password') }), _jsx("input", { id: "password", type: "password", placeholder: t('password'), value: password, onChange: (e) => setPassword(e.target.value), disabled: loading, autoComplete: "current-password" })] }), error && (_jsx("div", { className: "alert alert-error", children: error })), _jsx("button", { type: "submit", className: "btn-primary w-full login-button", disabled: loading, children: loading ? (_jsxs(_Fragment, { children: [_jsx(LoadingSpinner, { size: "sm" }), _jsx("span", { children: t('loading') })] })) : (t('login')) }), _jsx("div", { className: "divider", children: _jsx("span", { children: t('or') || 'OR' }) }), _jsxs("button", { type: "button", onClick: loginWithGoogle, className: "btn-google w-full", disabled: loading, children: [_jsx("img", { src: "https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg", alt: "Google", width: "18", height: "18" }), _jsx("span", { children: t('signInWithGoogle') || 'Sign in with Google' })] })] }), _jsxs("details", { className: "login-footer-details", children: [_jsx("summary", { className: "demo-accounts-summary", children: t('demoAccounts') || 'حسابات التجربة (Demo)' }), _jsxs("div", { className: "demo-accounts", children: [_jsxs("div", { className: "demo-account", onClick: () => { setEmail('admin@school.local'); setPassword('Admin123!'); }, children: [_jsx("span", { className: "badge badge-error", children: "Admin" }), _jsx("code", { children: "admin@school.local" })] }), _jsxs("div", { className: "demo-account", onClick: () => { setEmail('teacher@school.local'); setPassword('Teacher123!'); }, children: [_jsx("span", { className: "badge badge-primary", children: "Teacher" }), _jsx("code", { children: "teacher@school.local" })] }), _jsxs("div", { className: "demo-account", onClick: () => { setEmail('student@school.local'); setPassword('Student123!'); }, children: [_jsx("span", { className: "badge badge-success", children: "Student" }), _jsx("code", { children: "student@school.local" })] })] })] })] }) })] }), _jsx("style", { children: `
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-800) 100%);
          padding: var(--spacing-md);
        }

        .login-content {
          width: 100%;
          max-width: 440px;
        }

        .language-switcher {
          display: flex;
          gap: var(--spacing-sm);
          justify-content: center;
          margin-bottom: var(--spacing-lg);
        }

        .language-switcher button {
          padding: var(--spacing-xs) var(--spacing-md);
          font-size: var(--font-size-sm);
          min-width: 60px;
        }

        .login-card {
          animation: slideUp 0.4s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .login-header {
          text-align: center;
          margin-bottom: var(--spacing-xl);
        }

        .login-icon {
          font-size: 4rem;
          margin-bottom: var(--spacing-md);
        }

        .login-title {
          font-size: var(--font-size-3xl);
          font-weight: var(--font-weight-bold);
          color: var(--text-primary);
          margin-bottom: var(--spacing-xs);
        }

        .login-subtitle {
          font-size: var(--font-size-lg);
          color: var(--text-secondary);
          margin: 0;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }

        .form-group label {
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
          color: var(--text-secondary);
        }

        .login-button {
          margin-top: var(--spacing-md);
          padding: var(--spacing-md);
          font-size: var(--font-size-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-sm);
        }

        .divider {
          display: flex;
          align-items: center;
          text-align: center;
          color: var(--text-secondary);
          margin: var(--spacing-md) 0;
        }

        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid var(--divider-color);
        }

        .divider span {
          padding: 0 var(--spacing-md);
          font-size: var(--font-size-sm);
        }

        .btn-google {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-md);
          background-color: white;
          color: #757575;
          border: 1px solid var(--border-color);
          padding: var(--spacing-md);
          font-weight: var(--font-weight-medium);
          transition: all var(--transition-fast);
        }

        .btn-google:hover:not(:disabled) {
          background-color: #f8f9fa;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }

        [dir="rtl"] .btn-google {
          flex-direction: row-reverse;
        }

        .back-link {
          display: block;
          text-align: left;
          font-size: var(--font-size-sm);
          color: var(--primary-600);
          text-decoration: none;
          margin-bottom: var(--spacing-md);
        }

        [dir="rtl"] .back-link {
          text-align: right;
        }

        .login-footer-details {
          margin-top: var(--spacing-xl);
          padding-top: var(--spacing-lg);
          border-top: 1px solid var(--divider-color);
        }

        .demo-accounts-summary {
          cursor: pointer;
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
          color: var(--text-secondary);
          text-align: center;
          list-style: none;
        }

        .demo-accounts-summary:hover {
          color: var(--primary-600);
        }

        .demo-accounts {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
          margin-top: var(--spacing-md);
        }

        .demo-account {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm);
          background-color: var(--bg-tertiary);
          border-radius: var(--radius-md);
          font-size: var(--font-size-sm);
          cursor: pointer;
          transition: background-color var(--transition-fast);
        }

        .demo-account:hover {
          background-color: var(--primary-50);
        }

        .demo-account code {
          flex: 1;
          font-family: 'Courier New', monospace;
          color: var(--text-primary);
        }

        @media (max-width: 480px) {
          .login-title {
            font-size: var(--font-size-2xl);
          }
          
          .login-icon {
            font-size: 3rem;
          }
        }
      ` })] }));
}
