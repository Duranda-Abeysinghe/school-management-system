import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AnnouncementsWidget from './AnnouncementsWidget';
<AnnouncementsWidget role="Teacher" />
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import API from '../../api/axios';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [requests,  setRequests]  = useState([]);
  const [students,  setStudents]  = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([API.get('/requests'), API.get('/students')])
      .then(([r, s]) => { setRequests(r.data); setStudents(s.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const pendingRequests = requests.filter(r => r.status === 'Pending').length;

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div style={{ textAlign: 'center', color: '#94a3b8' }}>
          <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⏳</div>
          <p style={{ fontSize: '0.95rem' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const myClasses = [
    { name: 'Grade 10A', subject: 'Mathematics', students: 35, time: '8:00 AM',  day: 'Mon/Wed/Fri', color: '#2563eb' },
    { name: 'Grade 11B', subject: 'Mathematics', students: 28, time: '10:00 AM', day: 'Tue/Thu',     color: '#7c3aed' },
    { name: 'Grade 9C',  subject: 'Mathematics', students: 30, time: '1:00 PM',  day: 'Mon/Wed',     color: '#16a34a' },
  ];

  const todaySchedule = [
    { time: '8:00 AM',  class: 'Grade 10A', room: 'R101', subject: 'Mathematics' },
    { time: '10:00 AM', class: 'Grade 11B', room: 'R102', subject: 'Mathematics' },
    { time: '1:00 PM',  class: 'Grade 9C',  room: 'R103', subject: 'Mathematics' },
  ];

  return (
    <div>
      {/* ===== WELCOME BANNER ===== */}
      <div style={{
        background: 'linear-gradient(135deg, #064e3b 0%, #059669 60%, #10b981 100%)',
        borderRadius: '20px', padding: '26px 30px', marginBottom: '24px',
        color: 'white', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '150px', height: '150px', background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '0.85rem', opacity: 0.8 }}>
              👨‍🏫 {new Date().getHours() < 12 ? 'Good Morning' : 'Good Afternoon'}
            </p>
            <h1 style={{ margin: '0 0 4px', fontSize: '1.6rem', fontWeight: '800', color: 'white' }}>
              {user?.name}
            </h1>
            <p style={{ margin: 0, fontSize: '0.88rem', opacity: 0.8 }}>
              Teacher Panel · {new Date().toDateString()}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {[
              { label: 'Classes',  value: myClasses.length },
              { label: 'Students', value: students.length  },
              { label: 'Pending',  value: pendingRequests  },
            ].map(item => (
              <div key={item.label} style={{
                background: 'rgba(255,255,255,0.15)', borderRadius: '12px',
                padding: '10px 16px', textAlign: 'center', minWidth: '70px'
              }}>
                <div style={{ fontSize: '1.4rem', fontWeight: '800' }}>{item.value}</div>
                <div style={{ fontSize: '0.72rem', opacity: 0.8 }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== STAT CARDS ===== */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        {[
          { label: t('myClasses'),        value: myClasses.length, icon: '🏫', color: '#2563eb', bg: '#eff6ff' },
          { label: t('totalStudents'),    value: students.length,  icon: '🎓', color: '#16a34a', bg: '#f0fdf4' },
          { label: t('pendingRequests'),  value: pendingRequests,  icon: '📨', color: '#d97706', bg: '#fffbeb' },
          { label: 'Today Classes',       value: todaySchedule.length, icon: '📅', color: '#7c3aed', bg: '#faf5ff' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'white', borderRadius: '16px', padding: '18px',
            display: 'flex', alignItems: 'center', gap: '14px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderTop: `4px solid ${s.color}`
          }}>
            <div style={{
              width: '50px', height: '50px', borderRadius: '13px',
              background: s.bg, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0
            }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: '600' }}>{s.label}</div>
              <div style={{ fontSize: '1.7rem', fontWeight: '800', color: s.color, lineHeight: 1.1 }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: '24px' }}>

        {/* My Classes */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: '700', color: '#1e3a5f' }}>🏫 {t('myClasses')}</h3>
          {myClasses.map((c, i) => (
            <div key={c.name} style={{
              background: `${c.color}08`,
              border: `1px solid ${c.color}22`,
              borderRadius: '12px',
              padding: '14px 16px',
              marginBottom: i < myClasses.length - 1 ? '10px' : 0,
              borderLeft: `4px solid ${c.color}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <strong style={{ fontSize: '0.95rem', color: '#1e293b' }}>{c.name}</strong>
                <span style={{
                  background: `${c.color}15`, color: c.color,
                  padding: '3px 10px', borderRadius: '20px',
                  fontSize: '0.75rem', fontWeight: '600'
                }}>{c.subject}</span>
              </div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: '#64748b' }}>
                <span>👥 {c.students} students</span>
                <span>⏰ {c.time}</span>
                <span>📅 {c.day}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Quick Actions */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 14px', fontSize: '1rem', fontWeight: '700', color: '#1e3a5f' }}>⚡ {t('quickActions')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { to: '/teacher/attendance', icon: '✅', label: t('markAttendance'), bg: 'linear-gradient(135deg,#16a34a,#15803d)', shadow: 'rgba(22,163,74,0.25)'  },
                { to: '/teacher/marks',      icon: '📝', label: t('enterMarks'),    bg: 'linear-gradient(135deg,#2563eb,#1d4ed8)', shadow: 'rgba(37,99,235,0.25)'  },
                { to: '/teacher/requests',   icon: '📨', label: t('viewRequests'),  bg: 'linear-gradient(135deg,#d97706,#b45309)', shadow: 'rgba(217,119,6,0.25)'  },
                { to: '/teacher/schedule',   icon: '📅', label: t('mySchedule'),    bg: 'linear-gradient(135deg,#7c3aed,#6d28d9)', shadow: 'rgba(124,58,237,0.25)' },
              ].map(btn => (
                <Link key={btn.to} to={btn.to} style={{
                  background: btn.bg, color: 'white', textDecoration: 'none',
                  borderRadius: '10px', padding: '12px 16px',
                  display: 'flex', alignItems: 'center', gap: '10px',
                  fontSize: '0.88rem', fontWeight: '600',
                  boxShadow: `0 4px 12px ${btn.shadow}`,
                }}>
                  {btn.icon} {btn.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Today Schedule */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 14px', fontSize: '1rem', fontWeight: '700', color: '#1e3a5f' }}>📅 Today's Schedule</h3>
            {todaySchedule.map((s, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '8px 0', borderBottom: i < todaySchedule.length - 1 ? '1px solid #f1f5f9' : 'none'
              }}>
                <div style={{
                  background: '#eff6ff', color: '#2563eb',
                  borderRadius: '8px', padding: '6px 10px',
                  fontSize: '0.75rem', fontWeight: '700', flexShrink: 0, minWidth: '72px', textAlign: 'center'
                }}>{s.time}</div>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '0.87rem' }}>{s.class}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Room {s.room}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== PENDING REQUESTS ===== */}
      {requests.filter(r => r.status === 'Pending').length > 0 && (
        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div className="flex-between" style={{ marginBottom: '14px' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#1e3a5f' }}>
              📨 {t('pendingRequests')}
              <span className="badge badge-yellow" style={{ marginLeft: '10px' }}>
                {requests.filter(r => r.status === 'Pending').length}
              </span>
            </h3>
            <Link to="/teacher/requests" style={{ fontSize: '0.8rem', color: '#2563eb', textDecoration: 'none', fontWeight: '600' }}>
              View All →
            </Link>
          </div>
          {requests.filter(r => r.status === 'Pending').slice(0, 3).map((r, i, arr) => (
            <div key={r.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '11px 0', borderBottom: i < arr.length - 1 ? '1px solid #f1f5f9' : 'none',
              flexWrap: 'wrap', gap: '8px'
            }}>
              <div>
                <strong style={{ fontSize: '0.88rem' }}>{r.studentName}</strong>
                <span className="badge badge-purple" style={{ marginLeft: '8px', fontSize: '0.7rem' }}>{r.type}</span>
              </div>
              <span className="badge badge-yellow" style={{ fontSize: '0.72rem' }}>Pending</span>
            </div>
          ))}
        </div>
      )}
      {/* ANNOUNCEMENTS WIDGET */}
      <AnnouncementsWidget role="Teacher" />
    </div>
  );
}