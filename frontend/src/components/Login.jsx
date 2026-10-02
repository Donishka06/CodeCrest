import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../store/slices/authSlice';

const Login = () => {
  const [selectedRole, setSelectedRole] = useState('STUDENT');
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth || {});

  // Ensure login fields are strictly empty upon component mount
  useEffect(() => {
    setFormData({ username: '', password: '' });
  }, []);

  const roleConfigs = {
    STUDENT: {
      name: 'Student',
      buttonGradient: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
      btnClass: 'role-student',
      colorVar: '#2563eb'
    },
    SETTER: {
      name: 'Setter',
      buttonGradient: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
      btnClass: 'role-setter',
      colorVar: '#7c3aed'
    },
    ADMIN: {
      name: 'Admin',
      buttonGradient: 'linear-gradient(135deg, #d97706, #b45309)',
      btnClass: 'role-admin',
      colorVar: '#d97706'
    }
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setFormData({ username: '', password: '' });
    setNotification('');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotification('');

    const trimmedCredentials = {
      username: formData.username.trim(),
      password: formData.password.trim()
    };

    try {
      const result = await dispatch(loginUser(trimmedCredentials));
      if (loginUser.fulfilled.match(result)) {
        setNotification('Login successful!');
        navigate('/dashboard');
      } else {
        if (result.payload === 'Network Error' || result.error?.message?.includes('Network Error')) {
          setNotification('Backend server is offline. Please run "mvn spring-boot:run" in backend.');
        }
      }
    } catch (err) {
      setNotification('Server connection error. Ensure backend is running on port 8080.');
    }
  };

  const currentRole = roleConfigs[selectedRole] || roleConfigs.STUDENT;

  return (
    <div className="login-split-page">
      <div className="login-split-card login-container glass-card">
        {/* ============================================================ */}
        {/* LEFT PANEL: Ultra-Minimal Developer Branding                 */}
        {/* ============================================================ */}
        <div className="login-branding-panel">
          <div className="login-branding-grid" aria-hidden="true" />

          <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
            {/* CodeCrest Logo & Name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #2563eb, #38bdf8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                  flexShrink: 0
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 18 22 12 16 6"></polyline>
                  <polyline points="8 6 2 12 8 18"></polyline>
                </svg>
              </div>
              <div>
                <span
                  style={{
                    fontSize: '26px',
                    fontWeight: '800',
                    color: 'var(--text-main)',
                    letterSpacing: '-0.5px',
                    display: 'block',
                    lineHeight: '1.2'
                  }}
                >
                  CodeCrest
                </span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>
                  Competitive Programming Platform
                </span>
              </div>
            </div>

            {/* Tagline */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '5px 12px',
                borderRadius: '20px',
                background: 'rgba(37, 99, 235, 0.08)',
                border: '1px solid rgba(37, 99, 235, 0.18)',
                color: 'var(--primary)',
                fontSize: '12px',
                fontWeight: '700',
                letterSpacing: '0.4px'
              }}
            >
              Code. Compete. Lead.
            </div>

            {/* Subtle Abstract Developer Visual */}
            <div className="login-abstract-visual" aria-hidden="true">
              <svg width="240" height="150" viewBox="0 0 240 150" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="1.5" fill="currentColor" opacity="0.25" />
                <circle cx="60" cy="20" r="1.5" fill="currentColor" opacity="0.25" />
                <circle cx="100" cy="20" r="1.5" fill="currentColor" opacity="0.25" />
                <circle cx="140" cy="20" r="1.5" fill="currentColor" opacity="0.25" />
                <circle cx="180" cy="20" r="1.5" fill="currentColor" opacity="0.25" />
                <circle cx="220" cy="20" r="1.5" fill="currentColor" opacity="0.25" />

                <circle cx="20" cy="130" r="1.5" fill="currentColor" opacity="0.25" />
                <circle cx="60" cy="130" r="1.5" fill="currentColor" opacity="0.25" />
                <circle cx="100" cy="130" r="1.5" fill="currentColor" opacity="0.25" />
                <circle cx="140" cy="130" r="1.5" fill="currentColor" opacity="0.25" />
                <circle cx="180" cy="130" r="1.5" fill="currentColor" opacity="0.25" />
                <circle cx="220" cy="130" r="1.5" fill="currentColor" opacity="0.25" />

                <path d="M70 45L35 75L70 105" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
                <path d="M135 35L105 115" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.45" />
                <path d="M170 45L205 75L170 105" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
              </svg>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT PANEL: Clean Professional Login Card                   */}
        {/* ============================================================ */}
        <div className="login-form-panel">
          {/* Card Header with CodeCrest Login Eyebrow */}
          <div style={{ marginBottom: '20px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: '800',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: currentRole.colorVar,
                marginBottom: '6px',
                display: 'inline-block'
              }}
            >
              CodeCrest Login
            </span>
            <h2
              style={{
                fontSize: '26px',
                fontWeight: '800',
                color: 'var(--text-main)',
                margin: '0 0 6px 0',
                letterSpacing: '-0.5px'
              }}
            >
              Welcome back
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
              Sign in to continue to CodeCrest
            </p>
          </div>

          {/* Role Selection Segmented Control */}
          <div style={{ marginBottom: '20px' }}>
            <div
              style={{
                display: 'flex',
                gap: '4px',
                background: 'var(--bg-app)',
                padding: '4px',
                borderRadius: '10px',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <button
                type="button"
                className={`role-segmented-btn ${selectedRole === 'STUDENT' ? 'active role-student' : ''}`}
                onClick={() => handleRoleSelect('STUDENT')}
                aria-pressed={selectedRole === 'STUDENT'}
              >
                Student
              </button>
              <button
                type="button"
                className={`role-segmented-btn ${selectedRole === 'SETTER' ? 'active role-setter' : ''}`}
                onClick={() => handleRoleSelect('SETTER')}
                aria-pressed={selectedRole === 'SETTER'}
              >
                Setter
              </button>
              <button
                type="button"
                className={`role-segmented-btn ${selectedRole === 'ADMIN' ? 'active role-admin' : ''}`}
                onClick={() => handleRoleSelect('ADMIN')}
                aria-pressed={selectedRole === 'ADMIN'}
              >
                Admin
              </button>
            </div>
          </div>

          {/* Notifications & Error Alerts */}
          {notification && (
            <div
              className="alert alert-info"
              style={{
                padding: '10px 14px',
                background: 'rgba(59, 130, 246, 0.12)',
                color: '#3b82f6',
                border: '1px solid rgba(59, 130, 246, 0.25)',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '13px',
                fontWeight: '600'
              }}
            >
              {notification}
            </div>
          )}

          {error && (
            <div
              className="alert alert-danger"
              style={{
                padding: '10px 14px',
                background: 'rgba(239, 68, 68, 0.12)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '13px',
                fontWeight: '600'
              }}
            >
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} autoComplete="off">
            {/* Username Field */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label
                htmlFor="username"
                style={{
                  display: 'block',
                  fontWeight: '600',
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  marginBottom: '6px'
                }}
              >
                Username or Email
              </label>
              <input
                id="username"
                type="text"
                name="username"
                className="form-control login-input"
                placeholder="Enter username or email"
                value={formData.username}
                onChange={handleChange}
                required
                autoComplete="off"
              />
            </div>

            {/* Password Field */}
            <div className="form-group" style={{ marginBottom: '22px' }}>
              <label
                htmlFor="password"
                style={{
                  display: 'block',
                  fontWeight: '600',
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  marginBottom: '6px'
                }}
              >
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="form-control login-input"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                  style={{ paddingRight: '44px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    padding: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-muted)',
                    transition: 'color 0.15s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-main)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="action-btn-t27"
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: currentRole.buttonGradient,
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '14px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.75 : 1,
                boxShadow: `0 2px 8px ${currentRole.colorVar}35`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {loading ? (
                <>
                  <span
                    style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      borderTopColor: '#ffffff',
                      borderRadius: '50%',
                      display: 'inline-block',
                      animation: 'spin 0.8s linear infinite'
                    }}
                  />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign in to {currentRole.name} Portal</span>
              )}
            </button>
          </form>

          {/* Registration Redirect Footer */}
          <div
            style={{
              marginTop: '22px',
              textAlign: 'center',
              fontSize: '13px',
              color: 'var(--text-muted)'
            }}
          >
            Don't have an account?{' '}
            <Link
              to="/register"
              style={{
                color: 'var(--primary)',
                fontWeight: '700',
                textDecoration: 'none',
                marginLeft: '4px'
              }}
            >
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
