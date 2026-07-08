import { useEffect, useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import API from '../../../api/axios';

export default function Reports() {
  const [students,  setStudents]  = useState([]);
  const [teachers,  setTeachers]  = useState([]);
  const [marks,     setMarks]     = useState([]);
  const [attendance,setAttendance]= useState([]);
  const [loading,   setLoading]   = useState(true);
  const [generating,setGenerating]= useState('');

  useEffect(() => {
    Promise.all([
      API.get('/students').catch(() => ({ data: [] })),
      API.get('/teachers').catch(() => ({ data: [] })),
      API.get('/marks').catch(() => ({ data: [] })),
      API.get('/attendance').catch(() => ({ data: [] })),
    ]).then(([s, t, m, a]) => {
      setStudents(s.data || []);
      setTeachers(t.data || []);
      setMarks(m.data     || []);
      setAttendance(a.data|| []);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // ── shared header ────────────────────────────────────────
  const addHeader = (doc, title, subtitle) => {
    doc.setFillColor(30, 58, 95);
    doc.rect(0, 0, 210, 28, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('SchoolMS', 14, 12);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(title, 14, 22);
    doc.setFontSize(8);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 130, 10);
    doc.text(subtitle, 130, 17);
    doc.setTextColor(0, 0, 0);
    return 35;
  };

  const download = (doc, filename) => {
    doc.save(filename);
  };

  // ── Students Report ──────────────────────────────────────
  const generateStudentsReport = async () => {
    try {
      setGenerating('students');
      const doc = new jsPDF();
      let y = addHeader(doc, 'Students Report', `Total: ${students.length}`);

      const active   = students.filter(s => s.status === 'Active').length;
      const inactive = students.length - active;
      const male     = students.filter(s => s.gender === 'Male').length;
      const female   = students.filter(s => s.gender === 'Female').length;

      doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(80, 80, 80);
      doc.text(`Total: ${students.length}  |  Active: ${active}  |  Inactive: ${inactive}  |  Male: ${male}  |  Female: ${female}`, 14, y);
      y += 8;

      autoTable(doc, {
        startY: y,
        head: [['#', 'Admission No', 'Full Name', 'Gender', 'Class', 'Year', 'Status']],
        body: students.map((s, i) => [
          i + 1,
          s.admissionNo || '—',
          s.fullName,
          s.gender || '—',
          s.className || '—',
          s.academicYear || '—',
          s.status,
        ]),
        headStyles: { fillColor: [30, 58, 95], textColor: 255, fontStyle: 'bold', fontSize: 8 },
        bodyStyles: { fontSize: 7.5 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { left: 14, right: 14 },
      });

      download(doc, `Students_Report_${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (err) {
      console.error('PDF error:', err);
      alert('Error: ' + err.message);
    } finally {
      setGenerating('');
    }
  };

  // ── Attendance Report ────────────────────────────────────
  const generateAttendanceReport = async () => {
    try {
      setGenerating('attendance');
      const doc = new jsPDF();
      let y = addHeader(doc, 'Attendance Report', `Records: ${attendance.length}`);

      const byClass = {};
      students.forEach(s => {
        const cls = s.className || 'Unknown';
        if (!byClass[cls]) byClass[cls] = { total: 0, active: 0, inactive: 0, male: 0, female: 0 };
        byClass[cls].total++;
        if (s.status === 'Active') byClass[cls].active++; else byClass[cls].inactive++;
        if (s.gender === 'Male') byClass[cls].male++; else byClass[cls].female++;
      });

      autoTable(doc, {
        startY: y,
        head: [['Class', 'Total', 'Active', 'Inactive', 'Male', 'Female']],
        body: Object.entries(byClass).map(([cls, d]) => [
          cls, d.total, d.active, d.inactive, d.male, d.female
        ]),
        headStyles: { fillColor: [22, 163, 74], textColor: 255, fontStyle: 'bold', fontSize: 9 },
        bodyStyles: { fontSize: 8 },
        alternateRowStyles: { fillColor: [240, 253, 244] },
        margin: { left: 14, right: 14 },
      });

      y = doc.lastAutoTable.finalY + 14;

      if (attendance.length > 0) {
        doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(30, 58, 95);
        doc.text('Attendance Records', 14, y);
        y += 4;
        autoTable(doc, {
          startY: y,
          head: [['Student', 'Date', 'Status', 'Class']],
          body: attendance.slice(0, 50).map(a => [
            a.studentName || `Student #${a.studentId}`,
            a.date ? new Date(a.date).toLocaleDateString() : '—',
            a.status,
            a.className || '—',
          ]),
          headStyles: { fillColor: [30, 58, 95], textColor: 255, fontStyle: 'bold', fontSize: 9 },
          bodyStyles: { fontSize: 8 },
          alternateRowStyles: { fillColor: [248, 250, 252] },
          margin: { left: 14, right: 14 },
        });
      }

      download(doc, `Attendance_Report_${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (err) {
      console.error('PDF error:', err);
      alert('Error: ' + err.message);
    } finally {
      setGenerating('');
    }
  };

  // ── Marks Report ─────────────────────────────────────────
  const generateMarksReport = async () => {
    try {
      setGenerating('marks');
      const doc = new jsPDF();
      let y = addHeader(doc, 'Academic Marks Report', `Entries: ${marks.length}`);

      const gradeDist = { 'A+': 0, A: 0, B: 0, C: 0, D: 0, F: 0 };
      marks.forEach(m => {
        const g = m.grade || 'F';
        if (gradeDist[g] !== undefined) gradeDist[g]++; else gradeDist['F']++;
      });

      doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(30, 58, 95);
      doc.text('Grade Distribution', 14, y);
      y += 4;

      autoTable(doc, {
        startY: y,
        head: [['Grade', 'Count', 'Percentage']],
        body: Object.entries(gradeDist).map(([g, c]) => [
          g, c, marks.length > 0 ? `${Math.round((c / marks.length) * 100)}%` : '0%'
        ]),
        headStyles: { fillColor: [124, 58, 237], textColor: 255, fontStyle: 'bold', fontSize: 9 },
        bodyStyles: { fontSize: 8 },
        alternateRowStyles: { fillColor: [250, 245, 255] },
        tableWidth: 80,
        margin: { left: 14 },
      });

      y = doc.lastAutoTable.finalY + 14;

      if (marks.length > 0) {
        doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(30, 58, 95);
        doc.text('All Marks', 14, y);
        y += 4;
        autoTable(doc, {
          startY: y,
          head: [['#', 'Student', 'Subject', 'Exam Type', 'Marks', 'Grade', 'Year']],
          body: marks.map((m, i) => [
            i + 1,
            m.studentName || `Student #${m.studentId}`,
            m.subjectName || `Subject #${m.subjectId}`,
            m.examType || '—',
            m.marks,
            m.grade,
            m.academicYear || '—',
          ]),
          headStyles: { fillColor: [30, 58, 95], textColor: 255, fontStyle: 'bold', fontSize: 8 },
          bodyStyles: { fontSize: 7.5 },
          alternateRowStyles: { fillColor: [248, 250, 252] },
          margin: { left: 14, right: 14 },
        });
      }

      download(doc, `Marks_Report_${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (err) {
      console.error('PDF error:', err);
      alert('Error: ' + err.message);
    } finally {
      setGenerating('');
    }
  };

  // ── Teachers Report ──────────────────────────────────────
  const generateTeachersReport = async () => {
    try {
      setGenerating('teachers');
      const doc = new jsPDF();
      let y = addHeader(doc, 'Teachers Report', `Total: ${teachers.length}`);

      const active  = teachers.filter(t => t.status === 'Active').length;
      const withAcc = teachers.filter(t => t.userId).length;

      doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(80, 80, 80);
      doc.text(`Total: ${teachers.length}  |  Active: ${active}  |  With Login Account: ${withAcc}`, 14, y);
      y += 10;

      autoTable(doc, {
        startY: y,
        head: [['#', 'Full Name', 'Email', 'Phone', 'Subject', 'Gender', 'Status', 'Login']],
        body: teachers.map((t, i) => [
          i + 1,
          t.fullName,
          t.email,
          t.phone || '—',
          t.subject || '—',
          t.gender || '—',
          t.status,
          t.userId ? 'Yes' : 'No',
        ]),
        headStyles: { fillColor: [30, 58, 95], textColor: 255, fontStyle: 'bold', fontSize: 8 },
        bodyStyles: { fontSize: 7.5 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: { 2: { cellWidth: 38 } },
        margin: { left: 14, right: 14 },
      });

      download(doc, `Teachers_Report_${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (err) {
      console.error('PDF error:', err);
      alert('Error: ' + err.message);
    } finally {
      setGenerating('');
    }
  };

  // ── UI ───────────────────────────────────────────────────
  const reports = [
    {
      key: 'students', icon: '🎓', title: 'Students Report',
      desc: 'All students with admission numbers, class, gender, academic year and status.',
      count: `${students.length} students`, color: '#2563eb', bg: '#eff6ff',
      action: generateStudentsReport,
    },
    {
      key: 'attendance', icon: '✅', title: 'Attendance Report',
      desc: 'Student counts per class (male/female/active/inactive) plus attendance records.',
      count: `${attendance.length} records`, color: '#16a34a', bg: '#f0fdf4',
      action: generateAttendanceReport,
    },
    {
      key: 'marks', icon: '📝', title: 'Marks Report',
      desc: 'Grade distribution summary and full marks table with student and subject names.',
      count: `${marks.length} entries`, color: '#7c3aed', bg: '#faf5ff',
      action: generateMarksReport,
    },
    {
      key: 'teachers', icon: '👨‍🏫', title: 'Teachers Report',
      desc: 'All teachers with subject, phone, gender, status and login account status.',
      count: `${teachers.length} teachers`, color: '#d97706', bg: '#fffbeb',
      action: generateTeachersReport,
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: '0 0 6px', fontSize: '1.6rem', fontWeight: '800', color: '#1e3a5f' }}>📊 Reports</h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Generate and download PDF reports for school records.</p>
      </div>

      {loading ? (
        <div style={{ background: 'white', borderRadius: '16px', padding: '60px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⏳</div>
          <p style={{ color: '#94a3b8' }}>Loading data...</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
          {reports.map(r => (
            <div key={r.key} style={{
              background: 'white', borderRadius: '16px', padding: '24px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderTop: `4px solid ${r.color}`,
              display: 'flex', flexDirection: 'column', gap: '14px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '13px', background: r.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.6rem', flexShrink: 0,
                }}>{r.icon}</div>
                <div>
                  <div style={{ fontWeight: '800', fontSize: '1rem', color: '#1e3a5f' }}>{r.title}</div>
                  <div style={{
                    display: 'inline-block', background: r.bg, color: r.color,
                    borderRadius: '20px', padding: '2px 10px', fontSize: '0.75rem', fontWeight: '700', marginTop: '3px'
                  }}>{r.count}</div>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>{r.desc}</p>
              <button onClick={r.action} disabled={generating === r.key} style={{
                background: generating === r.key ? '#f1f5f9' : `linear-gradient(135deg, ${r.color}, ${r.color}cc)`,
                color: generating === r.key ? '#94a3b8' : 'white',
                border: 'none', borderRadius: '10px', padding: '12px 20px',
                fontWeight: '700', fontSize: '0.875rem',
                cursor: generating === r.key ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: generating === r.key ? 'none' : `0 4px 12px ${r.color}40`,
              }}>
                {generating === r.key ? '⏳ Generating PDF...' : '📥 Download PDF'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}