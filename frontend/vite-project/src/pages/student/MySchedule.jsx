import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import API from '../../api/axios';

export default function MySchedule() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔧 assumes user.classId exists on the logged-in student's user object — confirm/adjust
  const classId = user?.classId;

  useEffect(() => {
    if (!classId) { setLoading(false); return; }
    API.get(`/schedules/class/${classId}`)
      .then(res => setSchedule(res.data))
      .catch(() => setSchedule([]))
      .finally(() => setLoading(false));
  }, [classId]);

  return (
    <div>
      <div className="page-header"><h1>📅 {t('classSchedule')}</h1></div>
      {loading ? (
        <div className="card text-center"><p>Loading...</p></div>
      ) : schedule.length === 0 ? (
        <div className="card text-center"><p style={{ color: '#94a3b8' }}>No schedule available yet.</p></div>
      ) : (
        <div className="grid-2">
          {schedule.map((s) => (
            <div key={s.id} className="card">
              <div className="flex-between">
                <span className="badge badge-blue">{s.startTime}</span>
                <span className="badge badge-gray">{s.day}</span>
              </div>
              <div style={{ margin: '12px 0' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{s.subjectName}</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>
                  👨‍🏫 {s.teacherName} · 🚪 Room {s.room}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}