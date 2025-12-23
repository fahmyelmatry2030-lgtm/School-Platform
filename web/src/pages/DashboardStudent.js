import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import { Submissions } from '../lib/assessments';
import { Subjects } from '../lib/firestore';
import { auth, db } from '../firebase';
import { Modal } from '../components/Modal';
export default function DashboardStudent() {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ courses: 0, assignments: 0, grades: '0%' });
    const [courses, setCourses] = useState([]);
    const [assignments, setAssignments] = useState([]);
    // Submission State
    const [selectedAsgn, setSelectedAsgn] = useState(null);
    const [submissionText, setSubmissionText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const isDemo = !db;
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (isDemo) {
                    // Mock Data
                    setStats({ courses: 3, assignments: 5, grades: '88%' });
                    setCourses([
                        { id: '1', name: 'Mathematics', teacher: 'Dr. Smith', icon: '📐' },
                        { id: '2', name: 'Science', teacher: 'Prof. Johnson', icon: '🔬' },
                        { id: '3', name: 'English', teacher: 'Ms. Brown', icon: '📖' }
                    ]);
                    setAssignments([
                        { id: '1', title: 'Math Homework #5', status: 'Due Tomorrow', badge: 'badge-warning', instructions: 'Complete exercises 1-10 on page 45.' },
                        { id: '2', title: 'Science Lab Report', status: 'Due in 3 days', badge: 'badge-primary', instructions: 'Write a summary of the photosynthesis experiment.' },
                        { id: '3', title: 'English Essay', status: 'Submitted', badge: 'badge-success', instructions: 'Write 500 words about your favorite book.' }
                    ]);
                }
                else {
                    const s = await Subjects.list();
                    setCourses(s.map(item => ({ ...item, icon: '📚', teacher: 'TBD' })));
                    // For simplicity, we fetch assignments from all subjects (would be filtered by class in real app)
                    let allAsgns = [];
                    for (const subject of s) {
                        // This is a placeholder since Assignments.list currently needs lessonId
                        // In a full implementation, we'd query assignments by subject/class
                    }
                    setStats({
                        courses: s.length,
                        assignments: allAsgns.length,
                        grades: 'N/A'
                    });
                    setAssignments(allAsgns);
                }
            }
            catch (e) {
                console.error(e);
            }
            finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [isDemo]);
    const handleOpenSubmit = (asgn) => {
        if (asgn.status === 'Submitted')
            return;
        setSelectedAsgn(asgn);
        setSubmissionText('');
    };
    const handleSubmit = async () => {
        if (!selectedAsgn || !submissionText.trim())
            return;
        setSubmitting(true);
        try {
            if (!isDemo && auth.currentUser) {
                await Submissions.submit(selectedAsgn.id, {
                    studentId: auth.currentUser.uid,
                    studentName: auth.currentUser.displayName || auth.currentUser.email || 'Student',
                    answers: { text: submissionText },
                });
            }
            // Update local state
            setAssignments(assignments.map((a) => a.id === selectedAsgn.id ? { ...a, status: 'Submitted', badge: 'badge-success' } : a));
            setSelectedAsgn(null);
            alert(t('submitSuccess'));
        }
        catch (e) {
            alert(t('error') + ': ' + e.message);
        }
        finally {
            setSubmitting(false);
        }
    };
    if (loading)
        return _jsx("div", { className: "loading-container", children: _jsx(LoadingSpinner, { size: "lg" }) });
    return (_jsxs("div", { className: "dashboard-container", children: [_jsxs("div", { className: "dashboard-header", children: [_jsx("h1", { children: t('studentDashboard') }), _jsx("p", { className: "dashboard-subtitle", children: t('welcome') }), isDemo && (_jsxs("div", { className: "demo-badge", children: [_jsxs("strong", { children: [t('demoMode') || 'Demo Mode', ":"] }), " ", t('demoModeDesc') || 'Viewing sample student data.'] }))] }), _jsxs("div", { className: "grid grid-3", children: [_jsx(Card, { className: "stat-card", children: _jsxs(CardContent, { children: [_jsx("div", { className: "stat-icon", children: "\uD83D\uDCDA" }), _jsx("div", { className: "stat-value", children: stats.courses }), _jsx("div", { className: "stat-label", children: t('courses') })] }) }), _jsx(Card, { className: "stat-card", children: _jsxs(CardContent, { children: [_jsx("div", { className: "stat-icon", children: "\uD83D\uDCDD" }), _jsx("div", { className: "stat-value", children: stats.assignments }), _jsx("div", { className: "stat-label", children: t('assignments') })] }) }), _jsx(Card, { className: "stat-card", children: _jsxs(CardContent, { children: [_jsx("div", { className: "stat-icon", children: "\uD83C\uDFAF" }), _jsx("div", { className: "stat-value", children: stats.grades }), _jsx("div", { className: "stat-label", children: t('gradesList') })] }) })] }), _jsxs("div", { className: "grid grid-2", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: t('myCourses') || 'My Courses' }) }), _jsx(CardContent, { children: _jsx("div", { className: "courses-list", children: courses.length === 0 ? (_jsx("div", { className: "empty-state", children: "No courses enrolled" })) : (courses.map((course) => (_jsxs("div", { className: "course-item", children: [_jsxs("div", { className: "course-info", children: [_jsx("span", { className: "course-icon", children: course.icon }), _jsxs("div", { children: [_jsx("div", { className: "course-name", children: course.name }), _jsx("div", { className: "course-teacher", children: course.teacher })] })] }), _jsx("span", { className: "badge badge-success", children: t('enrolled') })] }, course.id)))) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: t('recentAssignments') || 'Recent Assignments' }) }), _jsx(CardContent, { children: _jsx("div", { className: "assignments-list", children: assignments.length === 0 ? (_jsx("div", { className: "empty-state", children: "No pending assignments" })) : (assignments.map((asgn) => (_jsxs("div", { className: `assignment-item ${asgn.status === 'Submitted' ? 'submitted' : 'clickable'}`, onClick: () => handleOpenSubmit(asgn), children: [_jsxs("div", { children: [_jsx("div", { className: "assignment-title", children: asgn.title }), _jsx("div", { className: "assignment-meta", children: _jsx("span", { className: `badge ${asgn.badge}`, children: asgn.status }) })] }), asgn.status !== 'Submitted' && _jsx("button", { className: "btn-primary btn-sm", children: t('submit') })] }, asgn.id)))) }) })] })] }), _jsx(Modal, { isOpen: !!selectedAsgn, onClose: () => setSelectedAsgn(null), title: selectedAsgn?.title || '', children: _jsxs("div", { className: "submission-modal", children: [_jsxs("div", { className: "instructions", children: [_jsxs("strong", { children: [t('instructions'), ":"] }), _jsx("p", { children: selectedAsgn?.instructions || t('noData') })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: t('answer') }), _jsx("textarea", { value: submissionText, onChange: (e) => setSubmissionText(e.target.value), placeholder: "...", rows: 5, disabled: submitting })] }), _jsxs("div", { className: "modal-actions", children: [_jsx("button", { className: "btn-secondary", onClick: () => setSelectedAsgn(null), disabled: submitting, children: t('cancel') }), _jsx("button", { className: "btn-primary", onClick: handleSubmit, disabled: submitting || !submissionText.trim(), children: submitting ? _jsx(LoadingSpinner, { size: "sm" }) : t('submitAssignment') })] })] }) }), _jsx("style", { children: `
        .dashboard-container {
          max-width: 1400px;
          margin: 0 auto;
        }

        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
        }

        .dashboard-header {
          margin-bottom: var(--spacing-xl);
          position: relative;
        }

        .demo-badge {
          display: inline-block;
          margin-top: var(--spacing-sm);
          padding: var(--spacing-sm) var(--spacing-md);
          background-color: var(--primary-50);
          border-left: 4px solid var(--primary-600);
          border-radius: var(--radius-sm);
          color: var(--primary-800);
          font-size: var(--font-size-sm);
        }

        [dir="rtl"] .demo-badge {
          border-left: none;
          border-right: 4px solid var(--primary-600);
        }

        .dashboard-header h1 {
          font-size: var(--font-size-4xl);
          margin-bottom: var(--spacing-xs);
        }

        .dashboard-subtitle {
          font-size: var(--font-size-lg);
          color: var(--text-secondary);
        }

        .stat-card .card-content {
          text-align: center;
          padding: var(--spacing-xl);
        }

        .stat-icon {
          font-size: 3.5rem;
          margin-bottom: var(--spacing-md);
          filter: drop-shadow(0 4px 6px var(--shadow-color));
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
          letter-spacing: 0.1em;
          font-weight: var(--font-weight-semibold);
        }

        .courses-list,
        .assignments-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .course-item,
        .assignment-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--spacing-md);
          background-color: var(--bg-tertiary);
          border-radius: var(--radius-md);
          transition: all var(--transition-base);
          border: 1px solid transparent;
        }

        .assignment-item.clickable {
          cursor: pointer;
        }

        .assignment-item.submitted {
          cursor: default;
        }

        .course-item:hover,
        .assignment-item.clickable:hover {
          background-color: var(--bg-secondary);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
          border-color: var(--primary-200);
        }

        .course-info {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
        }

        .course-icon {
          font-size: 2rem;
          background: var(--bg-primary);
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-sm);
        }

        .course-name {
          font-weight: var(--font-weight-semibold);
          color: var(--text-primary);
          margin-bottom: var(--spacing-xs);
          font-size: var(--font-size-lg);
        }

        .course-teacher {
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
        }

        .assignment-title {
          font-weight: var(--font-weight-medium);
          color: var(--text-primary);
          margin-bottom: var(--spacing-xs);
          font-size: var(--font-size-base);
        }

        .assignment-meta {
          display: flex;
          gap: var(--spacing-sm);
        }

        .empty-state {
          text-align: center;
          padding: var(--spacing-xl);
          color: var(--text-secondary);
          font-style: italic;
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
          border: 2px dashed var(--border-color);
        }

        .submission-modal {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
        }

        .instructions {
          padding: var(--spacing-md);
          background: var(--bg-tertiary);
          border-radius: var(--radius-md);
          border-right: 4px solid var(--primary-500);
        }

        [dir="ltr"] .instructions {
          border-right: none;
          border-left: 4px solid var(--primary-500);
        }

        .submission-modal textarea {
          width: 100%;
          padding: var(--spacing-md);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          font-family: inherit;
          resize: vertical;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: var(--spacing-md);
          margin-top: var(--spacing-md);
        }
      ` })] }));
}
