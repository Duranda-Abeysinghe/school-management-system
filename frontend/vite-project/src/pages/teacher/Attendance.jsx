import { useEffect, useState } from 'react';
import API from '../../api/axios';
import { useLanguage } from '../../context/LanguageContext';

export default function Attendance() {
  const { t } = useLanguage();
  const [students,  setStudents]  = useState([]);
  const [classes,   setClasses]   = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [attendance, setAttendance] = useState({});
  const [saved,    setSaved]    = useState(false);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);

  useEffect(() => {
    Promise.all([API.get('/students'), API.get('/classes')])
      .then(([s, c]) => {
        setStudents(s.data);
        setClasses(c.data);
        if (c.data.length > 0) setSelectedClass(c.data[0].id);
        setAttendance(Object.fromEntries(s.data.map(st => [st.id, 'Present'])));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // 🔧 FIX: filter students by the selected class
  const filteredStudents = students.filter(s => s.classId === parseInt(selectedClass));

  const toggle = (id, status) => { setAttendance(p => ({ ...p, [id]: status })); setSaved(false); };

  const markAll = (status) => {
    setAttendance(p => ({
      ...p,
      ...Object.fromEntries(filteredStudents.map(s => [s.id, status]))
    }));
    setSaved(false);
  };

  const presentCount = filteredStudents.filter(s => attendance[s.id] === 'Present').length;

  const handleSave = async () => {
    setSaving(true);
    try {
      const records = filteredStudents.map(s => ({
        studentId: s.id,
        classId:   parseInt(selectedClass),
        date:      date,
        status:    attendance[s.id] || 'Present'
      }));
      await API.post('/attendance', records);
      setSaved(true);
    } catch { alert('Failed to save.'); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <div className="page-header">
        <h1>✅ {t('markAttendance')}</h1>
      </div>

      <div className="card" style={{ marginBottom: '18px' }}>
        <div className="grid-3">
          <div className="form-group">
            <label>{t('className')}</label>
            <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.className} {c.section}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>{t('date')}</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label>{t('quickActions')}</label>
            <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
              <button className="btn btn-success btn-sm" onClick={() => markAll('Present')}>
                {t('allPresent')}
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => markAll('Absent')}>
                {t('allAbsent')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {saved && <div className="alert alert-success">✅ {t('success')}!</div>}

      {loading ? (
        <div className="card text-center"><p>{t('loading')}</p></div>
      ) : (
        <div className="card">
          <div className="flex-between" style={{ marginBottom: '16px' }}>
            <h3>👥 Students</h3>
            <span className="badge badge-green">{presentCount}/{filteredStudents.length} {t('present')}</span>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>{t('admNo')}</th>
                  <th>{t('name')}</th>
                  <th>{t('present')}</th>
                  <th>{t('absent')}</th>
                  <th>{t('late')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s, i) => (
                  <tr key={s.id}>
                    <td>{i + 1}</td>
                    <td><span className="badge badge-gray">{s.admissionNo}</span></td>
                    <td><strong>{s.fullName}</strong></td>
                    {['Present', 'Absent', 'Late'].map(status => (
                      <td key={status}>
                        <input
                          type="radio"
                          name={`att-${s.id}`}
                          checked={attendance[s.id] === status}
                          onChange={() => toggle(s.id, status)}
                          style={{
                            accentColor: status === 'Present' ? '#16a34a' :
                                         status === 'Absent'  ? '#dc2626' : '#d97706',
                            width: '18px', height: '18px', cursor: 'pointer'
                          }}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: '20px' }}>
            <button className="btn btn-success btn-lg" onClick={handleSave} disabled={saving}>
              {saving ? t('loading') : `💾 ${t('saveAttendance')}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}