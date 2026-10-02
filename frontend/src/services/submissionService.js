import api from './api';

const submissionService = {
  submit: async (challengeId, data) => {
    try {
      const response = await api.post(`/challenges/${challengeId}/submit`, data);
      return response.data;
    } catch (err) {
      const response = await api.post('/submissions', { challengeId, ...data });
      return response.data;
    }
  },

  runTest: async (challengeId, data) => {
    try {
      const response = await api.post(`/challenges/${challengeId}/submit`, { ...data, isTestRun: true });
      return response.data;
    } catch (err) {
      const response = await api.post('/submissions', { challengeId, ...data, isTestRun: true });
      return response.data;
    }
  },

  getSubmissions: async () => {
    const response = await api.get('/submissions');
    return response.data;
  },

  getMySubmissions: async () => {
    try {
      const response = await api.get('/submissions/my');
      return response.data || [];
    } catch (err) {
      return [];
    }
  },

  getMySolvedIds: async () => {
    try {
      const response = await api.get('/submissions/my-solved-ids');
      return response.data || [];
    } catch (err) {
      return [];
    }
  }
};

export default submissionService;
