import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import LoadingSpinner from '../components/LoadingSpinner';

export default function DashboardStudent() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ courses: 0, assignments: 0, grades: '0%' });
  const [courses, setCourses] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
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
            { id: '1', title: 'Math Homework #5', status: 'Due Tomorrow', badge: 'badge-warning' },
            { id: '2', title: 'Science Lab Report', status: 'Due in 3 days', badge: 'badge-primary' },
            { id: '3', title: 'English Essay', status: 'Submitted', badge: 'badge-success' }
          ]);
        } else {
          // Real Firebase Logic (Simplified for now)
          // In a real app, you'd fetch based on studentId
          setStats({ courses: 0, assignments: 0, grades: 'N/A' });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isDemo]);

  if (loading) return <div className="loading-container"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>{t('studentDashboard')}</h1>
        <p className="dashboard-subtitle">{t('welcome')}</p>
        {isDemo && (
          <div className="demo-badge">
            <strong>{t('demoMode') || 'Demo Mode'}:</strong> {t('demoModeDesc') || 'Viewing sample student data.'}
          </div>
        )}
      </div>

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
            <CardTitle>{t('myCourses') || 'My Courses'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="courses-list">
              {courses.length === 0 ? (
                <div className="empty-state">No courses enrolled</div>
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
            <CardTitle>{t('recentAssignments') || 'Recent Assignments'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="assignments-list">
              {assignments.length === 0 ? (
                <div className="empty-state">No pending assignments</div>
              ) : (
                assignments.map((asgn: any) => (
                  <div key={asgn.id} className="assignment-item">
                    <div>
                      <div className="assignment-title">{asgn.title}</div>
                      <div className="assignment-meta">
                        <span className={`badge ${asgn.badge}`}>{asgn.status}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

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

        .course-item:hover,
        .assignment-item:hover {
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
      `}</style>
    </div>
  );
}
