import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, Link } from 'react-router-dom';
import { fetchGlobalRankings, fetchContestRankings } from '../store/slices/rankingSlice';
import contestService from '../services/contestService';

const Leaderboard = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const paramContestId = searchParams.get('contestId') || location.state?.contestId;

  const { items = [], loading } = useSelector((state) => state.rankings || {});
  const { user } = useSelector((state) => state.auth || {});
  const currentUsername = user?.username || '';

  const [leaderboardMode, setLeaderboardMode] = useState(paramContestId ? 'CONTEST' : 'GLOBAL');
  const [contests, setContests] = useState([]);
  const [selectedContestId, setSelectedContestId] = useState(paramContestId ? String(paramContestId) : '');
  const [currentContest, setCurrentContest] = useState(null);

  // For EXPIRED contests: 'STANDINGS' or 'ANALYTICS'
  const [expiredTab, setExpiredTab] = useState('STANDINGS');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Live Auto-Refresh for ACTIVE contests
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(new Date());
  const timerRef = useRef(null);

  // Load contest list
  useEffect(() => {
    contestService.getAll(0, 50).then((res) => {
      if (res && res.content) {
        setContests(res.content);
        if (!selectedContestId && res.content.length > 0) {
          const defaultContest = paramContestId
            ? res.content.find((c) => String(c.id) === String(paramContestId)) || res.content[0]
            : res.content[0];
          setSelectedContestId(String(defaultContest.id));
          setCurrentContest(defaultContest);
        }
      }
    });
  }, [paramContestId]);

  // Update selected contest object
  useEffect(() => {
    if (selectedContestId && contests.length > 0) {
      const found = contests.find((c) => String(c.id) === String(selectedContestId));
      if (found) {
        setCurrentContest(found);
      } else {
        contestService.getById(selectedContestId).then((data) => {
          if (data) setCurrentContest(data);
        }).catch(() => {});
      }
    }
  }, [selectedContestId, contests]);

  // Calculate actual contest status
  const contestStatus = (currentContest?.status || 'ACTIVE').toUpperCase();
  const isActiveContest = leaderboardMode === 'CONTEST' && contestStatus === 'ACTIVE';
  const isUpcomingContest = leaderboardMode === 'CONTEST' && contestStatus === 'UPCOMING';
  const isExpiredContest = leaderboardMode === 'CONTEST' && (contestStatus === 'EXPIRED' || contestStatus === 'COMPLETED');

  // Fetch rankings
  const refreshRankings = useCallback(() => {
    if (leaderboardMode === 'GLOBAL') {
      dispatch(fetchGlobalRankings({ page: 0, size: 50 }));
      setLastRefreshedAt(new Date());
    } else if (leaderboardMode === 'CONTEST' && selectedContestId) {
      if (isUpcomingContest) {
        // Do not reveal live leaderboard for upcoming contests
        return;
      }
      dispatch(fetchContestRankings({ contestId: selectedContestId, page: 0, size: 50 }));
      setLastRefreshedAt(new Date());
    }
  }, [dispatch, leaderboardMode, selectedContestId, isUpcomingContest]);

  useEffect(() => {
    refreshRankings();
  }, [refreshRankings]);

  // Live auto-refresh polling every 10 seconds for active contests
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (isActiveContest && autoRefresh) {
      timerRef.current = setInterval(() => {
        refreshRankings();
      }, 10000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActiveContest, autoRefresh, refreshRankings]);

  // Fetch analytics when expired contest analytics tab is chosen
  useEffect(() => {
    if (isExpiredContest && expiredTab === 'ANALYTICS' && selectedContestId) {
      setLoadingAnalytics(true);
      contestService.getAnalytics(selectedContestId).then((data) => {
        setAnalyticsData(data);
      }).finally(() => {
        setLoadingAnalytics(false);
      });
    }
  }, [isExpiredContest, expiredTab, selectedContestId]);

  // Locate current user in rankings
  const currentUserRanking = currentUsername
    ? items.find((r) => String(r.username || '').trim().toLowerCase() === currentUsername.trim().toLowerCase())
    : null;

  return (
    <div
      id="list-container-t28"
      className="leaderboard-container"
      style={{
        margin: '20px auto',
        padding: '0 20px 40px',
        maxWidth: '1100px',
        textAlign: 'center'
      }}
    >
      {/* Hero Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2
          id="hero-heading-t30"
          style={{
            fontSize: '44px',
            fontWeight: '800',
            marginBottom: '8px',
            color: 'var(--text-main)',
            letterSpacing: '-0.5px'
          }}
        >
          Leaderboard
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '16px', fontSize: '15px' }}>
          {leaderboardMode === 'GLOBAL'
            ? 'Track platform-wide programmer rankings, all-time challenge points, and accepted submissions'
            : isActiveContest
            ? 'Live competitive standings, real-time penalty tracking, and problem solve velocity'
            : isExpiredContest
            ? 'Final contest results, podium standings, and in-depth performance analytics'
            : 'Contest standings will unlock once the competition begins'}
        </p>
      </div>

      {/* Top Controls: Mode Switcher & Contest Selector */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '20px',
          flexWrap: 'wrap',
          background: 'var(--bg-surface)',
          padding: '12px 18px',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        {/* Toggle Mode: Global vs Contest */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => setLeaderboardMode('GLOBAL')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: leaderboardMode === 'GLOBAL' ? 'var(--primary)' : 'var(--bg-app)',
              color: leaderboardMode === 'GLOBAL' ? '#fff' : 'var(--text-muted)',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: leaderboardMode === 'GLOBAL' ? '0 2px 6px rgba(59, 130, 246, 0.3)' : 'none'
            }}
          >
            🌐 Global Rankings
          </button>

          <button
            onClick={() => setLeaderboardMode('CONTEST')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: leaderboardMode === 'CONTEST' ? 'var(--primary)' : 'var(--bg-app)',
              color: leaderboardMode === 'CONTEST' ? '#fff' : 'var(--text-muted)',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: leaderboardMode === 'CONTEST' ? '0 2px 6px rgba(59, 130, 246, 0.3)' : 'none'
            }}
          >
            🏆 Contest Rankings
          </button>
        </div>

        {/* Contest Dropdown & Action Controls */}
        {leaderboardMode === 'CONTEST' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <select
              value={selectedContestId}
              onChange={(e) => setSelectedContestId(e.target.value)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-app)',
                color: 'var(--text-main)',
                fontWeight: '600',
                fontSize: '13px',
                outline: 'none',
                minWidth: '220px'
              }}
            >
              {contests && contests.length > 0 ? (
                contests.map((c) => {
                  const st = (c.status || 'ACTIVE').toUpperCase();
                  const icon = st === 'ACTIVE' ? '🟢' : st === 'UPCOMING' ? '🔒' : '🏁';
                  return (
                    <option key={c.id} value={c.id}>
                      {icon} {c.title} ({st})
                    </option>
                  );
                })
              ) : (
                <option value="">No contests available</option>
              )}
            </select>

            {/* Refresh / Live Indicator */}
            {isActiveContest && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  title={autoRefresh ? 'Click to pause live updates' : 'Click to enable live updates'}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-subtle)',
                    background: autoRefresh ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-app)',
                    color: autoRefresh ? '#10b981' : 'var(--text-muted)',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: autoRefresh ? '#10b981' : '#94a3b8',
                      display: 'inline-block',
                      boxShadow: autoRefresh ? '0 0 8px #10b981' : 'none'
                    }}
                  />
                  {autoRefresh ? 'LIVE AUTO-SYNC' : 'SYNC PAUSED'}
                </button>

                <button
                  onClick={refreshRankings}
                  disabled={loading}
                  title="Refresh standings now"
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-app)',
                    color: 'var(--text-main)',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  🔄
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Contest Status Context Banner */}
      {leaderboardMode === 'CONTEST' && currentContest && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: isActiveContest
              ? 'rgba(16, 185, 129, 0.08)'
              : isExpiredContest
              ? 'rgba(100, 116, 139, 0.08)'
              : 'rgba(245, 158, 11, 0.08)',
            border: `1px solid ${
              isActiveContest
                ? 'rgba(16, 185, 129, 0.3)'
                : isExpiredContest
                ? 'rgba(100, 116, 139, 0.3)'
                : 'rgba(245, 158, 11, 0.3)'
            }`,
            borderRadius: '12px',
            padding: '12px 20px',
            marginBottom: '20px',
            textAlign: 'left',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: '800',
                  padding: '3px 10px',
                  borderRadius: '12px',
                  background: isActiveContest
                    ? '#10b981'
                    : isExpiredContest
                    ? '#64748b'
                    : '#f59e0b',
                  color: '#fff',
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                {isActiveContest && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff' }} />}
                {contestStatus}
              </span>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'var(--text-main)' }}>
                {currentContest.title}
              </h3>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              👥 {currentContest.enrolledCount || items.length || 0} Participants Registered
              {currentContest.startTime && (
                <span style={{ marginLeft: '12px' }}>
                  🕒 Started: {new Date(currentContest.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isActiveContest && (
              <Link
                to={`/contests/${currentContest.id}`}
                style={{
                  padding: '7px 14px',
                  background: 'var(--primary)',
                  color: '#fff',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  fontWeight: '700',
                  fontSize: '12px'
                }}
              >
                Enter Contest Arena 🚀
              </Link>
            )}

            {isExpiredContest && (
              <div style={{ display: 'flex', background: 'var(--bg-surface)', borderRadius: '8px', padding: '3px', border: '1px solid var(--border-subtle)' }}>
                <button
                  onClick={() => setExpiredTab('STANDINGS')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    border: 'none',
                    background: expiredTab === 'STANDINGS' ? 'var(--primary)' : 'transparent',
                    color: expiredTab === 'STANDINGS' ? '#fff' : 'var(--text-muted)',
                    fontWeight: '700',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  🏆 Final Standings
                </button>
                <button
                  onClick={() => setExpiredTab('ANALYTICS')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    border: 'none',
                    background: expiredTab === 'ANALYTICS' ? 'var(--primary)' : 'transparent',
                    color: expiredTab === 'ANALYTICS' ? '#fff' : 'var(--text-muted)',
                    fontWeight: '700',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  📊 Performance & Analytics
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Logged-in Contestant Callout Banner */}
      {currentUserRanking && (leaderboardMode === 'GLOBAL' || isActiveContest || isExpiredContest) && (
        <div
          style={{
            background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.15), rgba(99, 102, 241, 0.15))',
            border: '1px solid rgba(59, 130, 246, 0.35)',
            borderRadius: '10px',
            padding: '12px 20px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            textAlign: 'left',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#3b82f6',
                color: '#fff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800',
                fontSize: '14px'
              }}
            >
              #{currentUserRanking.rank || 1}
            </span>
            <div>
              <div style={{ fontWeight: '800', color: 'var(--text-main)', fontSize: '15px' }}>
                Your Current Standing: <strong>{currentUsername}</strong>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {isActiveContest ? 'Keep solving problems to climb higher in the live standings!' : 'Profile record from this competition'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Score</div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: '#3b82f6' }}>{currentUserRanking.score || 0} pts</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Solved</div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: '#10b981' }}>{currentUserRanking.solvedCount || 0}</div>
            </div>
            {leaderboardMode === 'CONTEST' && (
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Penalty</div>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#f59e0b' }}>{currentUserRanking.penalty || 0}m</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CASE 1: UPCOMING CONTEST (LEADERBOARD LOCKED) */}
      {isUpcomingContest && (
        <div
          style={{
            padding: '50px 24px',
            textAlign: 'center',
            background: 'var(--bg-surface)',
            borderRadius: '16px',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-sm)',
            margin: '20px 0'
          }}
        >
          <div style={{ fontSize: '52px', marginBottom: '14px' }}>🔒</div>
          <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>
            Live Standings Locked
          </h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '520px', margin: '0 auto 20px auto', fontSize: '15px', lineHeight: '1.6' }}>
            Rankings and participant scores are confidential prior to contest launch.
            The live standings will be unlocked in real-time when <strong>{currentContest?.title}</strong> kicks off.
          </p>

          {currentContest?.startTime && (
            <div
              style={{
                display: 'inline-block',
                background: 'var(--bg-app)',
                padding: '10px 20px',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                fontSize: '14px',
                fontWeight: '700',
                color: 'var(--text-main)',
                marginBottom: '20px'
              }}
            >
              📅 Scheduled Start:{' '}
              {new Date(currentContest.startTime).toLocaleString([], {
                dateStyle: 'medium',
                timeStyle: 'short'
              })}
            </div>
          )}

          <div>
            <button
              onClick={() => setLeaderboardMode('GLOBAL')}
              style={{
                padding: '9px 18px',
                background: 'var(--primary)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Explore Global Rankings &rarr;
            </button>
          </div>
        </div>
      )}

      {/* CASE 2: EXPIRED CONTEST - PERFORMANCE & ANALYTICS TAB */}
      {isExpiredContest && expiredTab === 'ANALYTICS' && (
        <div style={{ textAlign: 'left' }}>
          {loadingAnalytics ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Analyzing contest performance data...
            </div>
          ) : analyticsData ? (
            <div>
              {/* Analytics Metric Cards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                  gap: '14px',
                  marginBottom: '24px'
                }}
              >
                <div style={{ background: 'var(--bg-surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '6px' }}>👥 Total Participants</div>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)' }}>{analyticsData.totalParticipants || 0}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Enrolled contestants</div>
                </div>

                <div style={{ background: 'var(--bg-surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '6px' }}>📥 Total Submissions</div>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: '#3b82f6' }}>{analyticsData.totalSubmissions || 0}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Code executions</div>
                </div>

                <div style={{ background: 'var(--bg-surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '6px' }}>✅ Accepted Submissions</div>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: '#10b981' }}>{analyticsData.acceptedSubmissions || 0}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Passed all test cases</div>
                </div>

                <div style={{ background: 'var(--bg-surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '6px' }}>📈 Acceptance Rate</div>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: '#8b5cf6' }}>{analyticsData.acceptanceRate || 0}%</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Contest-wide ratio</div>
                </div>

                <div style={{ background: 'var(--bg-surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '6px' }}>⭐ Average Score</div>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: '#f59e0b' }}>{analyticsData.averageScore || 0} pts</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Across all participants</div>
                </div>

                <div style={{ background: 'var(--bg-surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '6px' }}>👑 Highest Score</div>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: '#ec4899' }}>{analyticsData.highestScore || 0} pts</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Winner benchmark</div>
                </div>
              </div>

              {/* Problem Difficulty Statistics Breakdown */}
              <div
                style={{
                  background: 'var(--bg-surface)',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  padding: '20px',
                  marginBottom: '24px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: 'var(--text-main)' }}>
                    Problem Difficulty & Solve Statistics
                  </h4>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: '700' }}>
                      Easy: {analyticsData.difficultyDistribution?.EASY || 0}
                    </span>
                    <span style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', fontWeight: '700' }}>
                      Medium: {analyticsData.difficultyDistribution?.MEDIUM || 0}
                    </span>
                    <span style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', fontWeight: '700' }}>
                      Hard: {analyticsData.difficultyDistribution?.HARD || 0}
                    </span>
                  </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>
                        <th style={{ padding: '10px 14px', textAlign: 'left' }}>Problem</th>
                        <th style={{ padding: '10px 14px', textAlign: 'center' }}>Difficulty</th>
                        <th style={{ padding: '10px 14px', textAlign: 'center' }}>Points</th>
                        <th style={{ padding: '10px 14px', textAlign: 'center' }}>Submissions</th>
                        <th style={{ padding: '10px 14px', textAlign: 'center' }}>Solvers</th>
                        <th style={{ padding: '10px 14px', textAlign: 'left', minWidth: '160px' }}>Solve Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsData.problemStats && analyticsData.problemStats.length > 0 ? (
                        analyticsData.problemStats.map((p, idx) => {
                          const diffColor =
                            p.difficulty?.toUpperCase() === 'HARD'
                              ? '#ef4444'
                              : p.difficulty?.toUpperCase() === 'MEDIUM'
                              ? '#f59e0b'
                              : '#10b981';
                          return (
                            <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                              <td style={{ padding: '12px 14px', fontWeight: '600', color: 'var(--text-main)' }}>
                                {p.title}
                              </td>
                              <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                <span
                                  style={{
                                    fontSize: '11px',
                                    fontWeight: '800',
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                    background: `${diffColor}20`,
                                    color: diffColor
                                  }}
                                >
                                  {p.difficulty}
                                </span>
                              </td>
                              <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: '700', color: 'var(--text-main)' }}>
                                {p.basePoints}
                              </td>
                              <td style={{ padding: '12px 14px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                {p.totalSubmissions}
                              </td>
                              <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: '700', color: '#10b981' }}>
                                {p.solversCount}
                              </td>
                              <td style={{ padding: '12px 14px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <div
                                    style={{
                                      flex: 1,
                                      height: '8px',
                                      borderRadius: '4px',
                                      background: 'var(--bg-app)',
                                      overflow: 'hidden'
                                    }}
                                  >
                                    <div
                                      style={{
                                        width: `${p.solveRate || 0}%`,
                                        height: '100%',
                                        background: diffColor,
                                        borderRadius: '4px'
                                      }}
                                    />
                                  </div>
                                  <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)', minWidth: '40px' }}>
                                    {p.solveRate}%
                                  </span>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            No problem breakdown data available.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No analytics data found for this contest.
            </div>
          )}
        </div>
      )}

      {/* CASE 3: ACTIVE CONTEST LIVE LEADERBOARD / EXPIRED FINAL STANDINGS / GLOBAL RANKINGS */}
      {(!isUpcomingContest && (!isExpiredContest || expiredTab === 'STANDINGS')) && (
        <div>
          {loading && (
            <div style={{ marginBottom: '14px', color: 'var(--text-muted)', fontSize: '13px' }}>
              ⚡ Updating rankings from server...
            </div>
          )}

          <div
            style={{
              borderRadius: '12px',
              overflow: 'hidden',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-sm)',
              background: 'var(--bg-surface)'
            }}
          >
            <table className="codec-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-app)', borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '14px 18px', width: '80px', textAlign: 'center', fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    Rank
                  </th>
                  <th style={{ padding: '14px 18px', fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    Contestant
                  </th>
                  <th style={{ padding: '14px 18px', textAlign: 'center', width: '130px', fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    Problems Solved
                  </th>
                  <th style={{ padding: '14px 18px', textAlign: 'right', width: '120px', fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    Score
                  </th>
                  {leaderboardMode === 'CONTEST' && (
                    <>
                      <th style={{ padding: '14px 18px', textAlign: 'right', width: '110px', fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                        Penalty
                      </th>
                      <th style={{ padding: '14px 18px', textAlign: 'right', width: '100px', fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                        Time
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {items && items.length > 0 ? (
                  items.map((row, idx) => {
                    const isCurrentUser =
                      currentUsername &&
                      currentUsername.trim().toLowerCase() === String(row.username || '').trim().toLowerCase();
                    const rankNum = row.rank || idx + 1;

                    return (
                      <tr
                        key={idx}
                        style={{
                          background: isCurrentUser ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
                          borderBottom: '1px solid var(--border-subtle)',
                          transition: 'background 0.15s ease'
                        }}
                      >
                        {/* Rank Badge */}
                        <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background:
                                rankNum === 1
                                  ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                                  : rankNum === 2
                                  ? 'linear-gradient(135deg, #94a3b8, #64748b)'
                                  : rankNum === 3
                                  ? 'linear-gradient(135deg, #d97706, #b45309)'
                                  : 'var(--bg-app)',
                              color: rankNum <= 3 ? '#fff' : 'var(--text-muted)',
                              fontWeight: '800',
                              fontSize: '13px',
                              boxShadow: rankNum <= 3 ? '0 2px 5px rgba(0,0,0,0.18)' : 'none'
                            }}
                          >
                            {rankNum === 1 ? '🥇' : rankNum === 2 ? '🥈' : rankNum === 3 ? '🥉' : rankNum}
                          </span>
                        </td>

                        {/* Contestant Username & Avatar */}
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                background: isCurrentUser ? '#3b82f6' : 'var(--border-subtle)',
                                color: isCurrentUser ? '#fff' : 'var(--text-main)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: '700',
                                fontSize: '12px'
                              }}
                            >
                              {(row.username || 'U').charAt(0).toUpperCase()}
                            </div>
                            <span style={{ fontWeight: isCurrentUser ? '800' : '600', color: 'var(--text-main)', fontSize: '14px' }}>
                              {row.username}
                            </span>
                            {isCurrentUser && (
                              <span
                                style={{
                                  background: 'rgba(59, 130, 246, 0.2)',
                                  color: '#3b82f6',
                                  fontSize: '11px',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  fontWeight: '800'
                                }}
                              >
                                YOU
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Solved Problems */}
                        <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '3px 10px',
                              borderRadius: '12px',
                              background: 'rgba(16, 185, 129, 0.12)',
                              color: '#10b981',
                              fontWeight: '700',
                              fontSize: '13px'
                            }}
                          >
                            ✅ {row.solvedCount || 0} solved
                          </span>
                        </td>

                        {/* Score */}
                        <td style={{ padding: '14px 18px', textAlign: 'right', color: '#3b82f6', fontWeight: '800', fontSize: '15px' }}>
                          {row.score || 0} pts
                        </td>

                        {/* Contest-only columns: Penalty & Time */}
                        {leaderboardMode === 'CONTEST' && (
                          <>
                            <td style={{ padding: '14px 18px', textAlign: 'right', color: '#f59e0b', fontWeight: '700', fontSize: '14px' }}>
                              {row.penalty || 0}m
                            </td>
                            <td style={{ padding: '14px 18px', textAlign: 'right', color: 'var(--text-muted)', fontFamily: 'monospace', fontWeight: '600', fontSize: '13px' }}>
                              {row.time || '--:--'}
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={leaderboardMode === 'CONTEST' ? 6 : 4}
                      style={{ padding: '40px', color: 'var(--text-muted)', textAlign: 'center' }}
                    >
                      No rankings available for this view.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
