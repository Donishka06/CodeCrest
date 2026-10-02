import React from 'react';

const Pagination = ({ currentPage = 0, totalPages = 1, onPageChange }) => {
  return (
    <div className="pagination-container" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
      <button
        disabled={currentPage <= 0}
        onClick={() => onPageChange(currentPage - 1)}
        style={{ padding: '6px 12px', cursor: 'pointer' }}
      >
        &lt;
      </button>
      <div style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
        Page {currentPage + 1} of {totalPages}
      </div>
      <button
        disabled={currentPage + 1 >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        style={{ padding: '6px 12px', cursor: 'pointer' }}
      >
        &gt;
      </button>
    </div>
  );
};

export default Pagination;
