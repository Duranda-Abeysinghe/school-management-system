import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../../api/axios';
import { useLanguage } from '../../../context/LanguageContext';

export default function StudentAdd() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [form, setForm] = useState({
    fullName: '', email: '', password: '', phone: '', gender: '',
    dateOfBirth: '', address: '', parentName: '', parentContact: '',
    status: 'Active', classId: '', academicYear: String(new Date().getFullYear()),
  });

  const [classes,        setClasses]        = useState([]);
  const [academicYears,  setAcademicYears]  = useState([]);
  const [success,        setSuccess]        = useState(false);
  const [error,          setError]          = useState('');
  const [loading,        setLoading]        = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(true);

  useEffect(() => {
    API.get('/classes')
      .then(res => setClasses(res.data))
      .catch(() => setClasses([]))
      .finally(() => setLoadingClasses(false));
    const y = new Date().getFullYear();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAcademicYears(Array.from({ length: 5 }, (_, i) => y - i));
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
      await API.post('/students/with-account', {
        fullName: form.fullName, email: form.email, password: form.password,
        phone: form.phone, gender: form.gender,
        dateOfBirth: form.dateOfBirth || null, address: form.address,
        parentName: form.parentName, parentContact: form.parentContact,
        classId: form.classId ? parseInt(form.classId) : null,
        academicYear: form.academicYear ? parseInt(form.academicYear) : null,
      });
      setSuccess(true);
      setTimeout(() => navigate('/admin/students'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add student.');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="page-header">
        <h1>➕ {t('addStudentTitle') || 'Add Student'}</h1>
        <button className="btn btn-outline" onClick={() => navigate('/admin/students')}>← Back</button>
      </div>

      {success && <div className="alert alert-success">✅ Student added &amp; login created! Redirecting...</div>}
      {error   && <div className="alert alert-error">❌ {error}</div>}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <h3 style={{ marginBottom: '18px', color: '#2563eb' }}>👤 Personal Information</h3>
          <div className="grid-3">

            <div className="form-group">
              <label>Full Name *</label>
              <input required placeholder="John Perera" value={form.fullName}
                onChange={e => update('fullName', e.target.value)} />
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input required type="email" placeholder="john@mail.com" value={form.email}
                onChange={e => update('email', e.target.value)} />
            </div>

            <div className="form-group">
              <label style={{ color: '#dc2626', fontWeight: 600 }}>🔑 Login Password *</label>
              <input required type="password" placeholder="Min 4 characters" value={form.password}
                onChange={e => update('password', e.target.value)}
                style={{ borderColor: form.password.length >= 4 ? '#16a34a' : '#dc2626' }} />
              <small style={{ color: '#64748b', fontSize: '11px', display: 'block', marginTop: '3px' }}>
                Saved to Users table. Student logs in with this password.
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
              <label>Date of Birth</label>
              <input type="date" value={form.dateOfBirth}
                onChange={e => update('dateOfBirth', e.target.value)} />
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

          <h3 style={{ margin: '24px 0 16px', color: '#2563eb' }}>🏫 Academic Information</h3>
          <div className="grid-3">

            <div className="form-group">
              <label>Class *</label>
              {loadingClasses ? (
                <select disabled><option>Loading...</option></select>
              ) : (
                <select required value={form.classId} onChange={e => update('classId', e.target.value)}>
                  <option value="">Select Class</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.displayName || c.className + ' ' + c.section}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="form-group">
              <label>Academic Year *</label>
              <select required value={form.academicYear}
                onChange={e => update('academicYear', e.target.value)}>
                {academicYears.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Parent Name</label>
              <input placeholder="Mr. Perera" value={form.parentName}
                onChange={e => update('parentName', e.target.value)} />
            </div>

            <div className="form-group">
              <label>Parent Contact</label>
              <input placeholder="077 987 6543" value={form.parentContact}
                onChange={e => update('parentContact', e.target.value)} />
            </div>

          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? '⏳ Saving...' : '💾 Save Student'}
            </button>
            <button type="button" className="btn btn-outline"
              onClick={() => navigate('/admin/students')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}