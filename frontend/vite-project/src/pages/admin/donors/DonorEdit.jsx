import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../../api/axios';

export default function DonorEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name:'', phone:'', address:'', nicNumber:'', status:'Active', notes:''
  });
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    API.get(`/donors/${id}`)
      .then(res => {
        const d = res.data;
        setForm({ name: d.name, phone: d.phone||'', address: d.address||'',
                  nicNumber: d.nicNumber||'', status: d.status, notes: d.notes||'' });
      })
      .catch(() => setError('Failed to load donor.'))
      .finally(() => setLoading(false));
  }, [id]);

  const update = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await API.put(`/donors/${id}`, form);
      setSuccess(true);
      setTimeout(() => navigate(`/admin/donors/${id}`), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update.');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="card text-center" style={{ padding:'40px' }}>⏳ Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>✏️ Edit Donor</h1>
        <button className="btn btn-outline" onClick={() => navigate(`/admin/donors/${id}`)}>← Back</button>
      </div>
      {success && <div className="alert alert-success">✅ Updated! Redirecting...</div>}
      {error   && <div className="alert alert-error">❌ {error}</div>}
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="grid-3">
            <div className="form-group">
              <label>Full Name *</label>
              <input required value={form.name} onChange={e => update('name', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input value={form.phone} onChange={e => update('phone', e.target.value)} />
            </div>
            <div className="form-group">
              <label>NIC Number</label>
              <input value={form.nicNumber} onChange={e => update('nicNumber', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select value={form.status} onChange={e => update('status', e.target.value)}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Address</label>
            <textarea rows="2" value={form.address} onChange={e => update('address', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea rows="2" value={form.notes} onChange={e => update('notes', e.target.value)} />
          </div>
          <div style={{ display:'flex', gap:'12px' }}>
            <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
              {saving ? '⏳ Saving...' : '💾 Update Donor'}
            </button>
            <button type="button" className="btn btn-outline"
              onClick={() => navigate(`/admin/donors/${id}`)}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}