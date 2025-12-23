import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Subjects } from '../lib/firestore';
import { Units, Lessons, Assets } from '../lib/content';
import { uploadContent } from '../lib/storage';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import { db } from '../firebase';
export default function TeacherContent() {
    const { t } = useTranslation();
    const { subjectId, unitId, lessonId } = useParams();
    const navigate = useNavigate();
    const [subjects, setSubjects] = useState([]);
    const [units, setUnits] = useState([]);
    const [lessons, setLessons] = useState([]);
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    // forms
    const [unitTitle, setUnitTitle] = useState('');
    const [lessonTitle, setLessonTitle] = useState('');
    const [assetTitle, setAssetTitle] = useState('');
    const [assetType, setAssetType] = useState('PDF');
    const [assetLink, setAssetLink] = useState('');
    const [file, setFile] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editingTitle, setEditingTitle] = useState('');
    const isDemo = !db;
    async function loadSubjects() {
        if (isDemo) {
            const demoSubjects = [
                { id: 'math-101', name: 'Mathematics' },
                { id: 'sci-202', name: 'Science' },
                { id: 'hist-303', name: 'History' }
            ];
            setSubjects(demoSubjects);
            if (!subjectId)
                navigate(`/teacher/content/${demoSubjects[0].id}`, { replace: true });
            return;
        }
        const s = await Subjects.list();
        setSubjects(s);
        if (!subjectId && s.length)
            navigate(`/teacher/content/${s[0].id}`, { replace: true });
    }
    async function loadUnits() {
        if (!subjectId)
            return;
        if (isDemo) {
            if (units.length === 0) {
                setUnits([
                    { id: 'u1', title: 'Unit 1: Introduction' },
                    { id: 'u2', title: 'Unit 2: Advanced Topics' }
                ]);
            }
            return;
        }
        const u = await Units.list(subjectId);
        setUnits(u);
        if (u.length && !unitId)
            navigate(`/teacher/content/${subjectId}/${u[0].id}`, { replace: true });
    }
    async function loadLessons() {
        if (!subjectId || !unitId)
            return;
        if (isDemo) {
            if (lessons.length === 0) {
                setLessons([
                    { id: 'l1', title: 'Lesson 1.1: Basics' },
                    { id: 'l2', title: 'Lesson 1.2: Intermediate' }
                ]);
            }
            return;
        }
        const l = await Lessons.list(subjectId, unitId);
        setLessons(l);
        if (l.length && !lessonId)
            navigate(`/teacher/content/${subjectId}/${unitId}/${l[0].id}`, { replace: true });
    }
    async function loadAssets() {
        if (!subjectId || !unitId || !lessonId)
            return;
        if (isDemo) {
            if (assets.length === 0) {
                setAssets([
                    { id: 'a1', title: 'Syllabus PDF', type: 'PDF', url: '#' },
                    { id: 'a2', title: 'Intro Video', type: 'VIDEO', url: '#' }
                ]);
            }
            return;
        }
        const a = await Assets.list(subjectId, unitId, lessonId);
        setAssets(a);
    }
    useEffect(() => { loadSubjects(); }, []);
    useEffect(() => { loadUnits(); }, [subjectId]);
    useEffect(() => { loadLessons(); }, [unitId]);
    useEffect(() => { loadAssets(); }, [lessonId]);
    async function deleteUnit(id, e) {
        e.stopPropagation();
        if (!confirm(t('confirmDelete')))
            return;
        setLoading(true);
        try {
            if (!isDemo)
                await Units.remove(subjectId, id);
            else
                setUnits(units.filter(u => u.id !== id));
            if (unitId === id)
                navigate(`/teacher/content/${subjectId}`);
            await loadUnits();
        }
        catch (e) {
            setError(e.message);
        }
        finally {
            setLoading(false);
        }
    }
    async function deleteLesson(id, e) {
        e.stopPropagation();
        if (!confirm(t('confirmDelete')))
            return;
        setLoading(true);
        try {
            if (!isDemo)
                await Lessons.remove(subjectId, unitId, id);
            else
                setLessons(lessons.filter(l => l.id !== id));
            if (lessonId === id)
                navigate(`/teacher/content/${subjectId}/${unitId}`);
            await loadLessons();
        }
        catch (e) {
            setError(e.message);
        }
        finally {
            setLoading(false);
        }
    }
    async function deleteAsset(id) {
        if (!confirm(t('confirmDelete')))
            return;
        setLoading(true);
        try {
            if (!isDemo)
                await Assets.remove(subjectId, unitId, lessonId, id);
            else
                setAssets(assets.filter(a => a.id !== id));
            await loadAssets();
        }
        catch (e) {
            setError(e.message);
        }
        finally {
            setLoading(false);
        }
    }
    function startEditing(id, currentTitle, e) {
        e.stopPropagation();
        setEditingId(id);
        setEditingTitle(currentTitle);
    }
    async function saveEdit(type) {
        if (!editingId || !editingTitle.trim())
            return;
        setLoading(true);
        try {
            if (!isDemo) {
                if (type === 'unit')
                    await Units.update(subjectId, editingId, { title: editingTitle.trim() });
                else if (type === 'lesson')
                    await Lessons.update(subjectId, unitId, editingId, { title: editingTitle.trim() });
                else if (type === 'asset')
                    await Assets.update(subjectId, unitId, lessonId, editingId, { title: editingTitle.trim() });
            }
            else {
                if (type === 'unit')
                    setUnits(units.map(u => u.id === editingId ? { ...u, title: editingTitle.trim() } : u));
                else if (type === 'lesson')
                    setLessons(lessons.map(l => l.id === editingId ? { ...l, title: editingTitle.trim() } : l));
                else if (type === 'asset')
                    setAssets(assets.map(a => a.id === editingId ? { ...a, title: editingTitle.trim() } : a));
            }
            setEditingId(null);
            if (type === 'unit')
                await loadUnits();
            else if (type === 'lesson')
                await loadLessons();
            else
                await loadAssets();
        }
        catch (e) {
            setError(e.message);
        }
        finally {
            setLoading(false);
        }
    }
    async function addUnit() {
        if (!subjectId || !unitTitle.trim())
            return;
        setLoading(true);
        setError(null);
        try {
            if (!isDemo) {
                await Units.create(subjectId, unitTitle.trim());
            }
            else {
                const newUnit = { id: 'demo-' + Date.now(), title: unitTitle.trim() };
                setUnits([...units, newUnit]);
            }
            setUnitTitle('');
            await loadUnits();
        }
        catch (e) {
            setError(e.message);
        }
        finally {
            setLoading(false);
        }
    }
    async function addLesson() {
        if (!subjectId || !unitId || !lessonTitle.trim())
            return;
        setLoading(true);
        setError(null);
        try {
            if (!isDemo) {
                await Lessons.create(subjectId, unitId, lessonTitle.trim());
            }
            else {
                const newLesson = { id: 'demo-' + Date.now(), title: lessonTitle.trim() };
                setLessons([...lessons, newLesson]);
            }
            setLessonTitle('');
            await loadLessons();
        }
        catch (e) {
            setError(e.message);
        }
        finally {
            setLoading(false);
        }
    }
    async function addAsset() {
        if (!subjectId || !unitId || !lessonId || !assetTitle.trim())
            return;
        setLoading(true);
        setError(null);
        try {
            let urlOrKey = assetLink.trim();
            if (!isDemo) {
                if (assetType !== 'LINK' && file) {
                    const res = await uploadContent(lessonId, file);
                    urlOrKey = res.url;
                }
                await Assets.create(subjectId, unitId, lessonId, {
                    title: assetTitle.trim(),
                    type: assetType,
                    urlOrKey: urlOrKey,
                });
            }
            else {
                const newAsset = { id: 'demo-' + Date.now(), title: assetTitle.trim(), type: assetType, url: urlOrKey };
                setAssets([...assets, newAsset]);
            }
            setAssetTitle('');
            setAssetLink('');
            setFile(null);
            await loadAssets();
        }
        catch (e) {
            setError(e.message);
        }
        finally {
            setLoading(false);
        }
    }
    return (_jsxs("div", { className: "content-page", children: [_jsxs("div", { className: "page-header", children: [_jsx("h1", { children: t('content') }), _jsx("p", { className: "page-subtitle", children: "Manage units, lessons, and learning materials" })] }), error && _jsx("div", { className: "alert alert-error", children: error }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "\uD83D\uDCDA Select Subject" }) }), _jsxs(CardContent, { children: [_jsxs("select", { value: subjectId || '', onChange: (e) => navigate(`/teacher/content/${e.target.value}`), disabled: loading, className: "select-full", title: "Select Subject", children: [_jsx("option", { value: "", children: "-- Select Subject --" }), subjects.map((s) => (_jsx("option", { value: s.id, children: s.name }, s.id)))] }), isDemo && (_jsxs("div", { className: "demo-badge", children: [_jsx("strong", { children: "Demo Mode:" }), " You can add and delete items locally."] }))] })] }), subjectId && (_jsxs("div", { className: "grid grid-3", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: t('units') }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "form-group", children: [_jsx("input", { placeholder: t('unitTitle'), value: unitTitle, onChange: (e) => setUnitTitle(e.target.value), disabled: loading }), _jsx("button", { onClick: addUnit, disabled: loading || !unitTitle.trim(), className: "btn-primary btn-sm", children: loading ? _jsx(LoadingSpinner, { size: "sm" }) : t('add') })] }), _jsx("div", { className: "items-list", children: units.length === 0 ? (_jsx("div", { className: "empty-state", children: t('noUnits') })) : (units.map((u) => (_jsx("div", { className: `list-item-clickable ${unitId === u.id ? 'active' : ''}`, onClick: () => navigate(`/teacher/content/${subjectId}/${u.id}`), children: editingId === u.id ? (_jsxs("div", { className: "edit-form", onClick: e => e.stopPropagation(), children: [_jsx("input", { value: editingTitle, onChange: e => setEditingTitle(e.target.value), onKeyDown: e => e.key === 'Enter' && saveEdit('unit'), autoFocus: true, title: "Edit Unit Title" }), _jsx("button", { className: "btn-icon", onClick: () => saveEdit('unit'), children: "\u2705" })] })) : (_jsxs(_Fragment, { children: [_jsx("span", { className: "item-title", children: u.title }), _jsxs("div", { className: "item-actions", children: [unitId === u.id && _jsx("span", { className: "badge badge-primary", children: "Selected" }), _jsx("button", { className: "btn-icon", onClick: (e) => startEditing(u.id, u.title, e), title: t('edit'), children: "\u270F\uFE0F" }), _jsx("button", { className: "btn-icon btn-danger-soft", onClick: (e) => deleteUnit(u.id, e), title: t('delete'), children: "\uD83D\uDDD1\uFE0F" })] })] })) }, u.id)))) })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: t('lessons') }) }), _jsx(CardContent, { children: !unitId ? (_jsx("div", { className: "empty-state", children: "Select a unit first" })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "form-group", children: [_jsx("input", { placeholder: t('lessonTitle'), value: lessonTitle, onChange: (e) => setLessonTitle(e.target.value), disabled: loading }), _jsx("button", { onClick: addLesson, disabled: loading || !lessonTitle.trim(), className: "btn-primary btn-sm", children: loading ? _jsx(LoadingSpinner, { size: "sm" }) : t('add') })] }), _jsx("div", { className: "items-list", children: lessons.length === 0 ? (_jsx("div", { className: "empty-state", children: t('noLessons') })) : (lessons.map((l) => (_jsx("div", { className: `list-item-clickable ${lessonId === l.id ? 'active' : ''}`, onClick: () => navigate(`/teacher/content/${subjectId}/${unitId}/${l.id}`), children: editingId === l.id ? (_jsxs("div", { className: "edit-form", onClick: e => e.stopPropagation(), children: [_jsx("input", { value: editingTitle, onChange: e => setEditingTitle(e.target.value), onKeyDown: e => e.key === 'Enter' && saveEdit('lesson'), autoFocus: true, title: "Edit Lesson Title" }), _jsx("button", { className: "btn-icon", onClick: () => saveEdit('lesson'), children: "\u2705" })] })) : (_jsxs(_Fragment, { children: [_jsx("span", { className: "item-title", children: l.title }), _jsxs("div", { className: "item-actions", children: [lessonId === l.id && _jsx("span", { className: "badge badge-primary", children: "Selected" }), _jsx("button", { className: "btn-icon", onClick: (e) => startEditing(l.id, l.title, e), title: t('edit'), children: "\u270F\uFE0F" }), _jsx("button", { className: "btn-icon btn-danger-soft", onClick: (e) => deleteLesson(l.id, e), title: t('delete'), children: "\uD83D\uDDD1\uFE0F" })] })] })) }, l.id)))) })] })) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: t('assets') }) }), _jsx(CardContent, { children: !lessonId ? (_jsx("div", { className: "empty-state", children: "Select a lesson first" })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "form-group", children: [_jsx("input", { placeholder: t('assetTitle'), value: assetTitle, onChange: (e) => setAssetTitle(e.target.value), disabled: loading }), _jsxs("select", { value: assetType, onChange: (e) => setAssetType(e.target.value), disabled: loading, title: "Select Asset Type", children: [_jsx("option", { value: "PDF", children: "PDF" }), _jsx("option", { value: "VIDEO", children: "VIDEO" }), _jsx("option", { value: "LINK", children: "LINK" })] }), assetType === 'LINK' ? (_jsx("input", { placeholder: "URL", value: assetLink, onChange: (e) => setAssetLink(e.target.value), disabled: loading })) : (_jsx("input", { type: "file", onChange: (e) => setFile(e.target.files?.[0] || null), disabled: loading, accept: assetType === 'PDF' ? '.pdf' : 'video/*' })), _jsx("button", { onClick: addAsset, disabled: loading || !assetTitle.trim(), className: "btn-primary btn-sm", children: loading ? _jsx(LoadingSpinner, { size: "sm" }) : t('add') })] }), _jsx("div", { className: "items-list", children: assets.length === 0 ? (_jsx("div", { className: "empty-state", children: t('noAssets') })) : (assets.map((a) => (_jsx("div", { className: "asset-item", children: editingId === a.id ? (_jsxs("div", { className: "edit-form", onClick: e => e.stopPropagation(), children: [_jsx("input", { value: editingTitle, onChange: e => setEditingTitle(e.target.value), onKeyDown: e => e.key === 'Enter' && saveEdit('asset'), autoFocus: true, title: "Edit Asset Title" }), _jsx("button", { className: "btn-icon", onClick: () => saveEdit('asset'), children: "\u2705" })] })) : (_jsxs(_Fragment, { children: [_jsx("span", { className: "asset-icon", children: a.type === 'PDF' ? '📄' : a.type === 'VIDEO' ? '🎥' : '🔗' }), _jsxs("div", { className: "asset-info", children: [_jsx("div", { className: "asset-title", children: a.title }), _jsx("div", { className: "asset-type", children: a.type })] }), _jsxs("div", { className: "item-actions", children: [_jsx("button", { className: "btn-icon", onClick: (e) => startEditing(a.id, a.title, e), title: t('edit'), children: "\u270F\uFE0F" }), _jsx("button", { className: "btn-icon btn-danger-soft", onClick: () => deleteAsset(a.id), title: t('delete'), children: "\uD83D\uDDD1\uFE0F" })] })] })) }, a.id)))) })] })) })] })] })), _jsx("style", { children: `
        .content-page {
          max-width: 1400px;
          margin: 0 auto;
        }

        .page-header {
          margin-bottom: var(--spacing-xl);
        }

        .page-header h1 {
          font-size: var(--font-size-4xl);
          margin-bottom: var(--spacing-xs);
        }

        .page-subtitle {
          font-size: var(--font-size-lg);
          color: var(--text-secondary);
        }

        .select-full {
          width: 100%;
          padding: var(--spacing-md);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          font-size: var(--font-size-base);
        }

        .items-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
          margin-top: var(--spacing-md);
        }

        .list-item-clickable {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-md);
          background-color: var(--bg-tertiary);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);
          border: 2px solid transparent;
        }

        .list-item-clickable:hover {
          background-color: var(--bg-secondary);
          transform: translateX(4px);
        }

        .list-item-clickable.active {
          background-color: var(--primary-50);
          border-color: var(--primary-600);
        }

        .asset-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding: var(--spacing-md);
          background-color: var(--bg-tertiary);
          border-radius: var(--radius-md);
        }

        .asset-icon {
          font-size: 2rem;
        }

        .asset-info {
          flex: 1;
        }

        .asset-title {
          font-weight: var(--font-weight-medium);
          color: var(--text-primary);
          margin-bottom: var(--spacing-xs);
        }

        .asset-type {
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
        }

        .empty-state {
          text-align: center;
          padding: var(--spacing-xl);
          color: var(--text-secondary);
          font-style: italic;
        }

        .item-actions {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .item-title {
          flex: 1;
          margin-right: var(--spacing-sm);
        }

        .btn-icon {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1.2rem;
          padding: var(--spacing-xs);
          border-radius: var(--radius-sm);
          transition: all var(--transition-fast);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-danger-soft:hover {
          background-color: var(--error-50);
          filter: brightness(0.9);
        }

        .asset-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding: var(--spacing-md);
          background-color: var(--bg-tertiary);
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
        }

        .asset-item:hover {
          background-color: var(--bg-secondary);
        }

        .demo-badge {
          margin-top: var(--spacing-md);
          padding: var(--spacing-md);
          background-color: var(--primary-50);
          border-right: 4px solid var(--primary-600);
          border-radius: var(--radius-sm);
          color: var(--primary-800);
        }

        [dir="ltr"] .demo-badge {
          border-right: none;
          border-left: 4px solid var(--primary-600);
        }

        .edit-form {
          display: flex;
          width: 100%;
          gap: var(--spacing-sm);
        }

        .edit-form input {
          flex: 1;
          padding: var(--spacing-xs) var(--spacing-sm);
          border: 1px solid var(--primary-300);
          border-radius: var(--radius-sm);
        }
      ` })] }));
}
