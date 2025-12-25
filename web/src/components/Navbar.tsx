import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useTranslation } from 'react-i18next';

interface NavbarProps {
    userName?: string;
    userRole?: 'ADMIN' | 'TEACHER' | 'STUDENT';
}

export const Navbar: React.FC<NavbarProps> = ({ userName, userRole }) => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            // Check for demo session
            if (localStorage.getItem('demo_email')) {
                localStorage.removeItem('demo_email');
                localStorage.removeItem('demo_role');
                window.location.href = '/login';
                return;
            }

            await signOut(auth);
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
        document.documentElement.setAttribute('dir', lng === 'ar' ? 'rtl' : 'ltr');
    };

    return (
        <nav
            style={{
                backgroundColor: 'var(--bg-primary)',
                borderBottom: '1px solid var(--divider-color)',
                padding: 'var(--spacing-md) var(--spacing-lg)',
                position: 'sticky',
                top: 0,
                zIndex: 'var(--z-sticky)',
                boxShadow: 'var(--shadow-sm)'
            }}
        >
            <div
                className="container"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 'var(--spacing-md)'
                }}
            >
                {/* Logo and Title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xl)' }}>
                    <Link
                        to="/"
                        style={{
                            fontSize: 'var(--font-size-2xl)',
                            fontWeight: 'var(--font-weight-bold)',
                            color: 'var(--primary-600)',
                            textDecoration: 'none',
                            fontFamily: 'var(--font-family-heading)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--spacing-xs)'
                        }}
                    >
                        <span>🎓</span>
                        <span>{t('schoolPlatform')}</span>
                    </Link>

                    <Link
                        to="/about"
                        className="nav-link"
                        style={{
                            textDecoration: 'none',
                            color: 'var(--text-secondary)',
                            fontWeight: 'var(--font-weight-medium)',
                            fontSize: 'var(--font-size-md)',
                            padding: 'var(--spacing-xs) var(--spacing-md)',
                            borderRadius: 'var(--radius-md)',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        {t('aboutUs')}
                    </Link>
                </div>

                {/* Right Side */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                    {/* Language Selector */}
                    <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
                        <button
                            onClick={() => changeLanguage('en')}
                            className={i18n.language === 'en' ? 'btn-primary' : 'btn-secondary'}
                            style={{ padding: 'var(--spacing-xs) var(--spacing-sm)', fontSize: 'var(--font-size-sm)' }}
                        >
                            EN
                        </button>
                        <button
                            onClick={() => changeLanguage('tr')}
                            className={i18n.language === 'tr' ? 'btn-primary' : 'btn-secondary'}
                            style={{ padding: 'var(--spacing-xs) var(--spacing-sm)', fontSize: 'var(--font-size-sm)' }}
                        >
                            TR
                        </button>
                        <button
                            onClick={() => changeLanguage('ar')}
                            className={i18n.language === 'ar' ? 'btn-primary' : 'btn-secondary'}
                            style={{ padding: 'var(--spacing-xs) var(--spacing-sm)', fontSize: 'var(--font-size-sm)' }}
                        >
                            AR
                        </button>
                    </div>

                    {/* User Info */}
                    {userName && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                                    {userName}
                                </div>
                                {userRole && (
                                    <div className={`badge badge-${userRole === 'ADMIN' ? 'error' : userRole === 'TEACHER' ? 'primary' : 'success'}`}>
                                        {t(userRole.toLowerCase())}
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleLogout}
                                className="btn-outline"
                                style={{ padding: 'var(--spacing-xs) var(--spacing-md)', fontSize: 'var(--font-size-sm)' }}
                            >
                                {t('logout')}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .nav-link:hover {
                    background-color: var(--primary-50);
                    color: var(--primary-700) !important;
                }
            `}</style>
        </nav >
    );
};

export default Navbar;
