import api from './api';

const aiDoubtService = {
  askDoubt: async (doubtData) => {
    try {
      const response = await api.post('/ai/doubt-assistant', doubtData);
      return response.data;
    } catch (err) {
      return {
        reply: err.response?.data?.message || err.message || 'AI Doubt Assistant is temporarily unavailable. Please try again.',
        doubtType: 'ERROR',
        suggestedFollowUps: ['💡 Give me a hint', '❓ Explain the core concept']
      };
    }
  }
};

export default aiDoubtService;
