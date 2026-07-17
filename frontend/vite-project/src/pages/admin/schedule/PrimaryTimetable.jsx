import { useEffect, useState } from 'react';
import API from '../../../api/axios';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function PrimaryTimetable() {
  const currentYear = new Date().getFullYear();

  const [years, setYears] = useState([]);
  const [year, setYear] = useState(currentYear);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [selectedGrade, setSelectedGrade] = useState(1);
  const [selectedClassId, setSelectedClassId] = useState(null);

  // grid[day][subjectId] = { checked: bool, teacherId: number|null }
  const [grid, setGrid] = useState({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const selectedClass = classes.find(c => c.id === selectedClassId);
  const isGrade5 = selectedClass?.grade === 5;
  const englishSubject = subjects.find(s => s.subjectName === 'English');

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 3000);
  };

  const loadStaticData = async () => {
    setYears(Array.from({ length: 11 }, (_, i) => currentYear - i));
    const [subjRes, teachRes] = await Promise.all([
      API.get('/primaryschedule/subjects'),
      API.get('/teachers'),
    ]);
    setSubjects(subjRes.data || []);
    setTeachers(teachRes.data || []);
  };

  const loadClasses = async () => {
    const res = await API.get(`/primaryschedule/classes?year=${year}`);
    const data = res.data || [];
    setClasses(data);
    const firstOfGrade = data.find(c => c.grade === selectedGrade);
    if (firstOfGrade && !selectedClassId) setSelectedClassId(firstOfGrade.id);
  };

  const loadTimetable = async () => {
    const res = await API.get(`/primaryschedule/timetable?classId=${selectedClassId}&year=${year}`);
    const newGrid = {};
    DAYS.forEach(d => { newGrid[d] = {}; });
    (res.data || []).forEach(entry => {
      newGrid[entry.dayOfWeek][entry.subjectId] = { checked: true, teacherId: entry.teacherId };
    });
    setGrid(newGrid);
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadStaticData(); }, []);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadClasses(); }, [year]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (selectedClassId) loadTimetable();
  }, [selectedClassId, year]);


  const assignClassTeacher = async (teacherId) => {
    if (!teacherId) return;
    try {
      await API.post('/primaryschedule/class-teacher', {
        classId: selectedClassId, teacherId: parseInt(teacherId), academicYear: year,
      });
      showMsg('success', 'Class teacher assigned.');
      loadClasses();
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Failed to assign teacher.');
    }
  };

  const toggleCell = (day, subjectId) => {
    setGrid(prev => {
      const daySlots = { ...(prev[day] || {}) };
      if (daySlots[subjectId]?.checked) {
        delete daySlots[subjectId];
      } else {
        daySlots[subjectId] = { checked: true, teacherId: null };
      }
      return { ...prev, [day]: daySlots };
    });
  };

  const setCellTeacher = (day, subjectId, teacherId) => {
    setGrid(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [subjectId]: { checked: true, teacherId: teacherId ? parseInt(teacherId) : null },
      },
    }));
  };

  const saveTimetable = async () => {
    if (!selectedClass?.classTeacherId) {
      showMsg('error', 'Assign a class teacher first.');
      return;
    }
    setSaving(true);
    const entries = [];
    DAYS.forEach(day => {
      Object.entries(grid[day] || {}).forEach(([subjectId, cell], idx) => {
        if (cell.checked) {
          entries.push({
            dayOfWeek: day,
            subjectId: parseInt(subjectId),
            teacherId: cell.teacherId || null,
            orderIndex: idx + 1,
          });
        }
      });
    });
    try {
      await API.post('/primaryschedule/timetable', {
        classId: selectedClassId, academicYear: year, entries,
      });
      showMsg('success', 'Timetable saved.');
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const sections = classes.filter(c => c.grade === selectedGrade);

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: '1.6rem', fontWeight: 800, color: '#1e3a5f' }}>🗓️ Primary Timetable</h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Grade 1–5, sections A–G. No fixed periods — just which subjects run on which day.</p>
        </div>
        <select value={year} onChange={e => setYear(parseInt(e.target.value))}
          style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8 }}>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {msg.text && (
        <div style={{
          background: msg.type === 'success' ? '#dcfce7' : '#fee2e2',
          color: msg.type === 'success' ? '#15803d' : '#b91c1c',
          borderLeft: `4px solid ${msg.type === 'success' ? '#16a34a' : '#dc2626'}`,
          borderRadius: 10, padding: '12px 16px', marginBottom: 18, fontWeight: 600
        }}>{msg.type === 'success' ? '✅' : '❌'} {msg.text}</div>
      )}

      <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 12px' }}>Grade</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {[1, 2, 3, 4, 5].map(g => (
            <button key={g}
              onClick={() => {
                setSelectedGrade(g);
                const firstOfGrade = classes.find(c => c.grade === g);
                setSelectedClassId(firstOfGrade ? firstOfGrade.id : null);
              }}
              style={{
                padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0', cursor: 'pointer', fontWeight: 600,
                background: selectedGrade === g ? '#2563eb' : 'white',
                color: selectedGrade === g ? 'white' : '#374151',
              }}>
              Grade {g}
            </button>
          ))}
        </div>

        <h3 style={{ margin: '0 0 12px' }}>Class</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {sections.map(c => (
            <button key={c.id}
              onClick={() => setSelectedClassId(c.id)}
              style={{
                padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0', cursor: 'pointer', fontWeight: 600,
                background: selectedClassId === c.id ? '#2563eb' : 'white',
                color: selectedClassId === c.id ? 'white' : '#374151',
              }}>
              {c.section}
            </button>
          ))}
        </div>
      </div>

      {selectedClass && (
        <>
          <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 24 }}>
            <h2 style={{ margin: '0 0 6px', fontSize: '1.1rem', color: '#1e3a5f' }}>{selectedClass.displayName} — {year}</h2>
            <p style={{ color: '#64748b', margin: '0 0 16px' }}>
              Session: {selectedClass.sessionStart} – {selectedClass.sessionEnd} (interval {selectedClass.intervalTime})
            </p>

            <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: '0.85rem' }}>Class Teacher *</label>
            <select
              value={selectedClass.classTeacherId || ''}
              onChange={e => assignClassTeacher(e.target.value)}
              style={{ maxWidth: 320, width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: 8 }}>
              <option value="">Select class teacher</option>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.fullName}</option>)}
            </select>
          </div>

          <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 12px' }}>Weekly Subjects</h3>
            {!selectedClass.classTeacherId && (
              <p style={{ color: '#dc2626' }}>Assign a class teacher above before building the timetable.</p>
            )}

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: 8 }}>Subject</th>
                    {DAYS.map(d => <th key={d} style={{ padding: 8, textAlign: 'center' }}>{d.slice(0, 3)}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {subjects.map(subject => (
                    <tr key={subject.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                      <td style={{ padding: 8, fontWeight: 500 }}>
                        {subject.subjectName}
                        {subject.nameSinhala && <span style={{ color: '#94a3b8' }}> ({subject.nameSinhala})</span>}
                      </td>
                      {DAYS.map(day => {
                        const cell = grid[day]?.[subject.id];
                        const isEnglishException = isGrade5 && englishSubject?.id === subject.id;
                        return (
                          <td key={day} style={{ padding: 8, textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={!!cell?.checked}
                              disabled={!selectedClass.classTeacherId}
                              onChange={() => toggleCell(day, subject.id)}
                            />
                            {cell?.checked && isEnglishException && (
                              <select
                                style={{ display: 'block', margin: '4px auto 0', fontSize: 12 }}
                                value={cell.teacherId || ''}
                                onChange={e => setCellTeacher(day, subject.id, e.target.value)}>
                                <option value="">Class teacher</option>
                                {teachers.map(t => <option key={t.id} value={t.id}>{t.fullName}</option>)}
                              </select>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              disabled={saving || !selectedClass.classTeacherId}
              onClick={saveTimetable}
              style={{
                marginTop: 16, background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: 'white',
                border: 'none', borderRadius: 9, padding: '11px 24px', fontWeight: 700,
                cursor: saving || !selectedClass.classTeacherId ? 'not-allowed' : 'pointer',
                opacity: saving || !selectedClass.classTeacherId ? 0.6 : 1,
              }}>
              {saving ? '⏳ Saving...' : '💾 Save Timetable'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}