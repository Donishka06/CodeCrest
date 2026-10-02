import React, { useState } from 'react';

/**
 * Parses raw or AI-generated problem statements into structured, clean sections:
 * - Problem Description
 * - Input Format
 * - Output Format
 * - Constraints
 * - Examples (Input, Output, Explanation)
 */
const FormattedProblemStatement = ({ problem, activeTab = 'description' }) => {
  const [copiedIdx, setCopiedIdx] = useState(null);

  if (!problem) {
    return <div style={{ color: 'var(--text-muted)', padding: '20px' }}>Loading problem details...</div>;
  }

  const {
    title,
    difficulty = 'EASY',
    basePoints,
    points,
    description = '',
    inputFormat = '',
    outputFormat = '',
    constraints = '',
    sampleTestCases = []
  } = problem;

  const scorePoints = basePoints || points || 100;

  // Helper to copy text to clipboard with temporary visual feedback
  const handleCopy = (text, idx) => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1800);
  };

  // Helper to format inline code and bolding in text
  const renderFormattedText = (rawText) => {
    if (!rawText) return null;

    // Split text into paragraphs
    const paragraphs = rawText.split('\n\n').filter(p => p.trim());

    return paragraphs.map((para, pIdx) => {
      // Check if this paragraph is a list item or standard paragraph
      const lines = para.split('\n');

      return (
        <div key={pIdx} style={{ marginBottom: '14px', lineHeight: '1.65', color: 'var(--text-main)', fontSize: '14px' }}>
          {lines.map((line, lIdx) => {
            const trimmed = line.trim();

            // Bullet points
            if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
              return (
                <div key={lIdx} style={{ display: 'flex', gap: '8px', marginLeft: '12px', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--primary)' }}>•</span>
                  <span>{formatInlineContent(trimmed.substring(2))}</span>
                </div>
              );
            }

            // Numbered list
            const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
            if (numMatch) {
              return (
                <div key={lIdx} style={{ display: 'flex', gap: '8px', marginLeft: '12px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: '600', color: 'var(--text-muted)' }}>{numMatch[1]}.</span>
                  <span>{formatInlineContent(numMatch[2])}</span>
                </div>
              );
            }

            return (
              <p key={lIdx} style={{ margin: '0 0 6px 0' }}>
                {formatInlineContent(line)}
              </p>
            );
          })}
        </div>
      );
    });
  };

  // Parses `inline code` and **bold text**
  const formatInlineContent = (str) => {
    if (!str) return '';
    const parts = [];
    let remaining = str;
    let keyIdx = 0;

    while (remaining.length > 0) {
      // Find inline code `...`
      const codeStart = remaining.indexOf('`');
      if (codeStart !== -1) {
        const codeEnd = remaining.indexOf('`', codeStart + 1);
        if (codeEnd !== -1) {
          if (codeStart > 0) {
            parts.push(<span key={keyIdx++}>{formatBoldOnly(remaining.substring(0, codeStart))}</span>);
          }
          const codeSnippet = remaining.substring(codeStart + 1, codeEnd);
          parts.push(
            <code
              key={keyIdx++}
              style={{
                background: 'var(--code-bg)',
                color: 'var(--primary)',
                padding: '2px 6px',
                borderRadius: '4px',
                border: '1px solid var(--code-border)',
                fontFamily: 'monospace',
                fontSize: '13px'
              }}
            >
              {codeSnippet}
            </code>
          );
          remaining = remaining.substring(codeEnd + 1);
          continue;
        }
      }

      // No more inline code, format remaining for bold
      parts.push(<span key={keyIdx++}>{formatBoldOnly(remaining)}</span>);
      break;
    }

    return parts;
  };

  const formatBoldOnly = (str) => {
    const boldParts = str.split(/(\*\*[^*]+\*\*)/g);
    return boldParts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx} style={{ color: 'var(--text-main)', fontWeight: '700' }}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  // Helper to parse constraints into clean lines or chips
  const renderConstraints = (constraintsText) => {
    if (!constraintsText) return null;
    const lines = constraintsText.split('\n').map(l => l.trim()).filter(Boolean);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {lines.map((cLine, idx) => {
          // Remove leading bullet or dash if present
          const cleanLine = cLine.replace(/^[-*•]\s*/, '');
          return (
            <div
              key={idx}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--code-bg)',
                border: '1px solid var(--border-subtle)',
                padding: '5px 12px',
                borderRadius: '6px',
                fontFamily: 'monospace',
                fontSize: '13px',
                color: 'var(--text-secondary)'
              }}
            >
              <span style={{ color: 'var(--warning)', fontSize: '11px' }}>▪</span>
              <span>{cleanLine}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="formatted-problem-statement" style={{ color: 'var(--text-main)' }}>
      {/* Title & Difficulty Header */}
      <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
          <span className={`badge badge-${difficulty.toLowerCase()}`}>
            {difficulty}
          </span>
          <span style={{
            fontSize: '12px',
            fontWeight: '600',
            color: 'var(--text-muted)',
            background: 'var(--bg-surface-elevated)',
            padding: '3px 8px',
            borderRadius: '4px',
            border: '1px solid var(--border-subtle)'
          }}>
            ⭐ {scorePoints} Points
          </span>
        </div>
        <h1 style={{ margin: '0', fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
          {title}
        </h1>
      </div>

      {/* Problem Description Section */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{
          fontSize: '14px',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'var(--text-muted)',
          margin: '0 0 10px 0'
        }}>
          Problem Description
        </h3>
        <div style={{ color: 'var(--text-main)' }}>
          {renderFormattedText(description)}
        </div>
      </div>

      {/* Input Format Section */}
      {inputFormat && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{
            fontSize: '14px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--text-muted)',
            margin: '0 0 10px 0'
          }}>
            Input Format
          </h3>
          <div style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            lineHeight: '1.6'
          }}>
            {formatInlineContent(inputFormat)}
          </div>
        </div>
      )}

      {/* Output Format Section */}
      {outputFormat && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{
            fontSize: '14px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--text-muted)',
            margin: '0 0 10px 0'
          }}>
            Output Format
          </h3>
          <div style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            lineHeight: '1.6'
          }}>
            {formatInlineContent(outputFormat)}
          </div>
        </div>
      )}

      {/* Constraints Section */}
      {constraints && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{
            fontSize: '14px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--text-muted)',
            margin: '0 0 10px 0'
          }}>
            Constraints
          </h3>
          {renderConstraints(constraints)}
        </div>
      )}

      {/* Examples / Test Cases Section (LeetCode Style) */}
      {sampleTestCases && sampleTestCases.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{
            fontSize: '14px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--text-muted)',
            margin: '0 0 12px 0'
          }}>
            Examples
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {sampleTestCases.map((tc, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  padding: '14px 16px',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px',
                  borderBottom: '1px solid var(--border-subtle)',
                  paddingBottom: '6px'
                }}>
                  <span style={{ fontWeight: '700', fontSize: '13px', color: 'var(--primary)' }}>
                    Example {idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(tc.input, idx)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      fontSize: '11px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    title="Copy input"
                  >
                    {copiedIdx === idx ? '✓ Copied' : '📋 Copy Input'}
                  </button>
                </div>

                <div style={{ marginBottom: '6px', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: '600', marginRight: '6px' }}>Input:</span>
                  <code style={{
                    background: 'var(--code-bg)',
                    color: 'var(--code-text)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    border: '1px solid var(--code-border)',
                    fontFamily: 'monospace'
                  }}>
                    {tc.input}
                  </code>
                </div>

                <div style={{ marginBottom: tc.explanation ? '6px' : '0', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: '600', marginRight: '6px' }}>Output:</span>
                  <code style={{
                    background: 'var(--code-bg)',
                    color: 'var(--code-text)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    border: '1px solid var(--code-border)',
                    fontFamily: 'monospace'
                  }}>
                    {tc.expectedOutput}
                  </code>
                </div>

                {tc.explanation && (
                  <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5', fontStyle: 'italic' }}>
                    <span style={{ fontStyle: 'normal', fontWeight: '600', color: 'var(--text-muted)' }}>Explanation: </span>
                    {tc.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FormattedProblemStatement;
