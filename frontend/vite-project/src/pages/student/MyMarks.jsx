import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import API from '../../api/axios';

export default function MyMarks() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [marks,   setMarks]   = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔧 FIX: use the logged-in student's actual ID, not hardcoded "1"
  const studentId = user?.studentId;

  useEffect(() => {
    if (!studentId) { setLoading(false); return; }

    API.get(`/marks/student/${studentId}`)
      .then(res => setMarks(res.data))
      .catch(() => setMarks([]))
      .finally(() => setLoading(false));
  }, [studentId]);

  const getColor = (g) =>
    g?.startsWith('A') ? 'badge-green' :
    g?.startsWith('B') ? 'badge-blue'  :
    g?.startsWith('C') ? 'badge-yellow': 'badge-red';

  return (
    <div>
      <div className="page-header"><h1>📝 {t('viewMyMarks')}</h1></div>

      {loading ? (
        <div className="card text-center"><p>{t('loading')}</p></div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>{t('subject')}</th>
                <th>Exam Type</th>
                <th>{t('score')}</th>
                <th>{t('grade')}</th>
              </tr>
            </thead>
            <tbody>
              {marks.map((m, i) => (
                <tr key={m.id}>
                  <td>{i + 1}</td>
                  <td><strong>{m.subjectName}</strong></td>
                  <td>{m.examType}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span>{m.marks}%</span>
                      <div className="progress-bar" style={{ width: '80px', margin: 0 }}>
                        <div
                          className={`progress-fill ${m.marks >= 80 ? 'progress-green' : m.marks >= 60 ? 'progress-blue' : 'progress-yellow'}`}
                          style={{ width: `${m.marks}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td><span className={`badge ${getColor(m.grade)}`}>{m.grade}</span></td>
                </tr>
              ))}
              {marks.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center" style={{ padding: '30px', color: '#94a3b8' }}>
                    No marks found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}