import React, { useEffect, useState } from 'react';
import { Subjects } from '../lib/firestore';
import { Units, Lessons, Assets } from '../lib/content';
import { uploadContent } from '../lib/storage';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import { db } from '../firebase';

export default function TeacherContent() {
  const { t } = useTranslation();
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const [subjectId, setSubjectId] = useState('');
  const [units, setUnits] = useState<any[]>([]);
  const [unitId, setUnitId] = useState('');
  const [lessons, setLessons] = useState<any[]>([]);
  const [lessonId, setLessonId] = useState('');
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // forms
  const [unitTitle, setUnitTitle] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [assetTitle, setAssetTitle] = useState('');
  const [assetType, setAssetType] = useState<'PDF' | 'VIDEO' | 'LINK'>('PDF');
  const [assetLink, setAssetLink] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const isDemo = !db;

  async function loadSubjects() {
    if (isDemo) {
      const demoSubjects = [
        { id: 'math-101', name: 'Mathematics' },
        { id: 'sci-202', name: 'Science' },
        { id: 'hist-303', name: 'History' }
      ];
      setSubjects(demoSubjects);
      if (!subjectId) setSubjectId(demoSubjects[0].id);
      return;
    }
    const s = await Subjects.list();
    setSubjects(s);
    if (!subjectId && s.length) setSubjectId(s[0].id);
  }

  async function loadUnits() {
    if (!subjectId) return;
    if (isDemo) {
      if (units.length === 0) {
        setUnits([
          { id: 'u1', title: 'Unit 1: Introduction' },
          { id: 'u2', title: 'Unit 2: Advanced Topics' }
        ]);
      }
      return;
    }
    const u = await Units.list(subjectId);
    setUnits(u);
    if (!unitId && u.length) setUnitId(u[0].id);
  }

  async function loadLessons() {
    if (!subjectId || !unitId) return;
    if (isDemo) {
      if (lessons.length === 0) {
        setLessons([
          { id: 'l1', title: 'Lesson 1.1: Basics' },
          { id: 'l2', title: 'Lesson 1.2: Intermediate' }
        ]);
      }
      return;
    }
    const l = await Lessons.list(subjectId, unitId);
    setLessons(l);
    if (!lessonId && l.length) setLessonId(l[0].id);
  }

  async function loadAssets() {
    if (!subjectId || !unitId || !lessonId) return;
    if (isDemo) {
      if (assets.length === 0) {
        setAssets([
          { id: 'a1', title: 'Syllabus PDF', type: 'PDF', url: '#' },
          { id: 'a2', title: 'Intro Video', type: 'VIDEO', url: '#' }
        ]);
      }
      return;
    }
    const a = await Assets.list(subjectId, unitId, lessonId);
    setAssets(a);
  }

  useEffect(() => { loadSubjects(); }, []);
  useEffect(() => { loadUnits(); }, [subjectId]);
  useEffect(() => { loadLessons(); }, [unitId]);
  useEffect(() => { loadAssets(); }, [lessonId]);

  async function deleteUnit(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm(t('confirmDelete'))) return;
    setLoading(true);
    try {
      if (!isDemo) await Units.remove(subjectId, id);
      else setUnits(units.filter(u => u.id !== id));
      if (unitId === id) setUnitId('');
      await loadUnits();
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  }

  async function deleteLesson(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm(t('confirmDelete'))) return;
    setLoading(true);
    try {
      if (!isDemo) await Lessons.remove(subjectId, unitId, id);
      else setLessons(lessons.filter(l => l.id !== id));
      if (lessonId === id) setLessonId('');
      await loadLessons();
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  }

  async function deleteAsset(id: string) {
    if (!confirm(t('confirmDelete'))) return;
    setLoading(true);
    try {
      if (!isDemo) await Assets.remove(subjectId, unitId, lessonId, id);
      else setAssets(assets.filter(a => a.id !== id));
      await loadAssets();
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  }

  function startEditing(id: string, currentTitle: string, e: React.MouseEvent) {
    e.stopPropagation();
    setEditingId(id);
    setEditingTitle(currentTitle);
  }

  async function saveEdit(type: 'unit' | 'lesson' | 'asset') {
    if (!editingId || !editingTitle.trim()) return;
    setLoading(true);
    try {
      if (!isDemo) {
        if (type === 'unit') await Units.update(subjectId, editingId, { title: editingTitle.trim() });
        else if (type === 'lesson') await Lessons.update(subjectId, unitId, editingId, { title: editingTitle.trim() });
        else if (type === 'asset') await Assets.update(subjectId, unitId, lessonId, editingId, { title: editingTitle.trim() });
      } else {
        if (type === 'unit') setUnits(units.map(u => u.id === editingId ? { ...u, title: editingTitle.trim() } : u));
        else if (type === 'lesson') setLessons(lessons.map(l => l.id === editingId ? { ...l, title: editingTitle.trim() } : l));
        else if (type === 'asset') setAssets(assets.map(a => a.id === editingId ? { ...a, title: editingTitle.trim() } : a));
      }
      setEditingId(null);
      if (type === 'unit') await loadUnits();
      else if (type === 'lesson') await loadLessons();
      else await loadAssets();
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  }

  async function addUnit() {
    if (!subjectId || !unitTitle.trim()) return;
    setLoading(true);
    setError(null);
    try {
      if (!isDemo) {
        await Units.create(subjectId, unitTitle.trim());
      } else {
        const newUnit = { id: 'demo-' + Date.now(), title: unitTitle.trim() };
        setUnits([...units, newUnit]);
      }
      setUnitTitle('');
      await loadUnits();
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  }

  async function addLesson() {
    if (!subjectId || !unitId || !lessonTitle.trim()) return;
    setLoading(true);
    setError(null);
    try {
      if (!isDemo) {
        await Lessons.create(subjectId, unitId, lessonTitle.trim());
      } else {
        const newLesson = { id: 'demo-' + Date.now(), title: lessonTitle.trim() };
        setLessons([...lessons, newLesson]);
      }
      setLessonTitle('');
      await loadLessons();
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  }

  async function addAsset() {
    if (!subjectId || !unitId || !lessonId || !assetTitle.trim()) return;
    setLoading(true);
    setError(null);
    try {
      let urlOrKey = assetLink.trim();
      if (!isDemo) {
        if (assetType !== 'LINK' && file) {
          const res = await uploadContent(lessonId, file);
          urlOrKey = res.url;
        }
        await Assets.create(subjectId, unitId, lessonId, {
          title: assetTitle.trim(),
          type: assetType,
          urlOrKey: urlOrKey,
        });
      } else {
        const newAsset = { id: 'demo-' + Date.now(), title: assetTitle.trim(), type: assetType, url: urlOrKey };
        setAssets([...assets, newAsset]);
      }
      setAssetTitle('');
      setAssetLink('');
      setFile(null);
      await loadAssets();
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  }

  return (
    <div className="content-page">
      <div className="page-header">
        <h1>{t('content')}</h1>
        <p className="page-subtitle">Manage units, lessons, and learning materials</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Subject Selection */}
      <Card>
        <CardHeader>
          <CardTitle>📚 Select Subject</CardTitle>
        </CardHeader>
        <CardContent>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            disabled={loading}
            className="select-full"
            title="Select Subject"
          >
            <option value="">-- Select Subject --</option>
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

      {subjectId && (
        <div className="grid grid-3">
          {/* Units Section */}
          <Card>
            <CardHeader>
              <CardTitle>{t('units')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="form-group">
                <input
                  placeholder={t('unitTitle')}
                  value={unitTitle}
                  onChange={(e) => setUnitTitle(e.target.value)}
                  disabled={loading}
                />
                <button onClick={addUnit} disabled={loading || !unitTitle.trim()} className="btn-primary btn-sm">
                  {loading ? <LoadingSpinner size="sm" /> : t('add')}
                </button>
              </div>

              <div className="items-list">
                {units.length === 0 ? (
                  <div className="empty-state">{t('noUnits')}</div>
                ) : (
                  units.map((u) => (
                    <div
                      key={u.id}
                      className={`list-item-clickable ${unitId === u.id ? 'active' : ''}`}
                      onClick={() => setUnitId(u.id)}
                    >
                      {editingId === u.id ? (
                        <div className="edit-form" onClick={e => e.stopPropagation()}>
                          <input
                            value={editingTitle}
                            onChange={e => setEditingTitle(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && saveEdit('unit')}
                            autoFocus
                            title="Edit Unit Title"
                          />
                          <button className="btn-icon" onClick={() => saveEdit('unit')}>✅</button>
                        </div>
                      ) : (
                        <>
                          <span className="item-title">{u.title}</span>
                          <div className="item-actions">
                            {unitId === u.id && <span className="badge badge-primary">Selected</span>}
                            <button className="btn-icon" onClick={(e) => startEditing(u.id, u.title, e)} title={t('edit')}>✏️</button>
                            <button
                              className="btn-icon btn-danger-soft"
                              onClick={(e) => deleteUnit(u.id, e)}
                              title={t('delete')}
                            >
                              🗑️
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Lessons Section */}
          <Card>
            <CardHeader>
              <CardTitle>{t('lessons')}</CardTitle>
            </CardHeader>
            <CardContent>
              {!unitId ? (
                <div className="empty-state">Select a unit first</div>
              ) : (
                <>
                  <div className="form-group">
                    <input
                      placeholder={t('lessonTitle')}
                      value={lessonTitle}
                      onChange={(e) => setLessonTitle(e.target.value)}
                      disabled={loading}
                    />
                    <button onClick={addLesson} disabled={loading || !lessonTitle.trim()} className="btn-primary btn-sm">
                      {loading ? <LoadingSpinner size="sm" /> : t('add')}
                    </button>
                  </div>

                  <div className="items-list">
                    {lessons.length === 0 ? (
                      <div className="empty-state">{t('noLessons')}</div>
                    ) : (
                      lessons.map((l) => (
                        <div
                          key={l.id}
                          className={`list-item-clickable ${lessonId === l.id ? 'active' : ''}`}
                          onClick={() => setLessonId(l.id)}
                        >
                          {editingId === l.id ? (
                            <div className="edit-form" onClick={e => e.stopPropagation()}>
                              <input
                                value={editingTitle}
                                onChange={e => setEditingTitle(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && saveEdit('lesson')}
                                autoFocus
                                title="Edit Lesson Title"
                              />
                              <button className="btn-icon" onClick={() => saveEdit('lesson')}>✅</button>
                            </div>
                          ) : (
                            <>
                              <span className="item-title">{l.title}</span>
                              <div className="item-actions">
                                {lessonId === l.id && <span className="badge badge-primary">Selected</span>}
                                <button className="btn-icon" onClick={(e) => startEditing(l.id, l.title, e)} title={t('edit')}>✏️</button>
                                <button
                                  className="btn-icon btn-danger-soft"
                                  onClick={(e) => deleteLesson(l.id, e)}
                                  title={t('delete')}
                                >
                                  🗑️
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Assets Section */}
          <Card>
            <CardHeader>
              <CardTitle>{t('assets')}</CardTitle>
            </CardHeader>
            <CardContent>
              {!lessonId ? (
                <div className="empty-state">Select a lesson first</div>
              ) : (
                <>
                  <div className="form-group">
                    <input
                      placeholder={t('assetTitle')}
                      value={assetTitle}
                      onChange={(e) => setAssetTitle(e.target.value)}
                      disabled={loading}
                    />
                    <select
                      value={assetType}
                      onChange={(e) => setAssetType(e.target.value as any)}
                      disabled={loading}
                      title="Select Asset Type"
                    >
                      <option value="PDF">PDF</option>
                      <option value="VIDEO">VIDEO</option>
                      <option value="LINK">LINK</option>
                    </select>

                    {assetType === 'LINK' ? (
                      <input
                        placeholder="URL"
                        value={assetLink}
                        onChange={(e) => setAssetLink(e.target.value)}
                        disabled={loading}
                      />
                    ) : (
                      <input
                        type="file"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        disabled={loading}
                        accept={assetType === 'PDF' ? '.pdf' : 'video/*'}
                      />
                    )}

                    <button onClick={addAsset} disabled={loading || !assetTitle.trim()} className="btn-primary btn-sm">
                      {loading ? <LoadingSpinner size="sm" /> : t('add')}
                    </button>
                  </div>

                  <div className="items-list">
                    {assets.length === 0 ? (
                      <div className="empty-state">{t('noAssets')}</div>
                    ) : (
                      assets.map((a) => (
                        <div key={a.id} className="asset-item">
                          {editingId === a.id ? (
                            <div className="edit-form" onClick={e => e.stopPropagation()}>
                              <input
                                value={editingTitle}
                                onChange={e => setEditingTitle(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && saveEdit('asset')}
                                autoFocus
                                title="Edit Asset Title"
                              />
                              <button className="btn-icon" onClick={() => saveEdit('asset')}>✅</button>
                            </div>
                          ) : (
                            <>
                              <span className="asset-icon">{a.type === 'PDF' ? '📄' : a.type === 'VIDEO' ? '🎥' : '🔗'}</span>
                              <div className="asset-info">
                                <div className="asset-title">{a.title}</div>
                                <div className="asset-type">{a.type}</div>
                              </div>
                              <div className="item-actions">
                                <button className="btn-icon" onClick={(e) => startEditing(a.id, a.title, e)} title={t('edit')}>✏️</button>
                                <button
                                  className="btn-icon btn-danger-soft"
                                  onClick={() => deleteAsset(a.id)}
                                  title={t('delete')}
                                >
                                  🗑️
                                </button>
                              </div>
                            </>
                          )}
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

      <style>{`
        .content-page {
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
          font-size: var(--font-size-base);
        }

        .items-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
          margin-top: var(--spacing-md);
        }

        .list-item-clickable {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-md);
          background-color: var(--bg-tertiary);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);
          border: 2px solid transparent;
        }

        .list-item-clickable:hover {
          background-color: var(--bg-secondary);
          transform: translateX(4px);
        }

        .list-item-clickable.active {
          background-color: var(--primary-50);
          border-color: var(--primary-600);
        }

        .asset-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding: var(--spacing-md);
          background-color: var(--bg-tertiary);
          border-radius: var(--radius-md);
        }

        .asset-icon {
          font-size: 2rem;
        }

        .asset-info {
          flex: 1;
        }

        .asset-title {
          font-weight: var(--font-weight-medium);
          color: var(--text-primary);
          margin-bottom: var(--spacing-xs);
        }

        .asset-type {
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
        }

        .empty-state {
          text-align: center;
          padding: var(--spacing-xl);
          color: var(--text-secondary);
          font-style: italic;
        }

        .item-actions {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .item-title {
          flex: 1;
          margin-right: var(--spacing-sm);
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

        .btn-danger-soft:hover {
          background-color: var(--error-50);
          filter: brightness(0.9);
        }

        .asset-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding: var(--spacing-md);
          background-color: var(--bg-tertiary);
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
        }

        .asset-item:hover {
          background-color: var(--bg-secondary);
        }

        .demo-badge {
          margin-top: var(--spacing-md);
          padding: var(--spacing-md);
          background-color: var(--primary-50);
          border-right: 4px solid var(--primary-600);
          border-radius: var(--radius-sm);
          color: var(--primary-800);
        }

        [dir="ltr"] .demo-badge {
          border-right: none;
          border-left: 4px solid var(--primary-600);
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
      `}</style>
    </div>
  );
}
