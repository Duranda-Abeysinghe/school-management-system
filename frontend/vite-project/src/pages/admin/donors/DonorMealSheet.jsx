import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import API from '../../../api/axios';
import schoolLogo from '../../../assets/school-logo.webp';

const MONTHS = ['','January','February','March','April','May','June',
                'July','August','September','October','November','December'];

const SCHOOL_NAME = 'Olcott Primary School, Matara';
const SCHOOL_ADDRESS = 'Matara, Sri Lanka';

export default function DonorMealSheet() {
  const { scheduleId } = useParams();
  const navigate = useNavigate();
  const [sheet, setSheet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState('');
  const [logoBase64, setLogoBase64] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    API.get(`/donors/schedules/${scheduleId}/meal-sheet`)
      .then(res => setSheet(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [scheduleId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width; canvas.height = img.height;
      canvas.getContext('2d').drawImage(img, 0, 0);
      setLogoBase64(canvas.toDataURL('image/png'));
    };
    img.src = schoolLogo;
  }, []);

  const updateCount = (dayIdx, classIdx, field, value) => {
    setSheet(prev => {
      const days = [...prev.days];
      const classes = [...days[dayIdx].classes];
      const num = parseInt(value) || 0;
      classes[classIdx] = { ...classes[classIdx], [field]: num };
      classes[classIdx].totalCount = classes[classIdx].maleCount + classes[classIdx].femaleCount;
      days[dayIdx] = { ...days[dayIdx], classes };
      return { ...prev, days };
    });
  };

  const saveDay = async (dayIdx) => {
    const day = sheet.days[dayIdx];
    setSaving(day.date);
    try {
      await API.post(`/donors/schedules/${scheduleId}/meal-sheet`, {
        date: day.date,
        classes: day.classes.map(c => ({
          classId: c.classId, maleCount: c.maleCount, femaleCount: c.femaleCount
        }))
      });
    } catch {
      alert('Failed to save this day.');
    } finally {
      setSaving('');
    }
  };

  const exportPdf = () => {
    const doc = new jsPDF();
    const HEADER_HEIGHT = 32; // reserve space so content never sits under the header band
    let y = HEADER_HEIGHT;

    sheet.days.forEach((day) => {
      if (y > 255) { doc.addPage(); y = HEADER_HEIGHT; }

      doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(30, 58, 95);
      doc.text(`${sheet.donorName}`, 14, y);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(80,80,80);
      doc.text(`Date: ${day.date}`, 150, y);
      y += 4;

      autoTable(doc, {
        startY: y,
        head: [['Class', 'Female', 'Male', 'Total']],
        body: [
          ...day.classes.map(c => [c.className, c.femaleCount, c.maleCount, c.totalCount]),
          ['Total',
            day.classes.reduce((s,c) => s + c.femaleCount, 0),
            day.classes.reduce((s,c) => s + c.maleCount, 0),
            day.classes.reduce((s,c) => s + c.totalCount, 0)]
        ],
        headStyles: { fillColor: [30, 58, 95], textColor: 255, fontSize: 8 },
        bodyStyles: { fontSize: 8 },
        margin: { left: 14, right: 14 },
        tableWidth: 180,
      });

      y = doc.lastAutoTable.finalY + 8;
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let p = 1; p <= pageCount; p++) {
      doc.setPage(p);
      doc.setFillColor(30, 58, 95);
      doc.rect(0, 0, 210, 26, 'F');
      if (logoBase64) doc.addImage(logoBase64, 'PNG', 10, 4, 18, 18);
      doc.setTextColor(255,255,255); doc.setFontSize(12); doc.setFont('helvetica','bold');
      doc.text(SCHOOL_NAME, 32, 12);
      doc.setFontSize(8); doc.setFont('helvetica','normal');
      doc.text(SCHOOL_ADDRESS, 32, 18);
      doc.setFontSize(10); doc.setFont('helvetica','bold');
      doc.text(`Meal Sheet — ${MONTHS[sheet.month]} ${sheet.year}`, 32, 23);
      doc.setTextColor(148,163,184); doc.setFontSize(7);
      doc.text(`Confidential — ${SCHOOL_NAME}`, 14, 292);
      doc.text(`Page ${p} of ${pageCount}`, 185, 292);
    }

    doc.save(`Meal_Sheet_${sheet.donorName?.replace(/\s+/g,'_')}_${MONTHS[sheet.month]}_${sheet.year}.pdf`);
  };

  if (loading) return <div className="card text-center" style={{ padding: '40px' }}>⏳ Loading...</div>;
  if (!sheet) return <div className="alert alert-error">❌ Could not load meal sheet.</div>;

  return (
    <div>
      <div className="page-header">
        <h1>🍱 {sheet.donorName} — {MONTHS[sheet.month]} {sheet.year}</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-primary" onClick={exportPdf}>📥 Export PDF</button>
          <button className="btn btn-outline" onClick={() => navigate(-1)}>← Back</button>
        </div>
      </div>

      <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '16px' }}>
        Numbers are auto-filled from attendance for each date — edit any field and click Save for that day.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
        {sheet.days.map((day, dayIdx) => (
          <div key={day.date} className="card" style={{ padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <strong style={{ fontSize: '0.85rem' }}>
                {new Date(day.date).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' })}
              </strong>
              <button
                className="btn btn-sm btn-primary"
                disabled={saving === day.date}
                onClick={() => saveDay(dayIdx)}
              >
                {saving === day.date ? '⏳' : '💾 Save'}
              </button>
            </div>

            <table style={{ width: '100%', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ color: '#94a3b8', textAlign: 'left' }}>
                  <th>Class</th>
                  <th style={{ width: '60px' }}>Female</th>
                  <th style={{ width: '60px' }}>Male</th>
                  <th style={{ width: '50px' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {day.classes.map((c, classIdx) => (
                  <tr key={c.classId}>
                    <td>{c.className}</td>
                    <td>
                      <input type="number" min="0" value={c.femaleCount}
                        onChange={e => updateCount(dayIdx, classIdx, 'femaleCount', e.target.value)}
                        style={{ width: '50px', padding: '3px 5px', border: '1px solid #e2e8f0', borderRadius: '4px' }} />
                    </td>
                    <td>
                      <input type="number" min="0" value={c.maleCount}
                        onChange={e => updateCount(dayIdx, classIdx, 'maleCount', e.target.value)}
                        style={{ width: '50px', padding: '3px 5px', border: '1px solid #e2e8f0', borderRadius: '4px' }} />
                    </td>
                    <td style={{ fontWeight: 700 }}>{c.totalCount}</td>
                  </tr>
                ))}
                <tr style={{ borderTop: '1px solid #e2e8f0', fontWeight: 700 }}>
                  <td>Total</td>
                  <td>{day.classes.reduce((s,c) => s + c.femaleCount, 0)}</td>
                  <td>{day.classes.reduce((s,c) => s + c.maleCount, 0)}</td>
                  <td>{day.classes.reduce((s,c) => s + c.totalCount, 0)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}