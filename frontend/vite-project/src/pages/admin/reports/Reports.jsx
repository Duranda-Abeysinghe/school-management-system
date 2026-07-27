import { useEffect, useMemo, useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import API from '../../../api/axios';
import schoolLogo from '../../../assets/school-logo.webp';

const SCHOOL_NAME = 'Olcott Primary School, Matara';
const SCHOOL_ADDRESS = 'Matara, Sri Lanka'; // ← replace with the real address

export default function Reports() {
  const [students,   setStudents]   = useState([]);
  const [teachers,   setTeachers]   = useState([]);
  const [marks,      setMarks]      = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [generating, setGenerating] = useState('');
  const [logoBase64, setLogoBase64] = useState(null);

  const [filters, setFilters] = useState({
    classFilter: 'All',
    yearFilter: 'All',
    subjectFilter: 'All',
    examTypeFilter: 'All',
    dateFrom: '',
    dateTo: '',
  });

  useEffect(() => {
    Promise.all([
      API.get('/students').catch(() => ({ data: [] })),
      API.get('/teachers').catch(() => ({ data: [] })),
      API.get('/marks').catch(() => ({ data: [] })),
      API.get('/attendance').catch(() => ({ data: [] })),
    ]).then(([s, t, m, a]) => {
      setStudents(s.data || []);
      setTeachers(t.data || []);
      setMarks(m.data || []);
      setAttendance(a.data || []);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // ── convert logo (any format) to base64 PNG for jsPDF ────
  useEffect(() => {
    const loadImageAsBase64 = (url) =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          canvas.getContext('2d').drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = reject;
        img.src = url;
      });

    loadImageAsBase64(schoolLogo).then(setLogoBase64).catch(console.error);
  }, []);

  const updateFilter = (key, value) => setFilters(p => ({ ...p, [key]: value }));
  const resetFilters = () => setFilters({
    classFilter: 'All', yearFilter: 'All', subjectFilter: 'All',
    examTypeFilter: 'All', dateFrom: '', dateTo: '',
  });

  // ── dropdown option lists, derived from the data itself ──
  const classOptions = useMemo(
    () => [...new Set(students.map(s => s.className).filter(Boolean))].sort(),
    [students]
  );
  const yearOptions = useMemo(
    () => [...new Set([
      ...students.map(s => s.academicYear),
      ...marks.map(m => m.academicYear),
    ].filter(Boolean))].sort(),
    [students, marks]
  );
  const subjectOptions = useMemo(
    () => [...new Set(marks.map(m => m.subjectName).filter(Boolean))].sort(),
    [marks]
  );
  const examTypeOptions = useMemo(
    () => [...new Set(marks.map(m => m.examType).filter(Boolean))].sort(),
    [marks]
  );

  // ── filtered datasets, used by every report below ────────
  const studentClassMap = useMemo(
    () => Object.fromEntries(students.map(s => [s.id, s.className])),
    [students]
  );

  const filteredStudents = useMemo(() => students.filter(s =>
    (filters.classFilter === 'All' || s.className === filters.classFilter) &&
    (filters.yearFilter === 'All' || String(s.academicYear) === filters.yearFilter)
  ), [students, filters]);

  const filteredAttendance = useMemo(() => attendance.filter(a => {
    const clsMatch  = filters.classFilter === 'All' || a.className === filters.classFilter;
    const fromMatch = !filters.dateFrom || new Date(a.date) >= new Date(filters.dateFrom);
    const toMatch   = !filters.dateTo   || new Date(a.date) <= new Date(filters.dateTo);
    return clsMatch && fromMatch && toMatch;
  }), [attendance, filters]);

  const filteredMarks = useMemo(() => marks.filter(m => {
    const yearMatch    = filters.yearFilter === 'All' || String(m.academicYear) === filters.yearFilter;
    const subjectMatch = filters.subjectFilter === 'All' || m.subjectName === filters.subjectFilter;
    const examMatch    = filters.examTypeFilter === 'All' || m.examType === filters.examTypeFilter;
    const classMatch   = filters.classFilter === 'All' || studentClassMap[m.studentId] === filters.classFilter;
    return yearMatch && subjectMatch && examMatch && classMatch;
  }), [marks, filters, studentClassMap]);

  const filteredTeachers = useMemo(() => teachers.filter(t =>
    filters.subjectFilter === 'All' || t.subject === filters.subjectFilter
  ), [teachers, filters]);

  // ── shared header / footer ────────────────────────────────
  const addHeader = (doc, title, subtitle) => {
    doc.setFillColor(30, 58, 95);
    doc.rect(0, 0, 210, 34, 'F');

    if (logoBase64) {
      doc.addImage(logoBase64, 'PNG', 12, 6, 22, 22);
    }

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(SCHOOL_NAME, 40, 14);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(SCHOOL_ADDRESS, 40, 20);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 40, 27);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleString()}`, 140, 12);
    doc.text(subtitle, 140, 17);

    doc.setTextColor(0, 0, 0);
    return 42;
  };

  const addFilterNote = (doc, y) => {
    const active = [];
    if (filters.classFilter !== 'All') active.push(`Class: ${filters.classFilter}`);
    if (filters.yearFilter !== 'All') active.push(`Year: ${filters.yearFilter}`);
    if (filters.subjectFilter !== 'All') active.push(`Subject: ${filters.subjectFilter}`);
    if (filters.examTypeFilter !== 'All') active.push(`Exam: ${filters.examTypeFilter}`);
    if (filters.dateFrom) active.push(`From: ${filters.dateFrom}`);
    if (filters.dateTo) active.push(`To: ${filters.dateTo}`);
    if (active.length === 0) return y;
    doc.setFontSize(8); doc.setTextColor(120, 120, 120);
    doc.text(`Filters applied: ${active.join('  ·  ')}`, 14, y);
    doc.setTextColor(0, 0, 0);
    return y + 7;
  };

  const addFooter = (doc) => {
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setDrawColor(226, 232, 240);
      doc.line(14, 285, 196, 285);
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text(`Confidential — ${SCHOOL_NAME}`, 14, 290);
      doc.text(`Page ${i} of ${pageCount}`, 185, 290);
      doc.setTextColor(0, 0, 0);
    }
  };

  const download = (doc, filename) => doc.save(filename);

  // ── Students Report ──────────────────────────────────────
  const generateStudentsReport = async () => {
    try {
      setGenerating('students');
      const doc = new jsPDF();
      let y = addHeader(doc, 'Students Report', `Total: ${filteredStudents.length}`);
      y = addFilterNote(doc, y);

      const active   = filteredStudents.filter(s => s.status === 'Active').length;
      const inactive = filteredStudents.length - active;
      const male     = filteredStudents.filter(s => s.gender === 'Male').length;
      const female   = filteredStudents.filter(s => s.gender === 'Female').length;

      doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(80, 80, 80);
      doc.text(`Total: ${filteredStudents.length}  |  Active: ${active}  |  Inactive: ${inactive}  |  Male: ${male}  |  Female: ${female}`, 14, y);
      y += 8;

      autoTable(doc, {
        startY: y,
        head: [['#', 'Admission No', 'Full Name', 'Gender', 'Class', 'Year', 'Status']],
        body: filteredStudents.map((s, i) => [
          i + 1, s.admissionNo || '—', s.fullName, s.gender || '—',
          s.className || '—', s.academicYear || '—', s.status,
        ]),
        headStyles: { fillColor: [30, 58, 95], textColor: 255, fontStyle: 'bold', fontSize: 8 },
        bodyStyles: { fontSize: 7.5 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { left: 14, right: 14 },
      });

      addFooter(doc);
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
      let y = addHeader(doc, 'Attendance Report', `Records: ${filteredAttendance.length}`);
      y = addFilterNote(doc, y);

      const relevantStudents = filters.classFilter === 'All'
        ? students
        : students.filter(s => s.className === filters.classFilter);

      const byClass = {};
      relevantStudents.forEach(s => {
        const cls = s.className || 'Unknown';
        if (!byClass[cls]) byClass[cls] = { total: 0, active: 0, inactive: 0, male: 0, female: 0 };
        byClass[cls].total++;
        if (s.status === 'Active') byClass[cls].active++; else byClass[cls].inactive++;
        if (s.gender === 'Male') byClass[cls].male++; else byClass[cls].female++;
      });

      autoTable(doc, {
        startY: y,
        head: [['Class', 'Total', 'Active', 'Inactive', 'Male', 'Female']],
        body: Object.entries(byClass).map(([cls, d]) => [cls, d.total, d.active, d.inactive, d.male, d.female]),
        headStyles: { fillColor: [22, 163, 74], textColor: 255, fontStyle: 'bold', fontSize: 9 },
        bodyStyles: { fontSize: 8 },
        alternateRowStyles: { fillColor: [240, 253, 244] },
        margin: { left: 14, right: 14 },
      });

      y = doc.lastAutoTable.finalY + 10;

      const presentCount = filteredAttendance.filter(a => a.status === 'Present').length;
      const rate = filteredAttendance.length > 0
        ? Math.round((presentCount / filteredAttendance.length) * 100)
        : 0;
      doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(22, 163, 74);
      doc.text(`Attendance Rate: ${rate}% (${presentCount}/${filteredAttendance.length} present)`, 14, y);
      doc.setTextColor(0, 0, 0);
      y += 10;

      if (filteredAttendance.length > 0) {
        doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(30, 58, 95);
        doc.text('Attendance Records', 14, y);
        y += 4;
        autoTable(doc, {
          startY: y,
          head: [['Student', 'Date', 'Status', 'Class']],
          body: filteredAttendance.slice(0, 200).map(a => [
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

      addFooter(doc);
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
      let y = addHeader(doc, 'Academic Marks Report', `Entries: ${filteredMarks.length}`);
      y = addFilterNote(doc, y);

      const gradeDist = { 'A+': 0, A: 0, B: 0, C: 0, D: 0, F: 0 };
      filteredMarks.forEach(m => {
        const g = m.grade || 'F';
        if (gradeDist[g] !== undefined) gradeDist[g]++; else gradeDist['F']++;
      });

      const avg = filteredMarks.length > 0
        ? (filteredMarks.reduce((s, m) => s + Number(m.marks || 0), 0) / filteredMarks.length).toFixed(1)
        : 0;

      doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(124, 58, 237);
      doc.text(`Average Marks: ${avg}`, 14, y);
      doc.setTextColor(0, 0, 0);
      y += 8;

      doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(30, 58, 95);
      doc.text('Grade Distribution', 14, y);
      y += 4;

      autoTable(doc, {
        startY: y,
        head: [['Grade', 'Count', 'Percentage']],
        body: Object.entries(gradeDist).map(([g, c]) => [
          g, c, filteredMarks.length > 0 ? `${Math.round((c / filteredMarks.length) * 100)}%` : '0%'
        ]),
        headStyles: { fillColor: [124, 58, 237], textColor: 255, fontStyle: 'bold', fontSize: 9 },
        bodyStyles: { fontSize: 8 },
        alternateRowStyles: { fillColor: [250, 245, 255] },
        tableWidth: 80,
        margin: { left: 14 },
      });

      y = doc.lastAutoTable.finalY + 14;

      if (filteredMarks.length > 0) {
        doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(30, 58, 95);
        doc.text('All Marks', 14, y);
        y += 4;
        autoTable(doc, {
          startY: y,
          head: [['#', 'Student', 'Subject', 'Exam Type', 'Marks', 'Grade', 'Year']],
          body: filteredMarks.map((m, i) => [
            i + 1,
            m.studentName || `Student #${m.studentId}`,
            m.subjectName || `Subject #${m.subjectId}`,
            m.examType || '—', m.marks, m.grade, m.academicYear || '—',
          ]),
          headStyles: { fillColor: [30, 58, 95], textColor: 255, fontStyle: 'bold', fontSize: 8 },
          bodyStyles: { fontSize: 7.5 },
          alternateRowStyles: { fillColor: [248, 250, 252] },
          margin: { left: 14, right: 14 },
        });
      }

      addFooter(doc);
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
      let y = addHeader(doc, 'Teachers Report', `Total: ${filteredTeachers.length}`);
      y = addFilterNote(doc, y);

      const active  = filteredTeachers.filter(t => t.status === 'Active').length;
      const withAcc = filteredTeachers.filter(t => t.userId).length;

      doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(80, 80, 80);
      doc.text(`Total: ${filteredTeachers.length}  |  Active: ${active}  |  With Login Account: ${withAcc}`, 14, y);
      y += 10;

      autoTable(doc, {
        startY: y,
        head: [['#', 'Full Name', 'Email', 'Phone', 'Subject', 'Gender', 'Status', 'Login']],
        body: filteredTeachers.map((t, i) => [
          i + 1, t.fullName, t.email, t.phone || '—', t.subject || '—',
          t.gender || '—', t.status, t.userId ? 'Yes' : 'No',
        ]),
        headStyles: { fillColor: [30, 58, 95], textColor: 255, fontStyle: 'bold', fontSize: 8 },
        bodyStyles: { fontSize: 7.5 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: { 2: { cellWidth: 38 } },
        margin: { left: 14, right: 14 },
      });

      addFooter(doc);
      download(doc, `Teachers_Report_${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (err) {
      console.error('PDF error:', err);
      alert('Error: ' + err.message);
    } finally {
      setGenerating('');
    }
  };

  // ── Overview Summary Report ──────────────────────────────
  const generateOverviewReport = async () => {
    try {
      setGenerating('overview');
      const doc = new jsPDF();
      let y = addHeader(doc, 'School Overview Summary', `As of ${new Date().toLocaleDateString()}`);
      y = addFilterNote(doc, y);

      const activeStudents = filteredStudents.filter(s => s.status === 'Active').length;
      const activeTeachers = filteredTeachers.filter(t => t.status === 'Active').length;
      const presentCount = filteredAttendance.filter(a => a.status === 'Present').length;
      const attendanceRate = filteredAttendance.length > 0
        ? Math.round((presentCount / filteredAttendance.length) * 100)
        : 0;
      const avgMarks = filteredMarks.length > 0
        ? (filteredMarks.reduce((s, m) => s + Number(m.marks || 0), 0) / filteredMarks.length).toFixed(1)
        : '—';

      autoTable(doc, {
        startY: y,
        head: [['Metric', 'Value']],
        body: [
          ['Active Students', activeStudents],
          ['Active Teachers', activeTeachers],
          ['Attendance Rate', `${attendanceRate}%`],
          ['Average Marks', avgMarks],
        ],
        headStyles: { fillColor: [30, 58, 95], textColor: 255, fontStyle: 'bold', fontSize: 9 },
        bodyStyles: { fontSize: 9 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        tableWidth: 100,
        margin: { left: 14 },
      });

      y = doc.lastAutoTable.finalY + 14;

      const classAvg = {};
      filteredMarks.forEach(m => {
        const cls = studentClassMap[m.studentId] || 'Unknown';
        if (!classAvg[cls]) classAvg[cls] = { total: 0, count: 0 };
        classAvg[cls].total += Number(m.marks || 0);
        classAvg[cls].count += 1;
      });
      const classRanking = Object.entries(classAvg)
        .map(([cls, d]) => ({ cls, avg: d.total / d.count }))
        .sort((a, b) => b.avg - a.avg);

      if (classRanking.length > 0) {
        doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(30, 58, 95);
        doc.text('Class Performance Ranking (by average marks)', 14, y);
        y += 4;
        autoTable(doc, {
          startY: y,
          head: [['Rank', 'Class', 'Average Marks']],
          body: classRanking.map((c, i) => [i + 1, c.cls, c.avg.toFixed(1)]),
          headStyles: { fillColor: [124, 58, 237], textColor: 255, fontStyle: 'bold', fontSize: 9 },
          bodyStyles: { fontSize: 8 },
          alternateRowStyles: { fillColor: [250, 245, 255] },
          tableWidth: 100,
          margin: { left: 14 },
        });
      }

      addFooter(doc);
      download(doc, `Overview_Summary_${new Date().toISOString().slice(0,10)}.pdf`);
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
      key: 'overview', icon: '🧭', title: 'Overview Summary',
      desc: 'One-page snapshot: active counts, attendance rate, average marks, and class performance ranking.',
      count: 'Live summary', color: '#0891b2', bg: '#ecfeff',
      action: generateOverviewReport,
    },
    {
      key: 'students', icon: '🎓', title: 'Students Report',
      desc: 'All students with admission numbers, class, gender, academic year and status.',
      count: `${filteredStudents.length} students`, color: '#2563eb', bg: '#eff6ff',
      action: generateStudentsReport,
    },
    {
      key: 'attendance', icon: '✅', title: 'Attendance Report',
      desc: 'Per-class counts plus attendance records and overall attendance rate.',
      count: `${filteredAttendance.length} records`, color: '#16a34a', bg: '#f0fdf4',
      action: generateAttendanceReport,
    },
    {
      key: 'marks', icon: '📝', title: 'Marks Report',
      desc: 'Grade distribution, average marks, and full marks table.',
      count: `${filteredMarks.length} entries`, color: '#7c3aed', bg: '#faf5ff',
      action: generateMarksReport,
    },
    {
      key: 'teachers', icon: '👨‍🏫', title: 'Teachers Report',
      desc: 'All teachers with subject, phone, gender, status and login account status.',
      count: `${filteredTeachers.length} teachers`, color: '#d97706', bg: '#fffbeb',
      action: generateTeachersReport,
    },
  ];

  const selectStyle = {
    padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0',
    fontSize: '0.82rem', background: 'white', color: '#1e293b', minWidth: '130px',
  };

  return (
    <div>
      <div style={{ marginBottom: '18px' }}>
        <h1 style={{ margin: '0 0 6px', fontSize: '1.6rem', fontWeight: '800', color: '#1e3a5f' }}>📊 Reports</h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Generate and download PDF reports for school records.</p>
      </div>

      <div style={{
        background: 'white', borderRadius: '14px', padding: '16px 18px', marginBottom: '20px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end',
      }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', marginBottom: '4px', fontWeight: '600' }}>CLASS</label>
          <select style={selectStyle} value={filters.classFilter} onChange={e => updateFilter('classFilter', e.target.value)}>
            <option value="All">All Classes</option>
            {classOptions.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', marginBottom: '4px', fontWeight: '600' }}>YEAR</label>
          <select style={selectStyle} value={filters.yearFilter} onChange={e => updateFilter('yearFilter', e.target.value)}>
            <option value="All">All Years</option>
            {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', marginBottom: '4px', fontWeight: '600' }}>SUBJECT</label>
          <select style={selectStyle} value={filters.subjectFilter} onChange={e => updateFilter('subjectFilter', e.target.value)}>
            <option value="All">All Subjects</option>
            {subjectOptions.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', marginBottom: '4px', fontWeight: '600' }}>EXAM TYPE</label>
          <select style={selectStyle} value={filters.examTypeFilter} onChange={e => updateFilter('examTypeFilter', e.target.value)}>
            <option value="All">All Exam Types</option>
            {examTypeOptions.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', marginBottom: '4px', fontWeight: '600' }}>FROM</label>
          <input type="date" style={selectStyle} value={filters.dateFrom} onChange={e => updateFilter('dateFrom', e.target.value)} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', marginBottom: '4px', fontWeight: '600' }}>TO</label>
          <input type="date" style={selectStyle} value={filters.dateTo} onChange={e => updateFilter('dateTo', e.target.value)} />
        </div>
        <button onClick={resetFilters} style={{
          background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px',
          padding: '8px 14px', fontSize: '0.82rem', fontWeight: '600', color: '#475569', cursor: 'pointer',
        }}>
          ↺ Reset
        </button>
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