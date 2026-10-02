import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const RecentActivity = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await api.get('/submissions/me');
        if (res && Array.isArray(res.data)) {
          setSubmissions(res.data);
        }
      } catch (e) {
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  return (
    <div className="glass-card" style={{ padding: '24px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
      <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '800', color: 'var(--text-main)' }}>Recent Activity</h3>
      <p style={{ margin: '0 0 16px 0', color: 'var(--text-muted)', fontSize: '13px' }}>Your latest code evaluation attempts and verdicts</p>
      {loading ? (
        <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '12px' }}>Loading submissions...</div>
      ) : submissions.length > 0 ? (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {submissions.slice(-5).reverse().map((sub, idx) => (
            <li key={sub.id || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <span style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '14px', display: 'block' }}>{sub.challenge?.title || `Challenge #${sub.challengeId || '1'}`}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                  {sub.submittedAt ? new Date(sub.submittedAt).toLocaleTimeString() : 'Recently'}
                </span>
              </div>
              <span className={sub.verdict} style={{
                padding: '4px 10px',
                borderRadius: '9999px',
                fontSize: '11px',
                fontWeight: '800',
                letterSpacing: '0.5px',
                background: sub.verdict === 'ACCEPTED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: sub.verdict === 'ACCEPTED' ? '#10b981' : '#ef4444',
                border: `1px solid ${sub.verdict === 'ACCEPTED' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
              }}>
                {sub.verdict}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '16px', padding: '24px 0', textAlign: 'center' }}>
          No submissions yet. Solve a challenge to see history!
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
