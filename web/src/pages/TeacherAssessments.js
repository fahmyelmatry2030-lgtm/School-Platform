import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Subjects } from '../lib/firestore';
import { Units, Lessons } from '../lib/content';
import { Assignments, Questions, Submissions } from '../lib/assessments';
import { Modal } from '../components/Modal';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import { db } from '../firebase';
import { updateDoc, doc } from 'firebase/firestore';
export default function TeacherAssessments() {
    const { t } = useTranslation();
    const { subjectId, unitId, lessonId } = useParams();
    const navigate = useNavigate();
    const [subjects, setSubjects] = useState([]);
    const [units, setUnits] = useState([]);
    const [lessons, setLessons] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [selectedSub, setSelectedSub] = useState(null);
    const [gradingScore, setGradingScore] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editingTitle, setEditingTitle] = useState('');
    const [showSubmissions, setShowSubmissions] = useState(false);
    const isDemo = !db;
    // forms
    const [title, setTitle] = useState('');
    const [instructions, setInstructions] = useState('');
    const [kind, setKind] = useState('ASSIGNMENT');
    const [qPrompt, setQPrompt] = useState('');
    const [qType, setQType] = useState('MCQ');
    const [qPoints, setQPoints] = useState(1);
    async function loadSubjects() {
        if (isDemo) {
            const demoSubjects = [
                { id: 'math-101', name: 'Mathematics' },
                { id: 'sci-202', name: 'Science' }
            ];
            setSubjects(demoSubjects);
            if (!subjectId)
                navigate(`/teacher/assessments/${demoSubjects[0].id}`, { replace: true });
            return;
        }
        const s = await Subjects.list();
        setSubjects(s);
        if (!subjectId && s.length)
            navigate(`/teacher/assessments/${s[0].id}`, { replace: true });
    }
    async function loadUnits() {
        if (!subjectId)
            return;
        if (isDemo) {
            if (units.length === 0) {
                setUnits([
                    { id: 'u1', title: 'Unit 1: Basic Algebra' },
                    { id: 'u2', title: 'Unit 2: Geometry' }
                ]);
            }
            return;
        }
        const u = await Units.list(subjectId);
        setUnits(u);
        if (u.length && !unitId)
            navigate(`/teacher/assessments/${subjectId}/${u[0].id}`, { replace: true });
    }
    async function loadLessons() {
        if (!subjectId || !unitId)
            return;
        if (isDemo) {
            if (lessons.length === 0) {
                setLessons([
                    { id: 'l1', title: 'Lesson 1.1: Variables' },
                    { id: 'l2', title: 'Lesson 1.2: Equations' }
                ]);
            }
            return;
        }
        const l = await Lessons.list(subjectId, unitId);
        setLessons(l);
        if (l.length && !lessonId)
            navigate(`/teacher/assessments/${subjectId}/${unitId}/${l[0].id}`, { replace: true });
    }
    async function loadAssignments() {
        if (!lessonId)
            return;
        if (isDemo) {
            if (assignments.length === 0) {
                setAssignments([
                    { id: 'a1', title: 'Homework 1', kind: 'ASSIGNMENT' },
                    { id: 'a2', title: 'Quiz 1', kind: 'QUIZ' }
                ]);
            }
            return;
        }
        const a = await Assignments.list(lessonId);
        setAssignments(a);
    }
    async function loadQuestions(assignmentId) {
        if (!lessonId || !assignmentId)
            return;
        if (isDemo) {
            if (questions.length === 0) {
                setQuestions([
                    { id: 'q1', prompt: 'What is x in x + 5 = 10?', type: 'SHORT', points: 5 },
                    { id: 'q2', prompt: 'Is sky blue?', type: 'TRUE_FALSE', points: 2 }
                ]);
            }
            return;
        }
        const q = await Questions.list(lessonId, assignmentId);
        setQuestions(q);
    }
    async function loadSubmissions(assignmentId) {
        if (isDemo) {
            setSubmissions([
                { id: 's1', studentName: 'Ahmed Ali', studentEmail: 'ahmed@school.local', submittedAt: new Date().toISOString(), status: 'SUBMITTED', answers: { text: 'The answer is 5.' } },
                { id: 's2', studentName: 'Sara Khan', studentEmail: 'sara@school.local', submittedAt: new Date().toISOString(), status: 'GRADED', score: 90 }
            ]);
            return;
        }
        const s = await Submissions.listByAssignment(assignmentId);
        setSubmissions(s);
    }
    useEffect(() => { loadSubjects(); }, []);
    useEffect(() => { loadUnits(); }, [subjectId]);
    useEffect(() => { loadLessons(); }, [unitId]);
    useEffect(() => { loadAssignments(); }, [lessonId]);
    async function deleteAssignment(id, e) {
        e.stopPropagation();
        if (!confirm(t('confirmDelete')))
            return;
        setLoading(true);
        try {
            if (!isDemo)
                await Assignments.remove(lessonId, id);
            else
                setAssignments(assignments.filter(a => a.id !== id));
            if (selectedAssignment === id) {
                setSelectedAssignment(null);
                setQuestions([]);
            }
            await loadAssignments();
        }
        catch (e) {
            setError(e.message);
        }
        finally {
            setLoading(false);
        }
    }
    async function deleteQuestion(id) {
        if (!confirm(t('confirmDelete')))
            return;
        setLoading(true);
        try {
            if (!isDemo)
                await Questions.remove(lessonId, selectedAssignment, id);
            else
                setQuestions(questions.filter(q => q.id !== id));
            await loadQuestions(selectedAssignment);
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
    async function saveEditAssignment() {
        if (!editingId || !editingTitle.trim())
            return;
        setLoading(true);
        try {
            if (!isDemo) {
                // Assume Assignments.update exists or use generic
                await updateDoc(doc(db, `lessons/${lessonId}/assignments/${editingId}`), { title: editingTitle.trim() });
            }
            else {
                setAssignments(assignments.map(a => a.id === editingId ? { ...a, title: editingTitle.trim() } : a));
            }
            setEditingId(null);
            await loadAssignments();
        }
        catch (e) {
            setError(e.message);
        }
        finally {
            setLoading(false);
        }
    }
    async function createAssignment() {
        if (!lessonId || !title.trim())
            return;
        setLoading(true);
        setError(null);
        try {
            if (!isDemo) {
                await Assignments.create(lessonId, {
                    title: title.trim(),
                    instructions: instructions.trim() || undefined,
                    kind,
                });
            }
            else {
                const newAsgn = { id: 'demo-' + Date.now(), title: title.trim(), kind };
                setAssignments([...assignments, newAsgn]);
            }
            setTitle('');
            setInstructions('');
            await loadAssignments();
        }
        catch (e) {
            setError(e.message);
        }
        finally {
            setLoading(false);
        }
    }
    async function addQuestion() {
        if (!lessonId || !selectedAssignment || !qPrompt.trim())
            return;
        setLoading(true);
        setError(null);
        try {
            if (!isDemo) {
                await Questions.add(lessonId, selectedAssignment, {
                    prompt: qPrompt.trim(),
                    type: qType,
                    points: qPoints,
                    options: qType === 'MCQ' ? ['Option A', 'Option B', 'Option C', 'Option D'] : undefined,
                    answerKey: qType === 'TRUE_FALSE' ? 'true' : '',
                });
            }
            else {
                const newQ = { id: 'demo-q-' + Date.now(), prompt: qPrompt.trim(), type: qType, points: qPoints };
                setQuestions([...questions, newQ]);
            }
            setQPrompt('');
            await loadQuestions(selectedAssignment);
        }
        catch (e) {
            setError(e.message);
        }
        finally {
            setLoading(false);
        }
    }
    async function handleGrade() {
        if (!selectedSub || gradingScore === '')
            return;
        setLoading(true);
        try {
            if (!isDemo) {
                await Submissions.grade(selectedSub.id, { score: Number(gradingScore) });
            }
            setSubmissions(submissions.map((s) => s.id === selectedSub.id ? { ...s, status: 'GRADED', score: Number(gradingScore) } : s));
            setSelectedSub(null);
            setGradingScore('');
            alert(t('updateSuccess'));
        }
        catch (e) {
            setError(e.message);
        }
        finally {
            setLoading(false);
        }
    }
    const openSubmissions = (asgnId, e) => {
        e.stopPropagation();
        setSelectedAssignment(asgnId);
        setShowSubmissions(true);
        loadSubmissions(asgnId);
    };
    return (_jsxs("div", { className: "assessments-page", children: [_jsxs("div", { className: "page-header", children: [_jsx("h1", { children: t('assessments') }), _jsx("p", { className: "page-subtitle", children: "Create and manage assignments and quizzes" })] }), error && _jsx("div", { className: "alert alert-error", children: error }), _jsxs("div", { className: "grid grid-3", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "\uD83D\uDCDA Subject" }) }), _jsxs(CardContent, { children: [_jsxs("select", { value: subjectId || '', onChange: (e) => navigate(`/teacher/assessments/${e.target.value}`), className: "select-full", title: "Select Subject", children: [_jsx("option", { value: "", children: "-- Select --" }), subjects.map((s) => (_jsx("option", { value: s.id, children: s.name }, s.id)))] }), isDemo && (_jsxs("div", { className: "demo-badge", children: [_jsx("strong", { children: "Demo Mode:" }), " You can add and delete items locally."] }))] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "\uD83D\uDCD6 Unit" }) }), _jsx(CardContent, { children: _jsxs("select", { value: unitId || '', onChange: (e) => navigate(`/teacher/assessments/${subjectId}/${e.target.value}`), disabled: !subjectId, className: "select-full", title: "Select Unit", children: [_jsx("option", { value: "", children: "-- Select --" }), units.map((u) => (_jsx("option", { value: u.id, children: u.title }, u.id)))] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "\uD83D\uDCDD Lesson" }) }), _jsx(CardContent, { children: _jsxs("select", { value: lessonId || '', onChange: (e) => navigate(`/teacher/assessments/${subjectId}/${unitId}/${e.target.value}`), disabled: !unitId, className: "select-full", title: "Select Lesson", children: [_jsx("option", { value: "", children: "-- Select --" }), lessons.map((l) => (_jsx("option", { value: l.id, children: l.title }, l.id)))] }) })] })] }), lessonId && (_jsxs("div", { className: "grid grid-2", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: t('createAssignment') }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: t('title') }), _jsx("input", { placeholder: "Assignment title", value: title, onChange: (e) => setTitle(e.target.value), disabled: loading }), _jsx("label", { children: t('type') }), _jsxs("select", { value: kind, onChange: (e) => setKind(e.target.value), disabled: loading, children: [_jsx("option", { value: "ASSIGNMENT", children: "Assignment" }), _jsx("option", { value: "QUIZ", children: "Quiz" })] }), _jsxs("label", { children: [t('instructions'), " (", t('optional'), ")"] }), _jsx("textarea", { placeholder: "Instructions for students...", value: instructions, onChange: (e) => setInstructions(e.target.value), disabled: loading, rows: 3 }), _jsx("button", { onClick: createAssignment, disabled: loading || !title.trim(), className: "btn-primary w-full", children: loading ? _jsx(LoadingSpinner, { size: "sm" }) : t('add') })] }), _jsxs("div", { className: "items-list", children: [_jsx("h4", { className: "list-title", children: "Existing Assignments" }), assignments.length === 0 ? (_jsx("div", { className: "empty-state", children: t('noAssignments') })) : (assignments.map((a) => (_jsx("div", { className: `list-item-clickable ${selectedAssignment === a.id ? 'active' : ''}`, onClick: () => {
                                                    setSelectedAssignment(a.id);
                                                    loadQuestions(a.id);
                                                }, children: editingId === a.id ? (_jsxs("div", { className: "edit-form", onClick: e => e.stopPropagation(), children: [_jsx("input", { value: editingTitle, onChange: e => setEditingTitle(e.target.value), onKeyDown: e => e.key === 'Enter' && saveEditAssignment(), autoFocus: true, title: "Edit Assignment Title" }), _jsx("button", { className: "btn-icon", onClick: saveEditAssignment, children: "\u2705" })] })) : (_jsxs("div", { className: "list-item-content", children: [_jsxs("div", { className: "item-info", children: [_jsx("div", { className: "assignment-title", children: a.title }), _jsx("span", { className: `badge ${a.kind === 'QUIZ' ? 'badge-primary' : 'badge-secondary'}`, children: a.kind })] }), _jsxs("div", { className: "item-actions", children: [_jsx("button", { className: "btn-icon", onClick: (e) => openSubmissions(a.id, e), title: t('submissions'), children: "\uD83D\uDCCB" }), _jsx("button", { className: "btn-icon", onClick: (e) => startEditing(a.id, a.title, e), title: t('edit'), children: "\u270F\uFE0F" }), _jsx("button", { className: "btn-icon btn-danger-soft", onClick: (e) => deleteAssignment(a.id, e), title: t('delete'), children: "\uD83D\uDDD1\uFE0F" })] })] })) }, a.id))))] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: t('addQuestion') }) }), _jsx(CardContent, { children: !selectedAssignment ? (_jsx("div", { className: "empty-state", children: "Select an assignment first" })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: t('question') }), _jsx("textarea", { placeholder: "Question prompt...", value: qPrompt, onChange: (e) => setQPrompt(e.target.value), disabled: loading, rows: 3 }), _jsx("label", { children: t('type') }), _jsxs("select", { value: qType, onChange: (e) => setQType(e.target.value), disabled: loading, children: [_jsx("option", { value: "MCQ", children: "Multiple Choice" }), _jsx("option", { value: "SHORT", children: "Short Answer" }), _jsx("option", { value: "TRUE_FALSE", children: "True/False" })] }), _jsx("label", { children: t('points') }), _jsx("input", { type: "number", min: "1", value: qPoints, onChange: (e) => setQPoints(parseInt(e.target.value) || 1), disabled: loading }), _jsx("button", { onClick: addQuestion, disabled: loading || !qPrompt.trim(), className: "btn-primary w-full", children: loading ? _jsx(LoadingSpinner, { size: "sm" }) : t('add') })] }), _jsxs("div", { className: "items-list", children: [_jsx("h4", { className: "list-title", children: "Questions" }), questions.length === 0 ? (_jsx("div", { className: "empty-state", children: t('noQuestions') })) : (questions.map((q, idx) => (_jsxs("div", { className: "question-item", children: [_jsxs("div", { className: "question-number", children: ["Q", idx + 1] }), _jsxs("div", { className: "question-content", children: [_jsx("div", { className: "question-prompt", children: q.prompt }), _jsxs("div", { className: "question-meta", children: [_jsx("span", { className: "badge badge-info", children: q.type }), _jsxs("span", { className: "question-points", children: [q.points, " pts"] })] })] }), _jsx("button", { className: "btn-icon btn-danger-soft", onClick: () => deleteQuestion(q.id), title: t('delete'), children: "\uD83D\uDDD1\uFE0F" })] }, q.id))))] })] })) })] })] })), _jsx(Modal, { isOpen: showSubmissions, onClose: () => setShowSubmissions(false), title: t('submissions'), size: "lg", children: _jsx("div", { className: "submissions-container", children: submissions.length === 0 ? (_jsx("div", { className: "empty-state", children: t('noSubmissions') })) : (_jsx("div", { className: "subs-list", children: submissions.map((s) => (_jsxs("div", { className: "sub-item", children: [_jsxs("div", { className: "sub-info", children: [_jsx("div", { className: "sub-student", children: s.studentName }), _jsx("div", { className: "sub-email", children: s.studentEmail }), _jsx("div", { className: "sub-date", children: new Date(s.submittedAt?.seconds * 1000 || s.submittedAt).toLocaleString() })] }), _jsx("div", { className: "sub-status", children: _jsxs("span", { className: `badge ${s.status === 'GRADED' ? 'badge-success' : 'badge-warning'}`, children: [s.status, " ", s.status === 'GRADED' ? `(${s.score})` : ''] }) }), _jsx("div", { className: "sub-actions", children: _jsx("button", { className: "btn-outline btn-sm", onClick: () => setSelectedSub(s), children: t('viewDetails') }) })] }, s.id))) })) }) }), _jsx(Modal, { isOpen: !!selectedSub, onClose: () => setSelectedSub(null), title: t('grade'), children: _jsxs("div", { className: "grading-form", children: [_jsxs("div", { className: "student-answer", children: [_jsxs("strong", { children: [t('answer'), ":"] }), _jsx("pre", { className: "answer-box", children: selectedSub?.answers?.text || JSON.stringify(selectedSub?.answers, null, 2) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: t('score') }), _jsx("input", { type: "number", value: gradingScore, onChange: (e) => setGradingScore(e.target.value), placeholder: "0-100", disabled: loading })] }), _jsxs("div", { className: "modal-actions", children: [_jsx("button", { className: "btn-secondary", onClick: () => setSelectedSub(null), disabled: loading, children: t('cancel') }), _jsx("button", { className: "btn-primary", onClick: handleGrade, disabled: loading || gradingScore === '', children: loading ? _jsx(LoadingSpinner, { size: "sm" }) : t('save') })] })] }) }), _jsx("style", { children: `
        .assessments-page {
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
        }

        .form-group label {
          display: block;
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
          color: var(--text-secondary);
          margin-bottom: var(--spacing-xs);
          margin-top: var(--spacing-md);
        }

        .form-group label:first-child {
          margin-top: 0;
        }

        textarea {
          width: 100%;
          padding: var(--spacing-md);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          font-family: inherit;
          resize: vertical;
        }

        .items-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }

        .list-item-clickable {
          padding: var(--spacing-md);
          background-color: var(--bg-tertiary);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);
          border: 2px solid transparent;
        }

        .list-item-clickable:hover {
          background-color: var(--bg-secondary);
        }

        .list-item-clickable.active {
          background-color: var(--primary-50);
          border-color: var(--primary-600);
        }

        .assignment-title {
          font-weight: var(--font-weight-medium);
          margin-bottom: var(--spacing-xs);
        }

        .question-item {
          display: flex;
          gap: var(--spacing-md);
          padding: var(--spacing-md);
          background-color: var(--bg-tertiary);
          border-radius: var(--radius-md);
        }

        .question-number {
          flex-shrink: 0;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--primary-600);
          color: white;
          border-radius: 50%;
          font-weight: var(--font-weight-bold);
        }

        .question-content {
          flex: 1;
        }

        .question-prompt {
          font-weight: var(--font-weight-medium);
          margin-bottom: var(--spacing-sm);
        }

        .question-meta {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .question-points {
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
        }

        .empty-state {
          text-align: center;
          padding: var(--spacing-xl);
          color: var(--text-secondary);
          font-style: italic;
        }

        .list-title {
          margin-top: var(--spacing-lg);
          margin-bottom: var(--spacing-md);
          font-weight: var(--font-weight-bold);
          color: var(--text-primary);
        }

        .demo-badge {
          margin-top: var(--spacing-md);
          padding: var(--spacing-md);
          background-color: var(--primary-50);
          border-left: 4px solid var(--primary-600);
          border-radius: var(--radius-sm);
          color: var(--primary-800);
          font-size: var(--font-size-sm);
        }

        [dir="rtl"] .demo-badge {
          border-left: none;
          border-right: 4px solid var(--primary-600);
          text-align: right;
        }

        .list-item-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }

        .item-info {
          flex: 1;
        }

        .item-actions {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
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

        .btn-icon:hover {
          background-color: var(--bg-secondary);
        }

        .btn-danger-soft:hover {
          background-color: var(--error-50);
          filter: brightness(0.9);
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

        .submissions-container {
          max-height: 60vh;
          overflow-y: auto;
        }

        .sub-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-md);
          background: var(--bg-tertiary);
          border-radius: var(--radius-md);
          margin-bottom: var(--spacing-sm);
        }

        .sub-student {
          font-weight: var(--font-weight-bold);
        }

        .sub-email {
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
        }

        .sub-date {
          font-size: var(--font-size-xs);
          color: var(--text-secondary);
        }

        .grading-form {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .answer-box {
          padding: var(--spacing-md);
          background: var(--bg-secondary);
          border-radius: var(--radius-sm);
          white-space: pre-wrap;
          font-family: inherit;
          margin-top: var(--spacing-xs);
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: var(--spacing-md);
          margin-top: var(--spacing-lg);
        }
      ` })] }));
}
