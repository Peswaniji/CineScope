import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { tmdbApi } from '../api.js';

export const fetchMoviesByEndpoint = createAsyncThunk(
  'movies/fetchByEndpoint',
  async ({ key, endpoint, page = 1 }, thunkAPI) => {
    try {
      const separator = endpoint.includes('?') ? '&' : '?';
      const { data } = await tmdbApi.get(`${endpoint}${separator}page=${page}`);
      return {
        key,
        page,
        results: data?.results || [],
        totalPages: data?.total_pages || page,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue({
        key,
        message: error.response?.data?.status_message || error.message,
      });
    }
  }
);

const movieSlice = createSlice({
  name: 'movies',
  initialState: {
    data: {},
    loadingKeys: {},
    errorByKey: {},
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMoviesByEndpoint.pending, (state, action) => {
        const { key } = action.meta.arg;
        state.loadingKeys[key] = true;
        state.errorByKey[key] = null;
      })
      .addCase(fetchMoviesByEndpoint.fulfilled, (state, action) => {
        const { key, page, results, totalPages } = action.payload;
        state.loadingKeys[key] = false;

        if (!state.data[key]) {
          state.data[key] = { items: [], page: 0, totalPages: 1 };
        }

        if (page === 1) {
          state.data[key].items = results;
        } else {
          const existing = state.data[key].items;
          const newItems = results.filter((newItem) => !existing.some((item) => item.id === newItem.id));
          state.data[key].items = [...existing, ...newItems];
        }

        state.data[key].page = page;
        state.data[key].totalPages = totalPages;
      })
      .addCase(fetchMoviesByEndpoint.rejected, (state, action) => {
        const key = action.payload?.key || action.meta.arg.key;
        state.loadingKeys[key] = false;
        state.errorByKey[key] = action.payload?.message || 'Failed to fetch movies.';
      });
  },
});

export default movieSlice.reducer;


