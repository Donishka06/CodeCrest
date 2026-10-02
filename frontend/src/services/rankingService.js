import api from './api';

const rankingService = {
  getGlobal: async (page = 0, size = 10) => {
    try {
      const response = await api.get(`/leaderboard/global?page=${page}&size=${size}`);
      if (response.data && response.data.content) {
        return response.data;
      }
      return response.data || { content: [], totalPages: 1, number: page };
    } catch (err) {
      return { content: [], totalPages: 1, number: page };
    }
  },

  getGlobalRankings: async (page = 0, size = 10) => {
    return rankingService.getGlobal(page, size);
  },

  getContestLeaderboard: async (contestId, page = 0, size = 10) => {
    try {
      const response = await api.get(`/leaderboard/contest/${contestId}?page=${page}&size=${size}`);
      if (response.data && response.data.content) {
        return response.data;
      }
      return response.data || { content: [], totalPages: 1, number: page };
    } catch (err) {
      return { content: [], totalPages: 1, number: page };
    }
  },

  updateUserScore: (username, pointsToAdd) => {
    // Score update is managed on backend during submission processing
  }
};

export default rankingService;
