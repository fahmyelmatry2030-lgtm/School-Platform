import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
export default function DashboardTeacher() {
    const { t } = useTranslation();
    return (_jsxs("div", { className: "dashboard-container", children: [_jsxs("div", { className: "dashboard-header", children: [_jsx("h1", { children: t('teacherDashboard') }), _jsx("p", { className: "dashboard-subtitle", children: t('welcome') })] }), _jsxs("div", { className: "grid grid-3", children: [_jsx(Card, { className: "stat-card", children: _jsxs(CardContent, { children: [_jsx("div", { className: "stat-icon", children: "\uD83D\uDCDA" }), _jsx("div", { className: "stat-value", children: "8" }), _jsx("div", { className: "stat-label", children: t('subjects') })] }) }), _jsx(Card, { className: "stat-card", children: _jsxs(CardContent, { children: [_jsx("div", { className: "stat-icon", children: "\uD83D\uDCDD" }), _jsx("div", { className: "stat-value", children: "24" }), _jsx("div", { className: "stat-label", children: t('assignments') })] }) }), _jsx(Card, { className: "stat-card", children: _jsxs(CardContent, { children: [_jsx("div", { className: "stat-icon", children: "\uD83D\uDC65" }), _jsx("div", { className: "stat-value", children: "156" }), _jsx("div", { className: "stat-label", children: "Students" })] }) })] }), _jsxs("div", { className: "grid grid-2", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Quick Actions" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "quick-actions", children: [_jsxs("a", { href: "/teacher/content", className: "action-button", children: [_jsx("span", { className: "action-icon", children: "\uD83D\uDCDA" }), _jsxs("div", { children: [_jsx("div", { className: "action-title", children: t('content') }), _jsx("div", { className: "action-desc", children: "Manage units, lessons & assets" })] })] }), _jsxs("a", { href: "/teacher/assessments", className: "action-button", children: [_jsx("span", { className: "action-icon", children: "\uD83D\uDCDD" }), _jsxs("div", { children: [_jsx("div", { className: "action-title", children: t('assessments') }), _jsx("div", { className: "action-desc", children: "Create assignments & quizzes" })] })] }), _jsxs("div", { className: "action-button", style: { opacity: 0.6, cursor: 'not-allowed' }, children: [_jsx("span", { className: "action-icon", children: "\uD83D\uDCCA" }), _jsxs("div", { children: [_jsx("div", { className: "action-title", children: "Reports" }), _jsx("div", { className: "action-desc", children: "View student performance" })] })] })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Recent Activity" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "activity-list", children: [_jsxs("div", { className: "activity-item", children: [_jsx("div", { className: "activity-icon", children: "\u2705" }), _jsxs("div", { className: "activity-content", children: [_jsx("div", { className: "activity-title", children: "New submission from Ahmed" }), _jsx("div", { className: "activity-time", children: "5 minutes ago" })] })] }), _jsxs("div", { className: "activity-item", children: [_jsx("div", { className: "activity-icon", children: "\uD83D\uDCDD" }), _jsxs("div", { className: "activity-content", children: [_jsx("div", { className: "activity-title", children: "Created Math Quiz #3" }), _jsx("div", { className: "activity-time", children: "2 hours ago" })] })] }), _jsxs("div", { className: "activity-item", children: [_jsx("div", { className: "activity-icon", children: "\uD83D\uDC65" }), _jsxs("div", { className: "activity-content", children: [_jsx("div", { className: "activity-title", children: "12 students completed assignment" }), _jsx("div", { className: "activity-time", children: "Yesterday" })] })] })] }) })] })] }), _jsx("style", { children: `
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
      ` })] }));
}
