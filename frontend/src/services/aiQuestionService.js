import api from './api';

const aiQuestionService = {
  generateQuestions: async (data) => {
    const response = await api.post('/ai/generate-questions', data);
    return response.data;
  },

  addQuestionsToContest: async (contestId, questions) => {
    const response = await api.post(`/contests/${contestId}/add-questions`, { contestId, questions });
    return response.data;
  },

  getContestQuestions: async (contestId) => {
    const response = await api.get(`/contests/${contestId}/questions`);
    return response.data;
  }
};

export default aiQuestionService;
