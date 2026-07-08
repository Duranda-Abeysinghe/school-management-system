import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../../api/axios';
import { useLanguage } from '../../../context/LanguageContext';

export default function StudentList() {
  const { t } = useLanguage();
  const [students,     setStudents]     = useState([]);
  const [classes,      setClasses]      = useState([]);
  const [academicYears,setAcademicYears] = useState([]);
  const [search,       setSearch]       = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterClass,  setFilterClass]  = useState('');
  const [filterYear,   setFilterYear]   = useState('');
  const [loading,      setLoading]      = useState(true);

  // Load classes and academic years for filter dropdowns
  useEffect(() => {
    API.get('/classes')
      .then(res => setClasses(res.data))
      .catch(() => setClasses([]));

    API.get('/students/academic-years')
      .then(res => setAcademicYears(res.data))
      .catch(() => setAcademicYears([]));
  }, []);

  // Load students (re-run when filters change for server-side filtering)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    const params = new URLSearchParams();
    if (search)       params.append('search',       search);
    if (filterStatus !== 'All') params.append('status', filterStatus);
    if (filterClass)  params.append('classId',      filterClass);
    if (filterYear)   params.append('academicYear', filterYear);

    API.get(`/students?${params.toString()}`)
      .then(res => setStudents(res.data))
      .catch(() => setStudents([]))
      .finally(() => setLoading(false));
  }, [search, filterStatus, filterClass, filterYear]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this student?')) return;
    try {
      await API.delete(`/students/${id}`);
      setStudents(prev => prev.filter(s => s.id !== id));
    } catch {
      alert('Delete failed.');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <h1>🎓 {t('studentList')}</h1>
        <Link to="/admin/students/add" className="btn btn-primary">
          ➕ {t('addNewStudent')}
        </Link>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>

          {/* Search */}
          <div className="search-bar" style={{ flex: '1', minWidth: '200px' }}>
            <span>🔍</span>
            <input
              placeholder={t('searchStudents')}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Class filter — from database */}
          <select
            value={filterClass}
            onChange={e => setFilterClass(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }}>
            <option value="">All Classes</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.displayName}</option>
            ))}
          </select>

          {/* Academic year filter — from database */}
          <select
            value={filterYear}
            onChange={e => setFilterYear(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }}>
            <option value="">All Years</option>
            {academicYears.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          {/* Status filter */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {['All', 'Active', 'Inactive'].map(f => (
              <button key={f}
                onClick={() => setFilterStatus(f)}
                className={`btn btn-sm ${filterStatus === f ? 'btn-primary' : 'btn-outline'}`}>
                {f === 'All' ? t('all') : f === 'Active' ? t('active') : t('inactive')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="card text-center"><p>⏳ {t('loading')}</p></div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>{t('admNo')}</th>
                <th>{t('name')}</th>
                <th>{t('email')}</th>
                <th>{t('phone')}</th>
                <th>Class</th>
                <th>Year</th>
                <th>{t('status')}</th>
                <th>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {students.map(s => (
                <tr key={s.id}>
                  <td><span className="badge badge-gray">{s.admissionNo}</span></td>
                  <td><strong>{s.fullName}</strong></td>
                  <td>{s.email}</td>
                  <td>{s.phone}</td>
                  <td>{s.className || '—'}</td>
                  <td>{s.academicYear || '—'}</td>
                  <td>
                    <span className={`badge ${s.status === 'Active' ? 'badge-green' : 'badge-red'}`}>
                      {s.status === 'Active' ? t('active') : t('inactive')}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <Link to={`/admin/students/edit/${s.id}`} className="btn btn-warning btn-sm">
                        ✏️ {t('edit')}
                      </Link>
                      <button onClick={() => handleDelete(s.id)} className="btn btn-danger btn-sm">
                        🗑️ {t('delete')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center" style={{ padding: '30px', color: '#94a3b8' }}>
                    {t('noStudents')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ padding: '14px 18px', color: '#94a3b8', fontSize: '0.85rem' }}>
        {students.length} students shown
      </div>
    </div>
  );
}