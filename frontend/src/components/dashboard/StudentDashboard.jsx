import React from 'react';
import { Link } from 'react-router-dom';
import StatCards from './StatCards';
import DomainChart from './DomainChart';
import RecentActivity from './RecentActivity';

const StudentDashboard = () => (
  <div style={{ padding: '28px 24px', maxWidth: '1240px', margin: '0 auto', color: 'var(--text-main)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
      <div>
        <h1 id="hero-heading-t30" style={{ fontSize: '48px', fontWeight: '800', margin: '0 0 6px 0', color: 'var(--text-main)' }}>CodeCrest Developer Platform</h1>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '15px' }}>
          Track your competitive metrics, practice algorithmic questions, and prepare for upcoming contests.
        </p>
      </div>
      <div>
        <Link
          to="/playground"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: '#ffffff',
            fontWeight: '700',
            fontSize: '13px',
            textDecoration: 'none',
            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
          }}
        >
          <span>⚡</span>
          Open Code Playground
        </Link>
      </div>
    </div>
    <StatCards />
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px' }}>
      <DomainChart />
      <RecentActivity />
    </div>
  </div>
);

export default StudentDashboard;
