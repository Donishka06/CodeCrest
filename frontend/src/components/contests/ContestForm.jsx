import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import contestService from '../../services/contestService';
import { fetchContests } from '../../store/slices/contestSlice';

const ContestForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    title: '',
    startTime: '',
    endTime: '',
    capacity: 100
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [generateWithAi, setGenerateWithAi] = useState(false);

  const getCalculatedStatus = (start, end) => {
    if (!start || !end) return 'UPCOMING';
    const now = new Date();
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (now < startDate) return 'UPCOMING';
    if (now >= endDate) return 'EXPIRED';
    return 'ACTIVE';
  };

  const computedStatus = getCalculatedStatus(formData.startTime, formData.endTime);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);
    try {
      const formatDT = (val) => {
        if (!val) return null;
        return val.length === 16 ? val + ':00' : val;
      };

      const payload = {
        title: formData.title,
        capacity: Number(formData.capacity) || 100,
        startTime: formatDT(formData.startTime),
        endTime: formatDT(formData.endTime),
        status: computedStatus
      };

      await contestService.create(payload);
      await dispatch(fetchContests({ page: 0, size: 10 }));
      if (generateWithAi) {
        navigate('/ai/generate-questions');
      } else {
        navigate('/contests');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to create contest');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="form-container glass-card" style={{ maxWidth: '640px', margin: '40px auto', padding: '28px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', boxShadow: 'var(--shadow-md)', color: 'var(--text-main)' }}>
      <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', fontWeight: '800', color: 'var(--text-main)' }}>Create New Contest</h2>

      {errorMsg && (
        <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', fontWeight: '600' }}>
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '18px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>Contest Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-app)', color: 'var(--text-main)', fontSize: '14px', fontWeight: '600', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '18px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>Start Time</label>
          <input
            type="datetime-local"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-app)', color: 'var(--text-main)', fontSize: '14px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '18px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>End Time</label>
          <input
            type="datetime-local"
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-app)', color: 'var(--text-main)', fontSize: '14px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>Capacity Limit</label>
          <input
            type="number"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            min="1"
            required
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-app)', color: 'var(--text-main)', fontSize: '14px', boxSizing: 'border-box' }}
          />
        </div>

        {formData.startTime && formData.endTime && (
          <div style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '14px 16px', marginBottom: '24px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
              AUTOMATIC CONTEST STATUS LIFECYCLE:
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{
                padding: '4px 10px',
                borderRadius: '6px',
                fontWeight: '800',
                fontSize: '12px',
                background: computedStatus === 'ACTIVE' ? 'rgba(16, 185, 129, 0.15)' : computedStatus === 'EXPIRED' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                color: computedStatus === 'ACTIVE' ? '#10b981' : computedStatus === 'EXPIRED' ? '#ef4444' : '#3b82f6'
              }}>
                {computedStatus}
              </span>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                {computedStatus === 'UPCOMING' && 'Contest will accept enrollments until start time.'}
                {computedStatus === 'ACTIVE' && 'Contest will be active immediately. Contestants can enter the arena.'}
                {computedStatus === 'EXPIRED' && 'End time has already passed. Submissions will be locked.'}
              </span>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            type="submit"
            disabled={submitting}
            onClick={() => setGenerateWithAi(false)}
            style={{ flex: 1, minWidth: '160px', padding: '12px 20px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '8px', cursor: submitting ? 'not-allowed' : 'pointer', fontWeight: '700', fontSize: '14px', boxShadow: '0 2px 6px rgba(59, 130, 246, 0.3)' }}
          >
            {submitting && !generateWithAi ? 'Creating Contest...' : 'Create Contest'}
          </button>
          <button
            type="submit"
            disabled={submitting}
            onClick={() => setGenerateWithAi(true)}
            style={{ flex: 1, minWidth: '220px', padding: '12px 20px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', border: 'none', borderRadius: '8px', cursor: submitting ? 'not-allowed' : 'pointer', fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 2px 6px rgba(99, 102, 241, 0.3)' }}
          >
            ✨ Create & Generate Questions with AI
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContestForm;
