import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import challengeReducer from './slices/challengeSlice';
import contestReducer from './slices/contestSlice';
import rankingReducer from './slices/rankingSlice';
import submissionReducer from './slices/submissionSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    challenges: challengeReducer,
    contests: contestReducer,
    rankings: rankingReducer,
    submissions: submissionReducer
  }
});

export default store;
