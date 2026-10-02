import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import challengeService from '../../services/challengeService';

const categorizeChallenge = (challenge) => {
  if (!challenge) return 'Arrays & Strings';
  const title = (challenge.title || '').toLowerCase();
  const desc = (challenge.description || '').toLowerCase();
  const inp = (challenge.inputFormat || '').toLowerCase();
  const fullText = `${title} ${desc} ${inp}`;

  if (/tree|graph|island|depth|breadth|bfs|dfs|node|ladder|cycle|path|topological/.test(fullText)) {
    return 'Trees & Graphs';
  }
  if (/dynamic|dp|coin|subsequence|knapsack|climbing|robber|partition|memo|stock|greedy/.test(fullText)) {
    return 'Dynamic Programming';
  }
  if (/two sum|reverse|anagram|palindrome|substring|prefix|water|array|nums|string|hash|sliding|matrix/.test(fullText)) {
    return 'Arrays & Strings';
  }

  // Deterministic fallback for generic problem names (e.g. Sample Challenge X)
  const fallbackDomains = ['Arrays & Strings', 'Dynamic Programming', 'Trees & Graphs'];
  const idNum = Number(challenge.id) || 0;
  return fallbackDomains[idNum % 3];
};

const DomainChart = () => {
  const [activeView, setActiveView] = useState('domain'); // 'domain' | 'difficulty'
  const [loading, setLoading] = useState(true);
  const [solvedIds, setSolvedIds] = useState([]);
  const [allChallenges, setAllChallenges] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const fetchPerformanceData = async () => {
      try {
        const [solvedRes, challengesRes, subsRes] = await Promise.allSettled([
          api.get('/submissions/my-solved-ids'),
          challengeService.getChallenges(0, 100),
          api.get('/submissions/me')
        ]);

        if (!isMounted) return;

        if (solvedRes.status === 'fulfilled' && Array.isArray(solvedRes.value?.data)) {
          setSolvedIds(solvedRes.value.data);
        }

        if (challengesRes.status === 'fulfilled') {
          const list = challengesRes.value?.content || challengesRes.value?.data?.content || challengesRes.value || [];
          if (Array.isArray(list)) {
            setAllChallenges(list);
          }
        }

        if (subsRes.status === 'fulfilled' && Array.isArray(subsRes.value?.data)) {
          setSubmissions(subsRes.value.data);
        }
      } catch (err) {
        console.error('Failed to load performance metrics', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPerformanceData();

    return () => {
      isMounted = false;
    };
  }, []);

  const solvedSet = new Set(solvedIds.map((id) => Number(id)));

  // Domain Statistics
  const domainConfig = [
    { name: 'Arrays & Strings', color: '#3b82f6' },
    { name: 'Dynamic Programming', color: '#f59e0b' },
    { name: 'Trees & Graphs', color: '#10b981' }
  ];

  const domainCounts = {
    'Arrays & Strings': 0,
    'Dynamic Programming': 0,
    'Trees & Graphs': 0
  };

  const domainTotals = {
    'Arrays & Strings': 0,
    'Dynamic Programming': 0,
    'Trees & Graphs': 0
  };

  // Difficulty Statistics
  const diffCounts = { EASY: 0, MEDIUM: 0, HARD: 0 };
  const diffTotals = { EASY: 0, MEDIUM: 0, HARD: 0 };

  allChallenges.forEach((c) => {
    const domain = categorizeChallenge(c);
    const diff = (c.difficulty || 'EASY').toUpperCase();

    if (domainTotals[domain] !== undefined) {
      domainTotals[domain]++;
    }
    if (diffTotals[diff] !== undefined) {
      diffTotals[diff]++;
    }

    if (solvedSet.has(Number(c.id))) {
      if (domainCounts[domain] !== undefined) {
        domainCounts[domain]++;
      }
      if (diffCounts[diff] !== undefined) {
        diffCounts[diff]++;
      }
    }
  });

  const totalSolved = solvedIds.length;
  const totalCatalog = allChallenges.length || 1;
  const maxDomainCount = Math.max(...Object.values(domainCounts), 1);

  // Accuracy calculation from submissions
  const acceptedSubs = submissions.filter((s) => s.verdict === 'ACCEPTED').length;
  const accuracy = submissions.length > 0 ? Math.round((acceptedSubs / submissions.length) * 100) : 100;

  return (
    <div
      className="glass-card"
      style={{
        padding: '24px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '12px',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        boxSizing: 'border-box'
      }}
    >
      {/* Top Header & View Switcher */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '4px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'var(--text-main)' }}>
              Performance by Domain
            </h3>
            <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '13px' }}>
              Distribution of problems solved across topic tracks & difficulty
            </p>
          </div>

          {/* Segmented View Switcher */}
          <div
            style={{
              display: 'inline-flex',
              background: 'var(--bg-app, #f1f5f9)',
              padding: '3px',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <button
              type="button"
              onClick={() => setActiveView('domain')}
              style={{
                background: activeView === 'domain' ? 'var(--bg-surface, #ffffff)' : 'transparent',
                color: activeView === 'domain' ? 'var(--primary, #3b82f6)' : 'var(--text-muted)',
                border: 'none',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: activeView === 'domain' ? 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.1))' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              🏷️ Topics
            </button>
            <button
              type="button"
              onClick={() => setActiveView('difficulty')}
              style={{
                background: activeView === 'difficulty' ? 'var(--bg-surface, #ffffff)' : 'transparent',
                color: activeView === 'difficulty' ? 'var(--primary, #3b82f6)' : 'var(--text-muted)',
                border: 'none',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: activeView === 'difficulty' ? 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.1))' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              ⚡ Difficulty
            </button>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
            Loading performance metrics...
          </div>
        ) : activeView === 'domain' ? (
          /* Domain Bars View */
          <div
            style={{
              display: 'flex',
              gap: '16px',
              alignItems: 'flex-end',
              height: '170px',
              marginTop: '16px',
              padding: '0 8px 12px 8px',
              borderBottom: '1px solid var(--border-subtle)'
            }}
          >
            {domainConfig.map((d) => {
              const count = domainCounts[d.name] || 0;
              const barHeightPct = totalSolved > 0 ? Math.max((count / maxDomainCount) * 110, count > 0 ? 20 : 6) : 6;
              const pctOfSolved = totalSolved > 0 ? Math.round((count / totalSolved) * 100) : 0;

              return (
                <div
                  key={d.name}
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    height: '100%'
                  }}
                >
                  <span style={{ fontSize: '13px', fontWeight: '800', color: d.color, marginBottom: '6px' }}>
                    {count}
                  </span>
                  <div
                    style={{
                      height: `${barHeightPct}px`,
                      background: count > 0 ? d.color : 'var(--border-subtle)',
                      borderRadius: '6px 6px 0 0',
                      width: '44px',
                      transition: 'height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: count > 0 ? `0 2px 8px ${d.color}40` : 'none',
                      opacity: count > 0 ? 1 : 0.4
                    }}
                  />
                  <p
                    style={{
                      marginTop: '10px',
                      fontSize: '12px',
                      fontWeight: '700',
                      color: 'var(--text-main)',
                      marginBottom: '2px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {d.name}
                  </p>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500' }}>
                    {pctOfSolved}% solved
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          /* Difficulty Breakdown View */
          <div style={{ marginTop: '16px', padding: '10px 4px 16px 4px', borderBottom: '1px solid var(--border-subtle)' }}>
            {[
              { level: 'Easy', key: 'EASY', color: '#10b981', pts: '100' },
              { level: 'Medium', key: 'MEDIUM', color: '#f59e0b', pts: '200' },
              { level: 'Hard', key: 'HARD', color: '#ef4444', pts: '300' }
            ].map(({ level, key, color, pts }) => {
              const solved = diffCounts[key] || 0;
              const total = diffTotals[key] || 0;
              const pct = total > 0 ? Math.round((solved / total) * 100) : 0;

              return (
                <div key={key} style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: color
                        }}
                      />
                      <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>
                        {level}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        ({pts} pts)
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)' }}>
                      <span style={{ color }}>{solved}</span>
                      <span style={{ color: 'var(--text-muted)' }}> / {total}</span>
                      <span style={{ marginLeft: '6px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500' }}>
                        ({pct}%)
                      </span>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div
                    style={{
                      height: '7px',
                      background: 'var(--border-subtle, #e2e8f0)',
                      borderRadius: '9999px',
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: color,
                        borderRadius: '9999px',
                        transition: 'width 0.4s ease'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Mastery & Progression Footer */}
      <div style={{ marginTop: '16px' }}>
        {totalSolved > 0 ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                Mastery Completion
              </span>
              <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--primary, #3b82f6)' }}>
                {totalSolved} / {allChallenges.length} Solved ({Math.round((totalSolved / totalCatalog) * 100)}%)
              </span>
            </div>

            {/* Overall Progress Bar */}
            <div
              style={{
                height: '8px',
                background: 'var(--border-subtle, #e2e8f0)',
                borderRadius: '9999px',
                overflow: 'hidden',
                marginBottom: '12px'
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${Math.min(Math.round((totalSolved / totalCatalog) * 100), 100)}%`,
                  background: 'linear-gradient(90deg, #3b82f6, #10b981)',
                  borderRadius: '9999px',
                  transition: 'width 0.5s ease'
                }}
              />
            </div>

            {/* Quick Stat Chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
              <span
                style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '700',
                  background: 'rgba(16, 185, 129, 0.12)',
                  color: '#10b981',
                  border: '1px solid rgba(16, 185, 129, 0.25)'
                }}
              >
                ● Easy: {diffCounts.EASY}
              </span>
              <span
                style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '700',
                  background: 'rgba(245, 158, 11, 0.12)',
                  color: '#f59e0b',
                  border: '1px solid rgba(245, 158, 11, 0.25)'
                }}
              >
                ● Medium: {diffCounts.MEDIUM}
              </span>
              <span
                style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '700',
                  background: 'rgba(239, 68, 68, 0.12)',
                  color: '#ef4444',
                  border: '1px solid rgba(239, 68, 68, 0.25)'
                }}
              >
                ● Hard: {diffCounts.HARD}
              </span>
              <span
                style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '700',
                  background: 'rgba(59, 130, 246, 0.12)',
                  color: '#3b82f6',
                  border: '1px solid rgba(59, 130, 246, 0.25)',
                  marginLeft: 'auto'
                }}
              >
                Accuracy: {accuracy}%
              </span>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: 'var(--text-muted)' }}>
              No challenges solved yet. Begin practicing to track your mastery!
            </p>
            <Link
              to="/challenges"
              style={{
                display: 'inline-block',
                padding: '6px 14px',
                borderRadius: '6px',
                background: 'var(--primary, #3b82f6)',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: '700',
                textDecoration: 'none'
              }}
            >
              Browse Challenges →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default DomainChart;
