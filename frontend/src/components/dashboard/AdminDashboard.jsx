import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../../services/adminService';
import contestService from '../../services/contestService';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [contestFilter, setContestFilter] = useState('ALL');
  const [showUserModal, setShowUserModal] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');

  const fetchDashboardData = async () => {
    try {
      const [overviewData, usersData, contestsData] = await Promise.all([
        adminService.getOverview(),
        adminService.getUsers(),
        contestService.getAll(0, 50)
      ]);

      setStats(overviewData);
      setUsers(usersData || []);
      
      const contestList = contestsData?.content || (Array.isArray(contestsData) ? contestsData : []);
      setContests(contestList);
    } catch (err) {
      console.error('Failed to load admin dashboard data', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  // Filtered contests
  const filteredContests = contests.filter((c) => {
    const s = (c.status || '').toUpperCase();
    if (contestFilter === 'ACTIVE') return s === 'ACTIVE';
    if (contestFilter === 'UPCOMING') return s === 'UPCOMING';
    if (contestFilter === 'EXPIRED') return s === 'EXPIRED' || s === 'COMPLETED';
    return true;
  });

  // Filtered users for modal
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.username || '').toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(userSearch.toLowerCase());
    const role = (u.role || '').toUpperCase();
    const matchesRole =
      userRoleFilter === 'ALL' ||
      (userRoleFilter === 'STUDENT' && (role === 'STUDENT' || role.includes('CONTESTANT'))) ||
      (userRoleFilter === 'PROBLEM_SETTER' && role.includes('SETTER')) ||
      (userRoleFilter === 'ADMIN' && role.includes('ADMIN'));
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div style={{ padding: '48px 24px', maxWidth: '1240px', margin: '0 auto', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚡</div>
        <p style={{ fontSize: '16px', fontWeight: '600' }}>Loading Platform Management Dashboard...</p>
      </div>
    );
  }

  const totalUsers = stats?.totalUsers || users.length || 0;
  const studentsCount = stats?.studentsCount || users.filter(u => !u.role?.includes('ADMIN') && !u.role?.includes('SETTER')).length || 0;
  const settersCount = stats?.settersCount || users.filter(u => u.role?.includes('SETTER')).length || 0;
  const adminsCount = stats?.adminsCount || users.filter(u => u.role?.includes('ADMIN')).length || 0;

  const totalContests = stats?.totalContests || contests.length || 0;
  const activeContests = stats?.activeContests || contests.filter(c => c.status === 'ACTIVE').length || 0;
  const upcomingContests = stats?.upcomingContests || contests.filter(c => c.status === 'UPCOMING').length || 0;
  const expiredContests = stats?.expiredContests || contests.filter(c => c.status === 'EXPIRED' || c.status === 'COMPLETED').length || 0;

  const totalChallenges = stats?.totalChallenges || 0;
  const easyChallenges = stats?.easyChallenges || 0;
  const mediumChallenges = stats?.mediumChallenges || 0;
  const hardChallenges = stats?.hardChallenges || 0;

  const activities = stats?.recentActivities || [];

  return (
    <div style={{ padding: '28px 24px', maxWidth: '1280px', margin: '0 auto', color: 'var(--text-main)', boxSizing: 'border-box' }}>
      
      {/* Top Header & Quick Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: '800', margin: 0, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              Platform Management Dashboard
            </h1>
            <span style={{
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: '800',
              padding: '3px 9px',
              borderRadius: '9999px',
              letterSpacing: '0.6px',
              textTransform: 'uppercase'
            }}>
              Admin Portal
            </span>
          </div>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>
            System vitals, contest lifecycle orchestration, challenge directory, and platform activity audit.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            type="button"
            onClick={handleRefresh}
            title="Refresh metrics"
            disabled={refreshing}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface)',
              color: 'var(--text-main)',
              fontSize: '13px',
              fontWeight: '600',
              cursor: refreshing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <span style={{ display: 'inline-block', transform: refreshing ? 'rotate(360deg)' : 'none', transition: 'transform 0.5s ease' }}>
              🔄
            </span>
            {refreshing ? 'Updating...' : 'Refresh'}
          </button>

          <button
            type="button"
            onClick={() => setShowUserModal(true)}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface)',
              color: 'var(--text-main)',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            👥 Manage Users
          </button>

          <Link
            to="/ai/generate-questions"
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              background: 'rgba(139, 92, 246, 0.1)',
              color: '#8b5cf6',
              fontSize: '13px',
              fontWeight: '700',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
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
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: 'var(--primary, #3b82f6)',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: '700',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(59, 130, 246, 0.35)'
            }}
          >
            ➕ Create Contest
          </Link>
        </div>
      </div>

      {/* 1. Overview Cards (4 Main SaaS Metrics) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        
        {/* Total Users */}
        <div
          className="glass-card"
          onClick={() => setShowUserModal(true)}
          style={{
            padding: '20px 24px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-sm)',
            cursor: 'pointer',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Users
            </span>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
              👥
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '32px', fontWeight: '800', color: '#3b82f6' }}>
            {totalUsers}
          </p>
          <div style={{ display: 'flex', gap: '6px', marginTop: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <span>{studentsCount} Students</span> · <span>{settersCount} Setters</span> · <span>{adminsCount} Admins</span>
          </div>
        </div>

        {/* Total Contests */}
        <div
          className="glass-card"
          style={{
            padding: '20px 24px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Contests
            </span>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
              🏆
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '32px', fontWeight: '800', color: '#f59e0b' }}>
            {totalContests}
          </p>
          <div style={{ display: 'flex', gap: '6px', marginTop: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <span style={{ color: '#10b981', fontWeight: '700' }}>{activeContests} Active</span> · <span>{upcomingContests} Upcoming</span> · <span>{expiredContests} Expired</span>
          </div>
        </div>

        {/* Total Challenges */}
        <div
          className="glass-card"
          style={{
            padding: '20px 24px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Challenges
            </span>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
              🧩
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '32px', fontWeight: '800', color: '#8b5cf6' }}>
            {totalChallenges}
          </p>
          <div style={{ display: 'flex', gap: '6px', marginTop: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <span style={{ color: '#10b981', fontWeight: '600' }}>{easyChallenges} Easy</span> · <span style={{ color: '#f59e0b', fontWeight: '600' }}>{mediumChallenges} Med</span> · <span style={{ color: '#ef4444', fontWeight: '600' }}>{hardChallenges} Hard</span>
          </div>
        </div>

        {/* Active Contests (Live Pulse) */}
        <div
          className="glass-card"
          style={{
            padding: '20px 24px',
            background: 'var(--bg-surface)',
            border: activeContests > 0 ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid var(--border-subtle)',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Active Contests
            </span>
            <div style={{
              padding: '3px 8px',
              borderRadius: '9999px',
              background: activeContests > 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(148, 163, 184, 0.15)',
              color: activeContests > 0 ? '#10b981' : 'var(--text-muted)',
              fontSize: '11px',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: activeContests > 0 ? '#10b981' : '#94a3b8',
                display: 'inline-block'
              }} />
              {activeContests > 0 ? 'LIVE NOW' : 'IDLE'}
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '32px', fontWeight: '800', color: '#10b981' }}>
            {activeContests}
          </p>
          <div style={{ marginTop: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
            {activeContests > 0 ? 'Active competition currently running' : 'No contests currently active'}
          </div>
        </div>

      </div>

      {/* 2 & 7. Distribution Visualizations Grid (3 Charts) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        
        {/* Chart 1: Contest Status Distribution */}
        <div className="glass-card" style={{ padding: '24px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: 'var(--text-main)' }}>
                Contest Status Distribution
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                Active vs Scheduled vs Concluded
              </p>
            </div>
            <span style={{ fontSize: '13px', fontWeight: '800', color: '#f59e0b' }}>
              {totalContests} Contests
            </span>
          </div>

          {/* Segmented Distribution Bar */}
          <div style={{ height: '12px', background: 'var(--border-subtle)', borderRadius: '9999px', overflow: 'hidden', display: 'flex', marginBottom: '16px' }}>
            {totalContests > 0 ? (
              <>
                <div style={{ width: `${(activeContests / totalContests) * 100}%`, background: '#10b981', transition: 'width 0.4s' }} title={`Active: ${activeContests}`} />
                <div style={{ width: `${(upcomingContests / totalContests) * 100}%`, background: '#3b82f6', transition: 'width 0.4s' }} title={`Upcoming: ${upcomingContests}`} />
                <div style={{ width: `${(expiredContests / totalContests) * 100}%`, background: '#94a3b8', transition: 'width 0.4s' }} title={`Expired: ${expiredContests}`} />
              </>
            ) : (
              <div style={{ width: '100%', background: 'var(--border-subtle)' }} />
            )}
          </div>

          {/* Status Breakdown Chips */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#10b981', textTransform: 'uppercase' }}>Active</div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#10b981', margin: '2px 0' }}>{activeContests}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{totalContests > 0 ? Math.round((activeContests / totalContests) * 100) : 0}%</div>
            </div>

            <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#3b82f6', textTransform: 'uppercase' }}>Upcoming</div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#3b82f6', margin: '2px 0' }}>{upcomingContests}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{totalContests > 0 ? Math.round((upcomingContests / totalContests) * 100) : 0}%</div>
            </div>

            <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(148, 163, 184, 0.08)', border: '1px solid rgba(148, 163, 184, 0.2)', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Expired</div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#64748b', margin: '2px 0' }}>{expiredContests}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{totalContests > 0 ? Math.round((expiredContests / totalContests) * 100) : 0}%</div>
            </div>
          </div>
        </div>

        {/* Chart 2: Challenge Difficulty Distribution */}
        <div className="glass-card" style={{ padding: '24px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: 'var(--text-main)' }}>
                Challenge Difficulty Distribution
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                Catalog balance across tiered problem complexities
              </p>
            </div>
            <span style={{ fontSize: '13px', fontWeight: '800', color: '#8b5cf6' }}>
              {totalChallenges} Problems
            </span>
          </div>

          {/* Difficulty Meters */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { level: 'Easy', count: easyChallenges, color: '#10b981', pts: '100 pts' },
              { level: 'Medium', count: mediumChallenges, color: '#f59e0b', pts: '200 pts' },
              { level: 'Hard', count: hardChallenges, color: '#ef4444', pts: '300 pts' }
            ].map(({ level, count, color, pts }) => {
              const pct = totalChallenges > 0 ? Math.round((count / totalChallenges) * 100) : 0;
              return (
                <div key={level}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
                      <span style={{ color: 'var(--text-main)' }}>{level}</span>
                      <span style={{ color: 'var(--text-muted)', fontWeight: '500', fontSize: '11px' }}>({pts})</span>
                    </div>
                    <div style={{ color: 'var(--text-main)' }}>
                      <span style={{ color, fontWeight: '800' }}>{count}</span>
                      <span style={{ color: 'var(--text-muted)', marginLeft: '4px' }}>({pct}%)</span>
                    </div>
                  </div>
                  <div style={{ height: '7px', background: 'var(--border-subtle)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '9999px', transition: 'width 0.4s' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 3: User Role Distribution */}
        <div className="glass-card" style={{ padding: '24px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: 'var(--text-main)' }}>
                User Role Distribution
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                Students, Problem Setters, and Platform Admins
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowUserModal(true)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--primary)',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                padding: '2px 6px'
              }}
            >
              View Directory →
            </button>
          </div>

          {/* Segmented Distribution Bar */}
          <div style={{ height: '12px', background: 'var(--border-subtle)', borderRadius: '9999px', overflow: 'hidden', display: 'flex', marginBottom: '16px' }}>
            {totalUsers > 0 ? (
              <>
                <div style={{ width: `${(studentsCount / totalUsers) * 100}%`, background: '#3b82f6', transition: 'width 0.4s' }} title={`Students: ${studentsCount}`} />
                <div style={{ width: `${(settersCount / totalUsers) * 100}%`, background: '#8b5cf6', transition: 'width 0.4s' }} title={`Setters: ${settersCount}`} />
                <div style={{ width: `${(adminsCount / totalUsers) * 100}%`, background: '#f59e0b', transition: 'width 0.4s' }} title={`Admins: ${adminsCount}`} />
              </>
            ) : (
              <div style={{ width: '100%', background: 'var(--border-subtle)' }} />
            )}
          </div>

          {/* Role Breakdown Chips */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#3b82f6', textTransform: 'uppercase' }}>🎓 Students</div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#3b82f6', margin: '2px 0' }}>{studentsCount}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{totalUsers > 0 ? Math.round((studentsCount / totalUsers) * 100) : 0}%</div>
            </div>

            <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.2)', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#8b5cf6', textTransform: 'uppercase' }}>🛠️ Setters</div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#8b5cf6', margin: '2px 0' }}>{settersCount}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{totalUsers > 0 ? Math.round((settersCount / totalUsers) * 100) : 0}%</div>
            </div>

            <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#f59e0b', textTransform: 'uppercase' }}>🛡️ Admins</div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#f59e0b', margin: '2px 0' }}>{adminsCount}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{totalUsers > 0 ? Math.round((adminsCount / totalUsers) * 100) : 0}%</div>
            </div>
          </div>
        </div>

      </div>

      {/* 2 & 5. Contest Lifecycle Overview & Recent Platform Activity Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px', marginBottom: '28px' }}>
        
        {/* Contest Overview Card */}
        <div className="glass-card" style={{ padding: '24px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'var(--text-main)' }}>
                Contest Lifecycle Overview
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                Scheduled, active, and expired competitive rounds
              </p>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'inline-flex', background: 'var(--bg-app)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              {['ALL', 'ACTIVE', 'UPCOMING', 'EXPIRED'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setContestFilter(tab)}
                  style={{
                    background: contestFilter === tab ? 'var(--bg-surface)' : 'transparent',
                    color: contestFilter === tab ? 'var(--primary)' : 'var(--text-muted)',
                    border: 'none',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: contestFilter === tab ? 'var(--shadow-sm)' : 'none'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Contests List */}
          {filteredContests.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredContests.slice(0, 5).map((c) => {
                const s = (c.status || '').toUpperCase();
                const isAct = s === 'ACTIVE';
                const isUp = s === 'UPCOMING';
                const badgeBg = isAct ? 'rgba(16, 185, 129, 0.15)' : isUp ? 'rgba(59, 130, 246, 0.15)' : 'rgba(148, 163, 184, 0.15)';
                const badgeColor = isAct ? '#10b981' : isUp ? '#3b82f6' : '#64748b';

                return (
                  <div
                    key={c.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      background: 'var(--bg-app)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-main)' }}>
                          {c.title}
                        </span>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          fontSize: '10px',
                          fontWeight: '800',
                          background: badgeBg,
                          color: badgeColor,
                          border: `1px solid ${badgeColor}30`,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          {isAct && <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10b981' }} />}
                          {s || 'UPCOMING'}
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        <span>Start: {c.startTime ? new Date(c.startTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'TBD'}</span>
                        <span style={{ margin: '0 6px' }}>•</span>
                        <span>End: {c.endTime ? new Date(c.endTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'TBD'}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <Link
                        to={`/contests/${c.id}/generate-ai`}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          background: 'rgba(139, 92, 246, 0.1)',
                          color: '#8b5cf6',
                          fontSize: '11px',
                          fontWeight: '700',
                          textDecoration: 'none'
                        }}
                        title="Generate questions with AI"
                      >
                        🤖 AI
                      </Link>
                      {isAct && (
                        <Link
                          to={`/contests/${c.id}/arena`}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            background: '#10b981',
                            color: '#ffffff',
                            fontSize: '11px',
                            fontWeight: '700',
                            textDecoration: 'none'
                          }}
                        >
                          Arena →
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
              No contests found matching filter "{contestFilter}".
            </div>
          )}

          <div style={{ marginTop: '16px', textAlign: 'right' }}>
            <Link to="/contests" style={{ color: 'var(--primary)', fontSize: '12px', fontWeight: '700', textDecoration: 'none' }}>
              View All Contests Directory →
            </Link>
          </div>
        </div>

        {/* 5. Recent Platform Activity Card */}
        <div className="glass-card" style={{ padding: '24px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'var(--text-main)' }}>
                Recent Platform Activity
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                Live audit trail of contests, challenges, submissions & registrations
              </p>
            </div>
            <span style={{
              padding: '3px 8px',
              borderRadius: '6px',
              background: 'rgba(59, 130, 246, 0.1)',
              color: 'var(--primary)',
              fontSize: '11px',
              fontWeight: '700'
            }}>
              ● Real-time
            </span>
          </div>

          {/* Activity Feed Items */}
          {activities.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {activities.slice(0, 6).map((act, idx) => {
                const isAccepted = act.badge === 'ACCEPTED';
                const isContest = act.type === 'CONTEST';
                const isChallenge = act.type === 'CHALLENGE';

                const icon = isContest ? '🏆' : isChallenge ? '🧩' : isAccepted ? '✅' : '⚡';
                const badgeColor = isAccepted ? '#10b981' : isContest ? '#f59e0b' : isChallenge ? '#8b5cf6' : '#ef4444';

                return (
                  <div
                    key={act.id || idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: 'var(--bg-app)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '16px' }}>{icon}</span>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>
                          {act.title}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {act.description}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        fontSize: '10px',
                        fontWeight: '800',
                        background: `${badgeColor}15`,
                        color: badgeColor,
                        border: `1px solid ${badgeColor}30`,
                        display: 'inline-block',
                        marginBottom: '2px'
                      }}>
                        {act.badge || 'EVENT'}
                      </span>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        {act.timestamp ? new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
              No recent activity recorded yet.
            </div>
          )}
        </div>

      </div>

      {/* User Management Modal */}
      {showUserModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px'
          }}
          onClick={() => setShowUserModal(false)}
        >
          <div
            className="glass-card"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '14px',
              width: '100%',
              maxWidth: '780px',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-lg, 0 10px 30px rgba(0,0,0,0.3))'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>👥 User Directory & Roles</span>
                  <span style={{ fontSize: '12px', background: 'var(--bg-app)', padding: '2px 8px', borderRadius: '9999px', color: 'var(--text-muted)' }}>
                    {users.length} Users
                  </span>
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                  View all registered Students, Problem Setters, and Platform Administrators
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowUserModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '20px',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px 8px'
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Search & Filters */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search by username or email..."
                style={{
                  flex: 1,
                  minWidth: '220px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-app)',
                  color: 'var(--text-main)',
                  fontSize: '13px'
                }}
              />

              <div style={{ display: 'inline-flex', background: 'var(--bg-app)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                {[
                  { key: 'ALL', label: 'All' },
                  { key: 'STUDENT', label: 'Students' },
                  { key: 'PROBLEM_SETTER', label: 'Setters' },
                  { key: 'ADMIN', label: 'Admins' }
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setUserRoleFilter(key)}
                    style={{
                      background: userRoleFilter === key ? 'var(--bg-surface)' : 'transparent',
                      color: userRoleFilter === key ? 'var(--primary)' : 'var(--text-muted)',
                      border: 'none',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      boxShadow: userRoleFilter === key ? 'var(--shadow-sm)' : 'none'
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal User Table */}
            <div style={{ overflowY: 'auto', padding: '16px 24px', flex: 1 }}>
              {filteredUsers.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '8px 12px', fontWeight: '700' }}>ID</th>
                      <th style={{ padding: '8px 12px', fontWeight: '700' }}>User</th>
                      <th style={{ padding: '8px 12px', fontWeight: '700' }}>Email</th>
                      <th style={{ padding: '8px 12px', fontWeight: '700' }}>Role</th>
                      <th style={{ padding: '8px 12px', fontWeight: '700' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => {
                      const role = (u.role || '').toUpperCase();
                      const isAdm = role.includes('ADMIN');
                      const isSet = role.includes('SETTER');
                      const roleColor = isAdm ? '#f59e0b' : isSet ? '#8b5cf6' : '#3b82f6';
                      const roleLabel = isAdm ? 'Admin' : isSet ? 'Setter' : 'Student';

                      return (
                        <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <td style={{ padding: '10px 12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>#{u.id}</td>
                          <td style={{ padding: '10px 12px', fontWeight: '700', color: 'var(--text-main)' }}>{u.username}</td>
                          <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{u.email || `${u.username}@codecrest.com`}</td>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: '9999px',
                              fontSize: '11px',
                              fontWeight: '700',
                              background: `${roleColor}15`,
                              color: roleColor,
                              border: `1px solid ${roleColor}30`
                            }}>
                              {roleLabel}
                            </span>
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{ color: '#10b981', fontWeight: '600', fontSize: '12px' }}>
                              ● {u.status || 'ACTIVE'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
                  No users found matching your filters.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-subtle)', textAlign: 'right' }}>
              <button
                type="button"
                onClick={() => setShowUserModal(false)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-main)',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
