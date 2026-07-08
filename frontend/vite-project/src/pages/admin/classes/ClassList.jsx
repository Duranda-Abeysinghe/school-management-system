import { useEffect, useState } from 'react';
import API from '../../../api/axios';
import { useLanguage } from '../../../context/LanguageContext';

export default function ClassList() {
  const { t } = useLanguage();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/classes')
      .then(res => setClasses(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>🏫 {t('classes')}</h1>
      </div>

      {loading ? (
        <div className="card text-center"><p>{t('loading')}</p></div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>{t('className')}</th>
                <th>Section</th>
                <th>{t('teachers')}</th>
                <th>{t('students')}</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((c, i) => (
                <tr key={c.id}>
                  <td>{i + 1}</td>
                  <td><strong>{c.className}</strong></td>
                  <td><span className="badge badge-blue">{c.section}</span></td>
                  <td>{c.teacherName || 'N/A'}</td>
                  <td><span className="badge badge-green">{c.studentCount}</span></td>
                </tr>
              ))}
              {classes.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center" style={{ padding: '30px', color: '#94a3b8' }}>
                    No classes found.
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