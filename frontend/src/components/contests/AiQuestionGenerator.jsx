import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import aiQuestionService from '../../services/aiQuestionService';
import { fetchContests } from '../../store/slices/contestSlice';
import FormattedProblemStatement from '../common/FormattedProblemStatement';

const POPULAR_TOPICS = [
  'Arrays & Hashing',
  'Dynamic Programming',
  'Trees & Graphs',
  'Binary Search',
  'Sliding Window',
  'Two Pointers',
  'Stack & Queue',
  'Greedy',
  'Math'
];

const AiQuestionGenerator = () => {
  const { contestId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: contestsList } = useSelector((state) => state.contests || {});
  const { user } = useSelector((state) => state.auth || {});

  const [selectedContestId, setSelectedContestId] = useState(contestId || '');
  const [topic, setTopic] = useState('Dynamic Programming');
  const [difficultyMode, setDifficultyMode] = useState('MIXED'); // 'MIXED' | 'SINGLE'
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [easyCount, setEasyCount] = useState(2);
  const [mediumCount, setMediumCount] = useState(2);
  const [hardCount, setHardCount] = useState(1);
  const [language, setLanguage] = useState('javascript');

  const [generating, setGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [viewMode, setViewMode] = useState('preview'); // 'preview' | 'edit'
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [modifiedMap, setModifiedMap] = useState({});
  const [showHiddenTestCases, setShowHiddenTestCases] = useState(false);
  const [isSettingsCollapsed, setIsSettingsCollapsed] = useState(false);

  // Distribution sum & validation
  const currentDistributionSum = Number(easyCount) + Number(mediumCount) + Number(hardCount);
  const isDistributionValid = difficultyMode === 'SINGLE' || currentDistributionSum === Number(numberOfQuestions);

  const autoDistributeForTotal = (total) => {
    const n = Number(total);
    if (n === 1) {
      setEasyCount(0); setMediumCount(1); setHardCount(0);
    } else if (n === 2) {
      setEasyCount(1); setMediumCount(1); setHardCount(0);
    } else if (n === 3) {
      setEasyCount(1); setMediumCount(1); setHardCount(1);
    } else if (n === 4) {
      setEasyCount(1); setMediumCount(2); setHardCount(1);
    } else if (n === 5) {
      setEasyCount(2); setMediumCount(2); setHardCount(1);
    }
  };

  const handleTotalQuestionsSelect = (n) => {
    setNumberOfQuestions(n);
    if (difficultyMode === 'MIXED') {
      autoDistributeForTotal(n);
    }
  };

  useEffect(() => {
    dispatch(fetchContests({ page: 0, size: 20 }));
  }, [dispatch]);

  useEffect(() => {
    if (contestId) {
      setSelectedContestId(contestId);
    } else if (contestsList && contestsList.length > 0 && !selectedContestId) {
      setSelectedContestId(contestsList[0].id);
    }
  }, [contestId, contestsList, selectedContestId]);

  const handleGenerate = async (e) => {
    e?.preventDefault();
    if (!isDistributionValid) {
      setErrorMsg(`Difficulty distribution sum (${currentDistributionSum}) must equal total questions (${numberOfQuestions}).`);
      return;
    }
    setErrorMsg('');
    setNotification('');
    setGenerating(true);
    setGeneratedQuestions([]);
    setModifiedMap({});

    try {
      const isMixed = difficultyMode === 'MIXED';
      const payload = {
        contestId: selectedContestId ? Number(selectedContestId) : null,
        topic,
        difficulty: isMixed ? 'MIXED' : difficulty,
        numberOfQuestions: Number(numberOfQuestions),
        easyCount: isMixed ? Number(easyCount) : (difficulty === 'EASY' ? Number(numberOfQuestions) : 0),
        mediumCount: isMixed ? Number(mediumCount) : (difficulty === 'MEDIUM' ? Number(numberOfQuestions) : 0),
        hardCount: isMixed ? Number(hardCount) : (difficulty === 'HARD' ? Number(numberOfQuestions) : 0),
        language
      };

      const results = await aiQuestionService.generateQuestions(payload);
      if (results && results.length > 0) {
        setGeneratedQuestions(results);
        setActiveTab(0);
        setViewMode('preview');
        setIsSettingsCollapsed(true);
        setNotification(`Successfully generated ${results.length} question(s)! Review them below and edit if needed.`);
      } else {
        setErrorMsg('AI did not return questions. Please try adjusting your parameters.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to generate questions. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...generatedQuestions];
    updated[index] = { ...updated[index], [field]: value };
    setGeneratedQuestions(updated);
    setModifiedMap(prev => ({ ...prev, [index]: true }));
  };

  const handleRemoveQuestion = (index) => {
    const updated = generatedQuestions.filter((_, i) => i !== index);
    setGeneratedQuestions(updated);
    const newModified = { ...modifiedMap };
    delete newModified[index];
    setModifiedMap(newModified);
    if (activeTab >= updated.length) {
      setActiveTab(Math.max(0, updated.length - 1));
    }
  };

  const handleSaveToContest = async () => {
    if (!selectedContestId) {
      setErrorMsg('Please select a contest to add these questions to.');
      return;
    }
    if (generatedQuestions.length === 0) {
      setErrorMsg('No questions to save. Please generate questions first.');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    try {
      const resp = await aiQuestionService.addQuestionsToContest(selectedContestId, generatedQuestions);
      setNotification(resp.message || `Successfully added ${generatedQuestions.length} draft question(s) to contest!`);
      setTimeout(() => {
        navigate('/contests');
      }, 2000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to save questions to contest.');
    } finally {
      setSaving(false);
    }
  };

  const currentQ = generatedQuestions[activeTab];

  // Helper to parse sample test cases safely
  let sampleTestCasesParsed = [];
  let isSampleJsonValid = true;
  if (currentQ?.sampleTestCases) {
    if (typeof currentQ.sampleTestCases === 'string') {
      try {
        sampleTestCasesParsed = JSON.parse(currentQ.sampleTestCases);
      } catch (e) {
        sampleTestCasesParsed = [];
        isSampleJsonValid = false;
      }
    } else if (Array.isArray(currentQ.sampleTestCases)) {
      sampleTestCasesParsed = currentQ.sampleTestCases;
    }
  }

  // Helper to parse hidden test cases safely
  let hiddenTestCasesParsed = [];
  let isHiddenJsonValid = true;
  if (currentQ?.hiddenTestCases) {
    if (typeof currentQ.hiddenTestCases === 'string') {
      try {
        hiddenTestCasesParsed = JSON.parse(currentQ.hiddenTestCases);
      } catch (e) {
        hiddenTestCasesParsed = [];
        isHiddenJsonValid = false;
      }
    } else if (Array.isArray(currentQ.hiddenTestCases)) {
      hiddenTestCasesParsed = currentQ.hiddenTestCases;
    }
  }

  const selectedContestObj = contestsList?.find(c => String(c.id) === String(selectedContestId));

  const getDifficultyColor = (diff) => {
    switch (diff?.toUpperCase()) {
      case 'EASY':
        return { text: '#10b981', bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.3)' };
      case 'HARD':
        return { text: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.3)' };
      case 'MEDIUM':
      default:
        return { text: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)' };
    }
  };

  return (
    <div className="ai-studio-container">
      {/* Top Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <Link
            to="/contests"
            style={{
              textDecoration: 'none',
              color: 'var(--primary)',
              fontWeight: '700',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '6px',
              fontSize: '13px'
            }}
          >
            &larr; Back to Contests
          </Link>
          <h1 style={{ margin: 0, fontSize: '26px', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            ✨ AI Question Studio
          </h1>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '14px' }}>
            Generate, inspect, and refine contest questions in a professional competitive programming workspace.
          </p>
        </div>

        {selectedContestObj && (
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '10px',
              padding: '10px 18px',
              textAlign: 'right',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>
              Target Contest
            </div>
            <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-main)', marginTop: '2px' }}>
              {selectedContestObj.title}
            </div>
            <span
              style={{
                fontSize: '11px',
                padding: '2px 8px',
                background: 'rgba(59, 130, 246, 0.15)',
                color: '#3b82f6',
                borderRadius: '4px',
                fontWeight: '700',
                marginTop: '4px',
                display: 'inline-block'
              }}
            >
              Status: {selectedContestObj.status || 'UPCOMING'}
            </span>
          </div>
        )}
      </div>

      {/* Notifications and Error Messages */}
      {notification && (
        <div
          style={{
            padding: '12px 16px',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#10b981',
            borderRadius: '8px',
            marginBottom: '16px',
            fontWeight: '600',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>✅</span>
            <span>{notification}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification('')}
            style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', fontWeight: '700' }}
          >
            ✕
          </button>
        </div>
      )}

      {errorMsg && (
        <div
          style={{
            padding: '12px 16px',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444',
            borderRadius: '8px',
            marginBottom: '16px',
            fontWeight: '600',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg('')}
            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: '700' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Two-Column Professional Workspace */}
      <div className="ai-studio-workspace">
        {/* Left Sidebar: Generation Settings & Questions Navigator */}
        <div className="ai-studio-sidebar">
          {/* Generation Settings Card */}
          <div
            className="glass-card"
            style={{
              padding: '18px 20px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: isSettingsCollapsed ? '0' : '16px'
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: '15px',
                  fontWeight: '700',
                  color: 'var(--text-main)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>⚙️</span> Generation Settings
              </h3>
              {generatedQuestions.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsSettingsCollapsed(!isSettingsCollapsed)}
                  style={{
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    padding: '3px 8px',
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  {isSettingsCollapsed ? '▼ Expand' : '▲ Collapse'}
                </button>
              )}
            </div>

            {(!isSettingsCollapsed || generatedQuestions.length === 0) && (
              <form onSubmit={handleGenerate}>
                {/* Contest Selection */}
                <div style={{ marginBottom: '14px' }}>
                  <label className="ai-field-label">Target Contest</label>
                  <select
                    value={selectedContestId}
                    onChange={(e) => setSelectedContestId(e.target.value)}
                    className="codec-input"
                    style={{ fontSize: '13px', padding: '8px 10px' }}
                  >
                    {contestsList && contestsList.length > 0 ? (
                      contestsList.map(c => (
                        <option key={c.id} value={c.id}>
                          #{c.id} - {c.title} ({c.status || 'UPCOMING'})
                        </option>
                      ))
                    ) : (
                      <option value="">No contests found</option>
                    )}
                  </select>
                </div>

                {/* Topic Input & Quick Tags */}
                <div style={{ marginBottom: '14px' }}>
                  <label className="ai-field-label">Algorithmic Topic</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Dynamic Programming, Trees"
                    required
                    className="codec-input"
                    style={{ fontSize: '13px', padding: '8px 10px', marginBottom: '8px' }}
                  />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {POPULAR_TOPICS.map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTopic(t)}
                        style={{
                          fontSize: '11px',
                          padding: '2px 7px',
                          borderRadius: '12px',
                          border: '1px solid var(--border-subtle)',
                          background: topic === t ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-app)',
                          color: topic === t ? 'var(--primary)' : 'var(--text-muted)',
                          fontWeight: topic === t ? '700' : 'normal',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Number of Questions (Total) */}
                <div style={{ marginBottom: '14px' }}>
                  <label className="ai-field-label">Total Number of Questions</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {[1, 2, 3, 4, 5].map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => handleTotalQuestionsSelect(n)}
                        style={{
                          flex: 1,
                          padding: '6px 0',
                          fontSize: '12px',
                          fontWeight: '700',
                          borderRadius: '6px',
                          border: numberOfQuestions === n ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                          background: numberOfQuestions === n ? 'var(--primary)' : 'var(--bg-app)',
                          color: numberOfQuestions === n ? '#ffffff' : 'var(--text-muted)',
                          cursor: 'pointer'
                        }}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulty Mode & Controls */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label className="ai-field-label" style={{ margin: 0 }}>Difficulty Configuration</label>
                    {difficultyMode === 'MIXED' && (
                      <button
                        type="button"
                        onClick={() => autoDistributeForTotal(numberOfQuestions)}
                        title="Evenly auto-distribute across Easy, Medium, and Hard"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--primary)',
                          fontSize: '11px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          padding: 0
                        }}
                      >
                        ⚡ Auto-Balance
                      </button>
                    )}
                  </div>

                  {/* Mode Segmented Switch */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setDifficultyMode('MIXED')}
                      style={{
                        padding: '6px 8px',
                        fontSize: '12px',
                        fontWeight: '700',
                        borderRadius: '6px',
                        border: difficultyMode === 'MIXED' ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                        background: difficultyMode === 'MIXED' ? 'var(--primary-subtle)' : 'var(--bg-app)',
                        color: difficultyMode === 'MIXED' ? 'var(--primary)' : 'var(--text-muted)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      🎯 Mixed Distribution
                    </button>
                    <button
                      type="button"
                      onClick={() => setDifficultyMode('SINGLE')}
                      style={{
                        padding: '6px 8px',
                        fontSize: '12px',
                        fontWeight: '700',
                        borderRadius: '6px',
                        border: difficultyMode === 'SINGLE' ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                        background: difficultyMode === 'SINGLE' ? 'var(--primary-subtle)' : 'var(--bg-app)',
                        color: difficultyMode === 'SINGLE' ? 'var(--primary)' : 'var(--text-muted)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      ⚖️ Single Level
                    </button>
                  </div>

                  {difficultyMode === 'MIXED' ? (
                    /* ================= MIXED DISTRIBUTION CONTROLS ================= */
                    <div style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '12px' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px', fontWeight: '600' }}>
                        Select quantities for each level (must sum to {numberOfQuestions}):
                      </div>

                      {/* Easy Stepper */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 6px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                            Easy
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>(100 pts)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => setEasyCount(Math.max(0, easyCount - 1))}
                            style={{ width: '26px', height: '26px', borderRadius: '6px', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', color: 'var(--text-main)', fontWeight: '700', cursor: 'pointer' }}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="0"
                            max={numberOfQuestions}
                            value={easyCount}
                            onChange={(e) => setEasyCount(Math.max(0, parseInt(e.target.value) || 0))}
                            style={{ width: '38px', textAlign: 'center', padding: '3px 4px', border: '1px solid var(--border-subtle)', borderRadius: '6px', background: 'var(--bg-surface)', color: 'var(--text-main)', fontSize: '13px', fontWeight: '700' }}
                          />
                          <button
                            type="button"
                            onClick={() => setEasyCount(easyCount + 1)}
                            style={{ width: '26px', height: '26px', borderRadius: '6px', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', color: 'var(--text-main)', fontWeight: '700', cursor: 'pointer' }}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Medium Stepper */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 6px', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                            Medium
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>(200 pts)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => setMediumCount(Math.max(0, mediumCount - 1))}
                            style={{ width: '26px', height: '26px', borderRadius: '6px', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', color: 'var(--text-main)', fontWeight: '700', cursor: 'pointer' }}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="0"
                            max={numberOfQuestions}
                            value={mediumCount}
                            onChange={(e) => setMediumCount(Math.max(0, parseInt(e.target.value) || 0))}
                            style={{ width: '38px', textAlign: 'center', padding: '3px 4px', border: '1px solid var(--border-subtle)', borderRadius: '6px', background: 'var(--bg-surface)', color: 'var(--text-main)', fontSize: '13px', fontWeight: '700' }}
                          />
                          <button
                            type="button"
                            onClick={() => setMediumCount(mediumCount + 1)}
                            style={{ width: '26px', height: '26px', borderRadius: '6px', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', color: 'var(--text-main)', fontWeight: '700', cursor: 'pointer' }}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Hard Stepper */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 6px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                            Hard
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>(300 pts)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => setHardCount(Math.max(0, hardCount - 1))}
                            style={{ width: '26px', height: '26px', borderRadius: '6px', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', color: 'var(--text-main)', fontWeight: '700', cursor: 'pointer' }}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="0"
                            max={numberOfQuestions}
                            value={hardCount}
                            onChange={(e) => setHardCount(Math.max(0, parseInt(e.target.value) || 0))}
                            style={{ width: '38px', textAlign: 'center', padding: '3px 4px', border: '1px solid var(--border-subtle)', borderRadius: '6px', background: 'var(--bg-surface)', color: 'var(--text-main)', fontSize: '13px', fontWeight: '700' }}
                          />
                          <button
                            type="button"
                            onClick={() => setHardCount(hardCount + 1)}
                            style={{ width: '26px', height: '26px', borderRadius: '6px', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', color: 'var(--text-main)', fontWeight: '700', cursor: 'pointer' }}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Live Counter Display Banner */}
                      {isDistributionValid ? (
                        <div style={{ padding: '8px 10px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981', fontSize: '12px', fontWeight: '700', textAlign: 'center' }}>
                          ✨ {easyCount} Easy + {mediumCount} Medium + {hardCount} Hard = {numberOfQuestions} Questions
                        </div>
                      ) : (
                        <div style={{ padding: '8px 10px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', fontSize: '11px', fontWeight: '700', textAlign: 'center' }}>
                          <div>⚠️ {easyCount} Easy + {mediumCount} Medium + {hardCount} Hard = {currentDistributionSum} / {numberOfQuestions} Questions</div>
                          <div style={{ fontSize: '10px', fontWeight: '500', marginTop: '2px', color: 'var(--text-muted)' }}>
                            {currentDistributionSum < numberOfQuestions
                              ? `Need ${numberOfQuestions - currentDistributionSum} more to match total`
                              : `Need ${currentDistributionSum - numberOfQuestions} less to match total`}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* ================= SINGLE LEVEL CONTROLS ================= */
                    <div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginBottom: '8px' }}>
                        {['EASY', 'MEDIUM', 'HARD'].map(d => {
                          const colors = getDifficultyColor(d);
                          const isSelected = difficulty === d;
                          return (
                            <button
                              key={d}
                              type="button"
                              onClick={() => setDifficulty(d)}
                              style={{
                                padding: '6px 4px',
                                fontSize: '12px',
                                fontWeight: '700',
                                borderRadius: '6px',
                                border: isSelected ? `2px solid ${colors.text}` : '1px solid var(--border-subtle)',
                                background: isSelected ? colors.bg : 'var(--bg-app)',
                                color: isSelected ? colors.text : 'var(--text-muted)',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              {d}
                            </button>
                          );
                        })}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>
                        All {numberOfQuestions} questions will be generated at <strong>{difficulty}</strong> difficulty.
                      </div>
                    </div>
                  )}
                </div>

                {/* Programming Language */}
                <div style={{ marginBottom: '18px' }}>
                  <label className="ai-field-label">Target Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="codec-input"
                    style={{ fontSize: '13px', padding: '8px 10px' }}
                  >
                    <option value="javascript">JavaScript (Node.js)</option>
                    <option value="python">Python 3</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                  </select>
                </div>

                {/* Generate Button */}
                <button
                  type="submit"
                  disabled={generating || !isDistributionValid}
                  style={{
                    width: '100%',
                    padding: '11px',
                    background: generating || !isDistributionValid ? 'var(--text-muted)' : 'linear-gradient(135deg, #2563eb, #6366f1)',
                    color: '#ffffff',
                    fontWeight: '700',
                    fontSize: '14px',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: generating || !isDistributionValid ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: isDistributionValid ? '0 4px 12px rgba(37, 99, 235, 0.25)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {generating
                    ? '⏳ Generating Questions...'
                    : !isDistributionValid
                    ? `⚠️ Total Must Equal ${numberOfQuestions} (${currentDistributionSum}/${numberOfQuestions})`
                    : generatedQuestions.length > 0
                    ? '✨ Re-generate Questions'
                    : '✨ Generate with AI'}
                </button>
              </form>
            )}
          </div>

          {/* Question Navigation List (Visible when questions generated) */}
          {generatedQuestions.length > 0 && (
            <div
              className="glass-card"
              style={{
                padding: '18px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>📋</span> Questions ({generatedQuestions.length})
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>
                  Select to review
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {generatedQuestions.map((q, idx) => {
                  const colors = getDifficultyColor(q.difficulty);
                  const isActive = activeTab === idx;
                  const isModified = !!modifiedMap[idx];

                  return (
                    <div
                      key={idx}
                      onClick={() => setActiveTab(idx)}
                      className={`ai-question-card ${isActive ? 'active' : ''}`}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: '800',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              background: isActive ? 'var(--primary)' : 'var(--bg-surface-elevated)',
                              color: isActive ? '#ffffff' : 'var(--text-muted)'
                            }}
                          >
                            Q{idx + 1}
                          </span>
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: '700',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              background: colors.bg,
                              color: colors.text,
                              border: `1px solid ${colors.border}`
                            }}
                          >
                            {q.difficulty || 'MEDIUM'}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {isModified && (
                            <span style={{ fontSize: '10px', color: '#f59e0b', fontWeight: '700' }}>
                              ● Modified
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveQuestion(idx);
                            }}
                            title="Discard this question"
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--text-muted)',
                              cursor: 'pointer',
                              padding: '0 2px',
                              fontSize: '12px'
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      </div>

                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: '700',
                          color: isActive ? 'var(--primary)' : 'var(--text-main)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          marginBottom: '4px'
                        }}
                      >
                        {q.title || `Untitled Question ${idx + 1}`}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                        <span>⭐ {q.basePoints || 100} pts</span>
                        <span>{q.timeLimitMs || 2000} ms</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Batch Action in Sidebar */}
              <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
                <button
                  type="button"
                  onClick={handleSaveToContest}
                  disabled={saving || generatedQuestions.length === 0}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    fontSize: '13px',
                    color: '#ffffff',
                    background: saving ? 'var(--text-muted)' : '#10b981',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)'
                  }}
                >
                  {saving ? 'Saving...' : `💾 Save All (${generatedQuestions.length}) to Contest`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Workspace: Question Preview & Editor */}
        <div style={{ minWidth: 0 }}>
          {generatedQuestions.length > 0 && currentQ ? (
            <div
              className="glass-card"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-sm)',
                overflow: 'hidden'
              }}
            >
              {/* Sticky Top Header Action Bar */}
              <div className="ai-sticky-header">
                {/* Left: Question title & badges */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      padding: '3px 8px',
                      background: 'var(--primary)',
                      color: '#ffffff',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '800'
                    }}
                  >
                    Question {activeTab + 1} of {generatedQuestions.length}
                  </span>

                  {(() => {
                    const colors = getDifficultyColor(currentQ.difficulty);
                    return (
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: '700',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: colors.bg,
                          color: colors.text,
                          border: `1px solid ${colors.border}`
                        }}
                      >
                        {currentQ.difficulty || 'MEDIUM'}
                      </span>
                    );
                  })()}

                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: 'rgba(245, 158, 11, 0.12)',
                      color: '#f59e0b',
                      border: '1px solid rgba(245, 158, 11, 0.3)'
                    }}
                  >
                    DRAFT
                  </span>

                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>
                    ⭐ {currentQ.basePoints || 100} Points
                  </span>
                </div>

                {/* Center: Mode Switcher (Preview vs Edit) */}
                <div className="ai-mode-toggle">
                  <button
                    type="button"
                    onClick={() => setViewMode('preview')}
                    className={`ai-mode-btn ${viewMode === 'preview' ? 'active' : ''}`}
                  >
                    <span>👁️</span> Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('edit')}
                    className={`ai-mode-btn ${viewMode === 'edit' ? 'active' : ''}`}
                  >
                    <span>✏️</span> Edit
                  </button>
                </div>

                {/* Right: Quick actions */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(activeTab)}
                    style={{
                      padding: '7px 12px',
                      fontSize: '12px',
                      color: '#ef4444',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span>🗑️</span> Discard
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveToContest}
                    disabled={saving}
                    style={{
                      padding: '7px 16px',
                      fontSize: '13px',
                      color: '#ffffff',
                      background: saving ? 'var(--text-muted)' : '#10b981',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: saving ? 'not-allowed' : 'pointer',
                      fontWeight: '700',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)'
                    }}
                  >
                    {saving ? 'Saving...' : '💾 Save Drafts'}
                  </button>
                </div>
              </div>

              {/* Mode-Specific Content Area */}
              <div style={{ padding: '24px' }}>
                {viewMode === 'preview' ? (
                  /* ============================================================
                     PREVIEW MODE: Clean LeetCode/HackerRank Problem Presentation
                     ============================================================ */
                  <div>
                    {/* Informative Preview Banner */}
                    <div
                      style={{
                        padding: '10px 14px',
                        background: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '8px',
                        fontSize: '13px',
                        color: 'var(--text-secondary)',
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>💡</span>
                        <span>
                          <strong>Contestant View:</strong> This is exactly how this question will be formatted and presented during the contest.
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setViewMode('edit')}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--primary)',
                          fontWeight: '700',
                          fontSize: '12px',
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
                      >
                        Edit this problem &rarr;
                      </button>
                    </div>

                    {/* Standard Problem Statement Renderer */}
                    <FormattedProblemStatement
                      problem={{
                        title: currentQ.title,
                        difficulty: currentQ.difficulty,
                        basePoints: currentQ.basePoints,
                        description: currentQ.description,
                        inputFormat: currentQ.inputFormat,
                        outputFormat: currentQ.outputFormat,
                        constraints: currentQ.constraints,
                        sampleTestCases: sampleTestCasesParsed
                      }}
                    />

                    {/* Collapsible Hidden Evaluation Test Cases Inspector */}
                    <div
                      style={{
                        marginTop: '28px',
                        padding: '16px 18px',
                        background: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '10px'
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          cursor: 'pointer'
                        }}
                        onClick={() => setShowHiddenTestCases(!showHiddenTestCases)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '16px' }}>🔒</span>
                          <div>
                            <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>
                              Hidden Evaluation Test Cases
                            </span>
                            <span
                              style={{
                                marginLeft: '8px',
                                fontSize: '11px',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                background: 'rgba(59, 130, 246, 0.15)',
                                color: '#3b82f6',
                                fontWeight: '700'
                              }}
                            >
                              {hiddenTestCasesParsed.length} Test Cases Configured
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--primary)',
                            fontWeight: '700',
                            fontSize: '13px',
                            cursor: 'pointer'
                          }}
                        >
                          {showHiddenTestCases ? '▲ Hide Details' : '▼ Inspect Hidden Cases'}
                        </button>
                      </div>

                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Used by the judging engine to evaluate submissions and verify edge cases. Hidden from contestants.
                      </div>

                      {showHiddenTestCases && (
                        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {hiddenTestCasesParsed.length > 0 ? (
                            hiddenTestCasesParsed.map((tc, idx) => (
                              <div
                                key={idx}
                                style={{
                                  background: 'var(--bg-surface)',
                                  border: '1px solid var(--border-subtle)',
                                  borderRadius: '8px',
                                  padding: '12px 14px',
                                  fontSize: '13px'
                                }}
                              >
                                <div style={{ fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px', fontSize: '12px' }}>
                                  Hidden Test Case #{idx + 1}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                  <div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '2px' }}>Input:</div>
                                    <pre style={{ margin: 0, padding: '6px 8px', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: '4px', fontFamily: 'monospace', fontSize: '12px', overflowX: 'auto' }}>
                                      {typeof tc.input === 'object' ? JSON.stringify(tc.input) : tc.input}
                                    </pre>
                                  </div>
                                  <div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '2px' }}>Expected Output:</div>
                                    <pre style={{ margin: 0, padding: '6px 8px', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: '4px', fontFamily: 'monospace', fontSize: '12px', overflowX: 'auto' }}>
                                      {typeof tc.expectedOutput === 'object' ? JSON.stringify(tc.expectedOutput) : tc.expectedOutput}
                                    </pre>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div style={{ fontSize: '13px', color: 'var(--text-muted)', padding: '8px' }}>
                              No hidden test cases formatted. Switch to <strong>Edit</strong> mode to configure them.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* ============================================================
                     EDIT MODE: Structured, Clean Input Sections with Hints
                     ============================================================ */
                  <div>
                    {/* Notice */}
                    <div
                      style={{
                        padding: '10px 14px',
                        background: 'rgba(59, 130, 246, 0.1)',
                        border: '1px solid rgba(59, 130, 246, 0.25)',
                        borderRadius: '8px',
                        fontSize: '13px',
                        color: 'var(--text-main)',
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>✏️</span>
                        <span>
                          <strong>Editor Mode:</strong> Modify details, refine instructions, or customize test cases. Click <strong>Preview</strong> at any time to verify rendering.
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setViewMode('preview')}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--primary)',
                          fontWeight: '700',
                          fontSize: '12px',
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
                      >
                        Preview problem &rarr;
                      </button>
                    </div>

                    {/* Section 1: Basic Parameters */}
                    <div className="ai-editor-section">
                      <div className="ai-section-title">
                        <span>🏷️</span> Basic Details
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '14px' }}>
                        <div>
                          <label className="ai-field-label">Problem Title</label>
                          <input
                            type="text"
                            value={currentQ.title || ''}
                            onChange={(e) => handleQuestionChange(activeTab, 'title', e.target.value)}
                            className="codec-input"
                            style={{ fontWeight: '700', fontSize: '14px' }}
                            placeholder="e.g. Longest Substring Without Repeating Characters"
                          />
                        </div>

                        <div>
                          <label className="ai-field-label">Difficulty</label>
                          <select
                            value={currentQ.difficulty || 'MEDIUM'}
                            onChange={(e) => handleQuestionChange(activeTab, 'difficulty', e.target.value)}
                            className="codec-input"
                          >
                            <option value="EASY">EASY</option>
                            <option value="MEDIUM">MEDIUM</option>
                            <option value="HARD">HARD</option>
                          </select>
                        </div>

                        <div>
                          <label className="ai-field-label">Base Points</label>
                          <input
                            type="number"
                            min="10"
                            max="1000"
                            step="10"
                            value={currentQ.basePoints || 100}
                            onChange={(e) => handleQuestionChange(activeTab, 'basePoints', Number(e.target.value))}
                            className="codec-input"
                          />
                        </div>

                        <div>
                          <label className="ai-field-label">Time Limit (ms)</label>
                          <input
                            type="number"
                            min="500"
                            max="10000"
                            step="500"
                            value={currentQ.timeLimitMs || 2000}
                            onChange={(e) => handleQuestionChange(activeTab, 'timeLimitMs', Number(e.target.value))}
                            className="codec-input"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Problem Description */}
                    <div className="ai-editor-section">
                      <div className="ai-section-title">
                        <span>📝</span> Problem Description
                      </div>
                      <p className="ai-field-hint" style={{ margin: '0 0 8px 0' }}>
                        Supports Markdown formatting, paragraphs, bullet points (<code>- </code>), and inline code (<code>`code`</code>).
                      </p>
                      <textarea
                        rows={7}
                        value={currentQ.description || ''}
                        onChange={(e) => handleQuestionChange(activeTab, 'description', e.target.value)}
                        className="codec-input"
                        style={{
                          lineHeight: '1.6',
                          fontSize: '14px',
                          fontFamily: 'inherit',
                          resize: 'vertical'
                        }}
                        placeholder="Describe the algorithmic challenge, background story, and requirements..."
                      />
                    </div>

                    {/* Section 3: Input & Output Formats */}
                    <div className="ai-editor-section">
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                          <div className="ai-section-title">
                            <span>📥</span> Input Format
                          </div>
                          <textarea
                            rows={3}
                            value={currentQ.inputFormat || ''}
                            onChange={(e) => handleQuestionChange(activeTab, 'inputFormat', e.target.value)}
                            className="codec-input"
                            style={{ fontSize: '13px', lineHeight: '1.5', resize: 'vertical' }}
                            placeholder="e.g. The first line contains an integer n. The second line contains n space-separated integers."
                          />
                        </div>

                        <div>
                          <div className="ai-section-title">
                            <span>📤</span> Output Format
                          </div>
                          <textarea
                            rows={3}
                            value={currentQ.outputFormat || ''}
                            onChange={(e) => handleQuestionChange(activeTab, 'outputFormat', e.target.value)}
                            className="codec-input"
                            style={{ fontSize: '13px', lineHeight: '1.5', resize: 'vertical' }}
                            placeholder="e.g. Return the maximum subarray sum."
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 4: Constraints */}
                    <div className="ai-editor-section">
                      <div className="ai-section-title">
                        <span>⚙️</span> Constraints
                      </div>
                      <p className="ai-field-hint" style={{ margin: '0 0 8px 0' }}>
                        Enter one constraint per line (e.g. <code>1 &lt;= nums.length &lt;= 10^5</code>). Each line renders as a clean chip in Preview mode.
                      </p>
                      <textarea
                        rows={3}
                        value={currentQ.constraints || ''}
                        onChange={(e) => handleQuestionChange(activeTab, 'constraints', e.target.value)}
                        className="codec-input"
                        style={{ fontFamily: 'monospace', fontSize: '13px', resize: 'vertical' }}
                        placeholder="1 <= n <= 10^5&#10;-10^4 <= nums[i] <= 10^4"
                      />
                    </div>

                    {/* Section 5: Sample Test Cases */}
                    <div className="ai-editor-section">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div className="ai-section-title" style={{ margin: 0 }}>
                          <span>🧪</span> Sample Test Cases (JSON Array)
                        </div>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: '700',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: isSampleJsonValid ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                            color: isSampleJsonValid ? '#10b981' : '#ef4444'
                          }}
                        >
                          {isSampleJsonValid ? `✅ Valid JSON (${sampleTestCasesParsed.length} examples)` : '⚠️ Invalid JSON'}
                        </span>
                      </div>
                      <p className="ai-field-hint" style={{ margin: '0 0 8px 0' }}>
                        JSON array of objects containing <code>input</code>, <code>expectedOutput</code>, and optional <code>explanation</code>.
                      </p>
                      <textarea
                        rows={5}
                        value={currentQ.sampleTestCases || ''}
                        onChange={(e) => handleQuestionChange(activeTab, 'sampleTestCases', e.target.value)}
                        className="codec-input"
                        style={{ fontFamily: 'monospace', fontSize: '12px', resize: 'vertical' }}
                      />
                    </div>

                    {/* Section 6: Hidden Test Cases */}
                    <div className="ai-editor-section">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div className="ai-section-title" style={{ margin: 0 }}>
                          <span>🔒</span> Hidden Evaluation Test Cases (JSON Array)
                        </div>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: '700',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: isHiddenJsonValid ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                            color: isHiddenJsonValid ? '#10b981' : '#ef4444'
                          }}
                        >
                          {isHiddenJsonValid ? `✅ Valid JSON (${hiddenTestCasesParsed.length} hidden cases)` : '⚠️ Invalid JSON'}
                        </span>
                      </div>
                      <p className="ai-field-hint" style={{ margin: '0 0 8px 0' }}>
                        Used by the backend testing engine to grade submissions. JSON array of <code>input</code> and <code>expectedOutput</code> objects.
                      </p>
                      <textarea
                        rows={5}
                        value={currentQ.hiddenTestCases || ''}
                        onChange={(e) => handleQuestionChange(activeTab, 'hiddenTestCases', e.target.value)}
                        className="codec-input"
                        style={{ fontFamily: 'monospace', fontSize: '12px', resize: 'vertical' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ============================================================
               EMPTY STATE: Clean Developer Studio Workspace Intro
               ============================================================ */
            !generating && (
              <div
                className="glass-card"
                style={{
                  background: 'var(--bg-surface)',
                  border: '2px dashed var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '50px 30px',
                  textAlign: 'center',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ fontSize: '48px', marginBottom: '14px' }}>✨</div>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '22px', fontWeight: '800', color: 'var(--text-main)' }}>
                  AI Question Workspace Ready
                </h2>
                <p style={{ margin: '0 auto 24px auto', fontSize: '14px', color: 'var(--text-muted)', maxWidth: '520px', lineHeight: '1.6' }}>
                  Select your target contest and algorithmic parameters on the left, then click <strong>"Generate with AI"</strong>.
                  Synthesized questions will appear here with professional LeetCode-style preview and full markdown editing.
                </p>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px',
                    maxWidth: '680px',
                    margin: '0 auto',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ padding: '14px', background: 'var(--bg-app)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '18px', marginBottom: '4px' }}>🎯</div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>Targeted Topics</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Pick from DP, Trees, Two Pointers, or enter custom topics.
                    </div>
                  </div>

                  <div style={{ padding: '14px', background: 'var(--bg-app)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '18px', marginBottom: '4px' }}>👁️</div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>LeetCode Preview</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Review parsed statements, constraints chips, and formatted examples.
                    </div>
                  </div>

                  <div style={{ padding: '14px', background: 'var(--bg-app)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '18px', marginBottom: '4px' }}>🔒</div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>Draft Quality Control</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Edit and inspect hidden evaluation test cases before saving as drafts.
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default AiQuestionGenerator;
