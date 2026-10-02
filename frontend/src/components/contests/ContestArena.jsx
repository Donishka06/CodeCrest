import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import contestService from '../../services/contestService';
import aiQuestionService from '../../services/aiQuestionService';
import aiDoubtService from '../../services/aiDoubtService';
import challengeService from '../../services/challengeService';
import api from '../../services/api';
import FormattedProblemStatement from '../common/FormattedProblemStatement';

const ContestArena = () => {
  const { contestId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth || {});
  const currentUsername = user?.username || 'contestant';

  const [contest, setContest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Code editor & execution state
  const [language, setLanguage] = useState('javascript');
  const [sourceCode, setSourceCode] = useState('');
  const [executing, setExecuting] = useState(false);
  const [execMode, setExecMode] = useState(''); // 'run' or 'submit'
  const [verdictResult, setVerdictResult] = useState(null);
  const [solvedIds, setSolvedIds] = useState(new Set());
  const [contestScore, setContestScore] = useState(0);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Countdown timer state
  const [timeRemaining, setTimeRemaining] = useState({ hours: 0, minutes: 0, seconds: 0, isExpired: false, isUpcoming: false });
  const [countdownText, setCountdownText] = useState('');

  // AI Doubt Assistant state
  const [isDoubtOpen, setIsDoubtOpen] = useState(false);
  const [doubtMessages, setDoubtMessages] = useState([
    {
      sender: 'ai',
      text: "👋 Hi! I'm your CodeCrest Contest Doubt Assistant. I'm here to give you hints, conceptual explanations, or help debug errors.\n\n*(Note: To uphold contest integrity, I will never provide direct code or full solutions.)*",
      type: 'WELCOME'
    }
  ]);
  const [doubtInput, setDoubtInput] = useState('');
  const [doubtLoading, setDoubtLoading] = useState(false);
  const doubtEndRef = useRef(null);

  // Fetch contest details & questions
  useEffect(() => {
    const initArena = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const contestData = await contestService.getById(contestId);
        setContest(contestData);

        // Fetch questions for this contest
        let qList = await aiQuestionService.getContestQuestions(contestId);
        if (!qList || qList.length === 0) {
          // Fallback to standard challenges if none linked yet
          const res = await challengeService.getChallenges(0, 10);
          qList = res?.content || [];
        }
        setQuestions(qList);

        // Fetch contestant's score in this contest
        const scoreData = await contestService.getMyScore(contestId, currentUsername);
        if (scoreData) {
          setContestScore(scoreData.score || 0);
        }

        // Fetch solved challenges for current contestant
        try {
          const solvedRes = await api.get('/submissions/my-solved-ids');
          if (Array.isArray(solvedRes.data)) {
            setSolvedIds(new Set(solvedRes.data));
          }
        } catch (e) {}

        if (qList && qList.length > 0) {
          setSourceCode(getStarterTemplate(qList[0]?.title, 'javascript'));
        }
      } catch (err) {
        setErrorMsg(err.response?.data?.message || err.message || 'Failed to load contest arena.');
      } finally {
        setLoading(false);
      }
    };

    initArena();
  }, [contestId, currentUsername]);

  // Real-time Countdown Timer Ticker
  useEffect(() => {
    if (!contest?.startTime || !contest?.endTime) return;

    const updateTimer = () => {
      const now = Date.now();
      const startTimeMs = new Date(contest.startTime).getTime();
      const endTimeMs = new Date(contest.endTime).getTime();

      if (now < startTimeMs) {
        // Upcoming
        const diff = Math.max(0, startTimeMs - now);
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeRemaining({ hours, minutes, seconds, isExpired: false, isUpcoming: true });
        setCountdownText(`Starts in ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
      } else if (now >= endTimeMs) {
        // Expired
        setTimeRemaining({ hours: 0, minutes: 0, seconds: 0, isExpired: true, isUpcoming: false });
        setCountdownText('Contest Expired');
      } else {
        // Active
        const diff = Math.max(0, endTimeMs - now);
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeRemaining({ hours, minutes, seconds, isExpired: false, isUpcoming: false });
        setCountdownText(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [contest]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (isDoubtOpen && doubtEndRef.current) {
      doubtEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [doubtMessages, isDoubtOpen]);

  const pad = (n) => String(n).padStart(2, '0');

  const getStarterTemplate = (title = '', lang = 'javascript') => {
    const t = String(title).toLowerCase();
    const isTwoSum = t.includes('two sum') || t.includes('twosum');
    const isReverse = t.includes('algorithm') || t.includes('reverse');
    const isPalindrome = t.includes('palindrome');
    const isCoin = t.includes('coin');
    const isAnagram = t.includes('anagram');
    const isWater = t.includes('water');

    switch (lang) {
      case 'python':
        if (isTwoSum) return `# @param nums: List[int]\n# @param target: int\n# @return List[int]\ndef twoSum(nums, target):\n    # Write your solution here\n    pass\n`;
        if (isCoin) return `# @param coins: List[int]\n# @param amount: int\n# @return int\ndef coinChange(coins, amount):\n    # Write your solution here\n    pass\n`;
        if (isReverse) return `# @param s: str\n# @return str\ndef reverseString(s):\n    # Write your solution here\n    pass\n`;
        if (isPalindrome) return `# @param x: int\n# @return bool\ndef isPalindrome(x):\n    # Write your solution here\n    pass\n`;
        if (isAnagram) return `# @param strs: List[str]\n# @return List[List[str]]\ndef groupAnagrams(strs):\n    # Write your solution here\n    pass\n`;
        if (isWater) return `# @param height: List[int]\n# @return int\ndef maxArea(height):\n    # Write your solution here\n    pass\n`;
        return `# @param input_data: any\n# @return any\ndef solve(input_data):\n    # Write your solution here\n    pass\n`;

      case 'typescript':
        if (isTwoSum) return `/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nfunction twoSum(nums: number[], target: number): number[] {\n  // Write your solution here\n  return [];\n}\n`;
        if (isReverse) return `function reverseString(s: string): string {\n  // Write your solution here\n  return "";\n}\n`;
        if (isPalindrome) return `function isPalindrome(x: number): boolean {\n  // Write your solution here\n  return false;\n}\n`;
        return `function solve(input: any): any {\n  // Write your solution here\n  \n}\n`;

      case 'java':
        if (isTwoSum) return `import java.util.*;\n\nclass Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your solution here\n        return new int[]{};\n    }\n}\n`;
        if (isReverse) return `class Solution {\n    public String reverseString(String s) {\n        // Write your solution here\n        return "";\n    }\n}\n`;
        if (isPalindrome) return `class Solution {\n    public boolean isPalindrome(int x) {\n        // Write your solution here\n        return false;\n    }\n}\n`;
        return `class Solution {\n    public Object solve(Object input) {\n        // Write your solution here\n        return null;\n    }\n}\n`;

      case 'cpp':
        if (isTwoSum) return `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your solution here\n        return {};\n    }\n};\n`;
        return `#include <iostream>\nusing namespace std;\n\nclass Solution {\npublic:\n    void solve() {\n        // Write your solution here\n    }\n};\n`;

      case 'c':
        if (isTwoSum) return `#include <stdio.h>\n#include <stdlib.h>\n\nint* twoSum(int* nums, int numsSize, int target, int* returnSize) {\n    // Write your solution here\n    *returnSize = 0;\n    return NULL;\n}\n`;
        return `#include <stdio.h>\n\nvoid solve() {\n    // Write your solution here\n}\n`;

      case 'sql':
        return `-- Write your SQL query statement below\nSELECT * FROM solution_table;\n`;

      case 'r':
        return `# Write your R solution here\ntwoSum <- function(nums, target) {\n  \n}\n`;

      case 'javascript':
      default:
        if (isTwoSum) return `/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nfunction twoSum(nums, target) {\n  // Write your solution here\n  \n}\n`;
        if (isCoin) return `/**\n * @param {number[]} coins\n * @param {number} amount\n * @return {number}\n */\nfunction coinChange(coins, amount) {\n  // Write your solution here\n  \n}\n`;
        if (isReverse) return `/**\n * @param {string} s\n * @return {string}\n */\nfunction reverseString(s) {\n  // Write your solution here\n  \n}\n`;
        if (isPalindrome) return `/**\n * @param {number} x\n * @return {boolean}\n */\nfunction isPalindrome(x) {\n  // Write your solution here\n  \n}\n`;
        if (isAnagram) return `/**\n * @param {string[]} strs\n * @return {string[][]}\n */\nfunction groupAnagrams(strs) {\n  // Write your solution here\n  \n}\n`;
        if (isWater) return `/**\n * @param {number[]} height\n * @return {number}\n */\nfunction maxArea(height) {\n  // Write your solution here\n  \n}\n`;
        return `/**\n * @param {any} input\n * @return {any}\n */\nfunction solve(input) {\n  // Write your solution here\n  \n}\n`;
    }
  };

  const handleSelectQuestion = (index) => {
    setActiveQuestionIndex(index);
    setVerdictResult(null);
    const q = questions[index];
    setSourceCode(getStarterTemplate(q?.title, language));
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    const q = questions[activeQuestionIndex];
    setSourceCode(getStarterTemplate(q?.title, newLang));
  };

  const handleResetCode = () => {
    const q = questions[activeQuestionIndex];
    setSourceCode(getStarterTemplate(q?.title, language));
    setVerdictResult(null);
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 2500);
  };

  const handleEditorKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const val = e.target.value;
      setSourceCode(val.substring(0, start) + '  ' + val.substring(end));
      setTimeout(() => {
        if (e.target) {
          e.target.selectionStart = e.target.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  // Execution handler: Run Code or Submit Solution
  const handleExecuteCode = async (isTestRun) => {
    const currentQ = questions[activeQuestionIndex];
    if (!currentQ) return;

    if (timeRemaining.isExpired) {
      alert('This contest has expired. Submissions are no longer accepted.');
      return;
    }

    setExecuting(true);
    setExecMode(isTestRun ? 'run' : 'submit');
    setVerdictResult(null);

    try {
      const payload = {
        challengeId: currentQ.id,
        contestId: Number(contestId),
        sourceCode,
        language,
        isTestRun
      };

      const response = await api.post(`/challenges/${currentQ.id}/submit`, payload);
      const resData = response.data;
      setVerdictResult(resData);

      // If accepted in official submission, update contest score and solved state
      if (!isTestRun && resData.verdict === 'ACCEPTED') {
        const newSolved = new Set(solvedIds);
        newSolved.add(currentQ.id);
        setSolvedIds(newSolved);

        // Refresh contest score
        const scoreData = await contestService.getMyScore(contestId, currentUsername);
        if (scoreData) {
          setContestScore(scoreData.score || 0);
        }
      }
    } catch (err) {
      setVerdictResult({
        verdict: 'COMPILATION_ERROR',
        message: err.response?.data?.message || err.message || 'Execution failed.',
        executionTimeMs: 0,
        memoryUsage: '0 MB'
      });
    } finally {
      setExecuting(false);
    }
  };

  // AI Doubt Handler
  const handleSendDoubt = async (overridePrompt = null, doubtType = 'GENERAL') => {
    const promptText = overridePrompt || doubtInput;
    if (!promptText || !promptText.trim()) return;

    const currentQ = questions[activeQuestionIndex];
    const userMsg = { sender: 'user', text: promptText, type: doubtType };
    setDoubtMessages((prev) => [...prev, userMsg]);
    setDoubtInput('');
    setDoubtLoading(true);

    try {
      const payload = {
        contestId: Number(contestId),
        challengeId: currentQ?.id || null,
        problemTitle: currentQ?.title || 'Coding Challenge',
        problemDescription: currentQ?.description || '',
        contestantCode: sourceCode,
        contestantDoubt: promptText,
        doubtType,
        errorDetails: verdictResult?.errorDetails || verdictResult?.message || '',
        language
      };

      const resp = await aiDoubtService.askDoubt(payload);
      const aiReply = {
        sender: 'ai',
        text: resp.reply,
        type: resp.doubtType,
        suggestedFollowUps: resp.suggestedFollowUps
      };
      setDoubtMessages((prev) => [...prev, aiReply]);
    } catch (err) {
      setDoubtMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: '⚠️ Could not reach AI Doubt Assistant. Please check your connection and try again.',
          type: 'ERROR'
        }
      ]);
    } finally {
      setDoubtLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
        <h3>Loading Contest Arena...</h3>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div style={{ maxWidth: '600px', margin: '60px auto', padding: '24px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', textAlign: 'center' }}>
        <h3 style={{ color: '#991b1b', marginTop: 0 }}>⚠️ Contest Error</h3>
        <p style={{ color: '#7f1d1d' }}>{errorMsg}</p>
        <Link to="/contests" style={{ padding: '8px 16px', background: '#3b82f6', color: '#fff', textDecoration: 'none', borderRadius: '6px', fontWeight: 'bold' }}>
          &larr; Back to Contests
        </Link>
      </div>
    );
  }

  // Access Rule: UPCOMING CONTEST (Waiting Room)
  if (timeRemaining.isUpcoming) {
    return (
      <div style={{ maxWidth: '700px', margin: '60px auto', padding: '36px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <span style={{ padding: '4px 12px', background: '#dbeafe', color: '#1d4ed8', borderRadius: '16px', fontSize: '12px', fontWeight: '800' }}>
          UPCOMING CONTEST
        </span>
        <h1 style={{ margin: '16px 0 8px 0', fontSize: '28px', color: '#0f172a' }}>{contest?.title}</h1>
        <p style={{ color: '#64748b', fontSize: '15px', marginBottom: '24px' }}>
          This contest has not started yet. Questions and code submission will unlock automatically when the contest begins.
        </p>

        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '20px', margin: '20px auto', maxWidth: '380px' }}>
          <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', marginBottom: '6px' }}>
            Contest Starts In
          </div>
          <div style={{ fontSize: '36px', fontWeight: '900', color: '#2563eb', fontFamily: 'monospace' }}>
            {countdownText}
          </div>
          <div style={{ fontSize: '13px', color: '#475569', marginTop: '6px' }}>
            Start Time: {new Date(contest?.startTime).toLocaleString()}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '24px' }}>
          <Link to="/contests" style={{ padding: '10px 20px', background: '#f1f5f9', color: '#334155', textDecoration: 'none', borderRadius: '6px', fontWeight: 'bold' }}>
            &larr; Back to Contests
          </Link>
        </div>
      </div>
    );
  }

  // Current problem
  const currentQ = questions[activeQuestionIndex];
  let sampleCases = [];
  if (currentQ?.sampleTestCases) {
    try {
      sampleCases = JSON.parse(currentQ.sampleTestCases);
    } catch (e) {
      sampleCases = [];
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', overflow: 'hidden', background: '#f8fafc' }}>
      
      {/* Top Arena Header */}
      <header style={{
        background: '#0f172a',
        color: '#fff',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #334155',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Left: Contest Title & Back */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to="/contests" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>
            &larr; Exit
          </Link>
          <span style={{ color: '#475569' }}>|</span>
          <h2 style={{ margin: 0, fontSize: '17px', color: '#f8fafc', fontWeight: '700' }}>
            {contest?.title}
          </h2>
          <span style={{
            fontSize: '11px',
            padding: '2px 8px',
            borderRadius: '12px',
            fontWeight: '800',
            background: timeRemaining.isExpired ? '#475569' : '#065f46',
            color: timeRemaining.isExpired ? '#cbd5e1' : '#6ee7b7',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            {!timeRemaining.isExpired && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />}
            {timeRemaining.isExpired ? 'EXPIRED' : 'ACTIVE'}
          </span>
        </div>

        {/* Center: Live Countdown Timer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: '#1e293b',
          padding: '6px 16px',
          borderRadius: '8px',
          border: `1px solid ${timeRemaining.isExpired ? '#475569' : (timeRemaining.hours === 0 && timeRemaining.minutes < 10) ? '#dc2626' : '#3b82f6'}`
        }}>
          <span style={{ fontSize: '16px' }}>⏳</span>
          <div>
            <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>
              {timeRemaining.isExpired ? 'Contest Ended' : 'Time Remaining'}
            </div>
            <div style={{
              fontSize: '18px',
              fontFamily: 'monospace',
              fontWeight: '900',
              color: timeRemaining.isExpired ? '#94a3b8' : (timeRemaining.hours === 0 && timeRemaining.minutes < 10) ? '#f87171' : '#60a5fa'
            }}>
              {countdownText}
            </div>
          </div>
        </div>

        {/* Right: Contestant Score & Leaderboard Link */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>My Contest Score</div>
            <div style={{ fontSize: '17px', fontWeight: '800', color: '#38bdf8' }}>
              🏆 {contestScore} pts
            </div>
          </div>

          <Link
            to={`/leaderboard?contestId=${contestId}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '6px 12px',
              background: '#334155',
              color: '#f8fafc',
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600'
            }}
          >
            📊 Standings
          </Link>
        </div>
      </header>

      {/* Expired Warning Banner (if contest expired while on page) */}
      {timeRemaining.isExpired && (
        <div style={{ padding: '8px 20px', background: '#fee2e2', borderBottom: '1px solid #fecaca', color: '#991b1b', fontSize: '13px', fontWeight: '700', textAlign: 'center' }}>
          🏁 This contest has ended. Submissions are closed. You can view the finalized standings on the Leaderboard.
        </div>
      )}

      {/* Questions Selector Bar */}
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)', padding: '8px 20px', display: 'flex', gap: '8px', overflowX: 'auto' }}>
        {questions.map((q, idx) => {
          const isSolved = solvedIds.has(q.id);
          const isSelected = idx === activeQuestionIndex;

          return (
            <button
              key={q.id || idx}
              onClick={() => handleSelectQuestion(idx)}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: isSelected ? '700' : '500',
                border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                background: isSelected ? 'var(--primary-subtle)' : 'var(--bg-surface-elevated)',
                color: isSelected ? 'var(--primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap'
              }}
            >
              {isSolved && <span style={{ color: 'var(--success)', fontWeight: '900' }}>✓</span>}
              <span>Problem {idx + 1}: {q.title || `Challenge #${q.id}`}</span>
              <span style={{ fontSize: '11px', padding: '1px 6px', borderRadius: '4px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                {q.basePoints || q.points || 100} pts
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Workspace: Left (Problem Statement) & Right (Code Editor & Runner) */}
      <div style={{ display: 'grid', gridTemplateColumns: '480px 1fr', flex: 1, overflow: 'hidden' }}>
        
        {/* Left: Problem Details Panel */}
        <div style={{ borderRight: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', overflowY: 'auto', padding: '24px' }}>
          {currentQ ? (
            <FormattedProblemStatement problem={{ ...currentQ, sampleTestCases: sampleCases }} />
          ) : (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>No question selected</div>
          )}
        </div>

        {/* Right: Code Editor & Test Results Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          
          {/* Editor Header / Controls */}
          <div style={{ padding: '10px 16px', background: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                style={{
                  background: 'var(--bg-surface)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-main)',
                  borderRadius: '6px',
                  padding: '5px 12px',
                  fontSize: '13px',
                  fontWeight: '600',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="javascript">JavaScript (Node.js)</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python 3</option>
                <option value="java">Java (OpenJDK 21)</option>
                <option value="cpp">C++ (G++)</option>
                <option value="c">C (GCC)</option>
                <option value="sql">SQL (SQLite)</option>
                <option value="r">R</option>
              </select>
              <button
                type="button"
                onClick={handleResetCode}
                style={{
                  background: resetSuccess ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                  color: resetSuccess ? '#10b981' : 'var(--text-muted)',
                  border: `1px solid ${resetSuccess ? '#10b981' : 'var(--border-main)'}`,
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontWeight: resetSuccess ? '700' : 'normal'
                }}
                title="Reset code to starter template"
              >
                <span>↺</span> {resetSuccess ? 'Reset!' : 'Reset Code'}
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                disabled={executing || timeRemaining.isExpired}
                onClick={() => handleExecuteCode(true)}
                style={{
                  padding: '7px 16px',
                  background: 'var(--bg-surface-elevated)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-main)',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: (executing || timeRemaining.isExpired) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {executing && execMode === 'run' ? 'Running...' : '▶ Run Code'}
              </button>

              <button
                type="button"
                disabled={executing || timeRemaining.isExpired}
                onClick={() => handleExecuteCode(false)}
                style={{
                  padding: '7px 20px',
                  background: timeRemaining.isExpired ? 'var(--text-muted)' : 'var(--success)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '800',
                  cursor: (executing || timeRemaining.isExpired) ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
                  transition: 'all 0.15s ease'
                }}
              >
                {executing && execMode === 'submit' ? 'Submitting...' : '🚀 Submit Solution'}
              </button>
            </div>
          </div>

          {/* Code Textarea */}
          <div style={{ flex: 1, position: 'relative', background: 'var(--editor-bg)' }}>
            <textarea
              value={sourceCode}
              onChange={(e) => setSourceCode(e.target.value)}
              onKeyDown={handleEditorKeyDown}
              disabled={timeRemaining.isExpired}
              spellCheck="false"
              placeholder="// Write your contest solution here..."
              style={{
                width: '100%',
                height: '100%',
                background: 'var(--editor-bg)',
                color: 'var(--editor-text)',
                border: 'none',
                padding: '16px',
                fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, Monaco, Consolas, monospace",
                fontSize: '14px',
                lineHeight: '1.65',
                resize: 'none',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Test Results Panel (Collapsible or bottom docked) */}
          <div style={{ height: '220px', background: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '8px 16px', background: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Execution Results & Metrics
              </span>
              {verdictResult && (
                <span
                  className={verdictResult.verdict}
                  style={{
                    padding: '2px 10px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: '800',
                    background: verdictResult.verdict === 'ACCEPTED' ? 'var(--success-bg)' : 'var(--danger-bg)',
                    color: verdictResult.verdict === 'ACCEPTED' ? 'var(--success)' : 'var(--danger)',
                    border: `1px solid ${verdictResult.verdict === 'ACCEPTED' ? 'var(--success-border)' : 'var(--danger-border)'}`
                  }}
                >
                  {verdictResult.verdict === 'ACCEPTED' ? '✓ ACCEPTED' : verdictResult.verdict}
                </span>
              )}
            </div>

            <div style={{ flex: 1, padding: '12px 16px', overflowY: 'auto' }}>
              {verdictResult ? (
                <div>
                  {/* Metric Cards Row */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '12px' }}>
                    <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', padding: '8px 12px', borderRadius: '6px' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>Verdict</div>
                      <div className={verdictResult.verdict} style={{ fontSize: '14px', fontWeight: '800', color: verdictResult.verdict === 'ACCEPTED' ? 'var(--success)' : 'var(--danger)' }}>
                        {verdictResult.verdict}
                      </div>
                    </div>

                    <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', padding: '8px 12px', borderRadius: '6px' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>Execution Time</div>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>
                        {verdictResult.executionTimeMs != null ? `${verdictResult.executionTimeMs} ms` : 'N/A'}
                      </div>
                    </div>

                    <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', padding: '8px 12px', borderRadius: '6px' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>Memory Usage</div>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>
                        {verdictResult.memoryUsage || '12.4 MB'}
                      </div>
                    </div>

                    <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', padding: '8px 12px', borderRadius: '6px' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>Test Cases</div>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>
                        {verdictResult.passedTestCases != null && verdictResult.totalTestCases != null
                          ? `${verdictResult.passedTestCases} / ${verdictResult.totalTestCases} Passed`
                          : (verdictResult.verdict === 'ACCEPTED' ? 'All Passed' : 'Failures Detected')}
                      </div>
                    </div>
                  </div>

                  {/* Message / Error Details */}
                  {verdictResult.message && (
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      {verdictResult.message}
                    </div>
                  )}

                  {verdictResult.errorDetails && (
                    <pre style={{ margin: 0, padding: '8px 12px', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: '6px', fontSize: '12px', fontFamily: 'monospace', overflowX: 'auto', border: '1px solid var(--danger-border)' }}>
                      {verdictResult.errorDetails}
                    </pre>
                  )}
                </div>
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>
                  Write code above and click <strong>Run Code</strong> or <strong>Submit Solution</strong> to inspect verdicts, execution time, and memory usage.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating AI Doubt Assistant Button (Bottom-Right) */}
      {!isDoubtOpen && (
        <button
          type="button"
          onClick={() => setIsDoubtOpen(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            color: '#fff',
            border: 'none',
            borderRadius: '30px',
            padding: '12px 20px',
            boxShadow: 'var(--shadow-glow), var(--shadow-lg)',
            cursor: 'pointer',
            fontWeight: '700',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            zIndex: 1000,
            transition: 'transform 0.2s ease'
          }}
        >
          <span>🤖</span>
          <span>AI Doubt?</span>
        </button>
      )}

      {/* Docked / Slide-Over AI Doubt Panel */}
      {isDoubtOpen && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '390px',
          height: '530px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-main)',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000,
          overflow: 'hidden'
        }}>
          {/* Doubt Panel Header */}
          <div style={{
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            color: '#fff',
            padding: '12px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>🤖</span>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700' }}>AI Doubt Assistant</div>
                <div style={{ fontSize: '11px', color: '#c7d2fe' }}>Live Contest Helper</div>
              </div>
            </div>
            <button
              onClick={() => setIsDoubtOpen(false)}
              style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              ✕
            </button>
          </div>

          {/* Strict Integrity Warning */}
          <div style={{ background: 'var(--warning-bg)', borderBottom: '1px solid var(--warning-border)', padding: '6px 12px', fontSize: '11px', color: 'var(--warning)', textAlign: 'center', fontWeight: '600' }}>
            🔒 Contest Mode: Hints & concepts only. Complete code is prohibited.
          </div>

          {/* Quick Action Chips */}
          <div style={{ padding: '8px 12px', background: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', gap: '6px', overflowX: 'auto' }}>
            <button
              type="button"
              onClick={() => handleSendDoubt('Give me a hint for this problem', 'HINT')}
              style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '12px', background: 'var(--bg-surface)', border: '1px solid var(--border-main)', color: 'var(--text-main)', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              💡 Give hint
            </button>
            <button
              type="button"
              onClick={() => handleSendDoubt('Explain the core algorithmic concept', 'CONCEPT')}
              style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '12px', background: 'var(--bg-surface)', border: '1px solid var(--border-main)', color: 'var(--text-main)', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              ❓ Explain concept
            </button>
            <button
              type="button"
              onClick={() => handleSendDoubt('Help me debug my error or failing cases', 'ERROR_EXPLANATION')}
              style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '12px', background: 'var(--bg-surface)', border: '1px solid var(--border-main)', color: 'var(--text-main)', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              🐛 Debug error
            </button>
            <button
              type="button"
              onClick={() => handleSendDoubt('What edge cases should I check?', 'EDGE_CASE')}
              style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '12px', background: 'var(--bg-surface)', border: '1px solid var(--border-main)', color: 'var(--text-main)', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              🔍 Edge cases
            </button>
          </div>

          {/* Messages Stream */}
          <div style={{ flex: 1, padding: '12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', background: 'var(--bg-surface)' }}>
            {doubtMessages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  padding: '8px 12px',
                  borderRadius: msg.sender === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                  background: msg.sender === 'user' ? 'var(--primary)' : 'var(--bg-surface-elevated)',
                  color: msg.sender === 'user' ? '#fff' : 'var(--text-main)',
                  border: msg.sender === 'user' ? 'none' : '1px solid var(--border-subtle)',
                  fontSize: '13px',
                  lineHeight: '1.45',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {msg.text}
              </div>
            ))}
            {doubtLoading && (
              <div style={{ alignSelf: 'flex-start', padding: '8px 12px', background: 'var(--bg-surface-elevated)', borderRadius: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
                🤖 Thinking of a hint...
              </div>
            )}
            <div ref={doubtEndRef} />
          </div>

          {/* Input & Send Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendDoubt();
            }}
            style={{ padding: '10px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '6px', background: 'var(--bg-surface)' }}
          >
            <input
              type="text"
              value={doubtInput}
              onChange={(e) => setDoubtInput(e.target.value)}
              placeholder="Ask a doubt or paste error..."
              disabled={doubtLoading}
              style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--border-main)', borderRadius: '6px', fontSize: '13px', outline: 'none', background: 'var(--bg-app)', color: 'var(--text-main)' }}
            />
            <button
              type="submit"
              disabled={doubtLoading || !doubtInput.trim()}
              style={{
                padding: '8px 16px',
                background: (!doubtInput.trim() || doubtLoading) ? 'var(--text-muted)' : 'var(--primary)',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '700',
                cursor: (!doubtInput.trim() || doubtLoading) ? 'not-allowed' : 'pointer'
              }}
            >
              Ask
            </button>
          </form>
        </div>
      )}

    </div>
  );
};

export default ContestArena;
