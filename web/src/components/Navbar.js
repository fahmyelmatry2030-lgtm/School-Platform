import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useTranslation } from 'react-i18next';
export const Navbar = ({ userName, userRole }) => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login');
        }
        catch (error) {
            console.error('Logout error:', error);
        }
    };
    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        document.documentElement.setAttribute('dir', lng === 'ar' ? 'rtl' : 'ltr');
    };
    return (_jsx("nav", { style: {
            backgroundColor: 'var(--bg-primary)',
            borderBottom: '1px solid var(--divider-color)',
            padding: 'var(--spacing-md) var(--spacing-lg)',
            position: 'sticky',
            top: 0,
            zIndex: 'var(--z-sticky)',
            boxShadow: 'var(--shadow-sm)'
        }, children: _jsxs("div", { className: "container", style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 'var(--spacing-md)'
            }, children: [_jsx("div", { style: { display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }, children: _jsxs(Link, { to: "/", style: {
                            fontSize: 'var(--font-size-2xl)',
                            fontWeight: 'var(--font-weight-bold)',
                            color: 'var(--primary-600)',
                            textDecoration: 'none',
                            fontFamily: 'var(--font-family-heading)'
                        }, children: ["\uD83C\uDF93 ", t('schoolPlatform')] }) }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }, children: [_jsxs("div", { style: { display: 'flex', gap: 'var(--spacing-xs)' }, children: [_jsx("button", { onClick: () => changeLanguage('en'), className: i18n.language === 'en' ? 'btn-primary' : 'btn-secondary', style: { padding: 'var(--spacing-xs) var(--spacing-sm)', fontSize: 'var(--font-size-sm)' }, children: "EN" }), _jsx("button", { onClick: () => changeLanguage('tr'), className: i18n.language === 'tr' ? 'btn-primary' : 'btn-secondary', style: { padding: 'var(--spacing-xs) var(--spacing-sm)', fontSize: 'var(--font-size-sm)' }, children: "TR" }), _jsx("button", { onClick: () => changeLanguage('ar'), className: i18n.language === 'ar' ? 'btn-primary' : 'btn-secondary', style: { padding: 'var(--spacing-xs) var(--spacing-sm)', fontSize: 'var(--font-size-sm)' }, children: "AR" })] }), userName && (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }, children: [_jsxs("div", { style: { textAlign: 'right' }, children: [_jsx("div", { style: { fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }, children: userName }), userRole && (_jsx("div", { className: `badge badge-${userRole === 'ADMIN' ? 'error' : userRole === 'TEACHER' ? 'primary' : 'success'}`, children: t(userRole.toLowerCase()) }))] }), _jsx("button", { onClick: handleLogout, className: "btn-outline", style: { padding: 'var(--spacing-xs) var(--spacing-md)', fontSize: 'var(--font-size-sm)' }, children: t('logout') })] }))] })] }) }));
};
export default Navbar;
