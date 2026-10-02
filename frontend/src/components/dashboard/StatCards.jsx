import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import rankingService from '../../services/rankingService';

const StatCards = () => {
  const [profile, setProfile] = useState(null);
  const [solvedCount, setSolvedCount] = useState(0);
  const [rankings, setRankings] = useState([]);
  const [totalContestants, setTotalContestants] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const [resProf, resSolved, resRankings] = await Promise.all([
          api.get('/profiles/me').catch(() => null),
          api.get('/submissions/my-solved-ids').catch(() => null),
          rankingService.getGlobal(0, 100).catch(() => null)
        ]);

        if (!isMounted) return;

        if (resProf && resProf.data) {
          setProfile(resProf.data);
        }

        if (resSolved && Array.isArray(resSolved.data)) {
          setSolvedCount(resSolved.data.length);
        }

        if (resRankings) {
          const list = resRankings.content || (Array.isArray(resRankings) ? resRankings : []);
          setRankings(list);
          setTotalContestants(resRankings.totalElements || list.length || 0);
        }
      } catch (e) {
        // Fallback gracefully
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Determine user identity
  const storedUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  const username = (profile?.username || storedUser?.username || '').trim().toLowerCase();

  // Find user's exact ranking from global leaderboard
  const userRankEntry = rankings.find(
    (r) => String(r.username || '').trim().toLowerCase() === username
  );

  const effectiveRank = userRankEntry?.rank ?? profile?.globalRank ?? null;
  const effectivePoints = profile?.totalPoints ?? userRankEntry?.score ?? 0;
  const totalCount = Math.max(totalContestants, rankings.length, 1);

  // Compute dynamic standing text
  let rankDisplay = '#1';
  let percentileSubtitle = 'Top competitive percentile';

  if (effectivePoints > 0 || solvedCount > 0) {
    const currentRank = effectiveRank || 1;
    rankDisplay = `#${currentRank}`;
    const percentile = Math.max(1, Math.round((currentRank / totalCount) * 100));

    if (currentRank === 1) {
      percentileSubtitle = `Top 1% • #1 Overall 🥇`;
    } else if (currentRank === 2) {
      percentileSubtitle = `Top ${percentile}% • Podium rank 🥈`;
    } else if (currentRank === 3) {
      percentileSubtitle = `Top ${percentile}% • Podium rank 🥉`;
    } else {
      percentileSubtitle = `Top ${percentile}% of ${totalCount} contestants`;
    }
  } else {
    // 0 points / no submissions yet
    rankDisplay = effectiveRank ? `#${effectiveRank}` : 'Unranked';
    percentileSubtitle = '0 pts • Solve problems to climb';
  }

  return (
    <div
      className="stat-cards-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '20px',
        marginBottom: '28px'
      }}
    >
      {/* 1. Global Standing Card (Interactive Link to /leaderboard) */}
      <Link
        to="/leaderboard"
        style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
      >
        <div
          className="glass-card stat-card-hover"
          style={{
            padding: '22px 24px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-sm)',
            cursor: 'pointer',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(245, 158, 11, 0.15)';
            e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3 style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Global Standing
            </h3>
            <span style={{ fontSize: '20px' }}>🏆</span>
          </div>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#f59e0b', letterSpacing: '-0.5px' }}>
            {rankDisplay}
          </p>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
            {percentileSubtitle}
          </span>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '12px',
              paddingTop: '10px',
              borderTop: '1px solid var(--border-subtle)',
              fontSize: '11px',
              color: 'var(--primary)',
              fontWeight: '700'
            }}
          >
            <span>View Leaderboard</span>
            <span>→</span>
          </div>
        </div>
      </Link>

      {/* 2. Total Points Card */}
      <div
        className="glass-card stat-card-hover"
        style={{
          padding: '22px 24px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-sm)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.15)';
          e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
          e.currentTarget.style.borderColor = 'var(--border-subtle)';
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h3 style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Total Points
          </h3>
          <span style={{ fontSize: '20px' }}>⭐</span>
        </div>
        <p style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#3b82f6', letterSpacing: '-0.5px' }}>
          {effectivePoints}
        </p>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
          Earned from solved problems
        </span>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '12px',
            paddingTop: '10px',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '11px',
            color: '#3b82f6',
            fontWeight: '700'
          }}
        >
          <span>Score benchmark</span>
          <span>⭐</span>
        </div>
      </div>

      {/* 3. Challenges Solved Card (Interactive Link to /challenges) */}
      <Link
        to="/challenges"
        style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
      >
        <div
          className="glass-card stat-card-hover"
          style={{
            padding: '22px 24px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-sm)',
            cursor: 'pointer',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.15)';
            e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3 style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Challenges Solved
            </h3>
            <span style={{ fontSize: '20px' }}>✔️</span>
          </div>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#10b981', letterSpacing: '-0.5px' }}>
            {solvedCount}
          </p>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
            Problems fully accepted
          </span>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '12px',
              paddingTop: '10px',
              borderTop: '1px solid var(--border-subtle)',
              fontSize: '11px',
              color: '#10b981',
              fontWeight: '700'
            }}
          >
            <span>Browse Challenges</span>
            <span>→</span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default StatCards;
