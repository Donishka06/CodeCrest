import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import rankingService from '../../services/rankingService';

export const fetchGlobalRankings = createAsyncThunk(
  'rankings/fetchGlobalRankings',
  async ({ page = 0, size = 10 } = {}, { rejectWithValue }) => {
    try {
      const data = await rankingService.getGlobal(page, size);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch rankings');
    }
  }
);

export const fetchContestRankings = createAsyncThunk(
  'rankings/fetchContestRankings',
  async ({ contestId, page = 0, size = 10 }, { rejectWithValue }) => {
    try {
      const data = await rankingService.getContestLeaderboard(contestId, page, size);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch contest rankings');
    }
  }
);

const rankingSlice = createSlice({
  name: 'rankings',
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
      .addCase(fetchGlobalRankings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchGlobalRankings.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload.content) {
          state.items = action.payload.content;
          state.totalPages = action.payload.totalPages || 1;
          state.currentPage = action.payload.number || 0;
        } else if (Array.isArray(action.payload)) {
          state.items = action.payload;
        }
      })
      .addCase(fetchGlobalRankings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchContestRankings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchContestRankings.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload.content) {
          state.items = action.payload.content;
          state.totalPages = action.payload.totalPages || 1;
          state.currentPage = action.payload.number || 0;
        } else if (Array.isArray(action.payload)) {
          state.items = action.payload;
        }
      })
      .addCase(fetchContestRankings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default rankingSlice.reducer;
