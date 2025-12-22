import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface SidebarProps {
    userRole: 'ADMIN' | 'TEACHER' | 'STUDENT';
}

interface NavItem {
    path: string;
    label: string;
    icon: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ userRole }) => {
    const location = useLocation();
    const { t } = useTranslation();

    const getNavItems = (): NavItem[] => {
        switch (userRole) {
            case 'ADMIN':
                return [
                    { path: '/admin', label: t('dashboard'), icon: '📊' },
                ];
            case 'TEACHER':
                return [
                    { path: '/teacher', label: t('dashboard'), icon: '📊' },
                    { path: '/teacher/content', label: t('content'), icon: '📚' },
                    { path: '/teacher/assessments', label: t('assessments'), icon: '📝' },
                ];
            case 'STUDENT':
                return [
                    { path: '/student', label: t('dashboard'), icon: '📊' },
                    { path: '/student/courses', label: t('courses'), icon: '📚' },
                    { path: '/student/assignments', label: t('assignments'), icon: '📝' },
                    { path: '/student/grades', label: t('grades'), icon: '🎯' },
                ];
            default:
                return [];
        }
    };

    const navItems = getNavItems();

    return (
        <aside
            style={{
                width: '240px',
                backgroundColor: 'var(--bg-primary)',
                borderRight: '1px solid var(--divider-color)',
                height: 'calc(100vh - 73px)', // Subtract navbar height
                position: 'sticky',
                top: '73px',
                overflowY: 'auto',
                padding: 'var(--spacing-lg) 0'
            }}
        >
            <nav>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--spacing-md)',
                                        padding: 'var(--spacing-md) var(--spacing-lg)',
                                        color: isActive ? 'var(--primary-600)' : 'var(--text-secondary)',
                                        backgroundColor: isActive ? 'rgba(33, 150, 243, 0.08)' : 'transparent',
                                        borderLeft: isActive ? '3px solid var(--primary-600)' : '3px solid transparent',
                                        textDecoration: 'none',
                                        fontWeight: isActive ? 'var(--font-weight-medium)' : 'var(--font-weight-normal)',
                                        transition: 'all var(--transition-fast)'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                        }
                                    }}
                                >
                                    <span style={{ fontSize: 'var(--font-size-xl)' }}>{item.icon}</span>
                                    <span>{item.label}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;
