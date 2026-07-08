import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import API from '../../api/axios';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [marks,    setMarks]    = useState([]);
  const [requests, setRequests] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([
      API.get('/marks/student/1'),
      API.get('/requests/student/1'),
      API.get('/attendance/student/1'),
    ]).then(([m, r, a]) => {
      setMarks(m.data);
      setRequests(r.data);
      setAttendance(a.data);
    }).catch(() => {
      setMarks([
        { id: 1, subjectName: 'Mathematics', marks: 85, grade: 'A'  },
        { id: 2, subjectName: 'Science',     marks: 72, grade: 'B'  },
        { id: 3, subjectName: 'English',     marks: 90, grade: 'A+' },
        { id: 4, subjectName: 'History',     marks: 68, grade: 'C'  },
      ]);
    }).finally(() => setLoading(false));
  }, []);

  const total   = attendance.length || 10;
  const present = attendance.filter(a => a.status === 'Present').length || 9;
  const attPct  = Math.round((present / total) * 100) || 90;
  const avgMark = marks.length > 0 ? Math.round(marks.reduce((s, m) => s + m.marks, 0) / marks.length) : 0;
  const overallGrade = avgMark >= 90 ? 'A+' : avgMark >= 80 ? 'A' : avgMark >= 70 ? 'B' : avgMark >= 60 ? 'C' : 'D';
  const pendingReqs = requests.filter(r => r.status === 'Pending').length;

  const getGradeColor = (g) =>
    g?.startsWith('A') ? '#16a34a' : g?.startsWith('B') ? '#2563eb' : g?.startsWith('C') ? '#d97706' : '#dc2626';

  return (
    <div>
      {/* ===== WELCOME BANNER ===== */}
      <div style={{
        background: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 60%, #a78bfa 100%)',
        borderRadius: '20px', padding: '26px 30px', marginBottom: '24px',
        color: 'white', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '-30px', right: '-20px', width: '140px', height: '140px', background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '0.85rem', opacity: 0.8 }}>🎓 Student Dashboard</p>
            <h1 style={{ margin: '0 0 4px', fontSize: '1.6rem', fontWeight: '800', color: 'white' }}>
              {t('welcome')}, {user?.name}! 👋
            </h1>
            <p style={{ margin: 0, fontSize: '0.88rem', opacity: 0.8 }}>{new Date().toDateString()}</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {[
              { label: 'Attendance', value: `${attPct}%` },
              { label: 'Avg Marks',  value: `${avgMark}%` },
              { label: 'Grade',      value: overallGrade  },
            ].map(item => (
              <div key={item.label} style={{
                background: 'rgba(255,255,255,0.15)', borderRadius: '12px',
                padding: '10px 16px', textAlign: 'center', minWidth: '70px'
              }}>
                <div style={{ fontSize: '1.3rem', fontWeight: '800' }}>{item.value}</div>
                <div style={{ fontSize: '0.72rem', opacity: 0.8 }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== STAT CARDS ===== */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        {[
          { label: 'Attendance',     value: `${attPct}%`, icon: '✅', color: attPct >= 80 ? '#16a34a' : '#dc2626', bg: '#f0fdf4' },
          { label: 'Overall Grade',  value: overallGrade, icon: '🏆', color: getGradeColor(overallGrade), bg: '#eff6ff' },
          { label: 'Subjects',       value: marks.length || 6, icon: '📚', color: '#7c3aed', bg: '#faf5ff' },
          { label: 'My Requests',    value: requests.length,   icon: '📨', color: '#d97706', bg: '#fffbeb' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'white', borderRadius: '16px', padding: '18px',
            display: 'flex', alignItems: 'center', gap: '14px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderTop: `4px solid ${s.color}`
          }}>
            <div style={{
              width: '50px', height: '50px', borderRadius: '13px', background: s.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.4rem', flexShrink: 0
            }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: '600' }}>{s.label}</div>
              <div style={{ fontSize: '1.7rem', fontWeight: '800', color: s.color, lineHeight: 1.1 }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: '24px' }}>

        {/* Marks Card */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div className="flex-between" style={{ marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#1e3a5f' }}>📝 {t('recentMarks')}</h3>
            <Link to="/student/marks" style={{ fontSize: '0.8rem', color: '#2563eb', textDecoration: 'none', fontWeight: '600' }}>
              View All →
            </Link>
          </div>
          {(marks.length > 0 ? marks : [
            { id: 1, subjectName: 'Mathematics', marks: 85, grade: 'A'  },
            { id: 2, subjectName: 'Science',     marks: 72, grade: 'B'  },
            { id: 3, subjectName: 'English',     marks: 90, grade: 'A+' },
            { id: 4, subjectName: 'History',     marks: 68, grade: 'C'  },
          ]).slice(0, 5).map((m, i, arr) => (
            <div key={m.id} style={{ marginBottom: i < arr.length - 1 ? '14px' : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontWeight: '600', fontSize: '0.88rem', color: '#1e293b' }}>{m.subjectName}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>{m.marks}%</span>
                  <span style={{
                    background: `${getGradeColor(m.grade)}15`,
                    color: getGradeColor(m.grade),
                    padding: '2px 8px', borderRadius: '20px',
                    fontSize: '0.75rem', fontWeight: '700'
                  }}>{m.grade}</span>
                </div>
              </div>
              <div style={{ background: '#f1f5f9', borderRadius: '10px', height: '7px', overflow: 'hidden' }}>
                <div style={{
                  width: `${m.marks}%`, height: '100%', borderRadius: '10px',
                  background: m.marks >= 80 ? '#16a34a' : m.marks >= 60 ? '#2563eb' : '#d97706',
                  transition: 'width 0.6s ease'
                }} />
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
                { to: '/student/attendance', icon: '✅', label: t('viewAttendance'), bg: 'linear-gradient(135deg,#16a34a,#15803d)', shadow: 'rgba(22,163,74,0.25)'  },
                { to: '/student/marks',      icon: '📝', label: t('viewMyMarks'),   bg: 'linear-gradient(135deg,#2563eb,#1d4ed8)', shadow: 'rgba(37,99,235,0.25)'  },
                { to: '/student/schedule',   icon: '📅', label: t('classSchedule'), bg: 'linear-gradient(135deg,#7c3aed,#6d28d9)', shadow: 'rgba(124,58,237,0.25)' },
                { to: '/student/requests',   icon: '📨', label: t('submitRequest'), bg: 'linear-gradient(135deg,#d97706,#b45309)', shadow: 'rgba(217,119,6,0.25)'  },
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

          {/* Attendance Card */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 14px', fontSize: '1rem', fontWeight: '700', color: '#1e3a5f' }}>📊 Attendance</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '14px' }}>
              <div style={{
                width: '70px', height: '70px', borderRadius: '50%',
                background: attPct >= 80 ? '#dcfce7' : '#fee2e2',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: attPct >= 80 ? '#16a34a' : '#dc2626' }}>{attPct}%</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Attendance Rate</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: attPct >= 80 ? '#16a34a' : '#dc2626' }}>{attPct}%</span>
                  </div>
                  <div style={{ background: '#f1f5f9', borderRadius: '10px', height: '8px', overflow: 'hidden' }}>
                    <div style={{ width: `${attPct}%`, height: '100%', background: attPct >= 80 ? '#16a34a' : '#dc2626', borderRadius: '10px' }} />
                  </div>
                </div>
                <span className={`badge ${attPct >= 80 ? 'badge-green' : 'badge-red'}`}>
                  {attPct >= 80 ? '✅ Good Standing' : '⚠️ Needs Improvement'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== MY REQUESTS ===== */}
      {requests.length > 0 && (
        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div className="flex-between" style={{ marginBottom: '14px' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#1e3a5f' }}>
              📨 My Requests
              {pendingReqs > 0 && <span className="badge badge-yellow" style={{ marginLeft: '10px' }}>{pendingReqs} pending</span>}
            </h3>
            <Link to="/student/requests" style={{ fontSize: '0.8rem', color: '#2563eb', textDecoration: 'none', fontWeight: '600' }}>
              View All →
            </Link>
          </div>
          {requests.slice(0, 3).map((r, i, arr) => (
            <div key={r.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid #f1f5f9' : 'none',
              flexWrap: 'wrap', gap: '8px'
            }}>
              <div>
                <strong style={{ fontSize: '0.88rem' }}>{r.type}</strong>
                <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                  {r.message?.slice(0, 50)}{r.message?.length > 50 ? '...' : ''}
                </p>
              </div>
              <span className={`badge ${r.status === 'Pending' ? 'badge-yellow' : r.status === 'Approved' ? 'badge-green' : 'badge-red'}`}>
                {r.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}