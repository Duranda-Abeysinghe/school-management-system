import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../../api/axios';

export default function DonorAdd() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', phone: '', nicNumber: '', address: '', status: 'Active', notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await API.post('/donors', form);
      navigate(`/admin/donors/${res.data.data?.id || res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add donor.');
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '800', color: '#1e3a5f' }}>🍱 Add New Donor</h1>
        <button onClick={() => navigate('/admin/donors')} style={{
          background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px',
          padding: '8px 16px', cursor: 'pointer', fontWeight: '600', color: '#64748b'
        }}>← Back</button>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', color: '#dc2626' }}>
          ❌ {error}
        </div>
      )}

      <div style={{ background: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '6px', fontSize: '0.875rem' }}>Full Name *</label>
              <input required value={form.name} onChange={e => update('name', e.target.value)}
                placeholder="Vasantha Gunasekara"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '6px', fontSize: '0.875rem' }}>Phone</label>
              <input value={form.phone} onChange={e => update('phone', e.target.value)}
                placeholder="077 123 4567"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '6px', fontSize: '0.875rem' }}>NIC</label>
              <input value={form.nicNumber} onChange={e => update('nicNumber', e.target.value)}
                placeholder="123456789V"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '6px', fontSize: '0.875rem' }}>Status</label>
              <select value={form.status} onChange={e => update('status', e.target.value)}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box' }}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '6px', fontSize: '0.875rem' }}>Address</label>
            <textarea value={form.address} onChange={e => update('address', e.target.value)}
              placeholder="No. 12, Main Street, Colombo" rows={2}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', resize: 'vertical', boxSizing: 'border-box' }} />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '6px', fontSize: '0.875rem' }}>Notes</label>
            <textarea value={form.notes} onChange={e => update('notes', e.target.value)}
              placeholder="Any additional notes..." rows={2}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', resize: 'vertical', boxSizing: 'border-box' }} />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="submit" disabled={loading} style={{
              background: 'linear-gradient(135deg, #0891b2, #0e7490)', color: 'white',
              border: 'none', borderRadius: '10px', padding: '12px 28px',
              fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer', opacity: loading ? 0.7 : 1
            }}>
              {loading ? '⏳ Saving...' : '💾 Save Donor'}
            </button>
            <button type="button" onClick={() => navigate('/admin/donors')} style={{
              background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px',
              padding: '12px 20px', fontWeight: '600', cursor: 'pointer', color: '#64748b'
            }}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}