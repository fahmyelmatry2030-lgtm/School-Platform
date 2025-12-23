import React, { useEffect, useState } from 'react';
import { Grades, Subjects, Classes, Users } from '../lib/firestore';
import { seedBasics } from '../lib/seed';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';
import { db } from '../firebase';

type Grade = { id: string; name: string };
type Subject = { id: string; name: string; code?: string };
type ClassItem = { id: string; name: string; gradeId: string; homeroomTeacherId?: string | null };
type UserAccount = { id: string; email: string; role: 'ADMIN' | 'TEACHER' | 'STUDENT'; firstName: string; lastName: string; active: boolean };

export default function DashboardAdmin() {
  const { t } = useTranslation();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editUser, setEditUser] = useState<UserAccount | null>(null);
  const isDemo = !db;
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; type: string; id: string; name: string }>({
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
      if (!classGradeId && g.length) setClassGradeId(g[0].id);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load');
    } finally {
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
    } catch (e: any) {
      setError(e.message ?? 'Seed failed');
    } finally {
      setLoading(false);
    }
  }

  async function addGrade() {
    if (!gradeName.trim()) return;
    setLoading(true);
    try {
      await Grades.create(gradeName.trim());
      setGradeName('');
      await refreshAll();
    } finally { setLoading(false); }
  }

  async function addSubject() {
    if (!subjectName.trim()) return;
    setLoading(true);
    try {
      await Subjects.create(subjectName.trim(), subjectCode.trim() || undefined);
      setSubjectName('');
      setSubjectCode('');
      await refreshAll();
    } finally { setLoading(false); }
  }

  async function addClass() {
    if (!className.trim() || !classGradeId) return;
    setLoading(true);
    try {
      await Classes.create(className.trim(), classGradeId);
      setClassName('');
      await refreshAll();
    } finally { setLoading(false); }
  }

  async function handleDelete() {
    const { type, id } = deleteModal;
    setLoading(true);
    try {
      if (!isDemo) {
        if (type === 'grade') await Grades.remove(id);
        else if (type === 'subject') await Subjects.remove(id);
        else if (type === 'class') await Classes.remove(id);
        else if (type === 'user') await Users.remove(id);
      } else {
        if (type === 'grade') setGrades(grades.filter(g => g.id !== id));
        else if (type === 'subject') setSubjects(subjects.filter(s => s.id !== id));
        else if (type === 'class') setClasses(classes.filter(c => c.id !== id));
        else if (type === 'user') setUsers(users.filter(u => u.id !== id));
      }
      await refreshAll();
      setDeleteModal({ open: false, type: '', id: '', name: '' });
    } finally { setLoading(false); }
  }

  async function handleUpdateUser() {
    if (!editUser) return;
    setLoading(true);
    try {
      if (!isDemo) {
        await Users.update(editUser.id, {
          role: editUser.role,
          active: editUser.active,
          firstName: editUser.firstName,
          lastName: editUser.lastName
        });
      } else {
        setUsers(users.map(u => u.id === editUser.id ? editUser : u));
      }
      setEditUser(null);
      await refreshAll();
    } finally { setLoading(false); }
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>{t('adminDashboard')}</h1>
        <div className="header-actions">
          <button onClick={refreshAll} disabled={loading} className="btn-secondary">
            {t('refresh')}
          </button>
          <button onClick={handleSeed} disabled={loading} className="btn-primary">
            {t('seedData')}
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Statistics Cards */}
      <div className="grid grid-3">
        <Card className="stat-card">
          <CardContent>
            <div className="stat-icon">📊</div>
            <div className="stat-value">{grades.length}</div>
            <div className="stat-label">{t('grades')}</div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent>
            <div className="stat-icon">📚</div>
            <div className="stat-value">{subjects.length}</div>
            <div className="stat-label">{t('subjects')}</div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent>
            <div className="stat-icon">🏫</div>
            <div className="stat-value">{classes.length}</div>
            <div className="stat-label">{t('classes')}</div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent>
            <div className="stat-icon">👥</div>
            <div className="stat-value">{users.length}</div>
            <div className="stat-label">{t('users')}</div>
          </CardContent>
        </Card>
      </div>

      {/* Management Sections */}
      <div className="grid">
        {/* Grades */}
        <Card>
          <CardHeader>
            <CardTitle>{t('grades')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="form-group">
              <div className="input-with-button">
                <input
                  placeholder={t('gradeName')}
                  value={gradeName}
                  onChange={(e) => setGradeName(e.target.value)}
                  disabled={loading}
                />
                <button onClick={addGrade} disabled={loading || !gradeName.trim()} className="btn-primary">
                  {t('add')}
                </button>
              </div>
            </div>

            <div className="items-list">
              {grades.length === 0 ? (
                <div className="empty-state">{t('noGrades')}</div>
              ) : (
                grades.map((g) => (
                  <div key={g.id} className="list-item">
                    <span className="item-name">{g.name}</span>
                    <button
                      onClick={() => setDeleteModal({ open: true, type: 'grade', id: g.id, name: g.name })}
                      disabled={loading}
                      className="btn-danger btn-sm"
                    >
                      {t('delete')}
                    </button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Subjects */}
        <Card>
          <CardHeader>
            <CardTitle>{t('subjects')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="form-group">
              <div className="input-with-button">
                <input
                  placeholder={t('subjectName')}
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  disabled={loading}
                />
                <input
                  placeholder={`${t('code')} (${t('optional')})`}
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                  disabled={loading}
                  className="input-code"
                />
                <button onClick={addSubject} disabled={loading || !subjectName.trim()} className="btn-primary">
                  {t('add')}
                </button>
              </div>
            </div>

            <div className="items-list">
              {subjects.length === 0 ? (
                <div className="empty-state">{t('noSubjects')}</div>
              ) : (
                subjects.map((s) => (
                  <div key={s.id} className="list-item">
                    <span className="item-name">
                      {s.name} {s.code && <code>({s.code})</code>}
                    </span>
                    <button
                      onClick={() => setDeleteModal({ open: true, type: 'subject', id: s.id, name: s.name })}
                      disabled={loading}
                      className="btn-danger btn-sm"
                    >
                      {t('delete')}
                    </button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Classes */}
        <Card>
          <CardHeader>
            <CardTitle>{t('classes')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="form-group">
              <div className="input-with-button-centered">
                <input
                  placeholder={t('className')}
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  disabled={loading}
                  title={t('className')}
                />
                <select value={classGradeId} onChange={(e) => setClassGradeId(e.target.value)} disabled={loading} title={t('grades')}>
                  {grades.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
                <button onClick={addClass} disabled={loading || !className.trim() || !classGradeId} className="btn-primary">
                  {t('add')}
                </button>
              </div>
            </div>

            <div className="items-list">
              {classes.length === 0 ? (
                <div className="empty-state">{t('noClasses')}</div>
              ) : (
                classes.map((c) => (
                  <div key={c.id} className="list-item">
                    <span className="item-name">
                      {c.name} <span className="item-meta">— {grades.find((g) => g.id === c.gradeId)?.name || c.gradeId}</span>
                    </span>
                    <button
                      onClick={() => setDeleteModal({ open: true, type: 'class', id: c.id, name: c.name })}
                      disabled={loading}
                      className="btn-danger btn-sm"
                    >
                      {t('delete')}
                    </button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Users */}
        <Card>
          <CardHeader>
            <CardTitle>{t('users')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="items-list">
              {users.length === 0 ? (
                <div className="empty-state">{t('noUsers')}</div>
              ) : (
                users.map((u) => (
                  <div key={u.id} className="list-item">
                    <div className="item-info">
                      <span className="item-name">{u.firstName} {u.lastName}</span>
                      <div className="item-meta">
                        <code>{u.email}</code>
                        <span className={`badge badge-${u.role.toLowerCase()}`}>{u.role}</span>
                        <span className={`badge ${u.active ? 'badge-success' : 'badge-error'}`}>
                          {u.active ? t('active') : t('inactive')}
                        </span>
                      </div>
                    </div>
                    <div className="item-actions">
                      <button onClick={() => setEditUser(u)} className="btn-secondary btn-sm">{t('edit')}</button>
                      <button
                        onClick={() => setDeleteModal({ open: true, type: 'user', id: u.id, name: u.email })}
                        disabled={loading}
                        className="btn-danger btn-sm"
                      >
                        {t('delete')}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, type: '', id: '', name: '' })}
        title={t('confirmDelete')}
      >
        <p>Are you sure you want to delete <strong>{deleteModal.name}</strong>?</p>
        <div className="modal-actions">
          <button onClick={handleDelete} disabled={loading} className="btn-danger w-full">
            {loading ? <LoadingSpinner size="sm" /> : t('delete')}
          </button>
          <button
            onClick={() => setDeleteModal({ open: false, type: '', id: '', name: '' })}
            disabled={loading}
            className="btn-secondary w-full"
          >
            {t('cancel')}
          </button>
        </div>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={!!editUser}
        onClose={() => setEditUser(null)}
        title={t('edit')}
      >
        {editUser && (
          <div className="user-edit-form">
            <div className="form-group">
              <label>{t('firstName')}</label>
              <input
                value={editUser.firstName}
                onChange={(e) => setEditUser({ ...editUser, firstName: e.target.value })}
                disabled={loading}
                title={t('firstName')}
              />
            </div>
            <div className="form-group">
              <label>{t('lastName')}</label>
              <input
                value={editUser.lastName}
                onChange={(e) => setEditUser({ ...editUser, lastName: e.target.value })}
                disabled={loading}
                title={t('lastName')}
              />
            </div>
            <div className="form-group">
              <label>{t('role')}</label>
              <select
                value={editUser.role}
                onChange={(e) => setEditUser({ ...editUser, role: e.target.value as any })}
                disabled={loading}
                title={t('role')}
              >
                <option value="ADMIN">ADMIN</option>
                <option value="TEACHER">TEACHER</option>
                <option value="STUDENT">STUDENT</option>
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <div className="status-radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    checked={editUser.active}
                    onChange={() => setEditUser({ ...editUser, active: true })}
                    disabled={loading}
                    title={t('active')}
                  />
                  {t('active')}
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    checked={!editUser.active}
                    onChange={() => setEditUser({ ...editUser, active: false })}
                    disabled={loading}
                    title={t('inactive')}
                  />
                  {t('inactive')}
                </label>
              </div>
            </div>

            <div className="modal-actions">
              <button onClick={handleUpdateUser} disabled={loading} className="btn-primary w-full">
                {loading ? <LoadingSpinner size="sm" /> : t('save')}
              </button>
              <button onClick={() => setEditUser(null)} disabled={loading} className="btn-secondary w-full">
                {t('cancel')}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <style>{`
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
      `}</style>
    </div >
  );
}
