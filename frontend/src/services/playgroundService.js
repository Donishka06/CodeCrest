import api from './api';

const playgroundService = {
  runCode: async ({ sourceCode, language, customInput, timeLimitMs = 5000 }) => {
    const response = await api.post('/playground/run', {
      sourceCode,
      language,
      customInput,
      timeLimitMs
    });
    return response.data;
  }
};

export default playgroundService;
