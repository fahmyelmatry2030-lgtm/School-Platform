import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Grades, Subjects, Classes, Users } from '../lib/firestore';
import { seedBasics } from '../lib/seed';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';
import { db } from '../firebase';
export default function DashboardAdmin() {
    const { t } = useTranslation();
    const [grades, setGrades] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [classes, setClasses] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [editUser, setEditUser] = useState(null);
    const isDemo = !db;
    const [deleteModal, setDeleteModal] = useState({
        open: false,
        type: '',
        id: '',
        name: '',
    });
    // form states
    const [gradeName, setGradeName] = useState('');
    const [subjectName, setSubjectName] = useState('');
    const [subjectCode, setSubjectCode] = useState('');
    const [className, setClassName] = useState('');
    const [classGradeId, setClassGradeId] = useState('');
    async function refreshAll() {
        setLoading(true);
        setError(null);
        try {
            if (isDemo) {
                setGrades([
                    { id: 'g1', name: 'Grade 7' },
                    { id: 'g2', name: 'Grade 8' }
                ]);
                setSubjects([
                    { id: 's1', name: 'Mathematics', code: 'MATH' },
                    { id: 's2', name: 'Science', code: 'SCI' }
                ]);
                setClasses([
                    { id: 'c1', name: '7-A', gradeId: 'g1' },
                    { id: 'c2', name: '8-B', gradeId: 'g2' }
                ]);
                setUsers([
                    { id: 'u1', email: 'admin@school.local', role: 'ADMIN', firstName: 'School', lastName: 'Admin', active: true },
                    { id: 'u2', email: 'teacher@school.local', role: 'TEACHER', firstName: 'Best', lastName: 'Teacher', active: true },
                    { id: 'u3', email: 'student@school.local', role: 'STUDENT', firstName: 'Star', lastName: 'Student', active: true }
                ]);
                return;
            }
            const [g, s, c, u] = await Promise.all([
                Grades.list(),
                Subjects.list(),
                Classes.list(),
                Users.list()
            ]);
            setGrades(g);
            setSubjects(s);
            setClasses(c);
            setUsers(u);
            if (!classGradeId && g.length)
                setClassGradeId(g[0].id);
        }
        catch (e) {
            setError(e.message ?? 'Failed to load');
        }
        finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        refreshAll();
    }, []);
    async function handleSeed() {
        setLoading(true);
        setError(null);
        try {
            await seedBasics();
            await refreshAll();
        }
        catch (e) {
            setError(e.message ?? 'Seed failed');
        }
        finally {
            setLoading(false);
        }
    }
    async function addGrade() {
        if (!gradeName.trim())
            return;
        setLoading(true);
        try {
            await Grades.create(gradeName.trim());
            setGradeName('');
            await refreshAll();
        }
        finally {
            setLoading(false);
        }
    }
    async function addSubject() {
        if (!subjectName.trim())
            return;
        setLoading(true);
        try {
            await Subjects.create(subjectName.trim(), subjectCode.trim() || undefined);
            setSubjectName('');
            setSubjectCode('');
            await refreshAll();
        }
        finally {
            setLoading(false);
        }
    }
    async function addClass() {
        if (!className.trim() || !classGradeId)
            return;
        setLoading(true);
        try {
            await Classes.create(className.trim(), classGradeId);
            setClassName('');
            await refreshAll();
        }
        finally {
            setLoading(false);
        }
    }
    async function handleDelete() {
        const { type, id } = deleteModal;
        setLoading(true);
        try {
            if (!isDemo) {
                if (type === 'grade')
                    await Grades.remove(id);
                else if (type === 'subject')
                    await Subjects.remove(id);
                else if (type === 'class')
                    await Classes.remove(id);
                else if (type === 'user')
                    await Users.remove(id);
            }
            else {
                if (type === 'grade')
                    setGrades(grades.filter(g => g.id !== id));
                else if (type === 'subject')
                    setSubjects(subjects.filter(s => s.id !== id));
                else if (type === 'class')
                    setClasses(classes.filter(c => c.id !== id));
                else if (type === 'user')
                    setUsers(users.filter(u => u.id !== id));
            }
            await refreshAll();
            setDeleteModal({ open: false, type: '', id: '', name: '' });
        }
        finally {
            setLoading(false);
        }
    }
    async function handleUpdateUser() {
        if (!editUser)
            return;
        setLoading(true);
        try {
            if (!isDemo) {
                await Users.update(editUser.id, {
                    role: editUser.role,
                    active: editUser.active,
                    firstName: editUser.firstName,
                    lastName: editUser.lastName
                });
            }
            else {
                setUsers(users.map(u => u.id === editUser.id ? editUser : u));
            }
            setEditUser(null);
            await refreshAll();
        }
        finally {
            setLoading(false);
        }
    }
    return (_jsxs("div", { className: "dashboard-container", children: [_jsxs("div", { className: "dashboard-header", children: [_jsx("h1", { children: t('adminDashboard') }), _jsxs("div", { className: "header-actions", children: [_jsx("button", { onClick: refreshAll, disabled: loading, className: "btn-secondary", children: t('refresh') }), _jsx("button", { onClick: handleSeed, disabled: loading, className: "btn-primary", children: t('seedData') })] })] }), error && _jsx("div", { className: "alert alert-error", children: error }), _jsxs("div", { className: "grid grid-3", children: [_jsx(Card, { className: "stat-card", children: _jsxs(CardContent, { children: [_jsx("div", { className: "stat-icon", children: "\uD83D\uDCCA" }), _jsx("div", { className: "stat-value", children: grades.length }), _jsx("div", { className: "stat-label", children: t('grades') })] }) }), _jsx(Card, { className: "stat-card", children: _jsxs(CardContent, { children: [_jsx("div", { className: "stat-icon", children: "\uD83D\uDCDA" }), _jsx("div", { className: "stat-value", children: subjects.length }), _jsx("div", { className: "stat-label", children: t('subjects') })] }) }), _jsx(Card, { className: "stat-card", children: _jsxs(CardContent, { children: [_jsx("div", { className: "stat-icon", children: "\uD83C\uDFEB" }), _jsx("div", { className: "stat-value", children: classes.length }), _jsx("div", { className: "stat-label", children: t('classes') })] }) }), _jsx(Card, { className: "stat-card", children: _jsxs(CardContent, { children: [_jsx("div", { className: "stat-icon", children: "\uD83D\uDC65" }), _jsx("div", { className: "stat-value", children: users.length }), _jsx("div", { className: "stat-label", children: t('users') })] }) })] }), _jsxs("div", { className: "grid", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: t('grades') }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "form-group", children: _jsxs("div", { className: "input-with-button", children: [_jsx("input", { placeholder: t('gradeName'), value: gradeName, onChange: (e) => setGradeName(e.target.value), disabled: loading }), _jsx("button", { onClick: addGrade, disabled: loading || !gradeName.trim(), className: "btn-primary", children: t('add') })] }) }), _jsx("div", { className: "items-list", children: grades.length === 0 ? (_jsx("div", { className: "empty-state", children: t('noGrades') })) : (grades.map((g) => (_jsxs("div", { className: "list-item", children: [_jsx("span", { className: "item-name", children: g.name }), _jsx("button", { onClick: () => setDeleteModal({ open: true, type: 'grade', id: g.id, name: g.name }), disabled: loading, className: "btn-danger btn-sm", children: t('delete') })] }, g.id)))) })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: t('subjects') }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "form-group", children: _jsxs("div", { className: "input-with-button", children: [_jsx("input", { placeholder: t('subjectName'), value: subjectName, onChange: (e) => setSubjectName(e.target.value), disabled: loading }), _jsx("input", { placeholder: `${t('code')} (${t('optional')})`, value: subjectCode, onChange: (e) => setSubjectCode(e.target.value), disabled: loading, className: "input-code" }), _jsx("button", { onClick: addSubject, disabled: loading || !subjectName.trim(), className: "btn-primary", children: t('add') })] }) }), _jsx("div", { className: "items-list", children: subjects.length === 0 ? (_jsx("div", { className: "empty-state", children: t('noSubjects') })) : (subjects.map((s) => (_jsxs("div", { className: "list-item", children: [_jsxs("span", { className: "item-name", children: [s.name, " ", s.code && _jsxs("code", { children: ["(", s.code, ")"] })] }), _jsx("button", { onClick: () => setDeleteModal({ open: true, type: 'subject', id: s.id, name: s.name }), disabled: loading, className: "btn-danger btn-sm", children: t('delete') })] }, s.id)))) })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: t('classes') }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "form-group", children: _jsxs("div", { className: "input-with-button-centered", children: [_jsx("input", { placeholder: t('className'), value: className, onChange: (e) => setClassName(e.target.value), disabled: loading, title: t('className') }), _jsx("select", { value: classGradeId, onChange: (e) => setClassGradeId(e.target.value), disabled: loading, title: t('grades'), children: grades.map((g) => (_jsx("option", { value: g.id, children: g.name }, g.id))) }), _jsx("button", { onClick: addClass, disabled: loading || !className.trim() || !classGradeId, className: "btn-primary", children: t('add') })] }) }), _jsx("div", { className: "items-list", children: classes.length === 0 ? (_jsx("div", { className: "empty-state", children: t('noClasses') })) : (classes.map((c) => (_jsxs("div", { className: "list-item", children: [_jsxs("span", { className: "item-name", children: [c.name, " ", _jsxs("span", { className: "item-meta", children: ["\u2014 ", grades.find((g) => g.id === c.gradeId)?.name || c.gradeId] })] }), _jsx("button", { onClick: () => setDeleteModal({ open: true, type: 'class', id: c.id, name: c.name }), disabled: loading, className: "btn-danger btn-sm", children: t('delete') })] }, c.id)))) })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: t('users') }) }), _jsx(CardContent, { children: _jsx("div", { className: "items-list", children: users.length === 0 ? (_jsx("div", { className: "empty-state", children: t('noUsers') })) : (users.map((u) => (_jsxs("div", { className: "list-item", children: [_jsxs("div", { className: "item-info", children: [_jsxs("span", { className: "item-name", children: [u.firstName, " ", u.lastName] }), _jsxs("div", { className: "item-meta", children: [_jsx("code", { children: u.email }), _jsx("span", { className: `badge badge-${u.role.toLowerCase()}`, children: u.role }), _jsx("span", { className: `badge ${u.active ? 'badge-success' : 'badge-error'}`, children: u.active ? t('active') : t('inactive') })] })] }), _jsxs("div", { className: "item-actions", children: [_jsx("button", { onClick: () => setEditUser(u), className: "btn-secondary btn-sm", children: t('edit') }), _jsx("button", { onClick: () => setDeleteModal({ open: true, type: 'user', id: u.id, name: u.email }), disabled: loading, className: "btn-danger btn-sm", children: t('delete') })] })] }, u.id)))) }) })] })] }), _jsxs(Modal, { isOpen: deleteModal.open, onClose: () => setDeleteModal({ open: false, type: '', id: '', name: '' }), title: t('confirmDelete'), children: [_jsxs("p", { children: ["Are you sure you want to delete ", _jsx("strong", { children: deleteModal.name }), "?"] }), _jsxs("div", { className: "modal-actions", children: [_jsx("button", { onClick: handleDelete, disabled: loading, className: "btn-danger w-full", children: loading ? _jsx(LoadingSpinner, { size: "sm" }) : t('delete') }), _jsx("button", { onClick: () => setDeleteModal({ open: false, type: '', id: '', name: '' }), disabled: loading, className: "btn-secondary w-full", children: t('cancel') })] })] }), _jsx(Modal, { isOpen: !!editUser, onClose: () => setEditUser(null), title: t('edit'), children: editUser && (_jsxs("div", { className: "user-edit-form", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: t('firstName') }), _jsx("input", { value: editUser.firstName, onChange: (e) => setEditUser({ ...editUser, firstName: e.target.value }), disabled: loading, title: t('firstName') })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: t('lastName') }), _jsx("input", { value: editUser.lastName, onChange: (e) => setEditUser({ ...editUser, lastName: e.target.value }), disabled: loading, title: t('lastName') })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: t('role') }), _jsxs("select", { value: editUser.role, onChange: (e) => setEditUser({ ...editUser, role: e.target.value }), disabled: loading, title: t('role'), children: [_jsx("option", { value: "ADMIN", children: "ADMIN" }), _jsx("option", { value: "TEACHER", children: "TEACHER" }), _jsx("option", { value: "STUDENT", children: "STUDENT" })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Status" }), _jsxs("div", { className: "status-radio-group", children: [_jsxs("label", { className: "radio-label", children: [_jsx("input", { type: "radio", checked: editUser.active, onChange: () => setEditUser({ ...editUser, active: true }), disabled: loading, title: t('active') }), t('active')] }), _jsxs("label", { className: "radio-label", children: [_jsx("input", { type: "radio", checked: !editUser.active, onChange: () => setEditUser({ ...editUser, active: false }), disabled: loading, title: t('inactive') }), t('inactive')] })] })] }), _jsxs("div", { className: "modal-actions", children: [_jsx("button", { onClick: handleUpdateUser, disabled: loading, className: "btn-primary w-full", children: loading ? _jsx(LoadingSpinner, { size: "sm" }) : t('save') }), _jsx("button", { onClick: () => setEditUser(null), disabled: loading, className: "btn-secondary w-full", children: t('cancel') })] })] })) }), _jsx("style", { children: `
        .dashboard-container {
          max-width: 1400px;
          margin: 0 auto;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-xl);
          flex-wrap: wrap;
          gap: var(--spacing-md);
        }

        .dashboard-header h1 {
          font-size: var(--font-size-4xl);
          margin: 0;
        }

        .header-actions {
          display: flex;
          gap: var(--spacing-sm);
        }

        .stat-card .card-content {
          text-align: center;
          padding: var(--spacing-xl);
        }

        .stat-icon {
          font-size: 3rem;
          margin-bottom: var(--spacing-md);
        }

        .stat-value {
          font-size: var(--font-size-4xl);
          font-weight: var(--font-weight-bold);
          color: var(--primary-600);
          margin-bottom: var(--spacing-xs);
        }

        .stat-label {
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .items-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
          margin-top: var(--spacing-md);
        }

        .list-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-md);
          background-color: var(--bg-tertiary);
          border-radius: var(--radius-md);
          transition: background-color var(--transition-fast);
        }

        .list-item:hover {
          background-color: var(--bg-secondary);
        }

        .item-name {
          font-weight: var(--font-weight-medium);
          color: var(--text-primary);
        }

        .item-meta {
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
          font-weight: var(--font-weight-normal);
          display: flex;
          gap: var(--spacing-sm);
          align-items: center;
          margin-top: var(--spacing-xs);
        }

        .user-edit-form {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .status-radio-group {
          display: flex;
          gap: var(--spacing-md);
        }

        .radio-label {
          display: flex;
          align-items: center;
          gap: 5px;
          cursor: pointer;
        }

        .modal-actions {
          display: flex;
          gap: var(--spacing-md);
          margin-top: var(--spacing-lg);
        }

        .input-with-button {
          display: flex;
          gap: var(--spacing-sm);
        }

        .input-with-button-centered {
          display: flex;
          gap: var(--spacing-sm);
          align-items: center;
        }

        .input-code {
          max-width: 150px;
        }

        .empty-state {
          text-align: center;
          padding: var(--spacing-xl);
          color: var(--text-secondary);
          font-style: italic;
        }

        .btn-sm {
          padding: var(--spacing-xs) var(--spacing-md);
          font-size: var(--font-size-sm);
        }

        @media (max-width: 768px) {
          .dashboard-header {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      ` })] }));
}
