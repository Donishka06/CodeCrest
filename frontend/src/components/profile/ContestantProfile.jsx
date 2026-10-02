import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import profileService from '../../services/profileService';
import submissionService from '../../services/submissionService';
import contestService from '../../services/contestService';
import challengeService from '../../services/challengeService';
import rankingService from '../../services/rankingService';

// Clean CodeCrest branded default avatar (not a real person's photo)
const CodeCrestDefaultAvatar = ({ size = 96 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 96 96"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ width: '100%', height: '100%', borderRadius: '50%', display: 'block' }}
    aria-label="CodeCrest Default Avatar"
  >
    <defs>
      <linearGradient id={`crestGrad_${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1e3a8a" />
        <stop offset="50%" stopColor="#2563eb" />
        <stop offset="100%" stopColor="#38bdf8" />
      </linearGradient>
      <linearGradient id={`innerGlow_${size}`} x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05" />
      </linearGradient>
    </defs>
    {/* Base Circle with CodeCrest Gradient */}
    <circle cx="48" cy="48" r="48" fill={`url(#crestGrad_${size})`} />
    
    {/* Subtle tech geometric background ring */}
    <circle cx="48" cy="48" r="43" stroke={`url(#innerGlow_${size})`} strokeWidth="1.5" strokeDasharray="4 4" />
    
    {/* Stylized Developer Silhouette */}
    {/* Head */}
    <circle cx="48" cy="34" r="14" fill="#ffffff" />
    {/* Body / Shoulders */}
    <path
      d="M24 74 C24 59, 35 52, 48 52 C61 52, 72 59, 72 74 C64 80, 56 82, 48 82 C40 82, 32 80, 24 74 Z"
      fill="#ffffff"
    />
    
    {/* Branded Code Crest Tag </> across lower silhouette */}
    <rect x="36" y="60" width="24" height="13" rx="4" fill="#0f172a" opacity="0.92" />
    <text
      x="48"
      y="69.5"
      textAnchor="middle"
      fill="#38bdf8"
      fontSize="9"
      fontFamily="monospace"
      fontWeight="bold"
    >
      &lt;/&gt;
    </text>
  </svg>
);

const ContestantProfile = () => {
  const navigate = useNavigate();
  const { user: authUser, isAuthenticated } = useSelector((state) => state.auth || {});

  // Profile data
  const [profile, setProfile] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [contests, setContests] = useState([]);
  const [globalRankings, setGlobalRankings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Profile Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '',
    college: '',
    bio: '',
    programmingLanguages: '',
    profilePicture: ''
  });
  const [pendingPicture, setPendingPicture] = useState('');
  const [imageError, setImageError] = useState('');
  const fileInputRef = useRef(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Activity filter state
  const [activityFilter, setActivityFilter] = useState('ALL'); // 'ALL' | 'ACCEPTED' | 'CONTESTS'

  const currentUsername = (authUser?.username || 'contestant').trim();

  // Load all real data
  useEffect(() => {
    let isMounted = true;

    const loadProfileData = async () => {
      setLoading(true);
      try {
        const [profData, mySubs, challengesData, contestsData, rankingsData] = await Promise.all([
          api.get('/profiles/me').then((r) => r.data).catch(() => null),
          api.get('/submissions/my').then((r) => r.data).catch(() => []),
          challengeService.getChallenges(0, 100).then((r) => r.content || r).catch(() => []),
          contestService.getAll(0, 50).then((r) => r.content || r).catch(() => []),
          rankingService.getGlobal(0, 50).then((r) => r.content || r).catch(() => [])
        ]);

        if (!isMounted) return;

        // Fallback localStorage data for profile enhancements if needed
        const localExtKey = `codecrest_profile_ext_${currentUsername.toLowerCase()}`;
        const localExt = localStorage.getItem(localExtKey)
          ? JSON.parse(localStorage.getItem(localExtKey))
          : {};

        const defaultName = currentUsername ? (currentUsername.charAt(0).toUpperCase() + currentUsername.slice(1)) : 'Contestant';
        const mergedProfile = profData
          ? {
              ...profData,
              fullName: profData.fullName || localExt.fullName || defaultName,
              college: profData.college || localExt.college || 'Institute of Technology',
              bio: profData.bio || localExt.bio || 'Competitive programming enthusiast • Algorithms & Problem Solving',
              programmingLanguages: profData.programmingLanguages || localExt.programmingLanguages || 'Python, C++, Java, JavaScript',
              profilePicture: (profData.profilePicture !== undefined && profData.profilePicture !== null) ? profData.profilePicture : (localExt.profilePicture || null)
            }
          : {
              username: currentUsername,
              fullName: localExt.fullName || defaultName,
              college: localExt.college || 'Institute of Technology',
              bio: localExt.bio || 'Competitive programming enthusiast • Algorithms & Problem Solving',
              programmingLanguages: localExt.programmingLanguages || 'Python, C++, Java, JavaScript',
              profilePicture: localExt.profilePicture || null,
              totalPoints: 0,
              globalRank: 1
            };

        setProfile(mergedProfile);
        setEditForm({
          fullName: mergedProfile.fullName || '',
          college: mergedProfile.college || '',
          bio: mergedProfile.bio || '',
          programmingLanguages: mergedProfile.programmingLanguages || '',
          profilePicture: mergedProfile.profilePicture || ''
        });
        setPendingPicture(mergedProfile.profilePicture || '');

        setSubmissions(Array.isArray(mySubs) ? mySubs : []);
        setChallenges(Array.isArray(challengesData) ? challengesData : []);
        setContests(Array.isArray(contestsData) ? contestsData : []);
        setGlobalRankings(Array.isArray(rankingsData) ? rankingsData : []);
      } catch (err) {
        console.error('Error loading contestant profile data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProfileData();

    return () => {
      isMounted = false;
    };
  }, [currentUsername]);

  const handleOpenEditModal = () => {
    setEditForm({
      fullName: profile?.fullName || '',
      college: profile?.college || '',
      bio: profile?.bio || '',
      programmingLanguages: profile?.programmingLanguages || '',
      profilePicture: profile?.profilePicture || ''
    });
    setPendingPicture(profile?.profilePicture || '');
    setImageError('');
    setIsEditModalOpen(true);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageError('');

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const validExtensions = /\.(jpe?g|png)$/i;

    if (!validTypes.includes(file.type.toLowerCase()) && !validExtensions.test(file.name)) {
      setImageError('Only JPG, JPEG, and PNG images are allowed.');
      e.target.value = '';
      return;
    }

    // Maximum 5MB
    if (file.size > 5 * 1024 * 1024) {
      setImageError('Image file is too large. Maximum size is 5MB.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const dataUrl = loadEvent.target.result;
      setPendingPicture(dataUrl);
    };
    reader.onerror = () => {
      setImageError('Failed to read image file.');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemovePicture = () => {
    setPendingPicture('');
    setImageError('');
  };

  // Handle Edit Profile Save
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setSaveSuccess(false);

    try {
      const updatedData = {
        fullName: editForm.fullName.trim(),
        college: editForm.college.trim(),
        bio: editForm.bio.trim(),
        programmingLanguages: editForm.programmingLanguages.trim(),
        profilePicture: pendingPicture ? pendingPicture : ''
      };

      // 1. Save to backend if profile.id exists
      if (profile?.id) {
        await profileService.updateProfile(profile.id, updatedData).catch(() => null);
      }

      // 2. Persist locally to guarantee offline / immediate availability
      const localExtKey = `codecrest_profile_ext_${currentUsername.toLowerCase()}`;
      localStorage.setItem(localExtKey, JSON.stringify(updatedData));

      // 3. Update React state
      setProfile((prev) => ({
        ...prev,
        ...updatedData,
        profilePicture: pendingPicture || null
      }));

      setSaveSuccess(true);
      setTimeout(() => {
        setIsEditModalOpen(false);
        setSaveSuccess(false);
      }, 700);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSavingProfile(false);
    }
  };

  // Computations for Coding Journey (Easy / Medium / Hard)
  const journeyStats = useMemo(() => {
    const acceptedSubs = submissions.filter((s) => s.verdict === 'ACCEPTED');
    const solvedChallengeMap = new Map();

    acceptedSubs.forEach((s) => {
      if (s.challenge && s.challenge.id) {
        solvedChallengeMap.set(s.challenge.id, s.challenge);
      }
    });

    let solvedEasy = 0;
    let solvedMedium = 0;
    let solvedHard = 0;

    solvedChallengeMap.forEach((c) => {
      const diff = (c.difficulty || '').toUpperCase();
      if (diff === 'EASY') solvedEasy++;
      else if (diff === 'MEDIUM') solvedMedium++;
      else if (diff === 'HARD') solvedHard++;
    });

    let totalEasy = 0;
    let totalMedium = 0;
    let totalHard = 0;

    challenges.forEach((c) => {
      const diff = (c.difficulty || '').toUpperCase();
      if (diff === 'EASY') totalEasy++;
      else if (diff === 'MEDIUM') totalMedium++;
      else if (diff === 'HARD') totalHard++;
    });

    // Ensure denominators are realistic
    totalEasy = Math.max(totalEasy, solvedEasy, 1);
    totalMedium = Math.max(totalMedium, solvedMedium, 1);
    totalHard = Math.max(totalHard, solvedHard, 1);

    const totalSolved = solvedChallengeMap.size;
    const totalAvailable = totalEasy + totalMedium + totalHard;

    return {
      solvedEasy,
      totalEasy,
      solvedMedium,
      totalMedium,
      solvedHard,
      totalHard,
      totalSolved,
      totalAvailable
    };
  }, [submissions, challenges]);

  // Computations for Contest History
  const contestHistory = useMemo(() => {
    const map = new Map();

    submissions.forEach((s) => {
      if (s.contest && s.contest.id) {
        const cId = s.contest.id;
        if (!map.has(cId)) {
          map.set(cId, {
            contestId: cId,
            title: s.contest.title || `Contest #${cId}`,
            submissionsCount: 0,
            acceptedCount: 0,
            bestScore: 0,
            latestDate: s.submittedAt || null
          });
        }
        const entry = map.get(cId);
        entry.submissionsCount++;
        if (s.verdict === 'ACCEPTED') {
          entry.acceptedCount++;
          entry.bestScore += s.pointsEarned || 0;
        }
        if (s.submittedAt && (!entry.latestDate || new Date(s.submittedAt) > new Date(entry.latestDate))) {
          entry.latestDate = s.submittedAt;
        }
      }
    });

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.latestDate || 0) - new Date(a.latestDate || 0)
    );
  }, [submissions]);

  // Coding Identity Stats
  const problemsSolvedCount = journeyStats.totalSolved;
  const contestsCount = contestHistory.length;
  const ratingPoints = profile?.totalPoints ?? 0;
  const globalRank = profile?.globalRank || 1;
  const totalContestants = Math.max(globalRankings.length, 1);
  const percentile = Math.max(1, Math.round((globalRank / totalContestants) * 100));

  // Dynamic Achievements calculation
  const achievements = useMemo(() => {
    const list = [];

    if (problemsSolvedCount >= 1) {
      list.push({
        id: 'first_ac',
        title: 'First Blood',
        desc: 'First challenge accepted',
        icon: '🎯',
        color: '#10b981',
        unlocked: true
      });
    }

    if (problemsSolvedCount >= 5) {
      list.push({
        id: 'problem_solver',
        title: 'Problem Solver',
        desc: 'Solved 5+ coding challenges',
        icon: '💡',
        color: '#3b82f6',
        unlocked: true
      });
    }

    if (ratingPoints >= 500) {
      list.push({
        id: 'grandmaster',
        title: 'Century Master',
        desc: 'Earned 500+ competitive points',
        icon: '👑',
        color: '#f59e0b',
        unlocked: true
      });
    }

    if (journeyStats.solvedHard >= 1) {
      list.push({
        id: 'hard_crusher',
        title: 'Hard Crusher',
        desc: 'Conquered a Hard difficulty problem',
        icon: '🛡️',
        color: '#ef4444',
        unlocked: true
      });
    }

    if (contestsCount >= 1) {
      list.push({
        id: 'contest_gladiator',
        title: 'Arena Gladiator',
        desc: 'Participated in live contests',
        icon: '⚔️',
        color: '#8b5cf6',
        unlocked: true
      });
    }

    if (globalRank <= 3) {
      list.push({
        id: 'podium',
        title: 'Podium Elite',
        desc: 'Top 3 platform ranking',
        icon: '🏆',
        color: '#eab308',
        unlocked: true
      });
    }

    // Default milestone to always inspire
    list.push({
      id: 'algorithm_virtuoso',
      title: 'Algorithm Virtuoso',
      desc: problemsSolvedCount >= 10 ? 'Solved 10+ algorithms' : 'Solve 10 challenges to unlock',
      icon: '⚡',
      color: '#06b6d4',
      unlocked: problemsSolvedCount >= 10
    });

    return list;
  }, [problemsSolvedCount, ratingPoints, journeyStats.solvedHard, contestsCount, globalRank]);

  // Sorted Timeline Activity
  const activityList = useMemo(() => {
    let list = submissions.map((s) => ({
      id: s.id,
      type: s.contest ? 'CONTEST_SUBMISSION' : 'CHALLENGE_SUBMISSION',
      title: s.challenge?.title || 'Algorithm Challenge',
      difficulty: s.challenge?.difficulty || 'EASY',
      verdict: s.verdict || 'EVALUATED',
      points: s.pointsEarned || 0,
      contestTitle: s.contest?.title || null,
      date: s.submittedAt ? new Date(s.submittedAt) : new Date(),
      executionTime: s.executionTimeMs
    }));

    if (activityFilter === 'ACCEPTED') {
      list = list.filter((a) => a.verdict === 'ACCEPTED');
    } else if (activityFilter === 'CONTESTS') {
      list = list.filter((a) => a.type === 'CONTEST_SUBMISSION');
    }

    return list.sort((a, b) => b.date - a.date);
  }, [submissions, activityFilter]);

  // Formatted date helper
  const formatDate = (d) => {
    if (!d) return 'Recently';
    const date = new Date(d);
    if (isNaN(date.getTime())) return 'Recently';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const languagesList = useMemo(() => {
    if (!profile?.programmingLanguages) return ['Python', 'C++', 'Java'];
    return profile.programmingLanguages
      .split(',')
      .map((l) => l.trim())
      .filter(Boolean);
  }, [profile?.programmingLanguages]);

  if (loading) {
    return (
      <div style={{ padding: '80px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid var(--border-subtle)',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px auto'
          }}
        />
        <div style={{ fontSize: '15px', fontWeight: '600' }}>Loading developer identity...</div>
      </div>
    );
  }

  return (
    <div
      className="contestant-profile-page"
      style={{
        maxWidth: '1120px',
        margin: '0 auto',
        padding: '36px 24px 80px',
        color: 'var(--text-main)',
        minHeight: 'calc(100vh - 70px)'
      }}
    >
      {/* ========================================================================= */}
      {/* 1. TOP PROFILE AREA: Distinctive Developer Header                          */}
      {/* ========================================================================= */}
      <section
        style={{
          position: 'relative',
          background: 'var(--bg-surface)',
          borderRadius: '20px',
          border: '1px solid var(--border-subtle)',
          padding: '36px 36px 32px',
          marginBottom: '28px',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        {/* Subtle Code Watermark Accent */}
        <div
          style={{
            position: 'absolute',
            top: '-15px',
            right: '-10px',
            opacity: 0.04,
            fontSize: '180px',
            fontWeight: '900',
            fontFamily: 'monospace',
            userSelect: 'none',
            pointerEvents: 'none',
            lineHeight: 1
          }}
          aria-hidden="true"
        >
          &lt;/&gt;
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '28px'
          }}
        >
          {/* Avatar + Main Details */}
          <div style={{ display: 'flex', gap: '26px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {/* Circular Avatar with Subtle CodeCrest Ring */}
            <div style={{ position: 'relative' }}>
              <div
                onClick={handleOpenEditModal}
                title="Click to edit profile picture"
                style={{
                  width: '96px',
                  height: '96px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(37, 99, 235, 0.28)',
                  border: '3px solid var(--bg-surface)',
                  outline: '2px solid rgba(59, 130, 246, 0.4)',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                {profile?.profilePicture ? (
                  <img
                    src={profile.profilePicture}
                    alt={profile?.fullName || currentUsername}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <CodeCrestDefaultAvatar size={96} />
                )}
              </div>

              {/* Status Indicator */}
              <div
                title="Active Contestant"
                style={{
                  position: 'absolute',
                  bottom: '2px',
                  right: '2px',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: '#10b981',
                  border: '3px solid var(--bg-surface)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2
                }}
              />
            </div>

            {/* User Meta */}
            <div style={{ maxWidth: '620px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '4px' }}>
                <h1
                  style={{
                    fontSize: '30px',
                    fontWeight: '800',
                    margin: 0,
                    letterSpacing: '-0.5px',
                    color: 'var(--text-main)',
                    lineHeight: 1.2
                  }}
                >
                  {profile?.fullName || currentUsername}
                </h1>
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'var(--text-muted)',
                    fontFamily: 'monospace'
                  }}
                >
                  @{profile?.username || currentUsername}
                </span>

                {/* Rating Badge */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '3px 10px',
                    borderRadius: '16px',
                    background: 'rgba(59, 130, 246, 0.12)',
                    border: '1px solid rgba(59, 130, 246, 0.25)',
                    fontSize: '12px',
                    fontWeight: '700',
                    color: 'var(--primary)'
                  }}
                >
                  <span>⭐</span>
                  <span>{ratingPoints} Rating</span>
                </div>

                {/* Rank Badge */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '3px 10px',
                    borderRadius: '16px',
                    background: 'rgba(245, 158, 11, 0.12)',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    fontSize: '12px',
                    fontWeight: '700',
                    color: '#f59e0b'
                  }}
                >
                  <span>🏆</span>
                  <span>Rank #{globalRank}</span>
                </div>
              </div>

              {/* College / Institution */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  color: 'var(--text-muted)',
                  fontWeight: '600',
                  marginBottom: '10px'
                }}
              >
                <span>🎓</span>
                <span>{profile?.college || 'Department of Computer Science'}</span>
              </div>

              {/* Bio */}
              <p
                style={{
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: 'var(--text-secondary)',
                  margin: '0 0 14px 0',
                  maxWidth: '560px'
                }}
              >
                {profile?.bio || 'Competitive programming enthusiast specializing in algorithmic problem solving and data structures.'}
              </p>

              {/* Programming Languages Badges */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px', marginRight: '4px' }}>
                  Stack:
                </span>
                {languagesList.map((lang, idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: '3px 10px',
                      borderRadius: '8px',
                      background: 'var(--bg-app)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: 'var(--text-main)',
                      fontFamily: 'monospace'
                    }}
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Edit Profile Action Button */}
          <div>
            <button
              onClick={handleOpenEditModal}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-app)',
                color: 'var(--text-main)',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: 'var(--shadow-sm)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.color = 'var(--primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.color = 'var(--text-main)';
              }}
            >
              <span>✏️</span>
              <span>Edit Profile</span>
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. CODING IDENTITY: Clean Horizontal Strip (NO large cards)                */}
      {/* ========================================================================= */}
      <section
        style={{
          background: 'var(--bg-surface)',
          borderRadius: '16px',
          border: '1px solid var(--border-subtle)',
          padding: '20px 32px',
          marginBottom: '28px',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
            gap: '24px',
            alignItems: 'center'
          }}
        >
          {/* Stat 1: Problems Solved */}
          <div style={{ textAlign: 'center', padding: '0 8px' }}>
            <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.8px', marginBottom: '4px' }}>
              Problems Solved
            </div>
            <div style={{ fontSize: '30px', fontWeight: '800', color: '#10b981', letterSpacing: '-0.5px' }}>
              {problemsSolvedCount}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Fully accepted
            </div>
          </div>

          {/* Stat 2: Contests */}
          <div style={{ textAlign: 'center', padding: '0 8px', borderLeft: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.8px', marginBottom: '4px' }}>
              Contests
            </div>
            <div style={{ fontSize: '30px', fontWeight: '800', color: '#8b5cf6', letterSpacing: '-0.5px' }}>
              {contestsCount}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Competitions entered
            </div>
          </div>

          {/* Stat 3: Rating / Total Points */}
          <div style={{ textAlign: 'center', padding: '0 8px', borderLeft: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.8px', marginBottom: '4px' }}>
              Rating Points
            </div>
            <div style={{ fontSize: '30px', fontWeight: '800', color: '#3b82f6', letterSpacing: '-0.5px' }}>
              {ratingPoints}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Platform standing score
            </div>
          </div>

          {/* Stat 4: Global Rank */}
          <div style={{ textAlign: 'center', padding: '0 8px', borderLeft: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.8px', marginBottom: '4px' }}>
              Global Rank
            </div>
            <div style={{ fontSize: '30px', fontWeight: '800', color: '#f59e0b', letterSpacing: '-0.5px' }}>
              #{globalRank}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Top {percentile}% of {totalContestants} coders
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. TWO-COLUMN LAYOUT: Coding Journey + Achievements (Left) & Activity (Right) */}
      {/* ========================================================================= */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '28px',
          alignItems: 'start'
        }}
      >
        {/* Left Column: Coding Journey & Compact Achievements */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Coding Journey (Easy / Medium / Hard Progress) */}
          <div
            style={{
              background: 'var(--bg-surface)',
              borderRadius: '16px',
              border: '1px solid var(--border-subtle)',
              padding: '24px',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: 'var(--text-main)' }}>
                  Coding Journey
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Progress breakdown by problem difficulty
                </span>
              </div>
              <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--primary)' }}>
                {journeyStats.totalSolved} / {journeyStats.totalAvailable}
              </span>
            </div>

            {/* Easy Progress Bar */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>
                <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                  Easy
                </span>
                <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  {journeyStats.solvedEasy} <span style={{ opacity: 0.6 }}>/ {journeyStats.totalEasy}</span>
                </span>
              </div>
              <div style={{ height: '8px', background: 'var(--bg-app)', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(100, Math.round((journeyStats.solvedEasy / journeyStats.totalEasy) * 100))}%`,
                    background: 'linear-gradient(90deg, #10b981, #34d399)',
                    borderRadius: '4px',
                    transition: 'width 0.4s ease'
                  }}
                />
              </div>
            </div>

            {/* Medium Progress Bar */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>
                <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
                  Medium
                </span>
                <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  {journeyStats.solvedMedium} <span style={{ opacity: 0.6 }}>/ {journeyStats.totalMedium}</span>
                </span>
              </div>
              <div style={{ height: '8px', background: 'var(--bg-app)', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(100, Math.round((journeyStats.solvedMedium / journeyStats.totalMedium) * 100))}%`,
                    background: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
                    borderRadius: '4px',
                    transition: 'width 0.4s ease'
                  }}
                />
              </div>
            </div>

            {/* Hard Progress Bar */}
            <div style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>
                <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
                  Hard
                </span>
                <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  {journeyStats.solvedHard} <span style={{ opacity: 0.6 }}>/ {journeyStats.totalHard}</span>
                </span>
              </div>
              <div style={{ height: '8px', background: 'var(--bg-app)', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(100, Math.round((journeyStats.solvedHard / journeyStats.totalHard) * 100))}%`,
                    background: 'linear-gradient(90deg, #ef4444, #f87171)',
                    borderRadius: '4px',
                    transition: 'width 0.4s ease'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Compact Achievements Section */}
          <div
            style={{
              background: 'var(--bg-surface)',
              borderRadius: '16px',
              border: '1px solid var(--border-subtle)',
              padding: '24px',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: 'var(--text-main)' }}>
                Achievements
              </h3>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {achievements.filter((a) => a.unlocked).length} Unlocked
              </span>
            </div>

            {/* Compact Badges Cluster */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  title={ach.desc}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '7px 12px',
                    borderRadius: '10px',
                    background: ach.unlocked ? 'var(--bg-app)' : 'rgba(100, 116, 139, 0.08)',
                    border: `1px solid ${ach.unlocked ? 'var(--border-subtle)' : 'transparent'}`,
                    opacity: ach.unlocked ? 1 : 0.45,
                    cursor: 'default',
                    transition: 'transform 0.15s ease'
                  }}
                >
                  <span style={{ fontSize: '16px' }}>{ach.icon}</span>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: ach.unlocked ? 'var(--text-main)' : 'var(--text-muted)' }}>
                      {ach.title}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contest History Table/Timeline */}
          <div
            style={{
              background: 'var(--bg-surface)',
              borderRadius: '16px',
              border: '1px solid var(--border-subtle)',
              padding: '24px',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: 'var(--text-main)' }}>
                Contest History
              </h3>
              <Link to="/contests" style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '700', textDecoration: 'none' }}>
                Browse All Contests →
              </Link>
            </div>

            {contestHistory.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>
                      <th style={{ padding: '8px 10px', fontWeight: '700' }}>Contest</th>
                      <th style={{ padding: '8px 10px', fontWeight: '700', textAlign: 'center' }}>Score</th>
                      <th style={{ padding: '8px 10px', fontWeight: '700', textAlign: 'right' }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contestHistory.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '12px 10px', fontWeight: '700', color: 'var(--text-main)' }}>
                          <Link to={`/contests/${item.contestId}/arena`} style={{ color: 'inherit', textDecoration: 'none' }}>
                            {item.title}
                          </Link>
                        </td>
                        <td style={{ padding: '12px 10px', textAlign: 'center', fontWeight: '800', color: 'var(--primary)' }}>
                          {item.bestScore} pts
                        </td>
                        <td style={{ padding: '12px 10px', textAlign: 'right', color: 'var(--text-muted)', fontSize: '12px' }}>
                          {formatDate(item.latestDate)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 12px', color: 'var(--text-muted)', fontSize: '13px' }}>
                <span style={{ fontSize: '24px', display: 'block', marginBottom: '6px' }}>🏁</span>
                No contest participations yet.{' '}
                <Link to="/contests" style={{ color: 'var(--primary)', fontWeight: '700' }}>
                  Join an active contest
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Coding Activity Vertical Timeline */}
        <div>
          <div
            style={{
              background: 'var(--bg-surface)',
              borderRadius: '16px',
              border: '1px solid var(--border-subtle)',
              padding: '24px',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            {/* Header + Filter Tabs */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '24px',
                borderBottom: '1px solid var(--border-subtle)',
                paddingBottom: '14px'
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: 'var(--text-main)' }}>
                  Activity Timeline
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Recent submissions & contest entries
                </span>
              </div>

              {/* Filter Pills */}
              <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-app)', padding: '3px', borderRadius: '8px' }}>
                <button
                  type="button"
                  onClick={() => setActivityFilter('ALL')}
                  style={{
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: '700',
                    borderRadius: '6px',
                    border: 'none',
                    background: activityFilter === 'ALL' ? 'var(--primary)' : 'transparent',
                    color: activityFilter === 'ALL' ? '#ffffff' : 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setActivityFilter('ACCEPTED')}
                  style={{
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: '700',
                    borderRadius: '6px',
                    border: 'none',
                    background: activityFilter === 'ACCEPTED' ? '#10b981' : 'transparent',
                    color: activityFilter === 'ACCEPTED' ? '#ffffff' : 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  Accepted
                </button>
                <button
                  type="button"
                  onClick={() => setActivityFilter('CONTESTS')}
                  style={{
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: '700',
                    borderRadius: '6px',
                    border: 'none',
                    background: activityFilter === 'CONTESTS' ? '#8b5cf6' : 'transparent',
                    color: activityFilter === 'CONTESTS' ? '#ffffff' : 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  Contests
                </button>
              </div>
            </div>

            {/* Vertical Timeline Nodes */}
            {activityList.length > 0 ? (
              <div style={{ position: 'relative', paddingLeft: '24px' }}>
                {/* Continuous Connecting Line */}
                <div
                  style={{
                    position: 'absolute',
                    top: '8px',
                    bottom: '12px',
                    left: '7px',
                    width: '2px',
                    background: 'var(--border-subtle)'
                  }}
                  aria-hidden="true"
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                  {activityList.slice(0, 15).map((act, idx) => {
                    const isAc = act.verdict === 'ACCEPTED';
                    const nodeColor = isAc ? '#10b981' : '#ef4444';
                    const diffColor =
                      act.difficulty === 'HARD'
                        ? '#ef4444'
                        : act.difficulty === 'MEDIUM'
                        ? '#f59e0b'
                        : '#10b981';

                    return (
                      <div key={idx} style={{ position: 'relative' }}>
                        {/* Timeline Bullet Node */}
                        <div
                          style={{
                            position: 'absolute',
                            left: '-24px',
                            top: '4px',
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            background: 'var(--bg-surface)',
                            border: `3px solid ${nodeColor}`,
                            boxShadow: `0 0 0 2px var(--bg-surface)`
                          }}
                        />

                        {/* Timeline Node Content */}
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>
                                {act.title}
                              </span>
                              <span
                                style={{
                                  fontSize: '10px',
                                  fontWeight: '800',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  background: `${diffColor}18`,
                                  color: diffColor,
                                  textTransform: 'uppercase'
                                }}
                              >
                                {act.difficulty}
                              </span>
                            </div>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                              {formatDate(act.date)}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}>
                            <span
                              style={{
                                fontWeight: '700',
                                color: isAc ? '#10b981' : '#ef4444'
                              }}
                            >
                              {act.verdict.replace(/_/g, ' ')}
                            </span>
                            {isAc && act.points > 0 && (
                              <span style={{ color: 'var(--primary)', fontWeight: '600' }}>
                                +{act.points} pts
                              </span>
                            )}
                            {act.contestTitle && (
                              <span
                                style={{
                                  color: '#8b5cf6',
                                  fontWeight: '600',
                                  background: 'rgba(139, 92, 246, 0.1)',
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  fontSize: '11px'
                                }}
                              >
                                🏆 {act.contestTitle}
                              </span>
                            )}
                            {act.executionTime && (
                              <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                                {act.executionTime}ms
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '36px 12px', color: 'var(--text-muted)', fontSize: '13px' }}>
                <span style={{ fontSize: '28px', display: 'block', marginBottom: '8px' }}>⏳</span>
                No activity recorded under this filter.{' '}
                <Link to="/challenges" style={{ color: 'var(--primary)', fontWeight: '700' }}>
                  Solve a challenge now
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. EDIT PROFILE MODAL DIALOG                                              */}
      {/* ========================================================================= */}
      {isEditModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-profile-title"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={() => setIsEditModalOpen(false)}
        >
          <div
            className="glass-card"
            style={{
              background: 'var(--bg-surface)',
              borderRadius: '16px',
              border: '1px solid var(--border-subtle)',
              maxWidth: '540px',
              width: '100%',
              padding: '28px',
              boxShadow: 'var(--shadow-lg)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 id="edit-profile-title" style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: 'var(--text-main)' }}>
                  Edit Developer Profile
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Update your public contestant credentials
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveProfile}>
              {/* Profile Picture Upload & Preview Section */}
              <div
                style={{
                  marginBottom: '20px',
                  padding: '16px',
                  borderRadius: '12px',
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '700',
                    marginBottom: '10px',
                    color: 'var(--text-secondary)'
                  }}
                >
                  Profile Picture
                </label>

                <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
                  {/* Circular Preview */}
                  <div
                    style={{
                      width: '76px',
                      height: '76px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid var(--primary)',
                      boxShadow: 'var(--shadow-sm)',
                      flexShrink: 0
                    }}
                  >
                    {pendingPicture ? (
                      <img
                        src={pendingPicture}
                        alt="Preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                    ) : (
                      <CodeCrestDefaultAvatar size={76} />
                    )}
                  </div>

                  {/* Actions & File Upload */}
                  <div style={{ flex: 1, minWidth: '190px' }}>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/jpeg,image/png,image/jpg,.jpg,.jpeg,.png"
                      onChange={handleFileSelect}
                      style={{ display: 'none' }}
                    />

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          padding: '7px 14px',
                          borderRadius: '6px',
                          border: '1px solid var(--border-subtle)',
                          background: 'var(--bg-surface)',
                          color: 'var(--text-main)',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: 'var(--shadow-sm)'
                        }}
                      >
                        <span>📷</span>
                        <span>{pendingPicture ? 'Change Picture' : 'Upload Picture'}</span>
                      </button>

                      {pendingPicture && (
                        <button
                          type="button"
                          onClick={handleRemovePicture}
                          style={{
                            padding: '7px 14px',
                            borderRadius: '6px',
                            border: '1px solid var(--border-subtle)',
                            background: 'transparent',
                            color: 'var(--danger)',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <span>🗑️</span>
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Supports JPG, JPEG, or PNG (Max 5MB)
                    </div>

                    {imageError && (
                      <div style={{ color: 'var(--danger)', fontSize: '12px', fontWeight: '600', marginTop: '6px' }}>
                        ⚠️ {imageError}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Full Name */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  placeholder="e.g. Harish S"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-app)',
                    color: 'var(--text-main)',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* College / Institution */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  College / Institution
                </label>
                <input
                  type="text"
                  value={editForm.college}
                  onChange={(e) => setEditForm({ ...editForm, college: e.target.value })}
                  placeholder="e.g. University / Department"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-app)',
                    color: 'var(--text-main)',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Short Bio */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Short Bio
                </label>
                <textarea
                  rows={3}
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  placeholder="Briefly describe your algorithmic focus or interests..."
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-app)',
                    color: 'var(--text-main)',
                    fontSize: '14px',
                    outline: 'none',
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Programming Languages */}
              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Preferred Programming Languages (comma separated)
                </label>
                <input
                  type="text"
                  value={editForm.programmingLanguages}
                  onChange={(e) => setEditForm({ ...editForm, programmingLanguages: e.target.value })}
                  placeholder="e.g. Python, C++, Java, TypeScript"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-app)',
                    color: 'var(--text-main)',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {saveSuccess && (
                <div style={{ color: '#10b981', fontSize: '13px', fontWeight: '700', marginBottom: '14px', textAlign: 'center' }}>
                  ✓ Profile updated successfully!
                </div>
              )}

              {/* Modal Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={savingProfile}
                  style={{
                    padding: '9px 18px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-app)',
                    color: 'var(--text-main)',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  style={{
                    padding: '9px 22px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'var(--primary)',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: savingProfile ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)'
                  }}
                >
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContestantProfile;
