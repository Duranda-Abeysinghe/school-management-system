import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import API from '../api/axios';

const demoUsers = {
  Admin:   { email: 'admin@school.com',   password: 'admin123'   },
  Teacher: { email: 'teacher@school.com', password: 'teacher123' },
  Student: { email: 'student@school.com', password: 'student123' },
};

export default function Login() {
  const [selectedRole, setSelectedRole] = useState('Admin');
  const [form, setForm]     = useState({ email: 'admin@school.com', password: 'admin123' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const { language, toggleLanguage, t } = useLanguage();

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setForm({ email: demoUsers[role].email, password: demoUsers[role].password });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await API.post('/auth/login', {
        email: form.email,
        password: form.password
      });
      login(res.data.data.user, res.data.data.token);
      navigate(`/${res.data.data.user.role.toLowerCase()}/dashboard`);
    } catch {
      setError(t('invalidLogin'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">

        {/* Language Toggle */}
        <div style={{ textAlign: 'right', marginBottom: '12px' }}>
          <button
            onClick={toggleLanguage}
            style={{
              background: '#f0f4ff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '6px 14px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              color: '#2563eb',
              fontWeight: '600'
            }}
          >
            {language === 'en' ? '🇱🇰 සිංහල' : '🇬🇧 English'}
          </button>
        </div>

        <div className="login-logo">
          <div className="icon">🏫</div>
          <h2>{t('systemTitle')}</h2>
          <p>{t('systemSubtitle')}</p>
        </div>

        <div className="role-selector">
          {['Admin', 'Teacher', 'Student'].map(role => (
            <button
              key={role}
              className={`role-btn ${selectedRole === role ? 'active' : ''}`}
              onClick={() => handleRoleSelect(role)}
              type="button"
            >
              {role === 'Admin' ? '👨‍💼' : role === 'Teacher' ? '👨‍🏫' : '🎓'} {role}
            </button>
          ))}
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('emailAddress')}</label>
            <input
              type="email" required
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder={t('enterEmail')}
            />
          </div>
          <div className="form-group">
            <label>{t('password')}</label>
            <input
              type="password" required
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder={t('enterPassword')}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary w-full btn-lg"
            disabled={loading}
          >
            {loading ? t('signingIn') : `🔐 ${t('signIn')}`}
          </button>
        </form>

        <div style={{
          marginTop: '20px', background: '#f8fafc',
          borderRadius: '10px', padding: '14px'
        }}>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '8px', fontWeight: '600' }}>
            {t('demoCredentials')}
          </p>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '3px' }}>
            <strong>Admin:</strong> admin@school.com / admin123
          </p>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '3px' }}>
            <strong>Teacher:</strong> teacher@school.com / teacher123
          </p>
          <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
            <strong>Student:</strong> student@school.com / student123
          </p>
        </div>
      </div>
    </div>
  );
}