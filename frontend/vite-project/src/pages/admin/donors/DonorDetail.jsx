import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import API from '../../../api/axios';

const MONTHS = ['','January','February','March','April','May','June',
                 'July','August','September','October','November','December'];

const COMMON_FOODS = [
  'බත්','පලා','පරිප්පු','මාළු','කරවල','හාල්මස්සො',
  'බිත්තර','කාරොට්','අල','වම්බටු','සලාද','පපදම්','බැදුම','වටටකා','මස්'
];

export default function DonorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [donor,     setDonor]     = useState(null);
  const [classes,   setClasses]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState('');
  const [editSched, setEditSched] = useState(null);
  const [foodInput, setFoodInput] = useState('');

  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];

  const emptyForm = {
    donorId: parseInt(id),
    year: currentYear,
    month: '',
    classId1: '', classId2: '', classId3: '',
    mealRate: 110,
    notes: '',
    foodItems: []
  };
  const [form, setForm] = useState(emptyForm);

  // Load donor details and classes from DB
  useEffect(() => {
    Promise.all([
      API.get(`/donors/${id}`),
      API.get('/classes')
    ])
      .then(([dRes, cRes]) => {
        setDonor(dRes.data);
        setClasses(cRes.data);
      })
      .catch(() => setError('Failed to load donor details.'))
      .finally(() => setLoading(false));
  }, [id]);

  const update = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const addFood = (item) => {
    if (!item.trim()) return;
    if (!form.foodItems.includes(item.trim()))
      setForm(p => ({ ...p, foodItems: [...p.foodItems, item.trim()] }));
    setFoodInput('');
  };

  const removeFood = (item) =>
    setForm(p => ({ ...p, foodItems: p.foodItems.filter(f => f !== item) }));

  // Open form to ADD a new schedule
  const openAdd = () => {
    setForm(emptyForm);
    setEditSched(null);
    setShowForm(true);
    setError('');
    setSuccess('');
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  // Open form to EDIT an existing schedule
  const openEdit = (s) => {
    setEditSched(s);
    setForm({
      donorId:  parseInt(id),
      year:     s.year,
      month:    s.month,
      classId1: s.classId1 || '',
      classId2: s.classId2 || '',
      classId3: s.classId3 || '',
      mealRate: s.mealRate,
      notes:    s.notes || '',
      foodItems: (s.foodItems || []).map(f => f.foodItem)
    });
    setShowForm(true);
    setError('');
    setSuccess('');
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  // Get which months are already assigned for this year (to prevent duplicates)
  const assignedMonths = (donor?.schedules || [])
    .filter(s => s.year === form.year && (!editSched || s.id !== editSched.id))
    .map(s => s.month);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.month)    { setError('Please select a month.'); return; }
    if (!form.classId1) { setError('Please select at least Class 1.'); return; }

    setSaving(true);
    setError('');

    try {
      const payload = {
        donorId:  form.donorId,
        year:     form.year,
        month:    parseInt(form.month),
        classId1: form.classId1 ? parseInt(form.classId1) : null,
        classId2: form.classId2 ? parseInt(form.classId2) : null,
        classId3: form.classId3 ? parseInt(form.classId3) : null,
        mealRate: parseFloat(form.mealRate),
        notes:    form.notes,
        foodItems: form.foodItems
      };

      if (editSched) {
        await API.put(`/donors/schedules/${editSched.id}`, payload);
      } else {
        await API.post('/donors/schedules', payload);
      }

      // Reload
      const res = await API.get(`/donors/${id}`);
      setDonor(res.data);
      setSuccess(editSched ? '✅ Schedule updated!' : '✅ Schedule added!');
      setShowForm(false);
      setForm(emptyForm);
      setEditSched(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save schedule.');
    } finally {
      setSaving(false);
    }
  };

  const deleteSchedule = async (sid) => {
    if (!confirm('Delete this month\'s schedule?')) return;
    try {
      await API.delete(`/donors/schedules/${sid}`);
      const res = await API.get(`/donors/${id}`);
      setDonor(res.data);
    } catch {
      alert('Delete failed.');
    }
  };

  // Group schedules by year for display
  const schedulesByYear = (donor?.schedules || []).reduce((acc, s) => {
    if (!acc[s.year]) acc[s.year] = [];
    acc[s.year].push(s);
    return acc;
  }, {});

  if (loading) return (
    <div className="card text-center" style={{ padding: '40px' }}>⏳ Loading...</div>
  );
  if (!donor) return (
    <div className="alert alert-error">❌ Donor not found.</div>
  );

  return (
    <div>
      {/* ── Header ── */}
      <div className="page-header">
        <h1>🍱 {donor.name}</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link to={`/admin/donors/edit/${id}`} className="btn btn-warning">✏️ Edit Donor</Link>
          <button className="btn btn-outline" onClick={() => navigate('/admin/donors')}>← Back</button>
        </div>
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error   && <div className="alert alert-error">❌ {error}</div>}

      {/* ── Donor Info ── */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="grid-3">
          <div>
            <label style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>Phone</label>
            <p style={{ margin: '4px 0 0', fontWeight: 600 }}>{donor.phone || '—'}</p>
          </div>
          <div>
            <label style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>NIC</label>
            <p style={{ margin: '4px 0 0', fontWeight: 600 }}>{donor.nicNumber || '—'}</p>
          </div>
          <div>
            <label style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>Status</label>
            <p style={{ margin: '4px 0 0' }}>
              <span className={`badge ${donor.status === 'Active' ? 'badge-green' : 'badge-red'}`}>
                {donor.status}
              </span>
            </p>
          </div>
          {donor.address && (
            <div>
              <label style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>Address</label>
              <p style={{ margin: '4px 0 0' }}>{donor.address}</p>
            </div>
          )}
          {donor.notes && (
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>Notes</label>
              <p style={{ margin: '4px 0 0' }}>{donor.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Schedules Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h2 style={{ margin: '0 0 4px' }}>
            📅 Monthly Schedules
          </h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>
            {donor.schedules?.length || 0} month(s) assigned —
            each month can have up to 3 classes
          </p>
        </div>
        {!showForm && (
          <button className="btn btn-primary" onClick={openAdd}>
            ➕ Add Month Schedule
          </button>
        )}
      </div>

      {/* ── Schedule Form ── */}
      {showForm && (
        <div className="card" style={{ marginBottom: '24px', border: '2px solid #2563eb' }}>
          <h3 style={{ color: '#2563eb', marginBottom: '18px' }}>
            {editSched
              ? `✏️ Edit — ${MONTHS[editSched.month]} ${editSched.year}`
              : '➕ New Month Schedule'}
          </h3>

          <form onSubmit={handleSubmit}>
            {/* Year + Month + Rate */}
            <div className="grid-3">
              <div className="form-group">
                <label>Year *</label>
                <select required value={form.year}
                  onChange={e => update('year', parseInt(e.target.value))}>
                  {years.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Month *</label>
                <select required value={form.month}
                  onChange={e => update('month', e.target.value)}>
                  <option value="">Select Month</option>
                  {MONTHS.slice(1).map((m, i) => {
                    const monthNum = i + 1;
                    const taken = assignedMonths.includes(monthNum);
                    return (
                      <option key={monthNum} value={monthNum} disabled={taken}>
                        {m} {taken ? '(already assigned)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="form-group">
                <label>Meal Rate (Rs / student / day)</label>
                <input type="number" min="1" value={form.mealRate}
                  onChange={e => update('mealRate', e.target.value)} />
              </div>
            </div>

            {/* Classes — 1 required, 2 and 3 optional */}
            <h4 style={{ margin: '4px 0 12px', color: '#374151' }}>
              🏫 Assign Classes (up to 3)
            </h4>
            <div className="grid-3">
              <div className="form-group">
                <label>Class 1 *</label>
                <select required value={form.classId1}
                  onChange={e => update('classId1', e.target.value)}>
                  <option value="">Select Class</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.displayName || `${c.className} ${c.section}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Class 2 <span style={{ color: '#94a3b8' }}>(optional)</span></label>
                <select value={form.classId2}
                  onChange={e => update('classId2', e.target.value)}>
                  <option value="">None</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.displayName || `${c.className} ${c.section}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Class 3 <span style={{ color: '#94a3b8' }}>(optional)</span></label>
                <select value={form.classId3}
                  onChange={e => update('classId3', e.target.value)}>
                  <option value="">None</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.displayName || `${c.className} ${c.section}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notes */}
            <div className="form-group">
              <label>Notes</label>
              <input placeholder="Any notes for this month..."
                value={form.notes}
                onChange={e => update('notes', e.target.value)} />
            </div>

            {/* Food Items */}
            <div className="form-group">
              <label>🍛 Food Items for this month</label>
              {/* Quick-select common foods */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                {COMMON_FOODS.map(f => (
                  <button key={f} type="button" onClick={() => addFood(f)}
                    style={{
                      padding: '4px 12px', borderRadius: '20px',
                      fontSize: '12px', cursor: 'pointer',
                      background: form.foodItems.includes(f) ? '#2563eb' : '#f1f5f9',
                      color:      form.foodItems.includes(f) ? 'white'   : '#374151',
                      border:     form.foodItems.includes(f) ? '1px solid #2563eb' : '1px solid #e2e8f0',
                      transition: 'all 0.15s'
                    }}>
                    {f}
                  </button>
                ))}
              </div>
              {/* Custom food input */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <input placeholder="Type a custom food item and press Add..."
                  value={foodInput}
                  onChange={e => setFoodInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') { e.preventDefault(); addFood(foodInput); }
                  }} />
                <button type="button" className="btn btn-outline"
                  onClick={() => addFood(foodInput)}>+ Add</button>
              </div>
              {/* Selected food tags */}
              {form.foodItems.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                  {form.foodItems.map(f => (
                    <span key={f} style={{
                      background: '#dbeafe', color: '#1e40af',
                      padding: '4px 10px', borderRadius: '20px',
                      fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px'
                    }}>
                      {f}
                      <button type="button" onClick={() => removeFood(f)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer',
                                 color: '#dc2626', fontWeight: 700, fontSize: '14px' }}>×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
                {saving ? '⏳ Saving...' : '💾 Save Schedule'}
              </button>
              <button type="button" className="btn btn-outline"
                onClick={() => { setShowForm(false); setForm(emptyForm); setEditSched(null); setError(''); }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Existing Schedules — grouped by year ── */}
      {(donor.schedules?.length || 0) === 0 ? (
        <div className="card text-center" style={{ padding: '40px', color: '#94a3b8' }}>
          <p style={{ fontSize: '2rem', margin: '0 0 8px' }}>📅</p>
          <p>No schedules yet.</p>
          <p style={{ fontSize: '13px' }}>Click "Add Month Schedule" to assign this donor to a month.</p>
        </div>
      ) : (
        Object.keys(schedulesByYear).sort((a,b) => b - a).map(year => (
          <div key={year} style={{ marginBottom: '24px' }}>
            {/* Year header */}
            <div style={{
              background: '#1e40af', color: 'white',
              padding: '8px 16px', borderRadius: '8px 8px 0 0',
              fontWeight: 700, fontSize: '14px'
            }}>
              📆 {year} — {schedulesByYear[year].length} month(s) assigned
            </div>

            {/* Month cards grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '12px',
              background: '#f8fafc',
              padding: '12px',
              borderRadius: '0 0 8px 8px',
              border: '1px solid #e2e8f0',
              borderTop: 'none'
            }}>
              {schedulesByYear[year]
                .sort((a, b) => a.month - b.month)
                .map(s => (
                  <div key={s.id} style={{
                    background: 'white', borderRadius: '10px',
                    border: '1px solid #e2e8f0', padding: '14px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                  }}>
                    {/* Month title + actions */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div>
                        <h4 style={{ margin: '0 0 2px', color: '#1e40af' }}>
                          {MONTHS[s.month]}
                        </h4>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>
                          Rs {s.mealRate}/student/day
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button onClick={() => openEdit(s)} className="btn btn-warning btn-sm">✏️</button>
                        <button onClick={() => deleteSchedule(s.id)} className="btn btn-danger btn-sm">🗑️</button>
                      </div>
                    </div>

                    {/* Classes */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '8px' }}>
                      {s.class1Name && (
                        <span style={{ background: '#dbeafe', color: '#1e40af',
                          padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>
                          🏫 {s.class1Name}
                        </span>
                      )}
                      {s.class2Name && (
                        <span style={{ background: '#dbeafe', color: '#1e40af',
                          padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>
                          🏫 {s.class2Name}
                        </span>
                      )}
                      {s.class3Name && (
                        <span style={{ background: '#dbeafe', color: '#1e40af',
                          padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>
                          🏫 {s.class3Name}
                        </span>
                      )}
                    </div>

                    {/* Food items */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {(s.foodItems || []).length > 0 ? (
                        s.foodItems.map(f => (
                          <span key={f.id} style={{
                            background: '#f0fdf4', color: '#166534',
                            padding: '2px 8px', borderRadius: '12px',
                            fontSize: '11px', border: '1px solid #bbf7d0'
                          }}>{f.foodItem}</span>
                        ))
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '11px' }}>No food items</span>
                      )}
                    </div>

                    {s.notes && (
                      <p style={{ margin: '8px 0 0', fontSize: '11px', color: '#64748b' }}>
                        📝 {s.notes}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}