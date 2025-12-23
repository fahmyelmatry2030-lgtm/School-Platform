import React, { useEffect, useState } from 'react';
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
  const { subjectId, unitId, lessonId } = useParams<{ subjectId?: string; unitId?: string; lessonId?: string }>();
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);

  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedSub, setSelectedSub] = useState<any | null>(null);
  const [gradingScore, setGradingScore] = useState<number | string>('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [showSubmissions, setShowSubmissions] = useState(false);
  const isDemo = !db;

  // forms
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [kind, setKind] = useState<'ASSIGNMENT' | 'QUIZ'>('ASSIGNMENT');

  const [qPrompt, setQPrompt] = useState('');
  const [qType, setQType] = useState<'MCQ' | 'SHORT' | 'TRUE_FALSE'>('MCQ');
  const [qPoints, setQPoints] = useState(1);

  async function loadSubjects() {
    if (isDemo) {
      const demoSubjects = [
        { id: 'math-101', name: 'Mathematics' },
        { id: 'sci-202', name: 'Science' }
      ];
      setSubjects(demoSubjects);
      if (!subjectId) navigate(`/teacher/assessments/${demoSubjects[0].id}`, { replace: true });
      return;
    }
    const s = await Subjects.list();
    setSubjects(s);
    if (!subjectId && s.length) navigate(`/teacher/assessments/${s[0].id}`, { replace: true });
  }

  async function loadUnits() {
    if (!subjectId) return;
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
    if (u.length && !unitId) navigate(`/teacher/assessments/${subjectId}/${u[0].id}`, { replace: true });
  }

  async function loadLessons() {
    if (!subjectId || !unitId) return;
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
    if (l.length && !lessonId) navigate(`/teacher/assessments/${subjectId}/${unitId}/${l[0].id}`, { replace: true });
  }

  async function loadAssignments() {
    if (!lessonId) return;
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

  async function loadQuestions(assignmentId: string) {
    if (!lessonId || !assignmentId) return;
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

  async function loadSubmissions(assignmentId: string) {
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

  async function deleteAssignment(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm(t('confirmDelete'))) return;
    setLoading(true);
    try {
      if (!isDemo) await Assignments.remove(lessonId!, id);
      else setAssignments(assignments.filter(a => a.id !== id));
      if (selectedAssignment === id) {
        setSelectedAssignment(null);
        setQuestions([]);
      }
      await loadAssignments();
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  }

  async function deleteQuestion(id: string) {
    if (!confirm(t('confirmDelete'))) return;
    setLoading(true);
    try {
      if (!isDemo) await Questions.remove(lessonId!, selectedAssignment!, id);
      else setQuestions(questions.filter(q => q.id !== id));
      await loadQuestions(selectedAssignment!);
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  }

  function startEditing(id: string, currentTitle: string, e: React.MouseEvent) {
    e.stopPropagation();
    setEditingId(id);
    setEditingTitle(currentTitle);
  }

  async function saveEditAssignment() {
    if (!editingId || !editingTitle.trim()) return;
    setLoading(true);
    try {
      if (!isDemo) {
        // Assume Assignments.update exists or use generic
        await updateDoc(doc(db, `lessons/${lessonId}/assignments/${editingId}`), { title: editingTitle.trim() });
      } else {
        setAssignments(assignments.map(a => a.id === editingId ? { ...a, title: editingTitle.trim() } : a));
      }
      setEditingId(null);
      await loadAssignments();
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  }

  async function createAssignment() {
    if (!lessonId || !title.trim()) return;
    setLoading(true);
    setError(null);
    try {
      if (!isDemo) {
        await Assignments.create(lessonId, {
          title: title.trim(),
          instructions: instructions.trim() || undefined,
          kind,
        });
      } else {
        const newAsgn = { id: 'demo-' + Date.now(), title: title.trim(), kind };
        setAssignments([...assignments, newAsgn]);
      }
      setTitle('');
      setInstructions('');
      await loadAssignments();
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  }

  async function addQuestion() {
    if (!lessonId || !selectedAssignment || !qPrompt.trim()) return;
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
      } else {
        const newQ = { id: 'demo-q-' + Date.now(), prompt: qPrompt.trim(), type: qType, points: qPoints };
        setQuestions([...questions, newQ]);
      }
      setQPrompt('');
      await loadQuestions(selectedAssignment);
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  }

  async function handleGrade() {
    if (!selectedSub || gradingScore === '') return;
    setLoading(true);
    try {
      if (!isDemo) {
        await Submissions.grade(selectedSub.id, { score: Number(gradingScore) });
      }

      setSubmissions(submissions.map((s: any) =>
        s.id === selectedSub.id ? { ...s, status: 'GRADED', score: Number(gradingScore) } : s
      ));

      setSelectedSub(null);
      setGradingScore('');
      alert(t('updateSuccess'));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const openSubmissions = (asgnId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedAssignment(asgnId);
    setShowSubmissions(true);
    loadSubmissions(asgnId);
  };

  return (
    <div className="assessments-page">
      <div className="page-header">
        <h1>{t('assessments')}</h1>
        <p className="page-subtitle">Create and manage assignments and quizzes</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Navigation */}
      <div className="grid grid-3">
        <Card>
          <CardHeader>
            <CardTitle>📚 Subject</CardTitle>
          </CardHeader>
          <CardContent>
            <select
              value={subjectId || ''}
              onChange={(e) => navigate(`/teacher/assessments/${e.target.value}`)}
              className="select-full"
              title="Select Subject"
            >
              <option value="">-- Select --</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            {isDemo && (
              <div className="demo-badge">
                <strong>Demo Mode:</strong> You can add and delete items locally.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📖 Unit</CardTitle>
          </CardHeader>
          <CardContent>
            <select
              value={unitId || ''}
              onChange={(e) => navigate(`/teacher/assessments/${subjectId}/${e.target.value}`)}
              disabled={!subjectId}
              className="select-full"
              title="Select Unit"
            >
              <option value="">-- Select --</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>{u.title}</option>
              ))}
            </select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📝 Lesson</CardTitle>
          </CardHeader>
          <CardContent>
            <select
              value={lessonId || ''}
              onChange={(e) => navigate(`/teacher/assessments/${subjectId}/${unitId}/${e.target.value}`)}
              disabled={!unitId}
              className="select-full"
              title="Select Lesson"
            >
              <option value="">-- Select --</option>
              {lessons.map((l) => (
                <option key={l.id} value={l.id}>{l.title}</option>
              ))}
            </select>
          </CardContent>
        </Card>
      </div>

      {lessonId && (
        <div className="grid grid-2">
          {/* Create Assignment */}
          <Card>
            <CardHeader>
              <CardTitle>{t('createAssignment')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="form-group">
                <label>{t('title')}</label>
                <input
                  placeholder="Assignment title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={loading}
                />

                <label>{t('type')}</label>
                <select value={kind} onChange={(e) => setKind(e.target.value as any)} disabled={loading}>
                  <option value="ASSIGNMENT">Assignment</option>
                  <option value="QUIZ">Quiz</option>
                </select>

                <label>{t('instructions')} ({t('optional')})</label>
                <textarea
                  placeholder="Instructions for students..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  disabled={loading}
                  rows={3}
                />

                <button onClick={createAssignment} disabled={loading || !title.trim()} className="btn-primary w-full">
                  {loading ? <LoadingSpinner size="sm" /> : t('add')}
                </button>
              </div>

              <div className="items-list">
                <h4 className="list-title">Existing Assignments</h4>
                {assignments.length === 0 ? (
                  <div className="empty-state">{t('noAssignments')}</div>
                ) : (
                  assignments.map((a) => (
                    <div
                      key={a.id}
                      className={`list-item-clickable ${selectedAssignment === a.id ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedAssignment(a.id);
                        loadQuestions(a.id);
                      }}
                    >
                      {editingId === a.id ? (
                        <div className="edit-form" onClick={e => e.stopPropagation()}>
                          <input
                            value={editingTitle}
                            onChange={e => setEditingTitle(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && saveEditAssignment()}
                            autoFocus
                            title="Edit Assignment Title"
                          />
                          <button className="btn-icon" onClick={saveEditAssignment}>✅</button>
                        </div>
                      ) : (
                        <div className="list-item-content">
                          <div className="item-info">
                            <div className="assignment-title">{a.title}</div>
                            <span className={`badge ${a.kind === 'QUIZ' ? 'badge-primary' : 'badge-secondary'}`}>
                              {a.kind}
                            </span>
                          </div>
                          <div className="item-actions">
                            <button className="btn-icon" onClick={(e) => openSubmissions(a.id, e)} title={t('submissions')}>📋</button>
                            <button className="btn-icon" onClick={(e) => startEditing(a.id, a.title, e)} title={t('edit')}>✏️</button>
                            <button
                              className="btn-icon btn-danger-soft"
                              onClick={(e) => deleteAssignment(a.id, e)}
                              title={t('delete')}
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Add Questions */}
          <Card>
            <CardHeader>
              <CardTitle>{t('addQuestion')}</CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedAssignment ? (
                <div className="empty-state">Select an assignment first</div>
              ) : (
                <>
                  <div className="form-group">
                    <label>{t('question')}</label>
                    <textarea
                      placeholder="Question prompt..."
                      value={qPrompt}
                      onChange={(e) => setQPrompt(e.target.value)}
                      disabled={loading}
                      rows={3}
                    />

                    <label>{t('type')}</label>
                    <select value={qType} onChange={(e) => setQType(e.target.value as any)} disabled={loading}>
                      <option value="MCQ">Multiple Choice</option>
                      <option value="SHORT">Short Answer</option>
                      <option value="TRUE_FALSE">True/False</option>
                    </select>

                    <label>{t('points')}</label>
                    <input
                      type="number"
                      min="1"
                      value={qPoints}
                      onChange={(e) => setQPoints(parseInt(e.target.value) || 1)}
                      disabled={loading}
                    />

                    <button onClick={addQuestion} disabled={loading || !qPrompt.trim()} className="btn-primary w-full">
                      {loading ? <LoadingSpinner size="sm" /> : t('add')}
                    </button>
                  </div>

                  <div className="items-list">
                    <h4 className="list-title">Questions</h4>
                    {questions.length === 0 ? (
                      <div className="empty-state">{t('noQuestions')}</div>
                    ) : (
                      questions.map((q, idx) => (
                        <div key={q.id} className="question-item">
                          <div className="question-number">Q{idx + 1}</div>
                          <div className="question-content">
                            <div className="question-prompt">{q.prompt}</div>
                            <div className="question-meta">
                              <span className="badge badge-info">{q.type}</span>
                              <span className="question-points">{q.points} pts</span>
                            </div>
                          </div>
                          <button
                            className="btn-icon btn-danger-soft"
                            onClick={() => deleteQuestion(q.id)}
                            title={t('delete')}
                          >
                            🗑️
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Submissions Modal */}
      <Modal
        isOpen={showSubmissions}
        onClose={() => setShowSubmissions(false)}
        title={t('submissions')}
        size="lg"
      >
        <div className="submissions-container">
          {submissions.length === 0 ? (
            <div className="empty-state">{t('noSubmissions')}</div>
          ) : (
            <div className="subs-list">
              {submissions.map((s) => (
                <div key={s.id} className="sub-item">
                  <div className="sub-info">
                    <div className="sub-student">{s.studentName}</div>
                    <div className="sub-email">{s.studentEmail}</div>
                    <div className="sub-date">{new Date(s.submittedAt?.seconds * 1000 || s.submittedAt).toLocaleString()}</div>
                  </div>
                  <div className="sub-status">
                    <span className={`badge ${s.status === 'GRADED' ? 'badge-success' : 'badge-warning'}`}>
                      {s.status} {s.status === 'GRADED' ? `(${s.score})` : ''}
                    </span>
                  </div>
                  <div className="sub-actions">
                    <button className="btn-outline btn-sm" onClick={() => setSelectedSub(s)}>
                      {t('viewDetails')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Grading Modal */}
      <Modal
        isOpen={!!selectedSub}
        onClose={() => setSelectedSub(null)}
        title={t('grade')}
      >
        <div className="grading-form">
          <div className="student-answer">
            <strong>{t('answer')}:</strong>
            <pre className="answer-box">
              {selectedSub?.answers?.text || JSON.stringify(selectedSub?.answers, null, 2)}
            </pre>
          </div>

          <div className="form-group">
            <label>{t('score')}</label>
            <input
              type="number"
              value={gradingScore}
              onChange={(e) => setGradingScore(e.target.value)}
              placeholder="0-100"
              disabled={loading}
            />
          </div>

          <div className="modal-actions">
            <button className="btn-secondary" onClick={() => setSelectedSub(null)} disabled={loading}>
              {t('cancel')}
            </button>
            <button className="btn-primary" onClick={handleGrade} disabled={loading || gradingScore === ''}>
              {loading ? <LoadingSpinner size="sm" /> : t('save')}
            </button>
          </div>
        </div>
      </Modal>

      <style>{`
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
      `}</style>
    </div>
  );
}
