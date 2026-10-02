import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import submissionService from '../../services/submissionService';

export const submitSolution = createAsyncThunk(
  'submissions/submitSolution',
  async ({ challengeId, data }, { rejectWithValue }) => {
    try {
      const response = await submissionService.submit(challengeId, data);
      return response;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Submission failed');
    }
  }
);

export const fetchSubmissions = createAsyncThunk(
  'submissions/fetchSubmissions',
  async (_, { rejectWithValue }) => {
    try {
      const data = await submissionService.getSubmissions();
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch submissions');
    }
  }
);

const submissionSlice = createSlice({
  name: 'submissions',
  initialState: {
    items: [],
    loading: false,
    error: null,
    lastVerdict: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(submitSolution.pending, (state) => {
        state.loading = true;
      })
      .addCase(submitSolution.fulfilled, (state, action) => {
        state.loading = false;
        state.lastVerdict = action.payload;
      })
      .addCase(submitSolution.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchSubmissions.fulfilled, (state, action) => {
        state.items = Array.isArray(action.payload) ? action.payload : (action.payload.content || []);
      });
  }
});

export default submissionSlice.reducer;
