import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import API from '../../api/axios';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function Schedule() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔧 assumes user.teacherId exists on the logged-in user object — confirm/adjust
  const teacherId = user?.teacherId;

  useEffect(() => {
    if (!teacherId) { setLoading(false); return; }
    API.get(`/schedules/teacher/${teacherId}`)
      .then(res => setSchedule(res.data))
      .catch(() => setSchedule([]))
      .finally(() => setLoading(false));
  }, [teacherId]);

  const byDay = DAYS.reduce((acc, day) => {
    acc[day] = schedule.filter(s => s.day === day);
    return acc;
  }, {});

  return (
    <div>
      <div className="page-header"><h1>📅 {t('mySchedule')}</h1></div>
      {loading ? (
        <div className="card text-center"><p>Loading...</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {DAYS.map(day => (
            <div key={day} className="card">
              <h3>📅 {day}</h3>
              {byDay[day].length > 0 ? (
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '10px' }}>
                  {byDay[day].map(s => (
                    <div key={s.id} style={{
                      background: '#f0f4ff', borderRadius: '10px', padding: '12px 16px',
                      borderLeft: '4px solid #2563eb', minWidth: '200px'
                    }}>
                      <div style={{ fontWeight: '700', color: '#1e3a5f' }}>{s.startTime} - {s.endTime}</div>
                      <div style={{ fontSize: '0.9rem', color: '#2563eb', marginTop: '4px' }}>{s.className}</div>
                      <div style={{ fontSize: '0.83rem', color: '#94a3b8' }}>{s.subjectName} · Room {s.room}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#94a3b8', marginTop: '10px' }}>No classes scheduled</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}