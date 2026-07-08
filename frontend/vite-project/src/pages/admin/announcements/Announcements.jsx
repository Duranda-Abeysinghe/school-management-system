import { useEffect, useState } from 'react';
import API from '../../../api/axios';
import { useLanguage } from '../../../context/LanguageContext';

export default function Announcements() {
  const { t } = useLanguage();
  const [announcements, setAnnouncements] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [success,  setSuccess]  = useState('');
  const [error,    setError]    = useState('');
  const [form, setForm] = useState({
    title: '', message: '', target: 'All', priority: 'Normal'
  });

  useEffect(() => {
    API.get('/announcements')
      .then(res => setAnnouncements(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await API.post('/announcements', {
        title:    form.title,
        message:  form.message,
        target:   form.target,
        priority: form.priority
      });
      setAnnouncements(p => [res.data.data, ...p]);
      setForm({ title: '', message: '', target: 'All', priority: 'Normal' });
      setShowForm(false);
      setSuccess('Announcement published successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Failed to post announcement.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this announcement?')) return;
    try {
      await API.delete(`/announcements/${id}`);
      setAnnouncements(p => p.filter(a => a.id !== id));
    } catch {
      alert('Failed to delete.');
    }
  };

  const priorityColor = (p) =>
    p === 'High' ? '#dc2626' : p === 'Urgent' ? '#7c3aed' : '#2563eb';

  return (
    <div>
      <div className="page-header">
        <h1>📢 {t('announcements')}</h1>
        <button className="btn btn-primary"
          onClick={() => { setShowForm(!showForm); setError(''); }}>
          {showForm ? `✕ ${t('cancel')}` : `➕ ${t('postAnnouncement')}`}
        </button>
      </div>

      {success && <div className="alert alert-success">✅ {success}</div>}
      {error   && <div className="alert alert-error">❌ {error}</div>}

      {showForm && (
        <div className="card" style={{ marginBottom: '20px', border: '2px solid #2563eb' }}>
          <h3 style={{ marginBottom: '16px', color: '#2563eb' }}>📝 New Announcement</h3>
          <form onSubmit={handleAdd}>
            <div className="grid-2">
              <div className="form-group">
                <label>Title *</label>
                <input required placeholder="Announcement title..."
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Target Audience</label>
                <select value={form.target}
                  onChange={e => setForm({ ...form, target: e.target.value })}>
                  <option value="All">All</option>
                  <option value="Students">Students</option>
                  <option value="Teachers">Teachers</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Message *</label>
              <textarea required rows="3" placeholder="Write your announcement here..."
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })} />
            </div>
            <div className="form-group" style={{ maxWidth: '200px' }}>
              <label>Priority</label>
              <select value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value })}>
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? '⏳ Publishing...' : '📢 Publish'}
              </button>
              <button type="button" className="btn btn-outline"
                onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="card text-center" style={{ padding: '40px' }}>
          <p style={{ color: '#94a3b8' }}>⏳ Loading announcements...</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {announcements.map(a => (
            <div key={a.id} className="card" style={{
              borderLeft: `4px solid ${priorityColor(a.priority)}`
            }}>
              <div className="flex-between" style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <strong style={{ fontSize: '1rem' }}>{a.title}</strong>
                  <span className={`badge ${
                    a.priority === 'High'   ? 'badge-red'    :
                    a.priority === 'Urgent' ? 'badge-purple' : 'badge-blue'
                  }`}>{a.priority}</span>
                  <span className="badge badge-gray">📣 {a.target}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    {new Date(a.createdAt).toLocaleDateString()}
                  </span>
                  <button onClick={() => handleDelete(a.id)}
                    className="btn btn-danger btn-sm">🗑️</button>
                </div>
              </div>
              <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>{a.message}</p>
            </div>
          ))}
          {announcements.length === 0 && (
            <div className="card text-center" style={{ padding: '40px' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📢</div>
              <p style={{ color: '#94a3b8' }}>No announcements yet. Post your first one!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}