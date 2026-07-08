import axios from 'axios';

// ── Base URL points to your .NET backend ──────────────────────
// Make sure your backend is running on http://localhost:5162
const API = axios.create({
  baseURL: 'http://localhost:5162/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor: attach JWT token to every request ────
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: handle 401 (token expired/invalid) ──
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear stored credentials and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;