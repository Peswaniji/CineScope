import axios from 'axios';

let authToken = null;

export const setAuthToken = (token) => {
  authToken = token || null;
};

export const backendApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

backendApi.interceptors.request.use((config) => {
  let token = authToken;

  // Fallback for hard refresh / first boot.
  if (!token) {
    try {
      const userInfoStr = localStorage.getItem('userInfo');
      const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
      token = userInfo?.token || null;
      if (token) setAuthToken(token);
    } catch (error) {
      console.error('Failed to parse userInfo from localStorage:', error);
      localStorage.removeItem('userInfo');
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const tmdbApi = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  timeout: 12000,
  params: {
    api_key: import.meta.env.VITE_TMDB_API_KEY,
  },
});
