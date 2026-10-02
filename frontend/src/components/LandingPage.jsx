import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px', color: 'var(--text-main)' }}>
      {/* Hero Section */}
      <div style={{ textAlign: 'center', padding: '70px 24px', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)', borderRadius: '18px', color: '#fff', marginBottom: '44px', border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: 'var(--shadow-md)' }}>
        <h1 id="landing-hero-title" style={{ fontSize: '48px', fontWeight: '800', marginBottom: '16px', color: '#60a5fa', letterSpacing: '-0.5px' }}>
          Master Competitive Programming with CodeCrest
        </h1>
        <p style={{ fontSize: '18px', color: '#94a3b8', maxWidth: '700px', margin: '0 auto 36px', lineHeight: '1.6' }}>
          Elevate your algorithmic problem solving skills, compete in real-time programming contests, and climb the global leaderboard.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            to="/login"
            style={{ padding: '13px 32px', background: 'var(--primary)', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: '700', fontSize: '16px', boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)' }}
          >
            Login to Platform
          </Link>
          <Link
            to="/register"
            style={{ padding: '13px 32px', background: 'rgba(255, 255, 255, 0.05)', color: '#60a5fa', border: '1px solid rgba(96, 165, 250, 0.4)', borderRadius: '8px', textDecoration: 'none', fontWeight: '700', fontSize: '16px' }}
          >
            Create Account
          </Link>
        </div>
      </div>

      {/* Feature Highlights */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        <div className="glass-card" style={{ padding: '28px', borderRadius: '14px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚡</div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', margin: '0 0 8px 0' }}>Curated Problem Sets</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.5', margin: 0 }}>
            Practice on algorithmic challenges spanning Easy, Medium, and Hard difficulty ratings with test case feedback.
          </p>
        </div>

        <div className="glass-card" style={{ padding: '28px', borderRadius: '14px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🏆</div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', margin: '0 0 8px 0' }}>Real-time Contests</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.5', margin: 0 }}>
            Enroll in competitive programming contests, submit solutions live, and track score penalty calculations.
          </p>
        </div>

        <div className="glass-card" style={{ padding: '28px', borderRadius: '14px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>📊</div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', margin: '0 0 8px 0' }}>Contestant Leaderboard</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.5', margin: 0 }}>
            Track rank standing amongst contestant peers based on actual problem points earned across challenges and contests.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
