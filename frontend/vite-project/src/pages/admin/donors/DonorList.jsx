import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../../api/axios';

// eslint-disable-next-line no-unused-vars
const MONTHS = ['','January','February','March','April','May','June',
                 'July','August','September','October','November','December'];

export default function DonorList() {
  const [donors,  setDonors]  = useState([]);
  const [search,  setSearch]  = useState('');
  const [filter,  setFilter]  = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/donors')
      .then(res => setDonors(res.data))
      .catch(() => setDonors([]))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete donor "${name}" and all their schedules?`)) return;
    try {
      await API.delete(`/donors/${id}`);
      setDonors(p => p.filter(d => d.id !== id));
    } catch { alert('Delete failed.'); }
  };

  const filtered = donors.filter(d => {
    const ms = d.name?.toLowerCase().includes(search.toLowerCase()) ||
               d.phone?.includes(search);
    const mf = filter === 'All' || d.status === filter;
    return ms && mf;
  });

  return (
    <div>
      <div className="page-header">
        <h1>🍱 Food Donors</h1>
        <Link to="/admin/donors/add" className="btn btn-primary">➕ Add Donor</Link>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display:'flex', gap:'12px', flexWrap:'wrap', alignItems:'center' }}>
          <div className="search-bar" style={{ flex:1, minWidth:'200px' }}>
            <span>🔍</span>
            <input placeholder="Search by name or phone..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ display:'flex', gap:'6px' }}>
            {['All','Active','Inactive'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`btn btn-sm ${filter===f ? 'btn-primary' : 'btn-outline'}`}>{f}</button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card text-center" style={{ padding:'40px' }}>⏳ Loading...</div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Phone</th>
                <th>NIC</th>
                <th>Schedules</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d, i) => (
                <tr key={d.id}>
                  <td style={{ color:'#94a3b8' }}>{i+1}</td>
                  <td><strong>{d.name}</strong></td>
                  <td>{d.phone || '—'}</td>
                  <td>{d.nicNumber || '—'}</td>
                  <td>
                    <span className="badge badge-blue">{d.scheduleCount} month(s)</span>
                  </td>
                  <td>
                    <span className={`badge ${d.status==='Active' ? 'badge-green' : 'badge-red'}`}>
                      {d.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display:'flex', gap:'6px' }}>
                      <Link to={`/admin/donors/${d.id}`} className="btn btn-sm btn-outline">
                        👁️ View
                      </Link>
                      <Link to={`/admin/donors/edit/${d.id}`} className="btn btn-sm btn-warning">
                        ✏️ Edit
                      </Link>
                      <button onClick={() => handleDelete(d.id, d.name)}
                        className="btn btn-sm btn-danger">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan="7" className="text-center"
                  style={{ padding:'30px', color:'#94a3b8' }}>No donors found.</td></tr>
              )}
            </tbody>
          </table>
          <div style={{ padding:'12px 16px', color:'#94a3b8', fontSize:'0.82rem' }}>
            {filtered.length} / {donors.length} donors
          </div>
        </div>
      )}
    </div>
  );
}