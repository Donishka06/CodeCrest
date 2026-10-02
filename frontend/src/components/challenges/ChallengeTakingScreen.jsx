import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import challengeService from '../../services/challengeService';
import submissionService from '../../services/submissionService';
import rankingService from '../../services/rankingService';
import FormattedProblemStatement from '../common/FormattedProblemStatement';

const ChallengeTakingScreen = () => {
  const { id } = useParams();
  const [challenge, setChallenge] = useState(null);
  const [language, setLanguage] = useState('javascript');
  const [sourceCode, setSourceCode] = useState('');
  const [executing, setExecuting] = useState(false);
  const [execMode, setExecMode] = useState(''); // 'run' or 'submit'
  const [verdictResult, setVerdictResult] = useState(null);
  const [activeTab, setActiveTab] = useState('description');
  const [activeTestCaseTab, setActiveTestCaseTab] = useState(0);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [clearSuccess, setClearSuccess] = useState(false);

  // Clean starter templates for all 8 supported programming languages
  const getStarterTemplate = (title, lang) => {
    const t = (title || '').toLowerCase();
    const isTwoSum = t.includes('two sum') || t.includes('twosum');
    const isReverse = t.includes('algorithm') || t.includes('reverse');
    const isPalindrome = t.includes('palindrome');
    const isCoin = t.includes('coin');
    const isAnagram = t.includes('anagram');
    const isWater = t.includes('water');

    switch (lang) {
      case 'python':
        if (isTwoSum) return `# @param nums: List[int]\n# @param target: int\n# @return List[int]\ndef twoSum(nums, target):\n    # Write your solution here\n    pass\n`;
        if (isReverse) return `# @param s: str\n# @return str\ndef reverseString(s):\n    # Write your solution here\n    pass\n`;
        if (isPalindrome) return `# @param x: int\n# @return bool\ndef isPalindrome(x):\n    # Write your solution here\n    pass\n`;
        if (isCoin) return `# @param coins: List[int]\n# @param amount: int\n# @return int\ndef coinChange(coins, amount):\n    # Write your solution here\n    pass\n`;
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
        if (isReverse) return `/**\n * @param {string} s\n * @return {string}\n */\nfunction reverseString(s) {\n  // Write your solution here\n  \n}\n`;
        if (isPalindrome) return `/**\n * @param {number} x\n * @return {boolean}\n */\nfunction isPalindrome(x) {\n  // Write your solution here\n  \n}\n`;
        if (isCoin) return `/**\n * @param {number[]} coins\n * @param {number} amount\n * @return {number}\n */\nfunction coinChange(coins, amount) {\n  // Write your solution here\n  \n}\n`;
        if (isAnagram) return `/**\n * @param {string[]} strs\n * @return {string[][]}\n */\nfunction groupAnagrams(strs) {\n  // Write your solution here\n  \n}\n`;
        if (isWater) return `/**\n * @param {number[]} height\n * @return {number}\n */\nfunction maxArea(height) {\n  // Write your solution here\n  \n}\n`;
        return `/**\n * @param {any} input\n * @return {any}\n */\nfunction solve(input) {\n  // Write your solution here\n  \n}\n`;
    }
  };

  useEffect(() => {
    const fetchDetail = async () => {
      const data = await challengeService.getById(id);
      setChallenge(data);
      setSourceCode(getStarterTemplate(data?.title, language));
    };
    fetchDetail();
  }, [id]);

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    setSourceCode(getStarterTemplate(challenge?.title, newLang));
  };

  const handleReset = () => {
    const template = getStarterTemplate(challenge?.title, language);
    setSourceCode(template);
    setVerdictResult(null);
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 2500);
  };

  const handleClear = () => {
    setSourceCode('');
    setVerdictResult(null);
    setClearSuccess(true);
    setTimeout(() => setClearSuccess(false), 2500);
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

  const executeCode = async (isTestRun) => {
    setExecuting(true);
    setExecMode(isTestRun ? 'run' : 'submit');
    setVerdictResult(null);

    const currentUser = JSON.parse(localStorage.getItem('user'))?.username || 'contestant';
    const points = challenge?.basePoints || 100;

    const payload = {
      challengeId: Number(id),
      sourceCode,
      username: currentUser,
      language,
      isTestRun
    };

    try {
      const resp = isTestRun
        ? await submissionService.runTest(id, payload)
        : await submissionService.submit(id, payload);

      setVerdictResult(resp);
      setActiveTestCaseTab(0);

      // If accepted on real submission, record solved status and award points
      if (!isTestRun && resp?.verdict === 'ACCEPTED') {
        try {
          const solvedKey = `solved_${currentUser}`;
          const currentSolved = JSON.parse(localStorage.getItem(solvedKey) || '[]');
          if (!currentSolved.includes(Number(id))) {
            currentSolved.push(Number(id));
            localStorage.setItem(solvedKey, JSON.stringify(currentSolved));
          }
        } catch (e) {}

        if (resp.pointsEarned && resp.pointsEarned > 0) {
          rankingService.updateUserScore(currentUser, resp.pointsEarned);
        }
      }
    } catch (err) {
      setVerdictResult({
        verdict: 'RUNTIME_ERROR',
        pointsEarned: 0,
        executionTimeMs: 0,
        memoryUsage: '0.0 MB',
        timeComplexity: 'N/A',
        spaceComplexity: 'N/A',
        message: err.response?.data?.message || err.message || 'Execution failed due to connection error.'
      });
    } finally {
      setExecuting(false);
    }
  };

  if (!challenge) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading challenge specifications...</div>;
  }

  // Parse sample test cases safely
  let sampleTestCases = [];
  try {
    if (challenge.sampleTestCases) {
      sampleTestCases = JSON.parse(challenge.sampleTestCases);
    }
  } catch (e) {
    sampleTestCases = [];
  }

  const getVerdictBadgeStyle = (verdict) => {
    switch (verdict) {
      case 'ACCEPTED':
        return { background: '#dcfce7', color: '#15803d', border: '1px solid #86efac' };
      case 'WRONG_ANSWER':
        return { background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5' };
      case 'TIME_LIMIT_EXCEEDED':
        return { background: '#fef3c7', color: '#b45309', border: '1px solid #fcd34d' };
      case 'COMPILATION_ERROR':
      case 'RUNTIME_ERROR':
      default:
        return { background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' };
    }
  };

  const getDifficultyColor = (diff) => {
    const d = (diff || '').toUpperCase();
    if (d === 'EASY') return '#22c55e';
    if (d === 'MEDIUM') return '#f59e0b';
    if (d === 'HARD') return '#ef4444';
    return '#3b82f6';
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '20px auto', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Navigation Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/challenges" style={{ textDecoration: 'none', color: '#3b82f6', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
          &larr; Back to Challenges
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '13px', color: '#64748b' }}>Time Limit: <strong>{challenge.timeLimitMs || 1000} ms</strong></span>
          <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', background: `${getDifficultyColor(challenge.difficulty)}15`, color: getDifficultyColor(challenge.difficulty) }}>
            {challenge.difficulty}
          </span>
          <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', background: '#eff6ff', color: '#2563eb' }}>
            {challenge.basePoints} Points
          </span>
        </div>
      </div>

      {/* Dual Panel LeetCode Workspace */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) minmax(480px, 1.25fr)', gap: '20px', alignItems: 'stretch' }}>
        
        {/* Left Column: Problem Description & Specifications */}
        <div className="glass-card" style={{ borderRadius: '12px', padding: '24px', overflowY: 'auto', maxHeight: 'calc(100vh - 120px)' }}>
          {/* Description Tabs */}
          <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '18px' }}>
            <button
              onClick={() => setActiveTab('description')}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'description' ? '2px solid var(--primary)' : '2px solid transparent',
                padding: '8px 6px',
                fontWeight: '600',
                color: activeTab === 'description' ? 'var(--primary)' : 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab('examples')}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'examples' ? '2px solid var(--primary)' : '2px solid transparent',
                padding: '8px 6px',
                fontWeight: '600',
                color: activeTab === 'examples' ? 'var(--primary)' : 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              Examples ({sampleTestCases.length})
            </button>
          </div>

          <FormattedProblemStatement problem={{ ...challenge, sampleTestCases }} activeTab={activeTab} />
        </div>

        {/* Right Column: Code Editor & Execution Console */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Editor Header Bar */}
          <div className="glass-card" style={{ padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>Language:</span>
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                style={{
                  background: 'var(--bg-surface)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-main)',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '13px',
                  outline: 'none',
                  cursor: 'pointer',
                  fontWeight: '500'
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
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {resetSuccess && (
                <span style={{
                  fontSize: '12px',
                  color: '#10b981',
                  fontWeight: '600',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  ✓ Reset to template
                </span>
              )}
              {clearSuccess && (
                <span style={{
                  fontSize: '12px',
                  color: '#f59e0b',
                  fontWeight: '600',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  ✓ Code cleared
                </span>
              )}

              <button
                type="button"
                onClick={handleReset}
                style={{
                  background: resetSuccess ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                  border: `1px solid ${resetSuccess ? '#10b981' : 'var(--border-main)'}`,
                  color: resetSuccess ? '#10b981' : 'var(--text-muted)',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontWeight: resetSuccess ? '700' : '500'
                }}
                title="Reset code editor to starter template"
              >
                <span>↺</span> {resetSuccess ? 'Reset!' : 'Reset'}
              </button>

              <button
                type="button"
                onClick={handleClear}
                style={{
                  background: clearSuccess ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                  border: `1px solid ${clearSuccess ? '#f59e0b' : 'var(--border-main)'}`,
                  color: clearSuccess ? '#f59e0b' : 'var(--text-muted)',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontWeight: clearSuccess ? '700' : '500'
                }}
                title="Clear entire code editor"
              >
                <span>✕</span> {clearSuccess ? 'Cleared!' : 'Clear'}
              </button>
            </div>
          </div>

          {/* Code Textarea Editor */}
          <div style={{ position: 'relative' }}>
            <textarea
              value={sourceCode}
              onChange={(e) => setSourceCode(e.target.value)}
              onKeyDown={handleEditorKeyDown}
              rows="16"
              spellCheck="false"
              placeholder="// Write your solution here..."
              style={{
                width: '100%',
                fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, Monaco, Consolas, monospace",
                fontSize: '14px',
                lineHeight: '1.65',
                padding: '16px',
                background: 'var(--editor-bg)',
                color: 'var(--editor-text)',
                borderRadius: '12px',
                border: '1px solid var(--border-main)',
                boxSizing: 'border-box',
                resize: 'vertical',
                minHeight: '300px',
                outline: 'none',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
              }}
            />
          </div>

          {/* Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', alignItems: 'center' }}>
            <button
              type="button"
              disabled={executing}
              onClick={() => executeCode(true)}
              style={{
                padding: '10px 20px',
                background: 'var(--bg-surface-elevated)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-main)',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '14px',
                cursor: executing ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              ▶ Run Code
            </button>

            <button
              type="button"
              disabled={executing}
              onClick={() => executeCode(false)}
              style={{
                padding: '10px 24px',
                background: 'var(--success)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '14px',
                cursor: executing ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {executing ? (execMode === 'submit' ? 'Evaluating Solution...' : 'Running Tests...') : '🚀 Submit Solution'}
            </button>
          </div>

          {/* Execution & Verdict Console */}
          {verdictResult && (
            <div
              className="glass-card"
              style={{
                borderRadius: '12px',
                padding: '20px',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              {/* Verdict Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span
                    className={verdictResult.verdict}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '15px',
                      fontWeight: '800',
                      letterSpacing: '0.5px',
                      ...getVerdictBadgeStyle(verdictResult.verdict)
                    }}
                  >
                    {verdictResult.verdict === 'ACCEPTED' ? '✓ ACCEPTED' : verdictResult.verdict.replace(/_/g, ' ')}
                  </span>
                  <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                    {verdictResult.message}
                  </span>
                </div>

                {!verdictResult.isTestRun && verdictResult.verdict === 'ACCEPTED' && verdictResult.pointsEarned > 0 && (
                  <span style={{ fontWeight: 'bold', color: 'var(--success)', fontSize: '14px', background: 'var(--success-bg)', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--success-border)' }}>
                    +{verdictResult.pointsEarned} Points Added!
                  </span>
                )}
              </div>

              {/* LeetCode Metrics Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '18px' }}>
                <div style={{ background: 'var(--bg-surface-elevated)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>⏱️ Runtime</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-main)', marginTop: '2px' }}>
                    {verdictResult.executionTimeMs} ms
                  </div>
                </div>

                <div style={{ background: 'var(--bg-surface-elevated)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>💾 Memory</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-main)', marginTop: '2px' }}>
                    {verdictResult.memoryUsage || '14.2 MB'}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-surface-elevated)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>⚡ Time Complexity</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--primary)', marginTop: '2px' }}>
                    {verdictResult.timeComplexity || 'O(n)'}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-surface-elevated)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>📦 Space Complexity</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--accent-purple)', marginTop: '2px' }}>
                    {verdictResult.spaceComplexity || 'O(1)'}
                  </div>
                </div>
              </div>

              {/* Complexity Analysis Details */}
              {verdictResult.complexityDetails && (
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', padding: '8px 12px', borderRadius: '6px', marginBottom: '16px' }}>
                  <strong>Complexity Analysis:</strong> {verdictResult.complexityDetails}
                </div>
              )}

              {/* Error Details (if Compilation / Runtime Error) */}
              {verdictResult.errorDetails && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#b91c1c', marginBottom: '6px' }}>
                    Error Output:
                  </div>
                  <pre style={{ background: '#fef2f2', color: '#991b1b', padding: '12px', borderRadius: '8px', fontSize: '12px', overflowX: 'auto', border: '1px solid #fecaca', whiteSpace: 'pre-wrap' }}>
                    {verdictResult.errorDetails}
                  </pre>
                </div>
              )}

              {/* Test Case Breakdown Tabs */}
              {verdictResult.testCaseResults && verdictResult.testCaseResults.length > 0 && (
                <div>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>Test Cases:</span>
                    {verdictResult.testCaseResults.map((tc, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveTestCaseTab(idx)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          border: activeTestCaseTab === idx ? '2px solid #3b82f6' : '1px solid #cbd5e1',
                          background: tc.passed ? '#f0fdf4' : '#fef2f2',
                          color: tc.passed ? '#15803d' : '#b91c1c',
                          fontWeight: '600',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Case {idx + 1} {tc.passed ? '✓' : '✕'}
                      </button>
                    ))}
                  </div>

                  {/* Active Test Case Detail */}
                  {verdictResult.testCaseResults[activeTestCaseTab] && (
                    <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                      <div style={{ marginBottom: '8px' }}>
                        <span style={{ fontWeight: 'bold', color: '#475569' }}>Input:</span>
                        <pre style={{ margin: '4px 0 0 0', background: '#e2e8f0', padding: '6px 10px', borderRadius: '4px', fontFamily: 'monospace' }}>
                          {verdictResult.testCaseResults[activeTestCaseTab].input}
                        </pre>
                      </div>

                      <div style={{ marginBottom: '8px' }}>
                        <span style={{ fontWeight: 'bold', color: '#475569' }}>Your Output:</span>
                        <pre style={{
                          margin: '4px 0 0 0',
                          background: verdictResult.testCaseResults[activeTestCaseTab].passed ? '#dcfce7' : '#fee2e2',
                          color: verdictResult.testCaseResults[activeTestCaseTab].passed ? '#166534' : '#991b1b',
                          padding: '6px 10px',
                          borderRadius: '4px',
                          fontFamily: 'monospace'
                        }}>
                          {verdictResult.testCaseResults[activeTestCaseTab].actualOutput}
                        </pre>
                      </div>

                      <div>
                        <span style={{ fontWeight: 'bold', color: '#475569' }}>Expected Output:</span>
                        <pre style={{ margin: '4px 0 0 0', background: '#e2e8f0', padding: '6px 10px', borderRadius: '4px', fontFamily: 'monospace' }}>
                          {verdictResult.testCaseResults[activeTestCaseTab].expectedOutput}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChallengeTakingScreen;
