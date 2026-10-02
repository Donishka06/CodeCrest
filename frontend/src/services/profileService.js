import api from './api';

const profileService = {
  getProfile: async () => {
    const response = await api.get('/profiles/me');
    return response.data;
  },

  updateProfile: async (id, data) => {
    const response = await api.put(`/profiles/${id}`, data);
    return response.data;
  }
};

export default profileService;
