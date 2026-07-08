import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../../api/axios';
import { useLanguage } from '../../../context/LanguageContext';

export default function TeacherEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [form, setForm] = useState({
    fullName: '', email: '', phone: '',
    gender: '', subject: '', address: '', status: 'Active',
  });

  const [subjects, setSubjects] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [error,    setError]    = useState('');

  useEffect(() => {
    // Load subject list from DB
    API.get('/teachers/subjects')
      .then(res => setSubjects(res.data))
      .catch(() => setSubjects([]));

    // Load teacher data
    API.get(`/teachers/${id}`)
      .then(res => {
        const t = res.data;
        setForm({
          fullName: t.fullName || '',
          email:    t.email    || '',
          phone:    t.phone    || '',
          gender:   t.gender   || '',
          subject:  t.subject  || '',
          address:  t.address  || '',
          status:   t.status   || 'Active',
        });
      })
      .catch(() => setError('Failed to load teacher.'))
      .finally(() => setLoading(false));
  }, [id]);

  const update = (field, value) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      // PUT updates Teachers table + keeps Users table name/email in sync
      await API.put(`/teachers/${id}`, form);
      setSuccess(true);
      setTimeout(() => navigate('/admin/teachers'), 1500);
    } catch {
      setError('Failed to update teacher.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="card text-center" style={{ padding: '40px' }}>
      <p>⏳ Loading...</p>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h1>✏️ Edit Teacher</h1>
        <button className="btn btn-outline" onClick={() => navigate('/admin/teachers')}>
          ← {t('back')}
        </button>
      </div>

      {success && <div className="alert alert-success">✅ Teacher updated successfully!</div>}
      {error   && <div className="alert alert-error">❌ {error}</div>}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <h3 style={{ marginBottom: '18px', color: '#2563eb' }}>👤 Personal Information</h3>
          <div className="grid-3">

            <div className="form-group">
              <label>Full Name *</label>
              <input required value={form.fullName}
                onChange={e => update('fullName', e.target.value)} />
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input required type="email" value={form.email}
                onChange={e => update('email', e.target.value)} />
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input value={form.phone}
                onChange={e => update('phone', e.target.value)} />
            </div>

            <div className="form-group">
              <label>Gender</label>
              <select value={form.gender}
                onChange={e => update('gender', e.target.value)}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div className="form-group">
              <label>Status</label>
              <select value={form.status}
                onChange={e => update('status', e.target.value)}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

          </div>

          <div className="form-group">
            <label>Address</label>
            <textarea rows="2" value={form.address}
              onChange={e => update('address', e.target.value)} />
          </div>

          <h3 style={{ margin: '20px 0 16px', color: '#2563eb' }}>📚 Professional Information</h3>
          <div className="grid-3">

            <div className="form-group">
              <label>Subject</label>
              <input list="subject-list-edit"
                value={form.subject}
                onChange={e => update('subject', e.target.value)} />
              <datalist id="subject-list-edit">
                {subjects.map(s => <option key={s} value={s} />)}
              </datalist>
            </div>

          </div>

          {/* Note: password is not changed here. Use reset-password endpoint for that. */}
          <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '8px' }}>
            🔒 To change the password, use the Reset Password option on the teacher list.
          </p>

          <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
            <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
              {saving ? '⏳ Updating...' : `💾 ${t('update')}`}
            </button>
            <button type="button" className="btn btn-outline"
              onClick={() => navigate('/admin/teachers')}>
              {t('cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}