import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { Subjects, Users } from '../lib/firestore';
import { Submissions } from '../lib/assessments';
import { db } from '../firebase';
import LoadingSpinner from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';

export default function DashboardTeacher() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ subjects: 0, assignments: 0, students: 0 });
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedSub, setSelectedSub] = useState<any | null>(null);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [grading, setGrading] = useState(false);

  const isDemo = !db;

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        if (isDemo) {
          setStats({ subjects: 8, assignments: 24, students: 156 });
          setSubmissions([
            { id: '1', studentName: 'Ahmed', studentId: 'u3', submittedAt: { seconds: Date.now() / 1000 - 300 } },
            { id: '2', studentName: 'Sara', studentId: 'u4', submittedAt: { seconds: Date.now() / 1000 - 7200 } }
          ]);
        } else {
          const [s, u, subs] = await Promise.all([
            Subjects.list(),
            Users.list(),
            Submissions.listAll()
          ]);
          setStats({
            subjects: s.length,
            assignments: 0, // Placeholder
            students: u.filter((user: any) => user.role === 'STUDENT').length
          });
          setSubmissions(subs);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [isDemo]);

  const handleOpenGrade = (sub: any) => {
    setSelectedSub(sub);
    setGrade(sub.score || '');
    setFeedback(sub.feedback || '');
  };

  const handleGrade = async () => {
    if (!selectedSub || !grade) return;
    setGrading(true);
    try {
      if (!isDemo) {
        await Submissions.grade(selectedSub.id, {
          score: Number(grade),
          rubric: { feedback }
        });
      }
      setSubmissions(submissions.map(s => s.id === selectedSub.id ? { ...s, score: grade, feedback } : s));
      setSelectedSub(null);
      alert(t('success'));
    } catch (e: any) {
      alert(t('error') + ': ' + e.message);
    } finally {
      setGrading(false);
    }
  };

  if (loading) return <div className="loading-container" style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><LoadingSpinner size="lg" /></div>;

  const formatDate = (ts: any) => {
    if (!ts) return '—';
    const date = new Date(ts.seconds * 1000);
    return date.toLocaleString();
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>{t('teacherDashboard')}</h1>
        <p className="dashboard-subtitle">{t('welcome')}</p>
      </div>

      <div className="grid grid-3">
        <Card className="stat-card">
          <CardContent>
            <div className="stat-icon">📚</div>
            <div className="stat-value">{stats.subjects}</div>
            <div className="stat-label">{t('subjects')}</div>
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
            <div className="stat-icon">👥</div>
            <div className="stat-value">{stats.students}</div>
            <div className="stat-label">{t('student')}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('quickActions')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="quick-actions">
              <a href="/teacher/content" className="action-button">
                <span className="action-icon">📚</span>
                <div>
                  <div className="action-title">{t('content')}</div>
                  <div className="action-desc">{t('manageContentDesc')}</div>
                </div>
              </a>

              <a href="/teacher/assessments" className="action-button">
                <span className="action-icon">📝</span>
                <div>
                  <div className="action-title">{t('assessments')}</div>
                  <div className="action-desc">{t('createAssessmentsDesc')}</div>
                </div>
              </a>

              <div className="action-button" style={{ opacity: 0.6, cursor: 'not-allowed' }}>
                <span className="action-icon">📊</span>
                <div>
                  <div className="action-title">{t('reports')}</div>
                  <div className="action-desc">{t('viewPerformance')}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('recentActivity')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="activity-list">
              {submissions.length === 0 ? (
                <div className="empty-state" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
                  {t('noData')}
                </div>
              ) : (
                submissions.map((sub: any) => (
                  <div key={sub.id} className="activity-item clickable" onClick={() => handleOpenGrade(sub)}>
                    <div className="activity-icon">✅</div>
                    <div className="activity-content">
                      <div className="activity-title">
                        {t('newSubmissionFrom', { name: sub.studentName })}
                      </div>
                      <div className="activity-time">{formatDate(sub.submittedAt)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={!!selectedSub}
        onClose={() => setSelectedSub(null)}
        title={t('gradeSubmission')}
      >
        <div className="grading-form">
          <div className="form-group">
            <label>{t('student')}: {selectedSub?.studentName}</label>
          </div>
          <div className="form-group">
            <label>{t('pointsObtained')}</label>
            <input
              type="number"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder="0-100"
            />
          </div>
          <div className="form-group">
            <label>{t('feedback')}</label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
            />
          </div>
          <div className="modal-actions">
            <button className="btn-secondary" onClick={() => setSelectedSub(null)}>{t('cancel')}</button>
            <button className="btn-primary" onClick={handleGrade} disabled={grading || !grade}>
              {grading ? <LoadingSpinner size="sm" /> : t('save')}
            </button>
          </div>
        </div>
      </Modal>

      <style>{`
        .grading-form {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }
        .activity-item.clickable {
          cursor: pointer;
        }
        .activity-item.clickable:hover {
          background-color: var(--primary-50);
        }
        .dashboard-container {
          max-width: 1400px;
          margin: 0 auto;
        }

        .dashboard-header {
          margin-bottom: var(--spacing-xl);
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

        .quick-actions {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .action-button {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding: var(--spacing-md);
          background-color: var(--bg-tertiary);
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
          text-decoration: none;
          color: inherit;
        }

        .action-button:hover {
          background-color: var(--primary-50);
          transform: translateX(4px);
        }

        .action-icon {
          font-size: 2rem;
        }

        .action-title {
          font-weight: var(--font-weight-semibold);
          color: var(--text-primary);
          margin-bottom: var(--spacing-xs);
        }

        .action-desc {
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
        }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .activity-item {
          display: flex;
          gap: var(--spacing-md);
          padding: var(--spacing-md);
          background-color: var(--bg-tertiary);
          border-radius: var(--radius-md);
        }

        .activity-icon {
          font-size: 1.5rem;
        }

        .activity-content {
          flex: 1;
        }

        .activity-title {
          font-weight: var(--font-weight-medium);
          color: var(--text-primary);
          margin-bottom: var(--spacing-xs);
        }

        .activity-time {
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
}
