import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
export const Sidebar = ({ userRole }) => {
    const location = useLocation();
    const { t } = useTranslation();
    const getNavItems = () => {
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
    return (_jsx("aside", { style: {
            width: '240px',
            backgroundColor: 'var(--bg-primary)',
            borderRight: '1px solid var(--divider-color)',
            height: 'calc(100vh - 73px)', // Subtract navbar height
            position: 'sticky',
            top: '73px',
            overflowY: 'auto',
            padding: 'var(--spacing-lg) 0'
        }, children: _jsx("nav", { children: _jsx("ul", { style: { listStyle: 'none', padding: 0, margin: 0 }, children: navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (_jsx("li", { children: _jsxs(Link, { to: item.path, style: {
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
                            }, onMouseEnter: (e) => {
                                if (!isActive) {
                                    e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                                }
                            }, onMouseLeave: (e) => {
                                if (!isActive) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }
                            }, children: [_jsx("span", { style: { fontSize: 'var(--font-size-xl)' }, children: item.icon }), _jsx("span", { children: item.label })] }) }, item.path));
                }) }) }) }));
};
export default Sidebar;
