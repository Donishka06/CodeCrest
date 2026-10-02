import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import contestService from '../../services/contestService';

export const fetchContests = createAsyncThunk(
  'contests/fetchContests',
  async ({ page = 0, size = 10 } = {}, { rejectWithValue }) => {
    try {
      const data = await contestService.getAll(page, size);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch contests');
    }
  }
);

export const enrollParticipant = createAsyncThunk(
  'contests/enrollParticipant',
  async (arg, { rejectWithValue }) => {
    const contestId = typeof arg === 'object' ? arg.contestId : arg;
    const username = typeof arg === 'object' ? arg.username : 'contestant';
    try {
      const data = await contestService.enroll(contestId, username);
      return { contestId, username, data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to enroll');
    }
  }
);

export const unenrollParticipant = createAsyncThunk(
  'contests/unenrollParticipant',
  async (arg, { rejectWithValue }) => {
    const contestId = typeof arg === 'object' ? arg.contestId : arg;
    const username = typeof arg === 'object' ? arg.username : 'contestant';
    try {
      const data = await contestService.unenroll(contestId, username);
      return { contestId, username, data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to unenroll');
    }
  }
);

const contestSlice = createSlice({
  name: 'contests',
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
      .addCase(fetchContests.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchContests.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload.content) {
          state.items = action.payload.content;
          state.totalPages = action.payload.totalPages || 1;
          state.currentPage = action.payload.number || 0;
        } else if (Array.isArray(action.payload)) {
          state.items = action.payload;
        }
      })
      .addCase(fetchContests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(enrollParticipant.fulfilled, (state, action) => {
        const { contestId, username } = action.payload || {};
        const contest = state.items.find(c => Number(c.id) === Number(contestId));
        if (contest) {
          if (!contest.enrolledParticipants) contest.enrolledParticipants = [];
          if (username && !contest.enrolledParticipants.includes(username)) {
            contest.enrolledParticipants.push(username);
            contest.enrolledCount = contest.enrolledParticipants.length;
          }
        }
      })
      .addCase(unenrollParticipant.fulfilled, (state, action) => {
        const { contestId, username } = action.payload || {};
        const contest = state.items.find(c => Number(c.id) === Number(contestId));
        if (contest && contest.enrolledParticipants) {
          contest.enrolledParticipants = contest.enrolledParticipants.filter(
            u => String(u).toLowerCase() !== String(username).toLowerCase()
          );
          contest.enrolledCount = contest.enrolledParticipants.length;
        }
      });
  }
});

export default contestSlice.reducer;
