import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import challengeService from '../../services/challengeService';

export const fetchChallenges = createAsyncThunk(
  'challenges/fetchChallenges',
  async ({ page = 0, size = 10 } = {}, { rejectWithValue }) => {
    try {
      const data = await challengeService.getChallenges(page, size);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch challenges');
    }
  }
);

export const createChallenge = createAsyncThunk(
  'challenges/createChallenge',
  async (challengeData, { rejectWithValue }) => {
    try {
      const data = await challengeService.create(challengeData);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create challenge');
    }
  }
);

export const updateChallenge = createAsyncThunk(
  'challenges/updateChallenge',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await challengeService.update(id, data);
      return { id: Number(id), data: res };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update challenge');
    }
  }
);

export const deleteChallenge = createAsyncThunk(
  'challenges/deleteChallenge',
  async (id, { rejectWithValue }) => {
    try {
      await challengeService.delete(id);
      return Number(id);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete challenge');
    }
  }
);

const challengeSlice = createSlice({
  name: 'challenges',
  initialState: {
    items: [],
    totalPages: 0,
    currentPage: 0,
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchChallenges.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchChallenges.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload.content) {
          state.items = action.payload.content;
          state.totalPages = action.payload.totalPages || 1;
          state.currentPage = action.payload.number || 0;
        } else if (Array.isArray(action.payload)) {
          state.items = action.payload;
        }
      })
      .addCase(fetchChallenges.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createChallenge.fulfilled, (state, action) => {
        if (action.payload && typeof action.payload === 'object' && action.payload.id) {
          state.items.push(action.payload);
        }
      })
      .addCase(deleteChallenge.fulfilled, (state, action) => {
        state.items = state.items.filter(item => Number(item.id) !== Number(action.payload));
      });
  }
});

export default challengeSlice.reducer;
