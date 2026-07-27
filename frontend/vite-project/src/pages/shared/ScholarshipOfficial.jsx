
export default function ScholarshipOfficial() {
  const openOfficialSite = () => {
    window.open('https://doenets.lk/examresults', '_blank', 'noopener,noreferrer');
  };

  return (
    <div>
      <div style={{
        background: 'linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 60%, #7c3aed 100%)',
        borderRadius: '20px', padding: '28px 30px', marginBottom: '24px',
        color: 'white', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '-30px', right: '-20px', width: '130px', height: '130px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
        <p style={{ margin: '0 0 4px', fontSize: '0.8rem', opacity: 0.75, textTransform: 'uppercase', letterSpacing: '1px' }}>
          Government Examination
        </p>
        <h1 style={{ margin: '0 0 6px', fontSize: '1.5rem', fontWeight: '800', color: 'white' }}>
          🏆 Grade 5 Scholarship Result
        </h1>
        <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.85 }}>
          Official results are published by the Department of Examinations, Sri Lanka
        </p>
      </div>

      <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📋</div>
        <h3 style={{ color: '#1e3a5f', marginBottom: '10px' }}>
          Check Your Official Result
        </h3>
        <p style={{ color: '#64748b', maxWidth: '480px', margin: '0 auto 24px', lineHeight: 1.6 }}>
          The Grade 5 Scholarship Examination is conducted by the Sri Lankan
          government, not by this school. Results are only available on the
          official Department of Examinations website. You'll need your{' '}
          <strong>Index Number</strong> to check your result there.
        </p>
        <button className="btn btn-primary btn-lg" onClick={openOfficialSite}>
          🔗 Go to Official Results (doenets.lk)
        </button>
        <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '16px' }}>
          Opens in a new tab — select "Grade 5 Scholarship Examination", year, then enter your index number.
        </p>
      </div>
    </div>
  );
}