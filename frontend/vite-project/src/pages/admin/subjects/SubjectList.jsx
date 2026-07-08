import { useState } from 'react';

const initialSubjects = [
  { id: 1, name: 'Mathematics', code: 'MATH01', teacher: 'Mr. Sunil',  type: 'Core'     },
  { id: 2, name: 'Science',     code: 'SCI01',  teacher: 'Ms. Dilani', type: 'Core'     },
  { id: 3, name: 'English',     code: 'ENG01',  teacher: 'Mr. Kamal',  type: 'Core'     },
  { id: 4, name: 'History',     code: 'HIS01',  teacher: 'Ms. Priya',  type: 'Elective' },
  { id: 5, name: 'Geography',   code: 'GEO01',  teacher: 'Mr. Nimal',  type: 'Elective' },
];

export default function SubjectList() {
  const [subjects, setSubjects] = useState(initialSubjects);

  const handleDelete = (id) => {
    if (!confirm('Delete this subject?')) return;
    setSubjects(p => p.filter(s => s.id !== id));
  };

  return (
    <div>
      <div className="page-header">
        <h1>📚 Subjects</h1>
        <button className="btn btn-primary">➕ Add Subject</button>
      </div>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr><th>#</th><th>Subject Name</th><th>Code</th><th>Teacher</th><th>Type</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {subjects.map((s, i) => (
              <tr key={s.id}>
                <td>{i + 1}</td>
                <td><strong>{s.name}</strong></td>
                <td><span className="badge badge-gray">{s.code}</span></td>
                <td>{s.teacher}</td>
                <td>
                  <span className={`badge ${s.type === 'Core' ? 'badge-blue' : 'badge-yellow'}`}>
                    {s.type}
                  </span>
                </td>
                <td>
                  <button onClick={() => handleDelete(s.id)} className="btn btn-danger btn-sm">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}