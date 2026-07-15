import { useEffect, useState } from 'react';
import API from '../../../api/axios';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday'];
const TIMES = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00'];

export default function ScheduleManagement() {
  const [classes,   setClasses]   = useState([]);
  const [teachers,  setTeachers]  = useState([]);
  const [subjects,  setSubjects]  = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [msg,       setMsg]       = useState({ type:'', text:'' });

  const [form, setForm] = useState({
    classId:'', teacherId:'', subjectId:'',
    day:'Monday', startTime:'08:00', endTime:'09:00', room:''
  });
  const [editId, setEditId] = useState(null);
  const [filterClass, setFilterClass] = useState('');

  useEffect(() => {
    Promise.all([
      API.get('/classes'),
      API.get('/teachers'),
      API.get('/subjects'),
      API.get('/schedules'),
    ]).then(([c,t,s,sc]) => {
      setClasses(c.data  || []);
      setTeachers(t.data || []);
      setSubjects(s.data || []);
      setSchedules(sc.data || []);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const upd = (f,v) => setForm(p => ({...p,[f]:v}));

  const showMsg = (type, text) => {
    setMsg({type,text});
    setTimeout(() => setMsg({type:'',text:''}), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.classId || !form.teacherId || !form.subjectId) {
      showMsg('error','Please fill all required fields.'); return;
    }
    setSaving(true);
    try {
      const payload = {
        classId:   parseInt(form.classId),
        teacherId: parseInt(form.teacherId),
        subjectId: parseInt(form.subjectId),
        day:       form.day,
        startTime: form.startTime,
        endTime:   form.endTime,
        room:      form.room,
      };
      if (editId) {
        await API.put(`/schedules/${editId}`, payload);
        setSchedules(p => p.map(s => s.id === editId ? {...s,...payload} : s));
        showMsg('success','Schedule updated!');
      } else {
        const res = await API.post('/schedules', payload);
        setSchedules(p => [...p, res.data.data || res.data]);
        showMsg('success','Schedule added!');
      }
      setForm({ classId:'', teacherId:'', subjectId:'', day:'Monday', startTime:'08:00', endTime:'09:00', room:'' });
      setEditId(null);
      // Refresh
      API.get('/schedules').then(r => setSchedules(r.data || []));
    } catch(err) {
      showMsg('error', err.response?.data?.message || 'Failed to save.');
    } finally { setSaving(false); }
  };

  const handleEdit = (s) => {
    setEditId(s.id);
    setForm({
      classId:   String(s.classId),
      teacherId: String(s.teacherId),
      subjectId: String(s.subjectId),
      day:       s.day,
      startTime: s.startTime?.slice(0,5) || '08:00',
      endTime:   s.endTime?.slice(0,5)   || '09:00',
      room:      s.room || '',
    });
    window.scrollTo({top:0,behavior:'smooth'});
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this schedule?')) return;
    try {
      await API.delete(`/schedules/${id}`);
      setSchedules(p => p.filter(s => s.id !== id));
      showMsg('success','Deleted!');
    } catch { showMsg('error','Delete failed.'); }
  };

  const handleAssignTeacher = async (classId, teacherId) => {
    try {
      await API.put(`/classes/${classId}`, { teacherId: parseInt(teacherId) });
      setClasses(p => p.map(c => c.id === parseInt(classId) ? {...c, teacherId: parseInt(teacherId)} : c));
      showMsg('success','Teacher assigned to class!');
    } catch { showMsg('error','Failed to assign teacher.'); }
  };

  const filtered = filterClass
    ? schedules.filter(s => String(s.classId) === filterClass)
    : schedules;

  const getClassName  = id => { const c = classes.find(x=>x.id===id);  return c ? (c.displayName||c.className+' '+c.section) : '—'; };
  const getTeacherName= id => { const t = teachers.find(x=>x.id===id); return t ? t.fullName : '—'; };
  const getSubjectName= id => { const s = subjects.find(x=>x.id===id); return s ? s.subjectName : '—'; };

  if (loading) return <div style={{textAlign:'center',padding:'60px',color:'#94a3b8'}}>⏳ Loading...</div>;

  return (
    <div>
      <div style={{marginBottom:'24px'}}>
        <h1 style={{margin:'0 0 4px',fontSize:'1.6rem',fontWeight:'800',color:'#1e3a5f'}}>📅 Schedule Management</h1>
        <p style={{margin:0,color:'#64748b',fontSize:'0.9rem'}}>Assign teachers to classes and manage timetables.</p>
      </div>

      {msg.text && (
        <div style={{
          background: msg.type==='success' ? '#dcfce7' : '#fee2e2',
          color:      msg.type==='success' ? '#15803d' : '#b91c1c',
          borderLeft: `4px solid ${msg.type==='success'?'#16a34a':'#dc2626'}`,
          borderRadius:'10px', padding:'12px 16px', marginBottom:'18px', fontWeight:'600'
        }}>{msg.type==='success'?'✅':'❌'} {msg.text}</div>
      )}

      {/* ── Assign Teacher to Class ── */}
      <div style={{background:'white',borderRadius:'16px',padding:'24px',boxShadow:'0 2px 12px rgba(0,0,0,0.06)',marginBottom:'24px'}}>
        <h2 style={{margin:'0 0 18px',fontSize:'1rem',fontWeight:'700',color:'#1e3a5f'}}>👨‍🏫 Assign Class Teachers</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:'12px'}}>
          {classes.map(cls => {
            const displayName = cls.displayName || cls.className+' '+cls.section;
            return (
              <div key={cls.id} style={{background:'#f8fafc',borderRadius:'10px',padding:'14px',border:'1px solid #e2e8f0'}}>
                <div style={{fontWeight:'700',color:'#1e3a5f',marginBottom:'8px',fontSize:'0.9rem'}}>🏫 {displayName}</div>
                <select
                  defaultValue={cls.teacherId || ''}
                  onChange={e => handleAssignTeacher(cls.id, e.target.value)}
                  style={{width:'100%',padding:'8px 10px',border:'1px solid #e2e8f0',borderRadius:'8px',fontSize:'0.875rem',background:'white'}}
                >
                  <option value="">— No Teacher —</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.fullName} ({t.subject})</option>)}
                </select>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Add / Edit Schedule ── */}
      <div style={{background:'white',borderRadius:'16px',padding:'24px',boxShadow:'0 2px 12px rgba(0,0,0,0.06)',marginBottom:'24px'}}>
        <h2 style={{margin:'0 0 18px',fontSize:'1rem',fontWeight:'700',color:'#1e3a5f'}}>
          {editId ? '✏️ Edit Schedule' : '➕ Add Schedule'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:'14px',marginBottom:'14px'}}>
            <div>
              <label style={{display:'block',fontWeight:'600',color:'#374151',marginBottom:'5px',fontSize:'0.85rem'}}>Class *</label>
              <select value={form.classId} onChange={e=>upd('classId',e.target.value)} required
                style={{width:'100%',padding:'9px 12px',border:'1px solid #e2e8f0',borderRadius:'8px',fontSize:'0.875rem'}}>
                <option value="">Select Class</option>
                {classes.map(c=><option key={c.id} value={c.id}>{c.displayName||c.className+' '+c.section}</option>)}
              </select>
            </div>
            <div>
              <label style={{display:'block',fontWeight:'600',color:'#374151',marginBottom:'5px',fontSize:'0.85rem'}}>Teacher *</label>
              <select value={form.teacherId} onChange={e=>upd('teacherId',e.target.value)} required
                style={{width:'100%',padding:'9px 12px',border:'1px solid #e2e8f0',borderRadius:'8px',fontSize:'0.875rem'}}>
                <option value="">Select Teacher</option>
                {teachers.map(t=><option key={t.id} value={t.id}>{t.fullName}</option>)}
              </select>
            </div>
            <div>
              <label style={{display:'block',fontWeight:'600',color:'#374151',marginBottom:'5px',fontSize:'0.85rem'}}>Subject *</label>
              <select value={form.subjectId} onChange={e=>upd('subjectId',e.target.value)} required
                style={{width:'100%',padding:'9px 12px',border:'1px solid #e2e8f0',borderRadius:'8px',fontSize:'0.875rem'}}>
                <option value="">Select Subject</option>
                {subjects.map(s=><option key={s.id} value={s.id}>{s.subjectName}</option>)}
              </select>
            </div>
            <div>
              <label style={{display:'block',fontWeight:'600',color:'#374151',marginBottom:'5px',fontSize:'0.85rem'}}>Day</label>
              <select value={form.day} onChange={e=>upd('day',e.target.value)}
                style={{width:'100%',padding:'9px 12px',border:'1px solid #e2e8f0',borderRadius:'8px',fontSize:'0.875rem'}}>
                {DAYS.map(d=><option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label style={{display:'block',fontWeight:'600',color:'#374151',marginBottom:'5px',fontSize:'0.85rem'}}>Start Time</label>
              <select value={form.startTime} onChange={e=>upd('startTime',e.target.value)}
                style={{width:'100%',padding:'9px 12px',border:'1px solid #e2e8f0',borderRadius:'8px',fontSize:'0.875rem'}}>
                {TIMES.map(t=><option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{display:'block',fontWeight:'600',color:'#374151',marginBottom:'5px',fontSize:'0.85rem'}}>End Time</label>
              <select value={form.endTime} onChange={e=>upd('endTime',e.target.value)}
                style={{width:'100%',padding:'9px 12px',border:'1px solid #e2e8f0',borderRadius:'8px',fontSize:'0.875rem'}}>
                {TIMES.map(t=><option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{display:'block',fontWeight:'600',color:'#374151',marginBottom:'5px',fontSize:'0.85rem'}}>Room</label>
              <input value={form.room} onChange={e=>upd('room',e.target.value)} placeholder="e.g. R101"
                style={{width:'100%',padding:'9px 12px',border:'1px solid #e2e8f0',borderRadius:'8px',fontSize:'0.875rem',boxSizing:'border-box'}}/>
            </div>
          </div>
          <div style={{display:'flex',gap:'10px'}}>
            <button type="submit" disabled={saving} style={{
              background:'linear-gradient(135deg,#2563eb,#1d4ed8)',color:'white',
              border:'none',borderRadius:'9px',padding:'11px 24px',fontWeight:'700',cursor:'pointer',
              opacity:saving?0.7:1
            }}>{saving?'⏳ Saving...': editId?'💾 Update':'➕ Add Schedule'}</button>
            {editId && (
              <button type="button" onClick={()=>{setEditId(null);setForm({classId:'',teacherId:'',subjectId:'',day:'Monday',startTime:'08:00',endTime:'09:00',room:''}); }} style={{
                background:'white',border:'1px solid #e2e8f0',borderRadius:'9px',
                padding:'11px 20px',fontWeight:'600',cursor:'pointer',color:'#64748b'
              }}>Cancel</button>
            )}
          </div>
        </form>
      </div>

      {/* ── Schedule Table ── */}
      <div style={{background:'white',borderRadius:'16px',overflow:'hidden',boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
        <div style={{padding:'18px 20px',borderBottom:'1px solid #f1f5f9',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'12px'}}>
          <h2 style={{margin:0,fontSize:'1rem',fontWeight:'700',color:'#1e3a5f'}}>📋 All Schedules ({filtered.length})</h2>
          <select value={filterClass} onChange={e=>setFilterClass(e.target.value)}
            style={{padding:'8px 12px',border:'1px solid #e2e8f0',borderRadius:'8px',fontSize:'0.875rem',minWidth:'160px'}}>
            <option value="">All Classes</option>
            {classes.map(c=><option key={c.id} value={c.id}>{c.displayName||c.className+' '+c.section}</option>)}
          </select>
        </div>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead style={{background:'linear-gradient(135deg,#1e3a5f,#2563eb)'}}>
              <tr>
                {['#','Class','Teacher','Subject','Day','Time','Room','Actions'].map(h=>(
                  <th key={h} style={{padding:'13px 16px',textAlign:'left',color:'white',fontSize:'0.83rem',fontWeight:'600'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="8" style={{padding:'40px',textAlign:'center',color:'#94a3b8'}}>No schedules yet. Add one above.</td></tr>
              ) : filtered.map((s,i) => (
                <tr key={s.id} style={{borderBottom:'1px solid #f1f5f9'}}>
                  <td style={{padding:'12px 16px',color:'#94a3b8',fontSize:'0.85rem'}}>{i+1}</td>
                  <td style={{padding:'12px 16px'}}>
                    <span style={{background:'#eff6ff',color:'#2563eb',borderRadius:'6px',padding:'3px 10px',fontSize:'0.8rem',fontWeight:'600'}}>
                      {s.className || getClassName(s.classId)}
                    </span>
                  </td>
                  <td style={{padding:'12px 16px',fontWeight:'600',color:'#1e293b',fontSize:'0.875rem'}}>{s.teacherName || getTeacherName(s.teacherId)}</td>
                  <td style={{padding:'12px 16px',color:'#475569',fontSize:'0.875rem'}}>{s.subjectName || getSubjectName(s.subjectId)}</td>
                  <td style={{padding:'12px 16px'}}>
                    <span style={{background:'#f0fdf4',color:'#16a34a',borderRadius:'6px',padding:'3px 10px',fontSize:'0.8rem',fontWeight:'600'}}>{s.day}</span>
                  </td>
                  <td style={{padding:'12px 16px',color:'#64748b',fontSize:'0.85rem'}}>
                    {s.startTime?.slice(0,5)} – {s.endTime?.slice(0,5)}
                  </td>
                  <td style={{padding:'12px 16px',color:'#64748b',fontSize:'0.85rem'}}>{s.room || '—'}</td>
                  <td style={{padding:'12px 16px'}}>
                    <div style={{display:'flex',gap:'6px'}}>
                      <button onClick={()=>handleEdit(s)} style={{
                        background:'linear-gradient(135deg,#f59e0b,#d97706)',color:'white',
                        border:'none',borderRadius:'7px',padding:'6px 12px',cursor:'pointer',fontSize:'0.8rem',fontWeight:'600'
                      }}>✏️ Edit</button>
                      <button onClick={()=>handleDelete(s.id)} style={{
                        background:'linear-gradient(135deg,#dc2626,#b91c1c)',color:'white',
                        border:'none',borderRadius:'7px',padding:'6px 12px',cursor:'pointer',fontSize:'0.8rem',fontWeight:'600'
                      }}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}