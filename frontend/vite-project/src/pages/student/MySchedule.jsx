import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday'];

export default function MySchedule() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [activeDay, setActiveDay] = useState(
    DAYS[new Date().getDay() - 1] || 'Monday'
  );

  useEffect(() => {
    // For students: get schedule by their classId
    // For teachers: get schedule by their teacherId
    const endpoint = user?.role === 'Teacher'
      ? `/schedules/teacher/${user.id}`
      : `/schedules/class/${user?.classId || 1}`;

    API.get(endpoint)
      .then(r => setSchedules(r.data || []))
      .catch(() => {
        // Fallback: get all schedules
        API.get('/schedules')
          .then(r => setSchedules(r.data || []))
          .catch(() => setSchedules([]));
      })
      .finally(() => setLoading(false));
  }, [user]);

  const daySchedule = schedules
    .filter(s => s.day === activeDay)
    .sort((a,b) => (a.startTime||'').localeCompare(b.startTime||''));

  const subjectColors = ['#2563eb','#16a34a','#7c3aed','#d97706','#dc2626','#0891b2','#be185d'];

  return (
    <div>
      <div style={{marginBottom:'24px'}}>
        <h1 style={{margin:'0 0 4px',fontSize:'1.6rem',fontWeight:'800',color:'#1e3a5f'}}>📅 Class Schedule</h1>
        <p style={{margin:0,color:'#64748b',fontSize:'0.9rem'}}>Your weekly timetable.</p>
      </div>

      {/* Day Tabs */}
      <div style={{background:'white',borderRadius:'16px',padding:'16px 20px',boxShadow:'0 2px 12px rgba(0,0,0,0.06)',marginBottom:'20px'}}>
        <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
          {DAYS.map(day => {
            const count = schedules.filter(s=>s.day===day).length;
            const isToday = DAYS[new Date().getDay()-1] === day;
            return (
              <button key={day} onClick={()=>setActiveDay(day)} style={{
                padding:'10px 18px', borderRadius:'10px', border:'none', cursor:'pointer',
                fontWeight:'700', fontSize:'0.875rem', transition:'all 0.2s',
                background: activeDay===day ? 'linear-gradient(135deg,#2563eb,#1d4ed8)' : isToday ? '#eff6ff' : '#f8fafc',
                color: activeDay===day ? 'white' : isToday ? '#2563eb' : '#64748b',
                boxShadow: activeDay===day ? '0 4px 12px rgba(37,99,235,0.3)' : 'none',
                position:'relative',
              }}>
                {day}
                {count > 0 && (
                  <span style={{
                    marginLeft:'6px', background: activeDay===day ? 'rgba(255,255,255,0.3)' : '#dbeafe',
                    color: activeDay===day ? 'white' : '#2563eb',
                    borderRadius:'20px', padding:'1px 7px', fontSize:'0.72rem', fontWeight:'700'
                  }}>{count}</span>
                )}
                {isToday && activeDay!==day && (
                  <span style={{position:'absolute',top:'4px',right:'4px',width:'6px',height:'6px',background:'#16a34a',borderRadius:'50%'}}/>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Schedule for selected day */}
      {loading ? (
        <div style={{background:'white',borderRadius:'16px',padding:'60px',textAlign:'center',boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
          <div style={{fontSize:'2rem',marginBottom:'10px'}}>⏳</div>
          <p style={{color:'#94a3b8'}}>Loading schedule...</p>
        </div>
      ) : daySchedule.length === 0 ? (
        <div style={{background:'white',borderRadius:'16px',padding:'60px',textAlign:'center',boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
          <div style={{fontSize:'2.5rem',marginBottom:'12px'}}>📭</div>
          <h3 style={{color:'#1e3a5f',marginBottom:'6px'}}>No classes on {activeDay}</h3>
          <p style={{color:'#94a3b8',fontSize:'0.875rem'}}>Enjoy your free day!</p>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
          {daySchedule.map((s, i) => {
            const color = subjectColors[i % subjectColors.length];
            return (
              <div key={s.id} style={{
                background:'white', borderRadius:'14px', padding:'20px 22px',
                boxShadow:'0 2px 12px rgba(0,0,0,0.06)',
                borderLeft:`4px solid ${color}`,
                display:'flex', alignItems:'center', gap:'18px', flexWrap:'wrap'
              }}>
                <div style={{
                  background:`${color}15`, borderRadius:'10px', padding:'10px 14px',
                  textAlign:'center', minWidth:'80px', flexShrink:0
                }}>
                  <div style={{fontSize:'0.8rem',color:color,fontWeight:'700'}}>{s.startTime?.slice(0,5)}</div>
                  <div style={{fontSize:'0.7rem',color:'#94a3b8',margin:'3px 0'}}>to</div>
                  <div style={{fontSize:'0.8rem',color:color,fontWeight:'700'}}>{s.endTime?.slice(0,5)}</div>
                </div>
                <div style={{flex:1,minWidth:'150px'}}>
                  <div style={{fontWeight:'800',fontSize:'1rem',color:'#1e293b',marginBottom:'4px'}}>
                    {s.subjectName || '—'}
                  </div>
                  <div style={{display:'flex',gap:'10px',flexWrap:'wrap',fontSize:'0.82rem',color:'#64748b'}}>
                    <span>👨‍🏫 {s.teacherName || '—'}</span>
                    <span>🏫 {s.className || '—'}</span>
                    {s.room && <span>🚪 Room {s.room}</span>}
                  </div>
                </div>
                <div style={{
                  background:`${color}15`, color:color,
                  borderRadius:'8px', padding:'6px 14px',
                  fontSize:'0.8rem', fontWeight:'700', flexShrink:0
                }}>
                  {s.subjectName?.slice(0,3).toUpperCase() || 'SUB'}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Weekly overview */}
      {schedules.length > 0 && (
        <div style={{background:'white',borderRadius:'16px',padding:'20px',boxShadow:'0 2px 12px rgba(0,0,0,0.06)',marginTop:'20px'}}>
          <h3 style={{margin:'0 0 14px',fontSize:'1rem',fontWeight:'700',color:'#1e3a5f'}}>📊 Weekly Overview</h3>
          <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'8px'}}>
            {DAYS.map(day => {
              const count = schedules.filter(s=>s.day===day).length;
              const isToday = DAYS[new Date().getDay()-1] === day;
              return (
                <div key={day} onClick={()=>setActiveDay(day)} style={{
                  background: isToday ? '#eff6ff' : '#f8fafc',
                  borderRadius:'10px', padding:'12px 8px', textAlign:'center',
                  cursor:'pointer', border: activeDay===day ? '2px solid #2563eb' : '2px solid transparent',
                  transition:'all 0.2s'
                }}>
                  <div style={{fontSize:'0.75rem',fontWeight:'700',color:'#64748b',marginBottom:'6px'}}>{day.slice(0,3)}</div>
                  <div style={{fontSize:'1.4rem',fontWeight:'800',color: count>0 ? '#2563eb' : '#94a3b8'}}>{count}</div>
                  <div style={{fontSize:'0.7rem',color:'#94a3b8'}}>classes</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}