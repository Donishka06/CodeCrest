import React, { useState, useEffect, useRef } from 'react';
import playgroundService from '../../services/playgroundService';

const STARTER_SNIPPETS = {
  javascript: `// JavaScript (Node.js v22) Playground
const fs = require('fs');

function main() {
  console.log("Welcome to CodeCrest Code Playground!");
  
  // Example array manipulation
  const numbers = [5, 2, 9, 1, 7, 6];
  const sorted = [...numbers].sort((a, b) => a - b);
  console.log("Original:", numbers);
  console.log("Sorted:  ", sorted);
  
  // Custom Input reader (if provided)
  try {
    const input = fs.readFileSync(0, 'utf-8').trim();
    if (input) {
      console.log("\\n--- Standard Input Received ---");
      console.log(input);
    }
  } catch (e) {}
}

main();
`,

  typescript: `// TypeScript (Node.js Native Strip-Types) Playground
interface Contestant {
  id: number;
  username: string;
  rating: number;
  badges: string[];
}

const coder: Contestant = {
  id: 101,
  username: "CodeMaster",
  rating: 2150,
  badges: ["Top Coder", "Algorithm Pro"]
};

function formatProfile(user: Contestant): string {
  return \`[\${user.username}] Rating: \${user.rating} | Badges: \${user.badges.join(', ')}\`;
}

console.log("Welcome to CodeCrest TypeScript Playground!");
console.log(formatProfile(coder));
`,

  python: `# Python 3.13 Playground
import sys

def main():
    print("Welcome to CodeCrest Python Playground!")
    
    # Example: List comprehension & Fibonacci
    def fib(n):
        a, b = 0, 1
        seq = []
        for _ in range(n):
            seq.append(a)
            a, b = b, a + b
        return seq

    print("Fibonacci(10):", fib(10))
    
    # Read custom input if passed
    lines = sys.stdin.read().splitlines()
    if lines:
        print("\\n--- Custom Input Lines ---")
        for i, line in enumerate(lines, 1):
            print(f"Line {i}: {line}")

if __name__ == "__main__":
    main()
`,

  java: `// Java 21 (OpenJDK LTS) Playground
import java.util.*;

public class Main {
    public static void main(String[] args) {
        System.out.println("Welcome to CodeCrest Java Playground!");
        
        // Priority Queue / Heap Demo
        PriorityQueue<Integer> pq = new PriorityQueue<>(Collections.reverseOrder());
        int[] nums = {45, 12, 89, 34, 99, 23};
        for (int n : nums) pq.offer(n);
        
        System.out.print("Max-Heap extraction: ");
        while (!pq.isEmpty()) {
            System.out.print(pq.poll() + " ");
        }
        System.out.println();
        
        // Read input if provided
        Scanner scanner = new Scanner(System.in);
        if (scanner.hasNextLine()) {
            System.out.println("\\nInput received: " + scanner.nextLine());
        }
    }
}
`,

  cpp: `// C++ (G++ / ISO C++20) Playground
#include <iostream>
#include <vector>
#include <algorithm>
#include <string>

using namespace std;

int main() {
    cout << "Welcome to CodeCrest C++ Playground!" << endl;
    
    vector<int> data = {10, 40, 20, 50, 30};
    sort(data.begin(), data.end());
    
    cout << "Sorted elements: ";
    for (int x : data) {
        cout << x << " ";
    }
    cout << endl;
    
    string line;
    if (getline(cin, line) && !line.empty()) {
        cout << "\\nInput: " << line << endl;
    }
    
    return 0;
}
`,

  c: `// C (GCC / C17) Playground
#include <stdio.h>

int main() {
    printf("Welcome to CodeCrest C Playground!\\n");
    
    int a = 15;
    int b = 35;
    printf("Arithmetic: %d + %d = %d\\n", a, b, a + b);
    
    for (int i = 1; i <= 3; i++) {
        printf("Iteration step: %d\\n", i);
    }
    
    return 0;
}
`,

  sql: `-- SQL (SQLite In-Memory Engine) Playground
-- Create sample schema
CREATE TABLE contestants (
    id INTEGER PRIMARY KEY,
    username TEXT NOT NULL,
    division TEXT,
    rating INTEGER
);

-- Insert sample records
INSERT INTO contestants VALUES (1, 'Ada_Lovelace', 'Grandmaster', 2450);
INSERT INTO contestants VALUES (2, 'Alan_Turing', 'Grandmaster', 2420);
INSERT INTO contestants VALUES (3, 'Grace_Hopper', 'Master', 2180);
INSERT INTO contestants VALUES (4, 'Linus_Torvalds', 'Master', 2100);

-- Query ranked standings
SELECT id, username, division, rating
FROM contestants
ORDER BY rating DESC;
`,

  r: `# R (Data Analytics & Vectors) Playground
cat("Welcome to CodeCrest R Playground!\\n\\n")

# Vector operations
scores <- c(88, 92, 79, 95, 84, 91, 100)
cat("Scores:", scores, "\\n")
cat("Mean:  ", mean(scores), "\\n")
cat("Sum:   ", sum(scores), "\\n")
cat("Min:   ", min(scores), "\\n")
cat("Max:   ", max(scores), "\\n")
`
};

const LANGUAGES = [
  { id: 'javascript', name: 'JavaScript', badge: 'Node.js v22', icon: '⚡' },
  { id: 'typescript', name: 'TypeScript', badge: 'Node Native', icon: '🔷' },
  { id: 'python', name: 'Python', badge: 'Python 3.13', icon: '🐍' },
  { id: 'java', name: 'Java', badge: 'OpenJDK 21', icon: '☕' },
  { id: 'cpp', name: 'C++', badge: 'G++ / C++20', icon: '⚙️' },
  { id: 'c', name: 'C', badge: 'GCC / C17', icon: '🔧' },
  { id: 'sql', name: 'SQL', badge: 'SQLite Engine', icon: '🗄️' },
  { id: 'r', name: 'R', badge: 'Analytics', icon: '📊' }
];

const EDITOR_THEMES = [
  { id: 'default', name: 'Sync Theme' },
  { id: 'vs-dark', name: 'VS Dark' },
  { id: 'vs-light', name: 'VS Light' },
  { id: 'monokai', name: 'Monokai' },
  { id: 'one-dark', name: 'One Dark' }
];

const THEME_STYLES = {
  default: {
    bg: 'var(--editor-bg)',
    text: 'var(--editor-text)',
    gutter: 'var(--editor-gutter)',
    gutterText: 'var(--text-muted)',
    border: 'var(--border-subtle)',
    caret: 'var(--primary)',
    selection: 'rgba(59, 130, 246, 0.25)'
  },
  'vs-dark': {
    bg: '#1e1e1e',
    text: '#d4d4d4',
    gutter: '#181818',
    gutterText: '#858585',
    border: '#2d2d2d',
    caret: '#569cd6',
    selection: 'rgba(38, 79, 120, 0.6)'
  },
  'vs-light': {
    bg: '#ffffff',
    text: '#24292e',
    gutter: '#f3f4f6',
    gutterText: '#9ca3af',
    border: '#e5e7eb',
    caret: '#0969da',
    selection: '#b4d5fe'
  },
  monokai: {
    bg: '#272822',
    text: '#f8f8f2',
    gutter: '#1e1f1c',
    gutterText: '#75715e',
    border: '#3e3d32',
    caret: '#f92672',
    selection: 'rgba(73, 72, 62, 0.8)'
  },
  'one-dark': {
    bg: '#282c34',
    text: '#abb2bf',
    gutter: '#21252b',
    gutterText: '#5c6370',
    border: '#181a1f',
    caret: '#528bff',
    selection: '#3e4451'
  }
};

const Playground = () => {
  const [language, setLanguage] = useState('javascript');
  const [sourceCode, setSourceCode] = useState(STARTER_SNIPPETS.javascript);
  const [customInput, setCustomInput] = useState('');
  const [editorTheme, setEditorTheme] = useState('default');
  const [activeRightTab, setActiveRightTab] = useState('output'); // 'output' or 'input'
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState(null);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [copied, setCopied] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [clearSuccess, setClearSuccess] = useState(false);

  const textareaRef = useRef(null);
  const gutterRef = useRef(null);

  // Compute total lines
  const lines = sourceCode.split('\n');
  const lineCount = lines.length;
  const charCount = sourceCode.length;

  const currentTheme = THEME_STYLES[editorTheme] || THEME_STYLES.default;

  // Language switch
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    setSourceCode(STARTER_SNIPPETS[newLang] || '');
    setResult(null);
  };

  // Reset to default starter code
  const handleReset = () => {
    setSourceCode(STARTER_SNIPPETS[language] || '');
    setResult(null);
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 2000);
  };

  // Clear code
  const handleClear = () => {
    setSourceCode('');
    setResult(null);
    setClearSuccess(true);
    setTimeout(() => setClearSuccess(false), 2000);
  };

  // Copy code to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(sourceCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Cursor tracking
  const updateCursorPos = (e) => {
    const selStart = e.target.selectionStart;
    const textUpToCursor = sourceCode.substring(0, selStart);
    const line = textUpToCursor.split('\n').length;
    const col = selStart - textUpToCursor.lastIndexOf('\n');
    setCursorPos({ line, col });
  };

  // Tab key & shortcut handling (Ctrl+Enter to run)
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      runCode();
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const val = e.target.value;
      const updated = val.substring(0, start) + '  ' + val.substring(end);
      setSourceCode(updated);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  // Sync gutter scroll with textarea
  const handleScroll = () => {
    if (textareaRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // Execute playground code
  const runCode = async () => {
    if (executing) return;
    setExecuting(true);
    setActiveRightTab('output');
    setResult(null);

    try {
      const resp = await playgroundService.runCode({
        sourceCode,
        language,
        customInput,
        timeLimitMs: 5000
      });
      setResult(resp);
    } catch (err) {
      setResult({
        status: 'RUNTIME_ERROR',
        stdout: '',
        stderr: err.response?.data?.message || err.message || 'Execution failed. Please check backend connection.',
        executionTimeMs: 0,
        memoryUsage: '0.0 MB',
        exitCode: 1
      });
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '16px 20px', minHeight: 'calc(100vh - 75px)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      
      {/* Top Header Bar */}
      <div
        className="glass-card"
        style={{
          padding: '12px 18px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          borderRadius: '10px'
        }}
      >
        {/* Left: Branding & Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>⚡</span>
            <h1 style={{ fontSize: '18px', fontWeight: '800', margin: 0, letterSpacing: '-0.3px', color: 'var(--text-main)' }}>
              Code Playground
            </h1>
            <span
              style={{
                fontSize: '11px',
                fontWeight: '700',
                padding: '2px 8px',
                borderRadius: '6px',
                background: 'rgba(37, 99, 235, 0.12)',
                color: 'var(--primary)',
                border: '1px solid rgba(37, 99, 235, 0.25)',
                letterSpacing: '0.4px'
              }}
            >
              IDE
            </span>
          </div>

          <div
            style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              paddingLeft: '12px',
              borderLeft: '1px solid var(--border-subtle)'
            }}
          >
            <span>🔒 Practice Sandbox: Execution is isolated and does not create submissions or affect ranking.</span>
          </div>
        </div>

        {/* Right: Controls & Run Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Language Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label htmlFor="pg-lang-select" style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>
              Language:
            </label>
            <select
              id="pg-lang-select"
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              style={{
                background: 'var(--bg-surface)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '13px',
                fontWeight: '600',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.icon} {lang.name} ({lang.badge})
                </option>
              ))}
            </select>
          </div>

          {/* Editor Theme Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label htmlFor="pg-theme-select" style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>
              Theme:
            </label>
            <select
              id="pg-theme-select"
              value={editorTheme}
              onChange={(e) => setEditorTheme(e.target.value)}
              style={{
                background: 'var(--bg-surface)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '6px 10px',
                fontSize: '12px',
                fontWeight: '500',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {EDITOR_THEMES.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Reset Button */}
          <button
            type="button"
            onClick={handleReset}
            title="Reset code to standard starter template"
            style={{
              background: resetSuccess ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-surface)',
              color: resetSuccess ? '#10b981' : 'var(--text-secondary)',
              border: resetSuccess ? '1px solid #10b981' : '1px solid var(--border-subtle)',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            ↺ {resetSuccess ? 'Reset!' : 'Reset'}
          </button>

          {/* Clear Button */}
          <button
            type="button"
            onClick={handleClear}
            title="Clear all code in editor"
            style={{
              background: clearSuccess ? 'rgba(239, 68, 68, 0.15)' : 'var(--bg-surface)',
              color: clearSuccess ? '#ef4444' : 'var(--text-secondary)',
              border: clearSuccess ? '1px solid #ef4444' : '1px solid var(--border-subtle)',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            ✕ {clearSuccess ? 'Cleared!' : 'Clear'}
          </button>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            title="Copy source code to clipboard"
            style={{
              background: copied ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-surface)',
              color: copied ? '#10b981' : 'var(--text-secondary)',
              border: copied ? '1px solid #10b981' : '1px solid var(--border-subtle)',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            📋 {copied ? 'Copied!' : 'Copy'}
          </button>

          {/* Primary RUN CODE Button */}
          <button
            type="button"
            onClick={runCode}
            disabled={executing}
            style={{
              background: executing ? 'var(--text-muted)' : 'linear-gradient(135deg, #10b981, #059669)',
              color: '#ffffff',
              border: 'none',
              padding: '7px 20px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: executing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.35)',
              transition: 'all 0.2s ease'
            }}
          >
            {executing ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" style={{ width: '14px', height: '14px', borderWidth: '2px' }} />
                Running...
              </>
            ) : (
              <>
                <span>▶</span>
                Run Code
                <span style={{ fontSize: '11px', opacity: 0.8, fontWeight: '400', background: 'rgba(0,0,0,0.2)', padding: '1px 5px', borderRadius: '4px' }}>
                  Ctrl+Enter
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Split IDE Layout: Left (Editor) + Right (Console & Stdin) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 0.8fr',
          gap: '14px',
          flex: 1,
          minHeight: '620px'
        }}
      >
        {/* ============================================================ */}
        {/* LEFT COLUMN: Monaco-Style Code Editor                        */}
        {/* ============================================================ */}
        <div
          style={{
            background: currentTheme.bg,
            border: `1px solid ${currentTheme.border}`,
            borderRadius: '10px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          {/* Editor Sub-Header / Breadcrumb */}
          <div
            style={{
              padding: '8px 14px',
              background: currentTheme.gutter,
              borderBottom: `1px solid ${currentTheme.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '12px',
              color: currentTheme.gutterText,
              fontFamily: "'JetBrains Mono', Consolas, monospace"
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: currentTheme.caret, fontWeight: 'bold' }}>&lt;/&gt;</span>
              <span>solution.{language === 'python' ? 'py' : language === 'javascript' ? 'js' : language === 'typescript' ? 'ts' : language === 'java' ? 'java' : language === 'cpp' ? 'cpp' : language === 'c' ? 'c' : language === 'sql' ? 'sql' : 'R'}</span>
            </div>
            <div style={{ display: 'flex', gap: '14px', fontSize: '11px' }}>
              <span>Spaces: 2</span>
              <span>UTF-8</span>
            </div>
          </div>

          {/* Editor Body with Gutter & Textarea */}
          <div style={{ display: 'flex', flex: 1, position: 'relative', overflow: 'hidden' }}>
            {/* Line Numbers Gutter */}
            <div
              ref={gutterRef}
              style={{
                width: '46px',
                background: currentTheme.gutter,
                color: currentTheme.gutterText,
                padding: '14px 6px 14px 0',
                textAlign: 'right',
                userSelect: 'none',
                fontSize: '13px',
                fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, Consolas, monospace",
                lineHeight: '1.6',
                borderRight: `1px solid ${currentTheme.border}`,
                overflow: 'hidden'
              }}
              aria-hidden="true"
            >
              {lines.map((_, i) => (
                <div key={i} style={{ height: '20.8px' }}>
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Code Input Textarea */}
            <textarea
              ref={textareaRef}
              value={sourceCode}
              onChange={(e) => setSourceCode(e.target.value)}
              onKeyDown={handleKeyDown}
              onKeyUp={updateCursorPos}
              onClick={updateCursorPos}
              onScroll={handleScroll}
              spellCheck="false"
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              placeholder="// Write or paste your code here..."
              style={{
                flex: 1,
                background: 'transparent',
                color: currentTheme.text,
                border: 'none',
                outline: 'none',
                padding: '14px 16px',
                fontSize: '13px',
                fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, Consolas, monospace",
                lineHeight: '1.6',
                resize: 'none',
                whiteSpace: 'pre',
                overflowWrap: 'normal',
                overflowX: 'auto',
                caretColor: currentTheme.caret,
                tabSize: 2
              }}
            />
          </div>

          {/* Editor Status Bar */}
          <div
            style={{
              padding: '6px 14px',
              background: currentTheme.gutter,
              borderTop: `1px solid ${currentTheme.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '11px',
              color: currentTheme.gutterText,
              fontFamily: "'JetBrains Mono', Consolas, monospace"
            }}
          >
            <div style={{ display: 'flex', gap: '14px' }}>
              <span>Ln {cursorPos.line}, Col {cursorPos.col}</span>
              <span>{lineCount} lines, {charCount} characters</span>
            </div>
            <div>
              <span>Press <strong style={{ color: currentTheme.caret }}>Ctrl+Enter</strong> to Run</span>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: Console Output & Custom Input Tabs             */}
        {/* ============================================================ */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '10px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          {/* Console Header Tabs */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 12px',
              background: 'var(--bg-surface-elevated)',
              borderBottom: '1px solid var(--border-subtle)'
            }}
          >
            {/* Tabs */}
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                type="button"
                onClick={() => setActiveRightTab('output')}
                style={{
                  background: activeRightTab === 'output' ? 'var(--bg-surface)' : 'transparent',
                  color: activeRightTab === 'output' ? 'var(--primary)' : 'var(--text-muted)',
                  border: activeRightTab === 'output' ? '1px solid var(--border-subtle)' : '1px solid transparent',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: activeRightTab === 'output' ? '700' : '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>🖥️</span> Output Console
                {result && (
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: result.status === 'SUCCESS' ? '#10b981' : '#ef4444'
                    }}
                  />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveRightTab('input')}
                style={{
                  background: activeRightTab === 'input' ? 'var(--bg-surface)' : 'transparent',
                  color: activeRightTab === 'input' ? 'var(--primary)' : 'var(--text-muted)',
                  border: activeRightTab === 'input' ? '1px solid var(--border-subtle)' : '1px solid transparent',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: activeRightTab === 'input' ? '700' : '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>📥</span> Custom Input (stdin)
                {customInput.trim().length > 0 && (
                  <span
                    style={{
                      fontSize: '10px',
                      padding: '1px 5px',
                      borderRadius: '4px',
                      background: 'rgba(59, 130, 246, 0.15)',
                      color: 'var(--primary)'
                    }}
                  >
                    Active
                  </span>
                )}
              </button>
            </div>

            {/* Clear Console Button */}
            {activeRightTab === 'output' && result && (
              <button
                type="button"
                onClick={() => setResult(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '11px',
                  cursor: 'pointer',
                  padding: '4px 8px'
                }}
              >
                Clear Console
              </button>
            )}
          </div>

          {/* Tab 1: OUTPUT CONSOLE */}
          {activeRightTab === 'output' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              
              {/* Output Metrics Bar (When Execution Finished) */}
              {result && (
                <div
                  style={{
                    padding: '8px 16px',
                    background: result.status === 'SUCCESS' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                    borderBottom: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                    fontSize: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        padding: '3px 10px',
                        borderRadius: '20px',
                        fontWeight: '700',
                        fontSize: '11px',
                        background: result.status === 'SUCCESS' ? '#10b981' : '#ef4444',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {result.status === 'SUCCESS' ? '✓ SUCCESS' : result.status === 'TIME_LIMIT_EXCEEDED' ? '⏱ TIMEOUT' : '✕ ERROR'}
                    </span>
                    <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>
                      Exit Code: {result.exitCode ?? 0}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', color: 'var(--text-muted)', fontSize: '11px' }}>
                    <span>⚡ Time: <strong style={{ color: 'var(--text-main)' }}>{result.executionTimeMs} ms</strong></span>
                    <span>💾 Memory: <strong style={{ color: 'var(--text-main)' }}>{result.memoryUsage || '12.5 MB'}</strong></span>
                  </div>
                </div>
              )}

              {/* Console Output Area */}
              <div
                style={{
                  flex: 1,
                  background: 'var(--terminal-bg, #0b0f19)',
                  padding: '14px 16px',
                  overflowY: 'auto',
                  fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, Consolas, monospace",
                  fontSize: '13px',
                  lineHeight: '1.6',
                  color: '#e2e8f0',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}
              >
                {executing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '12px', color: '#94a3b8' }}>
                    <div className="spinner-border text-primary" role="status" style={{ width: '32px', height: '32px' }}>
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: '500' }}>Compiling and executing in sandbox...</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Language: {language} | Timeout: 5000ms</div>
                  </div>
                ) : result ? (
                  <div>
                    {/* Stdout display */}
                    {result.stdout ? (
                      <div style={{ color: '#f8fafc' }}>
                        {result.stdout}
                      </div>
                    ) : (
                      !result.stderr && (
                        <div style={{ color: '#64748b', fontStyle: 'italic' }}>
                          (Program executed successfully with no standard output)
                        </div>
                      )
                    )}

                    {/* Stderr / Error display */}
                    {result.stderr && (
                      <div
                        style={{
                          marginTop: result.stdout ? '14px' : '0',
                          padding: '10px 14px',
                          borderRadius: '6px',
                          background: 'rgba(239, 68, 68, 0.12)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#f87171'
                        }}
                      >
                        <div style={{ fontWeight: '700', marginBottom: '4px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          ⚠️ {result.status === 'COMPILATION_ERROR' ? 'Compilation Error' : 'Runtime Stderr'}
                        </div>
                        <div style={{ whiteSpace: 'pre-wrap' }}>
                          {result.stderr}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', textAlign: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '32px' }}>💻</span>
                    <div style={{ fontWeight: '600', color: '#94a3b8' }}>Output Console Ready</div>
                    <div style={{ fontSize: '12px', maxWidth: '300px' }}>
                      Click <strong>Run Code</strong> or press <strong>Ctrl+Enter</strong> to execute your solution.
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: CUSTOM INPUT (STDIN) */}
          {activeRightTab === 'input' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '14px', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>
                  Provide standard input passed via stdin to your program:
                </span>
                {customInput && (
                  <button
                    type="button"
                    onClick={() => setCustomInput('')}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      fontSize: '11px',
                      cursor: 'pointer'
                    }}
                  >
                    Clear Input
                  </button>
                )}
              </div>
              <textarea
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Enter input here (lines, numbers, test arguments)...&#10;e.g.&#10;5&#10;10 20 30 40 50"
                style={{
                  flex: 1,
                  background: 'var(--bg-app)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '12px',
                  fontSize: '13px',
                  fontFamily: "'JetBrains Mono', Consolas, monospace",
                  lineHeight: '1.5',
                  resize: 'none',
                  outline: 'none'
                }}
              />
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                💡 Tip: In Python, read input with <code>sys.stdin.read()</code> or <code>input()</code>. In Java, use <code>Scanner(System.in)</code>. In Node.js, use <code>fs.readFileSync(0, 'utf-8')</code>.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Playground;
