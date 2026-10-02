import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import challengeService from '../../services/challengeService';
import contestService from '../../services/contestService';
import api from '../../services/api';

const SetterDashboard = () => {
  const [challenges, setChallenges] = useState([]);
  const [contests, setContests] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cRes, contRes, subRes] = await Promise.allSettled([
          challengeService.getChallenges(0, 100),
          contestService.getAll(0, 50),
          api.get('/submissions?size=20')
        ]);

        if (cRes.status === 'fulfilled') {
          const list = cRes.value?.content || (Array.isArray(cRes.value) ? cRes.value : []);
          setChallenges(list);
        }
        if (contRes.status === 'fulfilled') {
          const list = contRes.value?.content || (Array.isArray(contRes.value) ? contRes.value : []);
          setContests(list);
        }
        if (subRes.status === 'fulfilled') {
          const list = subRes.value?.data?.content || (Array.isArray(subRes.value?.data) ? subRes.value.data : []);
          setSubmissions(list);
        }
      } catch (err) {
        console.error('Failed to load setter dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const easyCount = challenges.filter(c => (c.difficulty || '').toUpperCase() === 'EASY').length;
  const mediumCount = challenges.filter(c => (c.difficulty || '').toUpperCase() === 'MEDIUM').length;
  const hardCount = challenges.filter(c => (c.difficulty || '').toUpperCase() === 'HARD').length;

  const activeContests = contests.filter(c => (c.status || '').toUpperCase() === 'ACTIVE').length;
  const totalContests = contests.length;

  if (loading) {
    return (
      <div style={{ padding: '48px 24px', maxWidth: '1240px', margin: '0 auto', textAlign: 'center', color: 'var(--text-muted)' }}>
        <p style={{ fontSize: '16px', fontWeight: '600' }}>Loading Problem Setter Workspace...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '28px 24px', maxWidth: '1240px', margin: '0 auto', color: 'var(--text-main)', boxSizing: 'border-box' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
              Problem Setter Workspace
            </h1>
            <span style={{
              background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: '800',
              padding: '3px 9px',
              borderRadius: '9999px',
              letterSpacing: '0.6px',
              textTransform: 'uppercase'
            }}>
              Setter Portal
            </span>
          </div>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>
            Author algorithmic challenges, schedule contests, generate question pools with AI, and inspect submissions.
          </p>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link
            to="/ai/generate-questions"
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: '700',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(139, 92, 246, 0.35)'
            }}
          >
            🤖 AI Question Studio
          </Link>
          <Link
            to="/challenges/new"
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface)',
              color: 'var(--text-main)',
              fontSize: '13px',
              fontWeight: '600',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            🧩 New Challenge
          </Link>
          <Link
            to="/contests/new"
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface)',
              color: 'var(--text-main)',
              fontSize: '13px',
              fontWeight: '600',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            🏆 Create Contest
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        <div className="glass-card" style={{ padding: '22px 24px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Available Challenges</span>
            <span style={{ fontSize: '20px' }}>🧩</span>
          </div>
          <p style={{ margin: 0, fontSize: '30px', fontWeight: '800', color: '#8b5cf6' }}>{challenges.length}</p>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>Platform coding problem catalog</span>
        </div>

        <div className="glass-card" style={{ padding: '22px 24px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Contests</span>
            <span style={{ fontSize: '20px' }}>🏆</span>
          </div>
          <p style={{ margin: 0, fontSize: '30px', fontWeight: '800', color: '#f59e0b' }}>{totalContests}</p>
          <span style={{ fontSize: '12px', color: '#10b981', fontWeight: '600', marginTop: '4px', display: 'block' }}>{activeContests} Active Contests running</span>
        </div>

        <div className="glass-card" style={{ padding: '22px 24px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>AI Generation</span>
            <span style={{ fontSize: '20px' }}>🤖</span>
          </div>
          <p style={{ margin: 0, fontSize: '30px', fontWeight: '800', color: '#3b82f6' }}>Active</p>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>Mixed difficulty & algorithmic synthesis</span>
        </div>
      </div>

      {/* Main Workspace Split */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px' }}>
        
        {/* Difficulty Distribution Card */}
        <div className="glass-card" style={{ padding: '24px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '800', color: 'var(--text-main)' }}>
            Challenge Difficulty Distribution
          </h3>
          <p style={{ margin: '0 0 16px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
            Inventory balance across Easy, Medium, and Hard tiers
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
            {[
              { level: 'Easy', count: easyCount, color: '#10b981', pts: '100 pts' },
              { level: 'Medium', count: mediumCount, color: '#f59e0b', pts: '200 pts' },
              { level: 'Hard', count: hardCount, color: '#ef4444', pts: '300 pts' }
            ].map(({ level, count, color, pts }) => {
              const pct = challenges.length > 0 ? Math.round((count / challenges.length) * 100) : 0;
              return (
                <div key={level}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '700', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-main)' }}>{level} ({pts})</span>
                    <span style={{ color }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ height: '8px', background: 'var(--border-subtle)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '9999px', transition: 'width 0.4s' }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '24px', textAlign: 'right' }}>
            <Link to="/challenges" style={{ color: 'var(--primary)', fontSize: '12px', fontWeight: '700', textDecoration: 'none' }}>
              Manage Challenge Catalog →
            </Link>
          </div>
        </div>

        {/* Recent Submissions Feed */}
        <div className="glass-card" style={{ padding: '24px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '800', color: 'var(--text-main)' }}>
            Recent Code Evaluations
          </h3>
          <p style={{ margin: '0 0 16px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
            Latest contestant attempts across authored challenges
          </p>

          {submissions.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {submissions.slice(0, 5).map((sub, idx) => (
                <li key={sub.id || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div>
                    <span style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '13px', display: 'block' }}>
                      {sub.challenge?.title || `Challenge #${sub.challengeId || '1'}`}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                      by {sub.contestant?.username || 'contestant'} · {sub.submittedAt ? new Date(sub.submittedAt).toLocaleTimeString() : 'Recently'}
                    </span>
                  </div>
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: '9999px',
                    fontSize: '10px',
                    fontWeight: '800',
                    background: sub.verdict === 'ACCEPTED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: sub.verdict === 'ACCEPTED' ? '#10b981' : '#ef4444',
                    border: `1px solid ${sub.verdict === 'ACCEPTED' ? '#10b98130' : '#ef444430'}`
                  }}>
                    {sub.verdict}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
              No evaluation attempts recorded yet.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default SetterDashboard;
