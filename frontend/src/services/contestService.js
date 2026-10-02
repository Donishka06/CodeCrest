import api from './api';

const contestService = {
  getAll: async (page = 0, size = 10) => {
    try {
      const response = await api.get(`/contests?page=${page}&size=${size}`);
      if (response.data && response.data.content) {
        return response.data;
      }
      return response.data || { content: [], totalPages: 1, number: page };
    } catch (err) {
      return { content: [], totalPages: 1, number: page };
    }
  },

  getById: async (id) => {
    const response = await api.get(`/contests/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/contests', data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/contests/${id}`);
    return response.data;
  },

  enroll: async (id, username = 'contestant') => {
    const response = await api.post(`/contests/${id}/enroll?username=${encodeURIComponent(username)}`);
    return response.data || 'Enrolled successfully!';
  },

  unenroll: async (id, username = 'contestant') => {
    const response = await api.post(`/contests/${id}/unenroll?username=${encodeURIComponent(username)}`);
    return response.data || 'Unenrolled successfully!';
  },

  getEnrolledParticipants: async (id) => {
    const response = await api.get(`/contests/${id}/participants`);
    return response.data || [];
  },

  getMyScore: async (id, username = 'contestant') => {
    try {
      const response = await api.get(`/contests/${id}/my-score?username=${encodeURIComponent(username)}`);
      return response.data || { score: 0, rank: 0 };
    } catch (err) {
      return { score: 0, rank: 0 };
    }
  },

  getAnalytics: async (id) => {
    try {
      const response = await api.get(`/contests/${id}/analytics`);
      return response.data;
    } catch (err) {
      return null;
    }
  }
};

export default contestService;
