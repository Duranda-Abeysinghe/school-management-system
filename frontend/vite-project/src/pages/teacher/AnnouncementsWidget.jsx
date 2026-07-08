import { useEffect, useState } from 'react';
import API from '../../api/axios';

export default function AnnouncementsWidget({ role }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/announcements')
      .then(res => {
        const all = res.data || [];
        const filtered = all.filter(a =>
          a.target === 'All' || a.target === role
        );
        setAnnouncements(filtered.slice(0, 4));
      })
      .catch(() => setAnnouncements([]))
      .finally(() => setLoading(false));
  }, [role]);

  if (loading) return null;
  if (announcements.length === 0) return null;

  const priorityConfig = {
    Urgent: { color: '#7c3aed', bg: '#faf5ff', border: '#7c3aed' },
    High:   { color: '#dc2626', bg: '#fff5f5', border: '#dc2626' },
    Normal: { color: '#2563eb', bg: '#eff6ff', border: '#2563eb' },
  };

  return (
    <div style={{
      background: 'white', borderRadius: '16px', padding: '20px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginTop: '24px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#1e3a5f' }}>
          📢 Announcements
        </h3>
        <span style={{
          background: '#eff6ff', color: '#2563eb', borderRadius: '20px',
          padding: '3px 10px', fontSize: '0.75rem', fontWeight: '700'
        }}>{announcements.length} new</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {announcements.map(a => {
          const cfg = priorityConfig[a.priority] || priorityConfig.Normal;
          return (
            <div key={a.id} style={{
              background: cfg.bg, borderRadius: '10px',
              padding: '12px 14px', borderLeft: `3px solid ${cfg.border}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '4px' }}>
                <strong style={{ fontSize: '0.88rem', color: '#1e293b' }}>{a.title}</strong>
                <span style={{
                  background: `${cfg.color}18`, color: cfg.color,
                  borderRadius: '20px', padding: '2px 8px',
                  fontSize: '0.68rem', fontWeight: '700', whiteSpace: 'nowrap', flexShrink: 0,
                }}>{a.priority}</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
                {a.message?.length > 100 ? a.message.slice(0, 100) + '...' : a.message}
              </p>
              {a.createdAt && (
                <div style={{ marginTop: '6px', fontSize: '0.72rem', color: '#94a3b8' }}>
                  {new Date(a.createdAt).toLocaleDateString()}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}