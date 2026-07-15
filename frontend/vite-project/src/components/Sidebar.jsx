import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const roleConfig = {
  Admin: {
    color: '#fbbf24',
    bg: 'linear-gradient(180deg, #1e1b4b 0%, #312e81 40%, #1d4ed8 100%)',
    links: [
      { path: '/admin/dashboard',     label: 'Dashboard',     icon: '🏠', color: '#60a5fa' },
      { path: '/admin/students',      label: 'Students',      icon: '🎓', color: '#34d399' },
      { path: '/admin/teachers',      label: 'Teachers',      icon: '👨‍🏫', color: '#f472b6' },
      { path: '/admin/classes',       label: 'Classes',       icon: '🏫', color: '#fbbf24' },
      { path: '/admin/subjects',      label: 'Subjects',      icon: '📚', color: '#a78bfa' },
      { path: '/admin/announcements', label: 'Announcements', icon: '📢', color: '#fb923c' },
      { path: '/admin/reports',       label: 'Reports',       icon: '📊', color: '#22d3ee' },
      { path: '/admin/schedule', label: 'Schedules', icon: '📅', color: '#22d3ee' },
      { path: '/admin/donors', label: 'Donors', icon: '🍱', color: '#22d3ee' },
      { path: '/admin/users', label: 'User Management', icon: '👥', color: '#f472b6' },
    ]
  },
  Teacher: {
    color: '#34d399',
    bg: 'linear-gradient(180deg, #064e3b 0%, #065f46 40%, #047857 100%)',
    links: [
      { path: '/teacher/dashboard',  label: 'Dashboard',      icon: '🏠', color: '#6ee7b7' },
      { path: '/teacher/attendance', label: 'Mark Attendance', icon: '✅', color: '#34d399' },
      { path: '/teacher/marks',      label: 'Enter Marks',    icon: '📝', color: '#60a5fa' },
      { path: '/teacher/schedule',   label: 'My Schedule',    icon: '📅', color: '#fbbf24' },
      { path: '/teacher/requests',   label: 'View Requests',  icon: '📨', color: '#f472b6' },
    ]
  },
  Student: {
    color: '#a78bfa',
    bg: 'linear-gradient(180deg, #2e1065 0%, #4c1d95 40%, #6d28d9 100%)',
    links: [
      { path: '/student/dashboard',  label: 'Dashboard',      icon: '🏠', color: '#c4b5fd' },
      { path: '/student/attendance', label: 'View Attendance', icon: '✅', color: '#34d399' },
      { path: '/student/marks',      label: 'My Marks',       icon: '📝', color: '#60a5fa' },
      { path: '/student/schedule',   label: 'Class Schedule',  icon: '📅', color: '#fbbf24' },
      { path: '/student/requests',   label: 'My Requests',    icon: '📨', color: '#fb923c' },
    ]
  }
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const config = roleConfig[user?.role] || roleConfig.Admin;
  const links  = config.links;

  const handleLogout = () => { logout(); navigate('/login'); setIsOpen(false); };

  return (
    <>
      {/* Hamburger */}
      <button className="hamburger" onClick={() => setIsOpen(!isOpen)}
        style={{ background: '#1e3a5f', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 11px', fontSize: '1.2rem', cursor: 'pointer', position: 'fixed', top: '12px', left: '12px', zIndex: 1100, display: 'none' }}>
        {isOpen ? '✕' : '☰'}
      </button>

      {/* Overlay */}
      <div onClick={() => setIsOpen(false)} style={{
        display: isOpen ? 'block' : 'none',
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.5)', zIndex: 999
      }} />

      {/* Sidebar */}
      <div style={{
        width: '240px',
        height: '100vh',
        background: config.bg,
        position: 'fixed',
        left: 0, top: 0,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
        boxShadow: '4px 0 24px rgba(0,0,0,0.3)',
        overflowY: 'auto',
        overflowX: 'hidden',
        transition: 'transform 0.3s ease',
      }}>

        {/* Logo */}
        <div style={{
          padding: '18px 16px 14px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          flexShrink: 0
        }}>
          <div style={{ fontSize: '1.2rem', fontWeight: '800', color: config.color, letterSpacing: '0.5px' }}>
            🏫 Olcott SchoolIMS
          </div>
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: '3px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {user?.role} Panel
          </div>
        </div>

        {/* Language Toggle */}
        <div style={{ padding: '10px 12px 6px', flexShrink: 0 }}>
          <button onClick={toggleLanguage} style={{
            width: '100%',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '8px',
            padding: '7px 12px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            fontWeight: '600',
            transition: 'background 0.2s',
          }}>
            {language === 'en' ? '🇱🇰 සිංහල' : '🇬🇧 English'}
          </button>
        </div>

        {/* User Card */}
        <div style={{
          margin: '6px 12px 10px',
          background: 'rgba(255,255,255,0.08)',
          borderRadius: '12px',
          padding: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexShrink: 0,
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{
            width: '38px', height: '38px',
            borderRadius: '50%',
            background: config.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1rem', fontWeight: '800',
            color: '#1e1b4b', flexShrink: 0
          }}>
            {user?.name?.[0] || 'U'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ color: 'white', fontSize: '0.85rem', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.72rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email}
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav style={{ flex: 1, padding: '4px 8px' }}>
          {links.map(link => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '10px',
                marginBottom: '3px',
                textDecoration: 'none',
                transition: 'all 0.18s',
                background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                border: isActive ? `1px solid rgba(255,255,255,0.2)` : '1px solid transparent',
              })}
            >
              {({ isActive }) => (
                <>
                  <div style={{
                    width: '34px', height: '34px',
                    borderRadius: '9px',
                    background: isActive ? link.color : 'rgba(255,255,255,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1rem', flexShrink: 0,
                    transition: 'all 0.18s',
                    boxShadow: isActive ? `0 4px 12px ${link.color}50` : 'none'
                  }}>
                    {link.icon}
                  </div>
                  <span style={{
                    color: isActive ? 'white' : 'rgba(255,255,255,0.7)',
                    fontSize: '0.88rem',
                    fontWeight: isActive ? '700' : '500',
                    transition: 'all 0.18s',
                  }}>
                    {t(link.label.toLowerCase().replace(/ /g, '')) || link.label}
                  </span>
                  {isActive && (
                    <div style={{
                      marginLeft: 'auto',
                      width: '6px', height: '6px',
                      borderRadius: '50%',
                      background: link.color,
                      flexShrink: 0
                    }} />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
          <button onClick={handleLogout} style={{
            width: '100%',
            background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
            color: 'white',
            border: 'none',
            padding: '11px',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '0.88rem',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(220,38,38,0.4)',
            transition: 'all 0.2s',
          }}>
            🚪 {t('logout')}
          </button>
        </div>
      </div>
    </>
  );
}