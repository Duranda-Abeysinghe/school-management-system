import { useEffect, useState } from 'react';
import API from '../../../api/axios';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function ScheduleList() {
  const [schedules, setSchedules] = useState([]);
  const [classes,   setClasses]   = useState([]);
  const [subjects,  setSubjects]  = useState([]);
  const [teachers,  setTeachers]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error,     setError]     = useState('');

  const emptyForm = { classId: '', subjectId: '', teacherId: '', day: 'Monday', startTime: '08:00', endTime: '09:00', room: '' };
  const [form, setForm] = useState(emptyForm);

  const loadAll = () => {
    setLoading(true);
    Promise.all([
      API.get('/schedules'),
      API.get('/classes'),
      API.get('/subjects'),
      API.get('/teachers'),
    ]).then(([sc, cl, su, te]) => {
      setSchedules(sc.data);
      setClasses(cl.data);
      setSubjects(su.data);
      setTeachers(te.data);
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(loadAll, []);

  const openAdd = () => { setForm(emptyForm); setEditingId(null); setShowForm(true); setError(''); };
  const openEdit = (s) => {
    setForm({
      classId: s.classId ?? '', subjectId: s.subjectId ?? '', teacherId: s.teacherId ?? '',
      day: s.day, startTime: s.startTime, endTime: s.endTime, room: s.room
    });
    setEditingId(s.id);
    setShowForm(true);
    setError('');
  };

  const handleSubmit = async () => {
    if (!form.classId || !form.subjectId || !form.teacherId || !form.room) {
      setError('Please fill in all fields.');
      return;
    }
    const payload = {
      classId: parseInt(form.classId),
      subjectId: parseInt(form.subjectId),
      teacherId: parseInt(form.teacherId),
      day: form.day,
      startTime: form.startTime,
      endTime: form.endTime,
      room: form.room
    };
    try {
      if (editingId) await API.put(`/schedules/${editingId}`, payload);
      else await API.post('/schedules', payload);
      setShowForm(false);
      loadAll();
    } catch {
      setError('Failed to save schedule entry.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this schedule entry?')) return;
    await API.delete(`/schedules/${id}`);
    loadAll();
  };

  return (
    <div>
      <div className="page-header">
        <h1>📅 Class Schedule Management</h1>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Schedule Entry</button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3>{editingId ? 'Edit' : 'Add'} Schedule Entry</h3>
          {error && <div className="alert alert-error">❌ {error}</div>}
          <div className="grid-3">
            <div className="form-group">
              <label>Class</label>
              <select value={form.classId} onChange={e => setForm({ ...form, classId: e.target.value })}>
                <option value="">Select Class</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.className} {c.section}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Subject</label>
              <select value={form.subjectId} onChange={e => setForm({ ...form, subjectId: e.target.value })}>
                <option value="">Select Subject</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.subjectName}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Teacher</label>
              <select value={form.teacherId} onChange={e => setForm({ ...form, teacherId: e.target.value })}>
                <option value="">Select Teacher</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.fullName}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Day</label>
              <select value={form.day} onChange={e => setForm({ ...form, day: e.target.value })}>
                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Start Time</label>
              <input type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} />
            </div>
            <div className="form-group">
              <label>End Time</label>
              <input type="time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Room</label>
              <input type="text" placeholder="e.g. R101" value={form.room} onChange={e => setForm({ ...form, room: e.target.value })} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button className="btn btn-success" onClick={handleSubmit}>💾 Save</button>
            <button className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="card text-center"><p>Loading...</p></div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th><th>Day</th><th>Time</th><th>Class</th><th>Subject</th><th>Teacher</th><th>Room</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((s, i) => (
                <tr key={s.id}>
                  <td>{i + 1}</td>
                  <td><span className="badge badge-blue">{s.day}</span></td>
                  <td>{s.startTime} - {s.endTime}</td>
                  <td>{s.className}</td>
                  <td>{s.subjectName}</td>
                  <td>{s.teacherName}</td>
                  <td>{s.room}</td>
                  <td>
                    <button className="btn btn-outline btn-sm" onClick={() => openEdit(s)}>Edit</button>{' '}
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {schedules.length === 0 && (
                <tr><td colSpan="8" className="text-center" style={{ padding: '30px', color: '#94a3b8' }}>No schedule entries yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}