import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import { RedeemCodeModal } from '../components/RedeemCodeModal';
import { Submissions, Assignments } from '../lib/assessments';
import { Subjects } from '../lib/firestore';
import { auth, db } from '../firebase';
import { Modal } from '../components/Modal';

export default function DashboardStudent() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ courses: 0, assignments: 0, grades: '0%' });
  const [courses, setCourses] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null); // Added user state
  const [showRedeem, setShowRedeem] = useState(false); // Added showRedeem state

  // Submission State
  const [selectedAsgn, setSelectedAsgn] = useState<any | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isDemo = !db;

  const fetchData = useCallback(async () => { // Wrapped fetchData in useCallback
    setLoading(true);
    try {
      if (auth.currentUser) { // Set user from auth.currentUser
        setUser(auth.currentUser);
      }

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
      } else {
        const s = await Subjects.list();
        setCourses(s.map(item => ({ ...item, icon: '📚', teacher: '—' })));

        let mySubmissions: any[] = [];
        if (auth.currentUser) {
          mySubmissions = await Submissions.listMy(auth.currentUser.uid);
        }

        setStats({
          courses: s.length,
          assignments: mySubmissions.length,
          grades: mySubmissions.length > 0 ? `${Math.round(mySubmissions.length * 10)}%` : '0%'
        });

        // In a real app, assignments are lesson-dependent. 
        // For now, we show the submissions as "Recent Activity"
        setAssignments(mySubmissions.map(sub => ({
          id: sub.id,
          title: sub.id, // Placeholder for assignment name if stored in sub
          status: 'Submitted',
          badge: 'badge-success',
          instructions: t('noData')
        })));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [isDemo, t]); // Dependencies for useCallback

  useEffect(() => {
    fetchData();
  }, [fetchData]); // Call fetchData when it changes (which is only on mount due to empty deps in useCallback)

  const handleOpenSubmit = (asgn: any) => {
    if (asgn.status === 'Submitted') return;
    setSelectedAsgn(asgn);
    setSubmissionText('');
  };

  const handleSubmit = async () => {
    if (!selectedAsgn || !submissionText.trim()) return;
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
      setAssignments(assignments.map((a: any) =>
        a.id === selectedAsgn.id ? { ...a, status: 'Submitted', badge: 'badge-success' } : a
      ));

      setSelectedAsgn(null);
      alert(t('submitSuccess'));
    } catch (e: any) {
      alert(t('error') + ': ' + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-container"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>{t('studentDashboard')}</h1>
          <p className="dashboard-subtitle">{t('welcome')}, {user?.firstName || user?.displayName || user?.email || 'Student'}!</p>
        </div>
        <button className="btn-primary" onClick={() => setShowRedeem(true)}>
          {t('redeemCode')}
        </button>
      </div>
      {isDemo && (
        <div className="demo-badge">
          <strong>{t('demoMode')}:</strong> {t('demoModeDesc')}
        </div>
      )}

      <div className="grid grid-3">
        <Card className="stat-card">
          <CardContent>
            <div className="stat-icon">📚</div>
            <div className="stat-value">{stats.courses}</div>
            <div className="stat-label">{t('courses')}</div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent>
            <div className="stat-icon">📝</div>
            <div className="stat-value">{stats.assignments}</div>
            <div className="stat-label">{t('assignments')}</div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent>
            <div className="stat-icon">🎯</div>
            <div className="stat-value">{stats.grades}</div>
            <div className="stat-label">{t('gradesList')}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('myCourses')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="courses-list">
              {courses.length === 0 ? (
                <div className="empty-state">{t('noCoursesEnrolled')}</div>
              ) : (
                courses.map((course: any) => (
                  <div key={course.id} className="course-item">
                    <div className="course-info">
                      <span className="course-icon">{course.icon}</span>
                      <div>
                        <div className="course-name">{course.name}</div>
                        <div className="course-teacher">{course.teacher}</div>
                      </div>
                    </div>
                    <span className="badge badge-success">{t('enrolled')}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('recentAssignments')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="assignments-list">
              {assignments.length === 0 ? (
                <div className="empty-state">{t('noPendingAssignments')}</div>
              ) : (
                assignments.map((asgn: any) => (
                  <div key={asgn.id} className={`assignment-item ${asgn.status === 'Submitted' ? 'submitted' : 'clickable'}`} onClick={() => handleOpenSubmit(asgn)}>
                    <div>
                      <div className="assignment-title">{asgn.title}</div>
                      <div className="assignment-meta">
                        <span className={`badge ${asgn.badge}`}>{asgn.status}</span>
                      </div>
                    </div>
                    {asgn.status !== 'Submitted' && <button className="btn-primary btn-sm">{t('submit')}</button>}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={!!selectedAsgn}
        onClose={() => setSelectedAsgn(null)}
        title={selectedAsgn?.title || ''}
      >
        <div className="submission-modal">
          <div className="instructions">
            <strong>{t('instructions')}:</strong>
            <p>{selectedAsgn?.instructions || t('noData')}</p>
          </div>

          <div className="form-group">
            <label>{t('answer')}</label>
            <textarea
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              placeholder="..."
              rows={5}
              disabled={submitting}
            />
          </div>

          <div className="modal-actions">
            <button className="btn-secondary" onClick={() => setSelectedAsgn(null)} disabled={submitting}>
              {t('cancel')}
            </button>
            <button className="btn-primary" onClick={handleSubmit} disabled={submitting || !submissionText.trim()}>
              {submitting ? <LoadingSpinner size="sm" /> : t('submitAssignment')}
            </button>
          </div>
        </div>
      </Modal>

      <style>{`
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
      `}</style>
    </div>
  );
}
