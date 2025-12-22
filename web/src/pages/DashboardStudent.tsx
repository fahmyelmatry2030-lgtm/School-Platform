import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';

export default function DashboardStudent() {
  const { t } = useTranslation();

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>{t('studentDashboard')}</h1>
        <p className="dashboard-subtitle">{t('welcome')}</p>
      </div>

      <div className="grid grid-3">
        <Card className="stat-card">
          <CardContent>
            <div className="stat-icon">📚</div>
            <div className="stat-value">5</div>
            <div className="stat-label">{t('courses')}</div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent>
            <div className="stat-icon">📝</div>
            <div className="stat-value">12</div>
            <div className="stat-label">{t('assignments')}</div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent>
            <div className="stat-icon">🎯</div>
            <div className="stat-value">85%</div>
            <div className="stat-label">{t('gradesList')}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('courses')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="courses-list">
              <div className="course-item">
                <div className="course-info">
                  <span className="course-icon">📐</span>
                  <div>
                    <div className="course-name">{t('subjects') || 'Mathematics'}</div>
                    <div className="course-teacher">Dr. Smith</div>
                  </div>
                </div>
                <span className="badge badge-success">{t('enrolled')}</span>
              </div>

              <div className="course-item">
                <div className="course-info">
                  <span className="course-icon">🔬</span>
                  <div>
                    <div className="course-name">Science</div>
                    <div className="course-teacher">Prof. Johnson</div>
                  </div>
                </div>
                <span className="badge badge-success">{t('enrolled')}</span>
              </div>

              <div className="course-item">
                <div className="course-info">
                  <span className="course-icon">📖</span>
                  <div>
                    <div className="course-name">English</div>
                    <div className="course-teacher">Ms. Brown</div>
                  </div>
                </div>
                <span className="badge badge-success">{t('enrolled')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('assignments')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="assignments-list">
              <div className="assignment-item">
                <div>
                  <div className="assignment-title">Math Homework #5</div>
                  <div className="assignment-meta">
                    <span className="badge badge-warning">Due Tomorrow</span>
                  </div>
                </div>
              </div>

              <div className="assignment-item">
                <div>
                  <div className="assignment-title">Science Lab Report</div>
                  <div className="assignment-meta">
                    <span className="badge badge-primary">Due in 3 days</span>
                  </div>
                </div>
              </div>

              <div className="assignment-item">
                <div>
                  <div className="assignment-title">English Essay</div>
                  <div className="assignment-meta">
                    <span className="badge badge-success">Submitted</span>
                  </div>
                </div>
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
          transition: all var(--transition-fast);
        }

        .course-item:hover,
        .assignment-item:hover {
          background-color: var(--bg-secondary);
          transform: translateX(4px);
        }

        .course-info {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
        }

        .course-icon {
          font-size: 2rem;
        }

        .course-name {
          font-weight: var(--font-weight-semibold);
          color: var(--text-primary);
          margin-bottom: var(--spacing-xs);
        }

        .course-teacher {
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
        }

        .assignment-title {
          font-weight: var(--font-weight-medium);
          color: var(--text-primary);
          margin-bottom: var(--spacing-xs);
        }

        .assignment-meta {
          display: flex;
          gap: var(--spacing-sm);
        }
      `}</style>
    </div>
  );
}
