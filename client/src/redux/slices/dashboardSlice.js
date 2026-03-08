import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { backendApi } from '../api.js';
import { toUserMessage } from '../../utils/userMessage.js';

export const fetchFavorites = createAsyncThunk('dashboard/fetchFavorites', async (_, thunkAPI) => {
  try {
    const { data } = await backendApi.get('/favorites');
    return data;
  } catch (error) {
    console.error('Fetch favorites failed:', error);
    return thunkAPI.rejectWithValue(toUserMessage(error));
  }
});

export const addFavorite = createAsyncThunk('dashboard/addFavorite', async (movie, thunkAPI) => {
  try {
    const { data } = await backendApi.post('/favorites', movie);
    return data;
  } catch (error) {
    console.error('Add favorite failed:', error);
    return thunkAPI.rejectWithValue(toUserMessage(error));
  }
});

export const removeFavorite = createAsyncThunk('dashboard/removeFavorite', async (movieId, thunkAPI) => {
  try {
    await backendApi.delete(`/favorites/${movieId}`);
    return String(movieId);
  } catch (error) {
    console.error('Remove favorite failed:', error);
    return thunkAPI.rejectWithValue(toUserMessage(error));
  }
});

export const fetchHistory = createAsyncThunk('dashboard/fetchHistory', async (_, thunkAPI) => {
  try {
    const { data } = await backendApi.get('/history');
    return data;
  } catch (error) {
    console.error('Fetch history failed:', error);
    return thunkAPI.rejectWithValue(toUserMessage(error));
  }
});

export const addToHistory = createAsyncThunk('dashboard/addToHistory', async (movie, thunkAPI) => {
  try {
    const { data } = await backendApi.post('/history', movie);
    return data;
  } catch (error) {
    console.error('Add history failed:', error);
    return thunkAPI.rejectWithValue(toUserMessage(error));
  }
});

export const removeHistory = createAsyncThunk('dashboard/removeHistory', async (movieId, thunkAPI) => {
  try {
    await backendApi.delete(`/history/${movieId}`);
    return String(movieId);
  } catch (error) {
    console.error('Remove history failed:', error);
    return thunkAPI.rejectWithValue(toUserMessage(error));
  }
});

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    favorites: [],
    history: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFavorites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.loading = false;
        state.favorites = action.payload;
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addFavorite.fulfilled, (state, action) => {
        const exists = state.favorites.some((item) => String(item.movieId) === String(action.payload.movieId));
        if (!exists) state.favorites.unshift(action.payload);
      })
      .addCase(removeFavorite.fulfilled, (state, action) => {
        state.favorites = state.favorites.filter((item) => String(item.movieId) !== String(action.payload));
      })
      .addCase(fetchHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload;
      })
      .addCase(fetchHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addToHistory.fulfilled, (state, action) => {
        state.history = state.history.filter((item) => String(item.movieId) !== String(action.payload.movieId));
        state.history.unshift(action.payload);
      })
      .addCase(removeHistory.fulfilled, (state, action) => {
        state.history = state.history.filter((item) => String(item.movieId) !== String(action.payload));
      });
  },
});

export default dashboardSlice.reducer;


