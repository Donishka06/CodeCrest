import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChallenges, deleteChallenge } from '../../store/slices/challengeSlice';
import { Link } from 'react-router-dom';

import api from '../../services/api';

const ChallengeList = () => {
  const dispatch = useDispatch();
  const { items, totalPages, currentPage, loading } = useSelector((state) => state.challenges || {});
  const { user } = useSelector((state) => state.auth || {});
  const [notification, setNotification] = useState('');
  const [solvedIds, setSolvedIds] = useState([]);

  useEffect(() => {
    dispatch(fetchChallenges({ page: currentPage || 0, size: 10 }));
    const fetchSolved = async () => {
      try {
        const res = await api.get('/submissions/my-solved-ids');
        if (res && Array.isArray(res.data)) {
          setSolvedIds(res.data);
        }
      } catch (err) {}
    };
    fetchSolved();
  }, [dispatch, currentPage]);

  const handleDelete = async (id) => {
    const res = await dispatch(deleteChallenge(id));
    if (deleteChallenge.fulfilled.match(res)) {
      setNotification('Item deleted via DELETE');
      setTimeout(() => setNotification(''), 3000);
    }
  };

  const role = String(user?.role || '').toUpperCase();
  const username = String(user?.username || '').toLowerCase();

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

  const isStudent = Boolean(
    user && (
      role.includes('CONTESTANT') ||
      role.includes('STUDENT') ||
      username === 'contestant' ||
      (!isAdmin && !isSetter)
    )
  );

  const canAdd = !user || isAdmin || isSetter;
  const canEdit = !user || isAdmin || isSetter;
  const canDelete = isAdmin;

  const currentUsername = user?.username || 'contestant';
  const localSolved = (() => {
    try {
      return JSON.parse(localStorage.getItem(`solved_${currentUsername}`) || '[]');
    } catch (e) {
      return [];
    }
  })();

  const allSolvedIds = Array.from(new Set([
    ...solvedIds.map(Number),
    ...localSolved.map(Number)
  ]));

  return (
    <div className="challenges-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ margin: '0 0 6px 0', fontSize: '26px', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Coding Challenges
          </h2>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>
            Solve algorithmic problems, optimize complexities, and earn contest points
          </p>
        </div>

        {canAdd && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link
              to="/ai/generate-questions"
              style={{
                padding: '8px 16px',
                background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: '6px',
                fontWeight: '700',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              ✨ Generate with AI
            </Link>
            <Link
              to="/challenges/new"
              style={{
                padding: '8px 16px',
                background: 'var(--success)',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: '6px',
                fontWeight: '700',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              + Add Challenge
            </Link>
          </div>
        )}
      </div>

      {notification && (
        <div style={{ padding: '10px 14px', background: 'var(--success-bg)', border: '1px solid var(--success-border)', color: 'var(--success)', borderRadius: '6px', marginBottom: '16px', fontSize: '14px', fontWeight: '600' }}>
          {notification}
        </div>
      )}

      {loading && (
        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading challenges...
        </div>
      )}

      <div style={{ overflowX: 'auto', borderRadius: '10px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
        <table className="codec-table" style={{ width: '100%', border: 'none' }}>
          <thead>
            <tr>
              <th style={{ width: '40px', textAlign: 'center' }}>Status</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Title</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Difficulty</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Base Points</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items && items.length > 0 ? (
              items.map((challenge) => {
                const isSolved = allSolvedIds.includes(Number(challenge.id));

                return (
                  <tr key={challenge.id}>
                    <td style={{ textAlign: 'center' }}>
                      {isSolved ? (
                        <span style={{ color: 'var(--success)', fontWeight: 'bold', fontSize: '15px' }} title="Solved">✓</span>
                      ) : (
                        <span style={{ color: 'var(--border-main)', fontSize: '13px' }}>○</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <Link
                        to={`/challenges/${challenge.id}`}
                        style={{ color: 'var(--text-main)', fontWeight: '600', textDecoration: 'none', fontSize: '15px' }}
                      >
                        {challenge.title}
                      </Link>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className={`badge badge-${challenge.difficulty?.toLowerCase()}`}>
                        {challenge.difficulty}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ color: 'var(--text-muted)', fontWeight: '600', fontSize: '13px' }}>
                        ⭐ {challenge.basePoints} pts
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      {isStudent ? (
                        isSolved ? (
                          <Link
                            to={`/challenges/${challenge.id}`}
                            style={{
                              color: 'var(--success)',
                              fontWeight: '700',
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: 'var(--success-bg)',
                              padding: '5px 12px',
                              borderRadius: '6px',
                              border: '1px solid var(--success-border)',
                              fontSize: '12px'
                            }}
                          >
                            Solved Problem ✔️
                          </Link>
                        ) : (
                          <Link
                            to={`/challenges/${challenge.id}`}
                            style={{
                              color: '#fff',
                              background: 'var(--primary)',
                              padding: '6px 14px',
                              borderRadius: '6px',
                              fontWeight: '600',
                              fontSize: '13px',
                              textDecoration: 'none',
                              display: 'inline-block'
                            }}
                          >
                            Solve Challenge
                          </Link>
                        )
                      ) : (
                        <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                          {canEdit && (
                            <Link
                              to={`/challenges/edit/${challenge.id}`}
                              style={{
                                color: 'var(--primary)',
                                textDecoration: 'none',
                                fontWeight: '600',
                                fontSize: '13px',
                                padding: '4px 10px',
                                borderRadius: '4px',
                                background: 'var(--primary-subtle)',
                                border: '1px solid var(--primary-border)'
                              }}
                            >
                              Edit
                            </Link>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(challenge.id)}
                              style={{
                                color: 'var(--danger)',
                                border: '1px solid var(--danger-border)',
                                background: 'var(--danger-bg)',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '13px',
                                padding: '4px 10px',
                                borderRadius: '4px'
                              }}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No challenges found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination-container" style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '24px', alignItems: 'center' }}>
        <button
          disabled={currentPage <= 0}
          onClick={() => dispatch(fetchChallenges({ page: currentPage - 1, size: 10 }))}
          style={{
            padding: '7px 14px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-main)',
            color: 'var(--text-main)',
            borderRadius: '6px',
            cursor: currentPage <= 0 ? 'not-allowed' : 'pointer',
            opacity: currentPage <= 0 ? 0.4 : 1,
            fontWeight: 'bold'
          }}
        >
          &lt;
        </button>
        <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '500' }}>
          Page <strong style={{ color: 'var(--text-main)' }}>{currentPage + 1}</strong> of {totalPages || 1}
        </span>
        <button
          disabled={currentPage + 1 >= (totalPages || 1)}
          onClick={() => dispatch(fetchChallenges({ page: currentPage + 1, size: 10 }))}
          style={{
            padding: '7px 14px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-main)',
            color: 'var(--text-main)',
            borderRadius: '6px',
            cursor: (currentPage + 1 >= (totalPages || 1)) ? 'not-allowed' : 'pointer',
            opacity: (currentPage + 1 >= (totalPages || 1)) ? 0.4 : 1,
            fontWeight: 'bold'
          }}
        >
          &gt;
        </button>
      </div>
    </div>
  );
};

export default ChallengeList;
