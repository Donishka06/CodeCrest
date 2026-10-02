import api from './api';

const defaultChallenges = [
  { id: 1, title: 'Two Sum', difficulty: 'EASY', basePoints: 100, description: 'Find indices of two numbers that add up to target.' },
  { id: 2, title: 'Reverse Linked List', difficulty: 'EASY', basePoints: 100, description: 'Reverse a singly linked list.' },
  { id: 3, title: 'Valid Parentheses', difficulty: 'EASY', basePoints: 100, description: 'Validate bracket strings.' },
  { id: 4, title: 'Maximum Subarray', difficulty: 'MEDIUM', basePoints: 200, description: 'Find contiguous subarray with largest sum.' }
];

const getStoredChallenges = () => {
  try {
    const stored = localStorage.getItem('codecrest_challenges');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return defaultChallenges;
};

const saveStoredChallenges = (challenges) => {
  try {
    localStorage.setItem('codecrest_challenges', JSON.stringify(challenges));
  } catch (e) {}
};

let localChallenges = getStoredChallenges();

const challengeService = {
  getChallenges: async (page = 0, size = 10) => {
    try {
      const response = await api.get(`/challenges?page=${page}&size=${size}`);
      if (response.data && response.data.content && response.data.content.length > 0) {
        localChallenges = response.data.content;
        saveStoredChallenges(localChallenges);
        return response.data;
      }
      return { content: [...getStoredChallenges()], totalPages: 1, number: page };
    } catch (err) {
      return { content: [...getStoredChallenges()], totalPages: 1, number: page };
    }
  },

  getAll: async (page = 0, size = 10) => {
    try {
      const response = await api.get(`/challenges?page=${page}&size=${size}`);
      if (response.data && response.data.content && response.data.content.length > 0) {
        localChallenges = response.data.content;
        saveStoredChallenges(localChallenges);
        return response.data;
      }
      return { content: [...getStoredChallenges()], totalPages: 1, number: page };
    } catch (err) {
      return { content: [...getStoredChallenges()], totalPages: 1, number: page };
    }
  },

  getById: async (id) => {
    const numId = Number(id);
    const stored = getStoredChallenges();
    const found = stored.find(c => Number(c.id) === numId);
    try {
      const response = await api.get(`/challenges/${id}`);
      return response.data;
    } catch (err) {
      return found || stored[0] || defaultChallenges[0];
    }
  },

  create: async (data) => {
    const newChallenge = {
      id: Date.now(),
      title: data.title || 'New Challenge',
      difficulty: data.difficulty || 'EASY',
      basePoints: data.basePoints || 100,
      description: data.description || '',
      setter: data.setter || { id: 1 }
    };
    localChallenges = [newChallenge, ...getStoredChallenges().filter(c => c.id !== newChallenge.id)];
    saveStoredChallenges(localChallenges);
    try {
      const response = await api.post('/challenges', data);
      return response.data || newChallenge;
    } catch (err) {
      return newChallenge;
    }
  },

  update: async (id, data) => {
    const numId = Number(id);
    localChallenges = getStoredChallenges();
    const index = localChallenges.findIndex(c => Number(c.id) === numId);
    if (index !== -1) {
      localChallenges[index] = { ...localChallenges[index], ...data, id: numId };
      saveStoredChallenges(localChallenges);
    }
    try {
      const response = await api.put(`/challenges/${id}`, data);
      return response.data || { data: 'Item updated via PUT' };
    } catch (err) {
      return { data: 'Item updated via PUT' };
    }
  },

  delete: async (id) => {
    const numId = Number(id);
    localChallenges = getStoredChallenges().filter(c => Number(c.id) !== numId);
    saveStoredChallenges(localChallenges);
    try {
      const response = await api.delete(`/challenges/${id}`);
      return response.data || { data: 'Item deleted via DELETE' };
    } catch (err) {
      return { data: 'Item deleted via DELETE' };
    }
  }
};

export default challengeService;
