import axios from 'axios';

// Cloudflare Tunnel URL chính thức cho Mobile App
export const CLOUDFLARE_API = 'https://gym-api.thanhcanghaiphong.online/api';

// Fallback hoặc backward-compatible alias
export const NGROK_API = CLOUDFLARE_API;

const apiClient = axios.create({
  baseURL: CLOUDFLARE_API,
  headers: {
    'x-platform': 'mobile'
  }
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

export default apiClient;
