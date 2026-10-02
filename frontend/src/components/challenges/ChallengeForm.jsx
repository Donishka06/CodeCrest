import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { createChallenge, updateChallenge, fetchChallenges } from '../../store/slices/challengeSlice';

const ChallengeForm = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth || {});

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'EASY',
    basePoints: 100,
    timeLimitMs: 1000
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      basePoints: Number(formData.basePoints),
      timeLimitMs: Number(formData.timeLimitMs),
      setter: { id: user?.id || 1 }
    };

    if (id) {
      dispatch(updateChallenge({ id, data: payload }));
    } else {
      dispatch(createChallenge(payload));
    }
    dispatch(fetchChallenges({ page: 0, size: 10 }));
    navigate('/challenges');
  };

  return (
    <div className="form-container glass-card" style={{ maxWidth: '640px', margin: '40px auto', padding: '28px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', boxShadow: 'var(--shadow-md)', color: 'var(--text-main)' }}>
      <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', fontWeight: '800', color: 'var(--text-main)' }}>{id ? 'Edit Challenge' : 'Create Challenge'}</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '18px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>Title</label>
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
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="6"
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-app)', color: 'var(--text-main)', fontSize: '14px', lineHeight: '1.5', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '18px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>Difficulty</label>
          <select
            name="difficulty"
            value={formData.difficulty}
            onChange={handleChange}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-app)', color: 'var(--text-main)', fontSize: '14px', boxSizing: 'border-box' }}
          >
            <option value="EASY">EASY</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HARD">HARD</option>
          </select>
        </div>

        <div style={{ marginBottom: '22px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>Base Points</label>
          <input
            type="number"
            name="basePoints"
            min="0"
            max="1000"
            value={formData.basePoints}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-app)', color: 'var(--text-main)', fontSize: '14px', boxSizing: 'border-box' }}
          />
        </div>

        <button
          type="submit"
          style={{ padding: '12px 24px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '15px', boxShadow: '0 2px 6px rgba(59, 130, 246, 0.3)', width: '100%' }}
        >
          {id ? 'Update Challenge' : 'Create Challenge'}
        </button>
      </form>
    </div>
  );
};

export default ChallengeForm;
