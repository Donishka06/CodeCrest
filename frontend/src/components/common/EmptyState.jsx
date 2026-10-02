import React from 'react';

const EmptyState = ({ message = 'No data found' }) => {
  return (
    <div className="empty-state-container" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
      <div style={{ fontSize: '48px', marginBottom: '12px' }}>📁</div>
      <p>{message}</p>
    </div>
  );
};

export default EmptyState;
