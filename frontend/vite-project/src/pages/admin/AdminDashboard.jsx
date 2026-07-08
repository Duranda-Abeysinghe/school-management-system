import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import API from '../../api/axios';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [data, setData] = useState({
    students: [], teachers: [], announcements: [], requests: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      API.get('/students'),
      API.get('/teachers'),
      API.get('/announcements'),
      API.get('/requests'),
    ]).then(([s, tc, a, r]) => {
      setData({
        students:      s.data,
        teachers:      tc.data,
        announcements: a.data,
        requests:      r.data,
      });
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const activeStudents  = data.students.filter(s => s.status === 'Active').length;
  const pendingRequests = data.requests.filter(r => r.status === 'Pending').length;

  return (
    <div>

      {/* ===== WELCOME BANNER ===== */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 60%, #7c3aed 100%)',
        borderRadius: '20px',
        padding: '28px 32px',
        marginBottom: '24px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '-40px', right: '-40px',
          width: '180px', height: '180px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '50%'
        }} />
        <div style={{
          position: 'absolute', bottom: '-30px', right: '100px',
          width: '120px', height: '120px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '50%'
        }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '0.88rem', opacity: 0.75 }}>
              👋 Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}
            </p>
            <h1 style={{ margin: '0 0 6px', fontSize: '1.7rem', fontWeight: '800', color: 'white' }}>
              {user?.name} 🏫
            </h1>
            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>
              Admin Panel · Olcott Primary School Management System
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{
              background: 'rgba(255,255,255,0.12)',
              borderRadius: '12px', padding: '12px 18px', textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.4rem', fontWeight: '800' }}>{data.students.length}</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Students</div>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.12)',
              borderRadius: '12px', padding: '12px 18px', textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.4rem', fontWeight: '800' }}>{data.teachers.length}</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Teachers</div>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.12)',
              borderRadius: '12px', padding: '12px 18px', textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.4rem', fontWeight: '800' }}>{pendingRequests}</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Pending</div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card text-center" style={{ padding: '50px' }}>
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⏳</div>
          <p style={{ color: '#94a3b8' }}>{t('loading')}</p>
        </div>
      ) : (
        <>
          {/* ===== STAT CARDS ===== */}
          <div className="stats-grid" style={{ marginBottom: '24px' }}>
            {[
              { label: t('totalStudents'), value: data.students.length, sub: `${activeStudents} active`, icon: '🎓', color: '#2563eb', bg: '#eff6ff', link: '/admin/students' },
              { label: t('totalTeachers'), value: data.teachers.length, sub: `${data.teachers.filter(t=>t.status==='Active').length} active`, icon: '👨‍🏫', color: '#16a34a', bg: '#f0fdf4', link: '/admin/teachers' },
              { label: t('announcements'), value: data.announcements.length, sub: 'Total posted', icon: '📢', color: '#7c3aed', bg: '#faf5ff', link: '/admin/announcements' },
              { label: 'Pending Requests', value: pendingRequests, sub: 'Need attention', icon: '📨', color: '#d97706', bg: '#fffbeb', link: '/admin/students' },
            ].map(s => (
              <Link key={s.label} to={s.link} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  borderTop: `4px solid ${s.color}`,
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                }}>
                  <div style={{
                    width: '54px', height: '54px',
                    borderRadius: '14px',
                    background: s.bg,
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem', flexShrink: 0
                  }}>{s.icon}</div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: '600', marginBottom: '3px' }}>{s.label}</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '800', color: s.color, lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '3px' }}>{s.sub}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* ===== MIDDLE SECTION ===== */}
          <div className="grid-2" style={{ marginBottom: '24px' }}>

            {/* Students List */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <div className="flex-between" style={{ marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#1e3a5f' }}>
                  🎓 {t('recentStudents')}
                </h3>
                <Link to="/admin/students" style={{ fontSize: '0.8rem', color: '#2563eb', textDecoration: 'none', fontWeight: '600' }}>
                  View All →
                </Link>
              </div>
              {data.students.slice(0, 6).map((s, i) => (
                <div key={s.id} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '10px 0',
                  borderBottom: i < 5 ? '1px solid #f1f5f9' : 'none'
                }}>
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '50%',
                    background: `hsl(${i * 40 + 200}, 70%, 55%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: '700', fontSize: '0.9rem', flexShrink: 0
                  }}>{s.fullName?.[0]}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '600', fontSize: '0.9rem', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.fullName}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{s.admissionNo}</div>
                  </div>
                  <span className={`badge ${s.status === 'Active' ? 'badge-green' : 'badge-red'}`} style={{ fontSize: '0.7rem' }}>
                    {s.status === 'Active' ? t('active') : t('inactive')}
                  </span>
                </div>
              ))}
              {data.students.length === 0 && (
                <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🎓</div>
                  <p>No students yet</p>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

              {/* Quick Actions */}
              <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <h3 style={{ margin: '0 0 14px', fontSize: '1rem', fontWeight: '700', color: '#1e3a5f' }}>⚡ {t('quickActions')}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {[
                    { to: '/admin/students/add', icon: '🎓', label: t('addStudent'),       bg: 'linear-gradient(135deg,#2563eb,#1d4ed8)', shadow: 'rgba(37,99,235,0.3)' },
                    { to: '/admin/teachers/add', icon: '👨‍🏫', label: t('addTeacher'),       bg: 'linear-gradient(135deg,#16a34a,#15803d)', shadow: 'rgba(22,163,74,0.3)'  },
                    { to: '/admin/announcements',icon: '📢', label: 'Announce',            bg: 'linear-gradient(135deg,#7c3aed,#6d28d9)', shadow: 'rgba(124,58,237,0.3)' },
                    { to: '/admin/reports',      icon: '📊', label: t('viewReports'),      bg: 'linear-gradient(135deg,#d97706,#b45309)', shadow: 'rgba(217,119,6,0.3)'  },
                  ].map(btn => (
                    <Link key={btn.to} to={btn.to} style={{
                      background: btn.bg,
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '10px',
                      padding: '12px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '7px',
                      fontSize: '0.82rem',
                      fontWeight: '600',
                      boxShadow: `0 4px 12px ${btn.shadow}`,
                      transition: 'all 0.2s',
                    }}>
                      {btn.icon} {btn.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Attendance */}
              <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <h3 style={{ margin: '0 0 14px', fontSize: '1rem', fontWeight: '700', color: '#1e3a5f' }}>📈 Attendance Overview</h3>
                {[
                  { label: 'Grade 10A', pct: 92, color: '#16a34a' },
                  { label: 'Grade 11B', pct: 78, color: '#d97706' },
                  { label: 'Grade 9A',  pct: 85, color: '#2563eb' },
                  { label: 'Grade 11A', pct: 95, color: '#16a34a' },
                ].map(item => (
                  <div key={item.label} style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ fontSize: '0.83rem', color: '#64748b', fontWeight: '500' }}>{item.label}</span>
                      <span style={{ fontSize: '0.83rem', fontWeight: '700', color: item.color }}>{item.pct}%</span>
                    </div>
                    <div style={{ background: '#f1f5f9', borderRadius: '10px', height: '7px', overflow: 'hidden' }}>
                      <div style={{ width: `${item.pct}%`, height: '100%', background: item.color, borderRadius: '10px', transition: 'width 0.6s ease' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ===== ANNOUNCEMENTS ===== */}
          {data.announcements.length > 0 && (
            <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: '18px' }}>
              <div className="flex-between" style={{ marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#1e3a5f' }}>📢 Recent {t('announcements')}</h3>
                <Link to="/admin/announcements" style={{ fontSize: '0.8rem', color: '#2563eb', textDecoration: 'none', fontWeight: '600' }}>View All →</Link>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
                {data.announcements.slice(0, 3).map(a => (
                  <div key={a.id} style={{
                    background: a.priority === 'High' ? '#fff5f5' : a.priority === 'Urgent' ? '#faf5ff' : '#f0f9ff',
                    borderRadius: '12px', padding: '14px',
                    borderLeft: `3px solid ${a.priority === 'High' ? '#dc2626' : a.priority === 'Urgent' ? '#7c3aed' : '#2563eb'}`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', alignItems: 'center' }}>
                      <strong style={{ fontSize: '0.88rem', color: '#1e293b' }}>{a.title}</strong>
                      <span className={`badge ${a.priority === 'High' ? 'badge-red' : a.priority === 'Urgent' ? 'badge-purple' : 'badge-blue'}`} style={{ fontSize: '0.68rem' }}>
                        {a.priority}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
                      {a.message?.length > 80 ? a.message.slice(0, 80) + '...' : a.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== PENDING REQUESTS ===== */}
          {pendingRequests > 0 && (
            <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <div className="flex-between" style={{ marginBottom: '14px' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#1e3a5f' }}>
                  📨 Pending Requests
                  <span className="badge badge-yellow" style={{ marginLeft: '10px' }}>{pendingRequests}</span>
                </h3>
              </div>
              {data.requests.filter(r => r.status === 'Pending').slice(0, 4).map((r, i, arr) => (
                <div key={r.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '11px 0', borderBottom: i < arr.length - 1 ? '1px solid #f1f5f9' : 'none', flexWrap: 'wrap', gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b', flexShrink: 0 }} />
                    <div>
                      <strong style={{ fontSize: '0.88rem' }}>{r.studentName || 'Student'}</strong>
                      <span className="badge badge-purple" style={{ marginLeft: '8px', fontSize: '0.7rem' }}>{r.type}</span>
                    </div>
                  </div>
                  <span className="badge badge-yellow" style={{ fontSize: '0.72rem' }}>Pending</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}