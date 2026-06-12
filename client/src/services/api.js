import axios from 'axios';

const getApiUrl = () => {
  if (import.meta.env.PROD && import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  return `http://${window.location.hostname}:5001/api`;
};

const api = axios.create({
  baseURL: getApiUrl(),
  timeout: 120000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      if (window.location.pathname.includes('/admin')) window.location.reload();
    }
    return Promise.reject(error);
  }
);

export default api;
