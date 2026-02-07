import axios from 'axios';

// Backend API base URL - change this to match your backend server
const API_BASE_URL =  'https://ems-kappa-two.vercel.app/api';

const API = axios.create({
  baseURL: API_BASE_URL
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
