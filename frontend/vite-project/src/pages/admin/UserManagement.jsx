import { useEffect, useState } from 'react';
import API from '../../api/axios';
import { useLanguage } from '../../context/LanguageContext';

export default function UserManagement() {
  const { t } = useLanguage();

  const [users,    setUsers]    = useState([]);
  const [classes,  setClasses]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [success,  setSuccess]  = useState('');
  const [error,    setError]    = useState('');
  const [search,   setSearch]   = useState('');
  const [filter,   setFilter]   = useState('All');

  const currentYear = new Date().getFullYear();
  const academicYears = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const [form, setForm] = useState({
    role: 'Student', fullName: '', email: '', password: '',
    phone: '', gender: '', subject: '', address: '',
    parentName: '', parentContact: '', classId: '',
    dateOfBirth: '', academicYear: String(currentYear)
  });

  useEffect(() => {
    API.get('/auth/users')
      .then(res => setUsers(res.data))
      .catch(() => setError('Failed to load users.'))
      .finally(() => setLoading(false));

    API.get('/classes')
      .then(res => setClasses(res.data))
      .catch(() => setClasses([]));
  }, []);

  const update = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const resetForm = () => setForm({
    role: 'Student', fullName: '', email: '', password: '',
    phone: '', gender: '', subject: '', address: '',
    parentName: '', parentContact: '', classId: '',
    dateOfBirth: '', academicYear: String(currentYear)
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.password || form.password.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }
    setSaving(true); setError(''); setSuccess('');
    try {
      if (form.role === 'Student') {
        await API.post('/students/with-account', {
          fullName:      form.fullName,
          email:         form.email,
          password:      form.password,
          phone:         form.phone,
          gender:        form.gender,
          address:       form.address,
          parentName:    form.parentName,
          parentContact: form.parentContact,
          classId:       form.classId ? parseInt(form.classId) : null,
          dateOfBirth:   form.dateOfBirth || null,
          academicYear:  form.academicYear ? parseInt(form.academicYear) : null,
        });
      } else {
        await API.post('/teachers/with-account', {
          fullName: form.fullName, email: form.email,
          password: form.password, phone: form.phone,
          gender: form.gender, subject: form.subject,
          address: form.address, status: 'Active',
        });
      }
      const res = await API.get('/auth/users');
      setUsers(res.data);
      setSuccess(`${form.role} account created! Email: ${form.email} | Password: ${form.password}`);
      resetForm(); setShowForm(false);
      setTimeout(() => setSuccess(''), 10000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed. Email may already exist.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, role) => {
    if (role === 'Admin') { alert('Cannot delete Admin.'); return; }
    if (!confirm('Delete this user? They cannot login anymore.')) return;
    try {
      await API.delete(`/auth/users/${id}`);
      setUsers(p => p.filter(u => u.id !== id));
    } catch { alert('Failed to delete.'); }
  };

  const handleResetPassword = async (id, name) => {
    const np = prompt(`New password for ${name} (min 4 chars):`);
    if (!np) return;
    if (np.length < 4) { alert('Min 4 characters.'); return; }
    try {
      await API.put(`/auth/users/${id}/reset-password`,
        JSON.stringify(np), { headers: { 'Content-Type': 'application/json' } });
      alert(`Password reset for ${name}!`);
    } catch { alert('Failed to reset.'); }
  };

  const roleColor  = r => r === 'Admin' ? '#7c3aed' : r === 'Teacher' ? '#16a34a' : '#2563eb';
  const roleBadge  = r => r === 'Admin' ? 'badge-purple' : r === 'Teacher' ? 'badge-green' : 'badge-blue';
  const roleIcon   = r => r === 'Admin' ? '👨‍💼' : r === 'Teacher' ? '👨‍🏫' : '🎓';

  const filtered = users.filter(u =>
    (u.name?.toLowerCase().includes(search.toLowerCase()) ||
     u.email?.toLowerCase().includes(search.toLowerCase())) &&
    (filter === 'All' || u.role === filter)
  );

  return (
    <div>
      <div className="page-header">
        <h1>👥 User Management</h1>
        <button className="btn btn-primary"
          onClick={() => { setShowForm(!showForm); setError(''); setSuccess(''); }}>
          {showForm ? '✕ Cancel' : '➕ Create Account'}
        </button>
      </div>

      {success && (
        <div className="alert alert-success" style={{ wordBreak: 'break-all' }}>
          ✅ {success}
        </div>
      )}
      {error && <div className="alert alert-error">❌ {error}</div>}

      {showForm && (
        <div className="card" style={{ marginBottom: '24px', border: '2px solid #2563eb' }}>
          <h3 style={{ marginBottom: '20px', color: '#2563eb' }}>🔐 Create System Account</h3>
          <form onSubmit={handleSubmit}>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#374151', display: 'block', marginBottom: '8px' }}>
                Select Role *
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                {['Teacher', 'Student'].map(role => (
                  <button key={role} type="button" onClick={() => update('role', role)}
                    style={{
                      padding: '10px 24px', borderRadius: '10px',
                      border: `2px solid ${form.role === role ? roleColor(role) : '#e2e8f0'}`,
                      background: form.role === role ? `${roleColor(role)}15` : 'white',
                      color: form.role === role ? roleColor(role) : '#64748b',
                      fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                    }}>
                    {roleIcon(role)} {role}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid-3">
              <div className="form-group">
                <label>Full Name *</label>
                <input required placeholder="Full name"
                  value={form.fullName} onChange={e => update('fullName', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input required type="email" placeholder="email@example.com"
                  value={form.email} onChange={e => update('email', e.target.value)} />
              </div>
              <div className="form-group">
                <label style={{ color: '#dc2626', fontWeight: 600 }}>🔑 Login Password *</label>
                <input required type="password" placeholder="Min 4 characters"
                  value={form.password} onChange={e => update('password', e.target.value)}
                  style={{ borderColor: form.password.length >= 4 ? '#16a34a' : '#dc2626' }} />
                <small style={{ color: '#64748b', fontSize: '11px' }}>
                  Saved hashed to Users table. They log in with this.
                </small>
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input placeholder="077 123 4567"
                  value={form.phone} onChange={e => update('phone', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select value={form.gender} onChange={e => update('gender', e.target.value)}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              {form.role === 'Teacher' && (
                <div className="form-group">
                  <label>Subject *</label>
                  <select required value={form.subject} onChange={e => update('subject', e.target.value)}>
                    <option value="">Select Subject</option>
                    {['Mathematics','Science','English','History','Geography','Art','Music','PE','ICT','Sinhala'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              )}

              {form.role === 'Student' && (
                <>
                  <div className="form-group">
                    <label>Class</label>
                    <select value={form.classId} onChange={e => update('classId', e.target.value)}>
                      <option value="">Select Class</option>
                      {classes.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.displayName || `${c.className} ${c.section}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Academic Year</label>
                    <select value={form.academicYear} onChange={e => update('academicYear', e.target.value)}>
                      {academicYears.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Date of Birth</label>
                    <input type="date" value={form.dateOfBirth}
                      onChange={e => update('dateOfBirth', e.target.value)} />
                  </div>
                </>
              )}
            </div>

            <div className="form-group">
              <label>Address</label>
              <textarea rows="2" placeholder="Address..."
                value={form.address} onChange={e => update('address', e.target.value)} />
            </div>

            {form.role === 'Student' && (
              <div className="grid-3">
                <div className="form-group">
                  <label>Parent Name</label>
                  <input placeholder="Parent/Guardian name"
                    value={form.parentName} onChange={e => update('parentName', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Parent Contact</label>
                  <input placeholder="077 987 6543"
                    value={form.parentContact} onChange={e => update('parentContact', e.target.value)} />
                </div>
              </div>
            )}

            {form.email && form.password && form.password.length >= 4 && (
              <div style={{ background:'#f0fdf4', border:'1px solid #86efac', borderRadius:'10px', padding:'14px', marginBottom:'16px' }}>
                <p style={{ margin:'0 0 4px', fontWeight:700, color:'#15803d', fontSize:'0.88rem' }}>🔐 Credentials Preview:</p>
                <p style={{ margin:'0 0 2px', fontSize:'0.85rem', color:'#166534' }}><strong>Email:</strong> {form.email}</p>
                <p style={{ margin:'0 0 6px', fontSize:'0.85rem', color:'#166534' }}><strong>Password:</strong> {'•'.repeat(form.password.length)}</p>
                <p style={{ margin:0, fontSize:'0.78rem', color:'#94a3b8' }}>Share these with the {form.role.toLowerCase()} after saving.</p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
                {saving ? '⏳ Creating...' : `🔐 Create ${form.role} Account`}
              </button>
              <button type="button" className="btn btn-outline"
                onClick={() => { setShowForm(false); resetForm(); }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-bar" style={{ flex: 1, minWidth: '200px' }}>
            <span>🔍</span>
            <input placeholder="Search by name or email..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {['All','Admin','Teacher','Student'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`}>{f}</button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card text-center" style={{ padding: '40px' }}>
          <p style={{ color: '#94a3b8' }}>⏳ Loading users...</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th><th>Name</th><th>Email</th><th>Role</th><th>Created</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr key={u.id}>
                  <td style={{ color: '#94a3b8' }}>{i + 1}</td>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                      <div style={{
                        width:'34px', height:'34px', borderRadius:'50%',
                        background: roleColor(u.role),
                        display:'flex', alignItems:'center', justifyContent:'center',
                        color:'white', fontWeight:700, fontSize:'0.85rem', flexShrink:0
                      }}>{u.name?.[0]?.toUpperCase()}</div>
                      <strong>{u.name}</strong>
                    </div>
                  </td>
                  <td style={{ color: '#64748b' }}>{u.email}</td>
                  <td><span className={`badge ${roleBadge(u.role)}`}>{roleIcon(u.role)} {u.role}</span></td>
                  <td style={{ color:'#94a3b8', fontSize:'0.85rem' }}>
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {u.role !== 'Admin' ? (
                        <>
                          <button onClick={() => handleResetPassword(u.id, u.name)}
                            className="btn btn-warning btn-sm">🔑 Reset</button>
                          <button onClick={() => handleDelete(u.id, u.role)}
                            className="btn btn-danger btn-sm">🗑️</button>
                        </>
                      ) : (
                        <span className="badge badge-gray">🔒 Protected</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan="6" className="text-center"
                  style={{ padding:'30px', color:'#94a3b8' }}>No users found.</td></tr>
              )}
            </tbody>
          </table>
          <div style={{ padding:'12px 16px', color:'#94a3b8', fontSize:'0.82rem', background:'white' }}>
            Total: {users.length} — {users.filter(u=>u.role==='Admin').length} Admin,{' '}
            {users.filter(u=>u.role==='Teacher').length} Teachers,{' '}
            {users.filter(u=>u.role==='Student').length} Students
          </div>
        </div>
      )}
    </div>
  );
}