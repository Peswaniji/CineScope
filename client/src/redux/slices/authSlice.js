import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { backendApi, setAuthToken } from '../api.js';
import { toUserMessage } from '../../utils/userMessage.js';

const userInfoStr = localStorage.getItem('userInfo');
const userInfoFromStorage = userInfoStr ? JSON.parse(userInfoStr) : null;
setAuthToken(userInfoFromStorage?.token || null);

const getApiError = (error) => toUserMessage(error, 'Unable to complete request.');

const initialState = {
  userInfo: userInfoFromStorage,
  loading: false,
  error: null,
};

export const login = createAsyncThunk('auth/login', async ({ email, password }, thunkAPI) => {
  try {
    const { data } = await backendApi.post('/auth/login', { email, password });
    localStorage.setItem('userInfo', JSON.stringify(data));
    setAuthToken(data?.token || null);
    return data;
  } catch (error) {
    console.error('Login failed:', error);
    return thunkAPI.rejectWithValue(getApiError(error));
  }
});

export const register = createAsyncThunk('auth/register', async ({ name, email, password }, thunkAPI) => {
  try {
    const { data } = await backendApi.post('/auth/register', { name, email, password });
    localStorage.setItem('userInfo', JSON.stringify(data));
    setAuthToken(data?.token || null);
    return data;
  } catch (error) {
    console.error('Register failed:', error);
    return thunkAPI.rejectWithValue(getApiError(error));
  }
});

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('userInfo');
      setAuthToken(null);
      state.userInfo = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
