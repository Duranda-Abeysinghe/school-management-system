import { useEffect, useState } from 'react';
import API from '../../api/axios';
import { useLanguage } from '../../context/LanguageContext';

export default function Requests() {
  const { t } = useLanguage();
  const [requests, setRequests] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    API.get('/requests')
      .then(res => setRequests(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/requests/${id}/status`, JSON.stringify(status), {
        headers: { 'Content-Type': 'application/json' }
      });
      setRequests(p => p.map(r => r.id === id ? { ...r, status } : r));
    } catch { alert('Failed to update.'); }
  };

  return (
    <div>
      <div className="page-header">
        <h1>📨 {t('viewRequests')}</h1>
        <span className="badge badge-yellow">
          {requests.filter(r => r.status === 'Pending').length} {t('pendingRequests')}
        </span>
      </div>

      {loading ? (
        <div className="card text-center"><p>{t('loading')}</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {requests.map(r => (
            <div key={r.id} className="card" style={{
              borderLeft: `4px solid ${
                r.status === 'Pending'  ? '#f59e0b' :
                r.status === 'Approved' ? '#16a34a' : '#dc2626'
              }`
            }}>
              <div className="flex-between" style={{ marginBottom: '10px' }}>
                <div>
                  <strong>{r.studentName || 'Student'}</strong>
                  <span className="badge badge-purple" style={{ marginLeft: '10px' }}>{r.type}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                  <span className={`badge ${
                    r.status === 'Pending'  ? 'badge-yellow' :
                    r.status === 'Approved' ? 'badge-green'  : 'badge-red'
                  }`}>{r.status}</span>
                </div>
              </div>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '12px' }}>
                {r.message}
              </p>
              {r.status === 'Pending' && (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn btn-success btn-sm"
                    onClick={() => updateStatus(r.id, 'Approved')}>
                    ✅ {t('approve')}
                  </button>
                  <button className="btn btn-danger btn-sm"
                    onClick={() => updateStatus(r.id, 'Rejected')}>
                    ❌ {t('reject')}
                  </button>
                </div>
              )}
            </div>
          ))}
          {requests.length === 0 && (
            <div className="card text-center">
              <p style={{ color: '#94a3b8' }}>No requests found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}