import React, { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db, googleProvider, isConfigured } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Login() {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState('admin@school.local');
  const [password, setPassword] = useState('Admin123!');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const changeLanguage = (lng: string) => {
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
    if (isRegistering) {
      if (!fullName.trim()) {
        setError(t('required'));
        return false;
      }
      if (password !== confirmPassword) {
        setError(t('passwordsDoNotMatch'));
        return false;
      }
    }
    return true;
  };

  const loginWithGoogle = async () => {
    if (!isConfigured) {
      setError(t('demoModeDesc') || 'Demo Mode: Google login not available.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const token = await cred.user.getIdTokenResult();
      const role = token.claims.role as string | undefined;

      // Default to student if no role is set yet
      if (role === 'ADMIN') navigate('/admin');
      else if (role === 'TEACHER') navigate('/teacher');
      else navigate('/student');
    } catch (e: any) {
      console.error('Google Login Error:', e);
      setError(t('loginError'));
    } finally {
      setLoading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;
    setLoading(true);

    // Demo Mode Bypass
    if (!isConfigured) {
      console.log('Using Demo Mode Local Login');
      setTimeout(() => {
        setLoading(false);
        const demoUsers: Record<string, { role: string, path: string }> = {
          'admin@school.local': { role: 'ADMIN', path: '/admin' },
          'teacher@school.local': { role: 'TEACHER', path: '/teacher' },
          'student@school.local': { role: 'STUDENT', path: '/student' }
        };

        if (isRegistering) {
          // Mock Registration
          localStorage.setItem('demo_role', 'STUDENT');
          localStorage.setItem('demo_email', email);
          localStorage.setItem('demo_name', fullName);
          window.location.href = '/student';
          return;
        }

        const demoUser = demoUsers[email];
        if (demoUser && (password === 'Admin123!' || password === 'Teacher123!' || password === 'Student123!')) {
          // Set demo session
          localStorage.setItem('demo_role', demoUser.role);
          localStorage.setItem('demo_email', email);

          // Force a reload or notify App.tsx (forcing reload is simplest here for full re-render)
          window.location.href = demoUser.path;
        } else {
          setError(t('loginError'));
        }
      }, 1000);
      return;
    }

    try {
      if (isRegistering) {
        // Registration Logic
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, {
          displayName: fullName
        });

        if (db) {
          await setDoc(doc(db, 'users', cred.user.uid), {
            email: email,
            role: 'STUDENT',
            displayName: fullName,
            createdAt: new Date()
          });
        }

        navigate('/student');
      } else {
        // Login Logic
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const token = await cred.user.getIdTokenResult();
        const role = token.claims.role as string | undefined;

        if (role === 'ADMIN') navigate('/admin');
        else if (role === 'TEACHER') navigate('/teacher');
        else navigate('/student');
      }
    } catch (e: any) {
      console.error(e);
      // Fallback to Demo Registration if real auth fails (for dev with partial config)
      if (isRegistering) {
        console.warn('Real registration failed. Falling back to Demo Mode.');
        localStorage.setItem('demo_role', 'STUDENT');
        localStorage.setItem('demo_email', email);
        localStorage.setItem('demo_name', fullName);
        window.location.href = '/student';
        return;
      }
      setError(t('loginError'));
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError(null);
    if (!isRegistering) {
      setEmail('');
      setPassword('');
    } else {
      setEmail('');
      setPassword('');
    }
  };



  return (
    <div className="login-container">
      <div className="login-content">
        {/* Language Switcher */}
        <div className="language-switcher">
          <button
            onClick={() => changeLanguage('en')}
            className={i18n.language === 'en' ? 'btn-primary' : 'btn-secondary'}
          >
            EN
          </button>
          <button
            onClick={() => changeLanguage('tr')}
            className={i18n.language === 'tr' ? 'btn-primary' : 'btn-secondary'}
          >
            TR
          </button>
          <button
            onClick={() => changeLanguage('ar')}
            className={i18n.language === 'ar' ? 'btn-primary' : 'btn-secondary'}
          >
            AR
          </button>
        </div>

        {/* Login Card */}
        <Card className="login-card">
          <CardContent>
            <div className="login-header">
              <Link to="/" className="back-link">
                ← {t('backToHome') || 'العودة للرئيسية'}
              </Link>
              <div className="login-icon">🎓</div>
              <h1 className="login-title">{t('schoolPlatform')}</h1>
              <p className="login-subtitle">
                {isRegistering ? t('createAccount') : t('welcome')}
              </p>
              {!isConfigured && (
                <div className="demo-badge">
                  {t('demoMode') || 'DEMO MODE'}
                </div>
              )}
            </div>

            <form onSubmit={submit} className="login-form">
              {isRegistering && (
                <div className="form-group">
                  <label htmlFor="fullname">{t('fullName')}</label>
                  <input
                    id="fullname"
                    type="text"
                    placeholder={t('fullName')}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={loading}
                  />
                </div>
              )}
              <div className="form-group">
                <label htmlFor="email">{t('email')}</label>
                <input
                  id="email"
                  type="email"
                  placeholder={t('email')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">{t('password')}</label>
                <input
                  id="password"
                  type="password"
                  placeholder={t('password')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="current-password"
                />
              </div>

              {isRegistering && (
                <div className="form-group">
                  <label htmlFor="confirmPassword">{t('confirmPassword')}</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder={t('confirmPassword')}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
              )}

              {error && (
                <div className="alert alert-error">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="btn-primary w-full login-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>{t('loading')}</span>
                  </>
                ) : (
                  isRegistering ? t('register') : t('login')
                )}
              </button>

              <div className="divider">
                <span>{t('or') || 'OR'}</span>
              </div>

              <button
                type="button"
                onClick={loginWithGoogle}
                className="btn-google w-full"
                disabled={loading}
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google"
                  width="18"
                  height="18"
                />
                <span>{t('signInWithGoogle') || 'Sign in with Google'}</span>
              </button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-primary hover:underline text-sm bg-transparent border-0 cursor-pointer"
                >
                  {isRegistering
                    ? t('alreadyHaveAccount')
                    : (t('dontHaveAccount') || "Don't have an account? Register")}
                </button>
              </div>
            </form>

          </CardContent>
        </Card>
      </div>

      <style>{`
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

        .demo-badge {
          display: inline-block;
          margin-top: var(--spacing-sm);
          padding: 2px 10px;
          background: #fef3c7;
          color: #92400e;
          border: 1px solid #f59e0b;
          border-radius: 9999px;
          font-size: 10px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 1px;
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

        @media (max-width: 480px) {
          .login-title {
            font-size: var(--font-size-2xl);
          }
          
          .login-icon {
            font-size: 3rem;
          }
        }
      `}</style>
    </div>
  );
}
