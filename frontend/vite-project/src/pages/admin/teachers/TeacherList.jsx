import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../../api/axios';
import { useLanguage } from '../../../context/LanguageContext';

export default function TeacherList() {
  // eslint-disable-next-line no-unused-vars
  const { t } = useLanguage();

  const [teachers,      setTeachers]      = useState([]);
  const [subjects,      setSubjects]      = useState([]);
  const [search,        setSearch]        = useState('');
  const [filterStatus,  setFilterStatus]  = useState('All');
  const [filterSubject, setFilterSubject] = useState('');
  const [loading,       setLoading]       = useState(true);

  // Load subject filter options from DB
  useEffect(() => {
    API.get('/teachers/subjects')
      .then(res => setSubjects(res.data))
      .catch(() => setSubjects([]));
  }, []);

  // Reload teachers when filters change (server-side filtering)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    const params = new URLSearchParams();
    if (search)                       params.append('search',  search);
    if (filterStatus !== 'All')       params.append('status',  filterStatus);
    if (filterSubject)                params.append('subject', filterSubject);

    API.get(`/teachers?${params.toString()}`)
      .then(res => setTeachers(res.data))
      .catch(() => setTeachers([]))
      .finally(() => setLoading(false));
  }, [search, filterStatus, filterSubject]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this teacher and their login account?')) return;
    try {
      await API.delete(`/teachers/${id}`);
      // Backend also removes the linked Users row
      setTeachers(prev => prev.filter(t => t.id !== id));
    } catch {
      alert('Delete failed.');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <h1>👨‍🏫 Teachers</h1>
        <Link to="/admin/teachers/add" className="btn btn-primary">
          ➕ Add Teacher
        </Link>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>

          <div className="search-bar" style={{ flex: '1', minWidth: '200px' }}>
            <span>🔍</span>
            <input
              placeholder="Search by name, email or subject..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Subject filter — from DB */}
          <select
            value={filterSubject}
            onChange={e => setFilterSubject(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }}>
            <option value="">All Subjects</option>
            {subjects.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Status filter */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {['All', 'Active', 'Inactive'].map(f => (
              <button key={f}
                onClick={() => setFilterStatus(f)}
                className={`btn btn-sm ${filterStatus === f ? 'btn-primary' : 'btn-outline'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="card text-center"><p>⏳ Loading...</p></div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Subject</th>
                <th>Gender</th>
                <th>Status</th>
                <th>Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher, i) => (
                <tr key={teacher.id}>
                  <td style={{ color: '#94a3b8' }}>{i + 1}</td>
                  <td><strong>{teacher.fullName}</strong></td>
                  <td>{teacher.email}</td>
                  <td>{teacher.phone || '—'}</td>
                  <td>
                    <span className="badge badge-gray">{teacher.subject || '—'}</span>
                  </td>
                  <td>{teacher.gender || '—'}</td>
                  <td>
                    <span className={`badge ${teacher.status === 'Active' ? 'badge-green' : 'badge-red'}`}>
                      {teacher.status}
                    </span>
                  </td>
                  <td>
                    {/* Shows whether a login account exists in Users table */}
                    {teacher.userId ? (
                      <span className="badge badge-green">✅ Has Account</span>
                    ) : (
                      <span className="badge badge-red">❌ No Account</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <Link to={`/admin/teachers/edit/${teacher.id}`} className="btn btn-warning btn-sm">
                        ✏️ Edit
                      </Link>
                      <button onClick={() => handleDelete(teacher.id)} className="btn btn-danger btn-sm">
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {teachers.length === 0 && (
                <tr>
                  <td colSpan="9" className="text-center" style={{ padding: '30px', color: '#94a3b8' }}>
                    No teachers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ padding: '14px 18px', color: '#94a3b8', fontSize: '0.85rem' }}>
        {teachers.length} teachers shown
      </div>
    </div>
  );
}