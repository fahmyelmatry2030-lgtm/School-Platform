import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { Subjects, Users } from '../lib/firestore';
import { db } from '../firebase';
import LoadingSpinner from '../components/LoadingSpinner';

export default function DashboardTeacher() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ subjects: 0, assignments: 0, students: 0 });

  const isDemo = !db;

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        if (isDemo) {
          setStats({ subjects: 8, assignments: 24, students: 156 });
        } else {
          const [s, u] = await Promise.all([
            Subjects.list(),
            Users.list()
          ]);
          setStats({
            subjects: s.length,
            assignments: 0, // Placeholder
            students: u.filter(user => user.role === 'STUDENT').length
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [isDemo]);

  if (loading) return <div className="loading-container" style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><LoadingSpinner size="lg" /></div>;

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
              <div className="empty-state" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
                {t('noData')}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <style>{`
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
