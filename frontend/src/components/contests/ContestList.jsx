import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchContests, enrollParticipant, unenrollParticipant } from '../../store/slices/contestSlice';
import contestService from '../../services/contestService';
import aiQuestionService from '../../services/aiQuestionService';
import { Link } from 'react-router-dom';

const ContestList = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.contests || {});
  const { user } = useSelector((state) => state.auth || {});
  const [notification, setNotification] = useState(null);
  const [activeParticipantContest, setActiveParticipantContest] = useState(null);
  const [participantsList, setParticipantsList] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [activeQuestionsContest, setActiveQuestionsContest] = useState(null);
  const [contestQuestionsList, setContestQuestionsList] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    dispatch(fetchContests({ page: 0, size: 10 }));
    const ticker = setInterval(() => setCurrentTime(Date.now()), 5000);
    return () => clearInterval(ticker);
  }, [dispatch]);

  const computeContestStatus = (contest) => {
    if (!contest.startTime || !contest.endTime) return contest.status || 'UPCOMING';
    const now = new Date();
    const start = new Date(contest.startTime);
    const end = new Date(contest.endTime);
    if (now < start) return 'UPCOMING';
    if (now >= end) return 'EXPIRED';
    return 'ACTIVE';
  };

  const formatRemainingTime = (targetDate) => {
    if (!targetDate) return '';
    const diff = Math.max(0, new Date(targetDate).getTime() - Date.now());
    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (days > 0) return `${days}d ${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h ${mins}m ${secs}s`;
    return `${mins}m ${secs}s`;
  };

  const currentUsername = user?.username || 'contestant';

  const handleEnroll = async (id) => {
    const res = await dispatch(enrollParticipant({ contestId: id, username: currentUsername }));
    if (enrollParticipant.fulfilled.match(res)) {
      setNotification({ message: 'Enrolled successfully!', type: 'success' });
      dispatch(fetchContests({ page: 0, size: 10 }));
    } else {
      setNotification({ message: res.payload || 'Enrollment failed.', type: 'error' });
    }
    setTimeout(() => setNotification(null), 4000);
  };

  const handleUnenroll = async (id) => {
    const res = await dispatch(unenrollParticipant({ contestId: id, username: currentUsername }));
    if (unenrollParticipant.fulfilled.match(res)) {
      setNotification({ message: 'Unenrolled successfully!', type: 'success' });
      dispatch(fetchContests({ page: 0, size: 10 }));
    } else {
      setNotification({ message: res.payload || 'Unenrollment failed.', type: 'error' });
    }
    setTimeout(() => setNotification(null), 4000);
  };

  const handleDeleteContest = async (id) => {
    try {
      await contestService.delete(id);
      setNotification({ message: 'Contest deleted successfully', type: 'success' });
      dispatch(fetchContests({ page: 0, size: 10 }));
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to delete contest';
      setNotification({ message: errMsg, type: 'error' });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleViewParticipants = async (contest) => {
    setActiveParticipantContest(contest);
    setLoadingParticipants(true);
    try {
      const list = await contestService.getEnrolledParticipants(contest.id);
      setParticipantsList(list || []);
    } catch (err) {
      setParticipantsList([]);
    } finally {
      setLoadingParticipants(false);
    }
  };

  const role = String(user?.role || '').toUpperCase();
  const username = String(user?.username || '').toLowerCase();
  const isAdmin = Boolean(user && (role.includes('ADMIN') || role === 'PLATFORM_ADMIN' || username === 'admin'));
  const isSetter = Boolean(user && (role.includes('SETTER') || role.includes('PROBLEM_SETTER') || username === 'setter' || isAdmin));
  const isStudent = !user || role.includes('CONTESTANT') || role.includes('STUDENT') || username === 'contestant' || !isAdmin;

  const handleViewQuestions = async (contest) => {
    setActiveQuestionsContest(contest);
    setLoadingQuestions(true);
    try {
      const list = await aiQuestionService.getContestQuestions(contest.id);
      setContestQuestionsList(list || []);
    } catch (err) {
      setContestQuestionsList([]);
    } finally {
      setLoadingQuestions(false);
    }
  };

  return (
    <div className="contests-container" style={{ padding: '28px', maxWidth: '1300px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ margin: '0 0 6px 0', fontSize: '26px', fontWeight: '800', color: 'var(--text-main)' }}>Programming Contests</h2>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>
            Compete live, climb real-time leaderboards, and master timed algorithmic problem solving.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {isSetter && (
            <Link
              to="/ai/generate-questions"
              style={{
                padding: '9px 18px',
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 6px rgba(99, 102, 241, 0.3)'
              }}
            >
              ✨ AI Question Studio
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/contests/new"
              style={{
                padding: '9px 18px',
                background: 'var(--primary)',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 6px rgba(59, 130, 246, 0.3)'
              }}
            >
              + Create New Contest
            </Link>
          )}
        </div>
      </div>

      {notification && (() => {
        const text = typeof notification === 'string' ? notification : notification?.message;
        if (!text) return null;
        const isError = notification?.type === 'error' ||
          (typeof notification === 'string' && /fail|error|cannot|denied|reached|invalid|not found|exception|violat/i.test(notification));
        return (
          <div style={{
            padding: '12px 16px',
            background: isError ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
            color: isError ? '#ef4444' : '#10b981',
            border: `1px solid ${isError ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
            borderRadius: '8px',
            marginBottom: '20px',
            fontWeight: '600',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>{isError ? '⚠️' : '✓'}</span>
            <span>{text}</span>
          </div>
        );
      })()}
      {loading && (
        <div style={{ color: 'var(--text-muted)', padding: '20px 0', textAlign: 'center' }}>
          Loading contests...
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '22px', marginTop: '12px' }}>
        {items && items.length > 0 ? (
          items.map((contest) => {
            const enrolledList = contest.enrolledParticipants || [];
            const isEnrolled = enrolledList.some(p => String(p).toLowerCase() === String(currentUsername).toLowerCase());
            const enrolledCount = typeof contest.enrolledCount === 'number' ? contest.enrolledCount : enrolledList.length;
            const effectiveStatus = computeContestStatus(contest);

            return (
              <div
                key={contest.id}
                className="glass-card"
                style={{
                  padding: '22px',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', lineHeight: '1.4' }}>
                      {contest.title}
                    </h3>
                    <span style={{
                      fontSize: '11px',
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      fontWeight: '800',
                      letterSpacing: '0.4px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      whiteSpace: 'nowrap',
                      background: effectiveStatus === 'ACTIVE' ? 'rgba(16, 185, 129, 0.15)' : effectiveStatus === 'EXPIRED' ? 'rgba(148, 163, 184, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                      color: effectiveStatus === 'ACTIVE' ? '#10b981' : effectiveStatus === 'EXPIRED' ? 'var(--text-muted)' : '#3b82f6',
                      border: `1px solid ${effectiveStatus === 'ACTIVE' ? 'rgba(16, 185, 129, 0.35)' : 'transparent'}`
                    }}>
                      {effectiveStatus === 'ACTIVE' && (
                        <span style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', animation: 'pulse 1.5s infinite' }} />
                      )}
                      {effectiveStatus === 'ACTIVE' ? 'ACTIVE NOW' : effectiveStatus}
                    </span>
                  </div>

                  {/* Date & Countdown details */}
                  <div style={{ margin: '6px 0 14px 0', fontSize: '13px' }}>
                    {effectiveStatus === 'ACTIVE' && contest.endTime && (
                      <div style={{ color: '#10b981', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        ⏳ Ends in: {formatRemainingTime(contest.endTime)}
                      </div>
                    )}
                    {effectiveStatus === 'UPCOMING' && contest.startTime && (
                      <div style={{ color: '#3b82f6', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        🕒 Starts in: {formatRemainingTime(contest.startTime)}
                      </div>
                    )}
                    {effectiveStatus === 'EXPIRED' && (
                      <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        🏁 Contest Closed
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-muted)', padding: '10px 12px', background: 'var(--bg-app)', borderRadius: '8px', border: '1px solid var(--border-subtle)', marginBottom: '14px' }}>
                    <div>
                      Capacity: <strong style={{ color: 'var(--text-main)' }}>{contest.capacity}</strong>
                    </div>
                    <div>
                      Enrolled: <strong style={{ color: '#3b82f6' }}>{enrolledCount}</strong>
                    </div>
                  </div>

                  {enrolledList.length > 0 && (
                    <div style={{ background: 'var(--bg-app)', padding: '8px 12px', borderRadius: '6px', marginBottom: '14px', fontSize: '12px', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
                      <strong style={{ color: 'var(--text-main)' }}>Participants:</strong> {enrolledList.slice(0, 4).join(', ')}{enrolledList.length > 4 ? ` +${enrolledList.length - 4} more` : ''}
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {isStudent && (
                    <div>
                      {effectiveStatus === 'UPCOMING' && (
                        isEnrolled ? (
                          <button
                            onClick={() => handleUnenroll(contest.id)}
                            style={{
                              width: '100%',
                              padding: '10px',
                              background: '#ef4444',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontWeight: '700',
                              fontSize: '14px',
                              transition: 'all 0.2s'
                            }}
                            title="Cancel your enrollment in this contest"
                          >
                            Unenroll
                          </button>
                        ) : (
                          <button
                            onClick={() => handleEnroll(contest.id)}
                            style={{
                              width: '100%',
                              padding: '10px',
                              background: 'var(--primary)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontWeight: '700',
                              fontSize: '14px',
                              transition: 'all 0.2s'
                            }}
                          >
                            Enroll in Contest
                          </button>
                        )
                      )}

                      {effectiveStatus === 'ACTIVE' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <Link
                            to={`/contests/${contest.id}/arena`}
                            style={{
                              width: '100%',
                              padding: '11px',
                              background: 'linear-gradient(135deg, #10b981, #059669)',
                              color: '#fff',
                              textDecoration: 'none',
                              borderRadius: '8px',
                              fontWeight: '800',
                              fontSize: '14px',
                              textAlign: 'center',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              boxShadow: '0 4px 10px rgba(16, 185, 129, 0.35)',
                              transition: 'all 0.2s'
                            }}
                          >
                            🚀 Enter Contest Arena
                          </Link>
                          {!isEnrolled && (
                            <button
                              onClick={() => handleEnroll(contest.id)}
                              style={{
                                width: '100%',
                                padding: '8px',
                                background: 'rgba(59, 130, 246, 0.12)',
                                color: '#3b82f6',
                                border: '1px solid rgba(59, 130, 246, 0.3)',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: '600'
                              }}
                            >
                              + Quick Enroll ({enrolledCount} enrolled)
                            </button>
                          )}
                        </div>
                      )}

                      {effectiveStatus === 'EXPIRED' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ padding: '9px', background: 'var(--bg-app)', color: 'var(--text-muted)', textAlign: 'center', borderRadius: '8px', fontSize: '13px', fontWeight: '600', border: '1px solid var(--border-subtle)' }}>
                            Participation Closed (Contest Expired)
                          </div>
                          <Link
                            to={`/leaderboard?contestId=${contest.id}`}
                            state={{ contestId: contest.id, contestTitle: contest.title }}
                            style={{
                              width: '100%',
                              padding: '10px',
                              background: 'var(--primary)',
                              color: '#fff',
                              textDecoration: 'none',
                              borderRadius: '8px',
                              fontWeight: '700',
                              fontSize: '14px',
                              textAlign: 'center',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px'
                            }}
                          >
                            🏆 View Results / Leaderboard
                          </Link>
                        </div>
                      )}
                    </div>
                  )}

                  {isSetter && (
                    <Link
                      to={`/contests/${contest.id}/generate-ai`}
                      style={{
                        width: '100%',
                        padding: '10px',
                        background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '700',
                        textDecoration: 'none',
                        textAlign: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 4px rgba(99, 102, 241, 0.25)'
                      }}
                    >
                      ✨ Generate with AI
                    </Link>
                  )}

                  {isSetter && (
                    <button
                      onClick={() => handleViewQuestions(contest)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        background: 'var(--bg-app)',
                        color: 'var(--text-main)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '600'
                      }}
                    >
                      📋 View Questions
                    </button>
                  )}

                  <button
                    onClick={() => handleViewParticipants(contest)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      background: 'var(--bg-app)',
                      color: 'var(--text-main)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '600'
                    }}
                  >
                    🔍 View Enrolled List ({enrolledCount})
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteContest(contest.id)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        background: '#ef4444',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '700',
                        fontSize: '13px'
                      }}
                    >
                      Delete Contest
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ color: 'var(--text-muted)' }}>No active contests available.</div>
        )}
      </div>

      {/* Enrolled Participants Modal / Drawer for Admin & Users */}
      {activeParticipantContest && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(3px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'var(--bg-surface)', color: 'var(--text-main)', padding: '24px', borderRadius: '14px', maxWidth: '520px', width: '100%', maxHeight: '85vh', overflowY: 'auto', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Enrolled Participants — {activeParticipantContest.title}</h3>
              <button
                onClick={() => setActiveParticipantContest(null)}
                style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text-muted)', fontWeight: 'bold' }}
              >
                ✕
              </button>
            </div>

            {loadingParticipants ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading participants...</div>
            ) : participantsList && participantsList.length > 0 ? (
              <table className="codec-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left' }}>
                    <th style={{ padding: '10px' }}>Rank</th>
                    <th style={{ padding: '10px' }}>Username</th>
                    <th style={{ padding: '10px' }}>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {participantsList.map((p, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '10px' }}>#{p.rank || idx + 1}</td>
                      <td style={{ padding: '10px', fontWeight: p.username === currentUsername ? '700' : 'normal' }}>
                        {p.username} {p.username === currentUsername ? <span style={{ color: '#3b82f6', fontSize: '12px' }}>(You)</span> : ''}
                      </td>
                      <td style={{ padding: '10px', color: '#3b82f6', fontWeight: '700' }}>{p.score || 0} pts</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No contestants have enrolled in this contest yet.
              </div>
            )}

            <button
              onClick={() => setActiveParticipantContest(null)}
              style={{ marginTop: '20px', padding: '10px 16px', background: 'var(--bg-app)', color: 'var(--text-main)', border: '1px solid var(--border-subtle)', borderRadius: '8px', cursor: 'pointer', width: '100%', fontWeight: '600' }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Contest Questions Modal for Setters & Admins */}
      {activeQuestionsContest && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(3px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'var(--bg-surface)', color: 'var(--text-main)', padding: '24px', borderRadius: '14px', maxWidth: '650px', width: '100%', maxHeight: '85vh', overflowY: 'auto', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Contest Questions — {activeQuestionsContest.title}</h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Assigned challenges for this contest</span>
              </div>
              <button
                onClick={() => setActiveQuestionsContest(null)}
                style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text-muted)', fontWeight: 'bold' }}
              >
                ✕
              </button>
            </div>

            {loadingQuestions ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading questions...</div>
            ) : contestQuestionsList && contestQuestionsList.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {contestQuestionsList.map((q, idx) => (
                  <div key={q.id || idx} style={{ border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-app)' }}>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--text-main)' }}>
                        #{q.id} {q.title}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontWeight: '700', color: q.difficulty === 'EASY' ? '#10b981' : q.difficulty === 'MEDIUM' ? '#f59e0b' : '#ef4444' }}>
                          {q.difficulty}
                        </span>
                        <span>•</span>
                        <span>{q.basePoints || 100} Points</span>
                      </div>
                    </div>
                    <div>
                      <span style={{
                        fontSize: '11px',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontWeight: '700',
                        background: q.status === 'PUBLISHED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: q.status === 'PUBLISHED' ? '#10b981' : '#f59e0b'
                      }}>
                        {q.status || 'DRAFT'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-app)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📝</div>
                <div>No questions have been added to this contest yet.</div>
                {isSetter && (
                  <Link
                    to={`/contests/${activeQuestionsContest.id}/generate-ai`}
                    style={{ display: 'inline-block', marginTop: '12px', padding: '8px 16px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', textDecoration: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold' }}
                  >
                    ✨ Generate Questions with AI Now
                  </Link>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              {isSetter && (
                <Link
                  to={`/contests/${activeQuestionsContest.id}/generate-ai`}
                  style={{ flex: 1, padding: '10px 16px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', textDecoration: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '700', textAlign: 'center' }}
                >
                  ✨ Add More with AI
                </Link>
              )}
              <button
                onClick={() => setActiveQuestionsContest(null)}
                style={{ padding: '10px 16px', background: 'var(--bg-app)', color: 'var(--text-main)', border: '1px solid var(--border-subtle)', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
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

export default ContestList;
