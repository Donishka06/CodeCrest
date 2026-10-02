import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../../store/slices/authSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useSelector((state) => state.auth || {});

  // Initialize theme from localStorage or default to dark (developer preference)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('codecrest-theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('codecrest-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const role = (user?.role || '').toUpperCase();
  const username = (user?.username || '').toLowerCase();

  const isAdmin = Boolean(
    user && (
      role.includes('ADMIN') ||
      role === 'PLATFORM_ADMIN' ||
      role === 'ROLE_ADMIN' ||
      username === 'admin'
    )
  );

  const isSetter = Boolean(
    user && (
      role.includes('SETTER') ||
      role === 'PROBLEM_SETTER' ||
      role === 'ROLE_PROBLEM_SETTER' ||
      username === 'setter'
    )
  );

  const isContestant = Boolean(isAuthenticated && !isAdmin && !isSetter);

  const linkStyle = (path) => ({
    color: isActive(path) ? 'var(--primary)' : 'var(--nav-text)',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: isActive(path) ? '700' : '500',
    padding: '6px 12px',
    borderRadius: '6px',
    background: isActive(path) ? 'var(--primary-subtle)' : 'transparent',
    transition: 'all 0.15s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  });

  return (
    <nav
      role="navigation"
      className="navbar"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 24px',
        background: 'var(--nav-bg)',
        color: 'var(--nav-text)',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      <div className="navbar-brand" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Link
          to={isAuthenticated ? "/dashboard" : "/"}
          style={{
            color: 'var(--primary)',
            fontSize: '20px',
            fontWeight: '800',
            textDecoration: 'none',
            letterSpacing: '-0.02em',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span style={{
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            color: '#fff',
            padding: '2px 8px',
            borderRadius: '6px',
            fontSize: '14px',
            fontFamily: 'monospace',
            fontWeight: 'bold'
          }}>
            &lt;/&gt;
          </span>
          CodeCrest
        </Link>
      </div>

      <div className="navbar-links" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        {isAuthenticated ? (
          <>
            <Link to="/dashboard" style={linkStyle('/dashboard')}>Dashboard</Link>
            <Link to="/challenges" style={linkStyle('/challenges')}>Challenges</Link>
            <Link to="/contests" style={linkStyle('/contests')}>Contests</Link>
            <Link to="/leaderboard" style={linkStyle('/leaderboard')}>Leaderboard</Link>
            {isContestant && (
              <Link to="/playground" style={linkStyle('/playground')}>Playground</Link>
            )}
            {isContestant && (
              <Link to="/profile" style={linkStyle('/profile')}>Profile</Link>
            )}
            
            <div style={{ width: '1px', height: '22px', background: 'var(--border-subtle)', margin: '0 4px' }} />

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              style={{
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-main)',
                padding: '6px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
            >
              {theme === 'dark' ? (
                // Sun Icon for Dark Mode
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
              ) : (
                // Moon Icon for Light Mode
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              )}
            </button>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginLeft: '6px' }}>
              <span style={{
                fontSize: '13px',
                color: 'var(--text-secondary)',
                background: 'var(--bg-surface-elevated)',
                padding: '4px 10px',
                borderRadius: '16px',
                border: '1px solid var(--border-subtle)',
                fontWeight: '500'
              }}>
                Welcome, <strong style={{ color: 'var(--text-main)' }}>{user?.username || 'User'}</strong>
              </span>
              <button
                onClick={handleLogout}
                style={{
                  padding: '6px 14px',
                  background: 'var(--danger)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                  transition: 'opacity 0.2s'
                }}
              >
                Logout
              </button>
            </div>
          </>
        ) : (
          <>
            <Link to="/" style={linkStyle('/')}>Home</Link>
            <Link to="/login" style={linkStyle('/login')}>Login</Link>
            <Link
              to="/register"
              style={{
                padding: '6px 16px',
                background: 'var(--primary)',
                color: '#fff',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '13px',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              Register
            </Link>

            {/* Theme Toggle Button for Unauthenticated */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              style={{
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-main)',
                padding: '6px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: '4px'
              }}
            >
              {theme === 'dark' ? (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
              ) : (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              )}
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
