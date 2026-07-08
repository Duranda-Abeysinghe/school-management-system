import { useEffect, useState } from 'react';
import API from '../../api/axios';
import { useLanguage } from '../../context/LanguageContext';

const getGrade = (mark) => {
  if (mark >= 90) return 'A+';
  if (mark >= 80) return 'A';
  if (mark >= 70) return 'B';
  if (mark >= 60) return 'C';
  if (mark >= 50) return 'D';
  return 'F';
};

const getColor = (mark) =>
  mark >= 80 ? 'badge-green' : mark >= 60 ? 'badge-blue' :
  mark >= 50 ? 'badge-yellow' : 'badge-red';

export default function Marks() {
  const { t } = useLanguage();
  const [students,  setStudents]  = useState([]);
  const [classes,   setClasses]   = useState([]);
  const [subjects,  setSubjects]  = useState([]);
  const [marks,     setMarks]     = useState({});
  const [examType,  setExamType]  = useState('Term Test 1');
  const [subjectId, setSubjectId] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [error,     setError]     = useState('');

  useEffect(() => {
    Promise.all([API.get('/students'), API.get('/subjects'), API.get('/classes')])
      .then(([s, sub, c]) => {
        setStudents(s.data);
        setSubjects(sub.data);
        setClasses(c.data);
        if (sub.data.length > 0) setSubjectId(sub.data[0].id.toString());
        if (c.data.length > 0) setSelectedClass(c.data[0].id.toString());
        setMarks(Object.fromEntries(s.data.map(st => [st.id, ''])));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // 🔧 Only show students belonging to the selected class
  const filteredStudents = students.filter(s => s.classId === parseInt(selectedClass));

  const handleSave = async () => {
    if (!subjectId) { setError('Please select a subject.'); return; }
    if (!selectedClass) { setError('Please select a class.'); return; }
    setSaving(true);
    setError('');
    try {
      const records = filteredStudents
        .filter(s => marks[s.id] !== '' && marks[s.id] !== undefined)
        .map(s => ({
          studentId: s.id,
          subjectId: parseInt(subjectId),
          classId:   parseInt(selectedClass),
          examType:  examType,
          marks:     parseInt(marks[s.id]),
          grade:     getGrade(parseInt(marks[s.id]))
        }));

      if (records.length === 0) {
        setError('Please enter at least one mark.');
        setSaving(false);
        return;
      }

      await API.post('/marks', records);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Failed to save marks.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>📝 {t('enterMarks')}</h1>
      </div>

      {saved  && <div className="alert alert-success">✅ Marks saved to database successfully!</div>}
      {error  && <div className="alert alert-error">❌ {error}</div>}

      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="grid-3">
          <div className="form-group">
            <label>{t('className') || 'Class'}</label>
            <select value={selectedClass} onChange={e => {
              setSelectedClass(e.target.value);
              setSaved(false);
            }}>
              <option value="">Select Class</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.className} {c.section}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>{t('subject')}</label>
            <select value={subjectId}
              onChange={e => setSubjectId(e.target.value)}>
              <option value="">Select Subject</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.subjectName}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Exam Type</label>
            <select value={examType} onChange={e => setExamType(e.target.value)}>
              <option value="Term Test 1">Term Test 1</option>
              <option value="Term Test 2">Term Test 2</option>
              <option value="Mid Term">Mid Term</option>
              <option value="Final Exam">Final Exam</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card text-center" style={{ padding: '40px' }}>
          <p style={{ color: '#94a3b8' }}>⏳ Loading students...</p>
        </div>
      ) : !selectedClass ? (
        <div className="card text-center" style={{ padding: '40px' }}>
          <p style={{ color: '#94a3b8' }}>Please select a class to view students.</p>
        </div>
      ) : (
        <div className="card">
          <h3 style={{ marginBottom: '16px' }}>
            📝 {classes.find(c => c.id.toString() === selectedClass)?.className || ''}{' '}
            {classes.find(c => c.id.toString() === selectedClass)?.section || ''} —{' '}
            {subjects.find(s => s.id.toString() === subjectId)?.subjectName || 'Select Subject'} — {examType}
          </h3>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>{t('admNo')}</th>
                  <th>{t('name')}</th>
                  <th>Marks (0-100)</th>
                  <th>{t('grade')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s, i) => {
                  const mark = parseInt(marks[s.id]) || 0;
                  const grade = marks[s.id] !== '' ? getGrade(mark) : '-';
                  const color = marks[s.id] !== '' ? getColor(mark) : 'badge-gray';
                  return (
                    <tr key={s.id}>
                      <td>{i + 1}</td>
                      <td><span className="badge badge-gray">{s.admissionNo}</span></td>
                      <td><strong>{s.fullName}</strong></td>
                      <td>
                        <input
                          type="number" min="0" max="100"
                          placeholder="Enter marks"
                          value={marks[s.id] || ''}
                          onChange={e => {
                            setMarks(p => ({ ...p, [s.id]: e.target.value }));
                            setSaved(false);
                          }}
                          style={{
                            width: '110px', padding: '8px 10px',
                            border: '1.5px solid #e2e8f0', borderRadius: '8px',
                            fontSize: '0.93rem', outline: 'none'
                          }}
                        />
                      </td>
                      <td>
                        <span className={`badge ${color}`}>{grade}</span>
                      </td>
                    </tr>
                  );
                })}
                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center" style={{ padding: '30px', color: '#94a3b8' }}>
                      No students found in this class.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
            <button className="btn btn-primary btn-lg" onClick={handleSave} disabled={saving}>
              {saving ? '⏳ Saving...' : `💾 Save Marks to Database`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}