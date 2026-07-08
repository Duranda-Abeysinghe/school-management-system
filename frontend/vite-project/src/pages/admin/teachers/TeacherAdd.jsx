import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../../api/axios';
import { useLanguage } from '../../../context/LanguageContext';

export default function TeacherAdd() {
  const navigate = useNavigate();
  // eslint-disable-next-line no-unused-vars
  const { t } = useLanguage();

  const [form, setForm] = useState({
    fullName: '', email: '', password: '', phone: '',
    gender: '', subject: '', address: '', status: 'Active',
  });

  const [subjects, setSubjects] = useState([]);
  const [success,  setSuccess]  = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    API.get('/teachers/subjects')
      .then(res => setSubjects(res.data))
      .catch(() => setSubjects([]));
  }, []);

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.password || form.password.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }
    setLoading(true); setError('');
    try {
      await API.post('/teachers/with-account', {
        fullName: form.fullName, email: form.email, password: form.password,
        phone: form.phone, gender: form.gender,
        subject: form.subject, address: form.address, status: form.status,
      });
      setSuccess(true);
      setTimeout(() => navigate('/admin/teachers'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add teacher.');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="page-header">
        <h1>➕ Add Teacher</h1>
        <button className="btn btn-outline" onClick={() => navigate('/admin/teachers')}>← Back</button>
      </div>

      {success && <div className="alert alert-success">✅ Teacher added &amp; login created! Redirecting...</div>}
      {error   && <div className="alert alert-error">❌ {error}</div>}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <h3 style={{ marginBottom: '18px', color: '#2563eb' }}>👤 Personal Information</h3>
          <div className="grid-3">

            <div className="form-group">
              <label>Full Name *</label>
              <input required placeholder="Mr. Sunil Perera" value={form.fullName}
                onChange={e => update('fullName', e.target.value)} />
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input required type="email" placeholder="teacher@school.com" value={form.email}
                onChange={e => update('email', e.target.value)} />
            </div>

            <div className="form-group">
              <label style={{ color: '#dc2626', fontWeight: 600 }}>🔑 Login Password *</label>
              <input required type="password" placeholder="Min 4 characters" value={form.password}
                onChange={e => update('password', e.target.value)}
                style={{ borderColor: form.password.length >= 4 ? '#16a34a' : '#dc2626' }} />
              <small style={{ color: '#64748b', fontSize: '11px', display: 'block', marginTop: '3px' }}>
                Saved to Users table. Teacher logs in with this password.
              </small>
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input placeholder="077 123 4567" value={form.phone}
                onChange={e => update('phone', e.target.value)} />
            </div>

            <div className="form-group">
              <label>Gender *</label>
              <select required value={form.gender} onChange={e => update('gender', e.target.value)}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div className="form-group">
              <label>Status</label>
              <select value={form.status} onChange={e => update('status', e.target.value)}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

          </div>

          <div className="form-group">
            <label>Address</label>
            <textarea rows="2" placeholder="No. 12, Main Street, Colombo"
              value={form.address} onChange={e => update('address', e.target.value)} />
          </div>

          <h3 style={{ margin: '24px 0 16px', color: '#2563eb' }}>📚 Professional Information</h3>
          <div className="grid-3">

            <div className="form-group">
              <label>Subject *</label>
              <input required list="subject-options" placeholder="Mathematics"
                value={form.subject} onChange={e => update('subject', e.target.value)} />
              <datalist id="subject-options">
                {subjects.map(s => <option key={s} value={s} />)}
              </datalist>
              <small style={{ color: '#64748b', fontSize: '11px', display: 'block', marginTop: '3px' }}>
                Pick from list or type a new subject.
              </small>
            </div>

          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? '⏳ Saving...' : '💾 Save Teacher'}
            </button>
            <button type="button" className="btn btn-outline"
              onClick={() => navigate('/admin/teachers')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}